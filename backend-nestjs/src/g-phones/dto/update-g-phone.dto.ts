import { PartialType } from '@nestjs/mapped-types';
import { CreateGPhoneDto } from './create-g-phone.dto';

export class UpdateGPhoneDto extends PartialType(CreateGPhoneDto) {}
