import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { DepositQueueConsumer } from './deposit-queue.consumer';
import { DatabaseService } from 'src/database/database.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
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
  providers: [QueueService, DepositQueueConsumer, DatabaseService],
  exports: [QueueService],
})
export class QueueModule {}
