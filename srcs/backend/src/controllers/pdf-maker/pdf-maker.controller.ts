import { Controller, Post, UploadedFiles, Body, UseInterceptors, BadRequestException, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PdfMakerService } from '../../services/pdf-maker/pdf-maker.service';

@Controller('pdf')
export class PdfMakerController {
  constructor(private readonly pdfMakerService: PdfMakerService) {}

//mergePdfAtIndex

@Post('mergeAtIndex')
  @UseInterceptors(FilesInterceptor('files', 2)) // Pour 2 fichiers
  async mergePdfAtIndex(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { index: number },
    @Res() res: Response
  ) {
    const [fileOriginal, fileInsert] = files;

    const pdfBuffer = await this.pdfMakerService.mergePdfAtIndex(
      fileOriginal,
      fileInsert,
      +body.index
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
    });

    return res.send(pdfBuffer);
  }

  @Post('merge')
  @UseInterceptors(FilesInterceptor('files', 2)) // Pour 2 fichiers
  async mergePdf(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { fromFile1: number, toFile1: number, fromFile2: number, toFile2: number },
    @Res() res: Response
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

   @Post('generate')
  async generatePdf(@Body() body: { html: string }, @Res() res: Response) {
    try {
      const pdf = await this.pdfMakerService.generatePdfFromHtml(body.html, 0);
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

  @Post('downloadBoussolePdf')
  async downloadBoussolePdf(@Body() body: { html: string }, @Res() res: Response) {
    try {
      const pdf = await this.pdfMakerService.generatePdfFromHtml(body.html, 1);
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
  
  @Get('benevolePdf')
  async generateBenevolePdf() {
    return this.pdfMakerService.getDataToGeneratePdf()
  }
}
