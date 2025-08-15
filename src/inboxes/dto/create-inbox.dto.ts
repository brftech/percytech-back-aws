import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { InboxStatus } from '../entities/inbox.entity';

export class CreateInboxDto {
  @IsNumber()
  companyId: number;

  @IsNumber()
  campaignId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  timeZone?: string;

  @IsOptional()
  @IsString()
  areaCode?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  doneResetTime?: string;

  @IsOptional()
  @IsBoolean()
  isEnabledDeferredMessaging?: boolean;

  @IsOptional()
  @IsBoolean()
  enableDoneResetTime?: boolean;

  @IsOptional()
  @IsBoolean()
  hideBroadcastButton?: boolean;

  @IsOptional()
  @IsBoolean()
  hideEpisodes?: boolean;

  @IsOptional()
  @IsNumber()
  customDetailsLimit?: number;

  @IsOptional()
  @IsEnum(InboxStatus)
  status?: InboxStatus;

  @IsOptional()
  @IsNumber()
  defaultPhoneId?: number;

  @IsOptional()
  @IsNumber()
  temporaryCampaignId?: number;

  @IsOptional()
  @IsBoolean()
  isUsingTemporaryCampaign?: boolean;

  @IsOptional()
  @IsDateString()
  campaignApprovalDeadline?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsObject()
  compliance?: Record<string, any>;
}
