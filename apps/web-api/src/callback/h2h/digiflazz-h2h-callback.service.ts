import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { OrderStatus } from '@repo/db/types'
import { DepositService } from 'src/deposit/deposit.service'
import { DigiflazzService } from 'src/integrations/h2h/digiflazz/digiflazz.service'
import type {
  DigiflazzPostpaidCallbackData,
  DigiflazzPrepaidCallbackData,
} from 'src/integrations/h2h/digiflazz/digiflazz.type'
import { OrderRepository } from 'src/order/order.repository'
import { RefundService } from 'src/order/services/refund.service'

@Injectable()
export class DigiflazzH2HCallbackService {
  private logger = new Logger(DigiflazzH2HCallbackService.name)

  constructor(
    private readonly orderRepository: OrderRepository,
    readonly _depositService: DepositService,
    private readonly digiflazzService: DigiflazzService,
    private readonly refundService: RefundService,
  ) {}

  async handlePrepaid(
    payload: DigiflazzPrepaidCallbackData,
    signFromPost: string,
    event: 'create' | 'update',
    order: Awaited<ReturnType<typeof this.orderRepository.findOrderByIdWithRelation>>,
  ) {
    if (event === 'create') {
      return {
        succes: true,
        message: 'Digiflazz prepaid callback received (create event), no action taken',
      }
    }

    this.logger.log('Handling Digiflazz callback', JSON.stringify(payload.data))

    const { isValid } = this.digiflazzService.verifyCallbackSignature(payload, signFromPost)

    if (!isValid) {
      this.logger.warn('Invalid Digiflazz callback signature', {
        payload,
        signFromPost,
      })
      throw new BadRequestException('Invalid callback signature')
    }

    if (order.order_status !== OrderStatus.PENDING) {
      this.logger.log(
        `Order ${payload.data.ref_id} already processed with status ${order.order_status}. Skipping.`,
      )

      throw new BadRequestException('Order already processed (not pending)')
    }

    if (payload.data.status === 'Sukses') {
      // hitung cost dan profit
      const cost = payload.data.price
      const profit = order.total_price - order.fee - cost

      await this.orderRepository.updateOrder(order.order_id, {
        order_status: OrderStatus.COMPLETED,
        cost_price: cost,
        profit,
        sn_number: payload.data.sn,
        transaction_ref: payload.data.ref_id,
        voucher_code: payload.data.sn,
        order_success_at: new Date(),
        callback_raw_response: payload.data,
      })

      this.logger.log(`Order ${payload.data.ref_id} topup successful. SN: ${payload.data.sn}`)

      return {
        succes: true,
        message: `Digiflazz prepaid callback processed: order completed`,
      }
    } else if (payload.data.status === 'Gagal') {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.FAILED)
      await this.refundService.handleFailedOrder({
        fee: order.fee,
        id: order.id,
        order_id: order.order_id,
        offer_on_orders: order.offer_on_orders.map((o) => ({ offer_id: o.offer.id })),
        product_snapshot: order.product_snapshot,
        total_price: order.total_price,
        user_id: order.user_id,
        user: order.user,
      })

      this.logger.warn(`Order ${payload.data.ref_id} topup failed: ${payload.data.message}`)

      return {
        succes: true,
        message: `Digiflazz prepaid callback processed: order failed and refunded`,
      }
    } else if (payload.data.status === 'Pending') {
      return {
        succes: true,
        message: 'Digiflazz prepaid callback received with Pending status, no action taken',
      }
    }

    return {
      succes: true,
      message: 'Digiflazz prepaid callback processed successfully',
    }
  }

  async handlePostpaid(
    payload: DigiflazzPostpaidCallbackData,
    signFromPost: string,
    event: 'create' | 'update',
    order: Awaited<ReturnType<typeof this.orderRepository.findOrderByIdWithRelation>>,
  ) {
    if (event === 'create') {
      return {
        succes: true,
        message: 'Digiflazz postpaid callback received (create event), no action taken',
      }
    }

    this.logger.log('Handling Digiflazz callback', JSON.stringify(payload.data))

    const { isValid } = this.digiflazzService.verifyCallbackSignature(payload, signFromPost)

    if (!isValid) {
      this.logger.warn('Invalid Digiflazz callback signature', {
        payload,
        signFromPost,
      })
      throw new BadRequestException('Invalid callback signature')
    }

    if (order.order_status !== OrderStatus.PENDING) {
      this.logger.log(
        `Order ${payload.data.ref_id} already processed with status ${order.order_status}. Skipping.`,
      )

      throw new BadRequestException('Order already processed (not pending)')
    }

    if (payload.data.status === 'Sukses') {
      // hitung cost dan profit
      const cost = payload.data.price
      const profit = order.total_price - order.fee - cost

      await this.orderRepository.updateOrder(order.order_id, {
        order_status: OrderStatus.COMPLETED,
        cost_price: cost,
        profit,
        sn_number: payload.data.sn,
        transaction_ref: payload.data.ref_id,
        voucher_code: payload.data.sn,
        order_success_at: new Date(),
        metadata: payload.data.desc,
        callback_raw_response: payload.data,
      })

      this.logger.log(`Order ${payload.data.ref_id} topup successful. SN: ${payload.data.sn}`)

      return {
        succes: true,
        message: `Digiflazz prepaid callback processed: order completed`,
      }
    } else if (payload.data.status === 'Gagal') {
      await this.orderRepository.updateOrderStatus(order.order_id, OrderStatus.FAILED)
      await this.refundService.handleFailedOrder({
        fee: order.fee,
        id: order.id,
        order_id: order.order_id,
        offer_on_orders: order.offer_on_orders.map((o) => ({ offer_id: o.offer.id })),
        product_snapshot: order.product_snapshot,
        total_price: order.total_price,
        user_id: order.user_id,
        user: order.user,
      })

      this.logger.warn(`Order ${payload.data.ref_id} topup failed: ${payload.data.message}`)

      return {
        succes: true,
        message: `Digiflazz prepaid callback processed: order failed and refunded`,
      }
    } else if (payload.data.status === 'Pending') {
      return {
        succes: true,
        message: 'Digiflazz prepaid callback received with Pending status, no action taken',
      }
    }

    return {
      succes: true,
      message: 'Digiflazz prepaid callback processed successfully',
    }
  }
}
