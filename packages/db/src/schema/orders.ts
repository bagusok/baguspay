import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { productSnapshots } from "./snapshots";
import { integer } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { offerOnOrders } from "./offers";
import {
  OrderStatus,
  orderStatusEnum,
  PaymentStatus,
  paymentStatusEnum,
  RefundStatus,
  refundStatusEnum,
} from "./pg-enums";
import { index } from "drizzle-orm/pg-core";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: uuid("order_id").notNull().defaultRandom(),

    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    offer_on_order_id: uuid("offer_on_order_id").references(
      () => offerOnOrders.id,
    ),
    product_snapshot_id: uuid("product_snapshot_id")
      .notNull()
      .references(() => productSnapshots.id),
    payment_snapshot_id: uuid("payment_snapshot_id")
      .notNull()
      .references(() => productSnapshots.id),

    total_price: integer("total_price").notNull(),
    profit: integer("profit").notNull().default(0),
    cost_price: integer("cost_price").notNull().default(0),
    discount_price: integer("discount_price").notNull().default(0),

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
  payment_snapshot: one(productSnapshots, {
    fields: [orders.payment_snapshot_id],
    references: [productSnapshots.id],
  }),
  offer_on_order: one(offerOnOrders, {
    fields: [orders.offer_on_order_id],
    references: [offerOnOrders.id],
  }),
}));
