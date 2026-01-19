import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class RedeemVoucherDto {
  @ApiProperty()
  @IsString()
  code: string

  @ApiProperty()
  @IsUUID()
  product_id: string
}
