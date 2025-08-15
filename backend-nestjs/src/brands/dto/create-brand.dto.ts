import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsEmail,
} from 'class-validator';
import { BrandType, BrandStatus } from '../entities/brand.entity';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsEnum(BrandType)
  businessType?: BrandType;

  @IsOptional()
  @IsString()
  ein?: string;

  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  cell_phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsObject()
  compliance?: Record<string, any>;
}
