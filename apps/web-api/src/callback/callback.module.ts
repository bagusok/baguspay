import { Module } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { CallbackController } from './callback.controller';
import { DatabaseService } from 'src/database/database.service';
import { TripayService } from 'src/integrations/payment-gateway/tripay/tripay.service';
import { BalanceService } from 'src/integrations/payment-gateway/balance/balance.service';

@Module({
  controllers: [CallbackController],
  providers: [CallbackService, DatabaseService, TripayService, BalanceService],
})
export class CallbackModule {}
