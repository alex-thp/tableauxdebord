import { Controller, Post, UploadedFiles, Body, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PdfMakerService } from './pdf-maker.service';

@Controller('pdf')
export class PdfMakerController {
  constructor(private readonly pdfMakerService: PdfMakerService) {}

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
}
