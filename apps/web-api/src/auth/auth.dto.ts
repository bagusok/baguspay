import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail({
    require_tld: true,
  })
  email: string;

  @ApiProperty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsEmail({
    require_tld: true,
  })
  email: string;

  @ApiProperty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ValidateIf((o: RegisterDto) => o.password !== o.confirm_password)
  @Equals('password', {
    message: 'confirm_password do not match',
  })
  confirm_password: string;

  @ApiProperty()
  @IsPhoneNumber('ID')
  phone: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;
}

export class LoginHeaderDto {
  @ApiProperty({
    description: 'Device ID from the client',
  })
  @IsString()
  @IsNotEmpty()
  'x-device-id': string;
}

export class GoogleLoginDto {
  @ApiProperty()
  @IsString()
  access_token: string;

  @ApiProperty()
  @IsString()
  id_token: string;
}
