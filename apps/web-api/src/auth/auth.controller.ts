import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async getUsers(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @ApiHeader({
    name: 'X-Device-ID',
    description: 'Device ID from the client',
    required: true,
    examples: {
      example1: {
        value: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Example of a device ID',
      },
    },
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'User agent from the client',
    required: true,
    examples: {
      example1: {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        description: 'Example of a user agent',
      },
    },
  })
  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Headers('X-Device-ID') deviceId: string,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
  ) {
    if (!ip || !userAgent || !deviceId) {
      throw new BadRequestException('Missing required headers');
    }

    return this.authService.login(body, {
      deviceId,
      ip,
      userAgent: userAgent,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@Headers('Authorization') accessToken: string) {
    return this.authService.logout(accessToken.split(' ')[1]);
  }
}
