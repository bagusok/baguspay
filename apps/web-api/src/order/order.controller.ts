import {
  Body,
  Controller,
  Headers,
  Ip,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { TUser } from 'src/common/types/global';
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

  @UseGuards(JwtAuthGuard)
  @Post('products/price')
  getPriceBy(
    @Body() body: GetPriceByDto,
    @Query('flash_sale') isFlashSale: boolean = false,
    @User() user?: TUser,
  ) {
    return this.orderService.getPriceBy(
      body.product_id,
      isFlashSale,
      body.voucher_id,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('prepaid/pre-checkout')
  async preCheckoutPrepaid(
    @Body() data: PreCheckoutPrepaidDto,
    @Headers('X-Time') timestamp: number,
    @Query('flash_sale') isFlashSale: boolean = false,
    @User() user: TUser,
  ) {
    return await this.orderService.preCheckoutPrepaid(
      data,
      timestamp,
      isFlashSale,
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('prepaid/checkout')
  async checkoutPrepaid(
    @Body() data: CheckoutPrepaidDto,
    @Headers('X-Time') timestamp: number,
    @User() user: TUser,
    @Query('flash_sale') isFlashSale: boolean = false,
    @Ip() ip: string,
    @Headers('User-Agent') userAgent: string,
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
  @Post('history')
  async getHistory(
    @Query() query: GetOrderHistoryQueryDto,
    @User() user: TUser,
  ) {
    return await this.orderService.getHistory(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async getOrderById(@Param() param: OrderIdDto, @User() user: TUser) {
    return await this.orderService.getById(param, user);
  }
}
