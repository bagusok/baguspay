import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import type {
  ProductCategoriesQueryDto,
  ProductCategoryGetByTypeParamsDto,
} from './product-categories.dto'
import type { ProductCategoriesService } from './product-categories.service'

// @ApiSecurity('access-token')
// @UseGuards(JwtAuthGuard)
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

  @Get('/')
  getAllCategories(@Query() query: ProductCategoriesQueryDto) {
    return this.productCategoriesService.getAllCategories(query)
  }

  @Get('/slug/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.productCategoriesService.getBySlug(slug)
  }

  @Get('/type/:type')
  getCategoryByType(@Param() params: ProductCategoryGetByTypeParamsDto) {
    return this.productCategoriesService.getByType(params)
  }

  @Get('/:id')
  getCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productCategoriesService.getCategoryById(id)
  }
}
