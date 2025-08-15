import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

@Entity('user_companies')
export class UserCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'bigint' })
  companyId: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Company, (company) => company.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Helper methods
  get isOwner(): boolean {
    return this.role === UserRole.OWNER;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.OWNER;
  }

  get canEdit(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.OWNER;
  }

  get canDelete(): boolean {
    return this.role === UserRole.OWNER;
  }
}
