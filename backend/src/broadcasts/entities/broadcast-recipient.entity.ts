import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Broadcast } from "./broadcast.entity";
import { Person } from "../../persons/entities/person.entity";

export enum RecipientStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  READ = "read",
  OPTED_OUT = "opted_out",
}

@Entity("broadcast_recipients")
@Index(["broadcastId", "personId"], { unique: true })
@Index(["broadcastId", "status"])
@Index(["personId", "status"])
export class BroadcastRecipient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  broadcastId: number;

  @Column({ type: "bigint" })
  personId: number;

  @Column({
    type: "enum",
    enum: RecipientStatus,
    default: RecipientStatus.PENDING,
  })
  status: RecipientStatus;

  @Column({ type: "timestamp", nullable: true })
  sentAt: Date; // When message was sent to this recipient

  @Column({ type: "timestamp", nullable: true })
  deliveredAt: Date; // When message was delivered to this recipient

  @Column({ type: "timestamp", nullable: true })
  readAt: Date; // When message was read by this recipient

  @Column({ type: "timestamp", nullable: true })
  failedAt: Date; // When message failed for this recipient

  @Column({ type: "varchar", length: 255, nullable: true })
  failureReason: string; // Why message failed for this recipient

  @Column({ type: "int", default: 0 })
  retryCount: number; // Number of retry attempts for this recipient

  @Column({ type: "varchar", length: 255, nullable: true })
  messageId: string; // External message ID from SMS provider

  @Column({ type: "json", nullable: true })
  apiResponse: Record<string, any>; // API response for this recipient

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>; // Additional metadata for this recipient

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Broadcast, (broadcast) => broadcast.recipients, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "broadcastId" })
  broadcast: Broadcast;

  @ManyToOne(() => Person, (person) => person.broadcastRecipients, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "personId" })
  person: Person;

  // Helper methods
  get isPending(): boolean {
    return this.status === RecipientStatus.PENDING;
  }

  get isSent(): boolean {
    return this.status === RecipientStatus.SENT;
  }

  get isDelivered(): boolean {
    return this.status === RecipientStatus.DELIVERED;
  }

  get isFailed(): boolean {
    return this.status === RecipientStatus.FAILED;
  }

  get isRead(): boolean {
    return this.status === RecipientStatus.READ;
  }

  get isOptedOut(): boolean {
    return this.status === RecipientStatus.OPTED_OUT;
  }

  get hasBeenSent(): boolean {
    return this.isSent || this.isDelivered || this.isRead;
  }

  get hasBeenDelivered(): boolean {
    return this.isDelivered || this.isRead;
  }

  get hasFailed(): boolean {
    return this.isFailed;
  }

  get canRetry(): boolean {
    return this.retryCount < 3; // Max 3 retries
  }

  get hasApiResponse(): boolean {
    return !!this.apiResponse && Object.keys(this.apiResponse).length > 0;
  }

  get hasExternalId(): boolean {
    return !!this.messageId;
  }

  get personName(): string {
    return this.person?.displayName || "Unknown Person";
  }

  get personPhone(): string {
    return this.person?.formattedPhone || "Unknown Phone";
  }

  get broadcastTitle(): string {
    return this.broadcast?.title || "Unknown Broadcast";
  }

  get inboxName(): string {
    return this.broadcast?.inboxName || "Unknown Inbox";
  }

  get companyName(): string {
    return this.broadcast?.companyName || "Unknown Company";
  }

  get brandName(): string {
    return this.broadcast?.brandName || "Unknown Brand";
  }

  get platformType(): string {
    return this.broadcast?.platformType || "unknown";
  }

  // Status management
  markAsSent(): void {
    this.status = RecipientStatus.SENT;
    this.sentAt = new Date();
  }

  markAsDelivered(): void {
    this.status = RecipientStatus.DELIVERED;
    this.deliveredAt = new Date();
  }

  markAsRead(): void {
    this.status = RecipientStatus.READ;
    this.readAt = new Date();
  }

  markAsFailed(reason?: string): void {
    this.status = RecipientStatus.FAILED;
    this.failedAt = new Date();
    if (reason) {
      this.failureReason = reason;
    }
  }

  markAsOptedOut(): void {
    this.status = RecipientStatus.OPTED_OUT;
  }

  // Retry management
  incrementRetryCount(): void {
    this.retryCount++;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }

  // API response management
  setApiResponse(response: Record<string, any>): void {
    this.apiResponse = response;
  }

  setExternalId(messageId: string): void {
    this.messageId = messageId;
  }

  // Metadata management
  setMetadata(key: string, value: any): void {
    if (!this.metadata) this.metadata = {};
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  removeMetadata(key: string): void {
    if (this.metadata) {
      delete this.metadata[key];
    }
  }

  // Timing helpers
  get timeToSend(): number {
    if (!this.sentAt || !this.createdAt) return -1;
    return this.sentAt.getTime() - this.createdAt.getTime();
  }

  get timeToDeliver(): number {
    if (!this.deliveredAt || !this.sentAt) return -1;
    return this.deliveredAt.getTime() - this.sentAt.getTime();
  }

  get timeToRead(): number {
    if (!this.readAt || !this.deliveredAt) return -1;
    return this.readAt.getTime() - this.deliveredAt.getTime();
  }

  get totalDeliveryTime(): number {
    if (!this.readAt || !this.createdAt) return -1;
    return this.readAt.getTime() - this.createdAt.getTime();
  }

  // Compliance helpers
  get requiresCompliance(): boolean {
    return this.broadcast?.requiresCompliance || false;
  }

  get complianceLevel(): string {
    return this.broadcast?.complianceLevel || "standard";
  }

  get isHighlyRegulated(): boolean {
    return this.complianceLevel === "highly-regulated";
  }

  get isHealthcare(): boolean {
    return this.complianceLevel === "healthcare";
  }
}
