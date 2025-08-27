import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductBillingType } from '@repo/db/types';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetAllProductsDto {
  @ApiPropertyOptional({ description: 'Filter by category UUID' })
  @IsOptional()
  @IsUUID()
  category_id: string;

  @ApiPropertyOptional({ description: 'Text search (name, code, etc.)' })
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 50;

  @ApiPropertyOptional({
    description: 'Billing type filter',
    enum: ProductBillingType,
    default: ProductBillingType.PREPAID,
  })
  @IsOptional()
  @IsEnum(ProductBillingType)
  billing_type: ProductBillingType = ProductBillingType.PREPAID;
}
