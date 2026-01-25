import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ProductBillingType } from '@repo/db/types'
import {
  DigiflazzPostpaidCallbackData,
  DigiflazzPrepaidCallbackData,
} from 'src/integrations/h2h/digiflazz/digiflazz.type'
import { OrderRepository } from 'src/order/order.repository'
import { DigiflazzH2HCallbackService } from './digiflazz-h2h-callback.service'

@Injectable()
export class H2HCallbackService {
  private logger = new Logger(H2HCallbackService.name)

  constructor(
    private readonly digiflazzH2HCallbackService: DigiflazzH2HCallbackService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async handleDigiflazz(
    payload: DigiflazzPrepaidCallbackData | DigiflazzPostpaidCallbackData,
    signFromPost: string,
    event: 'create' | 'update',
    userAgent: 'Digiflazz-Hookshot' | 'Digiflazz-Pasca-Hookshot',
  ) {
    this.logger.log('Handling Digiflazz callback', JSON.stringify(payload.data))

    //
    let orderId = payload.data.ref_id

    if (userAgent === 'Digiflazz-Pasca-Hookshot') {
      const order = await this.orderRepository.findOrderByInquiryId(orderId)
      if (order) {
        orderId = order.order_id
      } else {
        this.logger.warn('Order not found for inquiry ID', {
          inquiryId: orderId,
        })
        throw new BadRequestException('Order not found for inquiry ID')
      }
    }

    // Get order to check billing type
    console.log('Payload Ref ID:', payload.data)
    const order = await this.orderRepository.findOrderByIdWithRelation(orderId)

    if (!order) {
      this.logger.warn('Order not found Ban', {
        orderId: payload.data.ref_id,
      })
      throw new BadRequestException('Order not found')
    }

    // Check billing type from product snapshot
    const billingType = order.product_snapshot?.billing_type

    if (!billingType) {
      this.logger.warn('Billing type not found in product snapshot', {
        orderId: payload.data.ref_id,
      })
      throw new BadRequestException('Billing type not found in product snapshot')
    }

    // Validate User-Agent matches billing type
    if (billingType === ProductBillingType.PREPAID && userAgent !== 'Digiflazz-Hookshot') {
      this.logger.warn('Invalid User-Agent for prepaid billing type', {
        orderId: payload.data.ref_id,
        expectedUserAgent: 'Digiflazz-Hookshot',
        actualUserAgent: userAgent,
      })
      throw new BadRequestException('Invalid User-Agent for prepaid billing type')
    }

    if (billingType === ProductBillingType.POSTPAID && userAgent !== 'Digiflazz-Pasca-Hookshot') {
      this.logger.warn('Invalid User-Agent for postpaid billing type', {
        orderId: payload.data.ref_id,
        expectedUserAgent: 'Digiflazz-Pasca-Hookshot',
        actualUserAgent: userAgent,
      })
      throw new BadRequestException('Invalid User-Agent for postpaid billing type')
    }

    // Route to appropriate handler based on billing type
    if (billingType === ProductBillingType.PREPAID) {
      return this.digiflazzH2HCallbackService.handlePrepaid(
        payload as DigiflazzPrepaidCallbackData,
        signFromPost,
        event,
        order,
      )
    } else if (billingType === ProductBillingType.POSTPAID) {
      return this.digiflazzH2HCallbackService.handlePostpaid(
        payload as DigiflazzPostpaidCallbackData,
        signFromPost,
        event,
        order,
      )
    } else {
      this.logger.warn('Unknown billing type', {
        orderId: payload.data.ref_id,
        billingType,
      })
      throw new BadRequestException(`Unknown billing type: $billingType`)
    }
  }
}
