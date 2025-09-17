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

@Controller('pdf')
export class PdfMakerController {
  constructor(private readonly pdfMakerService: PdfMakerService) {}

  // ---- Merge PDF à un index précis ----
  @Post('mergeAtIndex')
  @UseInterceptors(FilesInterceptor('files', 2))
  async mergePdfAtIndex(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { index: number },
    @Res() res: Response,
  ) {
    const [fileOriginal, fileInsert] = files;
    const pdfBuffer = await this.pdfMakerService.mergePdfAtIndex(
      fileOriginal,
      fileInsert,
      +body.index,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
    });
    return res.send(pdfBuffer);
  }

  // ---- Merge PDF avec des plages de pages ----
  @Post('merge')
  @UseInterceptors(FilesInterceptor('files', 2))
  async mergePdf(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      fromFile1: number;
      toFile1: number;
      fromFile2: number;
      toFile2: number;
    },
    @Res() res: Response,
  ) {
    const [fileOriginal, fileInsert] = files;
    const pdfBuffer = await this.pdfMakerService.mergePdf(
      fileOriginal,
      fileInsert,
      +body.fromFile1,
      +body.toFile1,
      +body.fromFile2,
      +body.toFile2,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
    });
    return res.send(pdfBuffer);
  }

  // ---- Génération PDF avec background et image personnage ----
  @Post('generate')
  async generatePdf(@Body() body: { html: string }, @Res() res: Response) {
    try {
      // 1️⃣ Fond de page
      const fondPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Fond_page',
        'fond_1.png',
      );
      const fondBase64 = fs.readFileSync(fondPath, { encoding: 'base64' });
      const fondDataUrl = `data:image/png;base64,${fondBase64}`;

      // 2️⃣ Image personnage
      const personnagePath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'personnage_ordi_haut_de_page.png',
      );

      const personnageBase64 = fs.readFileSync(personnagePath, { encoding: 'base64' });
      const personnageDataUrl = `data:image/png;base64,${personnageBase64}`;


      const routePath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'ROUTE_1.png',
      );

      const routeBase64 = fs.readFileSync(routePath, { encoding: 'base64' });
      const routeDataUrl = `data:image/png;base64,${routeBase64}`;

                  const persoDepartPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'personnage_depart.png',
      );

      const persoDepartBase64 = fs.readFileSync(persoDepartPath, { encoding: 'base64' });
      const persoDepartDataUrl = `data:image/png;base64,${persoDepartBase64}`;

      const persoRhPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'personnage_rh_2.png',
      );

      const persoRhBase64 = fs.readFileSync(persoRhPath, { encoding: 'base64' });
      const persoRhDataUrl = `data:image/png;base64,${persoRhBase64}`;


        const verbatim1Path = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'Verbatim_1.png',
      );

      const verbatim1Base64 = fs.readFileSync(verbatim1Path, { encoding: 'base64' });
      const verbatim1DataUrl = `data:image/png;base64,${verbatim1Base64}`;
      
      const verbatim2Path = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'Verbatim_2.png',
      );

      const verbatim2Base64 = fs.readFileSync(verbatim2Path, { encoding: 'base64' });
      const verbatim2DataUrl = `data:image/png;base64,${verbatim2Base64}`;

      const persoCoteVestePath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'personnage_cote_veste.png',
      );

      const persoCoteVesteBase64 = fs.readFileSync(persoCoteVestePath, { encoding: 'base64' });
      const persoCoteVesteDataUrl = `data:image/png;base64,${persoCoteVesteBase64}`;

      const panneauPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'panneau.png',
      );

      const panneauBase64 = fs.readFileSync(panneauPath, { encoding: 'base64' });
      const panneauDataUrl = `data:image/png;base64,${panneauBase64}`;

      const herbePath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'herbe.png',
      );

      const herbeBase64 = fs.readFileSync(herbePath, { encoding: 'base64' });
      const herbeDataUrl = `data:image/png;base64,${herbeBase64}`;

      const fleurPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'fleur.png',
      );

      const fleurBase64 = fs.readFileSync(fleurPath, { encoding: 'base64' });
      const fleurDataUrl = `data:image/png;base64,${fleurBase64}`;

      const fleur2Path = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'fleur_2.png',
      );

      const fleur2Base64 = fs.readFileSync(fleur2Path, { encoding: 'base64' });
      const fleur2DataUrl = `data:image/png;base64,${fleur2Base64}`;

      const papillonPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'papillons.png',
      );

      const papillonBase64 = fs.readFileSync(papillonPath, { encoding: 'base64' });
      const papillonDataUrl = `data:image/png;base64,${papillonBase64}`;

      const mapPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'map.png',
      );

      const mapBase64 = fs.readFileSync(mapPath, { encoding: 'base64' });
      const mapDataUrl = `data:image/png;base64,${mapBase64}`;

      const unPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        '1.png',
      );

      const unBase64 = fs.readFileSync(unPath, { encoding: 'base64' });
      const unDataUrl = `data:image/png;base64,${unBase64}`;

      const deuxPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        '2.png',
      );

      const deuxBase64 = fs.readFileSync(deuxPath, { encoding: 'base64' });
      const deuxDataUrl = `data:image/png;base64,${deuxBase64}`;

      const troisPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        '3.png',
      );

      const troisBase64 = fs.readFileSync(troisPath, { encoding: 'base64' });
      const troisDataUrl = `data:image/png;base64,${troisBase64}`;

      const photoPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'photo_action.png',
      );

      const photoBase64 = fs.readFileSync(photoPath, { encoding: 'base64' });
      const photoDataUrl = `data:image/png;base64,${photoBase64}`;

      const photoCandidatPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Images_PNG',
        'cadre_Photo_candidat.e.png',
      );

      const photoCandidatBase64 = fs.readFileSync(photoCandidatPath, { encoding: 'base64' });
      const photoCandidatDataUrl = `data:image/png;base64,${photoCandidatBase64}`;
      
      // 3️⃣ Remplacement des placeholders dans le HTML
      let htmlWithImages = body.html
        .replace('{{fondUrl}}', fondDataUrl)
        .replace('{{personnageUrl}}', personnageDataUrl)
        .replace('{{routeUrl}}', routeDataUrl)
        .replace('{{persoDepartUrl}}', persoDepartDataUrl)
        .replace('{{persoRhUrl}}', persoRhDataUrl)
        .replace('{{verbatim1Url}}', verbatim1DataUrl)
        .replace('{{verbatim2Url}}', verbatim2DataUrl)
        .replace('{{persoCoteVesteUrl}}', persoCoteVesteDataUrl)
        .replace('{{panneauUrl}}', panneauDataUrl)
        .replace('{{panneau2Url}}', panneauDataUrl)
        .replace('{{panneau3Url}}', panneauDataUrl)
        .replace('{{herbeUrl}}', herbeDataUrl)
        .replace('{{fleurUrl}}', fleurDataUrl)
        .replace('{{fleur2Url}}', fleur2DataUrl)
        .replace('{{papillonUrl}}', papillonDataUrl)
        .replace('{{mapUrl}}', mapDataUrl)
        .replace('{{unUrl}}', unDataUrl)
        .replace('{{deuxUrl}}', deuxDataUrl)
        .replace('{{troisUrl}}', troisDataUrl)
        .replace('{{photoUrl}}', photoDataUrl)
        .replace('{{photoCandidatUrl}}', photoCandidatDataUrl);

      // 4️⃣ Génération du PDF
      const pdf = await this.pdfMakerService.generatePdfFromHtml(
        htmlWithImages,
        0,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="generated.pdf"',
      });
      res.send(pdf);
    } catch (err) {
      console.error('❌ Erreur génération PDF :', err);
      res.status(500).send('Erreur génération PDF');
    }
  }

  // ---- Variante Boussole ----
  @Post('downloadBoussolePdf')
  async downloadBoussolePdf(@Body() body: { html: string }, @Res() res: Response) {
    try {
      const fondPath = path.join(
        process.cwd(),
        'uploads',
        'RA_benevole',
        'Fond_page',
        'fond_1.png',
      );
      const fondBase64 = fs.readFileSync(fondPath, { encoding: 'base64' });
      const fondDataUrl = `data:image/png;base64,${fondBase64}`;

const personnagePath = path.join(
  process.cwd(),           // /usr/src/app dans le conteneur
  'uploads',
  'RA_benevole',
  'Images_PNG',
  'personnage_ordi_haut_de_page.png',
);
      const personnageBase64 = fs.readFileSync(personnagePath, { encoding: 'base64' });
      const personnageDataUrl = `data:image/png;base64,${personnageBase64}`;

      const htmlWithImages = body.html
        .replace('{{FOND_PAGE}}', fondDataUrl)
        .replace('{{personnageUrl}}', personnageDataUrl);

      const pdf = await this.pdfMakerService.generatePdfFromHtml(
        htmlWithImages,
        1,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="generated.pdf"',
      });
      res.send(pdf);
    } catch (err) {
      console.error('❌ Erreur génération PDF :', err);
      res.status(500).send('Erreur génération PDF');
    }
  }

  // ---- Récupération de données bénévole ----
  @Get('benevolePdf')
  async generateBenevolePdf() {
    return this.pdfMakerService.getDataToGeneratePdf();
  }
}
