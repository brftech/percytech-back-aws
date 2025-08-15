import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlatformsModule } from './platforms/platforms.module';
import { CompaniesModule } from './companies/companies.module';
import { Platform } from './platforms/entities/platform.entity';
import { Company } from './companies/entities/company.entity';
import { Brand } from './brands/entities/brand.entity';
import { Inbox } from './inboxes/entities/inbox.entity';
import { User } from './users/entities/user.entity';
import { Person } from './persons/entities/person.entity';
import { Campaign } from './campaigns/entities/campaign.entity';
import { gPhone } from './g-phones/entities/g-phone.entity';
import { Message } from './messages/entities/message.entity';
import { Conversation } from './conversations/entities/conversation.entity';
import { Broadcast } from './broadcasts/entities/broadcast.entity';
import { UserCompany } from './user-companies/entities/user-company.entity';
import { InboxUser } from './inbox-users/entities/inbox-user.entity';
import { InboxSettings } from './inbox-settings/entities/inbox-settings.entity';
import { OnboardingSession } from './onboarding/entities/onboarding-session.entity';
import { OnboardingStep } from './onboarding/entities/onboarding-step.entity';
import { BusinessVerification } from './onboarding/entities/business-verification.entity';
import { CampaignSubmission } from './onboarding/entities/campaign-submission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'percytech'),
        password: configService.get('DB_PASS', 'password'),
        database: configService.get('DB_NAME', 'percytech_modern'),
        entities: [
          Platform,
          Company,
          Brand,
          Inbox,
          User,
          Person,
          Campaign,
          gPhone,
          Message,
          Conversation,
          Broadcast,
          UserCompany,
          InboxUser,
          InboxSettings,
          OnboardingSession,
          OnboardingStep,
          BusinessVerification,
          CampaignSubmission,
        ],
        synchronize: true, // Temporarily enabled for testing
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    PlatformsModule,
    CompaniesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
