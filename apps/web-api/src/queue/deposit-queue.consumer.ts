import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { and, eq } from '@repo/db';
import { DepositStatus, tb } from '@repo/db/types';
import { Job } from 'bullmq';
import { DatabaseService } from 'src/database/database.service';

@Processor('deposits-queue')
export class DepositQueueConsumer extends WorkerHost {
  private logger = new Logger(DepositQueueConsumer.name);

  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'expired-deposit': {
        const { depositId } = job.data;

        // Fetch the deposit from the database
        const deposit = await this.databaseService.db.query.deposits.findFirst({
          where: and(
            eq(tb.deposits.deposit_id, depositId),
            eq(tb.deposits.status, DepositStatus.PENDING),
          ),
        });

        if (!deposit) {
          this.logger.warn(
            `Deposit with ID ${depositId} not found or already processed.`,
          );
          return 'Deposit not found or already processed';
        }

        await this.databaseService.db
          .update(tb.deposits)
          .set({ status: DepositStatus.EXPIRED })
          .where(eq(tb.deposits.deposit_id, depositId));

        this.logger.log(
          `Deposit with ID ${depositId} has been marked as expired.`,
        );

        return `Deposit with ID ${depositId} marked as expired`;
      }
    }
  }
}
