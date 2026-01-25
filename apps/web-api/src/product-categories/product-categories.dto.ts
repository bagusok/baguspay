import { ApiProperty } from '@nestjs/swagger'
import { ProductBillingType, ProductCategoryType } from '@repo/db/types'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class ProductCategoriesQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(ProductCategoryType)
  type: ProductCategoryType

  @ApiProperty()
  @IsOptional()
  @IsEnum(ProductBillingType)
  billing_type: ProductBillingType

  @ApiProperty()
  @IsOptional()
  @IsString()
  search: string
}
