import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Company } from "../../companies/entities/company.entity";

export enum UserCompanyRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  VIEWER = "viewer",
}

export enum UserCompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

@Entity("user_companies")
@Index(["userId", "companyId"], { unique: true })
@Index(["companyId", "role"])
@Index(["userId", "status"])
export class UserCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  userId: number;

  @Column({ type: "bigint" })
  companyId: number;

  @Column({
    type: "enum",
    enum: UserCompanyRole,
    default: UserCompanyRole.USER,
  })
  role: UserCompanyRole;

  @Column({
    type: "enum",
    enum: UserCompanyStatus,
    default: UserCompanyStatus.ACTIVE,
  })
  status: UserCompanyStatus;

  @Column({ type: "boolean", default: false })
  isPrimary: boolean; // Is this the user's primary company

  @Column({ type: "timestamp", nullable: true })
  joinedAt: Date; // When user joined this company

  @Column({ type: "timestamp", nullable: true })
  lastAccessAt: Date; // Last time user accessed this company

  @Column({ type: "json", nullable: true })
  permissions: Record<string, any>; // Company-specific permissions

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>; // Company-specific user settings

  @Column({ type: "text", nullable: true })
  notes: string; // Admin notes about this user-company relationship

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.userCompanies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Company, (company) => company.userCompanies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "companyId" })
  company: Company;

  // Helper methods
  get isActive(): boolean {
    return this.status === UserCompanyStatus.ACTIVE;
  }

  get isCompanyInactive(): boolean {
    return this.status === UserCompanyStatus.INACTIVE;
  }

  get isSuspended(): boolean {
    return this.status === UserCompanyStatus.SUSPENDED;
  }

  get isPending(): boolean {
    return this.status === UserCompanyStatus.PENDING;
  }

  get isOwner(): boolean {
    return this.role === UserCompanyRole.OWNER;
  }

  get isAdmin(): boolean {
    return this.role === UserCompanyRole.ADMIN;
  }

  get isManager(): boolean {
    return this.role === UserCompanyRole.MANAGER;
  }

  get isUser(): boolean {
    return this.role === UserCompanyRole.USER;
  }

  get isViewer(): boolean {
    return this.role === UserCompanyRole.VIEWER;
  }

  get isPrimaryCompany(): boolean {
    return this.isPrimary;
  }

  get hasJoined(): boolean {
    return !!this.joinedAt;
  }

  get hasRecentAccess(): boolean {
    if (!this.lastAccessAt) return false;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastAccessAt.getTime());
    const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysSince <= 7;
  }

  get daysSinceLastAccess(): number {
    if (!this.lastAccessAt) return -1;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastAccessAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get userName(): string {
    return this.user?.username || "Unknown User";
  }

  get userEmail(): string {
    return this.user?.email || "";
  }

  get userPhone(): string {
    return this.user?.phoneNumber || "";
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

  // Role management
  promoteToAdmin(): void {
    this.role = UserCompanyRole.ADMIN;
  }

  promoteToManager(): void {
    this.role = UserCompanyRole.MANAGER;
  }

  demoteToUser(): void {
    this.role = UserCompanyRole.USER;
  }

  demoteToViewer(): void {
    this.role = UserCompanyRole.VIEWER;
  }

  // Status management
  activate(): void {
    this.status = UserCompanyStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = UserCompanyStatus.INACTIVE;
  }

  suspend(): void {
    this.status = UserCompanyStatus.SUSPENDED;
  }

  approve(): void {
    this.status = UserCompanyStatus.ACTIVE;
    this.joinedAt = new Date();
  }

  // Access tracking
  updateLastAccess(): void {
    this.lastAccessAt = new Date();
  }

  // Primary company management
  setAsPrimary(): void {
    this.isPrimary = true;
  }

  removeAsPrimary(): void {
    this.isPrimary = false;
  }

  // Permission management
  hasPermission(permission: string): boolean {
    if (!this.permissions) return false;
    return this.permissions[permission] === true;
  }

  grantPermission(permission: string): void {
    if (!this.permissions) this.permissions = {};
    this.permissions[permission] = true;
  }

  revokePermission(permission: string): void {
    if (this.permissions) {
      delete this.permissions[permission];
    }
  }

  // Settings management
  setSetting(key: string, value: any): void {
    if (!this.settings) this.settings = {};
    this.settings[key] = value;
  }

  getSetting(key: string): any {
    return this.settings?.[key];
  }

  removeSetting(key: string): void {
    if (this.settings) {
      delete this.settings[key];
    }
  }

  // Role-based permissions
  get canManageUsers(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get canManageInboxes(): boolean {
    return this.isOwner || this.isAdmin || this.isManager;
  }

  get canSendMessages(): boolean {
    return this.isOwner || this.isAdmin || this.isManager || this.isUser;
  }

  get canViewReports(): boolean {
    return this.isOwner || this.isAdmin || this.isManager;
  }

  get canManageSettings(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get canManageBilling(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get canAccessAdminPanel(): boolean {
    return this.isOwner || this.isAdmin;
  }

  // Company access validation
  canAccessCompany(): boolean {
    return this.isActive && !this.isSuspended;
  }

  canAccessInbox(inboxId: number): boolean {
    // This would be enhanced with inbox-specific permissions
    return this.canAccessCompany();
  }

  // Audit helpers
  get isRecentlyActive(): boolean {
    const daysSince = this.daysSinceLastAccess;
    return daysSince >= 0 && daysSince <= 30;
  }

  get isUserInactive(): boolean {
    const daysSince = this.daysSinceLastAccess;
    return daysSince > 90;
  }
}
