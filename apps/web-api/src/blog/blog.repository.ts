import { Injectable } from '@nestjs/common'
import { and, asc, count, desc, eq, ilike, type SQL } from '@repo/db'
import { type ArticleType, tb } from '@repo/db/types'
import type { DatabaseService } from 'src/database/database.service'
import type { GetBlogPostsDto } from './blog.dto'

@Injectable()
export class BlogRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(q: GetBlogPostsDto, type: ArticleType) {
    const whereClause: SQL[] = [eq(tb.articles.type, type), eq(tb.articles.is_published, true)]

    if (q.search) {
      whereClause.push(ilike(tb.articles.title, `%${q.search}%`))
    }

    if (q.category_id) {
      whereClause.push(eq(tb.articles.article_category_id, q.category_id))
    }

    const blogs = await this.databaseService.db.query.articles.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        image_url: true,
        tags: true,
        is_featured: true,
        excerpt: true,
        created_at: true,
      },
      with: {
        category: {
          columns: {
            name: true,
            slug: true,
          },
        },
      },
      where: and(...whereClause),
      orderBy: q.sort_by === 'asc' ? asc(tb.articles.created_at) : desc(tb.articles.created_at),
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
    })

    return blogs
  }

  async countAllPosts(q: GetBlogPostsDto, type: ArticleType) {
    const whereClause: SQL[] = [eq(tb.articles.type, type), eq(tb.articles.is_published, true)]

    if (q.search) {
      whereClause.push(ilike(tb.articles.title, `%${q.search}%`))
    }

    if (q.category_id) {
      whereClause.push(eq(tb.articles.article_category_id, q.category_id))
    }

    const [countResult] = await this.databaseService.db
      .select({
        count: count(),
      })
      .from(tb.articles)
      .where(and(...whereClause))

    return Number(countResult.count)
  }

  async findPostBySlug(articleSlug: string, type: ArticleType) {
    const posts = await this.databaseService.db.query.articles.findFirst({
      where: and(
        eq(tb.articles.slug, articleSlug),
        eq(tb.articles.type, type),
        eq(tb.articles.is_published, true),
      ),
    })

    return posts
  }

  async findCategoryBySlug(categorySlug: string) {
    const posts = await this.databaseService.db.query.articleCategories.findFirst({
      where: eq(tb.articleCategories.slug, categorySlug),
    })

    return posts
  }
}
