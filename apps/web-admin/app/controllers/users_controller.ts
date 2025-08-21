import {
  addBalanceValidator,
  createUserValidator,
  deductBalanceValidator,
  deleteUserParamsValidator,
  updateUserValidator,
  userQueryValidator,
} from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { and, count, db, desc, eq, ilike, or } from '@repo/db'
import { BalanceMutationRefType, BalanceMutationType, tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import { hash } from 'bcrypt-ts'

export default class UsersController {
  public async index({ inertia, request }: HttpContext) {
    console.log('UsersController.index called', request.qs())

    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await request.validateUsing(vine.compile(userQueryValidator), {
      data: request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter = []

    if (searchQuery) {
      if (searchBy === 'name') {
        whereFilter.push(ilike(tb.users.name, `%${searchQuery}%`))
      } else if (searchBy === 'email') {
        whereFilter.push(ilike(tb.users.email, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.users.id, searchQuery))
      }
    }

    // Query total count dan paginated data
    const users = await db
      .select()
      .from(tb.users)
      .where(whereFilter.length ? and(...whereFilter) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tb.users.created_at))

    const total = await db
      .select({
        count: count(),
      })
      .from(tb.users)
      .where(whereFilter.length ? and(...whereFilter) : undefined)

    return inertia.render('user/index', {
      title: 'User Management',
      description: 'Manage users in the system.',
      users,
      pagination: {
        page: page,
        limit,
        total,
        totalPages: Math.ceil(total[0].count / limit),
      },
      filters: {
        searchBy,
        searchQuery,
      },
    })
  }

  public async postCreate({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(vine.compile(createUserValidator))

    const user = await db.query.users.findFirst({
      where: or(eq(tb.users.email, data.email), eq(tb.users.phone, data.phone)),
    })

    if (user) {
      session.flashErrors({
        error: 'Email or phone number already exists.',
        email: 'Email or Phone already exists.',
        phone: 'Phone or Email already exists.',
      })
      return response.redirect().back()
    }

    const hashedPassword = await hash(data.password, 10)

    await db.insert(tb.users).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      is_banned: data.is_banned ?? false,
      is_email_verified: data.is_email_verified ?? false,
      registered_type: data.registered_type,
      password: hashedPassword,
      balance: 0,
      is_deleted: false,
    })

    session.flash('success', 'User created successfully.')
    return response.redirect().toRoute('users.index')
  }

  public async postDelete({ request, response, session }: HttpContext) {
    console.log('postUpdate called', request.params())

    const data = await request.validateUsing(vine.compile(deleteUserParamsValidator), {
      data: request.params(),
    })

    const user = await db.query.users.findFirst({
      where: eq(tb.users.id, data.id),
    })

    if (!user) {
      session.flashErrors({
        error: 'User not found.',
      })
      return response.redirect().back()
    }

    await db.delete(tb.users).where(eq(tb.users.id, data.id))

    session.flash('success', 'User deleted successfully.')
    return response.redirect().toRoute('users.index')
  }

  public async postUpdate({ request, response, session }: HttpContext) {
    const { id } = await request.validateUsing(vine.compile(deleteUserParamsValidator), {
      data: request.params(),
    })

    const data = await request.validateUsing(vine.compile(updateUserValidator))

    const user = await db.query.users.findFirst({
      where: eq(tb.users.id, id),
    })

    if (!user) {
      session.flashErrors({
        error: 'User not found.',
      })
      return response.redirect().back()
    }

    const updatedData: Partial<typeof tb.users.$inferInsert> = {
      ...data,
      updated_at: new Date(),
    }

    if (data.password) {
      updatedData.password = await hash(data.password, 10)
    }

    await db.update(tb.users).set(updatedData).where(eq(tb.users.id, id))

    session.flash('success', 'User updated successfully.')
    return response.redirect().toRoute('users.index')
  }

  public async me(ctx: HttpContext) {
    const user = await ctx.auth.use('web').authenticate()

    const { password, ...rest } = user

    return ctx.response.json(rest)
  }

  public async getUsersJson(ctx: HttpContext) {
    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await ctx.request.validateUsing(vine.compile(userQueryValidator), {
      data: ctx.request.qs(),
    })

    const where: any = [eq(tb.users.is_deleted, false), eq(tb.users.is_banned, false)]
    if (searchQuery) {
      if (searchBy === 'name') {
        where.push(ilike(tb.users.name, `%${searchQuery}%`))
      } else if (searchBy === 'email') {
        where.push(ilike(tb.users.email, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        where.push(eq(tb.users.id, searchQuery))
      } else {
        where.push(
          or(ilike(tb.users.name, `%${searchQuery}%`), ilike(tb.users.email, `%${searchQuery}%`))
        )
      }
    }

    const offset = (page - 1) * limit
    const users = await db.query.users.findMany({
      where: where.length ? and(...where) : undefined,
      limit,
      offset,
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_banned: true,
        is_email_verified: true,
        registered_type: true,
        created_at: true,
        updated_at: true,
      },
    })

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.users)
      .where(where.length ? and(...where) : undefined)
    return ctx.response.json({
      data: users,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    })
  }

  public async addBalance(ctx: HttpContext) {
    const { amount, message } = await ctx.request.validateUsing(vine.compile(addBalanceValidator), {
      data: ctx.request.body(),
    })

    const { id } = await ctx.request.validateUsing(vine.compile(deleteUserParamsValidator), {
      data: ctx.request.params(),
    })

    await db.transaction(async (trx) => {
      const [user] = await trx
        .select()
        .from(tb.users)
        .where(eq(tb.users.id, id))
        .for('update')
        .limit(1)

      if (!user) {
        ctx.session.flashErrors({
          error: 'User not found.',
        })
        trx.rollback()
        return ctx.response.redirect().back()
      }

      await trx
        .update(tb.users)
        .set({
          balance: user.balance + amount,
        })
        .where(eq(tb.users.id, id))
      await trx.insert(tb.balanceMutations).values({
        amount,
        name: message,
        type: BalanceMutationType.CREDIT,
        ref_type: BalanceMutationRefType.OTHER,
        ref_id: '',
        user_id: user.id,
        balance_after: user.balance + amount,
        balance_before: user.balance,
      })

      return [user]
    })

    ctx.session.flash('success', 'Balance added successfully.')
    return ctx.response.redirect().withQs().back()
  }

  public async deductBalance(ctx: HttpContext) {
    const { amount, message } = await ctx.request.validateUsing(
      vine.compile(deductBalanceValidator),
      {
        data: ctx.request.body(),
      }
    )

    const { id } = await ctx.request.validateUsing(vine.compile(deleteUserParamsValidator), {
      data: ctx.request.params(),
    })

    await db.transaction(async (trx) => {
      const [user] = await trx
        .select()
        .from(tb.users)
        .where(eq(tb.users.id, id))
        .for('update')
        .limit(1)

      if (!user) {
        ctx.session.flashErrors({
          error: 'User not found.',
        })
        trx.rollback()
        return ctx.response.redirect().back()
      }

      await trx
        .update(tb.users)
        .set({
          balance: user.balance - amount,
        })
        .where(eq(tb.users.id, id))
      await trx.insert(tb.balanceMutations).values({
        amount: -amount,
        name: message,
        type: BalanceMutationType.DEBIT,
        ref_type: BalanceMutationRefType.OTHER,
        ref_id: '',
        user_id: user.id,
        balance_after: user.balance - amount,
        balance_before: user.balance,
      })

      return [user]
    })

    ctx.session.flash('success', 'Balance deducted successfully.')
    return ctx.response.redirect().withQs().back()
  }
}
