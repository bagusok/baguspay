import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsStrongPassword } from 'class-validator'

export class ChangeEmailDto {
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
  @IsEmail()
  new_email: string
}
