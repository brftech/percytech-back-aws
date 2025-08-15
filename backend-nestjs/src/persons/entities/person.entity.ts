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

export enum PersonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  SPAM = 'spam',
}

export enum PersonType {
  CUSTOMER = 'customer',
  LEAD = 'lead',
  PARTNER = 'partner',
  EMPLOYEE = 'employee',
  OTHER = 'other',
}

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  inboxId: number;

  @Column({ type: 'varchar', length: 20 })
  cell_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: PersonType,
    default: PersonType.CUSTOMER,
  })
  type: PersonType;

  @Column({
    type: 'enum',
    enum: PersonStatus,
    default: PersonStatus.ACTIVE,
  })
  status: PersonStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timeZone: string;

  @Column({ type: 'boolean', default: true })
  optIn: boolean;

  @Column({ type: 'timestamp', nullable: true })
  optInDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  optOutDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastContactAt: Date;

  @Column({ type: 'bigint', default: 0 })
  messageCount: number;

  @Column({ type: 'bigint', default: 0 })
  inboundMessageCount: number;

  @Column({ type: 'bigint', default: 0 })
  outboundMessageCount: number;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

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
    return this.optIn && !this.optOutDate;
  }

  get isOptedOut(): boolean {
    return this.optOutDate !== null && this.optOutDate !== undefined;
  }

  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    return this.cell_phone;
  }

  get displayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (this.firstName) return this.firstName;
    if (this.lastName) return this.lastName;
    if (this.company) return this.company;
    return this.cell_phone;
  }

  get hasEmail(): boolean {
    return this.email !== null && this.email !== undefined;
  }

  get hasCompany(): boolean {
    return this.company !== null && this.company !== undefined;
  }

  get hasAddress(): boolean {
    return this.address && Object.keys(this.address).length > 0;
  }

  get fullAddress(): string {
    if (!this.hasAddress) return '';
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
  }

  get formattedPhone(): string {
    if (!this.cell_phone) return '';
    const cleaned = this.cell_phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return this.cell_phone;
  }

  get inboxName(): string {
    return this.inbox?.name || 'Unknown Inbox';
  }

  get companyName(): string {
    return this.company || 'No Company';
  }

  get brandName(): string {
    return this.inbox?.brand?.name || 'No Brand';
  }

  get platformType(): string {
    return this.inbox?.company?.platform?.type || 'Unknown';
  }

  get activeConversations(): any[] {
    // This would be populated by a relationship to conversations
    return [];
  }

  get unreadConversations(): any[] {
    // This would be populated by a relationship to conversations
    return [];
  }

  get unreadCount(): number {
    // This would be calculated from unread conversations
    return 0;
  }

  get hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }

  get lastMessage(): any {
    // This would be populated by a relationship to messages
    return undefined;
  }

  get daysSinceLastContact(): number {
    if (!this.lastContactAt) return -1;
    const now = new Date();
    const lastContact = new Date(this.lastContactAt);
    const diffTime = now.getTime() - lastContact.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isRecentlyContacted(): boolean {
    const days = this.daysSinceLastContact;
    return days >= 0 && days <= 7;
  }

  get isStale(): boolean {
    const days = this.daysSinceLastContact;
    return days > 30;
  }
}
