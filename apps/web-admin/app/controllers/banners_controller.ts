import { createBannerValidator } from '#validators/banners'
import { HttpContext } from '@adonisjs/core/http'
import { db, eq } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'
export default class BannersController {
  async index(ctx: HttpContext) {
    const banners = await db.query.banners.findMany({})

    return ctx.inertia.render('banners/index', {
      banners,
    })
  }

  async postCreate(ctx: HttpContext) {
    const {
      title,
      image_id: imageId,
      description,
      is_available: isAvailable,
      product_category_id: productCategoryId,
    } = await ctx.request.validateUsing(vine.compile(createBannerValidator), {
      data: ctx.request.body(),
    })

    // if product_category_id is provided, ensure it exists
    if (productCategoryId) {
      const pc = await db.query.productCategories.findFirst({
        where: eq(tb.productCategories.id, productCategoryId),
      })
      if (!pc) {
        ctx.session.flashErrors({ product_category_id: 'Product category not found' })
        return ctx.response.redirect().back()
      }
    }

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, imageId),
    })

    if (!image) {
      ctx.session.flashErrors({ image_id: 'Image not found' })
      return ctx.response.redirect().back()
    }

    await db.insert(tb.banners).values({
      title,
      image_url: image?.url ?? '',
      description: description ?? null,
      is_available: isAvailable ?? true,
      product_category_id: productCategoryId ?? null,
    })

    ctx.session.flash('success', 'Banner created successfully')
    return ctx.response.redirect().back()
  }

  async postDelete(ctx: HttpContext) {
    const schema = vine.object({ id: vine.string().uuid() })
    const { id } = await ctx.request.validateUsing(vine.compile(schema), {
      data: ctx.request.params(),
    })

    const banner = await db.query.banners.findFirst({ where: eq(tb.banners.id, id) })
    if (!banner) {
      ctx.session.flashErrors({ id: 'Banner not found' })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.banners).where(eq(tb.banners.id, id))
    ctx.session.flash('success', 'Banner deleted successfully')
    return ctx.response.redirect().back()
  }
}
