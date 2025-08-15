import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Brand } from "../../brands/entities/brand.entity";

export enum UserBrandRole {
  OWNER = "owner",
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  VIEWER = "viewer",
}

export enum UserBrandStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("user_brands")
export class UserBrand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  userId: number;

  @Column({ type: "bigint" })
  brandId: number;

  @Column({
    type: "enum",
    enum: UserBrandRole,
    default: UserBrandRole.USER,
  })
  role: UserBrandRole;

  @Column({
    type: "enum",
    enum: UserBrandStatus,
    default: UserBrandStatus.ACTIVE,
  })
  status: UserBrandStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastAccessAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.userBrands, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Brand, (brand) => brand.userBrands, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  // Helper methods
  get canManageUsers(): boolean {
    return [UserBrandRole.OWNER, UserBrandRole.ADMIN].includes(this.role);
  }

  get canManageInboxes(): boolean {
    return [
      UserBrandRole.OWNER,
      UserBrandRole.ADMIN,
      UserBrandRole.MANAGER,
    ].includes(this.role);
  }

  get canSendMessages(): boolean {
    return [
      UserBrandRole.OWNER,
      UserBrandRole.ADMIN,
      UserBrandRole.MANAGER,
      UserBrandRole.USER,
    ].includes(this.role);
  }

  get canViewOnly(): boolean {
    return this.role === UserBrandRole.VIEWER;
  }

  updateLastAccess(): void {
    this.lastAccessAt = new Date();
  }
}
