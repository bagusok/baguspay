import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('/banners')
  async getBanners() {
    return this.homeService.getBanners();
  }

  @Get('/fast-menus')
  async getFastMenus() {
    return this.homeService.getFastMenus();
  }

  @Get('/product-sections')
  async getHomeProductSections() {
    return this.homeService.getHomeProductSections();
  }

  @Get('/products')
  async getProducts() {
    return this.homeService.getProducts();
  }
}
