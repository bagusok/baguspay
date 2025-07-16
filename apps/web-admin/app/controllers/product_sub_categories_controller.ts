import {
  createProductSubCategoryValidator,
  productIdValidator,
  updateProductSubCategoryValidator,
} from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'
import { db, eq } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class ProductSubCategoriesController {
  public async postCreate(ctx: HttpContext) {
    const { image_id: imageId, ...data } = await ctx.request.validateUsing(
      vine.compile(createProductSubCategoryValidator),
      {
        data: ctx.request.body(),
      }
    )

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, imageId),
    })

    if (!image) {
      ctx.session.flashErrors({
        image_id: 'Image file not found',
      })
    }

    await db.insert(tb.productSubCategories).values({
      image_url: image!.url,
      ...data,
    })

    ctx.session.flash('success', 'Product sub-category created successfully.')
    return ctx.response.redirect().back()
  }

  public async postUpdate(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const data = await ctx.request.validateUsing(vine.compile(updateProductSubCategoryValidator), {
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

    const productSubCategory = await db.query.productSubCategories.findFirst({
      where: eq(tb.productSubCategories.id, id),
    })

    if (!productSubCategory) {
      ctx.session.flashErrors({
        error: 'Product sub-category not found',
      })
      return ctx.response.redirect().back()
    }

    const updatedData: Partial<typeof productSubCategory> = {
      name: data.name,
      sub_name: data.sub_name,
      is_available: data.is_available,
      is_featured: data.is_featured,
      label: data.label,
      description: data.description,
      image_url: imageUrl ?? productSubCategory.image_url,
    }

    await db
      .update(tb.productSubCategories)
      .set(updatedData)
      .where(eq(tb.productSubCategories.id, id))

    ctx.session.flash('success', 'Product sub-category updated successfully.')
    return ctx.response.redirect().back()
  }

  public async postDelete(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const productSubCategory = await db.query.productSubCategories.findFirst({
      where: eq(tb.productSubCategories.id, id),
    })

    if (!productSubCategory) {
      ctx.session.flashErrors({
        error: 'Product sub-category not found',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.productSubCategories).where(eq(tb.productSubCategories.id, id))

    ctx.session.flash('success', 'Product sub-category deleted successfully.')
    return ctx.response.redirect().back()
  }

  public async detail(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(productIdValidator), {
      data: ctx.request.params(),
    })

    const productSubCategory = await db.query.productSubCategories.findFirst({
      where: eq(tb.productSubCategories.id, id),
    })

    if (!productSubCategory) {
      ctx.session.flashErrors({
        error: 'Product sub-category not found',
      })
      return ctx.response.redirect().back()
    }

    const image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.url, productSubCategory.image_url),
    })

    return ctx.response.json({
      data: {
        ...productSubCategory,
        image_id: image?.id,
      },
    })
  }
}
