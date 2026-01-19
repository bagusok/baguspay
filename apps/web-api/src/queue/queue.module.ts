import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { forwardRef, Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { OrderModule } from 'src/order/order.module'
import { DepositQueueConsumer } from './deposit-queue.consumer'
import { OrderQueueConsumer } from './order-queue.consumer '
import { QueueService } from './queue.service'

@Module({
  imports: [
    forwardRef(() => OrderModule),
    DatabaseModule,
    BullModule.registerQueue({
      name: 'deposits-queue',
    }),
    BullModule.registerQueue({
      name: 'orders-queue',
    }),
    BullBoardModule.forFeature({
      adapter: BullMQAdapter,
      name: 'deposits-queue',
    }),
    BullBoardModule.forFeature({
      adapter: BullMQAdapter,
      name: 'orders-queue',
    }),
  ],

  providers: [QueueService, DepositQueueConsumer, OrderQueueConsumer],
  exports: [QueueService],
})
export class QueueModule {}
