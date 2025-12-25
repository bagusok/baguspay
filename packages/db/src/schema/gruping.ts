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
import {
  AppPlatform,
  appPlatformEnum,
  ProductGroupingMenuType,
  productGroupingMenuTypeEnum,
  ProductGroupingType,
  productGroupingTypeEnum,
} from "./pg-enums";
import { productCategories } from "./products";

export const productGroupings = pgTable("product_groupings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  image_url: varchar("image_url").notNull(),
  redirect_url: varchar("redirect_url"),
  app_key: varchar("app_key", { length: 100 }),

  platform: appPlatformEnum("platform").default(AppPlatform.WEB).notNull(),
  type: productGroupingTypeEnum("type")
    .default(ProductGroupingType.MODAL)
    .notNull(),
  menu_type: productGroupingMenuTypeEnum("menu_type")
    .default(ProductGroupingMenuType.FAST_MENU)
    .notNull(),
  is_available: boolean("is_available").default(false),

  is_featured: boolean("is_featured").default(false),
  label: varchar("label"),
  order: integer("order").default(0),

  is_special_feature: boolean("is_special_feature").default(false),
  special_feature_key: varchar("special_feature_key"),

  created_at: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export const productGroupingRelations = relations(
  productGroupings,
  ({ many }) => ({
    productCategories: many(productGroupingToProductCategories),
  })
);

export const productGroupingToProductCategories = pgTable(
  "product_grouping_to_product_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    product_grouping_id: uuid("product_grouping_id").references(
      () => productGroupings.id,
      { onDelete: "cascade" }
    ),
    product_category_id: uuid("product_category_id").references(
      () => productCategories.id,
      { onDelete: "cascade" }
    ),
    created_at: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
    }).$onUpdate(() => new Date()),
  }
);

export const productGroupingToProductCategoriesRelations = relations(
  productGroupingToProductCategories,
  ({ one }) => ({
    productGrouping: one(productGroupings, {
      fields: [productGroupingToProductCategories.product_grouping_id],
      references: [productGroupings.id],
    }),
    productCategory: one(productCategories, {
      fields: [productGroupingToProductCategories.product_category_id],
      references: [productCategories.id],
    }),
  })
);
