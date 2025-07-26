import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { deposits } from "./deposits";
import {
  PaymentMethodAllowAccess,
  PaymentMethodFeeType,
  paymentMethodFeeTypeEnum,
  PaymentMethodProvider,
  paymentMethodProviderEnum,
  PaymentMethodType,
  paymentMethodTypeEnum,
} from "./pg-enums";
import { paymentSnapshots } from "./snapshots";

export const paymentMethodCategories = pgTable("payment_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const paymentMethodCategoryRelations = relations(
  paymentMethodCategories,
  ({ many }) => ({
    payment_methods: many(paymentMethods),
  }),
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
    PaymentMethodFeeType.MERCHANT,
  ),

  is_available: boolean("is_available").notNull().default(true),
  is_featured: boolean("is_featured").notNull().default(false),
  label: varchar("label", { length: 20 }),
  provider_name: paymentMethodProviderEnum("provider_name").default(
    PaymentMethodProvider.TRIPAY,
  ),
  provider_code: varchar("provider_code", { length: 50 }).notNull(),
  min_amount: integer("min_amount").notNull().default(0),
  max_amount: integer("max_amount").notNull().default(0),
  type: paymentMethodTypeEnum("type").default(PaymentMethodType.BANK_TRANSFER),
  is_need_phone_number: boolean("is_need_phone_number")
    .notNull()
    .default(false),
  is_need_email: boolean("is_need_email").notNull().default(false),
  allow_access: text("allow_access")
    .array()
    .$type<PaymentMethodAllowAccess[]>()
    .default([PaymentMethodAllowAccess.ORDER]),
  expired_in: integer("expired_in").notNull().default(0),
  is_deleted: boolean("is_deleted").notNull().default(false),

  instruction: text("instruction").notNull().default(""),

  cut_off_start: time("cut_off_start", { withTimezone: true }),
  cut_off_end: time("cut_off_end", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
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
  }),
);
