import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { and, eq, sql } from '@repo/db';
import {
  BalanceMutationRefType,
  BalanceMutationType,
  OrderStatus,
  PaymentStatus,
  ProductBillingType,
  ProductProvider,
  RefundStatus,
  tb,
} from '@repo/db/types';
import { Job } from 'bullmq';
import { DatabaseService } from 'src/database/database.service';
import { DigiflazzService } from 'src/integrations/h2h/digiflazz/digiflazz.service';
import { BalanceService } from 'src/integrations/payment-gateway/balance/balance.service';

@Processor('orders-queue')
export class OrderQueueConsumer extends WorkerHost {
  private logger = new Logger(OrderQueueConsumer.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly digiflazzService: DigiflazzService,
    private balanceService: BalanceService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    switch (job.name) {
      case 'process-order':
        {
          this.logger.log(`Processing order job for orderId: ${job.id}`);

          const { orderId } = job.data;
          const order = await this.databaseService.db.query.orders.findFirst({
            where: and(
              eq(tb.orders.order_id, orderId),
              eq(tb.orders.payment_status, PaymentStatus.SUCCESS),
            ),
            with: {
              product_snapshot: {
                with: {
                  product: {
                    columns: {
                      id: true,
                      name: true,
                      sku_code: true,
                      stock: true,
                    },
                  },
                },
              },
              payment_snapshot: true,
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
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

          if (!order) {
            this.logger.error(
              `Process Order: Order with ID ${orderId} not found.`,
            );
            return 'Order not found';
          }

          switch (order.product_snapshot.provider_name) {
            case ProductProvider.DIGIFLAZZ: {
              if (
                order.product_snapshot.billing_type ==
                ProductBillingType.PREPAID
              ) {
                const topup = await this.digiflazzService.topup({
                  provider_code: order.product_snapshot.provider_code,
                  customer_input: order.customer_input,
                  allow_dot: false,
                  max_price: order.product_snapshot.provider_max_price,
                  order_id: order.order_id,
                });

                if (
                  topup.data.status == OrderStatus.PENDING ||
                  topup.data.status == OrderStatus.FAILED
                ) {
                  this.logger.error(
                    `Process Order: ${topup.data.status} to topup for order ${orderId}. Status: ${topup.data.status}`,
                  );

                  await this.databaseService.db
                    .update(tb.orders)
                    .set({
                      order_status: topup.data.status,
                      order_raw_response: topup.data,
                    })
                    .where(eq(tb.orders.id, order.id));

                  //  Refund process Jika User gagal topup
                  if (topup.data.status === OrderStatus.FAILED) {
                    if (order.user_id) {
                      const refund = await this.balanceService.addBalance({
                        amount: order.total_price - order.fee,
                        name: `Refund Order #${order.order_id}`,
                        ref_type: BalanceMutationRefType.ORDER,
                        ref_id: order.order_id,
                        type: BalanceMutationType.CREDIT,
                        userId: order.user_id,
                        notes: `Refund for order ${order.order_id} due to failed topup`,
                      });

                      this.logger.log(
                        `Refunded ${refund.data.mutation.amount} to user ${order.user.name} for order #${order.order_id}`,
                      );

                      await this.databaseService.db
                        .update(tb.orders)
                        .set({
                          refund_status: RefundStatus.COMPLETED,
                        })
                        .where(eq(tb.orders.id, order.id));
                    }

                    await this.databaseService.db
                      .update(tb.products)
                      .set({
                        stock: sql`${tb.products.stock}::int + 1`,
                      })
                      .where(
                        eq(tb.products.id, order.product_snapshot.product_id),
                      );

                    // update usage_count if offer is used
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
                  }

                  return `Topup failed or pending, order status updated. ${topup.data.status}, order ID: ${orderId}`;
                } else if (topup.data.status == OrderStatus.COMPLETED) {
                  this.logger.log(
                    `Process Order: Topup successful for order ${orderId}.`,
                  );

                  await this.databaseService.db
                    .update(tb.orders)
                    .set({
                      order_status: topup.data.status,
                      cost_price: topup.data.provider_price,
                      profit:
                        order.price -
                        topup.data.provider_price -
                        order.discount_price,
                      sn_number: topup.data.sn || null,
                      notes: `Topup successful. SN: ${topup.data.sn} wa: ${topup.data.wa} tele: ${topup.data.tele}`,
                      order_raw_response: topup.data,
                    })
                    .where(eq(tb.orders.id, order.id));
                }

                return `Topup processed for order ${orderId}. Status: ${topup.data.status}`;
              }

              break;
            }
            default:
              this.logger.warn(
                `Process Order: Unsupported provider ${order.payment_snapshot.provider_name}.`,
              );
              return `Unsupported provider ${order.payment_snapshot.provider_name}`;
          }
        }
        break;

      case 'expired-order': {
        this.logger.log(`Processing expired order job for orderId: ${job.id}`);

        const { orderId } = job.data;
        const order = await this.databaseService.db.query.orders.findFirst({
          where: and(
            eq(tb.orders.order_id, orderId),
            eq(tb.orders.payment_status, PaymentStatus.PENDING),
          ),
          with: {
            product_snapshot: {
              columns: {},
              with: {
                product: { columns: { id: true, stock: true } },
              },
            },
          },
        });

        if (!order) {
          this.logger.warn(
            `Expired Order: Order with ID ${orderId} not found.`,
          );
          return 'Order not found';
        }

        await this.databaseService.db
          .update(tb.orders)
          .set({ payment_status: PaymentStatus.EXPIRED })
          .where(
            and(
              eq(tb.orders.id, order.id),
              eq(tb.orders.payment_status, PaymentStatus.PENDING),
            ),
          );

        await this.databaseService.db
          .update(tb.products)
          .set({
            stock: order.product_snapshot.product.stock + 1,
          })
          .where(eq(tb.products.id, order.product_snapshot.product.id));

        this.logger.log(`Order with ID ${orderId} has been marked as expired.`);
        return `Order with ID ${orderId} has been marked as expired.`;
      }
      default:
        this.logger.warn(`Process Order: Unknown job name ${job.name}.`);
        return `Unknown job name ${job.name}.`;
    }
  }
}
