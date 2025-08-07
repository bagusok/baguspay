import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ProductCategoriesService } from './product-categories.service';

// @ApiSecurity('access-token')
// @UseGuards(JwtAuthGuard)
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  @Get('/')
  getAllCategories() {
    return this.productCategoriesService.getAllCategories();
  }

  @ApiResponse({
    status: 200,
    description: 'Get category by slug',
  })
  @Get('/slug/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.productCategoriesService.getBySlug(slug);
  }

  @Get('/:id')
  getCategoryById(@Param('id', new ParseUUIDPipe()) id) {
    return this.productCategoriesService.getCategoryById(id);
  }
}
