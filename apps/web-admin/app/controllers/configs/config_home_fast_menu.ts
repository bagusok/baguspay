/* eslint-disable @typescript-eslint/naming-convention */
import {
  configHomeIdValidator,
  connectProductToSectionValidator,
  createHomeProductSectionValidator,
  updateHomeProductSectionValidator,
} from '#validators/config_home'
import type { HttpContext } from '@adonisjs/core/http'
import { and, db, eq } from '@repo/db'
import { AppPlatform, ProductGroupingMenuType, ProductGroupingType, tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class ConfigHomeFastMenuController {
  async index(ctx: HttpContext) {
    const productSections = await db.query.productGroupings.findMany({
      where: eq(tb.productGroupings.menu_type, ProductGroupingMenuType.FAST_MENU),
    })

    for (const section of productSections) {
      const file = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.url, section.image_url),
      })
      ;(section as any).image_id = file?.id || null
    }

    return ctx.inertia.render('configs/fast-menu/index', {
      productSections,
    })
  }

  async detail(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(configHomeIdValidator), {
      data: ctx.request.params(),
    })

    const productSection = await db.query.productGroupings.findFirst({
      where: eq(tb.productGroupings.id, id),
      columns: {
        id: true,
        name: true,
        image_url: true,
        description: true,
        redirect_url: true,
        platform: true,
        type: true,
        menu_type: true,
        is_available: true,
        is_featured: true,
        label: true,
        order: true,
      },
    })

    if (!productSection) {
      ctx.session.flashErrors({
        id: 'Product section not found',
      })
      return ctx.response.redirect().back()
    }

    const productOnProductSections = await db.query.productGroupingToProductCategories.findMany({
      with: {
        productCategory: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      where: eq(tb.productGroupingToProductCategories.product_grouping_id, productSection.id),
    })

    return ctx.inertia.render('configs/fast-menu/detail', {
      productSection,
      productOnProductSections,
    })
  }

  async createProductSection(ctx: HttpContext) {
    const {
      image_id,
      name,
      description = null,
      redirect_url = null,
      app_key = null,
      platform = AppPlatform.WEB,
      type = ProductGroupingType.MODAL,
      menu_type = ProductGroupingMenuType.FAST_MENU,
      is_available = false,
      is_featured = false,
      label = null,
      order = 0,
      is_special_feature = false,
      special_feature_key = null,
    } = await ctx.request.validateUsing(vine.compile(createHomeProductSectionValidator), {
      data: ctx.request.body(),
    })

    let image = await db.query.fileManager.findFirst({
      where: eq(tb.fileManager.id, image_id),
    })

    if (!image) {
      ctx.session.flashErrors({
        image_id: 'Image not found',
      })

      return ctx.response.redirect().back()
    }

    await db.insert(tb.productGroupings).values({
      name: name,
      image_url: image.url,
      description,
      redirect_url,
      app_key,
      platform,
      type,
      menu_type,
      is_available,
      is_featured,
      label,
      order,
      is_special_feature,
      special_feature_key,
    })

    ctx.session.flash('success', 'Product section created successfully')
    return ctx.response.redirect().back()
  }

  async updateProductSection(ctx: HttpContext) {
    console.log('Update Product Section', ctx.request.body())

    const {
      name,
      description = null,
      image_id,
      redirect_url = null,
      app_key = null,
      platform = AppPlatform.WEB,
      type = ProductGroupingType.MODAL,
      menu_type = ProductGroupingMenuType.FAST_MENU,
      is_available = false,
      is_featured = false,
      label = null,
      order = 0,
      is_special_feature = false,
      special_feature_key = null,
    } = await ctx.request.validateUsing(vine.compile(updateHomeProductSectionValidator), {
      data: ctx.request.body(),
    })

    const { id } = await ctx.request.validateUsing(vine.compile(configHomeIdValidator), {
      data: ctx.request.params(),
    })

    const productSection = await db.query.productGroupings.findFirst({
      where: eq(tb.productGroupings.id, id),
    })

    if (!productSection) {
      ctx.session.flashErrors({
        id: 'Product section not found',
      })
      return ctx.response.redirect().back()
    }

    let imageUrl = null
    if (image_id) {
      const image = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, image_id),
      })

      if (!image) {
        ctx.session.flashErrors({
          image_id: 'Image not found',
        })
        return ctx.response.redirect().back()
      }
      imageUrl = image.url
    }

    await db
      .update(tb.productGroupings)
      .set({
        name,
        ...(imageUrl ? { image_url: imageUrl } : {}),
        description,
        redirect_url,
        app_key,
        platform,
        type,
        menu_type,
        is_available,
        is_featured,
        label,
        order,
        is_special_feature,
        special_feature_key,
      })
      .where(eq(tb.productGroupings.id, id))

    ctx.session.flash('success', 'Product section updated successfully')
    return ctx.response.redirect().back()
  }

  async deleteProductSection(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(configHomeIdValidator), {
      data: ctx.request.params(),
    })

    const productSection = await db.query.productGroupings.findFirst({
      where: eq(tb.productGroupings.id, id),
    })

    if (!productSection) {
      ctx.session.flashErrors({
        id: 'Product section not found',
      })
      return ctx.response.redirect().back()
    }

    await db.delete(tb.productGroupings).where(eq(tb.productGroupings.id, id))

    ctx.session.flash('success', 'Product section deleted successfully')
    return ctx.response.redirect().back()
  }

  async connectProductToSection(ctx: HttpContext) {
    const { product_category_id } = await ctx.request.validateUsing(
      vine.compile(connectProductToSectionValidator),
      {
        data: ctx.request.body(),
      }
    )

    console.log('Connecting product category to section', product_category_id, ctx.request.params())

    const { id: product_grouping_id } = await ctx.request.validateUsing(
      vine.compile(configHomeIdValidator),
      {
        data: ctx.request.params(),
      }
    )

    const productCategory = await db.query.productCategories.findFirst({
      where: eq(tb.productCategories.id, product_category_id),
    })

    if (!productCategory) {
      ctx.session.flashErrors({
        product_category_id: 'Product category not found',
      })
      return ctx.response.redirect().back()
    }

    const check = await db.query.productGroupingToProductCategories.findFirst({
      where: and(
        eq(tb.productGroupingToProductCategories.product_category_id, product_category_id),
        eq(tb.productGroupingToProductCategories.product_grouping_id, product_grouping_id)
      ),
    })

    if (check) {
      ctx.session.flashErrors({
        product_category_id: 'Product category already connected to this section',
      })
      return ctx.response.redirect().back()
    }

    await db.insert(tb.productGroupingToProductCategories).values({
      id: crypto.randomUUID(),
      product_category_id,
      product_grouping_id,
    })

    ctx.session.flash('success', 'Product category connected to section successfully')
    return ctx.response.redirect().back()
  }

  async disconnectProductFromSection(ctx: HttpContext) {
    const { product_category_id } = await ctx.request.validateUsing(
      vine.compile(connectProductToSectionValidator),
      {
        data: ctx.request.body(),
      }
    )

    const { id: product_grouping_id } = await ctx.request.validateUsing(
      vine.compile(configHomeIdValidator),
      {
        data: ctx.request.params(),
      }
    )

    const check = await db.query.productGroupingToProductCategories.findFirst({
      where: and(
        eq(tb.productGroupingToProductCategories.product_category_id, product_category_id),
        eq(tb.productGroupingToProductCategories.product_grouping_id, product_grouping_id)
      ),
    })

    if (!check) {
      ctx.session.flashErrors({
        product_category_id: 'Product category not connected to this section',
      })
      return ctx.response.redirect().back()
    }

    await db
      .delete(tb.productGroupingToProductCategories)
      .where(eq(tb.productGroupingToProductCategories.id, check.id))

    ctx.session.flash('success', 'Product category disconnected from section successfully')
    return ctx.response.redirect().back()
  }
}
