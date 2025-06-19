import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PDFMerger from 'pdf-merger-js';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';

type MulterFile = {
  path: string;
  mimetype: string;
};

@Injectable()
export class PdfMakerService {
async mergePdf(
  file1: Express.Multer.File,
  file2: Express.Multer.File,
  fromFile1: number,
  toFile1: number,
  fromFile2: number,
  toFile2: number,
): Promise<Buffer> {
  const merger = new PDFMerger();

  await merger.add(file1.buffer, `${fromFile1}-${toFile1}`);
  await merger.add(file2.buffer, `${fromFile2}-${toFile2}`);

  const mergedPdfBuffer = await merger.saveAsBuffer();
  return mergedPdfBuffer;
}
}
