import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/roles/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: Omit<User, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

async register(dto: { email: string; password: string }): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Cherche le rôle de base "user"
    const userRole = await this.roleRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      throw new Error('Default role "user" not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      email: dto.email,
      passwordHash: passwordHash,
      roles: [userRole],
    });

    const savedUser = await this.userRepository.save(newUser);
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
