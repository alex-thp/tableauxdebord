import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Role } from '../roles/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user =
      await this.userService.findByEmailWithRolesAndPermissions(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    return isPasswordValid ? user : null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
      permissions: user.roles.flatMap((r) => r.permissions.map((p) => p.name)),
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: {
    email: string;
    password: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });
    if (!userRole) {
      throw new Error('Default role "user" not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      email: dto.email,
      passwordHash,
      roles: [userRole],
    });

    const savedUser = await this.userRepository.save(newUser);
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
