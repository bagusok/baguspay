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
import { orders } from "./orders";
import {
  InquiryStatus,
  inquiryStatusEnum,
  ProductProvider,
  productProviderEnum,
} from "./pg-enums";
import { products } from "./products";
import { paymentSnapshots, productSnapshots } from "./snapshots";
import { users } from "./users";

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),

    product_id: uuid("product_id").references(() => products.id),
    product_snapshot_id: uuid("product_snapshot_id").references(
      () => productSnapshots.id
    ),
    payment_snapshot_id: uuid("payment_snapshot_id").references(
      () => paymentSnapshots.id
    ),

    // pricing details
    price: integer("price").notNull().default(0),
    cost_price: integer("cost_price").notNull().default(0),
    discount_price: integer("discount_price").notNull().default(0),
    fee: integer("fee").notNull().default(0),
    admin_fee: integer("admin_fee").notNull().default(0),
    total_price: integer("total_price").notNull(),
    profit: integer("profit").notNull().default(0),

    inquiry_provider: productProviderEnum("inquiry_provider")
      .default(ProductProvider.DIGIFLAZZ)
      .notNull(),
    inquiry_provider_code: varchar("inquiry_provider_code", { length: 50 }),
    inquiry_ref_id: varchar("inquiry_ref_id", { length: 100 }),
    inquiry_response: jsonb("inquiry_response").$type<Record<string, any>>(),

    customer_input: jsonb("customer_input").notNull().default({}),
    customer_name: varchar("customer_name", { length: 150 }),
    customer_phone: varchar("customer_phone", { length: 50 }),
    customer_email: varchar("customer_email", { length: 150 }),

    status: inquiryStatusEnum("status").default(
      InquiryStatus.AWAIT_CONFIRMATION
    ),
    expired_at: timestamp("expired_at", { withTimezone: true }), // batas validasi inquiry

    // timestamps
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (table) => [
    index("inquiries_user_idx").on(table.user_id),
    index("inquiries_status_idx").on(table.status),
  ]
);

export const inquiryRelations = relations(inquiries, ({ one, many }) => ({
  user: one(users, {
    fields: [inquiries.user_id],
    references: [users.id],
  }),
  product_snapshot: one(productSnapshots, {
    fields: [inquiries.product_snapshot_id],
    references: [productSnapshots.id],
  }),
  payment_snapshot: one(paymentSnapshots, {
    fields: [inquiries.payment_snapshot_id],
    references: [paymentSnapshots.id],
  }),
  orders: many(orders),
}));
