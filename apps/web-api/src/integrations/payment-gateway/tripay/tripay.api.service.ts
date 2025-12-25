import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { ApiServiceException } from 'src/common/exceptions/api-service.exception';
import {
  TripayApiErrorResponse,
  TripayCreateClosedPaymentRequest,
  TripayCreateClosedPaymentResponse,
} from './tripay.type';

@Injectable()
export class TripayApiService {
  private url: string;
  private apiClient: AxiosInstance;
  private logger = new Logger(TripayApiService.name);

  constructor(private readonly configService: ConfigService) {
    const environment = this.configService.get<string>('NODE_ENV');
    const apiKey = this.configService.get<string>('TRIPAY_APIKEY');

    if (environment === 'production') {
      this.url = 'https://tripay.co.id';
    } else {
      this.url = 'https://tripay.co.id/api-sandbox';
    }

    this.apiClient = axios.create({
      baseURL: this.url,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  public generateClosedPaymentSignature(
    merchant_ref: string,
    amount: number,
  ): string {
    return crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('TRIPAY_PRIVATE_KEY'),
      )
      .update(
        this.configService.get<string>('TRIPAY_MERCHANT_CODE') +
          merchant_ref +
          amount,
      )
      .digest('hex');
  }

  public generateCallbackSignature(data: object): string {
    return crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('TRIPAY_PRIVATE_KEY'),
      )
      .update(JSON.stringify(data))
      .digest('hex');
  }

  public async createClosedPayment(data: TripayCreateClosedPaymentRequest) {
    try {
      const response =
        await this.apiClient.post<TripayCreateClosedPaymentResponse>(
          '/transaction/create',
          data,
        );

      return response.data;
    } catch (error) {
      this.logger.error('Error creating closed payment', error.message);
      if (axios.isAxiosError<TripayApiErrorResponse>(error)) {
        this.logger.error(JSON.stringify(error.response.data));

        throw new ApiServiceException(
          error.response.status,
          error.response.data.message,
        );
      }

      this.logger.error('Unknown error', error);

      throw new ApiServiceException(
        500,
        'Internal server error when connecting to Tripay API',
      );
    }
  }
}
