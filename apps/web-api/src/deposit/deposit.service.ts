import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, arrayContains, desc, eq, gte, lte, ne, or, SQL } from '@repo/db';
import {
  DepositStatus,
  PaymentMethodAllowAccess,
  PaymentMethodFeeType,
  PaymentMethodProvider,
  PaymentMethodType,
  tb,
} from '@repo/db/types';
import crypto from 'crypto';
import { TUser } from 'src/common/types/global';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service';
import { QueueService } from 'src/queue/queue.service';
import { CreateDeposit, DepositHistoryQuery } from './deposit.dto';

@Injectable()
export class DepositService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pgService: PaymentGatewayService,
    private readonly queueService: QueueService,
  ) {}

  async getDepositMethods() {
    const payments =
      await this.databaseService.db.query.paymentMethodCategories.findMany({
        with: {
          payment_methods: {
            columns: {
              id: true,
              name: true,
              fee_type: true,
              type: true,
              fee_static: true,
              fee_percentage: true,
              image_url: true,
              is_need_email: true,
              is_need_phone_number: true,
              is_available: true,
              is_featured: true,
              label: true,
              min_amount: true,
              max_amount: true,
              cut_off_start: true,
              cut_off_end: true,
            },
            where: and(
              arrayContains(tb.paymentMethods.allow_access, [
                PaymentMethodAllowAccess.DEPOSIT,
              ]),
              or(
                ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
                ne(
                  tb.paymentMethods.provider_name,
                  PaymentMethodProvider.BALANCE,
                ),
              ),
            ),
          },
        },
      });

    return SendResponse.success<any>(payments);
  }

  async getDespositHistory(query: DepositHistoryQuery, userId: string) {
    const { page, limit, deposit_id, start_date, end_date } = query;

    const where: SQL[] = [];

    if (deposit_id) {
      where.push(eq(tb.deposits.deposit_id, deposit_id));
    }

    if (start_date) {
      where.push(gte(tb.deposits.created_at, new Date(start_date)));
    }

    if (end_date) {
      where.push(lte(tb.deposits.created_at, new Date(end_date)));
    }

    const deposits = await this.databaseService.db.query.deposits.findMany({
      where: and(eq(tb.deposits.user_id, userId), ...where),
      limit: limit,
      offset: (page - 1) * limit,
      orderBy: desc(tb.deposits.created_at),
      columns: {
        id: true,
        deposit_id: true,
        amount_pay: true,
        created_at: true,
        expired_at: true,
        status: true,
      },
      with: {
        payment_method: {
          columns: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return SendResponse.success<any>(deposits);
  }

  async getDepositDetail(deposit_id: string, userId: string) {
    const deposit = await this.databaseService.db.query.deposits.findFirst({
      where: and(
        eq(tb.deposits.deposit_id, deposit_id),
        eq(tb.deposits.user_id, userId),
      ),
      with: {
        payment_method: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    return SendResponse.success<any>(
      deposit,
      'Deposit detail retrieved successfully',
    );
  }

  async createDeposit(data: CreateDeposit, user: TUser) {
    const payment =
      await this.databaseService.db.query.paymentMethods.findFirst({
        where: and(
          eq(tb.paymentMethods.id, data.payment_method_id),
          eq(tb.paymentMethods.is_available, true),
          eq(tb.paymentMethods.is_deleted, false),
          ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
          arrayContains(tb.paymentMethods.allow_access, [
            PaymentMethodAllowAccess.DEPOSIT,
          ]),
          or(
            ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
            ne(tb.paymentMethods.provider_name, PaymentMethodProvider.BALANCE),
          ),
        ),
      });

    if (!payment) {
      throw new NotFoundException('Payment method not found or not available');
    }

    if (payment.is_need_phone_number && !data.phone_number) {
      throw new BadRequestException(
        'Phone number is required for this payment method',
      );
    }

    if (data.amount < payment.min_amount || data.amount >= payment.max_amount)
      throw new BadRequestException(
        `Amount must be between ${payment.min_amount} and ${payment.max_amount}`,
      );

    let totalFee = 0;

    if (payment.fee_type !== PaymentMethodFeeType.BUYER) {
      totalFee = this.calculateFee(
        data.amount,
        payment.fee_percentage / 100,
        payment.fee_static,
      );

      const [, deposit] = await this.databaseService.db.transaction(
        async (tx) => {
          const depositId = this.generateDepositId(user.id);

          const pg = await this.pgService.createPayment({
            user_id: user.id,
            amount: data.amount,
            provider_code: payment.provider_code,
            provider_name: payment.provider_name,
            customer_email: user.email,
            customer_name: user.name,
            customer_phone: data.phone_number ?? '',
            order_items: [
              {
                name: `Deposit ${depositId}`,
                price: data.amount + totalFee,
                quantity: 1,
                product_id: depositId,
              },
            ],
            fee_type: payment.fee_type,
            id: depositId,
            expired_in: payment.expired_in,
            fee: totalFee,
          });

          const deposit = await tx
            .insert(tb.deposits)
            .values({
              ref_id: pg.data.ref_id,
              deposit_id: depositId,
              payment_method_id: payment.id,
              status: DepositStatus.PENDING,
              user_id: user.id,
              amount_pay: pg.data.amount,
              expired_at: pg.data.expired_at,
              amount_received: pg.data.amount_received,
              amount_fee: pg.data.total_fee,
              email: pg.data.customer_email,
              phone_number: data.phone_number,
              pay_code: pg.data.pay_code,
              pay_url: pg.data.pay_url,
              qr_code: pg.data.qr_code,
            })
            .returning();

          return [pg, deposit[0]];
        },
      );

      const delay = new Date(deposit?.expired_at).getTime() - Date.now();
      await this.queueService.addExpiredDepositJob(deposit.deposit_id, delay);

      return SendResponse.success(deposit);
    }
  }

  async cancelDeposit(depositId: string, userId: string) {
    const deposit = await this.databaseService.db.query.deposits.findFirst({
      where: and(
        eq(tb.deposits.deposit_id, depositId),
        eq(tb.deposits.user_id, userId),
        eq(tb.deposits.status, DepositStatus.PENDING),
      ),
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found or not cancellable');
    }

    await this.databaseService.db
      .update(tb.deposits)
      .set({
        status: DepositStatus.CANCELED,
      })
      .where(eq(tb.deposits.deposit_id, depositId))
      .execute();

    return SendResponse.success(null, 'Deposit cancelled successfully');
  }

  private generateDepositId(userId: string): string {
    const prefix = 'DEPO';
    const userPart = userId.slice(0, 4).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();

    return `${prefix}${userPart}${timestamp}${randomPart}`;
  }

  private calculateFee(
    amountReceived: number,
    feePercent: number,
    feeFixed: number,
  ): number {
    const total =
      amountReceived / (1 - feePercent) + feeFixed / (1 - feePercent);
    const fee = total - amountReceived;
    return Math.ceil(fee);
  }
}
