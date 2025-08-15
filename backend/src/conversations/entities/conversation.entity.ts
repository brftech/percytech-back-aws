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
import { Person } from "../../persons/entities/person.entity";
import { Message } from "../../messages/entities/message.entity";

export enum ConversationStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  SPAM = "spam",
  RESOLVED = "resolved",
}

@Entity("conversations")
@Index(["inboxId", "personId"], { unique: true })
@Index(["status", "lastMessageAt"])
@Index(["inboxId", "lastMessageAt"])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "bigint" })
  personId: number;

  @Column({
    type: "enum",
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  title: string;

  @Column({ type: "text", nullable: true })
  summary: string;

  @Column({ type: "json", nullable: true })
  tags: string[];

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;

  @Column({ type: "timestamp", nullable: true })
  lastMessageAt: Date;

  @Column({ type: "timestamp", nullable: true })
  resolvedAt: Date;

  @Column({ type: "bigint", default: 0 })
  messageCount: number;

  @Column({ type: "boolean", default: false })
  isUnread: boolean;

  @Column({ type: "boolean", default: false })
  isPinned: boolean;

  @Column({ type: "timestamp", nullable: true })
  snoozedUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.conversations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  @ManyToOne(() => Person, (person) => person.conversations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "personId" })
  person: Person;

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  // Helper methods
  get isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }

  get isArchived(): boolean {
    return this.status === ConversationStatus.ARCHIVED;
  }

  get isSpam(): boolean {
    return this.status === ConversationStatus.SPAM;
  }

  get isResolved(): boolean {
    return this.status === ConversationStatus.RESOLVED;
  }

  get isSnoozed(): boolean {
    return this.snoozedUntil && new Date() < this.snoozedUntil;
  }

  get lastMessage(): Message | undefined {
    if (!this.messages || this.messages.length === 0) return undefined;
    return this.messages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }

  get unreadCount(): number {
    if (!this.messages) return 0;
    return this.messages.filter(
      (msg) => !msg.isRead && msg.direction === "inbound"
    ).length;
  }

  get hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }

  get conversationPreview(): string {
    if (!this.lastMessage) return "";
    const message = this.lastMessage.body;
    return message.length > 100 ? message.substring(0, 100) + "..." : message;
  }

  get daysSinceLastMessage(): number {
    if (!this.lastMessageAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastMessageAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isStale(): boolean {
    return this.daysSinceLastMessage > 30;
  }

  markAsRead(): void {
    this.isUnread = false;
    this.messages?.forEach((msg) => {
      if (msg.direction === "inbound") {
        msg.isRead = true;
      }
    });
  }

  addMessage(message: Message): void {
    this.messageCount++;
    this.lastMessageAt = message.createdAt;
    this.isUnread = message.direction === "inbound";
  }

  archive(): void {
    this.status = ConversationStatus.ARCHIVED;
  }

  markAsSpam(): void {
    this.status = ConversationStatus.SPAM;
  }

  resolve(): void {
    this.status = ConversationStatus.RESOLVED;
    this.resolvedAt = new Date();
  }

  pin(): void {
    this.isPinned = true;
  }

  unpin(): void {
    this.isPinned = false;
  }

  snooze(until: Date): void {
    this.snoozedUntil = until;
  }

  unsnooze(): void {
    this.snoozedUntil = null;
  }

  get displayTitle(): string {
    if (this.title) return this.title;
    if (this.person) return this.person.fullName;
    return `Conversation ${this.id}`;
  }
}
