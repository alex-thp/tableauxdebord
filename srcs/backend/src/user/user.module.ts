// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY_EXEMPLE',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
