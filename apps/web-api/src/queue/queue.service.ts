import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('deposits-queue')
    private readonly depositQueue: Queue,
    @InjectQueue('orders-queue')
    private readonly orderQueue: Queue,
  ) {}

  async addExpiredDepositJob(depositId: string, delay: number) {
    this.logger.log(`Adding expired deposit job for depositId: ${depositId}`);
    await this.depositQueue.add(
      'expired-deposit',
      { depositId },
      {
        delay,
        attempts: 3,
      },
    );
  }

  async addOrderJob(orderId: string) {
    this.logger.log(`Adding order job for orderId: ${orderId}`);
    await this.orderQueue.add(
      'process-order',
      { orderId },
      {
        attempts: 3,
      },
    );
  }

  async addExpiredOrderJob(orderId: string, delay: number) {
    this.logger.log(`Adding expired order job for orderId: ${orderId}`);
    await this.orderQueue.add(
      'expired-order',
      { orderId },
      {
        delay,
        attempts: 3,
      },
    );
  }
}
