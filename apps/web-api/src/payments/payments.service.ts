import {
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { and, arrayContains, eq, gte, inArray, lte, ne, or } from '@repo/db';
import {
  PaymentMethodAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
  tb,
} from '@repo/db/types';
import { TUser } from 'src/common/types/meta.type';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllPayments() {
    const payments =
      await this.databaseService.db.query.paymentMethods.findMany({
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
      });

    return SendResponse.success<any>(payments);
  }

  async getPaymentCategoriers() {
    const categories =
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
          },
        },
      });

    return SendResponse.success<any>(categories);
  }

  async validatePaymentMethod(params: ValidatePaymentParams) {
    const {
      payment_method_id,
      total_price,
      voucher,
      user,
      payment_phone_number,
    } = params;

    const voucherPaymentMethod: string[] = [];
    if (voucher && !voucher.is_all_payment_methods) {
      const methods = await this.databaseService.db
        .select({
          pay_id: tb.offerPaymentMethods.payment_method_id,
        })
        .from(tb.offerPaymentMethods)
        .where(eq(tb.offerPaymentMethods.offer_id, voucher.id));

      voucherPaymentMethod.push(...methods.map((m) => m.pay_id));
    }

    // Query payment method
    const paymentMethod =
      await this.databaseService.db.query.paymentMethods.findFirst({
        where: and(
          eq(tb.paymentMethods.id, payment_method_id),
          eq(tb.paymentMethods.is_available, true),
          arrayContains(tb.paymentMethods.allow_access, [
            PaymentMethodAllowAccess.ORDER,
          ]),
          lte(tb.paymentMethods.min_amount, total_price),
          gte(tb.paymentMethods.max_amount, total_price),
          ...(voucher && voucherPaymentMethod.length > 0
            ? [inArray(tb.paymentMethods.id, voucherPaymentMethod)]
            : []),
          ...(!user
            ? [
                or(
                  ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
                  ne(
                    tb.paymentMethods.provider_name,
                    PaymentMethodProvider.BALANCE,
                  ),
                ),
              ]
            : []),
        ),
      });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method with ID ${payment_method_id} not found or not available.`,
      );
    }

    // Special case: balance payment
    if (
      paymentMethod.type === PaymentMethodType.BALANCE ||
      paymentMethod.provider_name === PaymentMethodProvider.BALANCE
    ) {
      if (!user) {
        throw new NotAcceptableException(
          'Payment method balance is only available for registered users.',
        );
      }
      if (user.balance < total_price) {
        throw new HttpException(
          { statusCode: 402, message: 'Insufficient balance.' },
          402,
        );
      }
    }

    if (paymentMethod.is_need_phone_number && !payment_phone_number) {
      throw new BadRequestException(
        'Payment phone number is required for this payment method.',
      );
    }

    const fee = this.calculateFee(
      total_price,
      paymentMethod.fee_percentage / 100,
      paymentMethod.fee_static,
    );

    return {
      paymentMethod,
      fee,
    };
  }

  /**
   * Hitung total fee payment method
   */
  private calculateFee(
    amount: number,
    feePercent: number,
    feeStatic: number,
  ): number {
    const total = amount / (1 - feePercent) + feeStatic / (1 - feePercent);
    const fee = total - amount;
    return Math.ceil(fee);
  }

  buildPaymentSnapshot(paymentMethod: any, expiredAt: Date) {
    return {
      name: paymentMethod.name,
      payment_method_id: paymentMethod.id,
      type: paymentMethod.type,
      provider_ref_id: paymentMethod.provider_ref_id,
      fee_static: paymentMethod.fee_static,
      fee_percentage: paymentMethod.fee_percentage,
      fee_type: paymentMethod.fee_type,
      provider_code: paymentMethod.provider_code,
      provider_name: paymentMethod.provider_name,
      allow_access: paymentMethod.allow_access,
      expired_at: expiredAt,
      created_at: new Date(),
    };
  }

  async addPaymentSnapshot(snapshot: typeof tb.paymentSnapshots.$inferInsert) {
    const inserted = await this.databaseService.db
      .insert(tb.paymentSnapshots)
      .values(snapshot)
      .returning({ id: tb.paymentSnapshots.id });

    return inserted[0];
  }
}

interface ValidatePaymentParams {
  payment_method_id: string;
  total_price: number;
  voucher?: any;
  user?: TUser;
  payment_phone_number?: string;
}
