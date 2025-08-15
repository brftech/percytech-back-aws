import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("user_phones")
export class UserPhone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  userId: number;

  @Column({ type: "varchar", length: 20 })
  phoneNumber: string;

  @Column({ type: "boolean", default: false })
  isPrimary: boolean;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column({ type: "varchar", length: 6, nullable: true })
  verificationCode: string;

  @Column({ type: "timestamp", nullable: true })
  verificationExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.userPhones, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  // Helper methods
  get isVerificationExpired(): boolean {
    if (!this.verificationExpiresAt) return false;
    return new Date() > this.verificationExpiresAt;
  }

  get canVerify(): boolean {
    return this.verificationCode != null && !this.isVerificationExpired;
  }

  generateVerificationCode(): void {
    this.verificationCode = Math.random().toString().substr(2, 6);
    this.verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  clearVerificationCode(): void {
    this.verificationCode = null;
    this.verificationExpiresAt = null;
  }
}
