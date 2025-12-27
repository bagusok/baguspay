import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from '@repo/db';
import {
  OrderStatus,
  PaymentMethodProvider,
  PaymentStatus,
  tb,
} from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { DuitkuService } from 'src/integrations/payment-gateway/duitku/duitku.service';
import { DuitkuCallbackPayload } from 'src/integrations/payment-gateway/duitku/duitku.type';
import { TripayService } from 'src/integrations/payment-gateway/tripay/tripay.service';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class PaymentCallbackService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly duitkuService: DuitkuService,
    private readonly tripayService: TripayService,
    private readonly queueService: QueueService,
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

    const order = await this.databaseService.db.query.orders.findFirst({
      where: and(
        eq(tb.orders.order_id, data.merchantOrderId),
        eq(tb.orders.payment_status, PaymentStatus.PENDING),
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
          columns: {
            product_id: true,
          },
        },
        offer_on_orders: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or already processed');
    }

    if (order.payment_snapshot.provider_name !== PaymentMethodProvider.DUITKU) {
      throw new BadRequestException('Payment Provider not match');
    }

    let paymentStatus: PaymentStatus = PaymentStatus.FAILED;

    if (data.resultCode == '00') {
      paymentStatus = PaymentStatus.SUCCESS;
    }

    if (paymentStatus === PaymentStatus.SUCCESS) {
      await this.databaseService.db
        .update(tb.orders)
        .set({
          order_status: OrderStatus.PENDING,
          payment_status: PaymentStatus.SUCCESS,
        })
        .where(eq(tb.orders.order_id, data.merchantOrderId));
      await this.queueService.addOrderJob(order.order_id);
    } else {
      await this.databaseService.db
        .update(tb.orders)
        .set({
          payment_status: PaymentStatus.FAILED,
        })
        .where(eq(tb.orders.order_id, data.merchantOrderId));

      await this.revertProductStock(order);
      await this.revertOfferStock(order);
    }

    return SendResponse.success({
      orderId: order.order_id,
      status: paymentStatus,
    });
  }

  public async tripayCallback(data: TripayCallbackData, cbSignature: string) {
    const verifySignature = this.tripayService.verifyCallbackSignature({
      data: data,
      signature: cbSignature,
    });

    if (!verifySignature) {
      throw new BadRequestException('Invalid signature');
    }

    const order = await this.databaseService.db.query.orders.findFirst({
      where: and(
        eq(tb.orders.order_id, data.merchant_ref),
        eq(tb.orders.payment_status, PaymentStatus.PENDING),
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
          columns: {
            product_id: true,
          },
        },
        offer_on_orders: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or already processed');
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

      await this.revertProductStock(order);
      await this.revertOfferStock(order);
    }

    return SendResponse.success({
      orderId: order.order_id,
      status:
        data.status === 'PAID' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
    });
  }

  private async revertOfferStock(order: OrderWithRelations) {
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
  }

  private async revertProductStock(order: OrderWithRelations) {
    return await this.databaseService.db
      .update(tb.products)
      .set({
        stock: sql`${tb.products.stock}::int + 1`,
      })
      .where(eq(tb.products.id, order.product_snapshot.product_id));
  }
}

type OrderWithRelations = {
  order_id: string;
  payment_snapshot: {
    provider_name: string;
    provider_code: string;
    expired_at: Date;
  };
  product_snapshot: {
    product_id: string;
  };
  offer_on_orders: {
    id: string;
  }[];
};
