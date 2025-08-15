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
import { Company } from "../../companies/entities/company.entity";
import { Inbox } from "../../inboxes/entities/inbox.entity";
import { UserBrand } from "../../user-brands/entities/user-brand.entity";

export enum BrandStatus {
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

export enum TCRStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  companyId: number;

  @Column({ type: "varchar", length: 255 })
  name: string; // DBA name (e.g., "Anstead's Cigars")

  @Column({ type: "varchar", length: 255, nullable: true })
  legalName: string; // Full legal name if different

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  businessType: string; // Industry type (e.g., "tobacco", "marine")

  @Column({ type: "varchar", length: 20, nullable: true })
  ein: string; // Employer Identification Number

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
    cell_phone: string;
  };

  @Column({
    type: "enum",
    enum: BrandStatus,
    default: BrandStatus.PENDING_APPROVAL,
  })
  status: BrandStatus;

  @Column({
    type: "enum",
    enum: TCRStatus,
    default: TCRStatus.PENDING,
  })
  tcrStatus: TCRStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  tcrBrandId: string; // TCR-assigned Brand ID (e.g., "XYZ123")

  @Column({ type: "timestamp", nullable: true })
  tcrVerificationDate: Date;

  @Column({ type: "json", nullable: true })
  tcrResponse: Record<string, any>; // Full TCR API response

  @Column({ type: "text", nullable: true })
  rejectionReason: string; // Why TCR rejected (if applicable)

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>; // Brand-specific configuration

  @Column({ type: "json", nullable: true })
  compliance: Record<string, any>; // Compliance requirements

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Company, (company) => company.brands, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: Company;

  @OneToMany(() => Inbox, (inbox) => inbox.brand)
  inboxes: Inbox[];

  @OneToMany(() => UserBrand, (userBrand) => userBrand.brand)
  userBrands: UserBrand[];

  // Helper methods
  get isActive(): boolean {
    return this.status === BrandStatus.ACTIVE;
  }

  get isPendingApproval(): boolean {
    return this.status === BrandStatus.PENDING_APPROVAL;
  }

  get isSuspended(): boolean {
    return this.status === BrandStatus.SUSPENDED;
  }

  get isRejected(): boolean {
    return this.status === BrandStatus.REJECTED;
  }

  get isTcrApproved(): boolean {
    return this.tcrStatus === TCRStatus.APPROVED;
  }

  get isTcrRejected(): boolean {
    return this.tcrStatus === TCRStatus.REJECTED;
  }

  get isTcrPending(): boolean {
    return this.tcrStatus === TCRStatus.PENDING;
  }

  get hasTcrBrandId(): boolean {
    return !!this.tcrBrandId;
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

  get companyName(): string {
    return this.company?.name || "Unknown Company";
  }

  get platformType(): string {
    return this.company?.platformType || "unknown";
  }

  get platformName(): string {
    return this.company?.platformName || "Unknown Platform";
  }

  // TCR approval workflow
  approveTcr(brandId: string, response: Record<string, any>): void {
    this.tcrStatus = TCRStatus.APPROVED;
    this.tcrBrandId = brandId;
    this.tcrResponse = response;
    this.tcrVerificationDate = new Date();
    this.status = BrandStatus.ACTIVE;
  }

  rejectTcr(response: Record<string, any>, reason?: string): void {
    this.tcrStatus = TCRStatus.REJECTED;
    this.tcrResponse = response;
    this.rejectionReason = reason || "TCR rejection";
    this.status = BrandStatus.REJECTED;
  }

  suspend(): void {
    this.status = BrandStatus.SUSPENDED;
  }

  reactivate(): void {
    if (this.isTcrApproved) {
      this.status = BrandStatus.ACTIVE;
    }
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

  get isComplianceRequired(): boolean {
    return (
      this.businessType === "tobacco" || this.businessType === "healthcare"
    );
  }

  get complianceLevel(): string {
    if (this.businessType === "tobacco") return "highly-regulated";
    if (this.businessType === "healthcare") return "healthcare";
    if (this.businessType === "marine") return "standard";
    return "general";
  }
}
