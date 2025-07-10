import { integer } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  balanceMutationRefTypeEnum,
  balanceMutationTypeEnum,
} from "./pg-enums";

export const balanceMutations = pgTable("balance_mutations", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: integer("amount").notNull(),
  type: balanceMutationTypeEnum("type").notNull(),
  ref_type: balanceMutationRefTypeEnum("ref_type").notNull(),
  ref_id: varchar("ref_id", { length: 100 }).notNull(),
  user_id: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  notes: varchar("notes", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const balanceMutationRelations = relations(
  balanceMutations,
  ({ one }) => ({
    user: one(users, {
      fields: [balanceMutations.user_id],
      references: [users.id],
    }),
  })
);
