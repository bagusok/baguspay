import { relations } from "drizzle-orm";
import { boolean, varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { numeric } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { deposits } from "./deposits";
import { text } from "drizzle-orm/pg-core";
import { paymentSnapshots } from "./snapshots";
import {
  PaymentMethodAllowAccess,
  PaymentMethodFeeType,
  paymentMethodFeeTypeEnum,
  PaymentMethodProvider,
  paymentMethodProviderEnum,
  PaymentMethodType,
  paymentMethodTypeEnum,
} from "./pg-enums";

export const paymentMethodCategories = pgTable("payment_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const paymentMethodCategoryRelations = relations(
  paymentMethodCategories,
  ({ many }) => ({
    payment_methods: many(paymentMethods),
  })
);

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  payment_method_category_id: uuid("payment_method_category_id")
    .references(() => paymentMethodCategories.id)
    .notNull(),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  fee_static: integer("fee_static").notNull().default(0),
  fee_percentage: numeric("fee_percentage", {
    mode: "number",
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default(0),
  fee_type: paymentMethodFeeTypeEnum("fee_type").default(
    PaymentMethodFeeType.MERCHANT
  ),
  is_available: boolean("is_available").notNull().default(true),
  is_featured: boolean("is_featured").notNull().default(false),
  label: varchar("label", { length: 20 }),
  provider_name: paymentMethodProviderEnum("provider_name").default(
    PaymentMethodProvider.TRIPAY
  ),
  min_amount: integer("min_amount").notNull().default(0),
  max_amount: integer("max_amount").notNull().default(0),
  type: paymentMethodTypeEnum("type").default(PaymentMethodType.BANK_TRANSFER),
  allow_access: text("allow_access")
    .array()
    .$type<PaymentMethodAllowAccess[]>()
    .default([PaymentMethodAllowAccess.ORDER]),
  is_deleted: boolean("is_deleted").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

export const paymentMethodRelations = relations(
  paymentMethods,
  ({ one, many }) => ({
    payment_method_category: one(paymentMethodCategories, {
      fields: [paymentMethods.payment_method_category_id],
      references: [paymentMethodCategories.id],
    }),
    deposits: many(deposits),
    payment_snapshots: many(paymentSnapshots),
  })
);
