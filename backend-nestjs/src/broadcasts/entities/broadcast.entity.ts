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
import { Campaign } from '../../campaigns/entities/campaign.entity';

export enum BroadcastStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BroadcastType {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
  RECURRING = 'recurring',
}

@Entity('broadcasts')
export class Broadcast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  inboxId: number;

  @Column({ type: 'bigint', nullable: true })
  campaignId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: BroadcastType,
    default: BroadcastType.IMMEDIATE,
  })
  type: BroadcastType;

  @Column({
    type: 'enum',
    enum: BroadcastStatus,
    default: BroadcastStatus.DRAFT,
  })
  status: BroadcastStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'bigint', default: 0 })
  totalRecipients: number;

  @Column({ type: 'bigint', default: 0 })
  sentCount: number;

  @Column({ type: 'bigint', default: 0 })
  deliveredCount: number;

  @Column({ type: 'bigint', default: 0 })
  failedCount: number;

  @Column({ type: 'json', nullable: true })
  filters: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox: Inbox;

  @ManyToOne(() => Campaign, (campaign) => campaign.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  // Helper methods
  get isScheduled(): boolean {
    return this.type === BroadcastType.SCHEDULED;
  }

  get isRecurring(): boolean {
    return this.type === BroadcastType.RECURRING;
  }

  get isCompleted(): boolean {
    return this.status === BroadcastStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === BroadcastStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === BroadcastStatus.CANCELLED;
  }

  get successRate(): number {
    if (this.totalRecipients === 0) return 0;
    return (this.deliveredCount / this.totalRecipients) * 100;
  }

  get failureRate(): number {
    if (this.totalRecipients === 0) return 0;
    return (this.failedCount / this.totalRecipients) * 100;
  }

  get isOverdue(): boolean {
    if (!this.scheduledAt) return false;
    return new Date() > this.scheduledAt;
  }

  get daysUntilScheduled(): number {
    if (!this.scheduledAt) return -1;
    const now = new Date();
    const scheduled = new Date(this.scheduledAt);
    const diffTime = scheduled.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
