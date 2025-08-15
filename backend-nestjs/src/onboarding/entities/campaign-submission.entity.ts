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

export enum CampaignSubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_CHANGES = 'requires_changes',
}

export enum UseCase {
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
  TWO_FACTOR = 'two_factor',
  ACCOUNT_NOTIFICATION = 'account_notification',
  CUSTOMER_SERVICE = 'customer_service',
  DELIVERY_NOTIFICATION = 'delivery_notification',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  OTHER = 'other',
}

@Entity('campaign_submissions')
export class CampaignSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  onboardingSessionId: number;

  @Column({ type: 'varchar', length: 255 })
  campaignName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: UseCase,
    default: UseCase.OTHER,
  })
  useCase: UseCase;

  @Column({ type: 'text' })
  messageContent: string;

  @Column({ type: 'text', nullable: true })
  sampleMessages: string;

  @Column({
    type: 'enum',
    enum: CampaignSubmissionStatus,
    default: CampaignSubmissionStatus.DRAFT,
  })
  status: CampaignSubmissionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tcrCampaignId: string;

  @Column({ type: 'json', nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'json', nullable: true })
  requiredChanges: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => OnboardingSession, (session) => session.campaignSubmissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'onboardingSessionId' })
  onboardingSession: OnboardingSession;

  // Helper methods
  get isApproved(): boolean {
    return this.status === CampaignSubmissionStatus.APPROVED;
  }

  get isRejected(): boolean {
    return this.status === CampaignSubmissionStatus.REJECTED;
  }

  get isDraft(): boolean {
    return this.status === CampaignSubmissionStatus.DRAFT;
  }

  get isSubmitted(): boolean {
    return this.status === CampaignSubmissionStatus.SUBMITTED;
  }

  get isUnderReview(): boolean {
    return this.status === CampaignSubmissionStatus.UNDER_REVIEW;
  }

  get requiresChanges(): boolean {
    return this.status === CampaignSubmissionStatus.REQUIRES_CHANGES;
  }

  get hasTCRCampaignId(): boolean {
    return this.tcrCampaignId !== null && this.tcrCampaignId !== undefined;
  }

  get isRegulated(): boolean {
    const regulatedUseCases = [
      UseCase.TWO_FACTOR,
      UseCase.ACCOUNT_NOTIFICATION,
      UseCase.CUSTOMER_SERVICE,
      UseCase.DELIVERY_NOTIFICATION,
      UseCase.APPOINTMENT_REMINDER,
    ];
    return regulatedUseCases.includes(this.useCase);
  }

  get requiresTCRApproval(): boolean {
    return this.isRegulated || this.useCase === UseCase.MARKETING;
  }
}
