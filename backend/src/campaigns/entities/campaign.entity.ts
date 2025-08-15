import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Inbox } from "../../inboxes/entities/inbox.entity";
import { gPhone } from "../../g-phones/entities/g-phone.entity";

export enum CampaignStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum UseCase {
  MARKETING = "marketing",
  TWO_FACTOR_AUTH = "2fa",
  APPOINTMENT_REMINDERS = "appointment_reminders",
  CUSTOMER_SERVICE = "customer_service",
  ALERTS = "alerts",
  SURVEYS = "surveys",
  OTHER = "other",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("campaigns")
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: UseCase,
  })
  useCase: UseCase;

  @Column({ type: "text" })
  messageContent: string;

  @Column({
    type: "enum",
    enum: CampaignStatus,
    default: CampaignStatus.PENDING,
  })
  status: CampaignStatus;

  @Column({
    type: "enum",
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  tcrStatus: ApprovalStatus;

  @Column({
    type: "enum",
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  bandwidthStatus: ApprovalStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  tcrBrandId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  tcrCampaignId: string;

  @Column({ type: "json", nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: "json", nullable: true })
  bandwidthResponse: Record<string, any>;

  @Column({ type: "timestamp", nullable: true })
  submittedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.campaigns, { onDelete: "CASCADE" })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  @OneToMany(() => gPhone, (gPhone) => gPhone.campaign)
  gPhones: gPhone[];

  // Helper methods
  get isTcrApproved(): boolean {
    return this.tcrStatus === ApprovalStatus.APPROVED;
  }

  get isBandwidthApproved(): boolean {
    return this.bandwidthStatus === ApprovalStatus.APPROVED;
  }

  get isFullyApproved(): boolean {
    return this.isTcrApproved && this.isBandwidthApproved;
  }

  get isTcrRejected(): boolean {
    return this.tcrStatus === ApprovalStatus.REJECTED;
  }

  get isBandwidthRejected(): boolean {
    return this.bandwidthStatus === ApprovalStatus.REJECTED;
  }

  get hasAnyRejections(): boolean {
    return this.isTcrRejected || this.isBandwidthRejected;
  }

  get isPending(): boolean {
    return (
      this.tcrStatus === ApprovalStatus.PENDING ||
      this.bandwidthStatus === ApprovalStatus.PENDING
    );
  }

  get isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE;
  }

  approveTcr(
    brandId: string,
    campaignId: string,
    response: Record<string, any>
  ): void {
    this.tcrStatus = ApprovalStatus.APPROVED;
    this.tcrBrandId = brandId;
    this.tcrCampaignId = campaignId;
    this.tcrResponse = response;
    this.updateApprovalStatus();
  }

  rejectTcr(response: Record<string, any>, reason?: string): void {
    this.tcrStatus = ApprovalStatus.REJECTED;
    this.tcrResponse = response;
    if (reason) {
      this.tcrResponse.rejectionReason = reason;
    }
  }

  approveBandwidth(response: Record<string, any>): void {
    this.bandwidthStatus = ApprovalStatus.APPROVED;
    this.bandwidthResponse = response;
    this.updateApprovalStatus();
  }

  rejectBandwidth(response: Record<string, any>, reason?: string): void {
    this.bandwidthStatus = ApprovalStatus.REJECTED;
    this.bandwidthResponse = response;
    if (reason) {
      this.bandwidthResponse.rejectionReason = reason;
    }
  }

  private updateApprovalStatus(): void {
    if (this.isFullyApproved) {
      this.approvedAt = new Date();
      this.status = CampaignStatus.ACTIVE;
    }
  }

  get tcrErrors(): string[] {
    if (!this.tcrResponse?.errors) return [];
    return Array.isArray(this.tcrResponse.errors)
      ? this.tcrResponse.errors
      : [this.tcrResponse.errors];
  }

  get bandwidthErrors(): string[] {
    if (!this.bandwidthResponse?.errors) return [];
    return Array.isArray(this.bandwidthResponse.errors)
      ? this.bandwidthResponse.errors
      : [this.bandwidthResponse.errors];
  }

  get allErrors(): string[] {
    return [...this.tcrErrors, ...this.bandwidthErrors];
  }

  get hasErrors(): boolean {
    return this.allErrors.length > 0;
  }

  get useCaseDisplay(): string {
    const useCaseMap = {
      [UseCase.MARKETING]: "Marketing",
      [UseCase.TWO_FACTOR_AUTH]: "Two-Factor Authentication",
      [UseCase.APPOINTMENT_REMINDERS]: "Appointment Reminders",
      [UseCase.CUSTOMER_SERVICE]: "Customer Service",
      [UseCase.ALERTS]: "Alerts & Notifications",
      [UseCase.SURVEYS]: "Surveys & Feedback",
      [UseCase.OTHER]: "Other",
    };
    return useCaseMap[this.useCase] || this.useCase;
  }
}
