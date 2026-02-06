import { Injectable } from '@nestjs/common'
import { and, asc, eq, ilike } from '@repo/db'
import { type ProductCategoryType, tb } from '@repo/db/types'
import type { DatabaseService } from 'src/database/database.service'
import type { ProductCategoriesQueryDto } from './product-categories.dto'

@Injectable()
export class ProductCategoriesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(query: ProductCategoriesQueryDto, isSpecialFeature = false) {
    return await this.databaseService.db.query.productCategories.findMany({
      where: and(
        ...(query.type ? [eq(tb.productCategories.type, query.type)] : []),
        ...(query.billing_type
          ? [eq(tb.productCategories.product_billing_type, query.billing_type)]
          : []),
        ...(query.search ? [ilike(tb.productCategories.name, `%${query.search}%`)] : []),
        ...(isSpecialFeature ? [eq(tb.productCategories.is_special_feature, true)] : []),
      ),
      orderBy: asc(tb.productCategories.name),
      columns: {
        id: true,
        name: true,
        slug: true,
        type: true,
        product_billing_type: true,
        image_url: true,
        icon_url: true,
        is_available: true,
        is_featured: true,
        label: true,
        publisher: true,
        is_special_feature: true,
        special_feature_key: true,
        sub_name: true,
      },
    })
  }

  async findByType(type: ProductCategoryType) {
    const categories = await this.databaseService.db.query.productCategories.findMany({
      where: eq(tb.productCategories.type, type),
      orderBy: asc(tb.productCategories.name),
      columns: {
        id: true,
        name: true,
        slug: true,
        image_url: true,
        icon_url: true,
        is_available: true,
        is_featured: true,
        label: true,
        publisher: true,
        is_special_feature: true,
        special_feature_key: true,
        sub_name: true,
      },
    })

    return categories
  }
}
