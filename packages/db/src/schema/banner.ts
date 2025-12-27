import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { BannerLocation, bannerLocationEnum } from "./pg-enums";
import { productCategories } from "./products";

export const banners = pgTable("banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  image_url: varchar("image").notNull(),
  href_url: varchar("href_url"),
  app_url: varchar("app_url"),
  banner_location: bannerLocationEnum("banner_location")
    .notNull()
    .default(BannerLocation.HOME_TOP),
  order: integer("order").notNull().default(0),
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
