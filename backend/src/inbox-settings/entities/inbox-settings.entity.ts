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

@Entity("inbox_settings")
@Index(["inboxId"], { unique: true })
export class InboxSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint" })
  inboxId: number;

  @Column({ type: "boolean", default: true })
  autoReplyEnabled: boolean;

  @Column({ type: "text", nullable: true })
  autoReplyMessage: string;

  @Column({ type: "boolean", default: false })
  businessHoursEnabled: boolean;

  @Column({ type: "json", nullable: true })
  businessHours: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };

  @Column({ type: "text", nullable: true })
  afterHoursMessage: string;

  @Column({ type: "boolean", default: true })
  notificationsEnabled: boolean;

  @Column({ type: "json", nullable: true })
  notificationSettings: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };

  @Column({ type: "json", nullable: true })
  aiSettings: {
    enabled: boolean;
    autoResponse: boolean;
    smartRouting: boolean;
    sentimentAnalysis: boolean;
  };

  @Column({ type: "json", nullable: true })
  customSettings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Inbox, (inbox) => inbox.inboxSettings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inboxId" })
  inbox: Inbox;

  // Helper methods
  get hasAutoReply(): boolean {
    return this.autoReplyEnabled && !!this.autoReplyMessage;
  }

  get hasBusinessHours(): boolean {
    return this.businessHoursEnabled && !!this.businessHours;
  }

  get hasNotifications(): boolean {
    return this.notificationsEnabled;
  }

  get hasAiEnabled(): boolean {
    return this.aiSettings?.enabled || false;
  }

  get hasWebhook(): boolean {
    return (
      this.notificationSettings?.webhook &&
      !!this.notificationSettings.webhookUrl
    );
  }

  // Business hours helpers
  isBusinessHours(day: string, time: string): boolean {
    if (!this.hasBusinessHours) return true;

    const daySettings = this.businessHours[day.toLowerCase()];
    if (!daySettings || !daySettings.enabled) return false;

    return time >= daySettings.start && time <= daySettings.end;
  }

  getCurrentDaySettings(): any {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    return this.businessHours?.[today];
  }

  // AI settings helpers
  enableAi(): void {
    if (!this.aiSettings) {
      this.aiSettings = {
        enabled: false,
        autoResponse: false,
        smartRouting: false,
        sentimentAnalysis: false,
      };
    }
    this.aiSettings.enabled = true;
  }

  disableAi(): void {
    if (this.aiSettings) {
      this.aiSettings.enabled = false;
    }
  }

  // Notification helpers
  enableEmailNotifications(): void {
    if (!this.notificationSettings) {
      this.notificationSettings = {
        email: false,
        sms: false,
        webhook: false,
      };
    }
    this.notificationSettings.email = true;
  }

  enableSmsNotifications(): void {
    if (!this.notificationSettings) {
      this.notificationSettings = {
        email: false,
        sms: false,
        webhook: false,
      };
    }
    this.notificationSettings.sms = true;
  }

  setWebhook(url: string): void {
    if (!this.notificationSettings) {
      this.notificationSettings = {
        email: false,
        sms: false,
        webhook: false,
      };
    }
    this.notificationSettings.webhook = true;
    this.notificationSettings.webhookUrl = url;
  }

  // Custom settings helpers
  setCustomSetting(key: string, value: any): void {
    if (!this.customSettings) this.customSettings = {};
    this.customSettings[key] = value;
  }

  getCustomSetting(key: string): any {
    return this.customSettings?.[key];
  }

  removeCustomSetting(key: string): void {
    if (this.customSettings) {
      delete this.customSettings[key];
    }
  }
}
