import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboxUser } from './entities/inbox-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InboxUser])],
  controllers: [],
  providers: [],
  exports: [],
})
export class InboxUsersModule {}
