import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingSession } from './entities/onboarding-session.entity';
import { OnboardingStep } from './entities/onboarding-step.entity';
import { BusinessVerification } from './entities/business-verification.entity';
import { CampaignSubmission } from './entities/campaign-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OnboardingSession,
      OnboardingStep,
      BusinessVerification,
      CampaignSubmission,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class OnboardingModule {}
