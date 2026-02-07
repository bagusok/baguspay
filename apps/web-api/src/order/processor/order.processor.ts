import { Injectable, Logger } from '@nestjs/common'
import { PaymentStatus, ProductProvider } from '@repo/db/types'
import { DatabaseService } from 'src/database/database.service'
import { OffersRepository } from 'src/offers/offers.repository'
import { ProductRepository } from 'src/products/product.repository'
import { OrderRepository } from '../order.repository'
import { DigiflazzOrderProcessor } from './digiflazz.processor'

@Injectable()
export class OrderProcessor {
  private logger = new Logger(OrderProcessor.name)

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly digiflazzProcessor: DigiflazzOrderProcessor,
    private readonly databaseService: DatabaseService,
    private readonly offerRepository: OffersRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async processOrder(orderId: string) {
    const order = await this.orderRepository.findOrderByIdWithRelation(orderId)

    if (!order) throw new Error(`Order ${orderId} not found`)

    switch (order.product_snapshot.provider_name) {
      case ProductProvider.DIGIFLAZZ:
        return this.digiflazzProcessor.handle({
          id: order.id,
          order_id: order.order_id,
          inquiry_id: order.inquiry_id,
          user_id: order.user_id,
          customer_input: order.customer_input,
          total_price: order.total_price,
          discount_price: order.discount_price,
          fee: order.fee,
          price: order.price,
          product_snapshot: {
            billing_type: order.product_snapshot.billing_type,
            product_id: order.product_snapshot.product_id,
            provider_code: order.product_snapshot.provider_code,
            provider_max_price: order.product_snapshot.provider_max_price,
          },
          offer_on_orders: order.offer_on_orders.map((o) => ({
            offer_id: o.offer.id,
          })),

          user: {
            id: order.user.id,
            role: order.user.role,
          },
        })

      default:
        throw new Error(`Unsupported provider ${order.product_snapshot.provider_name}`)
    }
  }

  async expireOrder(orderId: string) {
    const order = await this.orderRepository.findOrderByIdWithRelation(orderId)

    if (!order) {
      this.logger.warn(`Expire Order: Order ${orderId} not found`)
      return
    }

    if (order.payment_status !== PaymentStatus.PENDING) {
      this.logger.log(`Expire Order: Order ${orderId} not pending. Status: ${order.payment_status}`)
      return
    }

    await this.databaseService.db.transaction(async (tx) => {
      await this.orderRepository.updatePaymentStatus(orderId, PaymentStatus.EXPIRED, tx)

      await this.productRepository.increaseProductStockByProductId(
        order.product_snapshot.product_id,
        1,
        tx,
      )

      if (order.offer_on_orders.length > 0) {
        for (const offerOrder of order.offer_on_orders) {
          await this.offerRepository.decrementOfferUsageCount(offerOrder.offer.id, tx)
        }
      }
    })

    this.logger.log(`Expire Order: Order ${orderId} expired successfully`)
  }
}
