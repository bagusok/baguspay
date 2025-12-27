export interface TripayCreateClosedPaymentResponse {
  success: boolean;
  message: string;
  data: Data;
}

export interface Data {
  reference: string;
  merchant_ref: string;
  payment_selection_type: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  callback_url: string;
  return_url: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  pay_code: string;
  pay_url: null;
  checkout_url: string;
  status: string;
  expired_time: number;
  order_items: TripayOrderItem[];
  instructions: Instruction[];
  qr_string: null;
  qr_url: null;
}

export interface Instruction {
  title: string;
  steps: string[];
}

export interface TripayOrderItem {
  name: string;
  product_id: string;
  price: number;
  quantity: number;
  [key: string]: any; // Allow additional properties
}
export interface TripayApiErrorResponse {
  success: boolean;
  message: string;
}

export enum TripayPaymentMethodCode {
  PERMATAVA = 'PERMATAVA',
  BNIVA = 'BNIVA',
  BRIVA = 'BRIVA',
  MANDIRIVA = 'MANDIRIVA',
  BCAVA = 'BCAVA',
  MUAMALATVA = 'MUAMALATVA',
  CIMBVA = 'CIMBVA',
  BSIVA = 'BSIVA',
  OCBCVA = 'OCBCVA',
  DANAMONVA = 'DANAMONVA',
  OTHERBANKVA = 'OTHERBANKVA',
  ALFAMART = 'ALFAMART',
  INDOMARET = 'INDOMARET',
  ALFAMIDI = 'ALFAMIDI',
  OVO = 'OVO',
  QRIS = 'QRIS',
  QRISC = 'QRISC',
  QRIS2 = 'QRIS2',
  DANA = 'DANA',
  SHOPEEPAY = 'SHOPEEPAY',
}

export type TripayCreateClosedPaymentRequest = {
  method: TripayPaymentMethodCode;
  merchant_ref: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_items: TripayOrderItem[];
  callback_url?: string;
  return_url?: string;
  expired_time?: number; // timestamp
  signature: string;
};

export interface TripayCallbackData {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_method_code: TripayPaymentMethodCode;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: number;
  status: string;
  paid_at: 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  note: any;
}
