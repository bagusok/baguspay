import { Module } from '@nestjs/common';
import { BalanceModule } from './balance/balance.module';
import { PaymentGatewayService } from './payment-gateway.service';
import { TripayModule } from './tripay/tripay.module';
import { DuitkuModule } from './duitku/duitku.module';

@Module({
  providers: [PaymentGatewayService],
  imports: [TripayModule, BalanceModule, DuitkuModule],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
