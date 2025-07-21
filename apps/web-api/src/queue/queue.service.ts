import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('deposits-queue')
    private readonly depositQueue: Queue,
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
}
