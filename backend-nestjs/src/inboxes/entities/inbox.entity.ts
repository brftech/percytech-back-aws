import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Brand } from '../../brands/entities/brand.entity';

export enum InboxStatus {
  SETUP = 'setup',
  TESTING = 'testing',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('inboxes')
export class Inbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  companyId: number;

  @Column({ type: 'bigint', nullable: true })
  brandId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timeZone: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  areaCode: string;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date;

  @Column({ type: 'time', nullable: true })
  doneResetTime: string;

  @Column({ type: 'boolean', default: false })
  isEnabledDeferredMessaging: boolean;

  @Column({ type: 'boolean', default: true })
  enableDoneResetTime: boolean;

  @Column({ type: 'boolean', default: false })
  hideBroadcastButton: boolean;

  @Column({ type: 'boolean', default: false })
  hideEpisodes: boolean;

  @Column({ type: 'int', default: 100 })
  customDetailsLimit: number;

  @Column({
    type: 'enum',
    enum: InboxStatus,
    default: InboxStatus.SETUP,
  })
  status: InboxStatus;

  @Column({ type: 'bigint', nullable: true })
  defaultPhoneId: number;

  @Column({ type: 'bigint', nullable: true })
  temporaryCampaignId: number;

  @Column({ type: 'boolean', default: false })
  isUsingTemporaryCampaign: boolean;

  @Column({ type: 'timestamp', nullable: true })
  campaignApprovalDeadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  setupCompletedAt: Date;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  compliance: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Company, (company) => company.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Brand, (brand) => brand.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  // Helper methods
  get isSetup(): boolean {
    return this.status === InboxStatus.SETUP;
  }

  get isTesting(): boolean {
    return this.status === InboxStatus.TESTING;
  }

  get isPendingApproval(): boolean {
    return this.status === InboxStatus.PENDING_APPROVAL;
  }

  get isOperational(): boolean {
    return this.status === InboxStatus.ACTIVE;
  }

  get canText(): boolean {
    return this.isOperational && this.brandId !== null;
  }

  get isInOnboarding(): boolean {
    return [
      InboxStatus.SETUP,
      InboxStatus.TESTING,
      InboxStatus.PENDING_APPROVAL,
    ].includes(this.status);
  }

  get daysUntilCampaignApproval(): number {
    if (!this.campaignApprovalDeadline) return 0;
    const now = new Date();
    const deadline = new Date(this.campaignApprovalDeadline);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isCampaignApprovalOverdue(): boolean {
    return this.daysUntilCampaignApproval < 0;
  }

  get onboardingProgress(): number {
    if (this.status === InboxStatus.SETUP) return 25;
    if (this.status === InboxStatus.TESTING) return 50;
    if (this.status === InboxStatus.PENDING_APPROVAL) return 75;
    if (this.status === InboxStatus.ACTIVE) return 100;
    return 0;
  }

  get onboardingStage(): string {
    if (this.status === InboxStatus.SETUP) return 'Setup';
    if (this.status === InboxStatus.TESTING) return 'Testing';
    if (this.status === InboxStatus.PENDING_APPROVAL) return 'Pending Approval';
    if (this.status === InboxStatus.ACTIVE) return 'Active';
    return 'Unknown';
  }

  // Management methods
  completeSetup(): void {
    this.status = InboxStatus.TESTING;
    this.setupCompletedAt = new Date();
  }

  startTesting(): void {
    this.status = InboxStatus.TESTING;
  }

  assignTemporaryCampaign(campaignId: number, deadline: Date): void {
    this.temporaryCampaignId = campaignId;
    this.isUsingTemporaryCampaign = true;
    this.campaignApprovalDeadline = deadline;
    this.status = InboxStatus.TESTING;
  }

  removeTemporaryCampaign(): void {
    this.temporaryCampaignId = null as any;
    this.isUsingTemporaryCampaign = false;
    this.campaignApprovalDeadline = null as any;
  }

  setCampaignApprovalDeadline(deadline: Date): void {
    this.campaignApprovalDeadline = deadline;
  }

  activateWithApprovedCampaign(): void {
    this.status = InboxStatus.ACTIVE;
    this.removeTemporaryCampaign();
  }
}
