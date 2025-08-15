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
import { Inbox } from "../../inboxes/entities/inbox.entity";
import { User } from "../../users/entities/user.entity";

export enum InboxUserRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  VIEWER = "viewer",
}

export enum InboxUserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("inbox_users")
@Index(["inboxId", "userId"], { unique: true })
@Index(["inboxId", "role"])
@Index(["userId", "status"])
export class InboxUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "bigint" })
  userId: number;

  @Column({
    type: "enum",
    enum: InboxUserRole,
    default: InboxUserRole.USER,
  })
  role: InboxUserRole;

  @Column({
    type: "enum",
    enum: InboxUserStatus,
    default: InboxUserStatus.ACTIVE,
  })
  status: InboxUserStatus;

  @Column({ type: "boolean", default: false })
  isDefault: boolean; // Is this the user's default inbox

  @Column({ type: "timestamp", nullable: true })
  lastAccessAt: Date; // Last time user accessed this inbox

  @Column({ type: "json", nullable: true })
  permissions: Record<string, any>; // Inbox-specific permissions

  @Column({ type: "json", nullable: true })
  settings: Record<string, any>; // Inbox-specific user settings

  @Column({ type: "text", nullable: true })
  notes: string; // Admin notes about this user-inbox relationship

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.inboxUsers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  @ManyToOne(() => User, (user) => user.inboxUsers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: User;

  // Helper methods
  get isActive(): boolean {
    return this.status === InboxUserStatus.ACTIVE;
  }

  get isInactive(): boolean {
    return this.status === InboxUserStatus.INACTIVE;
  }

  get isSuspended(): boolean {
    return this.status === InboxUserStatus.SUSPENDED;
  }

  get isOwner(): boolean {
    return this.role === InboxUserRole.OWNER;
  }

  get isAdmin(): boolean {
    return this.role === InboxUserRole.ADMIN;
  }

  get isManager(): boolean {
    return this.role === InboxUserRole.MANAGER;
  }

  get isUser(): boolean {
    return this.role === InboxUserRole.USER;
  }

  get isViewer(): boolean {
    return this.role === InboxUserRole.VIEWER;
  }

  get isDefaultInbox(): boolean {
    return this.isDefault;
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

  // Role management
  promoteToAdmin(): void {
    this.role = InboxUserRole.ADMIN;
  }

  promoteToManager(): void {
    this.role = InboxUserRole.MANAGER;
  }

  demoteToUser(): void {
    this.role = InboxUserRole.USER;
  }

  demoteToViewer(): void {
    this.role = InboxUserRole.VIEWER;
  }

  // Status management
  activate(): void {
    this.status = InboxUserStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = InboxUserStatus.INACTIVE;
  }

  suspend(): void {
    this.status = InboxUserStatus.SUSPENDED;
  }

  // Access tracking
  updateLastAccess(): void {
    this.lastAccessAt = new Date();
  }

  // Default inbox management
  setAsDefault(): void {
    this.isDefault = true;
  }

  removeAsDefault(): void {
    this.isDefault = false;
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
  get canManageInbox(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get canManageUsers(): boolean {
    return this.isOwner || this.isAdmin;
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

  get canAccessAdminPanel(): boolean {
    return this.isOwner || this.isAdmin;
  }

  // Inbox access validation
  canAccessInbox(): boolean {
    return this.isActive && !this.isSuspended;
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
