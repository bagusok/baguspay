import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetAllProductsDto } from './products.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getAll(@Query() query: GetAllProductsDto) {
    return this.productsService.getProducts(query);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.productsService.getBySlug(slug);
  }
}
