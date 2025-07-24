import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HomeModule } from './home/home.module';
import { OrderModule } from './order/order.module';
import { DepositModule } from './deposit/deposit.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentGatewayModule } from './integrations/payment-gateway/payment-gateway.module';
import { CallbackModule } from './callback/callback.module';
import { BullModule } from '@nestjs/bullmq';
import { QueueModule } from './queue/queue.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { DigiflazzModule } from './integrations/h2h/digiflazz/digiflazz.module';
import { AtlanticModule } from './integrations/h2h/atlantic/atlantic.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
