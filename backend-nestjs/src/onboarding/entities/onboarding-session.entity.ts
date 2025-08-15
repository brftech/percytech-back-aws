import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { OnboardingStep } from './onboarding-step.entity';
import { BusinessVerification } from './business-verification.entity';
import { CampaignSubmission } from './campaign-submission.entity';

export enum OnboardingStatus {
  PURCHASED = 'purchased',
  VERIFYING_BUSINESS = 'verifying_business',
  CAMPAIGN_APPROVAL = 'campaign_approval',
  PHONE_ASSIGNMENT = 'phone_assignment',
  ACCOUNT_SETUP = 'account_setup',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum BrandType {
  PERCYTECH = 'percytech',
  GNYMBLE = 'gnymble',
  PERCYMD = 'percymd',
  PERCYTEXT = 'percytext',
}

@Entity('onboarding_sessions')
export class OnboardingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: BrandType,
  })
  brandType: BrandType;

  @Column({ type: 'varchar', length: 255 })
  domain: string;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.PURCHASED,
  })
  status: OnboardingStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentStep: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchaseAmount: number;

  @Column({ type: 'json', nullable: true })
  businessVerificationData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  campaignData: Record<string, any>;

  @Column({ type: 'varchar', length: 20, nullable: true })
  assignedPhoneNumber: string;

  @Column({ type: 'text', nullable: true })
  errorDetails: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Relationships
  @OneToMany(() => OnboardingStep, (step) => step.onboardingSession, {
    cascade: true,
  })
  steps: OnboardingStep[];

  @OneToMany(
    () => BusinessVerification,
    (verification) => verification.onboardingSession,
    { cascade: true },
  )
  businessVerifications: BusinessVerification[];

  @OneToMany(
    () => CampaignSubmission,
    (campaign) => campaign.onboardingSession,
    { cascade: true },
  )
  campaignSubmissions: CampaignSubmission[];

  // Helper methods
  get isCompleted(): boolean {
    return this.status === OnboardingStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === OnboardingStatus.FAILED;
  }

  get isInProgress(): boolean {
    return !this.isCompleted && !this.isFailed;
  }

  get currentStepEntity(): OnboardingStep | undefined {
    return this.steps?.find((step) => step.stepName === this.currentStep);
  }

  get progressPercentage(): number {
    const totalSteps = this.steps?.length || 0;
    const completedSteps =
      this.steps?.filter((step) => step.status === 'completed').length || 0;
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  markCompleted(): void {
    this.status = OnboardingStatus.COMPLETED;
    this.completedAt = new Date();
  }

  markFailed(error: string): void {
    this.status = OnboardingStatus.FAILED;
    this.errorDetails = error;
  }

  updateStatus(newStatus: OnboardingStatus, step?: string): void {
    this.status = newStatus;
    if (step) {
      this.currentStep = step;
    }
  }
}
