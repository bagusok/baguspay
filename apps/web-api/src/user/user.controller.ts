import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { Request } from 'express';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { ApiSecurity } from '@nestjs/swagger';
import { TUser } from 'src/common/types/global';
import { GetBalanceMutationHistoryQuery } from './user.dto';

@ApiSecurity('access-token')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/profile')
  async getProfile(@User() user: TUser) {
    return await this.userService.getUserById(user.id);
  }

  @Get('/balance')
  async getBalance(@User() user: TUser) {
    return await this.userService.getBalance(user.id);
  }

  @Get('/balance/mutations')
  async getBalanceMutationHistory(
    @User() user: TUser,
    @Query() query: GetBalanceMutationHistoryQuery,
  ) {
    return await this.userService.getBalanceMutationHistory(query, user.id);
  }
}
