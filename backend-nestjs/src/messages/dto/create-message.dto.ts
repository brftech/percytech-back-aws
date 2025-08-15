import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
} from 'class-validator';
import {
  MessageDirection,
  MessageType,
  MessageStatus,
} from '../entities/message.entity';

export class CreateMessageDto {
  @IsNumber()
  personId: number;

  @IsOptional()
  @IsNumber()
  gPhoneId?: number;

  @IsString()
  content: string;

  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsString()
  fromNumber: string;

  @IsString()
  toNumber: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  deliveryReport?: Record<string, any>;
}
