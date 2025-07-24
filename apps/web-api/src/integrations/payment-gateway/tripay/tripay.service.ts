import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { SendResponse } from 'src/common/utils/response';
import {
  Data,
  TripayApiErrorResponse,
  TripayCreateClosedPaymentRequest,
  TripayCreateClosedPaymentResponse,
} from './tripay.type';

@Injectable()
export class TripayService {
  private url: string;
  private apiClient: AxiosInstance;
  private logger = new Logger(TripayService.name);

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

  public async createClosedPayment(_data: TripayCreateClosedPaymentRequest) {
    try {
      const signature = this.generateClosedPaymentSignature(
        _data.merchant_ref,
        _data.amount,
      );

      const response =
        await this.apiClient.post<TripayCreateClosedPaymentResponse>(
          '/transaction/create',
          {
            ..._data,
            signature,
          },
        );

      const data = response.data;

      return SendResponse.success<Data>(data.data);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error('Error creating closed payment', error.message);
      if (axios.isAxiosError<TripayApiErrorResponse>(error)) {
        throw new BadRequestException(
          error.response?.data.message || 'Tripay API Error',
        );
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating tripay closed payment',
      );
    }
  }
}
