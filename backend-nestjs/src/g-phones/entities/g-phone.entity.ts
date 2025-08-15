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

export enum gPhoneStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  IN_USE = 'in_use',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

export enum gPhoneType {
  LOCAL = 'local',
  TOLL_FREE = 'toll_free',
  SHORT_CODE = 'short_code',
  INTERNATIONAL = 'international',
}

@Entity('g_phones')
export class gPhone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  inboxId: number;

  @Column({ type: 'bigint', nullable: true })
  campaignId: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: gPhoneType,
    default: gPhoneType.LOCAL,
  })
  type: gPhoneType;

  @Column({
    type: 'enum',
    enum: gPhoneStatus,
    default: gPhoneStatus.AVAILABLE,
  })
  status: gPhoneStatus;

  @Column({ type: 'boolean', default: false })
  isAssigned: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  areaCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country: string;

  @Column({ type: 'json', nullable: true })
  bandwidthData: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

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
  get isAvailable(): boolean {
    return this.status === gPhoneStatus.AVAILABLE;
  }

  get isInUse(): boolean {
    return this.status === gPhoneStatus.IN_USE;
  }

  get isAssignedToCampaign(): boolean {
    return this.campaignId !== null && this.campaignId !== undefined;
  }

  get canReceiveMessages(): boolean {
    return (
      this.status === gPhoneStatus.IN_USE ||
      this.status === gPhoneStatus.ASSIGNED
    );
  }

  get canSendMessages(): boolean {
    return this.isAssignedToCampaign && this.campaign?.canSendMessages;
  }

  get isLocal(): boolean {
    return this.type === gPhoneType.LOCAL;
  }

  get isTollFree(): boolean {
    return this.type === gPhoneType.TOLL_FREE;
  }

  get isShortCode(): boolean {
    return this.type === gPhoneType.SHORT_CODE;
  }

  get isInternational(): boolean {
    return this.type === gPhoneType.INTERNATIONAL;
  }

  get formattedNumber(): string {
    if (!this.phoneNumber) return '';
    const cleaned = this.phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return this.phoneNumber;
  }

  get locationInfo(): string {
    const parts: string[] = [];
    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.country) parts.push(this.country);
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  }

  get daysSinceAssignment(): number {
    if (!this.assignedAt) return -1;
    const now = new Date();
    const assigned = new Date(this.assignedAt);
    const diffTime = now.getTime() - assigned.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get daysSinceLastUse(): number {
    if (!this.lastUsedAt) return -1;
    const now = new Date();
    const lastUsed = new Date(this.lastUsedAt);
    const diffTime = now.getTime() - lastUsed.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isRecentlyUsed(): boolean {
    const days = this.daysSinceLastUse;
    return days >= 0 && days <= 7;
  }

  get isStale(): boolean {
    const days = this.daysSinceLastUse;
    return days > 30;
  }

  // Management methods
  assignToCampaign(campaignId: number): void {
    this.campaignId = campaignId;
    this.isAssigned = true;
    this.status = gPhoneStatus.ASSIGNED;
    this.assignedAt = new Date();
  }

  unassignFromCampaign(): void {
    this.campaignId = null as any;
    this.isAssigned = false;
    this.status = gPhoneStatus.AVAILABLE;
    this.assignedAt = null as any;
  }

  markAsInUse(): void {
    this.status = gPhoneStatus.IN_USE;
    this.lastUsedAt = new Date();
  }

  markAsAvailable(): void {
    this.status = gPhoneStatus.AVAILABLE;
  }

  setAsDefault(): void {
    this.isDefault = true;
  }

  removeAsDefault(): void {
    this.isDefault = false;
  }
}
