import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator'
import { PaymentAuthType } from '../payment-auth.type'

const PIN_REGEX = /^\d{6}$/

export class SetPinDto {
  @ApiProperty({ description: '6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  pin: string

  @ApiProperty({ description: 'Confirmation for the 6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  pin_confirm: string
}

export class ChangePinDto {
  @ApiProperty({ description: 'Current 6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  current_pin: string

  @ApiProperty({ description: 'New 6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  new_pin: string

  @ApiProperty({ description: 'Confirmation for the new 6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  new_pin_confirm: string
}

export class ResetPinDto {
  @ApiProperty({ description: 'New 6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  new_pin: string

  @ApiProperty({ description: 'Confirmation for the new 6-digit PIN' })
  @IsString()
  @Matches(PIN_REGEX)
  new_pin_confirm: string
}

export class PasskeyAssertionDto {
  @ApiProperty({ required: false, description: 'Raw passkey assertion payload' })
  @IsOptional()
  assertion?: Record<string, any>
}

export class PaymentAuthDto {
  @ApiProperty({ required: false, enum: PaymentAuthType, description: 'Auth method for payment' })
  @IsOptional()
  @IsEnum(PaymentAuthType)
  payment_auth_type?: PaymentAuthType

  @ApiProperty({ required: false, description: 'Passkey assertion when using PASSKEY auth' })
  @IsOptional()
  passkey_assertion?: Record<string, any>
}
