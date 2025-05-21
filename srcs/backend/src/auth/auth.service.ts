import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  // Simule une "base de données" avec un utilisateur
  private users: User[] = [
    {
      id: 1,
      email: 'user@example.com',
      passwordHash: bcrypt.hashSync('password123', 10),
    },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = this.users.find(u => u.email === email);
    console.log('User found:', user);
    console.log('Password hash:', user?.passwordHash);
    console.log('Password:', password);
    console.log('Bcrypt hash:', bcrypt.hashSync(password, 10));
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
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
}
