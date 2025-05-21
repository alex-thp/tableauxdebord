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
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'mydatabase',
      entities: [User],
      synchronize: true, // à mettre à false en prod
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ParseDatePipe,
    AirtableService,
    UpdateBaseService,
    MongoDbService,
    StatsAccompagnementService,
    StatsBenevoleService,
    StatsVetementService
  ],
  exports: [ParseDatePipe],
})
export class AppModule {}
