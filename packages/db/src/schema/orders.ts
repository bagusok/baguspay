import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { inquiries } from "./inquiry";
import { offerOnOrders } from "./offers";
import {
  OrderStatus,
  orderStatusEnum,
  PaymentStatus,
  paymentStatusEnum,
  RefundStatus,
  refundStatusEnum,
} from "./pg-enums";
import { paymentSnapshots, productSnapshots } from "./snapshots";
import { users } from "./users";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: varchar("order_id").notNull().unique(),
    transaction_ref: varchar("transaction_ref"),
    inquiry_id: uuid("inquiry_id").references(() => inquiries.id, {
      onDelete: "set null",
    }),

    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    product_snapshot_id: uuid("product_snapshot_id")
      .notNull()
      .references(() => productSnapshots.id),
    payment_snapshot_id: uuid("payment_snapshot_id")
      .notNull()
      .references(() => paymentSnapshots.id),

    price: integer("price").notNull().default(0),
    cost_price: integer("cost_price").notNull().default(0),
    discount_price: integer("discount_price").notNull().default(0),
    fee: integer("fee").notNull().default(0),
    total_price: integer("total_price").notNull(),
    profit: integer("profit").notNull().default(0),

    sn_number: varchar("sn_number", { length: 150 }).notNull(),
    notes: varchar("notes"),

    payment_status: paymentStatusEnum("payment_status")
      .notNull()
      .default(PaymentStatus.PENDING),
    order_status: orderStatusEnum("order_status")
      .notNull()
      .default(OrderStatus.NONE),
    refund_status: refundStatusEnum("refund_status")
      .notNull()
      .default(RefundStatus.NONE),

    customer_input: varchar("customer_input"),
    customer_input_json: jsonb("customer_input_json").$type<
      Record<string, any>
    >(),

    customer_email: varchar("customer_email", { length: 150 }),
    customer_phone: varchar("customer_phone", { length: 50 }),
    customer_ip: varchar("customer_ip", { length: 50 }),
    customer_ua: varchar("customer_ua", { length: 500 }),
    customer_device_id: varchar("customer_device_id", { length: 100 }),

    voucher_code: varchar("voucher_code", { length: 100 }),
    additional_data: varchar("additional_data"),

    order_raw_response:
      jsonb("order_raw_response").$type<Record<string, any>>(),
    callback_raw_response: jsonb("callback_raw_response").$type<
      Record<string, any>
    >(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),

    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
    order_success_at: timestamp("order_success_at", { withTimezone: true }),
    payment_success_at: timestamp("payment_success_at", { withTimezone: true }),
  },
  (table) => [index("orders_order_id_index").on(table.order_id)]
);

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  product_snapshot: one(productSnapshots, {
    fields: [orders.product_snapshot_id],
    references: [productSnapshots.id],
  }),
  payment_snapshot: one(paymentSnapshots, {
    fields: [orders.payment_snapshot_id],
    references: [paymentSnapshots.id],
  }),
  offer_on_orders: many(offerOnOrders),
  inquiry: one(inquiries, {
    fields: [orders.inquiry_id],
    references: [inquiries.id],
  }),
}));
