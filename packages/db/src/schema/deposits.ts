import { varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { integer } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentMethods } from "./payments";
import { DepositStatus, depositStatusEnum } from "./pg-enums";
import { index } from "drizzle-orm/pg-core";

export const deposits = pgTable(
  "deposits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deposit_id: varchar("deposit_id", { length: 100 }).notNull().unique(),
    ref_id: varchar("ref_id", { length: 100 }).notNull(),
    user_id: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    payment_method_id: uuid("payment_method_id")
      .references(() => paymentMethods.id)
      .notNull(),
    amount_pay: integer("amount_pay").notNull(),
    amount_received: integer("amount_received").notNull(),
    amount_fee: integer("amount_fee").notNull().default(0),

    phone_number: varchar("phone_number", { length: 20 }),
    email: varchar("email"),
    pay_code: varchar("pay_code", { length: 100 }),
    pay_url: varchar("pay_url"),
    qr_code: varchar("qr_code"),

    status: depositStatusEnum("status")
      .notNull()
      .default(DepositStatus.PENDING),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    expired_at: timestamp("expired_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("deposits_deposit_id_index").on(table.deposit_id)],
);

export const depositRelations = relations(deposits, ({ one }) => ({
  payment_method: one(paymentMethods, {
    fields: [deposits.payment_method_id],
    references: [paymentMethods.id],
  }),
  user: one(users, {
    fields: [deposits.user_id],
    references: [users.id],
  }),
}));
