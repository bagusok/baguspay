import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetPriceByDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;
}
