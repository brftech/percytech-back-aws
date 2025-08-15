import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Inbox } from '../../inboxes/entities/inbox.entity';

@Entity('inbox_settings')
export class InboxSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true })
  inboxId: number;

  @Column({ type: 'boolean', default: true })
  autoReply: boolean;

  @Column({ type: 'text', nullable: true })
  autoReplyMessage: string;

  @Column({ type: 'boolean', default: false })
  businessHoursOnly: boolean;

  @Column({ type: 'json', nullable: true })
  businessHours: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };

  @Column({ type: 'boolean', default: false })
  afterHoursAutoReply: boolean;

  @Column({ type: 'text', nullable: true })
  afterHoursMessage: string;

  @Column({ type: 'boolean', default: true })
  allowInbound: boolean;

  @Column({ type: 'boolean', default: true })
  allowOutbound: boolean;

  @Column({ type: 'boolean', default: false })
  requireOptIn: boolean;

  @Column({ type: 'text', nullable: true })
  optInMessage: string;

  @Column({ type: 'text', nullable: true })
  optOutMessage: string;

  @Column({ type: 'json', nullable: true })
  notificationSettings: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    webhookUrl: string;
  };

  @Column({ type: 'json', nullable: true })
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    tcr: boolean;
    custom: Record<string, any>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Inbox, (inbox) => inbox.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox: Inbox;

  // Helper methods
  get isBusinessHours(): boolean {
    if (!this.businessHoursOnly) return true;

    const now = new Date();
    const day = now
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    const time = now.toLocaleTimeString('en-US', { hour12: false });

    const hours = this.businessHours?.[day];
    if (!hours?.enabled) return false;

    return time >= hours.start && time <= hours.end;
  }

  get shouldSendAfterHoursReply(): boolean {
    return this.afterHoursAutoReply && !this.isBusinessHours;
  }

  get canReceiveMessages(): boolean {
    return this.allowInbound;
  }

  get canSendMessages(): boolean {
    return this.allowOutbound;
  }

  get isHIPAACompliant(): boolean {
    return this.compliance?.hipaa || false;
  }

  get isGDPRCompliant(): boolean {
    return this.compliance?.gdpr || false;
  }

  get isTCRCompliant(): boolean {
    return this.compliance?.tcr || false;
  }
}
