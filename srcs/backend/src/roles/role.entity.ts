import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../permissions/permission.entity';
import { User } from '../user/user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable()
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  users: User[];
}
