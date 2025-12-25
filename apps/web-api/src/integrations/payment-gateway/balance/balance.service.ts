import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { eq, sql } from '@repo/db';
import {
  BalanceMutationRefType,
  BalanceMutationType,
  PaymentStatus,
  tb,
} from '@repo/db/types';
import { DBInstance } from 'src/common/types/db-instance';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import {
  CreatePaymentGatewayRequest,
  CreatePaymentGatewayResponse,
} from '../payment-gateway.type';
import { PaymentGateway } from '../payment.interface';

@Injectable()
export class BalanceService implements PaymentGateway {
  private readonly logger = new Logger(BalanceService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async createTransaction(
    data: CreatePaymentGatewayRequest,
    dbInstance?: DBInstance,
  ): Promise<CreatePaymentGatewayResponse> {
    await this.deductBalance(
      {
        amount: data.amount,
        name: `Order #${data.id}`,
        ref_type: BalanceMutationRefType.ORDER,
        ref_id: data.id,
        type: BalanceMutationType.DEBIT,
        userId: data.user_id,
        notes: `Payment for order ${data.id}`,
      },
      dbInstance,
    );

    return {
      amount: data.amount,
      amount_received: data.amount,
      fee_type: data.fee_type,
      amount_total: data.amount,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      expired_at: new Date(Date.now() + 60 * 60 * 1000),
      id: data.id,
      order_items: data.order_items,
      provider_code: data.provider_code,
      provider_name: data.provider_name,
      ref_id: data.id,
      total_fee: 0,
      customer_phone: data.customer_phone,
      pay_url: null,
      pay_code: null,
      qr_code: null,
      qr_url: null,
      status: PaymentStatus.SUCCESS,
    };
  }

  handleCallback(data: any): Promise<any> {
    return null;
  }

  calculateFee(
    amountReceived: number,
    feePercent: number,
    feeFixed: number,
  ): number {
    return null;
  }

  cancelTransaction(data: any): Promise<any> {
    return null;
  }

  async addBalance(data: AddBalanceRequest, dbInstance?: DBInstance) {
    const db = dbInstance || this.databaseService.db;

    const [, addMutation, updatedUser] = await db.transaction(
      async (tx) => {
        const [user] = await tx
          .select()
          .from(tb.users)
          .where(eq(tb.users.id, data.userId))
          .for('update');

        if (!user) {
          throw new UnprocessableEntityException(
            `User with ID ${data.userId} not found`,
          );
        }

        const [addMutation] = await tx
          .insert(tb.balanceMutations)
          .values({
            name: data.name,
            user_id: data.userId,
            amount: data.amount,
            ref_type: data.ref_type,
            ref_id: data.ref_id || '',
            type: data.type,
            notes: data.notes || '',
            balance_after: sql`${user.balance}::int + ${data.amount}::int`,
            balance_before: user.balance,
          })
          .returning();

        const [updatedUser] = await tx
          .update(tb.users)
          .set({
            balance: sql`${user.balance}::int + ${data.amount}::int`,
          })
          .where(eq(tb.users.id, data.userId))
          .returning();

        return [user, addMutation, updatedUser];
      },
      {
        isolationLevel: 'read committed',
        accessMode: 'read write',
      },
    );

    return SendResponse.success({
      updatedUser: updatedUser,
      mutation: addMutation,
    });
  }

  async deductBalance(data: AddBalanceRequest, dbInstance?: DBInstance) {
    const db = dbInstance || this.databaseService.db;

    const [, deductMutation, updatedUser] = await db.transaction(
      async (tx) => {
        const [user] = await tx
          .select()
          .from(tb.users)
          .where(eq(tb.users.id, data.userId))
          .for('update');

        if (!user) {
          throw new UnprocessableEntityException(
            `User with ID ${data.userId} not found`,
          );
        }

        if (user.balance < data.amount) {
          throw new UnprocessableEntityException(
            `Insufficient balance for user with ID ${data.userId}`,
          );
        }

        const [deductMutation] = await tx
          .insert(tb.balanceMutations)
          .values({
            name: data.name,
            user_id: data.userId,
            amount: -data.amount,
            ref_type: data.ref_type,
            ref_id: data.ref_id || '',
            type: data.type,
            notes: data.notes || '',
            balance_after: sql`${user.balance}::int - ${data.amount}::int`,
            balance_before: user.balance,
          })
          .returning();

        const [updatedUser] = await tx
          .update(tb.users)
          .set({
            balance: sql`${user.balance}::int - ${data.amount}::int`,
          })
          .where(eq(tb.users.id, data.userId))
          .returning();

        return [user, deductMutation, updatedUser];
      },
      {
        isolationLevel: 'read committed',
        accessMode: 'read write',
      },
    );

    return SendResponse.success({
      updatedUser: updatedUser,
      mutation: deductMutation,
    });
  }
}

type AddBalanceRequest = {
  name: string;
  userId: string;
  amount: number;
  ref_type: BalanceMutationRefType;
  ref_id?: string;
  type: BalanceMutationType;
  notes?: string;
};
