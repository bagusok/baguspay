import { Injectable, Logger } from '@nestjs/common'
import { BalanceMutationRefType, BalanceMutationType, RefundStatus, UserRole } from '@repo/db/types'
import { DatabaseService } from 'src/database/database.service'
import { BalanceService } from 'src/integrations/payment-gateway/balance/balance.service'
import { OffersRepository } from 'src/offers/offers.repository'
import { ProductRepository } from 'src/products/product.repository'
import { OrderRepository } from '../order.repository'

@Injectable()
export class RefundService {
  private logger = new Logger(RefundService.name)

  constructor(
    private readonly balanceService: BalanceService,
    private readonly productRepository: ProductRepository,
    private readonly offerRepository: OffersRepository,
    private readonly databaseService: DatabaseService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async handleFailedOrder(order: RefundableOrder) {
    await this.databaseService.db.transaction(async (tx) => {
      if (order.user.role !== UserRole.GUEST) {
        await this.balanceService.addBalance(
          {
            amount: order.total_price - order.fee,
            name: `Refund Order #${order.order_id}`,
            ref_type: BalanceMutationRefType.ORDER,
            ref_id: order.order_id,
            type: BalanceMutationType.CREDIT,
            userId: order.user_id,
            notes: 'Refund failed order',
          },
          tx,
        )

        await this.orderRepository.updateOrderRefundStatus(
          order.order_id,
          RefundStatus.COMPLETED,
          tx,
        )
      } else {
        await this.orderRepository.updateOrderRefundStatus(
          order.order_id,
          RefundStatus.PROCESSING,
          tx,
        )
      }

      await this.productRepository.increaseProductStockByProductId(
        order.product_snapshot.product_id,
        1,
        tx,
      )

      const hasOffers = order.offer_on_orders.length > 0
      if (hasOffers) {
        for (const offerOnOrder of order.offer_on_orders) {
          await this.offerRepository.decrementOfferUsageCount(offerOnOrder.offer_id, tx)
        }
      }
    })

    this.logger.log(`Order ${order.order_id} refunded and rolled back`)
  }
}

type RefundableOrder = {
  id: string
  order_id: string
  user_id: string | null

  total_price: number
  fee: number

  product_snapshot: {
    product_id: string
  }

  offer_on_orders: {
    offer_id: string
  }[]

  user: {
    id: string
    role: UserRole
  }
}
