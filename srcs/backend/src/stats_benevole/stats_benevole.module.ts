import { Module } from '@nestjs/common';
import { StatsBenevoleService } from './stats_benevole.service';
import { StatsBenevoleController } from './stats_benevole.controller';
import { MongoDbService } from '../services/mongo-db/mongo-db.service';

@Module({
  imports: [],
  controllers: [StatsBenevoleController],
  providers: [StatsBenevoleService, MongoDbService],
  exports: [StatsBenevoleService],
})
export class StatsBenevoleModule {}
