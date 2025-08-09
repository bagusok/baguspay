import { varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { users } from "@/schema";
import { relations } from "drizzle-orm";
import {
  LoginIsFrom,
  loginIsFromEnum,
  UserRegisteredType,
  userRegisteredTypeEnum,
} from "./pg-enums";

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  id_token: varchar("id_token", { length: 255 }),
  login_type: userRegisteredTypeEnum("login_type")
    .notNull()
    .default(UserRegisteredType.LOCAL),
  user_id: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  access_token: text("access_token").notNull(),
  access_token_expires_at: timestamp("access_token_expires_at", {
    withTimezone: true,
  }).$defaultFn(() => new Date(Date.now() + 3600 * 1000)),
  refresh_token: text("refresh_token").notNull(),
  refresh_token_expires_at: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }).$defaultFn(() => new Date(Date.now() + 30 * 24 * 3600 * 1000)),
  user_agent: text("user_agent").notNull(),
  ip_address: varchar("ip_address", { length: 45 }).notNull(),
  device_id: varchar("device_id", { length: 255 }).notNull(),
  is_from: loginIsFromEnum("is_from").default(LoginIsFrom.WEB),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.user_id],
    references: [users.id],
  }),
}));
