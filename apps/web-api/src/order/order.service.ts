import { Injectable, NotFoundException } from '@nestjs/common';
import { and, arrayContains, eq, gte, lte } from '@repo/db';
import { PaymentMethodAllowAccess, tb } from '@repo/db/types';

import { TUser } from 'src/common/types/global';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPriceBy(productId: string, user?: TUser) {
    const product = await this.databaseService.db.query.products.findFirst({
      where: and(
        eq(tb.products.id, productId),
        eq(tb.products.is_available, true),
      ),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const paymentMethods =
      await this.databaseService.db.query.paymentMethodCategories.findMany({
        columns: {
          name: true,
        },
        with: {
          payment_methods: {
            where: and(
              eq(tb.paymentMethods.is_available, true),
              arrayContains(tb.paymentMethods.allow_access, [
                PaymentMethodAllowAccess.ORDER,
              ]),
              lte(tb.paymentMethods.min_amount, product.price),
              gte(tb.paymentMethods.max_amount, product.price),
            ),
            columns: {
              id: true,
              name: true,
              fee_percentage: true,
              fee_static: true,
              is_available: true,
              cut_off_start: true,
              cut_off_end: true,
              image_url: true,
              label: true,
              is_featured: true,
              min_amount: true,
              max_amount: true,
              is_need_email: true,
              is_need_phone_number: true,
            },
          },
        },
      });

    const newPayments = paymentMethods.map((category) => ({
      ...category,
      payment_methods: category.payment_methods.map((m) => {
        const fee = this.calculateFee(
          product.price,
          m.fee_percentage / 100,
          m.fee_static,
        );

        return {
          ...m,
          payment_fee: fee,
          product_price: product.price,
          total: product.price + fee,
        };
      }),
    }));
    return SendResponse.success(newPayments);
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
