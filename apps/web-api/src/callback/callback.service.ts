import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, eq, lte } from '@repo/db';
import {
  BalanceMutationRefType,
  BalanceMutationType,
  DepositStatus,
  tb,
} from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { BalanceService } from 'src/integrations/payment-gateway/balance/balance.service';
import { TripayService } from 'src/integrations/payment-gateway/tripay/tripay.service';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';

@Injectable()
export class CallbackService {
  private readonly logger = new Logger(CallbackService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tripayService: TripayService,
    private readonly balanceService: BalanceService,
  ) {}

  async handleTripayCallback(
    data: TripayCallbackData,
    callbackSignature: string,
  ): Promise<any> {
    this.logger.log('Handling Tripay callback', JSON.stringify(data));
    const signature = this.tripayService.generateCallbackSignature(data);

    if (signature !== callbackSignature) {
      throw new BadRequestException('Invalid callback signature');
    }

    if (data.merchant_ref.startsWith('DEPO')) {
      const deposit = await this.databaseService.db.query.deposits.findFirst({
        where: and(
          eq(tb.deposits.deposit_id, data.merchant_ref),
          eq(tb.deposits.status, DepositStatus.PENDING),
          lte(tb.deposits.created_at, new Date()),
        ),
      });

      if (!deposit) {
        throw new BadRequestException('Deposit not found or already processed');
      }

      let depositStatus: DepositStatus = DepositStatus.PENDING;
      if (data.status === 'PAID') {
        depositStatus = DepositStatus.COMPLETED;
      } else if (data.status === 'FAILED') {
        depositStatus = DepositStatus.FAILED;
      } else if (data.status === 'EXPIRED') {
        depositStatus = DepositStatus.EXPIRED;
      } else if (data.status === 'REFUND') {
        depositStatus = DepositStatus.CANCELED;
      }

      await this.databaseService.db.transaction(async (tx) => {
        await tx
          .update(tb.deposits)
          .set({
            status: depositStatus,
            amount_received: data.amount_received,
            amount_fee: data.total_fee,
          })
          .where(eq(tb.deposits.deposit_id, data.merchant_ref))
          .execute();

        if (depositStatus === DepositStatus.COMPLETED) {
          await this.balanceService.addBalance({
            userId: deposit.user_id,
            amount: data.amount_received,
            name: 'DEPOSIT',
            ref_type: BalanceMutationRefType.DEPOSIT,
            ref_id: deposit.deposit_id,
            type: BalanceMutationType.CREDIT,
            notes: `Deposit successful: ${deposit.deposit_id}`,
          });
        }
      });

      return SendResponse.success(
        {
          deposit_id: data.merchant_ref,
          status: depositStatus,
        },
        'Deposit status updated successfully',
      );
    } else {
      this.logger.warn('Unsupported merchant_ref format', data.merchant_ref);
      return SendResponse.success({}, 'Unsupported merchant_ref format');
    }
  }
}
