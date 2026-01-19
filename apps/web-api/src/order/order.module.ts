import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { DatabaseModule } from 'src/database/database.module'
import { DigiflazzModule } from 'src/integrations/h2h/digiflazz/digiflazz.module'
import { BalanceModule } from 'src/integrations/payment-gateway/balance/balance.module'
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module'
import { OffersModule } from 'src/offers/offers.module'
import { PaymentsModule } from 'src/payments/payments.module'
import { ProductsModule } from 'src/products/products.module'
import { QueueModule } from 'src/queue/queue.module'
import { OrderController } from './order.controller'
import { OrderRepository } from './order.repository'
import { DigiflazzOrderProcessor } from './processor/digiflazz.processor'
import { OrderProcessor } from './processor/order.processor'
import { InquiryService } from './services/inquiry.service'
import { OrderService } from './services/order.service'
import { RefundService } from './services/refund.service'

@Module({
  imports: [
    PaymentGatewayModule,
    forwardRef(() => QueueModule),
    AuthModule,
    DatabaseModule,
    OffersModule,
    PaymentsModule,
    DigiflazzModule,
    ProductsModule,
    BalanceModule,
  ],
  exports: [OrderProcessor, OrderRepository, OrderService],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    OrderService,
    InquiryService,
    RefundService,
    OrderProcessor,
    DigiflazzOrderProcessor,
  ],
})
export class OrderModule {}
