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
import { Platform } from "../../platforms/entities/platform.entity";
import { Inbox } from "../../inboxes/entities/inbox.entity";
import { Brand } from "../../brands/entities/brand.entity";
import { UserCompany } from "../../user-companies/entities/user-company.entity";

export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_APPROVAL = "pending_approval",
}

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  platformId: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  legalName: string;

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
    cell_phone: string;
  };

  @Column({
    type: "enum",
    enum: CompanyStatus,
    default: CompanyStatus.PENDING_APPROVAL,
  })
  status: CompanyStatus;

  @Column({ type: "boolean", default: false })
  tcrVerified: boolean;

  @Column({ type: "timestamp", nullable: true })
  tcrVerificationDate: Date;

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Platform, (platform) => platform.companies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "platformId" })
  platform: Platform;

  @OneToMany(() => Inbox, (inbox) => inbox.company)
  inboxes: Inbox[];

  @OneToMany(() => Brand, (brand) => brand.company)
  brands: Brand[];

  @OneToMany(() => UserCompany, (userCompany) => userCompany.company)
  userCompanies: UserCompany[];

  // Helper methods
  get isActive(): boolean {
    return this.status === CompanyStatus.ACTIVE;
  }

  get isPendingApproval(): boolean {
    return this.status === CompanyStatus.PENDING_APPROVAL;
  }

  get isSuspended(): boolean {
    return this.status === CompanyStatus.SUSPENDED;
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

  get platformType(): string {
    return this.platform?.type || "unknown";
  }

  get platformName(): string {
    return this.platform?.displayName || "Unknown Platform";
  }

  approve(): void {
    this.status = CompanyStatus.ACTIVE;
  }

  suspend(): void {
    this.status = CompanyStatus.SUSPENDED;
  }

  markTcrVerified(): void {
    this.tcrVerified = true;
    this.tcrVerificationDate = new Date();
  }
}
