import { Module } from '@nestjs/common';
import { PdfMakerService } from '../../services/pdf-maker/pdf-maker.service';
import { PdfMakerController } from './pdf-maker.controller';
import { AirtableService } from '../../services/airtable/airtable.service';
import { EmailService } from '../../services/email/email.service';

@Module({
  providers: [PdfMakerService, AirtableService, EmailService],
  controllers: [PdfMakerController],
})
export class PdfMakerModule {}
