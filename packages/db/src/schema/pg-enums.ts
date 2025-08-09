import { enumToPgEnum } from "@/utils";
import { pgEnum } from "drizzle-orm/pg-core";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export enum UserRegisteredType {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  GITHUB = "github",
  LOCAL = "local",
}
export const userRoleEnum = pgEnum("user_role", enumToPgEnum(UserRole));
export const userRegisteredTypeEnum = pgEnum(
  "user_registered_type",
  enumToPgEnum(UserRegisteredType),
);

export enum BalanceMutationType {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum BalanceMutationRefType {
  ORDER = "order",
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  OTHER = "other",
}

export const balanceMutationTypeEnum = pgEnum(
  "balance_mutation_type",
  enumToPgEnum(BalanceMutationType),
);

export const balanceMutationRefTypeEnum = pgEnum(
  "balance_mutation_ref_type",
  enumToPgEnum(BalanceMutationRefType),
);

export enum DepositStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELED = "cancelled",
  EXPIRED = "expired",
}

export const depositStatusEnum = pgEnum(
  "deposit_status",
  enumToPgEnum(DepositStatus),
);
export enum InputFieldType {
  TEXT = "text",
  NUMBER = "number",
  EMAIL = "email",
  PASSWORD = "password",
  SELECT = "select",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  TEXTAREA = "textarea",
}

export type InputFieldOption = {
  label: string;
  value: string;
};

export const inputFieldTypeEnum = pgEnum(
  "input_field_type",
  enumToPgEnum(InputFieldType),
);

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum OrderStatus {
  NONE = "none",
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum RefundStatus {
  NONE = "none",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export const paymentStatusEnum = pgEnum(
  "payment_status",
  enumToPgEnum(PaymentStatus),
);

export const orderStatusEnum = pgEnum(
  "order_status",
  enumToPgEnum(OrderStatus),
);

export const refundStatusEnum = pgEnum(
  "refund_status",
  enumToPgEnum(RefundStatus),
);

export enum PaymentMethodFeeType {
  MERCHANT = "merchant",
  BUYER = "buyer",
  BOTH = "both",
}

export enum PaymentMethodProvider {
  TRIPAY = "tripay",
  FLIPBUSINESS = "flipbusiness",
  DOKU = "doku",
  XENDIT = "xendit",
  MIDTRANS = "midtrans",
  IPAYMU = "ipaymu",
  DUITKU = "duitku",
  BALANCE = "balance",
  MANUAL = "manual",
}

export enum PaymentMethodType {
  BANK_TRANSFER = "bank_transfer",
  VIRTUAL_ACCOUNT = "virtual_account",
  RETAIL = "retail",
  QR_CODE = "qr_code",
  E_WALLET = "e_wallet",
  CREDIT_CARD = "credit_card",
  VOUCHER = "voucher",
  BALANCE = "balance",
  LINK_PAYMENT = "link_payment",
  MANUAL = "manual",
}

export enum PaymentMethodAllowAccess {
  DEPOSIT = "deposit",
  ORDER = "order",
}

export const paymentMethodFeeTypeEnum = pgEnum(
  "payment_method_fee_type",
  enumToPgEnum(PaymentMethodFeeType),
);

export const paymentMethodProviderEnum = pgEnum(
  "payment_method_provider",
  enumToPgEnum(PaymentMethodProvider),
);

export const paymentMethodTypeEnum = pgEnum(
  "payment_method_type",
  enumToPgEnum(PaymentMethodType),
);

export const paymentMethodAllowAccessEnum = pgEnum(
  "payment_method_allow_access",
  enumToPgEnum(PaymentMethodAllowAccess),
);

export enum LoginIsFrom {
  WEB = "web",
  MOBILE = "mobile",
  DESKTOP = "desktop",
}

export const loginIsFromEnum = pgEnum(
  "login_is_from",
  enumToPgEnum(LoginIsFrom),
);

export enum ProductCategoryType {
  GAME = "game",
  VOUCHER = "voucher",
  PULSA = "pulsa",
  KUOTA = "kuota",
  ENTERTAINMENT = "entertainment",
  FINANCE = "finance",
  ECOMMERCE = "ecommerce",
  TOPUP = "topup",
  BILLING = "billing",
  SENDMONEY = "send_money",
  OTHER = "other",
}

export const productCategoryTypeEnum = pgEnum(
  "product_category_type",
  enumToPgEnum(ProductCategoryType),
);

export enum ProductProvider {
  DIGIFLAZZ = "digiflazz",
  MOOGOLD = "moogold",
  ATLANTICH2H = "atlantich2h",
  VIPRESELLER = "vipreseller",
  VOCAGAME = "vocagame",
}

export enum ProductBillingType {
  PREPAID = "prepaid",
  POSTPAID = "postpaid",
}

export enum ProductFullfillmentType {
  MANUAL_DIRECT = "manual_direct",
  MANUAL_DIRECT_WITH_VOUCHER = "manual_direct_with_voucher",
  AUTOMATIC_DIRECT = "automatic_direct",
  AUTOMATIC_DIRECT_WITH_VOUCHER = "automatic_direct_with_voucher",
}

export const productProviderEnum = pgEnum(
  "product_provider",
  enumToPgEnum(ProductProvider),
);

export const productBillingTypeEnum = pgEnum(
  "product_billing_type",
  enumToPgEnum(ProductBillingType),
);

export const productFullfillmentTypeEnum = pgEnum(
  "product_fullfillment_type",
  enumToPgEnum(ProductFullfillmentType),
);

export enum OfferType {
  DISCOUNT = "discount",
  FLASH_SALE = "flash_sale",
  CASHBACK = "cashback",
  VOUCHER = "voucher",
}

export const offerTypeEnum = pgEnum("offer_type", enumToPgEnum(OfferType));
