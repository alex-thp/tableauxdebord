import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  Body,
  UseInterceptors,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PdfMakerService } from '../../services/pdf-maker/pdf-maker.service';
import { EmailService } from '../../services/email/email.service';
import * as path from 'path';
import * as fs from 'fs';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface RetourAtelier {
  nom: string;
  prenom: string;
  date_et_lieu?: string;
  verbatim?: string;
}

interface CandidatPdfData {
  photoDataUrl: string;
  verbatim: string;
  signature: string;
  candidat: RetourAtelier;
}

// ─────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────

@Controller('pdf')
export class PdfMakerController {
  private readonly BASE_PATH = path.join(
    process.cwd(),
    'uploads',
    'RA_benevole',
  );
  private readonly STATIC_PDF_PATH = path.join(this.BASE_PATH, 'LCS_RA.pdf');
  private readonly RA_CONFIG_PATH = path.join(this.BASE_PATH, 'ra-config.json');
  private readonly DEFAULT_INSERT_PAGE = 29;

  private candidatIndex = 0;
  private retoursAtelier: RetourAtelier[] = [];

  constructor(
    private readonly pdfMakerService: PdfMakerService,
    private readonly emailService: EmailService,
  ) {
    this.retoursAtelier = this.loadRetoursAtelier();
    console.log(
      `PdfMakerController: ${this.retoursAtelier.length} retour(s) d'atelier chargé(s).`,
    );
  }

  // ─────────────────────────────────────────────
  // Chargement des données
  // ─────────────────────────────────────────────

  /**
   * Charge les témoignages candidats (nom, prénom, verbatim) depuis
   * uploads/RA_benevole/retours-atelier.ts, un fichier de données déposé
   * manuellement (pas du code source compilé) contenant un simple littéral
   * `let retoursAtelier = [...]`.
   */
  private loadRetoursAtelier(): RetourAtelier[] {
    const filePath = path.join(this.BASE_PATH, 'retours-atelier.ts');
    if (!fs.existsSync(filePath)) {
      console.error(`retours-atelier.ts introuvable à ${filePath}`);
      return [];
    }
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
      if (!match) {
        console.error(
          'retours-atelier.ts : impossible de trouver le littéral de tableau',
        );
        return [];
      }
      // eslint-disable-next-line no-new-func
      return new Function(`return (${match[1]});`)();
    } catch (e) {
      console.error('Erreur lecture retours-atelier.ts', e);
      return [];
    }
  }

  // ─────────────────────────────────────────────
  // Configuration du RA (page d'insertion de la partie dynamique)
  // ─────────────────────────────────────────────

  private getInsertPage(): number {
    if (!fs.existsSync(this.RA_CONFIG_PATH)) return this.DEFAULT_INSERT_PAGE;
    try {
      const raw = fs.readFileSync(this.RA_CONFIG_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return Number.isInteger(parsed.insertPage)
        ? parsed.insertPage
        : this.DEFAULT_INSERT_PAGE;
    } catch (e) {
      console.error('Erreur lecture ra-config.json', e);
      return this.DEFAULT_INSERT_PAGE;
    }
  }

  private saveInsertPage(insertPage: number): void {
    fs.writeFileSync(
      this.RA_CONFIG_PATH,
      JSON.stringify({ insertPage, updatedAt: new Date().toISOString() }, null, 2),
    );
  }

  // ─────────────────────────────────────────────
  // Utilitaires privés
  // ─────────────────────────────────────────────

  private toBase64DataUrl(filePath: string, mimeType: string): string {
    if (!fs.existsSync(filePath)) return '';
    const fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:${mimeType};base64,${fileBase64}`;
  }

  private img(relativePath: string): string {
    return this.toBase64DataUrl(
      path.join(this.BASE_PATH, relativePath),
      'image/png',
    );
  }

  private buildImagesMap(): Record<string, string> {
    return {
      fondPage: this.img('Fond_page/fond_1.png'),
      persoOrdi: this.img('Images_PNG/personnage_ordi_haut_de_page.png'),
      route: this.img('Images_PNG/ROUTE_1.png'),
      persoDepart: this.img('Images_PNG/personnage_depart.png'),
      persoRh: this.img('Images_PNG/personnage_rh_2.png'),
      verbatim1: this.img('Images_PNG/Verbatim_1.png'),
      verbatim2: this.img('Images_PNG/Verbatim_2.png'),
      persoCoteVeste: this.img('Images_PNG/personnage_cote_veste.png'),
      panneau: this.img('Images_PNG/panneau.png'),
      herbe: this.img('Images_PNG/herbe.png'),
      fleur: this.img('Images_PNG/fleur.png'),
      fleur2: this.img('Images_PNG/fleur_2.png'),
      papillon: this.img('Images_PNG/papillons.png'),
      mapImg: this.img('Images_PNG/map.png'),
      un: this.img('Images_PNG/1.png'),
      deux: this.img('Images_PNG/2.png'),
      trois: this.img('Images_PNG/3.png'),
      photoAction: this.img('Images_PNG/photo_action.png'),
    };
  }

  private resolveCandidatPdfData(index: number): CandidatPdfData | null {
    const total = this.retoursAtelier.length;
    if (total === 0) return null;

    for (let attempts = 0; attempts < total; attempts++) {
      const candidat = this.retoursAtelier[(index + attempts) % total];
      if (!candidat?.nom || !candidat?.prenom) continue;

      const fileName = `${candidat.nom.toUpperCase()}_${candidat.prenom.toUpperCase()}.jpg`;
      const photoPath = path.join(this.BASE_PATH, 'photos_candidats', fileName);
      const photoDataUrl = fs.existsSync(photoPath)
        ? `data:image/jpeg;base64,${fs.readFileSync(photoPath, { encoding: 'base64' })}`
        : '';

      return {
        candidat,
        photoDataUrl,
        verbatim: candidat.verbatim ?? '',
        signature: `${candidat.prenom.toUpperCase()}`,
      };
    }

    return null;
  }

  private replacePlaceholders(
    html: string,
    images: Record<string, string>,
    candidatData: CandidatPdfData,
  ): string {
    const replacements: Record<string, string> = {
      '{{fondUrl}}': images.fondPage,
      '{{personnageUrl}}': images.persoOrdi,
      '{{routeUrl}}': images.route,
      '{{persoDepartUrl}}': images.persoDepart,
      '{{persoRhUrl}}': images.persoRh,
      '{{verbatim1Url}}': images.verbatim1,
      '{{verbatim2Url}}': images.verbatim2,
      '{{persoCoteVesteUrl}}': images.persoCoteVeste,
      '{{panneauUrl}}': images.panneau,
      '{{panneau2Url}}': images.panneau,
      '{{panneau3Url}}': images.panneau,
      '{{herbeUrl}}': images.herbe,
      '{{fleurUrl}}': images.fleur,
      '{{fleur2Url}}': images.fleur2,
      '{{papillonUrl}}': images.papillon,
      '{{mapUrl}}': images.mapImg,
      '{{unUrl}}': images.un,
      '{{deuxUrl}}': images.deux,
      '{{troisUrl}}': images.trois,
      '{{photoUrl}}': images.photoAction,
      '{{photoCandidatUrl}}': candidatData.photoDataUrl,
      '{{verbatimCandidat}}': candidatData.verbatim,
      '{{signatureCandidat}}': candidatData.signature,
    };

    return Object.entries(replacements).reduce(
      (acc, [placeholder, value]) => acc.replace(placeholder, value),
      html,
    );
  }

  private async appendStaticPdf(buffer: Buffer): Promise<Buffer> {
    const staticPdf = fs.readFileSync(this.STATIC_PDF_PATH);
    return this.pdfMakerService.mergePdfAtPosition(
      staticPdf,
      buffer,
      this.getInsertPage(),
    );
  }

  // ─────────────────────────────────────────────
  // Endpoints
  // ─────────────────────────────────────────────

  @Post('generate')
  async generatePdf(@Body('html') html: string, @Res() res: Response) {
    try {
      if (!html) return res.status(400).send('Aucun HTML fourni');

      const candidatData = this.resolveCandidatPdfData(this.candidatIndex);
      if (!candidatData) return res.status(404).send('Aucun candidat trouvé');

      if (this.retoursAtelier.length > 0) {
        this.candidatIndex =
          (this.candidatIndex + 1) % this.retoursAtelier.length;
      }

      const htmlContent = this.replacePlaceholders(
        html,
        this.buildImagesMap(),
        candidatData,
      );

      const page1Pdf = await this.pdfMakerService.generatePdfFromHtml(
        htmlContent,
        0,
      );
      const finalPdf = await this.appendStaticPdf(page1Pdf);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="generated.pdf"',
      });
      res.send(finalPdf);
    } catch (err) {
      console.error('❌ Erreur génération PDF bénévole :', err);
      res.status(500).send('Erreur génération PDF bénévole');
    }
  }

  @Get('benevolePdf')
  async generateBenevolePdf(
    @Query('year') year?: string,
    @Query('minAteliers') minAteliers?: string,
  ) {
    const parsedYear = year ? parseInt(year, 10) : 2025;
    const parsedMinAteliers = minAteliers ? parseInt(minAteliers, 10) : 3;
    return this.pdfMakerService.getDataToGeneratePdf(
      parsedYear,
      parsedMinAteliers,
    );
  }

  @Post('merge')
  @UseInterceptors(FilesInterceptor('files', 2))
  async mergePdf(@UploadedFiles() files: any[], @Res() res: Response) {
    try {
      if (!files || files.length !== 2)
        return res.status(400).send('Deux fichiers PDF sont requis.');

      const [fileOriginal, fileInsert] = files;
      const mergedBuffer = await this.pdfMakerService.mergePdfSimple(
        fileOriginal.buffer,
        fileInsert.buffer,
      );
      const finalPdf = await this.appendStaticPdf(mergedBuffer);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      });
      res.send(finalPdf);
    } catch (err) {
      console.error('❌ Erreur fusion PDF :', err);
      res.status(500).send('Erreur lors de la fusion des PDF.');
    }
  }

  // ─────────────────────────────────────────────
  // Envoi par email (voir EmailService pour le garde-fou dry-run)
  // ─────────────────────────────────────────────

  @Get('mail-status')
  getMailStatus() {
    return { mode: this.emailService.getMode() };
  }

  @Post('send')
  @UseInterceptors(FileInterceptor('pdf'))
  async sendPdfByMail(
    @UploadedFile() file: Express.Multer.File,
    @Body('to') to: string,
    @Body('benevNom') benevNom: string,
    @Body('benevPrenom') benevPrenom: string,
    @Body('year') year: string,
    @Res() res: Response,
  ) {
    try {
      if (!file) return res.status(400).send({ error: 'Le PDF est requis.' });
      if (!to) return res.status(400).send({ error: 'Le destinataire ("to") est requis.' });

      const prenom = benevPrenom || '';
      const nom = benevNom || '';
      // Année du rapport d'activité contenu dans le PDF (pas l'année calendaire d'envoi)
      const annee = year ? parseInt(year, 10) : 2025;
      const subject = `Votre rapport d'activité bénévole ${annee} - La Cravate Solidaire`;
      const html = `<p>Bonjour ${prenom},</p>
<p>Merci pour votre engagement à nos côtés cette année !</p>
<p>Vous trouverez ci-joint votre rapport d'activité personnalisé.</p>
<p>Toute l'équipe de La Cravate Solidaire vous remercie chaleureusement.</p>`;

      const fileName = `RA_${nom.toUpperCase() || 'BENEVOLE'}_${prenom.toUpperCase()}.pdf`;

      const result = await this.emailService.sendMail({
        to,
        subject,
        html,
        attachmentFilename: fileName,
        attachmentBuffer: file.buffer,
      });

      res.status(200).send(result);
    } catch (err) {
      console.error('❌ Erreur envoi email PDF bénévole :', err);
      res.status(500).send({ error: "Erreur lors de l'envoi de l'email." });
    }
  }

  // ─────────────────────────────────────────────
  // Gestion du RA de base (document dans lequel la partie dynamique est insérée)
  // ─────────────────────────────────────────────

  @Get('ra-info')
  async getRaInfo() {
    if (!fs.existsSync(this.STATIC_PDF_PATH)) {
      return { exists: false, insertPage: this.getInsertPage() };
    }
    try {
      const stats = fs.statSync(this.STATIC_PDF_PATH);
      const bytes = fs.readFileSync(this.STATIC_PDF_PATH);
      const pageCount = await this.pdfMakerService.validateRaPdf(bytes);
      return {
        exists: true,
        pageCount,
        insertPage: this.getInsertPage(),
        sizeBytes: stats.size,
        updatedAt: stats.mtime,
      };
    } catch (err) {
      console.error('❌ Erreur lecture info RA :', err);
      return { exists: true, error: 'Le fichier RA actuel est illisible.', insertPage: this.getInsertPage() };
    }
  }

  @Post('update-ra')
  @UseInterceptors(FileInterceptor('ra'))
  async updateRa(
    @UploadedFile() file: Express.Multer.File,
    @Body('insertPage') insertPageRaw: string,
    @Res() res: Response,
  ) {
    try {
      if (!file) return res.status(400).send({ error: 'Le fichier RA (PDF) est requis.' });

      let pageCount: number;
      try {
        pageCount = await this.pdfMakerService.validateRaPdf(file.buffer);
      } catch (e) {
        return res.status(400).send({ error: "Le fichier fourni n'est pas un PDF valide." });
      }

      const insertPage = insertPageRaw
        ? parseInt(insertPageRaw, 10)
        : this.getInsertPage();
      if (!Number.isInteger(insertPage) || insertPage < 0 || insertPage > pageCount) {
        return res.status(400).send({
          error: `La page d'insertion doit être un entier entre 0 et ${pageCount} (nombre de pages du nouveau RA).`,
        });
      }

      // Sauvegarde de l'ancien RA avant remplacement
      if (fs.existsSync(this.STATIC_PDF_PATH)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.BASE_PATH, `LCS_RA_backup_${timestamp}.pdf`);
        fs.copyFileSync(this.STATIC_PDF_PATH, backupPath);
      }

      fs.writeFileSync(this.STATIC_PDF_PATH, file.buffer);
      this.saveInsertPage(insertPage);

      console.log(
        `RA mis à jour : ${pageCount} page(s), insertion après la page ${insertPage}.`,
      );

      res.status(200).send({ success: true, pageCount, insertPage });
    } catch (err) {
      console.error('❌ Erreur mise à jour du RA :', err);
      res.status(500).send({ error: 'Erreur lors de la mise à jour du RA.' });
    }
  }
}
