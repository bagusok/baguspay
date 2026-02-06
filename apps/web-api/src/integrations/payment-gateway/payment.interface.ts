import type { db } from '@repo/db'
import type {
  CreatePaymentGatewayRequest,
  CreatePaymentGatewayResponse,
} from './payment-gateway.type'

export interface PaymentGateway {
  createTransaction(
    data: CreatePaymentGatewayRequest,
    dbInstance?: Parameters<Parameters<(typeof db)['transaction']>[0]>[0],
  ): Promise<CreatePaymentGatewayResponse>

  cancelTransaction(data: any): Promise<any>

  handleCallback(data: any): Promise<any>

  calculateFee(amountReceived: number, feePercent: number, feeFixed: number): number
}
