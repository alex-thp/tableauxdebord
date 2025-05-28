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
import { User } from './user/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './permissions/permission.entity';
import { DataSource } from 'typeorm';
import { MajQpvService } from './maj-qpv/maj-qpv.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AdminController } from './controllers/admin.controller';
import { UserController } from './user/user.controller';

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
  ],
  controllers: [AppController, AdminController, UserController],
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
      const managerRole = roleRepository.create({ name: 'manager' });
      await roleRepository.save(managerRole);
      console.log('Rôle "admin" créé.');
    }
    const userRepository = this.dataSource.getRepository(User);
    const userExists = await userRepository.findOne({ where: { email: process.env.EMAIL_ADMIN } });
    if (!userExists) {
      const defaultUser = userRepository.create({
        email: 'alexandre@lacravatesolidaire.org',
        passwordHash: process.env.MDP_ADMIN,
        roles: [(await roleRepository.findOne({ where: { name: 'admin' } }))!],
      });
      await userRepository.save(defaultUser);

  }
  }
}
