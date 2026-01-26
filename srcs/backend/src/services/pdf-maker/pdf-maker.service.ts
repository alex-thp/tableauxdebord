import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';
import { MongoDbService } from '../mongo-db/mongo-db.service';
import { AirtableService } from '../airtable/airtable.service';
import * as fs from 'fs/promises';
import * as path from 'path';

type MulterFile = {
  path: string;
  mimetype: string;
};

@Injectable()
export class PdfMakerService {
  constructor(
    private mongodbService: MongoDbService,
    private airtableService: AirtableService,
  ) {}

  async getDataToGeneratePdf() {
    const benev = await this.mongodbService.getTable('benevs');

    const pipeline = [
      {
        $lookup: {
          from: 'cdpenrbenevs',
          let: { cdpIds: '$cdp_x_benev' }, // tableau de record_id (strings)
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$record_id', '$$cdpIds'] },
                    { $gte: ['$date_atelier', new Date('2024-01-01')] },
                    { $lte: ['$date_atelier', new Date('2024-12-31')] },
                    { $eq: ['$statut', 'Présent'] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'cdpenrcandxcdpenrbenevs',
                let: { matchingIds: '$matchings' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ['$record_id', '$$matchingIds'],
                      },
                    },
                  },
                ],
                as: 'matchings_docs',
              },
            },
            {
              $unwind: {
                path: '$matchings_docs',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'cdpenrcands',
                localField: 'matchings_docs.cdp_enr_cand_record_id',
                foreignField: 'record_id',
                as: 'cand',
              },
            },
            {
              $unwind: {
                path: '$cand',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'cdpsuivis',
                localField: 'cand.candidat_record_id',
                foreignField: 'candidat_record_id',
                as: 'cdp_suivis',
              },
            },
            {
              $addFields: {
                'cand.cdp_suivi': '$cdp_suivis',
              },
            },
            {
              $project: {
                cdp_suivis: 0,
              },
            },
          ],
          as: 'cdp_x_benev', // champ enrichi dans benevs
        },
      },
      {
        // ✅ Ne garde que les benevs ayant au moins un lien avec un cdpenrbenev
        $match: {
          'cdp_x_benev.0': { $exists: true },
        },
      },
      {
        $project: {
          record_id: 1,
          benev_structure: 1,
          cdp_x_benev: 1,
          nom: 1,
          prenom: 1,
          mail: 1,
        },
      },
    ];
    const result = await benev.aggregate(pipeline).toArray();
    console.log('ready to return');
    return result;
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
    pdf2Pages.forEach((page) => {
      const { width, height } = page.getSize();
      const scaleX = targetWidth / width;
      const scaleY = targetHeight / height;
      const scale = Math.min(scaleX, scaleY); // conserver le ratio

      // Create a new page with the target size
      const newPage = mergedPdf.addPage([targetWidth, targetHeight]);

      // Centrer le contenu si la taille ne correspond pas exactement
      const offsetX = (targetWidth - width * scale) / 2;
      const offsetY = (targetHeight - height * scale) / 2;

      // Embed the page before drawing
      mergedPdf.embedPage(page).then((embeddedPage) => {
        newPage.drawPage(embeddedPage, {
          x: offsetX,
          y: offsetY,
          xScale: scale,
          yScale: scale,
        });
      });
    });

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
