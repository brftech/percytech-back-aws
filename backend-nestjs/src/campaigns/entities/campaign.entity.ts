import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inbox } from '../../inboxes/entities/inbox.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
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

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  inboxId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: UseCase,
    default: UseCase.OTHER,
  })
  useCase: UseCase;

  @Column({ type: 'text', nullable: true })
  messageContent: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  tcrStatus: ApprovalStatus;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  bandwidthStatus: ApprovalStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tcrBrandId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tcrCampaignId: string;

  @Column({ type: 'json', nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  bandwidthResponse: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  tcrSubmittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  tcrApprovedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bandwidthApprovedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  compliance: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox: Inbox;

  // Helper methods
  get isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }

  get isApproved(): boolean {
    return (
      this.tcrStatus === ApprovalStatus.APPROVED &&
      this.bandwidthStatus === ApprovalStatus.APPROVED
    );
  }

  get isPending(): boolean {
    return this.status === CampaignStatus.PENDING_APPROVAL;
  }

  get isRejected(): boolean {
    return (
      this.tcrStatus === ApprovalStatus.REJECTED ||
      this.bandwidthStatus === ApprovalStatus.REJECTED
    );
  }

  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  get canSendMessages(): boolean {
    return this.isActive && this.isApproved && !this.isExpired;
  }

  get approvalProgress(): number {
    if (this.isApproved) return 100;
    if (
      this.tcrStatus === ApprovalStatus.APPROVED &&
      this.bandwidthStatus === ApprovalStatus.PENDING
    )
      return 50;
    if (this.tcrStatus === ApprovalStatus.PENDING) return 25;
    return 0;
  }

  get daysUntilExpiry(): number {
    if (!this.expiresAt) return -1;
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isExpiringSoon(): boolean {
    const days = this.daysUntilExpiry;
    return days >= 0 && days <= 30;
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

  get requiresBandwidthApproval(): boolean {
    return true; // All campaigns require Bandwidth approval
  }
}
