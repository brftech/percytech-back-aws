import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  IsNumber,
} from 'class-validator';
import {
  UseCase,
  CampaignStatus,
  ApprovalStatus,
} from '../entities/campaign.entity';

export class CreateCampaignDto {
  @IsNumber()
  brandId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(UseCase)
  useCase?: UseCase;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  tcrStatus?: ApprovalStatus;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  bandwidthStatus?: ApprovalStatus;

  @IsOptional()
  @IsString()
  tcrBrandId?: string;

  @IsOptional()
  @IsString()
  tcrCampaignId?: string;

  @IsOptional()
  @IsObject()
  tcrResponse?: Record<string, any>;

  @IsOptional()
  @IsObject()
  bandwidthResponse?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsObject()
  compliance?: Record<string, any>;
}
