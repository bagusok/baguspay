import { Body, Controller, Headers, Ip, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';
import { TUser } from 'src/common/types/meta.type';
import {
  CheckoutDto,
  GetPriceByDto,
  PreCheckoutPrepaidDto,
} from './dtos/order.dto';
import { OrderV2Service } from './order.v2.service';

@ApiSecurity('access-token')
@Controller('v2/order')
export class OrderV2Controller {
  constructor(private readonly orderService: OrderV2Service) {}

  @UseGuards(TransactionGuard)
  @Post('product/price')
  getPriceBy(@Body() body: GetPriceByDto, @CurrentUser() user: TUser) {
    return this.orderService.getPriceBy(body.product_id, user, body.voucher_id);
  }

  @UseGuards(TransactionGuard)
  @Post('inquiry')
  async inquiry(
    @Body() data: PreCheckoutPrepaidDto,
    @Headers('X-Time') timestamp: number,
    @CurrentUser() user: TUser,
  ) {
    console.log(user);
    return await this.orderService.inquiry(data, timestamp, user);
  }

  @UseGuards(TransactionGuard)
  @Post('checkout')
  async checkoutPrepaid(
    @Body() data: CheckoutDto,
    @Headers('X-Time') timestamp: number,
    @Ip() ip: string,
    @Headers('User-Agent') userAgent: string,
    @CurrentUser() user: TUser,
  ) {
    return await this.orderService.checkout(
      data,
      timestamp,
      user,
      ip,
      userAgent,
    );
  }
}
