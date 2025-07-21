import {
  PaymentMethodProvider,
  PaymentMethodFeeType,
  PaymentStatus,
} from '@repo/db/types';
import { TripayOrderItem } from './tripay/tripay.type';

export interface CreatePaymentGatewayRequest {
  provider_name: PaymentMethodProvider;
  provider_code: string;
  fee_type: PaymentMethodFeeType;
  id: string;
  amount: number;
  fee: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_items: TripayOrderItem[];
  callback_url?: string;
  return_url?: string;
  expired_in: number; // in seconds
}

export interface CreatePaymentGatewayResponse {
  id: string;
  ref_id: string;
  provider_name: PaymentMethodProvider;
  provider_code: string;
  amount: number;
  amount_received: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  fee_type: PaymentMethodFeeType;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_items: TripayOrderItem[];
  callback_url?: string;
  return_url?: string;
  expired_at: Date;
  pay_code?: string;
  pay_url?: string;
  qr_code?: string;
  qr_url?: string;
  checkout_url?: string;
  status?: PaymentStatus;
}
