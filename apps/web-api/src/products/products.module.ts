import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { ProductRepository } from './product.repository'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  exports: [ProductRepository],
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository],
})
export class ProductsModule {}
