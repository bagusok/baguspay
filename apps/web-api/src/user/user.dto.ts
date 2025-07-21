import { ApiProperty } from '@nestjs/swagger';
import { BalanceMutationRefType, BalanceMutationType } from '@repo/db/types';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class GetBalanceMutationHistoryQuery {
  @ApiProperty({
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @ApiProperty({ required: false, enum: BalanceMutationRefType })
  @IsOptional()
  @IsEnum(BalanceMutationRefType)
  ref_type: BalanceMutationRefType;

  @ApiProperty({ required: false, enum: BalanceMutationType })
  @IsOptional()
  @IsEnum(BalanceMutationType)
  type: BalanceMutationType;

  @ApiProperty({ required: false, type: Date })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiProperty({ required: false, type: Date })
  @IsOptional()
  @IsDateString()
  end_date?: Date;
}
