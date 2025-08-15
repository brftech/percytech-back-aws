import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OnboardingSession } from "./onboarding-session.entity";

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
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

@Entity("campaign_submissions")
export class CampaignSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  onboardingSessionId: number;

  @Column({ type: "varchar", length: 255 })
  campaignName: string;

  @Column({ type: "text", nullable: true })
  campaignDescription: string;

  @Column({
    type: "enum",
    enum: UseCase,
  })
  useCase: UseCase;

  @Column({ type: "text" })
  messageContent: string;

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

  @Column({ type: "json", nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: "json", nullable: true })
  bandwidthResponse: Record<string, any>;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  approvedAt: Date;

  // Relationships
  @ManyToOne(
    () => OnboardingSession,
    (session) => session.campaignSubmissions,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "onboardingSessionId" })
  onboardingSession: OnboardingSession;

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

  approveTcr(response: Record<string, any>): void {
    this.tcrStatus = ApprovalStatus.APPROVED;
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
