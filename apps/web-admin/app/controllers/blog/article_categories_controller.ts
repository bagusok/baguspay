import type { HttpContext } from '@adonisjs/core/http'
import { db, desc, eq } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import {
  createArticleCategoryValidator,
  updateArticleCategoryValidator,
} from '#validators/articles'

export default class ArticleCategoriesController {
  public async index({ inertia }: HttpContext) {
    const categories = await db.query.articleCategories.findMany({
      orderBy: [desc(tb.articleCategories.created_at)],
    })

    return inertia.render('blog/categories/index', {
      categories,
    })
  }

  public async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(createArticleCategoryValidator), {
      data: ctx.request.body(),
    })

    const existing = await db.query.articleCategories.findFirst({
      where: eq(tb.articleCategories.slug, data.slug),
    })

    if (existing) {
      ctx.session.flash('error', 'Slug already exists')
      return ctx.response.redirect().back()
    }

    await db.insert(tb.articleCategories).values({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
    })

    ctx.session.flash('success', 'Category created successfully')
    return ctx.response.redirect('/admin/blog/categories')
  }

  public async update(ctx: HttpContext) {
    const { id } = ctx.params
    const data = await ctx.request.validateUsing(vine.compile(updateArticleCategoryValidator), {
      data: ctx.request.body(),
    })

    const category = await db.query.articleCategories.findFirst({
      where: eq(tb.articleCategories.id, id),
    })

    if (!category) {
      ctx.session.flash('error', 'Category not found')
      return ctx.response.redirect().back()
    }

    if (data.slug && data.slug !== category.slug) {
      const existing = await db.query.articleCategories.findFirst({
        where: eq(tb.articleCategories.slug, data.slug),
      })

      if (existing) {
        ctx.session.flash('error', 'Slug already exists')
        return ctx.response.redirect().back()
      }
    }

    await db
      .update(tb.articleCategories)
      .set({
        name: data.name ?? category.name,
        slug: data.slug ?? category.slug,
        description: data.description !== undefined ? data.description : category.description,
      })
      .where(eq(tb.articleCategories.id, id))

    ctx.session.flash('success', 'Category updated successfully')
    return ctx.response.redirect('/admin/blog/categories')
  }

  public async destroy(ctx: HttpContext) {
    const { id } = ctx.params

    const category = await db.query.articleCategories.findFirst({
      where: eq(tb.articleCategories.id, id),
    })

    if (!category) {
      ctx.session.flash('error', 'Category not found')
      return ctx.response.redirect().back()
    }

    await db.delete(tb.articleCategories).where(eq(tb.articleCategories.id, id))

    ctx.session.flash('success', 'Category deleted successfully')
    return ctx.response.redirect('/admin/blog/categories')
  }

  public async getJson({ response }: HttpContext) {
    const categories = await db.query.articleCategories.findMany({
      orderBy: [desc(tb.articleCategories.name)],
    })

    return response.json(categories)
  }
}
