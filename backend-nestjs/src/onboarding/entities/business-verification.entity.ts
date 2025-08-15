import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OnboardingSession } from './onboarding-session.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

@Entity('business_verifications')
export class BusinessVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  onboardingSessionId: number;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ein: string;

  @Column({ type: 'varchar', length: 100 })
  businessType: string;

  @Column({ type: 'json' })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: 'varchar', length: 100 })
  contactPerson: string;

  @Column({ type: 'varchar', length: 20 })
  contactPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tcrBrandId: string;

  @Column({ type: 'json', nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(
    () => OnboardingSession,
    (session) => session.businessVerifications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'onboardingSessionId' })
  onboardingSession: OnboardingSession;

  // Helper methods
  get isApproved(): boolean {
    return this.status === VerificationStatus.APPROVED;
  }

  get isRejected(): boolean {
    return this.status === VerificationStatus.REJECTED;
  }

  get isPending(): boolean {
    return this.status === VerificationStatus.PENDING;
  }

  get isInProgress(): boolean {
    return this.status === VerificationStatus.IN_PROGRESS;
  }

  get fullAddress(): string {
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
  }

  get hasTCRBrandId(): boolean {
    return this.tcrBrandId !== null && this.tcrBrandId !== undefined;
  }
}
