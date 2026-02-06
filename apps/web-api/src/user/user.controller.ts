import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common'

import { ApiSecurity } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { TransactionGuard } from 'src/auth/guards/transaction.guard'
import { User } from 'src/common/decorators/user.decorator'
import type { TUser } from 'src/common/types/meta.type'
import type { GetBalanceMutationHistoryQuery } from './user.dto'
import type { UserService } from './user.service'

@ApiSecurity('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(TransactionGuard)
  @Get('/me')
  me(@User() user: TUser) {
    return this.userService.me(user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@User() user: TUser) {
    return await this.userService.getUserById(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/balance')
  async getBalance(@User() user: TUser) {
    return await this.userService.getBalance(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/balance/mutations')
  async getBalanceMutationHistory(
    @User() user: TUser,
    @Query() query: GetBalanceMutationHistoryQuery,
  ) {
    return await this.userService.getBalanceMutationHistory(query, user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/dashboard')
  async dashboard(@User() user: TUser) {
    return await this.userService.dashboard(user)
  }

  // Sessions
  @UseGuards(JwtAuthGuard)
  @Get('/sessions')
  async getUserSessions(@User() user: TUser, @Headers('Authorization') authHeader: string) {
    const accessToken = authHeader?.replace('Bearer ', '')
    return await this.userService.getAllSessions(user, accessToken)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/sessions/:sessionId/destroy')
  async destroyUserSession(
    @User() user: TUser,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    return await this.userService.destroySession(user, sessionId)
  }
}
