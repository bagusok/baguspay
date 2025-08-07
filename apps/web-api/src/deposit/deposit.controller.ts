import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { TUser } from 'src/common/types/meta.type';
import {
  CreateDeposit,
  DepositHistoryQuery,
  DepositParams,
} from './deposit.dto';
import { DepositService } from './deposit.service';

@ApiSecurity('access-token')
@UseGuards(JwtAuthGuard)
@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Get('/payment-methods')
  async getDepositMethods() {
    return this.depositService.getDepositMethods();
  }

  @Get('/history')
  async getDepositHistory(
    @Query() query: DepositHistoryQuery,
    @User() user: TUser,
  ) {
    return this.depositService.getDespositHistory(query, user.id);
  }

  @Post('/create')
  async createDeposit(@Body() data: CreateDeposit, @User() user: TUser) {
    return this.depositService.createDeposit(data, user);
  }

  @ApiParam({
    name: 'depositId',
    type: String,
    description: 'The ID of the deposit to retrieve details for',
  })
  @Get('/:depositId')
  async getDepositDetail(@Param() params: DepositParams, @User() user: TUser) {
    const { depositId } = params;
    return this.depositService.getDepositDetail(depositId, user.id);
  }

  @ApiParam({
    name: 'depositId',
    type: String,
    description: 'The ID of the deposit to cancel',
  })
  @Post('/:depositId/cancel')
  async cancelDeposit(@Param() params: DepositParams, @User() user: TUser) {
    const { depositId } = params;
    return this.depositService.cancelDeposit(depositId, user.id);
  }
}
