import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from './entities/platform.entity';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Platform])],
  providers: [PlatformsService],
  controllers: [PlatformsController],
  exports: [PlatformsService],
})
export class PlatformsModule {}
