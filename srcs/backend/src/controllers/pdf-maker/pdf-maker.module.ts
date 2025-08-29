import { Module } from '@nestjs/common';
import { PdfMakerService } from '../../services/pdf-maker/pdf-maker.service';
import { PdfMakerController } from './pdf-maker.controller';
import { AirtableService } from '../../services/airtable/airtable.service';
import { MongoDbService } from '../../services/mongo-db/mongo-db.service';

@Module({
  providers: [PdfMakerService, AirtableService, MongoDbService],
  controllers: [PdfMakerController],
})
export class PdfMakerModule {}