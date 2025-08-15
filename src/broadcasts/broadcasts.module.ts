import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Broadcast } from './entities/broadcast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Broadcast])],
  controllers: [],
  providers: [],
  exports: [],
})
export class BroadcastsModule {}
