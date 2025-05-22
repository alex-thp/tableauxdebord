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
import { Role } from './roles/role.entity';
import { Permission } from './permissions/permission.entity';
import { DataSource } from 'typeorm';

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
      entities: [User, Role, Permission],
      synchronize: true, // à mettre à false en prod
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
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
    StatsVetementService,
  ],
  exports: [ParseDatePipe],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    const roleRepository = this.dataSource.getRepository(Role);
    const roleExists = await roleRepository.findOne({ where: { name: 'user' } });
    if (!roleExists) {
      const defaultRole = roleRepository.create({ name: 'user' });
      await roleRepository.save(defaultRole);
      console.log('Rôle "user" créé.');
    }
  }
}
