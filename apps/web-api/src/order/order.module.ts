import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module';
import { QueueModule } from 'src/queue/queue.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [PaymentGatewayModule, QueueModule],
  controllers: [OrderController],
  providers: [OrderService, DatabaseService],
})
export class OrderModule {}
