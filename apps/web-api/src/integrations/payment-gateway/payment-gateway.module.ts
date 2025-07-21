import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { TripayModule } from './tripay/tripay.module';
import { TripayService } from './tripay/tripay.service';
import { BalanceModule } from './balance/balance.module';

@Module({
  providers: [PaymentGatewayService, TripayService],
  imports: [TripayModule, BalanceModule],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
