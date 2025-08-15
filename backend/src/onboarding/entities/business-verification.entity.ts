import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { OnboardingSession } from "./onboarding-session.entity";

export enum TCRStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("business_verifications")
export class BusinessVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  onboardingSessionId: number;

  @Column({ type: "varchar", length: 255 })
  businessName: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  businessType: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  ein: string;

  @Column({ type: "json", nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: "json", nullable: true })
  contactPerson: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };

  @Column({
    type: "enum",
    enum: TCRStatus,
    default: TCRStatus.PENDING,
  })
  tcrStatus: TCRStatus;

  @Column({ type: "json", nullable: true })
  tcrResponse: Record<string, any>;

  @Column({ type: "timestamp", nullable: true })
  verificationDate: Date;

  // Relationships
  @ManyToOne(
    () => OnboardingSession,
    (session) => session.businessVerifications,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "onboardingSessionId" })
  onboardingSession: OnboardingSession;

  // Helper methods
  get isApproved(): boolean {
    return this.tcrStatus === TCRStatus.APPROVED;
  }

  get isRejected(): boolean {
    return this.tcrStatus === TCRStatus.REJECTED;
  }

  get isPending(): boolean {
    return this.tcrStatus === TCRStatus.PENDING;
  }

  get fullAddress(): string {
    if (!this.address) return "";
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
  }

  get contactFullName(): string {
    if (!this.contactPerson) return "";
    const contact = this.contactPerson;
    return `${contact.firstName} ${contact.lastName}`.trim();
  }

  approve(response: Record<string, any>): void {
    this.tcrStatus = TCRStatus.APPROVED;
    this.tcrResponse = response;
    this.verificationDate = new Date();
  }

  reject(response: Record<string, any>, reason?: string): void {
    this.tcrStatus = TCRStatus.REJECTED;
    this.tcrResponse = response;
    if (reason) {
      this.tcrResponse.rejectionReason = reason;
    }
    this.verificationDate = new Date();
  }

  get tcrErrors(): string[] {
    if (!this.tcrResponse?.errors) return [];
    return Array.isArray(this.tcrResponse.errors)
      ? this.tcrResponse.errors
      : [this.tcrResponse.errors];
  }

  get hasTcrErrors(): boolean {
    return this.tcrErrors.length > 0;
  }
}
