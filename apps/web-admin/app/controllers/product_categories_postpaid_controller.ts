import { productCategoriesQueryValidator, productCategoryIdValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import { and, asc, count, db, desc, eq, ilike, inArray } from '@repo/db'
import { ProductBillingType, ProductCategoryType, tb } from '@repo/db/types'

import vine from '@vinejs/vine'

export default class ProductsCategoriesPostpaidController {
  // Pulsa Section
  public async indexTagihanPLN(ctx: HttpContext) {
    const {
      limit = 10,
      page = 1,
      searchBy = 'id',
      searchQuery = '',
    } = await ctx.request.validateUsing(vine.compile(productCategoriesQueryValidator), {
      data: ctx.request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter = [
      eq(tb.productCategories.product_billing_type, ProductBillingType.POSTPAID),
      eq(tb.productCategories.type, ProductCategoryType.PLN_POSTPAID),
    ]

    if (searchQuery) {
      if (searchBy === 'name') {
        whereFilter.push(ilike(tb.productCategories.name, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.productCategories.id, searchQuery))
      }
    }

    const productCategories = await db
      .select()
      .from(tb.productCategories)
      .where(whereFilter.length ? and(...whereFilter) : undefined)
      .orderBy(desc(tb.productCategories.created_at), asc(tb.productCategories.name))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({
        count: count(),
      })
      .from(tb.productCategories)
      .where(whereFilter.length ? and(...whereFilter) : undefined)

    return ctx.inertia.render('products/postpaid/tagihan-pln/index', {
      title: 'Product Categories - Games',
      description: 'Manage your product categories here.',
      productCategories,
      pagination: {
        page: page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
      filters: {
        searchBy,
        searchQuery,
      },
    })
  }

  public async createTagihanPLN({ inertia }: HttpContext) {
    return inertia.render('products/postpaid/tagihan-pln/create', {
      title: 'Create Tagihan PLN',
      description: 'Add a new Tagihan PLN to the system.',
    })
  }

  public async editTagihanPLN({ inertia, request, response }: HttpContext) {
    const data = await request.validateUsing(vine.compile(productCategoryIdValidator), {
      data: request.params(),
    })

    const productCategory = await db.query.productCategories.findFirst({
      where: eq(tb.productCategories.id, data.id),
    })

    if (!productCategory) {
      return response.notFound('Product category not found')
    }

    const seoImage = productCategory?.seo_image ? [productCategory.seo_image] : []
    const iconUrl = productCategory?.icon_url ? [productCategory.icon_url] : []

    const images = await db
      .select()
      .from(tb.fileManager)
      .where(
        inArray(tb.fileManager.url, [
          productCategory.banner_url,
          productCategory.image_url,
          ...seoImage,
          ...iconUrl,
        ])
      )

    return inertia.render('products/postpaid/tagihan-pln/edit', {
      title: `Edit Product Category - ${productCategory.name}`,
      description: productCategory.description,
      productCategory,
      image: {
        file_image_id: images.find((img) => img.url === productCategory.image_url)?.id ?? '',
        file_banner_id: images.find((img) => img.url === productCategory.banner_url)?.id ?? '',
        file_icon_id: images.find((img) => img.url === productCategory.icon_url)?.id ?? '',
        seo_image_id: images.find((img) => img.url === productCategory.seo_image)?.id ?? '',
      },
    })
  }
}
