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
import { Conversation } from "../../conversations/entities/conversation.entity";
import { Message } from "../../messages/entities/message.entity";
import { BroadcastRecipient } from "../../broadcasts/entities/broadcast-recipient.entity";

export enum PersonStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
  SPAM = "spam",
}

export enum PersonType {
  CUSTOMER = "customer",
  LEAD = "lead",
  PARTNER = "partner",
  VENDOR = "vendor",
  OTHER = "other",
}

@Entity("persons")
@Index(["inboxId", "cell_phone"], { unique: true })
@Index(["status", "lastContactAt"])
@Index(["inboxId", "status"])
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "varchar", length: 20 })
  cell_phone: string; // Primary contact method

  @Column({ type: "varchar", length: 255, nullable: true })
  firstName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  lastName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @Column({
    type: "enum",
    enum: PersonType,
    default: PersonType.CUSTOMER,
  })
  type: PersonType;

  @Column({
    type: "enum",
    enum: PersonStatus,
    default: PersonStatus.ACTIVE,
  })
  status: PersonStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  company: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  title: string;

  @Column({ type: "json", nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: "date", nullable: true })
  birthDate: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  language: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  timeZone: string;

  @Column({ type: "boolean", default: true })
  optIn: boolean; // SMS opt-in status

  @Column({ type: "timestamp", nullable: true })
  optInDate: Date;

  @Column({ type: "timestamp", nullable: true })
  optOutDate: Date;

  @Column({ type: "timestamp", nullable: true })
  lastContactAt: Date;

  @Column({ type: "bigint", default: 0 })
  messageCount: number;

  @Column({ type: "bigint", default: 0 })
  inboundMessageCount: number;

  @Column({ type: "bigint", default: 0 })
  outboundMessageCount: number;

  @Column({ type: "json", nullable: true })
  customFields: Record<string, any>; // Custom person-specific fields

  @Column({ type: "json", nullable: true })
  tags: string[]; // Tags for categorization

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.persons, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  @OneToMany(() => Conversation, (conversation) => conversation.person)
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.person)
  messages: Message[];

  @OneToMany(() => BroadcastRecipient, (recipient) => recipient.person)
  broadcastRecipients: BroadcastRecipient[];

  // Helper methods
  get isActive(): boolean {
    return this.status === PersonStatus.ACTIVE;
  }

  get isInactive(): boolean {
    return this.status === PersonStatus.INACTIVE;
  }

  get isBlocked(): boolean {
    return this.status === PersonStatus.BLOCKED;
  }

  get isSpam(): boolean {
    return this.status === PersonStatus.SPAM;
  }

  get isOptedIn(): boolean {
    return this.optIn;
  }

  get isOptedOut(): boolean {
    return !this.optIn;
  }

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    return "Unknown Person";
  }

  get displayName(): string {
    if (this.fullName !== "Unknown Person") return this.fullName;
    if (this.company) return this.company;
    return this.cell_phone;
  }

  get hasEmail(): boolean {
    return !!this.email;
  }

  get hasCompany(): boolean {
    return !!this.company;
  }

  get hasAddress(): boolean {
    return !!this.address;
  }

  get fullAddress(): string {
    if (!this.address) return "";
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
  }

  get formattedPhone(): string {
    // Format phone number for display
    const cleaned = this.cell_phone.replace(/\D/g, "");
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
    return this.cell_phone;
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

  get activeConversations(): Conversation[] {
    return this.conversations?.filter((conv) => conv.isActive) || [];
  }

  get unreadConversations(): Conversation[] {
    return this.conversations?.filter((conv) => conv.isUnread) || [];
  }

  get unreadCount(): number {
    return this.unreadConversations.length;
  }

  get hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }

  get lastMessage(): Message | undefined {
    if (!this.messages || this.messages.length === 0) return undefined;
    return this.messages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }

  get daysSinceLastContact(): number {
    if (!this.lastContactAt) return -1;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastContactAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isRecentlyContacted(): boolean {
    const daysSince = this.daysSinceLastContact;
    return daysSince >= 0 && daysSince <= 7;
  }

  get isStale(): boolean {
    const daysSince = this.daysSinceLastContact;
    return daysSince > 30;
  }

  // Status management
  activate(): void {
    this.status = PersonStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = PersonStatus.INACTIVE;
  }

  block(): void {
    this.status = PersonStatus.BLOCKED;
  }

  markAsSpam(): void {
    this.status = PersonStatus.SPAM;
  }

  // Opt-in management
  optInSms(): void {
    this.optIn = true;
    this.optInDate = new Date();
    this.optOutDate = null;
  }

  optOutSms(): void {
    this.optIn = false;
    this.optOutDate = new Date();
  }

  // Contact tracking
  updateLastContact(): void {
    this.lastContactAt = new Date();
  }

  incrementMessageCount(direction: "inbound" | "outbound"): void {
    this.messageCount++;
    if (direction === "inbound") {
      this.inboundMessageCount++;
    } else {
      this.outboundMessageCount++;
    }
    this.updateLastContact();
  }

  // Tag management
  addTag(tag: string): void {
    if (!this.tags) this.tags = [];
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter((t) => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  // Custom fields
  setCustomField(key: string, value: any): void {
    if (!this.customFields) this.customFields = {};
    this.customFields[key] = value;
  }

  getCustomField(key: string): any {
    return this.customFields?.[key];
  }

  removeCustomField(key: string): void {
    if (this.customFields) {
      delete this.customFields[key];
    }
  }
}
