/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@repo/db/types';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { SendResponse } from 'src/common/utils/response';

@Injectable()
export class DigiflazzService {
  private apikey: string;
  private username: string;
  private callbackSecret: string;
  private testing: boolean = false;
  private apiClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.apikey = this.configService.get<string>('DIGIFLAZZ_API_KEY');
    this.username = this.configService.get<string>('DIGIFLAZZ_USERNAME');
    this.callbackSecret = this.configService.get<string>(
      'DIGIFLAZZ_CALLBACK_SECRET',
    );

    const environment = this.configService.get<string>('NODE_ENV');
    this.testing = environment === 'development' || environment === 'test';

    this.apiClient = axios.create({
      baseURL: 'https://api.digiflazz.com/v1',
    });
  }

  async topup(data: DigiflazzTopupData) {
    try {
      const sign = this.generateSignature(data.order_id);

      const response = await this.apiClient.post<DigiflazzApiTopupResponse>(
        '/transaction',
        {
          username: this.username,
          buyer_sku_code: data.provider_code,
          customer_no: data.customer_input,
          ref_id: data.order_id,
          max_price: data.max_price,
          testing: this.testing,
          cb_url: data.callback_url,
          allow_dot: data.allow_dot,
          sign: sign,
        },
      );

      switch (response.data.data.rc) {
        case '00':
          return SendResponse.success<DigiflazzTopupResponse>({
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.COMPLETED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          });
        case '01':
          throw new GatewayTimeoutException(
            `DF: ${response.data.data.message}`,
          );
        case '02':
          return SendResponse.success<DigiflazzTopupResponse>({
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.FAILED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          });
        case '03':
          return SendResponse.success<DigiflazzTopupResponse>({
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.PENDING,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          });
        case '99':
          return SendResponse.success<DigiflazzTopupResponse>({
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.PENDING,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          });
        default:
          return SendResponse.success<DigiflazzTopupResponse>({
            provider_code: data.provider_code,
            customer_input: data.customer_input,
            order_id: data.order_id,
            max_price: data.max_price,
            callback_url: data.callback_url,
            allow_dot: data.allow_dot,
            status: OrderStatus.FAILED,
            buyer_last_saldo: response.data.data.buyer_last_saldo,
            provider_price: response.data.data.price,
            wa: response.data.data.wa,
            tele: response.data.data.tele,
            sn: response.data.data.sn || null,
          });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(`DF: ${error.response?.data.message}`);
      }

      throw new BadRequestException(`DF: ${error.message}`);
    }
  }

  private generateSignature(value: string) {
    return crypto
      .createHash('md5')
      .update(this.username + this.apikey + value)
      .digest('hex');
  }

  public verifyCallbackSignature(
    data: {
      data: DigiflazzCallbackData;
    },
    signFromPost: string,
  ) {
    const sign = crypto
      .createHmac('sha1', this.callbackSecret)
      .update(JSON.stringify(data))
      .digest('hex');

    console.log('Generated Sign:', sign, signFromPost);

    return {
      isValid: `sha1=${sign}` === signFromPost,
      sign: sign,
    };
  }
}

type DigiflazzTopupData = {
  provider_code: string;
  customer_input: string;
  order_id: string;
  max_price: number;
  callback_url?: string;
  allow_dot: boolean;
};

type DigiflazzTopupResponse = {
  provider_code: string;
  customer_input: string;
  order_id: string;
  max_price: number;
  callback_url?: string;
  allow_dot: boolean;
  status: OrderStatus;
  buyer_last_saldo: number;
  provider_price: number;
  wa: string;
  tele: string;
  sn: string | null;
};

type DigiflazzApiTopupResponse = {
  data: {
    ref_id: string;
    customer_no: string;
    buyer_sku_code: string;
    message: string;
    rc: string;
    status: 'Pending' | 'Success' | 'Gagal';
    sn: string;
    buyer_last_saldo: number;
    price: number;
    tele: string;
    wa: string;
  };
};

export type DigiflazzCallbackData = {
  ref_id: string;
  customer_no: string;
  buyer_sku_code: string;
  message: string;
  rc: string;
  status: 'Pending' | 'Sukses' | 'Gagal';
  sn: string;
  buyer_last_saldo: number;
  price: number;
  tele: string;
  wa: string;
};
