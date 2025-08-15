import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Inbox } from '../../inboxes/entities/inbox.entity';

export enum InboxPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  OWNER = 'owner',
}

@Entity('inbox_users')
export class InboxUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'bigint' })
  inboxId: number;

  @Column({
    type: 'enum',
    enum: InboxPermission,
    default: InboxPermission.READ,
  })
  permission: InboxPermission;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Inbox, (inbox) => inbox.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox: Inbox;

  // Helper methods
  get canRead(): boolean {
    return this.isActive && this.permission !== undefined;
  }

  get canWrite(): boolean {
    return (
      this.isActive &&
      [
        InboxPermission.WRITE,
        InboxPermission.ADMIN,
        InboxPermission.OWNER,
      ].includes(this.permission)
    );
  }

  get canAdmin(): boolean {
    return (
      this.isActive &&
      [InboxPermission.ADMIN, InboxPermission.OWNER].includes(this.permission)
    );
  }

  get isOwner(): boolean {
    return this.isActive && this.permission === InboxPermission.OWNER;
  }
}
