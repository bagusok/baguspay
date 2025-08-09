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
import { articles } from "./articles";
import { banners } from "./banner";
import { inputOnProductCategory } from "./input_fields";
import { offer_products } from "./offers";
import {
  ProductBillingType,
  productBillingTypeEnum,
  ProductCategoryType,
  productCategoryTypeEnum,
  ProductFullfillmentType,
  productFullfillmentTypeEnum,
  ProductProvider,
  productProviderEnum,
} from "./pg-enums";

export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  sub_name: varchar("sub_name", { length: 100 }),
  description: text("description").notNull(),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  banner_url: varchar("banner_url", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 100 }).notNull(),
  is_available: boolean("is_available").notNull().default(true),
  is_featured: boolean("is_featured").notNull().default(false),
  label: varchar("label", { length: 50 }),
  delivery_type: varchar("delivery_type", { length: 50 }).notNull(),

  is_seo_enabled: boolean("is_seo_enabled").notNull().default(false),
  seo_title: varchar("seo_title", { length: 100 }),
  seo_description: varchar("seo_description", { length: 255 }),
  seo_image: varchar("seo_image", { length: 255 }),

  type: productCategoryTypeEnum("type").default(ProductCategoryType.GAME),

  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const productCategoryRelations = relations(
  productCategories,
  ({ many }) => ({
    product_sub_categories: many(productSubCategories),
    input_on_product_category: many(inputOnProductCategory),
    articles: many(articles),
    banners: many(banners),
  }),
);

export const productSubCategories = pgTable("product_sub_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  sub_name: varchar("sub_name", { length: 100 }),
  description: text("description"),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  is_available: boolean("is_available").notNull().default(true),
  is_featured: boolean("is_featured").notNull().default(false),
  label: varchar("label", { length: 50 }),
  product_category_id: uuid("product_category_id")
    .references(() => productCategories.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const productSubCategoryRelations = relations(
  productSubCategories,
  ({ one, many }) => ({
    product_category: one(productCategories, {
      fields: [productSubCategories.product_category_id],
      references: [productCategories.id],
    }),
    products: many(products),
  }),
);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_sub_category_id: uuid("product_sub_category_id")
    .references(() => productSubCategories.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  sub_name: varchar("sub_name", { length: 100 }),
  description: varchar("description", { length: 100 }),
  is_featured: boolean("is_featured").notNull().default(false),
  is_available: boolean("is_available").notNull().default(true),
  label_text: varchar("label", { length: 25 }),
  label_image: varchar("label_image", { length: 255 }),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  sku_code: varchar("sku_code", { length: 15 }).notNull(),
  price: integer("price").notNull(),
  profit_static: integer("profit_static").notNull().default(0),
  profit_percentage: numeric("profit_percentage", {
    mode: "number",
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default(0),
  stock: integer("stock").notNull().default(0),
  provider_code: varchar("provider_code", { length: 50 }).notNull(),
  provider_name: productProviderEnum("provider_name").default(
    ProductProvider.ATLANTICH2H,
  ),
  provider_price: integer("provider_price").notNull(),
  provider_max_price: integer("provider_max_price").notNull(),
  provider_input_separator: varchar("provider_input_separator", { length: 3 })
    .notNull()
    .default(""),
  notes: text("notes"),
  billing_type: productBillingTypeEnum("billing_type").default(
    ProductBillingType.PREPAID,
  ),
  fullfillment_type: productFullfillmentTypeEnum("fullfillment_type").default(
    ProductFullfillmentType.AUTOMATIC_DIRECT,
  ),

  cut_off_start: time("cut_off_start", { withTimezone: true }),
  cut_off_end: time("cut_off_end", { withTimezone: true }),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const productRelations = relations(products, ({ one, many }) => ({
  product_sub_category: one(productSubCategories, {
    fields: [products.product_sub_category_id],
    references: [productSubCategories.id],
  }),
  offer_on_products: many(offer_products),
}));
