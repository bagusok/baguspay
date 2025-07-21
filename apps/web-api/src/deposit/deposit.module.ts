import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { DatabaseService } from 'src/database/database.service';
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [PaymentGatewayModule, QueueModule],
  controllers: [DepositController],
  providers: [DepositService, DatabaseService],
})
export class DepositModule {}
