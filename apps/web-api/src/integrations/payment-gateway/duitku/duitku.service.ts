import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethodFeeType, PaymentStatus } from '@repo/db/types';
import crypto from 'crypto';
import { ApiServiceException } from 'src/common/exceptions/api-service.exception';
import {
  CreatePaymentGatewayRequest,
  CreatePaymentGatewayResponse,
} from '../payment-gateway.type';
import { PaymentGateway } from '../payment.interface';
import { DuitkuAPiService } from './duitku.api.service';

@Injectable()
export class DuitkuService implements PaymentGateway {
  private API_KEY: string;
  private MERCHANT_CODE: string;
  private RETURN_URL: string;
  private CALLBACK_URL: string;

  constructor(
    private readonly duitkuApiService: DuitkuAPiService,
    private readonly configService: ConfigService,
  ) {
    this.API_KEY = this.configService.get<string>('DUITKU_APIKEY');
    this.MERCHANT_CODE = this.configService.get<string>('DUITKU_MERCHANT_CODE');
    this.RETURN_URL = this.configService.get<string>('DUITKU_RETURN_URL');
    this.CALLBACK_URL = this.configService.get<string>('DUITKU_CALLBACK_URL');
  }

  async createTransaction(
    data: CreatePaymentGatewayRequest,
  ): Promise<CreatePaymentGatewayResponse> {
    try {
      const expiryPeriod = data.expired_in * 60;
      const expiredAt = new Date(Date.now() + data.expired_in * 1000);

      //   hitung fee
      let amount = data.amount;

      let totalAmount = 0;

      const fee = this.duitkuApiService.calculateFee(
        amount,
        data.fee_in_percent / 100,
        data.fee_static,
      );

      if (data.fee_type == PaymentMethodFeeType.BUYER) {
        totalAmount = data.amount;
      } else {
        totalAmount = data.amount + fee;
      }

      const signature = this.duitkuApiService.generateSignature(
        this.MERCHANT_CODE + data.id + totalAmount + this.API_KEY,
      );

      const response = await this.duitkuApiService.createTransaction({
        merchantCode: this.MERCHANT_CODE,
        paymentAmount: totalAmount,
        paymentMethod: data.provider_code,
        email: data.customer_email,
        customerVaName: data.customer_name,
        phoneNumber: data.customer_phone,
        callbackUrl: data.callback_url ?? this.CALLBACK_URL ?? '',
        expiryPeriod: expiryPeriod,
        merchantOrderId: data.id,
        signature: signature,
        returnUrl:
          data.return_url ??
          (this.RETURN_URL ? this.RETURN_URL + '/' + data.id : ''),
      });

      // Data Setelah Revisi Create Payment
      let r_fee = 0;
      let r_amount_received = 0;
      let r_amount_total = response.amount;

      if (data.fee_type == PaymentMethodFeeType.BUYER) {
        r_fee = response.amount - data.amount;
        r_amount_received = response.amount - r_fee;
      } else {
        r_fee = fee;
        r_amount_received = response.amount - r_fee;
      }

      return {
        amount: data.amount,
        amount_received: r_amount_received,
        fee_type: data.fee_type,
        amount_total: r_amount_total,
        customer_email: data.customer_email,
        customer_name: data.customer_name,
        expired_at: expiredAt,
        id: data.id,
        order_items: data.order_items,
        provider_code: data.provider_code,
        provider_name: data.provider_name,
        ref_id: response.reference,
        total_fee: r_fee,
        customer_phone: data.customer_phone,
        pay_url: response.paymentUrl,
        pay_code: response.vaNumber,
        qr_code: response.qrString,
        qr_url: null,
        status: PaymentStatus.PENDING,
      };
    } catch (error) {
      if (error instanceof ApiServiceException) {
        throw new HttpException(error.message, error.httpCode);
      }
      throw error;
    }
  }

  cancelTransaction(data: any): Promise<any> {
    return null;
  }

  handleCallback(data: any): Promise<any> {
    return null;
  }

  calculateFee(
    amountReceived: number,
    feePercent: number,
    feeFixed: number,
  ): number {
    return 0;
  }

  public verifyCallbackSignature(data: {
    signature: string;
    merchantCode: string;
    amount: number;
    merchantOrderId: string;
  }): boolean {
    const hash = crypto
      .createHash('md5')
      .update(
        data.merchantCode + data.amount + data.merchantOrderId + this.API_KEY,
      )
      .digest('hex');

    return hash === data.signature;
  }
}
