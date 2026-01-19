import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OrderStatus, ProductProvider } from '@repo/db/types'
import { DatabaseService } from 'src/database/database.service'
import { DigiflazzService } from 'src/integrations/h2h/digiflazz/digiflazz.service'
import { PaymentGatewayService } from 'src/integrations/payment-gateway/payment-gateway.service'
import { OffersService } from 'src/offers/offers.service'
import { PaymentsService } from 'src/payments/payments.service'
import { QueueService } from 'src/queue/queue.service'
import { StorageService } from 'src/storage/storage.service'
import { GetInquiryFromProviderInput } from '../types/inquiry.types'

@Injectable()
export class InquiryService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly pgService: PaymentGatewayService,
    private readonly queueService: QueueService,
    private readonly offerService: OffersService,
    private readonly paymentService: PaymentsService,
    private readonly storageService: StorageService,
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
