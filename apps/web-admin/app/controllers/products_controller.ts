import {
  createProductValidator,
  getAllProductsQueryValidator,
  productIdValidator,
  updateProductValidator,
} from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import { db, desc, eq, and, count } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class ProductsController {
  async postCreate(ctx: HttpContext) {
    const { image_id: imageId, ...data } = await ctx.request.validateUsing(
      vine.compile(createProductValidator),
      {
        data: ctx.request.body(),
      }
    )

    const totalPrice = Math.ceil(
      data.provider_price +
        data.profit_static +
        (data.provider_price * data.profit_percentage) / 100
    )

    if (data.provider_max_price < data.provider_price) {
      ctx.session.flashErrors({
        provider_max_price: 'Provider max price must be greater than or equal to provider price',
      })
      return ctx.response.redirect().back()
    }

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, imageId),
    })

    if (!image) {
      ctx.session.flashErrors({
        image_id: 'Image file not found',
      })
      return ctx.response.redirect().back()
    }

    await db.insert(tb.products).values({
      ...data,
      image_url: image.url,
      price: totalPrice,
    })

    ctx.session.flash('success', 'Product created successfully.')
    return ctx.response.redirect().back()
  }

  async postUpdate(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const data = await ctx.request.validateUsing(vine.compile(updateProductValidator), {
      data: ctx.request.body(),
    })

    let imageUrl: string | undefined

    if (data.image_id) {
      const image = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.image_id),
      })

      if (!image) {
        ctx.session.flashErrors({
          image_id: 'Image file not found',
        })
        return ctx.response.redirect().back()
      }

      imageUrl = image.url
    }

    const totalPrice = Math.ceil(
      data.provider_price +
        data.profit_static +
        (data.provider_price * data.profit_percentage) / 100
    )

    if (data.provider_max_price < data.provider_price) {
      ctx.session.flashErrors({
        provider_max_price: 'Provider max price must be greater than or equal to provider price',
      })
      return ctx.response.redirect().back()
    }

    await db
      .update(tb.products)
      .set({
        ...data,
        image_url: imageUrl,
        price: totalPrice,
      })
      .where(eq(tb.products.id, id))

    ctx.session.flash('success', 'Product updated successfully.')
    return ctx.response.redirect().back()
  }

  async postDelete(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const product = await db.query.products.findFirst({
      where: eq(tb.products.id, id),
    })

    if (!product) {
      ctx.session.flashErrors({
        error: 'Product not found',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.products).where(eq(tb.products.id, id))

    ctx.session.flash('success', 'Product deleted successfully.')
    return ctx.response.redirect().back()
  }

  async detail(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const product = await db.query.products.findFirst({
      where: eq(tb.products.id, id),
    })

    if (!product) {
      ctx.session.flashErrors({
        error: 'Product not found',
      })
      return ctx.response.redirect().back()
    }

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.url, product.image_url),
    })

    return ctx.response.json({
      data: {
        ...product,
        image_id: image?.id,
      },
    })
  }

  async getAll(ctx: HttpContext) {
    const query = await ctx.request.validateUsing(vine.compile(getAllProductsQueryValidator), {
      data: ctx.request.qs(),
    })

    const {
      page = 1,
      limit = 10,
      searchQuery,
      searchBy,
      sortColumn = 'created_at',
      sortOrder = 'desc',
      productSubCategoryId,
    } = query

    const whereClauses = []

    if (searchQuery && searchBy) {
      whereClauses.push(eq(tb.products[searchBy], searchQuery))
    }

    if (productSubCategoryId) {
      whereClauses.push(eq(tb.products.product_sub_category_id, productSubCategoryId))
    }

    let where
    if (whereClauses.length === 1) {
      where = whereClauses[0]
    } else if (whereClauses.length > 1) {
      where = and(...whereClauses)
    }

    const products = await db.query.products.findMany({
      where,
      orderBy: [sortOrder === 'desc' ? desc(tb.products[sortColumn]) : tb.products[sortColumn]],
      limit,
      offset: (page - 1) * limit,
    })

    const total = await db
      .select({
        count: count(),
      })
      .from(tb.products)
      .where(where)

    return ctx.response.json({
      data: products,
      meta: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    })
  }

  async updateIsAvailable(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const data = await ctx.request.validateUsing(
      vine.compile(
        vine.object({
          is_available: vine.boolean(),
        })
      ),
      {
        data: ctx.request.body(),
      }
    )

    const product = await db.query.products.findFirst({
      where: eq(tb.products.id, id),
    })

    if (!product) {
      ctx.session.flashErrors({
        error: 'Product not found',
      })
      return ctx.response.redirect().back()
    }

    await db
      .update(tb.products)
      .set({ is_available: data.is_available })
      .where(eq(tb.products.id, id))

    ctx.session.flash(
      'success',
      `Product is now ${data.is_available ? 'available' : 'unavailable'}.`
    )
    return ctx.response.redirect().back()
  }
}
