import type { HttpContext } from '@adonisjs/core/http'
import { and, db, desc, eq } from '@repo/db'
import { ArticleType, tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import { createPageValidator, updatePageValidator } from '#validators/pages'

export default class PagesController {
  public async index({ inertia }: HttpContext) {
    const pages = await db.query.articles.findMany({
      where: eq(tb.articles.type, ArticleType.PAGE),
      orderBy: [desc(tb.articles.order), desc(tb.articles.created_at)],
    })

    return inertia.render('configs/pages/index', {
      pages,
    })
  }

  public async create({ inertia }: HttpContext) {
    return inertia.render('configs/pages/form', {
      page: null,
      mode: 'create',
    })
  }

  public async edit({ inertia, params }: HttpContext) {
    const page = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, params.id), eq(tb.articles.type, ArticleType.PAGE)),
    })

    if (!page) {
      return inertia.render('errors/not_found', {
        message: 'Page not found',
      })
    }

    return inertia.render('configs/pages/form', {
      page,
      mode: 'edit',
    })
  }

  public async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(createPageValidator), {
      data: ctx.request.body(),
    })

    const existing = await db.query.articles.findFirst({
      where: eq(tb.articles.slug, data.slug),
    })

    if (existing) {
      ctx.session.flash('error', 'Slug already exists')
      return ctx.response.redirect().back()
    }

    await db.insert(tb.articles).values({
      title: data.title,
      slug: data.slug,
      content: data.content,
      type: ArticleType.PAGE,
      is_published: data.is_published ?? false,
      order: data.order ?? 0,
    })

    ctx.session.flash('success', 'Page created successfully')
    return ctx.response.redirect('/admin/config/pages')
  }

  public async update(ctx: HttpContext) {
    const { id } = ctx.params
    const data = await ctx.request.validateUsing(vine.compile(updatePageValidator), {
      data: ctx.request.body(),
    })

    const page = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, id), eq(tb.articles.type, ArticleType.PAGE)),
    })

    if (!page) {
      ctx.session.flash('error', 'Page not found')
      return ctx.response.redirect().back()
    }

    if (data.slug && data.slug !== page.slug) {
      const existing = await db.query.articles.findFirst({
        where: eq(tb.articles.slug, data.slug),
      })

      if (existing) {
        ctx.session.flash('error', 'Slug already exists')
        return ctx.response.redirect().back()
      }
    }

    await db
      .update(tb.articles)
      .set({
        title: data.title ?? page.title,
        slug: data.slug ?? page.slug,
        content: data.content ?? page.content,
        is_published: data.is_published ?? page.is_published,
        order: data.order ?? page.order,
      })
      .where(eq(tb.articles.id, id))

    ctx.session.flash('success', 'Page updated successfully')
    return ctx.response.redirect('/admin/config/pages')
  }

  public async destroy(ctx: HttpContext) {
    const { id } = ctx.params

    const page = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, id), eq(tb.articles.type, ArticleType.PAGE)),
    })

    if (!page) {
      ctx.session.flash('error', 'Page not found')
      return ctx.response.redirect().back()
    }

    await db.delete(tb.articles).where(eq(tb.articles.id, id))

    ctx.session.flash('success', 'Page deleted successfully')
    return ctx.response.redirect('/admin/config/pages')
  }
}
