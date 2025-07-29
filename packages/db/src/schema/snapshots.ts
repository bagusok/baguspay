import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { paymentMethods } from "./payments";
import {
  PaymentMethodAllowAccess,
  PaymentMethodFeeType,
  paymentMethodFeeTypeEnum,
  PaymentMethodProvider,
  paymentMethodProviderEnum,
  PaymentMethodType,
  paymentMethodTypeEnum,
  ProductBillingType,
  productBillingTypeEnum,
  ProductFullfillmentType,
  productFullfillmentTypeEnum,
  ProductProvider,
  productProviderEnum,
} from "./pg-enums";
import { products } from "./products";

export const paymentSnapshots = pgTable("payment_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  payment_method_id: uuid("payment_method_id").references(
    () => paymentMethods.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    },
  ),
  type: paymentMethodTypeEnum("type")
    .default(PaymentMethodType.BANK_TRANSFER)
    .notNull(),
  provider_ref_id: varchar("provider_ref_id").notNull(),
  fee_static: integer("fee_static").notNull().default(0),
  fee_percentage: numeric("fee_percentage", {
    mode: "number",
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default(0),
  fee_type: paymentMethodFeeTypeEnum("fee_type").default(
    PaymentMethodFeeType.MERCHANT,
  ),
  provider_code: varchar("provider_code", { length: 50 }).notNull(),
  provider_name: paymentMethodProviderEnum("provider_name")
    .notNull()
    .default(PaymentMethodProvider.TRIPAY),
  allow_access: text("allow_access")
    .array()
    .$type<PaymentMethodAllowAccess[]>()
    .default([PaymentMethodAllowAccess.ORDER]),

  phone_number: varchar("phone_number", { length: 20 }),
  email: varchar("email"),
  pay_code: varchar("pay_code", { length: 100 }),
  pay_url: varchar("pay_url"),
  qr_code: varchar("qr_code"),

  expired_at: timestamp("expired_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const paymentSnapshotRelations = relations(
  paymentSnapshots,
  ({ one }) => ({
    payment_method: one(paymentMethods, {
      fields: [paymentSnapshots.payment_method_id],
      references: [paymentMethods.id],
    }),
    order: one(orders),
  }),
);

export const productSnapshots = pgTable("product_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  provider_ref_id: varchar("provider_ref_id", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  category_name: varchar("category_name", { length: 100 }).default(""),
  sub_category_name: varchar("sub_category_name", { length: 100 }).default(""),
  sku_code: varchar("sku_code", { length: 15 }).notNull(),
  price: integer("price").notNull(),
  profit_static: integer("profit_static").notNull().default(0),
  profit_percentage: numeric("profit_percentage", {
    mode: "number",
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default(0),
  provider_code: varchar("provider_code", { length: 50 }).notNull(),
  provider_name: productProviderEnum("provider_name").default(
    ProductProvider.ATLANTICH2H,
  ),
  provider_price: integer("provider_price").notNull(),
  provider_max_price: integer("provider_max_price").notNull(),
  provider_input_separator: varchar("provider_input_separator", { length: 3 })
    .notNull()
    .default(""),
  notes: text("notes"),
  billing_type: productBillingTypeEnum("billing_type").default(
    ProductBillingType.PREPAID,
  ),
  fullfillment_type: productFullfillmentTypeEnum("fullfillment_type").default(
    ProductFullfillmentType.AUTOMATIC_DIRECT,
  ),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const productSnapshotRelations = relations(
  productSnapshots,
  ({ one }) => ({
    product: one(products, {
      fields: [productSnapshots.product_id],
      references: [products.id],
    }),
    order: one(orders),
  }),
);
