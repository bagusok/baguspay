import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { DigiflazzModule } from 'src/integrations/h2h/digiflazz/digiflazz.module';
import { BalanceModule } from 'src/integrations/payment-gateway/balance/balance.module';
import { DuitkuModule } from 'src/integrations/payment-gateway/duitku/duitku.module';
import { TripayModule } from 'src/integrations/payment-gateway/tripay/tripay.module';
import { QueueModule } from 'src/queue/queue.module';
import { CallbackController } from './callback.controller';
import { CallbackService } from './callback.service';
import { DepositCallbackService } from './deposit.callback.service';
import { PaymentCallbackService } from './payment.callback.service';

@Module({
  imports: [
    DatabaseModule,
    TripayModule,
    BalanceModule,
    DigiflazzModule,
    QueueModule,
    DuitkuModule,
  ],
  controllers: [CallbackController],
  providers: [CallbackService, DepositCallbackService, PaymentCallbackService],
})
export class CallbackModule {}
