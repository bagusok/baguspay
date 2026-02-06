import { BadRequestException, Injectable } from '@nestjs/common'
import { PaymentMethodProvider } from '@repo/db/types'
import type { DBInstance } from 'src/common/types/db-instance'
import type { BalanceService } from './balance/balance.service'
import type { DuitkuService } from './duitku/duitku.service'
import type { CreatePaymentGatewayRequest } from './payment-gateway.type'
import type { TripayService } from './tripay/tripay.service'

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly tripayService: TripayService,
    private readonly duitkuService: DuitkuService,
    private readonly balanceService: BalanceService,
  ) {}

  async createPayment(data: CreatePaymentGatewayRequest, dbInstance?: DBInstance) {
    switch (data.provider_name) {
      case PaymentMethodProvider.TRIPAY: {
        return this.tripayService.createTransaction(data)
      }
      case PaymentMethodProvider.BALANCE: {
        return this.balanceService.createTransaction(data, dbInstance)
      }

      case PaymentMethodProvider.DUITKU: {
        return this.duitkuService.createTransaction(data)
      }

      default:
        throw new BadRequestException('Unsupported payment provider')
    }
  }
}
