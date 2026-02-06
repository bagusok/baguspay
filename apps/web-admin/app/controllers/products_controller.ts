import type { HttpContext } from '@adonisjs/core/http'
import { and, count, db, desc, eq, ilike } from '@repo/db'
import { ProductProvider, tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import {
  createProductValidator,
  getAllProductsQueryValidator,
  productCategoriesQueryValidator,
  productIdValidator,
  updateProductValidator,
  updateProviderPriceValidator,
} from '#validators/product'

export default class ProductsController {
  async postCreate(ctx: HttpContext) {
    const { image_id: imageId, ...data } = await ctx.request.validateUsing(
      vine.compile(createProductValidator),
      {
        data: ctx.request.body(),
      },
    )

    const totalPrice = Math.ceil(
      data.provider_price +
        data.profit_static +
        (data.provider_price * data.profit_percentage) / 100,
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

    if (ctx.request.accepts(['json']) === 'json') {
      return ctx.response.json({ success: true })
    }

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
        (data.provider_price * data.profit_percentage) / 100,
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

    if (ctx.request.accepts(['json']) === 'json') {
      return ctx.response.json({ success: true })
    }

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
      if (ctx.request.accepts(['json']) === 'json') {
        return ctx.response.status(404).json({ error: 'Product not found' })
      }
      ctx.session.flashErrors({
        error: 'Product not found',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.products).where(eq(tb.products.id, id))

    if (ctx.request.accepts(['json']) === 'json') {
      return ctx.response.json({ success: true })
    }

    ctx.session.flash('success', 'Product deleted successfully.')
    return ctx.response.redirect().withQs().back()
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

  public async getProductByCategoryNameJson(ctx: HttpContext) {
    const {
      limit = 100,
      page = 1,
      searchBy,
      searchQuery,
      categoryId,
      subCategoryId,
    } = await ctx.request.validateUsing(vine.compile(productCategoriesQueryValidator), {
      data: ctx.request.qs(),
    })

    const where: any = []
    if (searchQuery) {
      if (searchBy === 'name') {
        where.push(ilike(tb.productCategories.name, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        where.push(eq(tb.products.id, searchQuery))
      }
    }

    if (categoryId) {
      where.push(eq(tb.productCategories.id, categoryId))
    }

    if (subCategoryId) {
      where.push(eq(tb.productSubCategories.id, subCategoryId))
    }

    const offset = (page - 1) * limit
    const products = await db
      .select({
        product_category_id: tb.productCategories.id,
        product_category_name: tb.productCategories.name,
        product_sub_category_id: tb.productSubCategories.id,
        product_sub_category_name: tb.productSubCategories.name,
        product_id: tb.products.id,
        product_name: tb.products.name,
        product_price: tb.products.price,
        is_product_available: tb.products.is_available,
        is_product_sub_category_available: tb.productSubCategories.is_available,
        is_product_category_available: tb.productCategories.is_available,
      })
      .from(tb.productCategories)
      .innerJoin(
        tb.productSubCategories,
        eq(tb.productCategories.id, tb.productSubCategories.product_category_id),
      )
      .innerJoin(tb.products, eq(tb.productSubCategories.id, tb.products.product_sub_category_id))
      .where(where.length ? and(...where) : undefined)
      .limit(limit)
      .offset(offset)

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.productCategories)
      .innerJoin(
        tb.productSubCategories,
        eq(tb.productCategories.id, tb.productSubCategories.product_category_id),
      )
      .innerJoin(tb.products, eq(tb.productSubCategories.id, tb.products.product_sub_category_id))
      .where(where.length ? and(...where) : undefined)

    const productCategories = await db.query.productCategories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        is_available: true,
      },
      where: categoryId ? eq(tb.productCategories.id, categoryId) : undefined,
      orderBy: [desc(tb.productCategories.created_at)],
      limit: 20,
    })

    const productSubCategories = categoryId
      ? await db.query.productSubCategories.findMany({
          columns: {
            id: true,
            name: true,
            is_available: true,
          },
          where: eq(tb.productSubCategories.product_category_id, categoryId),
          orderBy: [desc(tb.productSubCategories.created_at)],
        })
      : []

    return ctx.response.json({
      data: products,
      productCategories,
      productSubCategories,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
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
        }),
      ),
      {
        data: ctx.request.body(),
      },
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
      `Product is now ${data.is_available ? 'available' : 'unavailable'}.`,
    )
    return ctx.response.redirect().back()
  }

  async getExistingProviderCodes(ctx: HttpContext) {
    const schema = vine.object({
      productSubCategoryId: vine.string().uuid(),
      providerName: vine.enum(ProductProvider),
    })

    const query = await ctx.request.validateUsing(vine.compile(schema), {
      data: ctx.request.qs(),
    })

    const products = await db
      .select({
        provider_code: tb.products.provider_code,
      })
      .from(tb.products)
      .where(
        and(
          eq(tb.products.product_sub_category_id, query.productSubCategoryId),
          eq(tb.products.provider_name, query.providerName),
        ),
      )

    return ctx.response.json({
      codes: products.map((item) => item.provider_code),
    })
  }

  async getProviderMap(ctx: HttpContext) {
    const schema = vine.object({
      productSubCategoryId: vine.string().uuid(),
      providerName: vine.enum(ProductProvider),
    })

    const query = await ctx.request.validateUsing(vine.compile(schema), {
      data: ctx.request.qs(),
    })

    const products = await db
      .select({
        id: tb.products.id,
        name: tb.products.name,
        provider_code: tb.products.provider_code,
        provider_price: tb.products.provider_price,
        provider_max_price: tb.products.provider_max_price,
        profit_static: tb.products.profit_static,
        profit_percentage: tb.products.profit_percentage,
      })
      .from(tb.products)
      .where(
        and(
          eq(tb.products.product_sub_category_id, query.productSubCategoryId),
          eq(tb.products.provider_name, query.providerName),
        ),
      )

    return ctx.response.json({
      data: products,
    })
  }

  async updateProviderPrice(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const data = await ctx.request.validateUsing(vine.compile(updateProviderPriceValidator), {
      data: ctx.request.body(),
    })

    const product = await db.query.products.findFirst({
      where: eq(tb.products.id, id),
    })

    if (!product) {
      return ctx.response.status(404).json({ error: 'Product not found' })
    }

    if (data.provider_max_price < data.provider_price) {
      return ctx.response
        .status(422)
        .json({ error: 'Provider max price must be greater than or equal to provider price' })
    }

    const totalPrice = Math.ceil(
      data.provider_price +
        product.profit_static +
        (data.provider_price * product.profit_percentage) / 100,
    )

    await db
      .update(tb.products)
      .set({
        provider_price: data.provider_price,
        provider_max_price: data.provider_max_price,
        price: totalPrice,
      })
      .where(eq(tb.products.id, id))

    return ctx.response.json({ success: true })
  }
}
