import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber, Validate } from 'class-validator'
import { StartsWith62Constraint } from 'src/order/dto/inquiry.universal.dto'

export class changePhoneNumberDto {
  @ApiProperty()
  @IsPhoneNumber('ID')
  @Validate(StartsWith62Constraint)
  phone: string
}
