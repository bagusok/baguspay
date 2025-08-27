export interface DuitkuCreateTransactionPayload {
  merchantCode: string;
  paymentAmount: number;
  paymentMethod: string;
  merchantOrderId: string;
  productDetails?: string;
  additionalParam?: string;
  merchantUserInfo?: string;
  customerVaName: string;
  email: string;
  phoneNumber?: string;
  itemDetails?: DuitkuCreateTransactionItemDetail[];
  customerDetail?: DuitkuCreateTransactionCustomerDetail;
  callbackUrl: string;
  returnUrl: string;
  signature: string;
  expiryPeriod: number;
}

export interface DuitkuCreateTransactionItemDetail {
  name: string;
  price: number;
  quantity: number;
}

export interface DuitkuCreateTransactionCustomerDetail {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  billingAddress: DuitkuCreateTransactionBillingAddress;
  shippingAddress: DuitkuCreateTransactionShippingAddress;
}

export interface DuitkuCreateTransactionBillingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  countryCode: string;
}

export interface DuitkuCreateTransactionShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  countryCode: string;
}

export interface DuitkuCreateTransactionResponseSuccess {
  merchantCode: string;
  reference: string;
  paymentUrl: string;
  vaNumber: string;
  qrString: string;
  amount: number;
  statusCode: string;
  statusMessage: string;
}

export interface DuitkuCallbackPayload {
  merchantCode: string; // Kode merchant dari Duitku (contoh: DXXXX)
  amount: number; // Nominal transaksi (contoh: 150000)
  merchantOrderId: string; // Nomor transaksi dari merchant (contoh: abcde12345)
  productDetail: string; // Keterangan detail produk (contoh: Pembayaran untuk Toko Contoh)
  additionalParam?: string; // Parameter tambahan opsional
  paymentCode: string; // Metode pembayaran (contoh: VC)
  resultCode: '00' | '01'; // 00 = Success, 01 = Failed
  merchantUserId?: string; // Username/email pelanggan (contoh: test@example.com)
  reference: string; // Nomor referensi transaksi dari Duitku
  signature: string; // Signature (MD5 hash)
  publisherOrderId: string; // Nomor unik pembayaran dari Duitku
  spUserHash?: string; // Hash khusus untuk ShopeePay
  settlementDate?: string; // Format: YYYY-MM-DD (contoh: 2023-07-25)
  issuerCode?: string; // Kode issuer QRIS (contoh: 93600523)
}
