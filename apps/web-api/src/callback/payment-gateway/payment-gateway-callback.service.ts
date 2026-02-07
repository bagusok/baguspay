import { BadRequestException, Injectable } from '@nestjs/common'
import { PaymentMethodProvider, PaymentStatus } from '@repo/db/types'
import { SendResponse } from 'src/common/utils/response'
import { DepositService } from 'src/deposit/deposit.service'
import { DuitkuService } from 'src/integrations/payment-gateway/duitku/duitku.service'
import type { DuitkuCallbackPayload } from 'src/integrations/payment-gateway/duitku/duitku.type'
import { TripayService } from 'src/integrations/payment-gateway/tripay/tripay.service'
import type { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type'
import { OrderService } from 'src/order/services/order.service'

@Injectable()
export class PaymentGatewayCallbackService {
  constructor(
    private readonly tripayService: TripayService,
    private readonly duitkuService: DuitkuService,
    private readonly orderService: OrderService,
    private readonly depositService: DepositService,
  ) {}

  async handleTripay(payload: TripayCallbackData, signature: string) {
    const verifySignature = this.tripayService.verifyCallbackSignature({
      data: payload,
      signature: signature,
    })

    if (!verifySignature) {
      throw new BadRequestException('Invalid signature')
    }

    const paymentStatus = payload.status === 'PAID' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED

    if (payload.merchant_ref.toLowerCase().startsWith('t')) {
      const result = await this.orderService.handlePaymentCallback(
        payload.merchant_ref,
        paymentStatus,
        PaymentMethodProvider.TRIPAY,
      )

      return SendResponse.success(result)
    } else if (payload.merchant_ref.toLowerCase().startsWith('depo')) {
      const result = await this.depositService.handlePaymentCallback(
        payload.merchant_ref,
        paymentStatus,
      )

      return SendResponse.success(result)
    } else {
      throw new BadRequestException('Unknown order type')
    }
  }

  public async handleDuitku(payload: DuitkuCallbackPayload) {
    const verifySIgnature = this.duitkuService.verifyCallbackSignature({
      signature: payload.signature,
      merchantCode: payload.merchantCode,
      amount: payload.amount,
      merchantOrderId: payload.merchantOrderId,
    })

    if (!verifySIgnature) {
      throw new BadRequestException('Invalid signature')
    }

    const paymentStatus = payload.resultCode === '00' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED

    if (!payload.merchantOrderId.toLowerCase().startsWith('t')) {
      const result = await this.orderService.handlePaymentCallback(
        payload.merchantOrderId,
        paymentStatus,
        PaymentMethodProvider.DUITKU,
      )

      return SendResponse.success(result)
    } else if (payload.merchantOrderId.toLowerCase().startsWith('depo')) {
      const result = await this.depositService.handlePaymentCallback(
        payload.merchantOrderId,
        paymentStatus,
      )

      return SendResponse.success(result)
    } else {
      throw new BadRequestException('Unknown order type')
    }
  }
}
