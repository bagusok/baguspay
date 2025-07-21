import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TripayService } from './tripay/tripay.service';
import {
  PaymentMethodFeeType,
  PaymentMethodProvider,
  PaymentStatus,
} from '@repo/db/types';
import {
  CreatePaymentGatewayResponse,
  CreatePaymentGatewayRequest,
} from './payment-gateway.type';
import {
  TripayCreateClosedPaymentRequest,
  TripayPaymentMethodCode,
} from './tripay/tripay.type';
import { SendResponse } from 'src/common/utils/response';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly tripayService: TripayService) {}

  async createPayment(data: CreatePaymentGatewayRequest) {
    switch (data.provider_name) {
      case PaymentMethodProvider.TRIPAY: {
        const expiredTime = Math.floor(Date.now() / 1000) + data.expired_in;

        let amount = 0;

        if (data.fee_type == PaymentMethodFeeType.BUYER) {
          amount = data.amount;
        } else {
          amount = data.amount + data.fee;
        }

        const _data: TripayCreateClosedPaymentRequest = {
          amount: amount,
          method: data.provider_code as TripayPaymentMethodCode,
          customer_email: data.customer_email,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          merchant_ref: data.id,
          order_items: data.order_items,
          callback_url: data.callback_url,
          expired_time: expiredTime,
          return_url: data.return_url,
        };

        const tripay = await this.tripayService.createClosedPayment(_data);

        return SendResponse.success<CreatePaymentGatewayResponse>({
          amount: tripay.data.amount,
          customer_email: tripay.data.customer_email,
          customer_name: tripay.data.customer_name,
          customer_phone: tripay.data.customer_phone,
          fee_customer: tripay.data.fee_customer,
          amount_received: tripay.data.amount_received,
          fee_merchant: tripay.data.fee_merchant,
          fee_type: data.fee_type,
          order_items: tripay.data.order_items,
          provider_code: data.provider_code,
          provider_name: data.provider_name,
          ref_id: tripay.data.reference,
          total_fee: tripay.data.total_fee,
          callback_url: tripay.data.callback_url,
          checkout_url: tripay.data.checkout_url,
          return_url: tripay.data.return_url,
          qr_url: tripay.data.qr_url,
          qr_code: tripay.data.qr_string,
          pay_code: tripay.data.pay_code,
          pay_url: tripay.data.pay_url,
          id: data.id,
          expired_at: new Date(expiredTime * 1000),
          status: PaymentStatus.PENDING,
        });
      }
      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }
}
