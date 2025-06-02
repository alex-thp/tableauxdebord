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
  return this.userRepository.findOne({
    where: { id: userId },
    relations: ['roles', 'roles.permissions'],
  }).then(user => {
    if (!user) {
      return null;
    }
    const permissionsSet = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => permissionsSet.add(permission.name));
    });

    return {
      ...user,
      permissions: Array.from(permissionsSet),
    };
  });
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
  return this.userRepository.save(user);
}

}
