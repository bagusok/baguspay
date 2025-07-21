import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService, DatabaseService],
})
export class ProductCategoriesModule {}
