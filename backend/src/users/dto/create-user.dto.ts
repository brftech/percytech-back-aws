import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from "class-validator";
import { UserStatus, LoginMethod } from "../entities/user.entity";

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(LoginMethod)
  preferredLoginMethod?: LoginMethod;
}
