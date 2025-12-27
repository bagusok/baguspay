import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import crypto from 'crypto';
import { ApiServiceException } from 'src/common/exceptions/api-service.exception';
import {
  DuitkuCreateTransactionPayload,
  DuitkuCreateTransactionResponseSuccess,
} from './duitku.type';

@Injectable()
export class DuitkuAPiService {
  private API_URL: string;
  private API_CLIENT: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const envMode = this.configService.get<string>('NODE_ENV');

    if (envMode === 'production') {
      this.API_URL = 'https://passport.duitku.com';
    } else {
      this.API_URL = 'https://sandbox.duitku.com';
    }

    this.API_CLIENT = axios.create({
      baseURL: this.API_URL,
    });
  }

  public async createTransaction(
    data: DuitkuCreateTransactionPayload,
  ): Promise<DuitkuCreateTransactionResponseSuccess> {
    try {
      const response =
        await this.API_CLIENT.post<DuitkuCreateTransactionResponseSuccess>(
          '/webapi/api/merchant/v2/inquiry',
          data,
        );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          'Duitku API Error';
        throw new ApiServiceException(
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          errorMessage,
        );
      } else {
        throw new ApiServiceException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Internal server Error',
        );
      }
    }
  }

  public generateSignature(data: string): string {
    const hash = crypto.createHash('md5').update(data).digest('hex');
    return hash;
  }

  public calculateFee(
    amountReceived: number,
    feePercent: number,
    feeFixed: number,
  ): number {
    const total =
      amountReceived / (1 - feePercent) + feeFixed / (1 - feePercent);
    const fee = total - amountReceived;
    return Math.ceil(fee);
  }
}
