import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'

import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { TransactionGuard } from 'src/auth/guards/transaction.guard'
import { TUser } from 'src/common/types/meta.type'
import { InquiryUniversalDto } from './dto/inquiry.universal.dto'
import { CheckoutDto, GetOrderHistoryQueryDto, OrderIdDto } from './dto/order.dto'
import { OrderService } from './services/order.service'

@ApiSecurity('access-token')
@Controller('v2/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(TransactionGuard)
  @Get('get-product-price/:productId')
  getPriceBy(@Param('productId', ParseUUIDPipe) productId: string, @CurrentUser() user: TUser) {
    return this.orderService.getPricePerPaymentMethod(productId, user)
  }

  @UseGuards(TransactionGuard)
  @Post('inquiry')
  async inquiry(
    @Body() data: InquiryUniversalDto,
    @Headers('X-Time') timestamp: number,
    @CurrentUser() user: TUser,
  ) {
    return await this.orderService.inquiry(data, timestamp, user)
  }

  @UseGuards(TransactionGuard)
  @Get('payment-method/:inquiryId')
  async getPaymentMethodByInquiry(
    @Param('inquiryId') inquiryId: string,
    @CurrentUser() user: TUser,
  ) {
    if (!inquiryId) {
      throw new BadRequestException('Inquiry ID is required')
    }
    return await this.orderService.getPaymentMethod(inquiryId, user)
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
    return await this.orderService.checkout(data, timestamp, user, ip, userAgent)
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getAllHistory(@Query() query: GetOrderHistoryQueryDto, @CurrentUser() user: TUser) {
    return await this.orderService.getAllHistory(query, user)
  }

  @UseGuards(TransactionGuard)
  @Get('check/:id')
  async checkOrder(@Param() param: OrderIdDto, @CurrentUser() user: TUser) {
    return await this.orderService.getOrderDetail(param, user)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrderDetail(@Param() param: OrderIdDto, @CurrentUser() user: TUser) {
    return await this.orderService.getOrderDetail(param, user)
  }

  @UseGuards(TransactionGuard)
  @Delete(':id')
  async cancelOrderById(@Param() param: OrderIdDto, @CurrentUser() user: TUser) {
    return await this.orderService.cancelOrder(param, user)
  }
}
