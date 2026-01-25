import { Module } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { ProductCategoriesController } from './product-categories.controller'
import { ProductCategoriesRepository } from './product-categories.repository'
import { ProductCategoriesService } from './product-categories.service'

@Module({
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService, DatabaseService, ProductCategoriesRepository],
})
export class ProductCategoriesModule {}
