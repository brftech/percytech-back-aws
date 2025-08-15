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
import { gPhone } from '../../g-phones/entities/g-phone.entity';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum MessageType {
  SMS = 'sms',
  MMS = 'mms',
  VOICE = 'voice',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  personId: number;

  @Column({ type: 'bigint', nullable: true })
  gPhoneId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageDirection,
  })
  direction: MessageDirection;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.PENDING,
  })
  status: MessageStatus;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.SMS,
  })
  type: MessageType;

  @Column({ type: 'varchar', length: 20 })
  fromNumber: string;

  @Column({ type: 'varchar', length: 20 })
  toNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  messageId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'json', nullable: true })
  deliveryReport: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Person, (person) => person.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @ManyToOne(() => gPhone, (gPhone) => gPhone.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gPhoneId' })
  gPhone: gPhone;

  // Helper methods
  get isInbound(): boolean {
    return this.direction === MessageDirection.INBOUND;
  }

  get isOutbound(): boolean {
    return this.direction === MessageDirection.OUTBOUND;
  }

  get isDelivered(): boolean {
    return this.status === MessageStatus.DELIVERED;
  }

  get isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  get isFailed(): boolean {
    return this.status === MessageStatus.FAILED;
  }

  get deliveryTime(): number {
    if (!this.sentAt || !this.deliveredAt) return -1;
    return this.deliveredAt.getTime() - this.sentAt.getTime();
  }

  get readTime(): number {
    if (!this.deliveredAt || !this.readAt) return -1;
    return this.readAt.getTime() - this.deliveredAt.getTime();
  }
}
