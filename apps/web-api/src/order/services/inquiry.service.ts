import { BadRequestException, Injectable } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { OrderStatus, ProductProvider } from '@repo/db/types'
import type { DatabaseService } from 'src/database/database.service'
import type { DigiflazzService } from 'src/integrations/h2h/digiflazz/digiflazz.service'
import type { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service'
import type { OffersService } from 'src/offers/offers.service'
import type { PaymentsService } from 'src/payments/payments.service'
import type { QueueService } from 'src/queue/queue.service'
import type { StorageService } from 'src/storage/storage.service'
import type { GetInquiryFromProviderInput } from '../types/inquiry.types'

@Injectable()
export class InquiryService {
  constructor(
    readonly _databaseService: DatabaseService,
    readonly _configService: ConfigService,
    readonly _pgService: PaymentGatewayService,
    readonly _queueService: QueueService,
    readonly _offerService: OffersService,
    readonly _paymentService: PaymentsService,
    readonly _storageService: StorageService,
    private readonly digiflazzService: DigiflazzService,
  ) {}

  async getInquiryFromProvider(data: GetInquiryFromProviderInput) {
    switch (data.product_provider_name) {
      case ProductProvider.DIGIFLAZZ: {
        const response = await this.digiflazzService.cekTagihan({
          customer_input: data.customer_input,
          provider_code: data.provider_code,
          inquiry_id: data.inquiry_id,
          amount: data.amount,
          year: data.year,
        })

        if (response.status !== OrderStatus.COMPLETED) {
          throw new BadRequestException(response.message || 'Failed to get inquiry from provider')
        }

        return response
      }

      default: {
        throw new BadRequestException('Unsupported provider for inquiry')
      }
    }
  }
}
