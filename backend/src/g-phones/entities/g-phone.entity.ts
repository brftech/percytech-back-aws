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
import { Campaign } from "../../campaigns/entities/campaign.entity";
import { Message } from "../../messages/entities/message.entity";

export enum gPhoneStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_APPROVAL = "pending_approval",
}

export enum gPhoneType {
  LOCAL = "local",
  TOLL_FREE = "toll_free",
  INTERNATIONAL = "international",
}

@Entity("g_phones")
@Index(["phoneNumber"], { unique: true })
@Index(["inboxId", "status"])
@Index(["campaignId", "status"])
export class gPhone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "bigint", nullable: true })
  campaignId: number; // Campaign this phone is assigned to

  @Column({ type: "varchar", length: 20, unique: true })
  phoneNumber: string;

  @Column({
    type: "enum",
    enum: gPhoneType,
    default: gPhoneType.LOCAL,
  })
  type: gPhoneType;

  @Column({
    type: "enum",
    enum: gPhoneStatus,
    default: gPhoneStatus.ACTIVE,
  })
  status: gPhoneStatus;

  @Column({ type: "boolean", default: false })
  isAssigned: boolean; // Is assigned to a campaign

  @Column({ type: "boolean", default: false })
  isDefault: boolean; // Is default phone for inbox

  @Column({ type: "varchar", length: 10 })
  areaCode: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  state: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  country: string;

  @Column({ type: "json", nullable: true })
  bandwidthData: Record<string, any>; // Bandwidth API response data

  @Column({ type: "timestamp", nullable: true })
  assignedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date;

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>; // Phone-specific configuration

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.gPhones, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  @ManyToOne(() => Campaign, (campaign) => campaign.gPhones, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "campaignId" })
  campaign: Campaign;

  @OneToMany(() => Message, (message) => message.gPhone)
  messages: Message[];

  // Helper methods
  get isActive(): boolean {
    return this.status === gPhoneStatus.ACTIVE;
  }

  get isInactive(): boolean {
    return this.status === gPhoneStatus.INACTIVE;
  }

  get isSuspended(): boolean {
    return this.status === gPhoneStatus.SUSPENDED;
  }

  get isPendingApproval(): boolean {
    return this.status === gPhoneStatus.PENDING_APPROVAL;
  }

  get isAssignedToCampaign(): boolean {
    return !!this.campaignId && this.isAssigned;
  }

  get isDefaultPhone(): boolean {
    return this.isDefault;
  }

  get hasBandwidthData(): boolean {
    return !!this.bandwidthData && Object.keys(this.bandwidthData).length > 0;
  }

  get isLocal(): boolean {
    return this.type === gPhoneType.LOCAL;
  }

  get isTollFree(): boolean {
    return this.type === gPhoneType.TOLL_FREE;
  }

  get isInternational(): boolean {
    return this.type === gPhoneType.INTERNATIONAL;
  }

  get formattedNumber(): string {
    // Format phone number for display
    const cleaned = this.phoneNumber.replace(/\D/g, "");
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
    return this.phoneNumber;
  }

  get location(): string {
    if (this.city && this.state) {
      return `${this.city}, ${this.state}`;
    }
    if (this.state) {
      return this.state;
    }
    return this.areaCode;
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

  get campaignName(): string {
    return this.campaign?.name || "No Campaign";
  }

  get hasActiveCampaign(): boolean {
    return this.campaign?.isActive || false;
  }

  // Status management
  activate(): void {
    this.status = gPhoneStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = gPhoneStatus.INACTIVE;
  }

  suspend(): void {
    this.status = gPhoneStatus.SUSPENDED;
  }

  // Campaign assignment
  assignToCampaign(campaignId: number): void {
    this.campaignId = campaignId;
    this.isAssigned = true;
    this.assignedAt = new Date();
  }

  unassignFromCampaign(): void {
    this.campaignId = null;
    this.isAssigned = false;
    this.assignedAt = null;
  }

  setAsDefault(): void {
    this.isDefault = true;
  }

  removeAsDefault(): void {
    this.isDefault = false;
  }

  // Usage tracking
  markAsUsed(): void {
    this.lastUsedAt = new Date();
  }

  get daysSinceLastUsed(): number {
    if (!this.lastUsedAt) return -1;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastUsedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isUnused(): boolean {
    const daysSince = this.daysSinceLastUsed;
    return daysSince > 30;
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
