import { relations } from "drizzle-orm";
import {
  boolean,
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
import { products } from "./products";
import { users } from "./users";

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  sub_name: varchar("sub_name", { length: 100 }),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  description: text("description").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  quota: integer("quota").notNull().default(0),

  discount_static: integer("discount_static").notNull().default(0),
  discount_percentage: numeric("discount_percentage", {
    mode: "number",
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default(0),
  discount_maximum: integer("discount_maximum").notNull().default(0),

  min_amount: integer("min_amount").notNull().default(0),

  start_date: timestamp("start_date", { withTimezone: true }).notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),

  is_available: boolean("is_available").notNull().default(false),
  is_need_reedem: boolean("is_need_redeem").notNull().default(false),
  is_new_user: boolean("is_new_user").notNull().default(false),
  is_featured: boolean("is_featured").notNull().default(false),
  label: varchar("label", { length: 20 }),

  is_all_users: boolean("is_all_users").notNull().default(false),
  is_all_payment_methods: boolean("is_all_payment_methods")
    .notNull()
    .default(false),
  is_all_products: boolean("is_all_products").notNull().default(false),

  is_deleted: boolean("is_deleted").notNull().default(false),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

export const offerRelations = relations(offers, ({ many }) => ({
  users: many(offerUsers),
  products: many(offer_products),
  payment_methods: many(offerPaymentMethods),
}));

export const offerUsers = pgTable("offer_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  offer_id: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  user_id: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const offerUserRelations = relations(offerUsers, ({ one }) => ({
  offer: one(offers, {
    fields: [offerUsers.offer_id],
    references: [offers.id],
  }),
  user: one(users, {
    fields: [offerUsers.user_id],
    references: [users.id],
  }),
}));

export const offer_products = pgTable("offer_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  offer_id: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  product_id: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const offerProductRelations = relations(offer_products, ({ one }) => ({
  offer: one(offers, {
    fields: [offer_products.offer_id],
    references: [offers.id],
  }),
  product: one(products, {
    fields: [offer_products.product_id],
    references: [products.id],
  }),
}));

export const offerPaymentMethods = pgTable("offer_payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  offer_id: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  payment_method_id: uuid("payment_method_id")
    .references(() => paymentMethods.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const offerPaymentMethodRelations = relations(
  offerPaymentMethods,
  ({ one }) => ({
    offer: one(offers, {
      fields: [offerPaymentMethods.offer_id],
      references: [offers.id],
    }),
    payment_method: one(paymentMethods, {
      fields: [offerPaymentMethods.payment_method_id],
      references: [paymentMethods.id],
    }),
  }),
);

export const offerOnOrders = pgTable("offer_on_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  offer_id: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  discount_total: integer("discount_static").notNull().default(0),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const offerOnOrderRelations = relations(offerOnOrders, ({ one }) => ({
  offer: one(offers, {
    fields: [offerOnOrders.offer_id],
    references: [offers.id],
  }),
  order: one(orders),
  user: one(users, {
    fields: [offerOnOrders.user_id],
    references: [users.id],
  }),
}));
