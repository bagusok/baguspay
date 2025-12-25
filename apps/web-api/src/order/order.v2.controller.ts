import {
  Body,
  Controller,
  Headers,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';
import { TUser } from 'src/common/types/meta.type';
import { PreCheckoutPrepaidDto } from './order.dto';
import { OrderV2Service } from './order.v2.service';

@ApiSecurity('access-token')
@Controller('v2/order')
export class OrderV2Controller {
  constructor(private readonly orderService: OrderV2Service) {}

  @UseGuards(TransactionGuard)
  @Post('inquiry')
  async inquiry(
    @Body() data: PreCheckoutPrepaidDto,
    @Headers('X-Time') timestamp: number,
    @Query('flash_sale') isFlashSale: boolean = false,
    @CurrentUser() user: TUser,
  ) {
    console.log(user);
    return await this.orderService.inquiry(data, timestamp, user);
  }
}
