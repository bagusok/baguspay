import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentMethodProvider } from '@repo/db/types';
import { DBInstance } from 'src/common/types/db-instance';
import { BalanceService } from './balance/balance.service';
import { DuitkuService } from './duitku/duitku.service';
import { CreatePaymentGatewayRequest } from './payment-gateway.type';
import { TripayService } from './tripay/tripay.service';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private readonly tripayService: TripayService,
    private readonly duitkuService: DuitkuService,
    private readonly balanceService: BalanceService,
  ) {}

  async createPayment(
    data: CreatePaymentGatewayRequest,
    dbInstance?: DBInstance,
  ) {
    switch (data.provider_name) {
      case PaymentMethodProvider.TRIPAY: {
        return this.tripayService.createTransaction(data);
      }
      case PaymentMethodProvider.BALANCE: {
        return this.balanceService.createTransaction(data, dbInstance);
      }

      case PaymentMethodProvider.DUITKU: {
        return this.duitkuService.createTransaction(data);
      }

      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }
}
