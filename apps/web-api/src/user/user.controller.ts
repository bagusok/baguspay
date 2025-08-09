import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';
import { User } from 'src/common/decorators/user.decorator';
import { TUser } from 'src/common/types/meta.type';
import { GetBalanceMutationHistoryQuery } from './user.dto';
import { UserService } from './user.service';

@ApiSecurity('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(TransactionGuard)
  @Get('/me')
  me(@User() user: TUser) {
    return this.userService.me(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@User() user: TUser) {
    return await this.userService.getUserById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/balance')
  async getBalance(@User() user: TUser) {
    return await this.userService.getBalance(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/balance/mutations')
  async getBalanceMutationHistory(
    @User() user: TUser,
    @Query() query: GetBalanceMutationHistoryQuery,
  ) {
    return await this.userService.getBalanceMutationHistory(query, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/dashboard')
  async dashboard(@User() user: TUser) {
    return await this.userService.dashboard(user);
  }
}
