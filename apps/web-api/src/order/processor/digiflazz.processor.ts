import { Injectable, Logger } from '@nestjs/common'
import { OrderStatus, ProductBillingType } from '@repo/db/types'
import { DigiflazzService } from 'src/integrations/h2h/digiflazz/digiflazz.service'
import { OrderRepository } from '../order.repository'
import { RefundService } from '../services/refund.service'

@Injectable()
export class DigiflazzOrderProcessor {
  private logger = new Logger(DigiflazzOrderProcessor.name)

  constructor(
    private readonly digiflazzService: DigiflazzService,
    private readonly orderRepository: OrderRepository,
    private readonly refundService: RefundService,
  ) {}

  async handle(order: DigiflazzOrder) {
    if (order.product_snapshot.billing_type !== ProductBillingType.PREPAID) {
      throw new Error(`Unsupported billing type`)
    }

    const topup = await this.digiflazzService.topup({
      provider_code: order.product_snapshot.provider_code,
      customer_input: order.customer_input,
      allow_dot: false,
      max_price: order.product_snapshot.provider_max_price,
      order_id: order.order_id,
    })

    if (topup.status === OrderStatus.COMPLETED) {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.COMPLETED)
      return `Topup success`
    }

    if (topup.status === OrderStatus.FAILED) {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.FAILED)
      await this.refundService.handleFailedOrder(order)
      return `Topup failed, refunded`
    }
  }
}

type DigiflazzOrder = {
  id: string
  order_id: string
  user_id: string | null

  total_price: number
  fee: number
  price: number
  discount_price: number

  customer_input: string

  product_snapshot: {
    billing_type: ProductBillingType
    provider_code: string
    provider_max_price: number
    product_id: string
  }

  offer_on_orders: {
    offer_id: string
  }[]
}
