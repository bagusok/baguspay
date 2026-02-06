import { relations } from 'drizzle-orm'
import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { balanceMutationRefTypeEnum, balanceMutationTypeEnum } from './pg-enums'
import { users } from './users'

export const balanceMutations = pgTable('balance_mutations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  amount: integer('amount').notNull(),
  type: balanceMutationTypeEnum('type').notNull(),
  ref_type: balanceMutationRefTypeEnum('ref_type').notNull(),
  ref_id: varchar('ref_id', { length: 100 }).notNull(),
  user_id: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  balance_before: integer('balance_before').notNull(),
  balance_after: integer('balance_after').notNull(),
  notes: varchar('notes', { length: 255 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
})

export const balanceMutationRelations = relations(balanceMutations, ({ one }) => ({
  user: one(users, {
    fields: [balanceMutations.user_id],
    references: [users.id],
  }),
}))
