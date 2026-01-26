import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../roles/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true }) // ← ou { cascade: true } si besoin
  @JoinTable()
  roles: Role[];
}
