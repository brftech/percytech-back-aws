import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GPhonesService } from './g-phones.service';
import { GPhonesController } from './g-phones.controller';
import { gPhone } from './entities/g-phone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([gPhone])],
  controllers: [GPhonesController],
  providers: [GPhonesService],
  exports: [GPhonesService],
})
export class GPhonesModule {}
