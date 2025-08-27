import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TransactionGuard } from 'src/auth/guards/transaction.guard';
import { User } from 'src/common/decorators/user.decorator';

import { TUser } from 'src/common/types/meta.type';
import {
  CheckoutPrepaidDto,
  GetOrderHistoryQueryDto,
  GetPriceByDto,
  OrderIdDto,
  PreCheckoutPrepaidDto,
} from './order.dto';
import { OrderService } from './order.service';

@ApiSecurity('access-token')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(TransactionGuard)
  @Post('products/price')
  getPriceBy(
    @Body() body: GetPriceByDto,
    @Query('flash_sale') isFlashSale: boolean = false,
    @CurrentUser() user: TUser,
  ) {
    return this.orderService.getPriceBy(
      body.product_id,
      isFlashSale,
      body.voucher_id,
      user,
    );
  }

  @UseGuards(TransactionGuard)
  @Post('prepaid/pre-checkout')
  async preCheckoutPrepaid(
    @Body() data: PreCheckoutPrepaidDto,
    @Headers('X-Time') timestamp: number,
    @Query('flash_sale') isFlashSale: boolean = false,
    @CurrentUser() user: TUser,
  ) {
    console.log(user);
    return await this.orderService.preCheckoutPrepaid(
      data,
      timestamp,
      isFlashSale,
      user,
    );
  }

  @UseGuards(TransactionGuard)
  @Post('prepaid/checkout')
  async checkoutPrepaid(
    @Body() data: CheckoutPrepaidDto,
    @Headers('X-Time') timestamp: number,
    @Query('flash_sale') isFlashSale: boolean = false,
    @Ip() ip: string,
    @Headers('User-Agent') userAgent: string,
    @CurrentUser() user: TUser,
  ) {
    return await this.orderService.checkoutPrepaid(
      data,
      timestamp,
      isFlashSale,
      user,
      ip,
      userAgent,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(
    @Query() query: GetOrderHistoryQueryDto,
    @User() user: TUser,
  ) {
    return await this.orderService.getHistory(query, user);
  }

  @Post('check/:id')
  async getOrderIdByGuest(@Param() param: OrderIdDto) {
    return await this.orderService.getByIdByGuest(param);
  }

  @UseGuards(TransactionGuard)
  @Post(':id')
  async getOrderById(@Param() param: OrderIdDto, @User() user: TUser) {
    return await this.orderService.getById(param, user);
  }

  @UseGuards(TransactionGuard)
  @Delete(':id')
  async cancelOrderById(@Param() param: OrderIdDto, @User() user: TUser) {
    return await this.orderService.cancelOrder(param, user);
  }
}
