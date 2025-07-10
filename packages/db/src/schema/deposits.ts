import { varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { integer } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentMethods } from "./payments";
import { DepositStatus, depositStatusEnum } from "./pg-enums";

export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().defaultRandom(),
  deposit_id: varchar("deposit_id", { length: 100 }).notNull().unique(),
  user_id: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  payment_method_id: uuid("payment_method_id")
    .references(() => users.id)
    .notNull(),
  amount_pay: integer("amount_pay").notNull(),
  amount_received: integer("amount_received").notNull(),
  amount_fee: integer("amount_fee").notNull().default(0),
  status: depositStatusEnum("status").notNull().default(DepositStatus.PENDING),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

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
