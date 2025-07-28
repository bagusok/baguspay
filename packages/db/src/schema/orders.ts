import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
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

    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    offer_on_order_id: uuid("offer_on_order_id").references(
      () => offerOnOrders.id,
    ),
    offer_voucher_id: uuid("offer_voucher_id").references(
      () => offerOnOrders.id,
    ),
    product_snapshot_id: uuid("product_snapshot_id")
      .notNull()
      .references(() => productSnapshots.id),
    payment_snapshot_id: uuid("payment_snapshot_id")
      .notNull()
      .references(() => paymentSnapshots.id),

    total_price: integer("total_price").notNull(),
    profit: integer("profit").notNull().default(0),
    cost_price: integer("cost_price").notNull().default(0),
    discount_price: integer("discount_price").notNull().default(0),
    fee: integer("fee").notNull().default(0),

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

    customer_email: varchar("customer_email", { length: 150 }),
    customer_phone: varchar("customer_phone", { length: 50 }),
    customer_ip: varchar("customer_ip", { length: 50 }),
    customer_ua: varchar("customer_ua", { length: 500 }),

    voucher_code: varchar("voucher_code", { length: 100 }),
    raw_response: varchar("raw_response"),

    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => [index("orders_order_id_index").on(table.order_id)],
);

export const orderRelations = relations(orders, ({ one }) => ({
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
  offer_on_order: one(offerOnOrders, {
    fields: [orders.offer_on_order_id],
    references: [offerOnOrders.id],
  }),
  offer_voucher: one(offerOnOrders, {
    fields: [orders.offer_voucher_id],
    references: [offerOnOrders.id],
  }),
}));
