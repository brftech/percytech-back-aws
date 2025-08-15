import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxSettings } from './entities/inbox-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InboxSettings])],
  controllers: [],
  providers: [],
  exports: [],
})
export class InboxSettingsModule {}
