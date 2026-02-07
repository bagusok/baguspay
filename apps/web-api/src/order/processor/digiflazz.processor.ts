import { Injectable, Logger } from '@nestjs/common'
import { OrderStatus, ProductBillingType, type UserRole } from '@repo/db/types'
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
    switch (order.product_snapshot.billing_type) {
      case ProductBillingType.PREPAID:
        return await this.processPrepaid(order)
      case ProductBillingType.POSTPAID:
        return await this.processPostpaid(order)
      default:
        this.logger.warn(
          `Unsupported Digiflazz billing type: ${order.product_snapshot.billing_type} for order ${order.order_id}`,
        )
        return
    }
  }

  async processPrepaid(order: DigiflazzOrder) {
    const topup = await this.digiflazzService.topup({
      provider_code: order.product_snapshot.provider_code,
      customer_input: order.customer_input,
      allow_dot: false,
      max_price: order.product_snapshot.provider_max_price,
      order_id: order.order_id,
    })

    if (topup.status === OrderStatus.COMPLETED) {
      // hitung cost dan profit
      const cost = topup.provider_price
      const profit = order.total_price - order.fee - cost

      await this.orderRepository.updateOrder(order.order_id, {
        order_status: OrderStatus.COMPLETED,
        sn_number: topup.sn,
        transaction_ref: topup.order_id,
        voucher_code: topup.sn,
        order_success_at: new Date(),
        cost_price: cost,
        profit: profit,
        callback_raw_response: topup.raw,
      })
      return `Topup success`
    }

    if (topup.status === OrderStatus.FAILED) {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.FAILED)
      await this.refundService.handleFailedOrder(order)
      return `Topup failed, refunded`
    }

    if (topup.status === OrderStatus.PENDING) {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.PENDING)
      return `Topup pending`
    }
  }

  async processPostpaid(order: DigiflazzOrder) {
    const topup = await this.digiflazzService.bayarTagihan({
      customer_input: order.customer_input,
      inquiry_id: order.inquiry_id,
      order_id: order.order_id,
      provider_code: order.product_snapshot.provider_code,
    })

    if (topup.status === OrderStatus.COMPLETED) {
      // hitung cost dan profit
      const cost = topup.provider_price
      const profit = order.total_price - order.fee - cost

      await this.orderRepository.updateOrder(order.order_id, {
        order_status: OrderStatus.COMPLETED,
        sn_number: topup.sn,
        transaction_ref: topup.order_id,
        order_success_at: new Date(),
        cost_price: cost,
        profit: profit,
        callback_raw_response: topup.raw,
        metadata: topup.desc,
      })
      return `Bayar Tagihan success`
    }

    if (topup.status === OrderStatus.FAILED) {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.FAILED)
      await this.refundService.handleFailedOrder(order)
      return `Bayar Tagihan, refunded`
    }

    if (topup.status === OrderStatus.PENDING) {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.PENDING)
      return `Bayar Tagihan pending`
    }
  }
}

type DigiflazzOrder = {
  id: string
  order_id: string
  inquiry_id: string
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

  user: {
    id: string
    role: UserRole
  }
}
