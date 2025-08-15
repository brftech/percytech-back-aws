import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlatformsModule } from './platforms/platforms.module';
import { CompaniesModule } from './companies/companies.module';
import { BrandsModule } from './brands/brands.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { InboxesModule } from './inboxes/inboxes.module';
import { GPhonesModule } from './g-phones/g-phones.module';
import { UsersModule } from './users/users.module';
import { PersonsModule } from './persons/persons.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { BroadcastsModule } from './broadcasts/broadcasts.module';
import { UserCompaniesModule } from './user-companies/user-companies.module';
import { InboxUsersModule } from './inbox-users/inbox-users.module';
import { InboxSettingsModule } from './inbox-settings/inbox-settings.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { Platform } from './platforms/entities/platform.entity';
import { Company } from './companies/entities/company.entity';
import { Brand } from './brands/entities/brand.entity';
import { Campaign } from './campaigns/entities/campaign.entity';
import { Inbox } from './inboxes/entities/inbox.entity';
import { gPhone } from './g-phones/entities/g-phone.entity';
import { User } from './users/entities/user.entity';
import { Person } from './persons/entities/person.entity';
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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'percytech',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'percytech_modern',
      entities: [
        Platform,
        Company,
        Brand,
        Campaign,
        Inbox,
        gPhone,
        User,
        Person,
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
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    PlatformsModule,
    CompaniesModule,
    BrandsModule,
    CampaignsModule,
    InboxesModule,
    GPhonesModule,
    UsersModule,
    PersonsModule,
    MessagesModule,
    ConversationsModule,
    BroadcastsModule,
    UserCompaniesModule,
    InboxUsersModule,
    InboxSettingsModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
