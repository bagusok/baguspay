import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'
import { Match } from 'src/common/decorators/match.decorator'

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'The current password of the user',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  old_password: string

  @ApiProperty({
    example: 'newPassword456',
    description: 'The new password to be set for the user',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  new_password: string

  @ApiProperty({
    example: 'newPassword456',
    description: 'Confirmation of the new password',
  })
  @IsString()
  @IsNotEmpty()
  @Match(ChangePasswordDto, (o) => o.new_password, {
    message: 'confirm_new_password must match new_password',
  })
  confirm_new_password: string
}
