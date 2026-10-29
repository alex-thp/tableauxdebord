import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { AirtableService } from '../airtable/airtable.service';
import * as fs from 'fs/promises';
import * as path from 'path';

type MulterFile = {
  path: string;
  mimetype: string;
};

const TABLE_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class PdfMakerService {
  constructor(private airtableService: AirtableService) {}

  // ✅ Cache court (5 min) pour éviter de retélécharger les 4 tables Airtable
  // à chaque appel (chaque table peut représenter plusieurs milliers de lignes).
  private tableCache = new Map<string, { data: any[]; expiresAt: number }>();

  private async getCachedTable(tableId: string | undefined, tableName: string): Promise<any[]> {
    const cached = this.tableCache.get(tableName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    const data = (await this.airtableService.getJsonFromTable(tableId, tableName)) || [];
    this.tableCache.set(tableName, { data, expiresAt: Date.now() + TABLE_CACHE_TTL_MS });
    return data;
  }

  /**
   * Recherche directement sur Airtable les bénévoles ayant réalisé au moins
   * `minAteliers` ateliers "Présent" sur l'année `year`, et reconstruit pour
   * chacun un `cdp_x_benev` minimal (uniquement les candidats matchés, avec leur
   * secteur de recherche) pour alimenter les stats du RA côté frontend.
   */
  async getDataToGeneratePdf(year = 2025, minAteliers = 3) {
    const [benevoles, cdpEnrBenevs, matchings, cdpEnrCands] = await Promise.all([
      this.getCachedTable(process.env.TABLE_BENEVOLE, 'BENEVOLE'),
      this.getCachedTable(process.env.TABLE_CDP_ENR_BENEV, 'CDP_ENR_BENEV'),
      this.getCachedTable(process.env.TABLE_CDP_ENR_CAND_X_CDP_ENR_BENEV, 'CDP_ENR_CAND_X_CDP_ENR_BENEV'),
      this.getCachedTable(process.env.TABLE_CDP_ENR_CAND, 'CDP_ENR_CAND'),
    ]);

    const matchingById = new Map<string, any>(matchings.map((m: any) => [m.record_id, m]));
    const candById = new Map<string, any>(cdpEnrCands.map((c: any) => [c.record_id, c]));
    const benevoleById = new Map<string, any>(benevoles.map((b: any) => [b.record_id, b]));

    // ✅ Ne garde que les ateliers "Présent" de l'année demandée, groupés par bénévole
    const ateliersParBenevole = new Map<string, any[]>();
    for (const atelier of cdpEnrBenevs) {
      if (atelier.statut !== 'Présent') continue;
      if (!atelier.date_atelier) continue;
      if (new Date(atelier.date_atelier).getFullYear() !== year) continue;
      if (!atelier.benevole_id) continue;

      if (!ateliersParBenevole.has(atelier.benevole_id)) {
        ateliersParBenevole.set(atelier.benevole_id, []);
      }
      ateliersParBenevole.get(atelier.benevole_id)!.push(atelier);
    }

    const result: any[] = [];
    for (const [benevoleId, ateliers] of ateliersParBenevole.entries()) {
      // ✅ Seuil : au moins `minAteliers` ateliers distincts sur l'année
      if (ateliers.length < minAteliers) continue;

      const benevole = benevoleById.get(benevoleId);
      if (!benevole) continue;

      // Seules les entrées avec un candidat matché comptent pour les stats du RA
      // (heure_coaching, nb_personnes_accompagnees, secteurs) côté frontend.
      const cdp_x_benev: any[] = [];
      for (const atelier of ateliers) {
        for (const matchingId of atelier.matchings || []) {
          const matching = matchingById.get(matchingId);
          const cand = matching ? candById.get(matching.cdp_enr_cand_record_id) : undefined;
          if (cand) {
            cdp_x_benev.push({ cand: { secteur_recherche: cand.secteur_recherche } });
          }
        }
      }

      result.push({
        record_id: benevole.record_id,
        benev_structure: benevole.benev_structure,
        nom: benevole.nom,
        prenom: benevole.prenom,
        mail: benevole.mail,
        nb_ateliers: ateliers.length,
        cdp_x_benev,
      });
    }

    console.log(
      `RA ${year} : ${result.length} bénévole(s) avec au moins ${minAteliers} ateliers.`,
    );
    return result;
  }

  /**
   * Charge le buffer comme un PDF pour valider qu'il est bien formé et
   * retourne son nombre de pages. Lève une erreur si ce n'est pas un PDF valide.
   */
  async validateRaPdf(buffer: Buffer): Promise<number> {
    const doc = await PDFDocument.load(buffer);
    return doc.getPageCount();
  }

  private getRange(from: number, to: number, max: number): number[] {
    const safeFrom = Math.max(0, from - 1);
    const safeTo = Math.min(max - 1, to - 1);
    if (safeFrom > safeTo) {
      throw new Error(`❌ Plage invalide : from ${from} > to ${to}`);
    }
    return Array.from(
      { length: safeTo - safeFrom + 1 },
      (_, i) => i + safeFrom,
    );
  }

  async mergePdfAtIndex(
    file1: Express.Multer.File,
    file2: Express.Multer.File,
    index: number,
  ): Promise<Buffer> {
    try {
      const pdf1 = await PDFDocument.load(file1.buffer);
      const pdf2 = await PDFDocument.load(file2.buffer);
      const mergedPdf = await PDFDocument.create();

      const pages1 = await mergedPdf.copyPages(
        pdf1,
        this.getRange(1, index, pdf1.getPageCount()),
      );
      const insertedPages = await mergedPdf.copyPages(
        pdf2,
        this.getRange(1, pdf2.getPageCount(), pdf2.getPageCount()),
      );
      const pages2 = await mergedPdf.copyPages(
        pdf1,
        this.getRange(index, pdf1.getPageCount(), pdf1.getPageCount()),
      );

      pages1.forEach((page) => mergedPdf.addPage(page));
      insertedPages.forEach((page) => mergedPdf.addPage(page));
      pages2.forEach((page) => mergedPdf.addPage(page));

      const mergedPdfBytes = await mergedPdf.save();
      return Buffer.from(mergedPdfBytes);
    } catch (error) {
      console.error('❌ Erreur dans mergePdf:', error);
      throw error;
    }
  }

  async mergePdf(
    file1: Express.Multer.File,
    file2: Express.Multer.File,
    from1: number,
    to1: number,
    from2: number,
    to2: number,
  ): Promise<Buffer> {
    try {
      console.log('➡️ mergePdf - Plages demandées:', {
        from1,
        to1,
        from2,
        to2,
      });

      const pdf1 = await PDFDocument.load(file1.buffer);
      const pdf2 = await PDFDocument.load(file2.buffer);
      const mergedPdf = await PDFDocument.create();

      const pages1 = await mergedPdf.copyPages(
        pdf1,
        this.getRange(from1, to1, pdf1.getPageCount()),
      );
      const insertedPages = await mergedPdf.copyPages(
        pdf2,
        this.getRange(1, pdf2.getPageCount(), pdf2.getPageCount()),
      );
      const pages2 = await mergedPdf.copyPages(
        pdf1,
        this.getRange(from2, to2, pdf1.getPageCount()),
      );

      pages1.forEach((page) => mergedPdf.addPage(page));
      insertedPages.forEach((page) => mergedPdf.addPage(page));
      pages2.forEach((page) => mergedPdf.addPage(page));

      const mergedPdfBytes = await mergedPdf.save();
      return Buffer.from(mergedPdfBytes);
    } catch (error) {
      console.error('❌ Erreur dans mergePdf:', error);
      throw error;
    }
  }

  async generatePdfFromHtml(html: string, rotation: number): Promise<Buffer> {
    console.log('➡️ generatePdfFromHtml - Génération PDF à partir du HTML');
    const browser = await puppeteer.launch({
      headless: true, // depuis Puppeteer v20
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // utile en prod / docker
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    const pdfPath = path.join(process.cwd(), 'uploads/RA_benevole/page_2.pdf');

    const pdf2Buffer = await fs.readFile(pdfPath);

    return this.mergePdfSimple(Buffer.from(pdfBuffer), pdf2Buffer);
  }

  async mergePdfSimple(
    pdf1Buffer: Buffer,
    pdf2Buffer: Buffer,
  ): Promise<Buffer> {
    const pdf1 = await PDFDocument.load(pdf1Buffer);
    const pdf2 = await PDFDocument.load(pdf2Buffer);

    const copiedPages = await pdf1.copyPages(pdf2, pdf2.getPageIndices());
    copiedPages.forEach((page) => pdf1.addPage(page));

    const mergedPdfBytes = await pdf1.save();
    return Buffer.from(mergedPdfBytes);
  }

  /**
   * Insère toutes les pages de pdf2 dans pdf1 à partir d'un numéro de page donné.
   *
   * @param pdf1Buffer Buffer du premier PDF
   * @param pdf2Buffer Buffer du deuxième PDF à insérer
   * @param insertAfterPage numéro de page **(1-based)** de pdf1 après laquelle insérer pdf2
   *                        → exemple : 3 = insérer juste après la page 3
   * @returns Buffer du PDF final
   */

  async mergePdfAtPosition(
    pdf1Buffer: Buffer,
    pdf2Buffer: Buffer,
    insertAfterPage: number,
  ): Promise<Buffer> {
    // Charger les documents
    const pdf1 = await PDFDocument.load(pdf1Buffer);
    const pdf2 = await PDFDocument.load(pdf2Buffer);

    const totalPagesPdf1 = pdf1.getPageCount();
    if (insertAfterPage < 0 || insertAfterPage > totalPagesPdf1) {
      throw new Error(`insertAfterPage doit être entre 0 et ${totalPagesPdf1}`);
    }

    // Créer le PDF final
    const mergedPdf = await PDFDocument.create();

    // Taille de référence (première page de pdf1)
    const refPage = pdf1.getPage(0);
    const { width: targetWidth, height: targetHeight } = refPage.getSize();

    // 1️⃣ Pages de pdf1 avant la position
    const beforePages = await mergedPdf.copyPages(pdf1, [
      ...Array(insertAfterPage).keys(),
    ]);
    beforePages.forEach((p) => mergedPdf.addPage(p));

    // 2️⃣ Pages de pdf2 avec adaptation de taille
    const pdf2Pages = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
    for (const page of pdf2Pages) {
      const { width, height } = page.getSize();
      const scaleX = targetWidth / width;
      const scaleY = targetHeight / height;
      const scale = Math.min(scaleX, scaleY); // conserver le ratio

      // Create a new page with the target size
      const newPage = mergedPdf.addPage([targetWidth, targetHeight]);

      // Centrer le contenu si la taille ne correspond pas exactement
      const offsetX = (targetWidth - width * scale) / 2;
      const offsetY = (targetHeight - height * scale) / 2;

      // Embed the page before drawing — attendu, sinon save() peut s'exécuter
      // avant que le contenu ne soit dessiné et la page ressort vide.
      const embeddedPage = await mergedPdf.embedPage(page);
      newPage.drawPage(embeddedPage, {
        x: offsetX,
        y: offsetY,
        xScale: scale,
        yScale: scale,
      });
    }

    // 3️⃣ Pages restantes de pdf1
    const afterPages = await mergedPdf.copyPages(
      pdf1,
      [...Array(totalPagesPdf1 - insertAfterPage).keys()].map(
        (i) => i + insertAfterPage,
      ),
    );
    afterPages.forEach((p) => mergedPdf.addPage(p));

    const mergedBytes = await mergedPdf.save();
    return Buffer.from(mergedBytes);
  }
}
