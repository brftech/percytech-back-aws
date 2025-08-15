import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ConversationStatus } from '../entities/conversation.entity';

export class CreateConversationDto {
  @IsNumber()
  personId: number;

  @IsNumber()
  inboxId: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
