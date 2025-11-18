import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/role.entity';
import { User } from '../../user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
    async deleteAccount(userId: number): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({ where: { id: userId } });
    
      if (!user) {
        throw new Error('User not found');
      }
    
      await this.userRepository.remove(user);
    
      return { message: 'Account deleted successfully' };
    }
    
    async adminChangePassword(
      userId: number,
      newPassword: string,
    ): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({ where: { id: userId } });
    
      if (!user) {
        throw new Error('User not found');
      }
    
      const newHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = newHash;
    
      await this.userRepository.save(user);
    
      return { message: 'Password updated successfully by admin' };
    }
}
