import {
  createPayementMethodCategoryValidator,
  createPaymentMethodsValidator,
  paymentIdValidator,
  updatePayementMethodCategoryValidator,
  paymentMethodsQueryValidator,
  updatePaymentMethodsValidator,
} from '#validators/payments'
import type { HttpContext } from '@adonisjs/core/http'
import { db, desc, eq, ilike, and, count } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class PaymentsController {
  public async indexCategory(ctx: HttpContext) {
    const categories = await db.query.paymentMethodCategories.findMany({
      orderBy: [desc(tb.paymentMethodCategories.created_at)],
    })

    return ctx.inertia.render('payments/categories/index', {
      categories,
    })
  }

  public async indexPaymentMethod({ inertia, request }: HttpContext) {
    // Ambil query string dan validasi
    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await request.validateUsing(vine.compile(paymentMethodsQueryValidator), {
      data: request.qs(),
    })

    const categories = await db.query.paymentMethodCategories.findMany()

    const offset = (page - 1) * limit
    const whereFilter = []

    if (searchQuery) {
      if (searchBy === 'name') {
        whereFilter.push(ilike(tb.paymentMethods.name, `%${searchQuery}%`))
      } else if (searchBy === 'provider_name') {
        whereFilter.push(ilike(tb.paymentMethods.provider_name, `%${searchQuery}%`))
      } else if (searchBy === 'provider_code') {
        whereFilter.push(ilike(tb.paymentMethods.provider_code, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.paymentMethods.id, searchQuery))
      }
    }

    // Query total count dan paginated data
    const paymentMethods = await db
      .select()
      .from(tb.paymentMethods)
      .where(whereFilter.length ? and(...whereFilter) : undefined)
      .orderBy(desc(tb.paymentMethods.created_at))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({ count: count() })
      .from(tb.paymentMethods)
      .where(whereFilter.length ? and(...whereFilter) : undefined)

    return inertia.render('payments/methods/index', {
      paymentMethods,
      categories,
      pagination: {
        page,
        limit,
        total: total[0]?.count || 0,
        totalPages: Math.ceil((total[0]?.count || 0) / limit),
      },
      filters: {
        searchBy,
        searchQuery,
      },
    })
  }

  async postCreateCategory(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(
      vine.compile(createPayementMethodCategoryValidator),
      {
        data: ctx.request.body(),
      }
    )

    await db.insert(tb.paymentMethodCategories).values(data)

    ctx.session.flash('success', 'Payment method category created successfully.')
    return ctx.response.redirect().back()
  }

  async postUpdateCategory(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(paymentIdValidator), {
      data: ctx.request.params(),
    })

    const data = await ctx.request.validateUsing(
      vine.compile(updatePayementMethodCategoryValidator),
      {
        data: ctx.request.body(),
      }
    )

    const category = await db.query.paymentMethodCategories.findFirst({
      where: eq(tb.paymentMethodCategories.id, id),
    })

    if (!category) {
      ctx.session.flashErrors({
        error: 'Payment method category not found',
      })
      return ctx.response.redirect().back()
    }

    await db
      .update(tb.paymentMethodCategories)
      .set(data)
      .where(eq(tb.paymentMethodCategories.id, id))

    ctx.session.flash('success', 'Payment method category updated successfully.')
    return ctx.response.redirect().back()
  }

  async postDeleteCategory(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(paymentIdValidator), {
      data: ctx.request.params(),
    })

    const category = await db.query.paymentMethodCategories.findFirst({
      where: eq(tb.paymentMethodCategories.id, id),
    })

    if (!category) {
      ctx.session.flashErrors({
        error: 'Payment method category not found',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.paymentMethodCategories).where(eq(tb.paymentMethodCategories.id, id))

    ctx.session.flash('success', 'Payment method category deleted successfully.')
    return ctx.response.redirect().back()
  }

  async postCreatePaymentMethod(ctx: HttpContext) {
    const { image_id: imageId, ...data } = await ctx.request.validateUsing(
      vine.compile(createPaymentMethodsValidator),
      {
        data: ctx.request.body(),
      }
    )

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, imageId),
    })

    if (!image) {
      ctx.session.flashErrors({
        error: 'Image not found',
      })
      return ctx.response.redirect().back()
    }

    await db.insert(tb.paymentMethods).values({
      ...data,
      image_url: image.url,
    })

    ctx.session.flash('success', 'Payment method created successfully.')
    return ctx.response.redirect().back()
  }

  async postUpdatePaymentMethod(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(paymentIdValidator), {
      data: ctx.request.params(),
    })

    const { image_id: imageId, ...data } = await ctx.request.validateUsing(
      vine.compile(updatePaymentMethodsValidator),
      {
        data: ctx.request.body(),
      }
    )

    const paymentMethod = await db.query.paymentMethods.findFirst({
      where: eq(tb.paymentMethods.id, id),
    })

    if (!paymentMethod) {
      ctx.session.flashErrors({
        error: 'Payment method not found',
      })
      return ctx.response.redirect().back()
    }

    let imageUrl: string | undefined

    if (imageId) {
      const image = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, imageId),
      })

      if (!image) {
        ctx.session.flashErrors({
          error: 'Image not found',
        })
        return ctx.response.redirect().back()
      }
    }

    await db
      .update(tb.paymentMethods)
      .set({
        ...data,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      })
      .where(eq(tb.paymentMethods.id, id))

    ctx.session.flash('success', 'Payment method updated successfully.')
    return ctx.response.redirect().back()
  }

  async postDeletePaymentMethod(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(paymentIdValidator), {
      data: ctx.request.params(),
    })

    const paymentMethod = await db.query.paymentMethods.findFirst({
      where: eq(tb.paymentMethods.id, id),
    })

    if (!paymentMethod) {
      ctx.session.flashErrors({
        error: 'Payment method not found',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.paymentMethods).where(eq(tb.paymentMethods.id, id))

    ctx.session.flash('success', 'Payment method deleted successfully.')
    return ctx.response.redirect().back()
  }

  async detailPaymentMethod(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(paymentIdValidator), {
      data: ctx.request.params(),
    })

    const paymentMethod = await db.query.paymentMethods.findFirst({
      where: eq(tb.paymentMethods.id, id),
    })

    if (!paymentMethod) {
      ctx.session.flashErrors({
        error: 'Payment method not found',
      })
      return ctx.response.redirect().back()
    }

    const categories = await db.query.paymentMethodCategories.findMany()

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.url, paymentMethod.image_url),
    })

    return ctx.response.json({
      data: {
        ...paymentMethod,
        image_id: image?.id || null,
      },
      categories,
    })
  }
}
