import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LoginMethod {
  SMS = 'sms',
  EMAIL = 'email',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string;



  @Column({
    type: 'enum',
    enum: LoginMethod,
    default: LoginMethod.SMS,
  })
  preferredLoginMethod: LoginMethod;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    return this.username;
  }

  get hasSMSAccess(): boolean {
    return this.phoneNumber !== null && this.phoneNumber !== undefined;
  }

  get hasEmailAccess(): boolean {
    return this.email !== null && this.email !== undefined;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isPending(): boolean {
    return this.status === UserStatus.PENDING;
  }

  get isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  get canLogin(): boolean {
    return this.isActive && this.isVerified;
  }

  get primaryContact(): string {
    if (this.preferredLoginMethod === LoginMethod.SMS && this.phoneNumber) {
      return this.phoneNumber;
    }
    if (this.preferredLoginMethod === LoginMethod.EMAIL && this.email) {
      return this.email;
    }
    return this.phoneNumber || this.email || 'No contact method';
  }
}
