import { Module } from '@nestjs/common';
import { PdfMakerService } from './pdf-maker.service';
import { PdfMakerController } from './pdf-maker.controller';

@Module({
  providers: [PdfMakerService],
  controllers: [PdfMakerController],
})
export class PdfMakerModule {}