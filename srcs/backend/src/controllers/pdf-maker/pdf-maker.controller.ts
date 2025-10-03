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
//import * as sharp from 'sharp';

@Controller('pdf')
export class PdfMakerController {
  candidatIndex = 0;

  constructor(private readonly pdfMakerService: PdfMakerService) {}

  retoursAtelier = [];


  // ------------------ UTILITAIRE ------------------
  private toBase64DataUrl(filePath: string, mimeType: string): string {
    if (!fs.existsSync(filePath)) return '';
    const fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
    return `data:${mimeType};base64,${fileBase64}`;
  }

  private async getPhotoCandidat(
  retoursAtelier: { nom: string; prenom: string; date_et_lieu?: string; verbatim?: string }[],
  indexActuel: number,
): Promise<{ photoPath: string; candidat: any }> {
  if (!retoursAtelier || retoursAtelier.length === 0) {
    return { photoPath: '', candidat: null };
  }

  const total = retoursAtelier.length;
  let attempts = 0;
  let photoPath = '';
  let currentIndex = indexActuel;

  while (attempts < total) {
    const candidat = retoursAtelier[currentIndex];
    if (candidat && candidat.nom && candidat.prenom) {
      const fileName = `${candidat.nom.toUpperCase()}_${candidat.prenom.toUpperCase()}.jpg`;
      const fullPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'photos_candidats',
        fileName,
      );

      if (fs.existsSync(fullPath)) {
        const resizedDir = path.join(process.cwd(), 'uploads', 'RA_benevole', 'photos_candidats', 'resized');
        if (!fs.existsSync(resizedDir)) fs.mkdirSync(resizedDir, { recursive: true });

        const resizedPath = path.join(resizedDir, fileName);
        /*await sharp(fullPath)
          .rotate()
          .resize({ width: 1000, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(resizedPath);

        photoPath = resizedPath;*/
        return { photoPath, candidat };
      }
    }

    currentIndex = (currentIndex + 1) % total;
    attempts++;
  }

  return { photoPath: '', candidat: null };
}
  // ------------------ GENERATION PDF ------------------
  @Post('generate')
async generatePdf(@Body('html') html: string, @Res() res: Response) {
  try {
    if (!html) return res.status(400).send('Aucun HTML fourni');

    // ------------------ Images fixes ------------------
    const images = {
      fondPage: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Fond_page/fond_1.png'), 'image/png'),
      persoOrdi: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_ordi_haut_de_page.png'), 'image/png'),
      route: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/ROUTE_1.png'), 'image/png'),
      persoDepart: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_depart.png'), 'image/png'),
      persoRh: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_rh_2.png'), 'image/png'),
      verbatim1: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/Verbatim_1.png'), 'image/png'),
      verbatim2: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/Verbatim_2.png'), 'image/png'),
      persoCoteVeste: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/personnage_cote_veste.png'), 'image/png'),
      panneau: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/panneau.png'), 'image/png'),
      herbe: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/herbe.png'), 'image/png'),
      fleur: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/fleur.png'), 'image/png'),
      fleur2: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/fleur_2.png'), 'image/png'),
      papillon: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/papillons.png'), 'image/png'),
      mapImg: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/map.png'), 'image/png'),
      un: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/1.png'), 'image/png'),
      deux: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/2.png'), 'image/png'),
      trois: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/3.png'), 'image/png'),
      photoAction: this.toBase64DataUrl(path.join(process.cwd(), 'uploads/RA_benevole/Images_PNG/photo_action.png'), 'image/png'),
    };

    // ------------------ Candidat et photo ------------------
    const { photoPath: photoCandidatPath, candidat: candidatCourant } = await this.getPhotoCandidat(
      this.retoursAtelier,
      this.candidatIndex
    );

    if (!candidatCourant) return res.status(404).send('Aucun candidat trouvé');

    // Incrémenter l'index pour le prochain PDF
    this.candidatIndex = (this.candidatIndex + 1) % this.retoursAtelier.length;

    const photoCandidatBase64 = photoCandidatPath ? fs.readFileSync(photoCandidatPath, { encoding: 'base64' }) : '';
    const photoCandidatDataUrl = `data:image/jpeg;base64,${photoCandidatBase64}`;
    const verbatimCandidat = candidatCourant.verbatim || '';
    const signatureCandidat = `${candidatCourant.prenom.toUpperCase()} - ${candidatCourant.date_et_lieu || ''}`;

    // ------------------ Remplacement des placeholders ------------------
    let htmlContent = html
      .replace('{{fondUrl}}', images.fondPage)
      .replace('{{personnageUrl}}', images.persoOrdi)
      .replace('{{routeUrl}}', images.route)
      .replace('{{persoDepartUrl}}', images.persoDepart)
      .replace('{{persoRhUrl}}', images.persoRh)
      .replace('{{verbatim1Url}}', images.verbatim1)
      .replace('{{verbatim2Url}}', images.verbatim2)
      .replace('{{persoCoteVesteUrl}}', images.persoCoteVeste)
      .replace('{{panneauUrl}}', images.panneau)
      .replace('{{panneau2Url}}', images.panneau)
      .replace('{{panneau3Url}}', images.panneau)
      .replace('{{herbeUrl}}', images.herbe)
      .replace('{{fleurUrl}}', images.fleur)
      .replace('{{fleur2Url}}', images.fleur2)
      .replace('{{papillonUrl}}', images.papillon)
      .replace('{{mapUrl}}', images.mapImg)
      .replace('{{unUrl}}', images.un)
      .replace('{{deuxUrl}}', images.deux)
      .replace('{{troisUrl}}', images.trois)
      .replace('{{photoUrl}}', images.photoAction)
      .replace('{{photoCandidatUrl}}', photoCandidatDataUrl)
      .replace('{{verbatimCandidat}}', verbatimCandidat)
      .replace('{{signatureCandidat}}', signatureCandidat);

    // ------------------ Génération PDF ------------------
    const page1Pdf: Buffer = await this.pdfMakerService.generatePdfFromHtml(htmlContent, 0);
    const pdfPath = path.join(process.cwd(), 'uploads/RA_benevole/LCS_RA.pdf');
    const pdf2Buffer = fs.readFileSync(pdfPath);
    const finalPdf = await this.pdfMakerService.mergePdfAtPosition(pdf2Buffer, page1Pdf, 29);

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

  // ------------------ RÉCUPÉRATION BÉNÉVOLE ------------------
  @Get('benevolePdf')
  async generateBenevolePdf() {
    return this.pdfMakerService.getDataToGeneratePdf();
  }

  // ------------------ MERGE PDF SIMPLE ------------------
  @Post('merge')
  @UseInterceptors(FilesInterceptor('files', 2))
  async mergePdf(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      if (!files || files.length !== 2) return res.status(400).send('Deux fichiers PDF sont requis.');
      const [fileOriginal, fileInsert] = files;
      let pdfBuffer = await this.pdfMakerService.mergePdfSimple(fileOriginal.buffer, fileInsert.buffer);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      });
      const pdfPath = path.join(process.cwd(), 'uploads/RA_benevole/LCS_RA.pdf');
      const pdf2Buffer = fs.readFileSync(pdfPath);
      
      pdfBuffer = await this.pdfMakerService.mergePdfAtPosition(pdf2Buffer, pdfBuffer, 29)
      res.send(pdfBuffer);
    } catch (err) {
      console.error('❌ Erreur fusion PDF :', err);
      res.status(500).send('Erreur lors de la fusion des PDF.');
    }
  }
}
