import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiSecurity } from '@nestjs/swagger';
import { GetPriceByDto } from './order.dto';

@ApiSecurity('access-token')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('products/price')
  getPriceBy(@Body() body: GetPriceByDto) {
    return this.orderService.getPriceBy(body.product_id);
  }
}
