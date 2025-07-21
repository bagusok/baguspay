import {
  addOfferPaymentMethodValidator,
  addOfferProductValidator,
  addOfferUserValidator,
  deleteOfferPaymentMethodValidator,
  deleteOfferProductValidator,
  deleteOfferUserValidator,
  insertOfferValidator,
  offerIdValidator,
  offerQueryValidator,
  offerUserQueryValidator,
  updateOfferValidator,
} from '#validators/offer'
import type { HttpContext } from '@adonisjs/core/http'
import { and, count, db, desc, eq, ilike, inArray, SQL } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class OfferController {
  async index(ctx: HttpContext) {
    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await ctx.request.validateUsing(vine.compile(offerQueryValidator), {
      data: ctx.request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter: SQL[] = []

    if (searchQuery) {
      if (searchBy === 'code') {
        whereFilter.push(ilike(tb.offers.code, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.offers.id, searchQuery))
      } else if (searchBy === 'name') {
        whereFilter.push(ilike(tb.offers.name, `%${searchQuery}%`))
      }
    }

    const offers = await db.query.offers.findMany({
      where: and(...whereFilter),
      orderBy: desc(tb.offers.created_at),
      limit,
      offset,
      columns: {
        id: true,
        name: true,
        sub_name: true,
        image_url: true,
        description: true,
        code: true,
        quota: true,
        discount_static: true,
        discount_percentage: true,
        discount_maximum: true,
        start_date: true,
        end_date: true,
        is_available: true,
        is_featured: true,
        label: true,
        is_all_users: true,
        is_all_payment_methods: true,
        is_all_products: true,
      },
    })

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.offers)
      .where(and(...whereFilter))

    return ctx.inertia.render('offers/index', {
      offers,
      pagination: {
        page: page,
        limit,
        total,
        totalPages: Math.ceil(total.count / limit),
      },
      filters: {
        searchBy,
        searchQuery,
      },
    })
  }

  async create(ctx: HttpContext) {
    return ctx.inertia.render('offers/create')
  }

  async postCreate(ctx: HttpContext) {
    const { image_id: imageId, ...offerData } = await ctx.request.validateUsing(
      vine.compile(insertOfferValidator),
      {
        data: ctx.request.body(),
      }
    )

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, imageId),
    })

    if (!image) {
      ctx.session.flashErrors({
        image_id: 'Image not found',
      })
      return ctx.response.badRequest('Image not found')
    }

    const [newOffer] = await db
      .insert(tb.offers)
      .values({
        image_url: image.url,
        ...offerData,
      })
      .returning({
        id: tb.offers.id,
      })

    return ctx.response.redirect().toRoute('offers.edit', {
      id: newOffer.id,
    })
  }

  async edit(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const offer = await db.query.offers.findFirst({
      where: eq(tb.offers.id, id),
    })

    if (!offer) {
      ctx.session.flashErrors({
        error: 'Offer not found',
      })
      return ctx.response.notFound('Offer not found')
    }

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.url, offer.image_url),
    })

    ctx.session.flash('success', 'Offer loaded successfully')
    return ctx.inertia.render('offers/edit', {
      offer: {
        ...offer,
        image_id: image ? image.id : null,
      },
    })
  }

  async postUpdate(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { image_id: imageId, ...offerData } = await ctx.request.validateUsing(
      vine.compile(updateOfferValidator),
      {
        data: ctx.request.body(),
      }
    )

    let imageUrl: string | null = null

    if (imageId) {
      const image = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, imageId),
      })

      if (!image) {
        ctx.session.flashErrors({
          image_id: 'Image not found',
        })
        return ctx.response.badRequest('Image not found')
      }

      imageUrl = image.url
    }

    const updatedOffer = await db
      .update(tb.offers)
      .set({
        ...(imageUrl ? { image_url: imageUrl } : {}),
        ...offerData,
      })
      .where(eq(tb.offers.id, id))
      .returning({
        id: tb.offers.id,
      })

    if (updatedOffer.length === 0) {
      ctx.session.flashErrors({
        error: 'Offer not found or update failed',
      })
      return ctx.response.notFound('Offer not found')
    }

    ctx.session.flash('success', 'Offer updated successfully')
    return ctx.response.redirect().back()
  }

  async postDelete(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const deletedOffer = await db.delete(tb.offers).where(eq(tb.offers.id, id)).returning({
      id: tb.offers.id,
    })

    if (deletedOffer.length === 0) {
      ctx.session.flashErrors({
        error: 'Offer not found or delete failed',
      })
      return ctx.response.notFound('Offer not found')
    }

    ctx.session.flash('success', 'Offer deleted successfully')
    return ctx.response.redirect().toRoute('offer.index')
  }

  async connectUser(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { users } = await ctx.request.validateUsing(vine.compile(addOfferUserValidator), {
      data: ctx.request.body(),
    })

    const offer = await db.query.offers.findFirst({
      where: eq(tb.offers.id, id),
    })

    if (!offer) {
      ctx.session.flashErrors({
        error: 'Offer not found',
      })
      return ctx.response.redirect().back()
    }

    const userIds = users.map((user) => user.user_id)
    const existingOfferUsers = await db.query.offerUsers.findMany({
      where: and(eq(tb.offerUsers.offer_id, id), inArray(tb.offerUsers.user_id, userIds)),
      columns: {
        user_id: true,
      },
    })

    const existingUserIds = existingOfferUsers.map((ou) => ou.user_id)

    const newUserIds = userIds.filter((userId) => !existingUserIds.includes(userId))

    if (newUserIds.length === 0) {
      ctx.session.flashErrors({
        error: 'All users are already connected to this offer',
      })
      return ctx.response.redirect().back()
    }

    const newOfferUsers = newUserIds.map((userId) => ({
      offer_id: id,
      user_id: userId,
    }))

    await db.insert(tb.offerUsers).values(newOfferUsers).onConflictDoNothing()

    ctx.session.flash('success', 'User connected to offer successfully')
    return ctx.response.redirect().back()
  }

  async disconnectUser(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { user_ids: userIds } = await ctx.request.validateUsing(
      vine.compile(deleteOfferUserValidator),
      {
        data: ctx.request.body(),
      }
    )

    const offerUser = await db.query.offerUsers.findFirst({
      where: and(eq(tb.offerUsers.offer_id, id), inArray(tb.offerUsers.user_id, userIds)),
    })

    if (!offerUser) {
      ctx.session.flashErrors({
        error: 'User not connected to this offer',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.offerUsers).where(eq(tb.offerUsers.id, offerUser.id))

    ctx.session.flash('success', 'User disconnected from offer successfully')
    return ctx.response.redirect().back()
  }

  async connectProduct(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { products } = await ctx.request.validateUsing(vine.compile(addOfferProductValidator), {
      data: ctx.request.body(),
    })

    const offer = await db.query.offers.findFirst({
      where: eq(tb.offers.id, id),
    })
    if (!offer) {
      ctx.session.flashErrors({
        error: 'Offer not found',
      })
      return ctx.response.redirect().back()
    }

    const productIds = products.map((product) => product.product_id)
    const existingOfferProducts = await db.query.offer_products.findMany({
      where: and(
        eq(tb.offer_products.offer_id, id),
        inArray(tb.offer_products.product_id, productIds)
      ),
      columns: {
        product_id: true,
      },
    })

    const existingProductIds = existingOfferProducts.map((op) => op.product_id)
    const newProductIds = productIds.filter((productId) => !existingProductIds.includes(productId))
    if (newProductIds.length === 0) {
      ctx.session.flashErrors({
        error: 'All products are already connected to this offer',
      })
      return ctx.response.redirect().back()
    }

    const newOfferProducts = newProductIds.map((productId) => ({
      offer_id: id,
      product_id: productId,
    }))

    await db.insert(tb.offer_products).values(newOfferProducts).onConflictDoNothing()

    ctx.session.flash('success', 'Product connected to offer successfully')
    return ctx.response.redirect().back()
  }

  async disconnectProduct(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { product_ids: productIds } = await ctx.request.validateUsing(
      vine.compile(deleteOfferProductValidator),
      {
        data: ctx.request.body(),
      }
    )

    const offerProduct = await db.query.offer_products.findFirst({
      where: and(
        eq(tb.offer_products.offer_id, id),
        inArray(tb.offer_products.product_id, productIds)
      ),
    })

    if (!offerProduct) {
      ctx.session.flashErrors({
        error: 'Product not connected to this offer',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.offer_products).where(eq(tb.offer_products.id, offerProduct.id))

    ctx.session.flash('success', 'Product disconnected from offer successfully')
    return ctx.response.redirect().back()
  }

  async connectPaymentMethod(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { payments } = await ctx.request.validateUsing(
      vine.compile(addOfferPaymentMethodValidator),
      {
        data: ctx.request.body(),
      }
    )

    const offer = await db.query.offers.findFirst({
      where: eq(tb.offers.id, id),
    })
    if (!offer) {
      ctx.session.flashErrors({
        error: 'Offer not found',
      })
      return ctx.response.redirect().back()
    }

    const paymentMethodIds = payments.map((payment) => payment.payment_method_id)
    const existingOfferPaymentMethods = await db.query.offerPaymentMethods.findMany({
      where: and(
        eq(tb.offerPaymentMethods.offer_id, id),
        inArray(tb.offerPaymentMethods.payment_method_id, paymentMethodIds)
      ),
      columns: {
        payment_method_id: true,
      },
    })

    const existingPaymentMethodIds = existingOfferPaymentMethods.map((opm) => opm.payment_method_id)

    const newPaymentMethodIds = paymentMethodIds.filter(
      (paymentMethodId) => !existingPaymentMethodIds.includes(paymentMethodId)
    )

    if (newPaymentMethodIds.length === 0) {
      ctx.session.flashErrors({
        error: 'All payment methods are already connected to this offer',
      })
      return ctx.response.redirect().back()
    }

    const newOfferPaymentMethods = newPaymentMethodIds.map((paymentMethodId) => ({
      offer_id: id,
      payment_method_id: paymentMethodId,
    }))
    await db.insert(tb.offerPaymentMethods).values(newOfferPaymentMethods).onConflictDoNothing()

    ctx.session.flash('success', 'Payment method connected to offer successfully')
    return ctx.response.redirect().back()
  }

  async disconnectPaymentMethod(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const { payment_method_ids: paymentIds } = await ctx.request.validateUsing(
      vine.compile(deleteOfferPaymentMethodValidator),
      {
        data: ctx.request.body(),
      }
    )

    const offerPaymentMethod = await db.query.offerPaymentMethods.findFirst({
      where: and(
        eq(tb.offerPaymentMethods.offer_id, id),
        inArray(tb.offerPaymentMethods.payment_method_id, paymentIds)
      ),
    })

    if (!offerPaymentMethod) {
      ctx.session.flashErrors({
        error: 'Payment method not connected to this offer',
      })
      return ctx.response.redirect().back()
    }

    await db
      .delete(tb.offerPaymentMethods)
      .where(eq(tb.offerPaymentMethods.id, offerPaymentMethod.id))

    ctx.session.flash('success', 'Payment method disconnected from offer successfully')
    return ctx.response.redirect().back()
  }

  async getOfferUsers(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await ctx.request.validateUsing(vine.compile(offerUserQueryValidator), {
      data: ctx.request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter: SQL[] = [eq(tb.offerUsers.offer_id, id)]

    if (searchQuery) {
      if (searchBy === 'name') {
        whereFilter.push(ilike(tb.users.name, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.users.id, searchQuery))
      } else if (searchBy === 'email') {
        whereFilter.push(ilike(tb.users.email, `%${searchQuery}%`))
      }
    }

    const offerUsers = await db
      .select({
        offer_id: tb.offerUsers.offer_id,
        offer_user_id: tb.offerUsers.id,
        user_id: tb.users.id,
        user_name: tb.users.name,
        user_email: tb.users.email,
        created_at: tb.offerUsers.created_at,
        updated_at: tb.offerUsers.updated_at,
      })
      .from(tb.offerUsers)
      .innerJoin(tb.users, eq(tb.offerUsers.user_id, tb.users.id))
      .where(and(...whereFilter))
      .orderBy(desc(tb.offerUsers.created_at))
      .limit(limit)
      .offset(offset)

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.offerUsers)
      .where(and(...whereFilter))

    return ctx.response.json({
      data: offerUsers,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    })
  }

  async getOfferProducts(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await ctx.request.validateUsing(vine.compile(offerUserQueryValidator), {
      data: ctx.request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter: SQL[] = [eq(tb.offer_products.offer_id, id)]

    if (searchQuery) {
      if (searchBy === 'name') {
        whereFilter.push(ilike(tb.products.name, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.products.id, searchQuery))
      }
    }

    const offerProducts = await db.query.offer_products.findMany({
      where: and(...whereFilter),
      orderBy: desc(tb.offer_products.created_at),
      limit,
      offset,
      columns: {
        id: true,
        offer_id: true,
      },
      with: {
        product: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            product_sub_category: {
              columns: {
                id: true,
                name: true,
              },
              with: {
                product_category: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // const newOfferProducts = offerProducts.flatMap((op) => ({
    //   id: op.id,
    //   offer_id: op.,
    //   product_id: op.product.id,
    //   product_name: op.product.name,
    //   product_sub_category_id: op.product.product_sub_category.id,
    //   product_sub_category_name: op.product.product_sub_category.name,
    //   product_category_id: op.product.product_sub_category.product_category.id,
    //   product_category_name: op.product.product_sub_category.product_category.name,
    // }))

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.offer_products)
      .where(and(...whereFilter))

    return ctx.response.json({
      data: offerProducts,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    })
  }

  async getOfferPaymentMethods(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(offerIdValidator), {
      data: ctx.request.params(),
    })

    const {
      limit = 10,
      page = 1,
      searchBy,
      searchQuery,
    } = await ctx.request.validateUsing(vine.compile(offerUserQueryValidator), {
      data: ctx.request.qs(),
    })

    const offset = (page - 1) * limit
    const whereFilter: SQL[] = [eq(tb.offerPaymentMethods.offer_id, id)]

    if (searchQuery) {
      if (searchBy === 'name') {
        whereFilter.push(ilike(tb.paymentMethods.name, `%${searchQuery}%`))
      } else if (searchBy === 'id') {
        whereFilter.push(eq(tb.paymentMethods.id, searchQuery))
      }
    }

    const offerPaymentMethods = await db.query.offerPaymentMethods.findMany({
      where: and(...whereFilter),
      orderBy: desc(tb.offerPaymentMethods.created_at),
      limit,
      offset,
      columns: {
        id: true,
        offer_id: true,
        created_at: true,
        updated_at: true,
      },
      with: {
        payment_method: {
          columns: {
            id: true,
            name: true,
            provider_name: true,
          },
        },
      },
    })

    const newOfferPaymentMethods = offerPaymentMethods.flatMap((opm) => ({
      id: opm.id,
      payment_method_id: opm.payment_method.id,
      payment_method_name: opm.payment_method.name,
      payment_method_provider_name: opm.payment_method.provider_name,
      offer_id: opm.offer_id,

      created_at: opm.created_at,
      updated_at: opm.updated_at,
    }))

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.offerPaymentMethods)
      .where(and(...whereFilter))

    return ctx.response.json({
      data: newOfferPaymentMethods,
      meta: {
        page: page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    })
  }
}
