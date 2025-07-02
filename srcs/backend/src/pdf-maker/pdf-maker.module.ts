import { Module } from '@nestjs/common';
import { PdfMakerService } from './pdf-maker.service';
import { PdfMakerController } from './pdf-maker.controller';
import { AirtableService } from '../airtable/airtable.service';
import { MongoDbService } from '../mongo-db/mongo-db.service';

@Module({
  providers: [PdfMakerService, AirtableService, MongoDbService],
  controllers: [PdfMakerController],
})
export class PdfMakerModule {}