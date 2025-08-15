import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OnboardingSession } from './onboarding-session.entity';

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('onboarding_steps')
export class OnboardingStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  onboardingSessionId: number;

  @Column({ type: 'varchar', length: 100 })
  stepName: string;

  @Column({ type: 'int' })
  stepOrder: number;

  @Column({
    type: 'enum',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  status: StepStatus;

  @Column({ type: 'json', nullable: true })
  apiResponse: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Relationships
  @ManyToOne(() => OnboardingSession, (session) => session.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'onboardingSessionId' })
  onboardingSession: OnboardingSession;

  // Helper methods
  get isCompleted(): boolean {
    return this.status === StepStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === StepStatus.FAILED;
  }

  get isInProgress(): boolean {
    return this.status === StepStatus.IN_PROGRESS;
  }

  get isPending(): boolean {
    return this.status === StepStatus.PENDING;
  }

  start(): void {
    this.status = StepStatus.IN_PROGRESS;
    this.startedAt = new Date();
  }

  complete(response?: Record<string, any>): void {
    this.status = StepStatus.COMPLETED;
    this.completedAt = new Date();
    if (response) {
      this.apiResponse = response;
    }
  }

  fail(error: string): void {
    this.status = StepStatus.FAILED;
    this.errorMessage = error;
    this.completedAt = new Date();
  }

  get duration(): number | null {
    if (this.startedAt && this.completedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }

  get durationFormatted(): string | null {
    const duration = this.duration;
    if (!duration) return null;

    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
