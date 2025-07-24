import { Module } from '@nestjs/common';
import { BalanceModule } from './balance/balance.module';
import { PaymentGatewayService } from './payment-gateway.service';
import { TripayModule } from './tripay/tripay.module';

@Module({
  providers: [PaymentGatewayService],
  imports: [TripayModule, BalanceModule],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
