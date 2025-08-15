import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Inbox } from "../../inboxes/entities/inbox.entity";
import { User } from "../../users/entities/user.entity";
import { Message } from "../../messages/entities/message.entity";
import { BroadcastRecipient } from "./broadcast-recipient.entity";

export enum BroadcastStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  SENDING = "sending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum BroadcastType {
  IMMEDIATE = "immediate",
  SCHEDULED = "scheduled",
  RECURRING = "recurring",
}

@Entity("broadcasts")
@Index(["inboxId", "status"])
@Index(["senderId", "createdAt"])
@Index(["scheduledAt", "status"])
export class Broadcast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "bigint" })
  senderId: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  body: string;

  @Column({
    type: "enum",
    enum: BroadcastType,
    default: BroadcastType.IMMEDIATE,
  })
  type: BroadcastType;

  @Column({
    type: "enum",
    enum: BroadcastStatus,
    default: BroadcastStatus.DRAFT,
  })
  status: BroadcastStatus;

  @Column({ type: "timestamp", nullable: true })
  scheduledAt: Date; // When to send (for scheduled broadcasts)

  @Column({ type: "timestamp", nullable: true })
  sentAt: Date; // When broadcast was sent

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date; // When broadcast completed

  @Column({ type: "json" })
  searchCriteria: Record<string, any>; // Criteria for selecting recipients

  @Column({ type: "json", nullable: true })
  recipientGroups: string[]; // Specific groups to target

  @Column({ type: "bigint", default: 0 })
  totalRecipients: number; // Total number of recipients

  @Column({ type: "bigint", default: 0 })
  sentCount: number; // Number of messages sent

  @Column({ type: "bigint", default: 0 })
  deliveredCount: number; // Number of messages delivered

  @Column({ type: "bigint", default: 0 })
  failedCount: number; // Number of messages that failed

  @Column({ type: "bigint", default: 0 })
  readCount: number; // Number of messages read

  @Column({ type: "json", nullable: true })
  mediaUrls: string[]; // URLs for MMS media

  @Column({ type: "boolean", default: false })
  isMms: boolean; // Is this an MMS broadcast

  @Column({ type: "int", default: 1 })
  segmentCount: number; // Number of SMS segments

  @Column({ type: "json", nullable: true })
  templateData: Record<string, any>; // Template variables

  @Column({ type: "varchar", length: 255, nullable: true })
  templateId: string; // Message template ID

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>; // Broadcast-specific settings

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.broadcasts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  @ManyToOne(() => User, (user) => user.broadcasts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "senderId" })
  sender: User;

  @OneToMany(() => Message, (message) => message.broadcast)
  messages: Message[];

  @OneToMany(() => BroadcastRecipient, (recipient) => recipient.broadcast)
  recipients: BroadcastRecipient[];

  // Helper methods
  get isDraft(): boolean {
    return this.status === BroadcastStatus.DRAFT;
  }

  get isScheduled(): boolean {
    return this.status === BroadcastStatus.SCHEDULED;
  }

  get isSending(): boolean {
    return this.status === BroadcastStatus.SENDING;
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

  get isImmediate(): boolean {
    return this.type === BroadcastType.IMMEDIATE;
  }

  get isRecurring(): boolean {
    return this.type === BroadcastType.RECURRING;
  }

  get hasMedia(): boolean {
    return this.mediaUrls && this.mediaUrls.length > 0;
  }

  get mediaCount(): number {
    return this.mediaUrls?.length || 0;
  }

  get isTemplateBased(): boolean {
    return !!this.templateId;
  }

  get hasVariables(): boolean {
    return this.templateData && Object.keys(this.templateData).length > 0;
  }

  get successRate(): number {
    if (this.totalRecipients === 0) return 0;
    return (this.deliveredCount / this.totalRecipients) * 100;
  }

  get failureRate(): number {
    if (this.totalRecipients === 0) return 0;
    return (this.failedCount / this.totalRecipients) * 100;
  }

  get readRate(): number {
    if (this.deliveredCount === 0) return 0;
    return (this.readCount / this.deliveredCount) * 100;
  }

  get isOverdue(): boolean {
    if (!this.scheduledAt) return false;
    return (
      new Date() > this.scheduledAt && this.status === BroadcastStatus.SCHEDULED
    );
  }

  get isReadyToSend(): boolean {
    if (this.isImmediate) {
      return this.status === BroadcastStatus.DRAFT;
    }
    if (this.isScheduled) {
      return (
        this.status === BroadcastStatus.SCHEDULED &&
        new Date() >= this.scheduledAt
      );
    }
    return false;
  }

  get inboxName(): string {
    return this.inbox?.name || "Unknown Inbox";
  }

  get companyName(): string {
    return this.inbox?.companyName || "Unknown Company";
  }

  get brandName(): string {
    return this.inbox?.brandName || "Unknown Brand";
  }

  get platformType(): string {
    return this.inbox?.platformType || "unknown";
  }

  get senderName(): string {
    return this.sender?.username || "Unknown User";
  }

  // Status management
  schedule(scheduledAt: Date): void {
    this.type = BroadcastType.SCHEDULED;
    this.scheduledAt = scheduledAt;
    this.status = BroadcastStatus.SCHEDULED;
  }

  startSending(): void {
    this.status = BroadcastStatus.SENDING;
  }

  markAsSent(): void {
    this.status = BroadcastStatus.COMPLETED;
    this.sentAt = new Date();
    this.completedAt = new Date();
  }

  markAsFailed(): void {
    this.status = BroadcastStatus.FAILED;
    this.completedAt = new Date();
  }

  cancel(): void {
    this.status = BroadcastStatus.CANCELLED;
  }

  // Recipient management
  setTotalRecipients(count: number): void {
    this.totalRecipients = count;
  }

  incrementSentCount(): void {
    this.sentCount++;
  }

  incrementDeliveredCount(): void {
    this.deliveredCount++;
  }

  incrementFailedCount(): void {
    this.failedCount++;
  }

  incrementReadCount(): void {
    this.readCount++;
  }

  // Media management
  addMedia(url: string): void {
    if (!this.mediaUrls) this.mediaUrls = [];
    if (!this.mediaUrls.includes(url)) {
      this.mediaUrls.push(url);
    }
    this.isMms = true;
  }

  removeMedia(url: string): void {
    if (this.mediaUrls) {
      this.mediaUrls = this.mediaUrls.filter((u) => u !== url);
    }
    this.isMms = this.mediaUrls && this.mediaUrls.length > 0;
  }

  // Template management
  setTemplate(templateId: string, variables?: Record<string, any>): void {
    this.templateId = templateId;
    if (variables) {
      this.templateData = variables;
    }
  }

  clearTemplate(): void {
    this.templateId = null;
    this.templateData = null;
  }

  // Search criteria management
  setSearchCriteria(criteria: Record<string, any>): void {
    this.searchCriteria = criteria;
  }

  addRecipientGroup(group: string): void {
    if (!this.recipientGroups) this.recipientGroups = [];
    if (!this.recipientGroups.includes(group)) {
      this.recipientGroups.push(group);
    }
  }

  removeRecipientGroup(group: string): void {
    if (this.recipientGroups) {
      this.recipientGroups = this.recipientGroups.filter((g) => g !== group);
    }
  }

  // Content helpers
  get preview(): string {
    if (this.body.length <= 100) return this.body;
    return this.body.substring(0, 100) + "...";
  }

  get wordCount(): number {
    return this.body.split(/\s+/).length;
  }

  get characterCount(): number {
    return this.body.length;
  }

  get estimatedSegments(): number {
    // SMS segment calculation (160 chars per segment)
    return Math.ceil(this.characterCount / 160);
  }

  get isLongMessage(): boolean {
    return this.estimatedSegments > 1;
  }

  // Compliance helpers
  get requiresCompliance(): boolean {
    return this.inbox?.requiresCompliance || false;
  }

  get complianceLevel(): string {
    return this.inbox?.complianceLevel || "standard";
  }

  get isHighlyRegulated(): boolean {
    return this.complianceLevel === "highly-regulated";
  }

  get isHealthcare(): boolean {
    return this.complianceLevel === "healthcare";
  }
}
