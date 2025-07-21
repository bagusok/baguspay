import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginHeaderDto, RegisterDto } from './auth.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async getUsers(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Headers() headers: LoginHeaderDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'] || '';

    if (!ip || !userAgent || !headers['x-device-id']) {
      throw new BadRequestException('Missing required headers');
    }

    return this.authService.login(body, {
      'x-device-id': headers['x-device-id'],
      ip,
      userAgent: userAgent.toString(),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logout(@Headers('Authorization') accessToken: string) {
    return this.authService.logout(accessToken.split(' ')[1]);
  }
}
