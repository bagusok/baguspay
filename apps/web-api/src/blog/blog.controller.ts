import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { GetBlogPostsDto } from './blog.dto'
import type { BlogService } from './blog.service'

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: 'Get all blog posts' })
  @Get('posts')
  async getAllPosts(@Query() query: GetBlogPostsDto) {
    return this.blogService.getAllPosts(query)
  }

  @ApiOperation({ summary: 'Get blog posts in a category' })
  @Get('posts/:categorySlug')
  async getPostsInCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() query: GetBlogPostsDto,
  ) {
    return this.blogService.getPostsInCategory(categorySlug, query)
  }

  @ApiOperation({ summary: 'Get blog post detail' })
  @Get('posts/:categorySlug/:articleSlug')
  async getPostDetail(
    @Param('categorySlug') categorySlug: string,
    @Param('articleSlug') articleSlug: string,
  ) {
    return this.blogService.getPostDetail(categorySlug, articleSlug)
  }

  @ApiOperation({
    summary: 'Get page detail',
    description:
      'Pages are different from blog posts. Use this endpoint to get page details like About Us, Contact, etc.',
  })
  @Get('page/:articleSlug')
  async getPageDetail(@Param('articleSlug') articleSlug: string) {
    return this.blogService.getPageDetail(articleSlug)
  }
}
