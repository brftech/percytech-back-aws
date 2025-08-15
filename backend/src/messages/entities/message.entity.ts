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
import { Conversation } from "../../conversations/entities/conversation.entity";
import { Person } from "../../persons/entities/person.entity";
import { gPhone } from "../../g-phones/entities/g-phone.entity";
import { Broadcast } from "../../broadcasts/entities/broadcast.entity";

export enum MessageDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  READ = "read",
}

export enum MessageType {
  SMS = "sms",
  MMS = "mms",
  VOICE = "voice",
}

@Entity("messages")
@Index(["conversationId", "createdAt"])
@Index(["personId", "createdAt"])
@Index(["gPhoneId", "createdAt"])
@Index(["direction", "status"])
@Index(["createdAt"])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  conversationId: number;

  @Column({ type: "bigint" })
  personId: number;

  @Column({ type: "bigint", nullable: true })
  gPhoneId: number; // Phone number used for outbound messages

  @Column({ type: "bigint", nullable: true })
  broadcastId: number; // Broadcast this message belongs to

  @Column({ type: "text" })
  body: string; // Message content

  @Column({
    type: "enum",
    enum: MessageDirection,
  })
  direction: MessageDirection;

  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.SMS,
  })
  type: MessageType;

  @Column({
    type: "enum",
    enum: MessageStatus,
    default: MessageStatus.PENDING,
  })
  status: MessageStatus;

  @Column({ type: "varchar", length: 20 })
  fromNumber: string; // Sender phone number

  @Column({ type: "varchar", length: 20 })
  toNumber: string; // Recipient phone number

  @Column({ type: "boolean", default: false })
  isRead: boolean; // Has recipient read the message

  @Column({ type: "timestamp", nullable: true })
  readAt: Date; // When message was read

  @Column({ type: "timestamp", nullable: true })
  sentAt: Date; // When message was sent

  @Column({ type: "timestamp", nullable: true })
  deliveredAt: Date; // When message was delivered

  @Column({ type: "timestamp", nullable: true })
  failedAt: Date; // When message failed

  @Column({ type: "varchar", length: 255, nullable: true })
  failureReason: string; // Why message failed

  @Column({ type: "int", default: 0 })
  retryCount: number; // Number of retry attempts

  @Column({ type: "json", nullable: true })
  mediaUrls: string[]; // URLs for MMS media

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>; // Additional message metadata

  @Column({ type: "json", nullable: true })
  apiResponse: Record<string, any>; // API response from SMS provider

  @Column({ type: "varchar", length: 255, nullable: true })
  messageId: string; // External message ID from SMS provider

  @Column({ type: "varchar", length: 255, nullable: true })
  externalConversationId: string; // External conversation ID

  @Column({ type: "boolean", default: false })
  isAutomated: boolean; // Is this an automated message

  @Column({ type: "varchar", length: 255, nullable: true })
  templateId: string; // Message template ID if applicable

  @Column({ type: "json", nullable: true })
  variables: Record<string, any>; // Template variables

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "conversationId" })
  conversation: Conversation;

  @ManyToOne(() => Person, (person) => person.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "personId" })
  person: Person;

  @ManyToOne(() => gPhone, (gPhone) => gPhone.messages, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "gPhoneId" })
  gPhone: gPhone;

  @ManyToOne(() => Broadcast, (broadcast) => broadcast.messages, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "broadcastId" })
  broadcast: Broadcast;

  // Helper methods
  get isInbound(): boolean {
    return this.direction === MessageDirection.INBOUND;
  }

  get isOutbound(): boolean {
    return this.direction === MessageDirection.OUTBOUND;
  }

  get isSms(): boolean {
    return this.type === MessageType.SMS;
  }

  get isMms(): boolean {
    return this.type === MessageType.MMS;
  }

  get isVoice(): boolean {
    return this.type === MessageType.VOICE;
  }

  get isPending(): boolean {
    return this.status === MessageStatus.PENDING;
  }

  get isSent(): boolean {
    return this.status === MessageStatus.SENT;
  }

  get isDelivered(): boolean {
    return this.status === MessageStatus.DELIVERED;
  }

  get isFailed(): boolean {
    return this.status === MessageStatus.FAILED;
  }

  get isMessageRead(): boolean {
    return this.isRead;
  }

  get hasMedia(): boolean {
    return this.mediaUrls && this.mediaUrls.length > 0;
  }

  get mediaCount(): number {
    return this.mediaUrls?.length || 0;
  }

  get isAutomatedMessage(): boolean {
    return this.isAutomated;
  }

  get isTemplateMessage(): boolean {
    return !!this.templateId;
  }

  get hasVariables(): boolean {
    return this.variables && Object.keys(this.variables).length > 0;
  }

  get hasApiResponse(): boolean {
    return !!this.apiResponse && Object.keys(this.apiResponse).length > 0;
  }

  get hasExternalId(): boolean {
    return !!this.messageId;
  }

  get hasExternalConversationId(): boolean {
    return !!this.externalConversationId;
  }

  get formattedFromNumber(): string {
    // Format phone number for display
    const cleaned = this.fromNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    if (cleaned.length === 11 && cleaned[0] === "1") {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7)}`;
    }
    return this.fromNumber;
  }

  get formattedToNumber(): string {
    // Format phone number for display
    const cleaned = this.toNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    if (cleaned.length === 11 && cleaned[0] === "1") {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7)}`;
    }
    return this.toNumber;
  }

  get conversationTitle(): string {
    return this.conversation?.displayTitle || "Unknown Conversation";
  }

  get personName(): string {
    return this.person?.displayName || "Unknown Person";
  }

  get inboxName(): string {
    return this.conversation?.inbox?.name || "Unknown Inbox";
  }

  get companyName(): string {
    return this.conversation?.inbox?.companyName || "Unknown Company";
  }

  get brandName(): string {
    return this.conversation?.inbox?.brandName || "Unknown Brand";
  }

  get platformType(): string {
    return this.conversation?.inbox?.platformType || "unknown";
  }

  get gPhoneNumber(): string {
    return this.gPhone?.formattedNumber || "Unknown Phone";
  }

  // Status management
  markAsSent(): void {
    this.status = MessageStatus.SENT;
    this.sentAt = new Date();
  }

  markAsDelivered(): void {
    this.status = MessageStatus.DELIVERED;
    this.deliveredAt = new Date();
  }

  markAsFailed(reason?: string): void {
    this.status = MessageStatus.FAILED;
    this.failedAt = new Date();
    if (reason) {
      this.failureReason = reason;
    }
  }

  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }

  markAsUnread(): void {
    this.isRead = false;
    this.readAt = null;
  }

  // Retry management
  incrementRetryCount(): void {
    this.retryCount++;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }

  get canRetry(): boolean {
    return this.retryCount < 3; // Max 3 retries
  }

  // Media management
  addMedia(url: string): void {
    if (!this.mediaUrls) this.mediaUrls = [];
    if (!this.mediaUrls.includes(url)) {
      this.mediaUrls.push(url);
    }
  }

  removeMedia(url: string): void {
    if (this.mediaUrls) {
      this.mediaUrls = this.mediaUrls.filter((u) => u !== url);
    }
  }

  // Template management
  setTemplate(templateId: string, variables?: Record<string, any>): void {
    this.templateId = templateId;
    if (variables) {
      this.variables = variables;
    }
  }

  clearTemplate(): void {
    this.templateId = null;
    this.variables = null;
  }

  // API response management
  setApiResponse(response: Record<string, any>): void {
    this.apiResponse = response;
  }

  setExternalId(messageId: string, conversationId?: string): void {
    this.messageId = messageId;
    if (conversationId) {
      this.externalConversationId = conversationId;
    }
  }

  // Message content helpers
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
}
