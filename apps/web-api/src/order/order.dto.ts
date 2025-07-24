import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, RefundStatus } from '@repo/db/types';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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

export class InputFieldDto {
  @ApiProperty({ example: 'id', description: 'Name of the input field' })
  @IsString()
  name: string;

  @ApiProperty({ example: '79132815', description: 'Value of the input field' })
  @IsString()
  value: string;
}

export class GetPriceByDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;
}

export class PreCheckoutPrepaidDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  payment_method_id: string;

  @IsOptional()
  @ApiProperty()
  @IsUUID()
  offer_id: string;

  @ApiProperty()
  @IsPhoneNumber('ID')
  @Validate(StartsWith62Constraint)
  phone_number: string;

  @ApiProperty()
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

export class CheckoutPrepaidDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  payment_method_id: string;

  @IsOptional()
  @ApiProperty()
  @IsUUID()
  offer_id: string;

  @ApiProperty()
  @IsPhoneNumber('ID')
  @Validate(StartsWith62Constraint)
  phone_number: string;

  @ApiProperty()
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

  @ApiProperty()
  @IsString()
  checkout_token: string;
}

export class GetOrderHistoryQueryDto {
  @ApiProperty({
    required: false,
    description: 'Order ID to filter by',
    default: 'T2605MDEBDOX818AF54',
  })
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  order_status?: OrderStatus;

  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @ApiProperty({ required: false, enum: RefundStatus })
  @IsOptional()
  @IsEnum(RefundStatus)
  refund_status?: RefundStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  @Validate(Number)
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  @Validate(Number)
  @Min(10)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class OrderIdDto {
  @ApiProperty()
  @IsString()
  id: string;
}
