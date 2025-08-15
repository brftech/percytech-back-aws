import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Platform } from '../../platforms/entities/platform.entity';

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  platformId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessType: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ein: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cell_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    default: CompanyStatus.PENDING,
  })
  status: CompanyStatus;

  @Column({ type: 'boolean', default: false })
  tcrVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  tcrVerificationDate: Date;

  @Column({ type: 'json', nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Platform, (platform) => platform.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platformId' })
  platform: Platform;

  // Helper methods
  get isActive(): boolean {
    return this.status === CompanyStatus.ACTIVE;
  }

  get isPending(): boolean {
    return this.status === CompanyStatus.PENDING;
  }

  get isSuspended(): boolean {
    return this.status === CompanyStatus.SUSPENDED;
  }

  get isVerified(): boolean {
    return this.tcrVerified;
  }

  get hasAddress(): boolean {
    return this.address && Object.keys(this.address).length > 0;
  }

  get fullAddress(): string {
    if (!this.hasAddress) return '';
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
  }

  get contactInfo(): string {
    if (this.cell_phone) return this.cell_phone;
    if (this.email) return this.email;
    return 'No contact info';
  }
}
