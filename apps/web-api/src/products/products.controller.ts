import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.productsService.getBySlug(slug);
  }
}
