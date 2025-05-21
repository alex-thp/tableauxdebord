import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirtableService } from './airtable/airtable.service';
import { UpdateBaseService } from './update-base/update-base.service';
import { MongoDbService } from './mongo-db/mongo-db.service';
import { StatsAccompagnementService } from './stats-accompagnement/stats-accompagnement.service';
import { StatsBenevoleService } from './stats-benevole/stats-benevole.service';
import { StatsVetementService } from './stats-vetement/stats-vetement.service';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, ParseDatePipe, AirtableService, UpdateBaseService, MongoDbService, StatsAccompagnementService, StatsBenevoleService, StatsVetementService],
  exports: [ParseDatePipe],
})
export class AppModule {}
