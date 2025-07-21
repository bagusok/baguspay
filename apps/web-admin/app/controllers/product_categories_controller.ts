import {
  createProductCategoryValidator,
  productCategoryIdValidator,
  updateProductCategoryValidator,
  productCategoriesQueryValidator,
} from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import { and, count, db, desc, eq, ilike, inArray, InferSelectModel, or } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import slugify from '@sindresorhus/slugify'

export default class ProductsCategoriesController {
  public async index(ctx: HttpContext) {
    const {
      limit = 10,
      page = 1,
      searchBy = 'id',
      searchQuery = '',
    } = await ctx.request.validateUsing(vine.compile(productCategoriesQueryValidator), {
      data: ctx.request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter = []

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
      .orderBy(desc(tb.productCategories.created_at))
      .limit(limit)
      .offset(offset)

    const total = await db
      .select({
        count: count(),
      })
      .from(tb.productCategories)
      .where(whereFilter.length ? and(...whereFilter) : undefined)

    return ctx.inertia.render('products/index', {
      title: 'Product Categories',
      description: 'Manage your product categories here.',
      productCategories,
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

  public async create({ inertia }: HttpContext) {
    return inertia.render('products/product-categories/create-product-category', {
      title: 'Create Product Category',
      description: 'Add a new product category to the system.',
    })
  }

  public async postCreate({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(vine.compile(createProductCategoryValidator), {
      data: request.body(),
    })

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, data.file_image_id),
    })

    if (!image) {
      session.flashErrors({
        file_image_id: 'Image file not found',
      })
      return response.redirect().back()
    }

    const banner = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, data.file_banner_id),
    })

    if (!banner) {
      session.flashErrors({
        file_banner_id: 'Banner file not found',
      })
      return response.redirect().back()
    }

    const slug = slugify(data.name, {
      lowercase: true,
      separator: '-',
    })

    let seoImage: InferSelectModel<typeof tb.fileManager> | null = null

    if (data.seo_image_id) {
      const s = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.seo_image_id),
      })

      if (!s) {
        session.flashErrors({
          seo_image_id: 'SEO image file not found',
        })
        return response.redirect().back()
      }

      seoImage = s
    }

    const productCategory = await db
      .insert(tb.productCategories)
      .values({
        banner_url: banner.url,
        image_url: image.url,
        name: data.name,
        sub_name: data.sub_name,
        description: data.description,
        publisher: data.publisher,
        delivery_type: data.delivery_type,
        slug,
        is_featured: data.is_featured,
        label: data.label,
        is_seo_enabled: data.is_seo_enabled,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_image: seoImage?.url,
        is_available: data.is_available,
      })
      .returning()

    session.flash('success', 'Product category created successfully')
    return response.redirect().toRoute('productCategories.detail', {
      id: productCategory[0].id,
    })
  }

  public async detail({ inertia, request, response }: HttpContext) {
    const data = await request.validateUsing(vine.compile(productCategoryIdValidator), {
      data: request.params(),
    })

    const productCategory = await db.query.productCategories.findFirst({
      where: eq(tb.productCategories.id, data.id),
      with: {
        input_on_product_category: {
          with: {
            input_field: true,
          },
        },
        product_sub_categories: true,
      },
    })

    if (!productCategory) {
      return response.notFound('Product category not found')
    }

    return inertia.render('products/product-categories/product-category-detail', {
      title: `Product Category - ${productCategory.name}`,
      description: productCategory.description,
      productCategory,
    })
  }

  public async edit({ inertia, request, response }: HttpContext) {
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

    const images = await db
      .select()
      .from(tb.fileManager)
      .where(
        inArray(tb.fileManager.url, [
          productCategory.banner_url,
          productCategory.image_url,
          ...seoImage,
        ])
      )

    return inertia.render('products/product-categories/edit-product-category', {
      title: `Edit Product Category - ${productCategory.name}`,
      description: productCategory.description,
      productCategory,
      image: {
        file_image_id: images.find((img) => img.url === productCategory.image_url)?.id ?? '',
        file_banner_id: images.find((img) => img.url === productCategory.banner_url)?.id ?? '',
        seo_image_id: images.find((img) => img.url === productCategory.seo_image)?.id ?? '',
      },
    })
  }

  public async postEdit(ctx: HttpContext) {
    const productCategoryId = await ctx.request.validateUsing(
      vine.compile(productCategoryIdValidator),
      {
        data: ctx.request.params(),
      }
    )

    const data = await ctx.request.validateUsing(vine.compile(updateProductCategoryValidator), {
      data: ctx.request.body(),
    })

    const productCategory = await db.query.productCategories.findFirst({
      where: eq(tb.productCategories.id, productCategoryId.id),
    })

    if (!productCategory) {
      ctx.session.flash('error', 'Product category not found')
      return ctx.response.redirect().back()
    }

    let updatedData: Partial<InferSelectModel<typeof tb.productCategories>> = {
      name: data.name,
      slug: productCategory.slug,
      sub_name: data.sub_name,
      description: data.description,
      publisher: data.publisher,
      is_available: data.is_available,
      is_featured: data.is_featured,
      label: data.label,
      delivery_type: data.delivery_type,
      is_seo_enabled: data.is_seo_enabled,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    }

    if (data.file_image_id) {
      const image = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.file_image_id),
      })

      if (!image) {
        ctx.session.flashErrors({
          file_image_id: 'Image file not found',
        })
        return ctx.response.redirect().back()
      }

      updatedData.image_url = image.url
    }

    if (data.file_banner_id) {
      const banner = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.file_banner_id),
      })

      if (!banner) {
        ctx.session.flashErrors({
          file_banner_id: 'Banner file not found',
        })
        return ctx.response.redirect().back()
      }

      updatedData.banner_url = banner.url
    }

    if (data.seo_image_id) {
      const seoImage = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.seo_image_id),
      })

      if (!seoImage) {
        ctx.session.flashErrors({
          seo_image_id: 'SEO image file not found',
        })
        return ctx.response.redirect().back()
      }

      updatedData.seo_image = seoImage.url
    }

    updatedData.slug = slugify(data.name ?? productCategory.name, {
      lowercase: true,
      separator: '-',
    })

    await db
      .update(tb.productCategories)
      .set(updatedData)
      .where(eq(tb.productCategories.id, productCategoryId.id))

    ctx.session.flash('success', 'Product category updated successfully')
    return ctx.response.redirect().back()
  }

  public async postDelete({ response, session, request }: HttpContext) {
    const data = await request.validateUsing(vine.compile(productCategoryIdValidator), {
      data: request.params(),
    })

    const productCategory = await db.query.productCategories.findFirst({
      where: eq(tb.productCategories.id, data.id),
    })

    if (!productCategory) {
      session.flash('error', 'Product category not found')
      return response.redirect().back()
    }

    await db.delete(tb.productCategories).where(eq(tb.productCategories.id, data.id))

    session.flash('success', 'Product category deleted successfully')
    return response.redirect().toRoute('productCategories.index')
  }

  public async getProductByCategoryNameJson(ctx: HttpContext) {
    const {
      limit = 100,
      page = 1,
      searchBy,
      searchQuery,
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
        eq(tb.productCategories.id, tb.productSubCategories.product_category_id)
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
        eq(tb.productCategories.id, tb.productSubCategories.product_category_id)
      )
      .innerJoin(tb.products, eq(tb.productSubCategories.id, tb.products.product_sub_category_id))
      .where(where.length ? and(...where) : undefined)

    return ctx.response.json({
      data: products,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    })
  }
}
