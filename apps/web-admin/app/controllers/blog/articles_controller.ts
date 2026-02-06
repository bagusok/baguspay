import type { HttpContext } from '@adonisjs/core/http'
import { and, db, desc, eq } from '@repo/db'
import { ArticleType, tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import { createArticleValidator, updateArticleValidator } from '#validators/articles'

export default class ArticlesController {
  public async index({ inertia }: HttpContext) {
    const articles = await db.query.articles.findMany({
      where: eq(tb.articles.type, ArticleType.ARTICLE),
      orderBy: [desc(tb.articles.created_at)],
      with: {
        category: true,
      },
    })

    const categories = await db.query.articleCategories.findMany({
      orderBy: [desc(tb.articleCategories.name)],
    })

    return inertia.render('blog/articles/index', {
      articles,
      categories,
    })
  }

  public async create({ inertia }: HttpContext) {
    const categories = await db.query.articleCategories.findMany({
      orderBy: [desc(tb.articleCategories.name)],
    })

    return inertia.render('blog/articles/form', {
      article: null,
      categories,
      mode: 'create',
    })
  }

  public async edit({ inertia, params }: HttpContext) {
    const article = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, params.id), eq(tb.articles.type, ArticleType.ARTICLE)),
      with: {
        category: true,
      },
    })

    if (!article) {
      return inertia.render('errors/not-found', {
        message: 'Article not found',
      })
    }

    const categories = await db.query.articleCategories.findMany({
      orderBy: [desc(tb.articleCategories.name)],
    })

    return inertia.render('blog/articles/form', {
      article,
      categories,
      mode: 'edit',
    })
  }

  public async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(createArticleValidator), {
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
      excerpt: data.excerpt ?? null,
      content: data.content,
      image_url: data.image_url ?? null,
      type: ArticleType.ARTICLE,
      article_category_id: data.article_category_id ?? null,
      is_published: data.is_published ?? false,
      is_featured: data.is_featured ?? false,
      order: data.order ?? 0,
      tags: data.tags ?? [],
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      published_at: data.is_published ? new Date() : null,
    })

    ctx.session.flash('success', 'Article created successfully')
    return ctx.response.redirect('/admin/blog/articles')
  }

  public async update(ctx: HttpContext) {
    const { id } = ctx.params
    const data = await ctx.request.validateUsing(vine.compile(updateArticleValidator), {
      data: ctx.request.body(),
    })

    const article = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, id), eq(tb.articles.type, ArticleType.ARTICLE)),
    })

    if (!article) {
      ctx.session.flash('error', 'Article not found')
      return ctx.response.redirect().back()
    }

    if (data.slug && data.slug !== article.slug) {
      const existing = await db.query.articles.findFirst({
        where: eq(tb.articles.slug, data.slug),
      })

      if (existing) {
        ctx.session.flash('error', 'Slug already exists')
        return ctx.response.redirect().back()
      }
    }

    const wasPublished = article.is_published
    const isNowPublished = data.is_published ?? article.is_published

    await db
      .update(tb.articles)
      .set({
        title: data.title ?? article.title,
        slug: data.slug ?? article.slug,
        excerpt: data.excerpt !== undefined ? data.excerpt : article.excerpt,
        content: data.content ?? article.content,
        image_url: data.image_url !== undefined ? data.image_url : article.image_url,
        article_category_id:
          data.article_category_id !== undefined
            ? data.article_category_id
            : article.article_category_id,
        is_published: isNowPublished,
        is_featured: data.is_featured ?? article.is_featured,
        order: data.order ?? article.order,
        tags: data.tags ?? article.tags,
        meta_title: data.meta_title !== undefined ? data.meta_title : article.meta_title,
        meta_description:
          data.meta_description !== undefined ? data.meta_description : article.meta_description,
        published_at: !wasPublished && isNowPublished ? new Date() : article.published_at,
      })
      .where(eq(tb.articles.id, id))

    ctx.session.flash('success', 'Article updated successfully')
    return ctx.response.redirect('/admin/blog/articles')
  }

  public async destroy(ctx: HttpContext) {
    const { id } = ctx.params

    const article = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, id), eq(tb.articles.type, ArticleType.ARTICLE)),
    })

    if (!article) {
      ctx.session.flash('error', 'Article not found')
      return ctx.response.redirect().back()
    }

    await db.delete(tb.articles).where(eq(tb.articles.id, id))

    ctx.session.flash('success', 'Article deleted successfully')
    return ctx.response.redirect('/admin/blog/articles')
  }

  public async togglePublish(ctx: HttpContext) {
    const { id } = ctx.params

    const article = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, id), eq(tb.articles.type, ArticleType.ARTICLE)),
    })

    if (!article) {
      ctx.session.flash('error', 'Article not found')
      return ctx.response.redirect().back()
    }

    const newPublishState = !article.is_published

    await db
      .update(tb.articles)
      .set({
        is_published: newPublishState,
        published_at: newPublishState && !article.published_at ? new Date() : article.published_at,
      })
      .where(eq(tb.articles.id, id))

    ctx.session.flash('success', newPublishState ? 'Article published' : 'Article unpublished')
    return ctx.response.redirect().back()
  }

  public async toggleFeatured(ctx: HttpContext) {
    const { id } = ctx.params

    const article = await db.query.articles.findFirst({
      where: and(eq(tb.articles.id, id), eq(tb.articles.type, ArticleType.ARTICLE)),
    })

    if (!article) {
      ctx.session.flash('error', 'Article not found')
      return ctx.response.redirect().back()
    }

    await db
      .update(tb.articles)
      .set({
        is_featured: !article.is_featured,
      })
      .where(eq(tb.articles.id, id))

    ctx.session.flash(
      'success',
      !article.is_featured ? 'Article featured' : 'Article removed from featured',
    )
    return ctx.response.redirect().back()
  }
}
