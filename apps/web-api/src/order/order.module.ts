import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module';
import { QueueModule } from 'src/queue/queue.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [PaymentGatewayModule, QueueModule, AuthModule, DatabaseModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
