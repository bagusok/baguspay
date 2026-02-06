import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { ArticleType, articleTypeEnum } from './pg-enums'
import { productCategories } from './products'
import { users } from './users'

export const articleCategories = pgTable('article_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug').notNull().unique(),
  description: varchar('description', { length: 255 }),

  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
})

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  image_url: varchar('image_url', { length: 255 }),
  slug: varchar('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  type: articleTypeEnum('type').notNull().default(ArticleType.ARTICLE),
  article_category_id: uuid('article_category_id').references(() => articleCategories.id),
  user_id: uuid('user_id').references(() => users.id),

  is_published: boolean('is_published').notNull().default(false),
  is_featured: boolean('is_featured').notNull().default(false),
  order: integer('order').notNull().default(0),
  tags: text('tags').array().$type<string[]>(),
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: varchar('meta_description', { length: 500 }),

  published_at: timestamp('published_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
})

export const articleRelations = relations(articles, ({ one, many }) => ({
  category: one(articleCategories, {
    fields: [articles.article_category_id],
    references: [articleCategories.id],
  }),
  products: many(productCategoryOnArticles),
}))

export const articleCategoryRelations = relations(articleCategories, ({ many }) => ({
  articles: many(articles),
}))

export const productCategoryOnArticles = pgTable('product_category_on_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  article_id: uuid('article_id')
    .references(() => articles.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  product_category_id: uuid('product_category_id')
    .notNull()
    .references(() => productCategories.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

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
)
