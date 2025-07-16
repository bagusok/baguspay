import {
  createUserValidator,
  deleteUserParamsValidator,
  updateUserValidator,
  userQueryValidator,
} from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { and, count, db, eq, ilike, or } from '@repo/db'
import { tb } from '@repo/db/types'
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
}
