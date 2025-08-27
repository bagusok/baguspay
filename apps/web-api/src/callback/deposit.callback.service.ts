import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from '@repo/db';
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

@Injectable()
export class DepositCallbackService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly duitkuService: DuitkuService,
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
        .where(eq(tb.deposits.deposit_id, data.merchantOrderId))
        .execute();

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
      message:
        depositStatus === DepositStatus.COMPLETED
          ? 'Deposit successful'
          : 'Deposit failed',
      data: {
        depositId: deposit.deposit_id,
        status: depositStatus,
      },
    });
  }
}
