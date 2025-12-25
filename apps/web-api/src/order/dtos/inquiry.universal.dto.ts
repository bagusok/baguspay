import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsUUID,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InputFieldDto } from './input.fields.dto';

@ValidatorConstraint({ name: 'StartsWith62', async: false })
export class StartsWith62Constraint implements ValidatorConstraintInterface {
  validate(phone: string) {
    if (!phone) return true;
    return phone.startsWith('62');
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.property} must start with 62`;
  }
}

export class InquiryUniversalDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  payment_method_id: string;

  @IsOptional()
  @ApiProperty()
  @IsUUID()
  voucher_id: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Optional phone number of the user, must start with 62',
    example: '6281234567890',
  })
  @IsOptional()
  @IsPhoneNumber('ID')
  @Validate(StartsWith62Constraint)
  phone_number: string;

  @ApiProperty({
    required: true,
    type: String,
    description: 'Optional email address of the user',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Optional payment phone number, must start with 62',
    example: '6281234567890',
  })
  @IsOptional()
  @Validate(StartsWith62Constraint)
  payment_phone_number?: string;

  @ApiProperty({
    required: false,
    type: [InputFieldDto],
    description: 'Optional array of input fields, each with a name property',
    example: [{ name: 'id', value: '79132815' }],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InputFieldDto)
  input_fields?: InputFieldDto[];
}
