import { varchar } from "drizzle-orm/pg-core";
import { jsonb } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { productCategories } from "./products";
import { relations } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";
import {
  InputFieldOption,
  InputFieldType,
  inputFieldTypeEnum,
} from "./pg-enums";

export const inputFields = pgTable("input_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 100 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  is_required: boolean("is_required").notNull().default(true),
  placeholder: varchar("placeholder", { length: 100 }),
  type: inputFieldTypeEnum("type").default(InputFieldType.TEXT),
  options: jsonb("options").$type<InputFieldOption[]>(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const inputFieldRelations = relations(inputFields, ({ many }) => ({
  input_on_product_category: many(inputOnProductCategory),
}));

export const inputOnProductCategory = pgTable("input_on_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  input_field_id: uuid("input_field_id")
    .references(() => inputFields.id)
    .notNull(),
  product_category_id: uuid("category_id")
    .references(() => productCategories.id)
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const inputOnProductCategoryRelations = relations(
  inputOnProductCategory,
  ({ one }) => ({
    input_field: one(inputFields, {
      fields: [inputOnProductCategory.input_field_id],
      references: [inputFields.id],
    }),
    product_category: one(productCategories, {
      fields: [inputOnProductCategory.product_category_id],
      references: [productCategories.id],
    }),
  }),
);
