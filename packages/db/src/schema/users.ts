import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { balanceMutations } from './balance_mutations'
import { deposits } from './deposits'
import { offerOnOrders, offerUsers } from './offers'
import { orders } from './orders'
import { UserRegisteredType, UserRole, userRegisteredTypeEnum, userRoleEnum } from './pg-enums'
import { sessions } from './sessions'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  oauth_id: varchar('oauth_id'),
  image_url: varchar('image_url'),
  registered_type: userRegisteredTypeEnum('registered_type')
    .notNull()
    .default(UserRegisteredType.LOCAL),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  role: userRoleEnum('role').notNull().default(UserRole.USER),
  balance: integer('balance').notNull().default(0),

  pin_hash: varchar('pin_hash', { length: 255 }),
  pin_attempts: integer('pin_attempts').notNull().default(0),
  pin_locked_until: timestamp('pin_locked_until', { withTimezone: true }),
  pin_set_at: timestamp('pin_set_at', { withTimezone: true }),

  is_banned: boolean('is_banned').notNull().default(false),
  is_email_verified: boolean('is_email_verified').notNull().default(false),
  is_deleted: boolean('is_deleted').notNull().default(false),

  created_at: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updated_at: timestamp('updated_at', {
    withTimezone: true,
  }).$onUpdate(() => new Date()),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  deposits: many(deposits),
  balance_mutations: many(balanceMutations),
  orders: many(orders),
  offer_users: many(offerUsers),
  offer_on_orders: many(offerOnOrders),
}))
