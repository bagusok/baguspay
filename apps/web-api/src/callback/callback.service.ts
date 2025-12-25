import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { and, eq, lte, sql } from '@repo/db';
import {
  BalanceMutationRefType,
  BalanceMutationType,
  DepositStatus,
  OrderStatus,
  PaymentMethodProvider,
  PaymentStatus,
  ProductProvider,
  RefundStatus,
  tb,
} from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import {
  DigiflazzCallbackData,
  DigiflazzService,
} from 'src/integrations/h2h/digiflazz/digiflazz.service';
import { BalanceService } from 'src/integrations/payment-gateway/balance/balance.service';
import { TripayApiService } from 'src/integrations/payment-gateway/tripay/tripay.api.service';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class CallbackService {
  private readonly logger = new Logger(CallbackService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tripayService: TripayApiService,
    private readonly balanceService: BalanceService,
    private readonly digiflazzService: DigiflazzService,
    private readonly queueService: QueueService,
  ) {}

  async handleTripayCallback(
    data: TripayCallbackData,
    callbackSignature: string,
  ) {
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
    } else if (data.merchant_ref.startsWith('T')) {
      const order = await this.databaseService.db.query.orders.findFirst({
        where: and(
          eq(tb.orders.order_id, data.merchant_ref),
          eq(tb.orders.payment_status, PaymentStatus.PENDING),
          eq(tb.orders.order_status, OrderStatus.NONE),
        ),
        with: {
          payment_snapshot: {
            columns: {
              provider_name: true,
              provider_code: true,
              expired_at: true,
            },
          },
          product_snapshot: {
            columns: {},
            with: {
              product: { columns: { id: true, stock: true } },
            },
          },
          offer_on_orders: {
            columns: {
              id: true,
            },
          },
        },
      });

      if (
        !order ||
        order.payment_snapshot.provider_name !== PaymentMethodProvider.TRIPAY
      ) {
        throw new BadRequestException('Order not found or not a Tripay order');
      }

      if (order.payment_snapshot.expired_at < new Date()) {
        throw new BadRequestException(
          `Order with ID ${data.merchant_ref} has expired.`,
        );
      }

      if (data.status === 'PAID') {
        await this.databaseService.db
          .update(tb.orders)
          .set({
            order_status: OrderStatus.PENDING,
            payment_status: PaymentStatus.SUCCESS,
          })
          .where(eq(tb.orders.order_id, data.merchant_ref));

        await this.queueService.addOrderJob(order.order_id);
      } else {
        await this.databaseService.db
          .update(tb.orders)
          .set({
            payment_status: PaymentStatus.FAILED,
          })
          .where(eq(tb.orders.order_id, data.merchant_ref));

        await this.databaseService.db
          .update(tb.products)
          .set({
            stock: sql`${tb.products.stock}::int + 1`,
          })
          .where(eq(tb.products.id, order.product_snapshot.product.id));
      }

      // if User Offers Update Usage Count

      if (order.offer_on_orders.length > 0) {
        for (const offer of order.offer_on_orders) {
          await this.databaseService.db
            .update(tb.offers)
            .set({
              usage_count: sql`${tb.offers.usage_count}::int - 1`,
            })
            .where(eq(tb.offers.id, offer.id));
        }
      }

      return SendResponse.success(
        { order_id: data.merchant_ref, status: data.status },
        'Order status updated successfully',
      );
    }
  }

  async handleDigiflazzPrepaidCallback(
    data: {
      data: DigiflazzCallbackData;
    },
    signFromPost: string,
    event: 'create' | 'update',
  ) {
    this.logger.log('Handling Digiflazz callback', JSON.stringify(data));

    const { isValid } = this.digiflazzService.verifyCallbackSignature(
      data,
      signFromPost,
    );

    if (!isValid) {
      this.logger.warn('Invalid Digiflazz callback signature', {
        data,
        signFromPost,
      });
      throw new BadRequestException('Invalid callback signature');
    }

    const order = await this.databaseService.db.query.orders.findFirst({
      where: and(
        eq(tb.orders.order_id, data.data.ref_id),
        eq(tb.orders.payment_status, PaymentStatus.SUCCESS),
        eq(tb.orders.order_status, OrderStatus.PENDING),
      ),
      with: {
        product_snapshot: {
          columns: {
            id: true,
            provider_code: true,
            provider_name: true,
          },
          with: {
            product: {
              columns: {
                id: true,
                stock: true,
              },
            },
          },
        },
        offer_on_orders: {
          columns: {
            id: true,
            offer_id: true,
          },
        },
      },
    });

    if (
      !order ||
      order.product_snapshot.provider_name !== ProductProvider.DIGIFLAZZ
    ) {
      this.logger.warn('Order not found or not a Digiflazz order', {
        orderId: data.data.ref_id,
      });
      throw new BadRequestException('Order not found or not a Digiflazz order');
    }

    if (data.data.status == 'Sukses') {
      await this.databaseService.db
        .update(tb.orders)
        .set({
          order_status: OrderStatus.COMPLETED,
          sn_number: data.data.sn || null,
          cost_price: data.data.price,
          profit: order.price - data.data.price - order.discount_price,
          notes: `Topup successful. SN: ${data.data.sn} wa: ${data.data.wa} tele: ${data.data.tele}`,
          order_raw_response: data.data,
        })
        .where(
          and(
            eq(tb.orders.id, order.id),
            eq(tb.orders.order_status, OrderStatus.PENDING),
            eq(tb.orders.payment_status, PaymentStatus.SUCCESS),
          ),
        );

      this.logger.log(
        `Order ${data.data.ref_id} topup successful. SN: ${data.data.sn}`,
      );
    } else if (data.data.status == 'Gagal') {
      await this.databaseService.db
        .update(tb.orders)
        .set({
          order_status: OrderStatus.FAILED,
          sn_number: '',
          cost_price: data.data.price,
          profit: order.price - data.data.price - order.discount_price,
          notes: `Topup failed: ${data.data.message}`,
          callback_raw_response: data,
        })
        .where(
          and(
            eq(tb.orders.id, order.id),
            eq(tb.orders.order_status, OrderStatus.PENDING),
            eq(tb.orders.payment_status, PaymentStatus.SUCCESS),
          ),
        );

      this.logger.warn(
        `Order ${data.data.ref_id} topup failed: ${data.data.message}`,
      );

      await this.databaseService.db
        .update(tb.products)
        .set({
          stock: sql`${tb.products.stock}::int + 1`,
        })
        .where(eq(tb.products.id, order.product_snapshot.product.id));

      // Update usage_count for offers if applicable
      if (order.offer_on_orders.length > 0) {
        for (const offer of order.offer_on_orders) {
          await this.databaseService.db
            .update(tb.offers)
            .set({
              usage_count: sql`${tb.offers.usage_count}::int - 1`,
            })
            .where(eq(tb.offers.id, offer.offer_id));
        }
      }

      // refund
      if (order.user_id) {
        this.logger.log(
          `Refunding user ${order.user_id} for failed topup order ${order.order_id}`,
        );

        await this.balanceService.addBalance({
          userId: order.user_id,
          amount: order.total_price - order.fee,
          name: `Refund Order #${order.order_id}`,
          ref_type: BalanceMutationRefType.ORDER,
          ref_id: order.order_id,
          type: BalanceMutationType.CREDIT,
          notes: `Refund for failed topup order ${order.order_id}`,
        });

        await this.databaseService.db
          .update(tb.orders)
          .set({
            refund_status: RefundStatus.COMPLETED,
          })
          .where(eq(tb.orders.id, order.id));
        this.logger.log(
          `Refund completed for user ${order.user_id} for order ${order.order_id}`,
        );
      } else {
        this.logger.warn(
          `No user found for order ${order.order_id}, skipping refund.`,
        );
      }
    } else if (data.data.status == 'Pending') {
      if (event === 'create') {
        this.logger.log(
          `Order ${data.data.ref_id} is pending. No action taken.`,
        );
      } else if (event === 'update') {
        this.logger.log(
          `Order ${data.data.ref_id} is still pending. No action taken.`,
        );
      }
    }
  }
}
