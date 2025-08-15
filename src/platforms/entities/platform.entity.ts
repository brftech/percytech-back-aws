import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum PlatformType {
  PERCYTECH = 'percytech',
  GNYMBLE = 'gnymble',
  PERCYMD = 'percymd',
  PERCYTEXT = 'percytext',
}

export enum PlatformStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('platforms')
export class Platform {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PlatformType,
    unique: true,
  })
  type: PlatformType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  primaryColor: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  secondaryColor: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain: string;

  @Column({
    type: 'enum',
    enum: PlatformStatus,
    default: PlatformStatus.ACTIVE,
  })
  status: PlatformStatus;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  compliance: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get isPercyTech(): boolean {
    return this.type === PlatformType.PERCYTECH;
  }

  get isGnymble(): boolean {
    return this.type === PlatformType.GNYMBLE;
  }

  get isPercyMD(): boolean {
    return this.type === PlatformType.PERCYMD;
  }

  get isPercyText(): boolean {
    return this.type === PlatformType.PERCYTEXT;
  }

  get hasCompliance(): boolean {
    return this.compliance && Object.keys(this.compliance).length > 0;
  }

  get complianceLevel(): string {
    if (this.type === PlatformType.GNYMBLE) return 'high';
    if (this.type === PlatformType.PERCYMD) return 'medium';
    return 'standard';
  }

  get isActive(): boolean {
    return this.status === PlatformStatus.ACTIVE;
  }
}
