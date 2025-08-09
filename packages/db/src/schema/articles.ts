import { varchar } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users";
import { productCategories } from "./products";
import { relations } from "drizzle-orm";

export const articleCategories = pgTable("article_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug").notNull().unique(),
  description: varchar("description", { length: 255 }),

  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  image_url: varchar("image_url", { length: 255 }),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  article_category_id: uuid("article_category_id")
    .references(() => articleCategories.id)
    .notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),

  is_published: boolean("is_published").notNull().default(false),
  tags: text("tags").array().$type<string[]>(),

  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const articleRelations = relations(articles, ({ many }) => ({
  products: many(productCategoryOnArticles),
}));

export const productCategoryOnArticles = pgTable(
  "product_category_on_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    article_id: uuid("article_id")
      .references(() => articles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    product_category_id: uuid("product_category_id")
      .notNull()
      .references(() => productCategories.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
);

export const productCategoryOnArticleRelations = relations(
  productCategoryOnArticles,
  ({ one }) => ({
    article: one(articles, {
      fields: [productCategoryOnArticles.article_id],
      references: [articles.id],
    }),
    product_category: one(productCategories, {
      fields: [productCategoryOnArticles.product_category_id],
      references: [productCategories.id],
    }),
  }),
);
