import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CallbackModule } from './callback/callback.module';
import { DatabaseModule } from './database/database.module';
import { DepositModule } from './deposit/deposit.module';
import { HomeModule } from './home/home.module';
import { AtlanticModule } from './integrations/h2h/atlantic/atlantic.module';
import { DigiflazzModule } from './integrations/h2h/digiflazz/digiflazz.module';
import { PaymentGatewayModule } from './integrations/payment-gateway/payment-gateway.module';
import { OffersModule } from './offers/offers.module';
import { OrderModule } from './order/order.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductsModule } from './products/products.module';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),

    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),

    DatabaseModule,
    AuthModule,
    UserModule,
    HomeModule,
    OrderModule,
    DepositModule,
    ProductCategoriesModule,
    PaymentsModule,
    PaymentGatewayModule,
    CallbackModule,
    QueueModule,
    DigiflazzModule,
    AtlanticModule,
    ProductsModule,
    OffersModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
