import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirtableService } from './services/airtable/airtable.service';
import { UpdateBaseService } from './services/update-base/update-base.service';
import { MongoDbService } from './services/mongo-db/mongo-db.service';
import { StatsAccompagnementService } from './services/stats-accompagnement/stats-accompagnement.service';
import { StatsBenevoleService } from './services/stats-benevole/stats-benevole.service';
import { StatsVetementService } from './services/stats-vetement/stats-vetement.service';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './permissions/permission.entity';
import { DataSource } from 'typeorm';
import { MajQpvService } from './services/maj-qpv/maj-qpv.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AdminController } from './controllers/admin/admin.controller';
import { UserController } from './user/user.controller';
import { DevController } from './controllers/dev/dev.controller';
import { DevService } from './services/dev/dev.service';
import { EptService } from './services/dev/ept/ept.service';
import { DashboardController } from './controllers/dashboard/dashboard.controller';
import { DashboardService } from './services/dashboard/dashboard.service';
import { PdfMakerService } from './services/pdf-maker/pdf-maker.service';
import { PdfMakerController } from './controllers/pdf-maker/pdf-maker.controller';
import { PdfMakerModule } from './controllers/pdf-maker/pdf-maker.module';
import { GeminiService } from './services/gemini/gemini.service';
import { GeminiController } from './controllers/gemini/gemini.controller';
import { SharedViewController } from './controllers/shared_view/shared_view.controller';
import { BoussoleController } from './controllers/boussole/boussole.controller';
import { BoussoleService } from './services/boussole/boussole.service';
import { ReservationController } from './controllers/reservation/reservation.controller';

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
      synchronize: true, //TODO : à mettre à false en prod
    }),
    TypeOrmModule.forFeature([User, Role, Permission]),
    UserModule,
    PdfMakerModule,
  ],
  controllers: [
    AppController, 
    AdminController, 
    UserController, 
    DevController, 
    DashboardController, 
    PdfMakerController, 
    GeminiController,
    SharedViewController,
    BoussoleController,
    ReservationController,
  ],
  providers: [
    AppService,
    ParseDatePipe,
    AirtableService,
    UpdateBaseService,
    MongoDbService,
    StatsAccompagnementService,
    StatsBenevoleService,
    StatsVetementService,
    MajQpvService,
    DevService,
    EptService,
    DashboardService,
    PdfMakerService,
    GeminiService,
    BoussoleService,
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
      const adminRole = roleRepository.create({ name: 'admin' });
      await roleRepository.save(adminRole);
      const superAdminRole = roleRepository.create({ name: 'superAdmin' });
      await roleRepository.save(superAdminRole);
      console.log('Rôle "admin" créé.');
    }
    const userRepository = this.dataSource.getRepository(User);
    const userExists = await userRepository.findOne({ where: { email: process.env.EMAIL_ADMIN } });
    const devExists = await userRepository.findOne({ where: { email: process.env.EMAIL_ADMIN } });
    const jenniExists = await userRepository.findOne({ where: { email: process.env.EMAIL_ADMIN } });

    if (!userExists) {
      const defaultUser = userRepository.create({
        email: 'admin.numerique@lacravatesolidaire.org',
        passwordHash: process.env.MDP_ADMIN,
        roles: [(await roleRepository.findOne({ where: { name: 'superAdmin' } }))!, (await roleRepository.findOne({ where: { name: 'admin' } }))!],
      });
      await userRepository.save(defaultUser);
    }

    if (!devExists) {
      const defaultUser = userRepository.create({
        email: 'dev@lacravatesolidaire.org',
        passwordHash: process.env.MDP_DEV,
        roles: [(await roleRepository.findOne({ where: { name: 'admin' } }))!],
      });
      await userRepository.save(defaultUser);
    }

    if (!jenniExists) {
      const defaultUser = userRepository.create({
        email: 'Jennifer@lacravatesolidaire.org@lacravatesolidaire.org',
        passwordHash: process.env.MDP_JENNI,
        roles: [(await roleRepository.findOne({ where: { name: 'admin' } }))!],
      });
      await userRepository.save(defaultUser);
    }

  }
}
