import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ChangeProfileDto {
  @ApiProperty()
  @IsString()
  name: string
}
