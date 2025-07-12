import { varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const fileManager = pgTable("file_manager", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: varchar("url").notNull(),
  name: varchar("name").notNull(),
  mime_type: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});
