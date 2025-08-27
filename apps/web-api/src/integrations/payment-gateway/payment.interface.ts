import {
  CreatePaymentGatewayRequest,
  CreatePaymentGatewayResponse,
} from './payment-gateway.type';

export interface PaymentGateway {
  createTransaction(
    data: CreatePaymentGatewayRequest,
  ): Promise<CreatePaymentGatewayResponse>;

  cancelTransaction(data: any): Promise<any>;

  handleCallback(data: any): Promise<any>;

  calculateFee(
    amountReceived: number,
    feePercent: number,
    feeFixed: number,
  ): number;
}
