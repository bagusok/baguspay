import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class GetBlogPostsDto {
  @ApiProperty({
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1

  @ApiProperty({
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  category_id?: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_by?: string
}

export class GetBlogPostsByCategorySlugDto {
  @ApiProperty({
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1

  @ApiProperty({
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10

  @ApiProperty()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_by?: string
}
