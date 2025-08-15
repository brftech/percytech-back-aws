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
import { Company } from "../../companies/entities/company.entity";
import { Brand } from "../../brands/entities/brand.entity";
import { Campaign } from "../../campaigns/entities/campaign.entity";
import { gPhone } from "../../g-phones/entities/g-phone.entity";
import { Conversation } from "../../conversations/entities/conversation.entity";
import { Person } from "../../persons/entities/person.entity";
import { InboxUser } from "../../inbox-users/entities/inbox-user.entity";
import { InboxSettings } from "../../inbox-settings/entities/inbox-settings.entity";
import { Broadcast } from "../../broadcasts/entities/broadcast.entity";

export enum InboxStatus {
  SETUP = "setup", // Initial setup phase, no texting yet
  TESTING = "testing", // Testing with temporary campaign
  PENDING_APPROVAL = "pending_approval", // Waiting for campaign approval
  ACTIVE = "active", // Fully operational
  INACTIVE = "inactive", // Temporarily disabled
  SUSPENDED = "suspended", // Suspended due to compliance issues
}

@Entity("inboxes")
@Index(["companyId", "brandId"])
@Index(["status", "createdAt"])
export class Inbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  companyId: number;

  @Column({ type: "bigint" })
  brandId: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100, default: "America/New_York" })
  timeZone: string;

  @Column({ type: "varchar", length: 10 })
  areaCode: string;

  @Column({ type: "timestamp", nullable: true })
  expirationDate: Date;

  @Column({ type: "varchar", length: 10, default: "00:00" })
  doneResetTime: string;

  @Column({ type: "boolean", default: false })
  isEnabledDeferredMessaging: boolean;

  @Column({ type: "boolean", default: true })
  enableDoneResetTime: boolean;

  @Column({ type: "boolean", default: false })
  hideBroadcastButton: boolean;

  @Column({ type: "boolean", default: false })
  hideEpisodes: boolean;

  @Column({ type: "int", default: 10 })
  customDetailsLimit: number;

  @Column({
    type: "enum",
    enum: InboxStatus,
    default: InboxStatus.ACTIVE,
  })
  status: InboxStatus;

  @Column({ type: "bigint", nullable: true })
  defaultPhoneId: number; // Default gPhone ID

  @Column({ type: "bigint", nullable: true })
  temporaryCampaignId: number; // Temporary campaign for testing

  @Column({ type: "boolean", default: false })
  isUsingTemporaryCampaign: boolean; // Flag for temporary campaign usage

  @Column({ type: "timestamp", nullable: true })
  campaignApprovalDeadline: Date; // When campaign approval is expected

  @Column({ type: "timestamp", nullable: true })
  setupCompletedAt: Date; // When setup phase was completed

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>; // Inbox-specific configuration

  @Column({ type: "json", nullable: true })
  compliance: Record<string, any>; // Compliance requirements

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Company, (company) => company.inboxes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @ManyToOne(() => Brand, (brand) => brand.inboxes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  @OneToMany(() => Campaign, (campaign) => campaign.inbox)
  campaigns: Campaign[];

  @OneToMany(() => gPhone, (gPhone) => gPhone.inbox)
  gPhones: gPhone[];

  @OneToMany(() => Conversation, (conversation) => conversation.inbox)
  conversations: Conversation[];

  @OneToMany(() => Person, (person) => person.inbox)
  persons: Person[];

  @OneToMany(() => InboxUser, (inboxUser) => inboxUser.inbox)
  inboxUsers: InboxUser[];

  @OneToMany(() => InboxSettings, (inboxSettings) => inboxSettings.inbox)
  inboxSettings: InboxSettings[];

  @OneToMany(() => Broadcast, (broadcast) => broadcast.inbox)
  broadcasts: Broadcast[];

  // Helper methods
  get isActive(): boolean {
    return this.status === InboxStatus.ACTIVE;
  }

  get isInactive(): boolean {
    return this.status === InboxStatus.INACTIVE;
  }

  get isSuspended(): boolean {
    return this.status === InboxStatus.SUSPENDED;
  }

  get isSetup(): boolean {
    return this.status === InboxStatus.SETUP;
  }

  get isTesting(): boolean {
    return this.status === InboxStatus.TESTING;
  }

  get isPendingApproval(): boolean {
    return this.status === InboxStatus.PENDING_APPROVAL;
  }

  get isOperational(): boolean {
    return (
      this.status === InboxStatus.ACTIVE || this.status === InboxStatus.TESTING
    );
  }

  get canText(): boolean {
    return (
      this.isOperational &&
      (this.hasDefaultPhone || this.isUsingTemporaryCampaign)
    );
  }

  get isInOnboarding(): boolean {
    return this.isSetup || this.isTesting || this.isPendingApproval;
  }

  get hasDefaultPhone(): boolean {
    return !!this.defaultPhoneId;
  }

  get defaultPhone(): gPhone | undefined {
    return this.gPhones?.find((phone) => phone.id === this.defaultPhoneId);
  }

  get activeCampaigns(): Campaign[] {
    return this.campaigns?.filter((campaign) => campaign.isActive) || [];
  }

  get hasActiveCampaigns(): boolean {
    return this.activeCampaigns.length > 0;
  }

  get activeConversations(): Conversation[] {
    return (
      this.conversations?.filter((conversation) => conversation.isActive) || []
    );
  }

  get unreadConversationCount(): number {
    return (
      this.conversations?.filter((conversation) => conversation.isUnread)
        .length || 0
    );
  }

  get companyName(): string {
    return this.company?.name || "Unknown Company";
  }

  get brandName(): string {
    return this.brand?.name || "Unknown Brand";
  }

  get platformType(): string {
    return this.company?.platformType || "unknown";
  }

  get platformName(): string {
    return this.company?.platformName || "Unknown Platform";
  }

  get isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date() > this.expirationDate;
  }

  get daysUntilExpiration(): number {
    if (!this.expirationDate) return -1;
    const now = new Date();
    const diffTime = this.expirationDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isExpiringSoon(): boolean {
    const daysLeft = this.daysUntilExpiration;
    return daysLeft >= 0 && daysLeft <= 30;
  }

  // Onboarding status helpers
  get daysUntilCampaignApproval(): number {
    if (!this.campaignApprovalDeadline) return -1;
    const now = new Date();
    const diffTime = Math.abs(
      this.campaignApprovalDeadline.getTime() - now.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isCampaignApprovalOverdue(): boolean {
    const daysLeft = this.daysUntilCampaignApproval;
    return daysLeft < 0 && this.isPendingApproval;
  }

  get onboardingProgress(): number {
    if (this.isActive) return 100;
    if (this.isTesting) return 75;
    if (this.isPendingApproval) return 50;
    if (this.isSetup) return 25;
    return 0;
  }

  get onboardingStage(): string {
    if (this.isActive) return "Complete";
    if (this.isTesting) return "Testing";
    if (this.isPendingApproval) return "Pending Approval";
    if (this.isSetup) return "Setup";
    return "Unknown";
  }

  // Status management
  activate(): void {
    this.status = InboxStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = InboxStatus.INACTIVE;
  }

  suspend(): void {
    this.status = InboxStatus.SUSPENDED;
  }

  // Onboarding flow management
  completeSetup(): void {
    this.status = InboxStatus.TESTING;
    this.setupCompletedAt = new Date();
  }

  startTesting(): void {
    this.status = InboxStatus.TESTING;
  }

  assignTemporaryCampaign(campaignId: number): void {
    this.temporaryCampaignId = campaignId;
    this.isUsingTemporaryCampaign = true;
    this.status = InboxStatus.TESTING;
  }

  removeTemporaryCampaign(): void {
    this.temporaryCampaignId = null;
    this.isUsingTemporaryCampaign = false;
  }

  setCampaignApprovalDeadline(days: number = 14): void {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    this.campaignApprovalDeadline = deadline;
  }

  activateWithApprovedCampaign(): void {
    this.status = InboxStatus.ACTIVE;
    this.removeTemporaryCampaign();
  }

  setDefaultPhone(phoneId: number): void {
    this.defaultPhoneId = phoneId;
  }

  // Compliance helpers
  get requiresCompliance(): boolean {
    return this.brand?.isComplianceRequired || false;
  }

  get complianceLevel(): string {
    return this.brand?.complianceLevel || "standard";
  }

  get isHighlyRegulated(): boolean {
    return this.complianceLevel === "highly-regulated";
  }

  get isHealthcare(): boolean {
    return this.complianceLevel === "healthcare";
  }
}
