import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productCategories } from "./products";

export const banners = pgTable("banners", {
  id: uuid("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  image_url: varchar("image").notNull(),
  is_available: boolean("is_available").default(true),
  product_category_id: uuid("product_category_id").references(
    () => productCategories.id,
  ),
  created_at: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export const bannerRelations = relations(banners, ({ one }) => ({
  productCategory: one(productCategories, {
    fields: [banners.product_category_id],
    references: [productCategories.id],
  }),
}));
