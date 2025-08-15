import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { UserBrand } from "../../user-brands/entities/user-brand.entity";
import { UserPhone } from "../../user-phones/entities/user-phone.entity";
import { UserCompany } from "../../user-companies/entities/user-company.entity";
import { InboxUser } from "../../inbox-users/entities/inbox-user.entity";
import { Broadcast } from "../../broadcasts/entities/broadcast.entity";
import { Exclude } from "class-transformer";

export enum LoginMethod {
  SMS = "sms",
  EMAIL = "email",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  username: string;

  @Column({ type: "varchar", length: 255, nullable: true, unique: true })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: true, unique: true })
  phoneNumber: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  firstName: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  lastName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Exclude()
  passwordHash: string;

  @Column({
    type: "enum",
    enum: LoginMethod,
    default: LoginMethod.SMS,
  })
  preferredLoginMethod: LoginMethod;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => UserPhone, (userPhone) => userPhone.user)
  userPhones: UserPhone[];

  @ManyToMany(() => UserBrand, (userBrand) => userBrand.user)
  @JoinTable({
    name: "user_brands",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "brand_id", referencedColumnName: "id" },
  })
  userBrands: UserBrand[];

  @OneToMany(() => UserCompany, (userCompany) => userCompany.user)
  userCompanies: UserCompany[];

  @OneToMany(() => InboxUser, (inboxUser) => inboxUser.user)
  inboxUsers: InboxUser[];

  @OneToMany(() => Broadcast, (broadcast) => broadcast.sender)
  broadcasts: Broadcast[];

  // Helper methods
  get fullName(): string {
    return (
      `${this.firstName || ""} ${this.lastName || ""}`.trim() || "Unknown User"
    );
  }

  get primaryPhone(): UserPhone | undefined {
    return this.userPhones?.find((phone) => phone.isPrimary);
  }

  get hasSMSAccess(): boolean {
    return (
      this.phoneNumber != null ||
      this.userPhones?.some((phone) => phone.isVerified) ||
      false
    );
  }

  get hasEmailAccess(): boolean {
    return this.email != null && this.passwordHash != null;
  }
}
