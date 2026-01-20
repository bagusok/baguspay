import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { DepositModule } from 'src/deposit/deposit.module'
import { DigiflazzModule } from 'src/integrations/h2h/digiflazz/digiflazz.module'
import { BalanceModule } from 'src/integrations/payment-gateway/balance/balance.module'
import { DuitkuModule } from 'src/integrations/payment-gateway/duitku/duitku.module'
import { TripayModule } from 'src/integrations/payment-gateway/tripay/tripay.module'
import { OffersModule } from 'src/offers/offers.module'
import { OrderModule } from 'src/order/order.module'
import { ProductsModule } from 'src/products/products.module'
import { QueueModule } from 'src/queue/queue.module'
import { DigiflazzH2HCallbackService } from './h2h/digiflazz-h2h-callback.service'
import { H2HCallbackController } from './h2h/h2h-callback.controller'
import { H2HCallbackService } from './h2h/h2h-callback.service'
import { PaymentGatewayCallbackController } from './payment-gateway/payment-gateway-callback.controller'
import { PaymentGatewayCallbackService } from './payment-gateway/payment-gateway-callback.service'

@Module({
  imports: [
    DatabaseModule,
    TripayModule,
    BalanceModule,
    DigiflazzModule,
    QueueModule,
    DuitkuModule,
    OrderModule,
    ProductsModule,
    OffersModule,
    DepositModule,
  ],
  controllers: [PaymentGatewayCallbackController, H2HCallbackController],
  providers: [PaymentGatewayCallbackService, DigiflazzH2HCallbackService, H2HCallbackService],
})
export class CallbackModule {}
