import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { db } from '@repo/db';
import { PaymentMethodProvider } from '@repo/db/types';
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
    dbInstance?: Parameters<Parameters<(typeof db)['transaction']>[0]>[0],
  ) {
    switch (data.provider_name) {
      case PaymentMethodProvider.TRIPAY: {
        return this.tripayService.createTransaction(data);
      }
      // case PaymentMethodProvider.BALANCE: {
      //   const deductBalance = await this.balanceService.deductBalance(
      //     {
      //       amount: data.amount + data.fee,
      //       name: `Order #${data.id}`,
      //       ref_type: BalanceMutationRefType.ORDER,
      //       ref_id: data.id,
      //       type: BalanceMutationType.DEBIT,
      //       userId: data.user_id,
      //       notes: `Payment for order ${data.id}`,
      //     },
      //     dbInstance,
      //   );

      //   return SendResponse.success<CreatePaymentGatewayResponse>({
      //     amount: data.amount,
      //     amount_received: data.amount,
      //     customer_email: deductBalance.data.updatedUser.email,
      //     customer_name: deductBalance.data.updatedUser.name,
      //     customer_phone: data.customer_phone,
      //     fee_customer: 0,
      //     fee_merchant: data.fee,
      //     fee_type: data.fee_type,
      //     order_items: data.order_items,
      //     provider_code: data.provider_code,
      //     provider_name: data.provider_name,
      //     ref_id: deductBalance.data.mutation.id,
      //     total_fee: data.fee,
      //     expired_at: new Date(Date.now() + data.expired_in * 1000),
      //     id: data.id,
      //     status: PaymentStatus.SUCCESS,
      //   });
      // }

      case PaymentMethodProvider.DUITKU: {
        return this.duitkuService.createTransaction(data);
      }

      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }
}
