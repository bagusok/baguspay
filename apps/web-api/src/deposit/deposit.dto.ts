import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class DepositHistoryQuery {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deposit_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class CreateDeposit {
  @ApiProperty()
  @IsUUID()
  payment_method_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({ required: false })
  @IsPhoneNumber('ID')
  @IsOptional()
  phone_number?: string;
}

export class DepositParams {
  @ApiProperty()
  @IsString()
  depositId: string;
}
