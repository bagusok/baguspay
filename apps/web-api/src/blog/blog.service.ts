import { Injectable, NotFoundException } from '@nestjs/common'
import { ArticleType } from '@repo/db/types'
import { SendResponse } from 'src/common/utils/response'
import type { StorageService } from 'src/storage/storage.service'
import type { GetBlogPostsDto } from './blog.dto'
import type { BlogRepository } from './blog.repository'

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly storageService: StorageService,
  ) {}

  async getAllPosts(q: GetBlogPostsDto) {
    const posts = await this.blogRepository.findAll(q, ArticleType.ARTICLE)
    const count = await this.blogRepository.countAllPosts(q, ArticleType.ARTICLE)

    return SendResponse.success(
      posts.map((post) => ({
        ...post,
        image_url: this.storageService.getFileUrl(post.image_url),
      })),
      'Success',
      {
        meta: {
          total: count,
          total_pages: Math.ceil(count / q.limit),
          page: q.page,
          limit: q.limit,
        },
      },
    )
  }

  async getPostDetail(categorySlug: string, articleSlug: string) {
    const category = await this.blogRepository.findCategoryBySlug(categorySlug)
    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const post = await this.blogRepository.findPostBySlug(articleSlug, ArticleType.ARTICLE)
    if (!post) {
      throw new NotFoundException('Post not found')
    }

    return SendResponse.success({
      ...post,
      image_url: this.storageService.getFileUrl(post.image_url),
    })
  }

  async getPostsInCategory(categorySlug: string, q: GetBlogPostsDto) {
    const category = await this.blogRepository.findCategoryBySlug(categorySlug)
    if (!category) {
      throw new NotFoundException('Category not found')
    }

    const modifiedQuery = { ...q, category_id: category.id }
    const posts = await this.blogRepository.findAll(modifiedQuery, ArticleType.ARTICLE)
    const count = await this.blogRepository.countAllPosts(modifiedQuery, ArticleType.ARTICLE)

    return SendResponse.success(
      posts.map((post) => ({
        ...post,
        image_url: this.storageService.getFileUrl(post.image_url),
      })),
      'Success',
      {
        meta: {
          total: count,
          total_pages: Math.ceil(count / q.limit),
          page: q.page,
          limit: q.limit,
        },
      },
    )
  }

  async getPageDetail(articleSlug: string) {
    const post = await this.blogRepository.findPostBySlug(articleSlug, ArticleType.PAGE)
    if (!post) {
      throw new NotFoundException('Page not found')
    }

    return SendResponse.success({
      ...post,
      image_url: this.storageService.getFileUrl(post.image_url),
    })
  }
}
