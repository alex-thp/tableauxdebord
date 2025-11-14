import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../roles/role.entity';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findOne({ where: { email } });
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

async findUserWithRolesAndPermissions(userId: number) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['roles', 'roles.permissions'],
  });

  if (!user) return null;

  const permissions = new Set<string>();
  user.roles.forEach(role =>
    role.permissions.forEach(p => permissions.add(p.name))
  );

  return {
    ...user,
    permissions: Array.from(permissions),
  };
}

  async findByEmailWithRolesAndPermissions(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findAllWithRolesAndPermissions(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

async updateUserRole(userId: number, roleId: number): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });
  if (!user) throw new NotFoundException('Utilisateur introuvable');

  const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
  if (!role) throw new NotFoundException('Rôle introuvable');

  user.roles = [role];
    /*if (!user.roles.some(r => r.id === role.id)) {
    user.roles.push(role);
  }*/
  return this.userRepository.save(user);
}
async createUser(email: string, password: string, roleId: number): Promise<User> {
  // Vérifie si l'utilisateur existe déjà
  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 10);

  // Création de l'utilisateur
  const user = this.userRepository.create({ email, passwordHash });

  // Récupération du rôle
  const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
  if (!role) {
    throw new NotFoundException('Rôle introuvable');
  }

  // Attribution du rôle à l'utilisateur
  user.roles = [role];

  // Sauvegarde en base
  return await this.userRepository.save(user);
}

}
