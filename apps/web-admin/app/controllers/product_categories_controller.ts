import type { HttpContext } from '@adonisjs/core/http'
import { and, asc, count, db, desc, eq, type InferSelectModel, ilike, inArray } from '@repo/db'
import { ProductBillingType, ProductCategoryType, tb } from '@repo/db/types'
import slugify from '@sindresorhus/slugify'
import vine from '@vinejs/vine'
import {
  createProductCategoryValidator,
  productCategoriesQueryValidator,
  productCategoryIdValidator,
  updateProductCategoryValidator,
} from '#validators/product'

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
      .orderBy(desc(tb.productCategories.created_at), asc(tb.productCategories.name))
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
        total: total[0].count,
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
    let iconImage: InferSelectModel<typeof tb.fileManager> | null = null

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

    if (data.file_icon_id) {
      const i = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.file_icon_id),
      })
      if (!i) {
        session.flashErrors({
          file_icon_id: 'Icon image file not found',
        })
        return response.redirect().back()
      }
      iconImage = i
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
        product_billing_type: data.product_billing_type,
        type: data.type,
        is_special_feature: data.is_special_feature,
        special_feature_key: data.special_feature_key,
        tags1: data.tags1,
        tags2: data.tags2,
        product_fullfillment_type: data.product_fullfillment_type,
        icon_url: iconImage?.url,
      })
      .returning()

    session.flash('success', 'Product category created successfully')
    return response.redirect(`/admin/product-categories/${data.type}/${productCategory[0].id}`)
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
        ]),
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
      },
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

    const updatedData: Partial<InferSelectModel<typeof tb.productCategories>> = {
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
      product_billing_type: data.product_billing_type,
      type: data.type,
      is_special_feature: data.is_special_feature,
      special_feature_key: data.special_feature_key,
      tags1: data.tags1,
      tags2: data.tags2,
      product_fullfillment_type: data.product_fullfillment_type,
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

    if (data.file_icon_id) {
      const iconImage = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.file_icon_id),
      })
      if (!iconImage) {
        ctx.session.flashErrors({
          file_icon_id: 'Icon image file not found',
        })
        return ctx.response.redirect().back()
      }
      updatedData.icon_url = iconImage.url
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
    return ctx.response.redirect().withQs().back()
  }

  public async postDelete({ response, session, request }: HttpContext) {
    const data = await request.validateUsing(vine.compile(productCategoryIdValidator), {
      data: request.params(),
    })

    const { type } = request.params()
    if (!Object.values(ProductCategoryType).includes(type)) {
      return response.notFound('Product category type not found')
    }

    const productCategory = await db.query.productCategories.findFirst({
      where: eq(tb.productCategories.id, data.id),
    })

    if (!productCategory) {
      session.flash('error', 'Product category not found')
      return response.redirect().withQs().back()
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .delete(tb.inputOnProductCategory)
          .where(eq(tb.inputOnProductCategory.product_category_id, data.id))

        await tx
          .delete(tb.productGroupingToProductCategories)
          .where(eq(tb.productGroupingToProductCategories.product_category_id, data.id))

        await tx.delete(tb.banners).where(eq(tb.banners.product_category_id, data.id))

        const subCategories = await tx
          .select({ id: tb.productSubCategories.id })
          .from(tb.productSubCategories)
          .where(eq(tb.productSubCategories.product_category_id, data.id))

        const subCategoryIds = subCategories.map((item) => item.id)

        if (subCategoryIds.length > 0) {
          await tx
            .delete(tb.products)
            .where(inArray(tb.products.product_sub_category_id, subCategoryIds))
        }

        await tx
          .delete(tb.productSubCategories)
          .where(eq(tb.productSubCategories.product_category_id, data.id))

        await tx.delete(tb.productCategories).where(eq(tb.productCategories.id, data.id))
      })
    } catch (_) {
      session.flash('error', 'Failed to delete product category. Remove dependencies first.')
      return response.redirect().withQs().back()
    }

    session.flash('success', 'Product category deleted successfully')
    return response.redirect().withQs().back()
  }

  public async getProductCategoryByCategoryNameJson(ctx: HttpContext) {
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

    const categoryWhere = []
    if (searchQuery) {
      if (searchBy === 'name') {
        categoryWhere.push(ilike(tb.productCategories.name, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        categoryWhere.push(eq(tb.productCategories.id, searchQuery))
      }
    }

    if (categoryId) {
      categoryWhere.push(eq(tb.productCategories.id, categoryId))
    }

    const offset = (page - 1) * limit

    const productCategories = await db.query.productCategories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        is_available: true,
      },
      where: categoryWhere.length ? and(...categoryWhere) : undefined,
      orderBy: [desc(tb.productCategories.created_at)],
      limit,
      offset,
    })

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.productCategories)
      .where(categoryWhere.length ? and(...categoryWhere) : undefined)

    return ctx.response.json({
      data: productCategories,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    })
  }
  // Pulsa Section
  public async indexGames(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.GAME),
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

    return ctx.inertia.render('products/prepaid/games/index', {
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

  public async createGames({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/games/create', {
      title: 'Create Game',
      description: 'Add a new game to the system.',
    })
  }

  public async editGames({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/games/edit', {
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

  // Pulsa Section
  public async indexPulsa(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.PULSA),
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

    return ctx.inertia.render('products/prepaid/pulsa/index', {
      title: 'Product Categories - Pulsa',
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

  public async createPulsa({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/pulsa/create', {
      title: 'Create Pulsa',
      description: 'Add a new pulsa to the system.',
    })
  }

  public async editPulsa({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/pulsa/edit', {
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

  // Kuota Section
  public async indexKuota(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.KUOTA),
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

    return ctx.inertia.render('products/prepaid/kuota/index', {
      title: 'Product Categories - Kuota',
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

  public async createKuota({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/kuota/create', {
      title: 'Create Kuota',
      description: 'Add a new kuota to the system.',
    })
  }

  public async editKuota({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/kuota/edit', {
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

  // Token PLN Section
  public async indexTokenPln(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.PLN_PREPAID),
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

    return ctx.inertia.render('products/prepaid/token-pln/index', {
      title: 'Product Categories - Token PLN',
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

  public async createTokenPln({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/token-pln/create', {
      title: 'Create Token PLN',
      description: 'Add a new token PLN to the system.',
    })
  }

  public async editTokenPln({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/kuota/edit', {
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

  // e-wallet Section
  public async indexEWallet(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.E_WALLET),
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

    return ctx.inertia.render('products/prepaid/e-wallet/index', {
      title: 'Product Categories - E-Wallet',
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

  public async createEWallet({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/e-wallet/create', {
      title: 'Create E-Wallet',
      description: 'Add a new E-Wallet to the system.',
    })
  }

  public async editEWallet({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/e-wallet/edit', {
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

  // voucher Section
  public async indexVoucher(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.VOUCHER),
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

    return ctx.inertia.render('products/prepaid/voucher/index', {
      title: 'Product Categories - Voucher',
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

  public async createVoucher({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/voucher/create', {
      title: 'Create Voucher',
      description: 'Add a new Voucher to the system.',
    })
  }

  public async editVoucher({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/voucher/edit', {
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

  public async indexOtherPrepaid(ctx: HttpContext) {
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
      eq(tb.productCategories.product_billing_type, ProductBillingType.PREPAID),
      eq(tb.productCategories.type, ProductCategoryType.OTHER),
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

    return ctx.inertia.render('products/prepaid/other-prepaid/index', {
      title: 'Product Categories - Other Prepaid',
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

  public async createOtherPrepaid({ inertia }: HttpContext) {
    return inertia.render('products/prepaid/other-prepaid/create', {
      title: 'Create Other Prepaid',
      description: 'Add a new Other Prepaid to the system.',
    })
  }

  public async editOtherPrepaid({ inertia, request, response }: HttpContext) {
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
        ]),
      )

    return inertia.render('products/prepaid/other-prepaid/edit', {
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
