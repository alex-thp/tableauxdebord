import {
  Controller,
  Post,
  UploadedFiles,
  Body,
  UseInterceptors,
  Res,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PdfMakerService } from '../../services/pdf-maker/pdf-maker.service';
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
  private readonly STATIC_PDF_INSERT_PAGE = 29;

  private candidatIndex = 0;
  private retoursAtelier: RetourAtelier[] = [];

  constructor(private readonly pdfMakerService: PdfMakerService) {}

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
        signature: `${candidat.prenom.toUpperCase()} - ${candidat.date_et_lieu ?? ''}`,
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
      this.STATIC_PDF_INSERT_PAGE,
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

      this.candidatIndex =
        (this.candidatIndex + 1) % this.retoursAtelier.length;

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
  async generateBenevolePdf() {
    return this.pdfMakerService.getDataToGeneratePdf();
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
}
