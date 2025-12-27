import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { DuitkuService } from 'src/integrations/payment-gateway/duitku/duitku.service';
import { DuitkuCallbackPayload } from 'src/integrations/payment-gateway/duitku/duitku.type';
import { TripayService } from 'src/integrations/payment-gateway/tripay/tripay.service';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';

@Injectable()
export class DepositCallbackService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly duitkuService: DuitkuService,
    private readonly tripayService: TripayService,
    private readonly balanceService: BalanceService,
  ) {}

  public async duitkuCallback(data: DuitkuCallbackPayload) {
    const verifySIgnature = this.duitkuService.verifyCallbackSignature({
      signature: data.signature,
      merchantCode: data.merchantCode,
      amount: data.amount,
      merchantOrderId: data.merchantOrderId,
    });

    if (!verifySIgnature) {
      throw new BadRequestException('Invalid signature');
    }

    const deposit = await this.databaseService.db.query.deposits.findFirst({
      where: and(
        eq(tb.deposits.deposit_id, data.merchantOrderId),
        eq(tb.deposits.status, DepositStatus.PENDING),
      ),
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found or already processed');
    }

    let depositStatus: DepositStatus = DepositStatus.FAILED;

    if (data.resultCode == '00') {
      depositStatus = DepositStatus.COMPLETED;
    }

    await this.databaseService.db.transaction(async (tx) => {
      await tx
        .update(tb.deposits)
        .set({
          status: depositStatus,
        })
        .where(eq(tb.deposits.deposit_id, data.merchantOrderId));

      if (depositStatus === DepositStatus.COMPLETED) {
        await this.balanceService.addBalance({
          userId: deposit.user_id,
          amount: deposit.amount_received,
          name: 'DEPOSIT',
          ref_type: BalanceMutationRefType.DEPOSIT,
          ref_id: deposit.deposit_id,
          type: BalanceMutationType.CREDIT,
          notes: `Deposit successful: ${deposit.deposit_id}`,
        });
      }
    });

    return SendResponse.success({
      depositId: deposit.deposit_id,
      status: depositStatus,
    });
  }

  public async tripayCallback(
    data: TripayCallbackData,
    callbackSignature: string,
  ) {
    const verifySignature = this.tripayService.verifyCallbackSignature({
      data: data,
      signature: callbackSignature,
    });

    if (!verifySignature) {
      throw new BadRequestException('Invalid signature');
    }

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
        })
        .where(eq(tb.deposits.deposit_id, data.merchant_ref));

      if (depositStatus === DepositStatus.COMPLETED) {
        await this.balanceService.addBalance({
          userId: deposit.user_id,
          amount: deposit.amount_received,
          name: 'DEPOSIT',
          ref_type: BalanceMutationRefType.DEPOSIT,
          ref_id: deposit.deposit_id,
          type: BalanceMutationType.CREDIT,
          notes: `Deposit successful: ${deposit.deposit_id}`,
        });
      }
    });

    return SendResponse.success({
      depositId: deposit.deposit_id,
      status: depositStatus,
    });
  }
}
