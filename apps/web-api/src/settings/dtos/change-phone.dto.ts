import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber, IsStrongPassword, Validate } from 'class-validator'
import { StartsWith62Constraint } from 'src/order/dto/inquiry.universal.dto'

export class changePhoneNumberDto {
  @ApiProperty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string

  @ApiProperty()
  @IsPhoneNumber('ID')
  @Validate(StartsWith62Constraint)
  new_phone: string
}
