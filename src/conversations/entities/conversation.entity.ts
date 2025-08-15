import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from '../../persons/entities/person.entity';
import { Inbox } from '../../inboxes/entities/inbox.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  personId: number;

  @Column({ type: 'bigint' })
  inboxId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ type: 'bigint', default: 0 })
  messageCount: number;

  @Column({ type: 'bigint', default: 0 })
  unreadCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Person, (person) => person.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @ManyToOne(() => Inbox, (inbox) => inbox.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox: Inbox;

  // Helper methods
  get isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }

  get isArchived(): boolean {
    return this.status === ConversationStatus.ARCHIVED;
  }

  get isClosed(): boolean {
    return this.status === ConversationStatus.CLOSED;
  }

  get hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }

  get daysSinceLastMessage(): number {
    if (!this.lastMessageAt) return -1;
    const now = new Date();
    const lastMessage = new Date(this.lastMessageAt);
    const diffTime = now.getTime() - lastMessage.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isRecentlyActive(): boolean {
    const days = this.daysSinceLastMessage;
    return days >= 0 && days <= 7;
  }

  get isStale(): boolean {
    const days = this.daysSinceLastMessage;
    return days > 30;
  }
}
