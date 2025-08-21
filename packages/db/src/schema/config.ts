import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const appConfig = pgTable(
  "app_config",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key").notNull().unique(),
    value: text("value").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
    }).$onUpdate(() => new Date()),
  },
  (tb) => [uniqueIndex("app_config_key_idx").on(tb.key)],
);
