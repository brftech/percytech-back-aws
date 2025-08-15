import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { gPhoneStatus, gPhoneType } from '../entities/g-phone.entity';

export class CreateGPhoneDto {
  @IsNumber()
  inboxId: number;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsEnum(gPhoneType)
  type?: gPhoneType;

  @IsOptional()
  @IsEnum(gPhoneStatus)
  status?: gPhoneStatus;

  @IsOptional()
  @IsBoolean()
  isAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  areaCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsObject()
  bandwidthData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
