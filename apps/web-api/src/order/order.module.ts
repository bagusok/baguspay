import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module';
import { OffersModule } from 'src/offers/offers.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { QueueModule } from 'src/queue/queue.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderV2Controller } from './order.v2.controller';
import { OrderV2Service } from './order.v2.service';

@Module({
  imports: [
    PaymentGatewayModule,
    QueueModule,
    AuthModule,
    DatabaseModule,
    OffersModule,
    PaymentsModule,
  ],
  controllers: [OrderController, OrderV2Controller],
  providers: [OrderService, OrderV2Service],
})
export class OrderModule {}
