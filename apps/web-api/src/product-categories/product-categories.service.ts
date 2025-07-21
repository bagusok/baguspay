import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from '@repo/db';
import { tb } from '@repo/db/types';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductCategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllCategories() {
    const categories =
      await this.databaseService.db.query.productCategories.findMany();

    return {
      success: true,
      data: categories,
    };
  }

  async getCategoryById(id: string): Promise<{ success: boolean; data: any }> {
    const category =
      await this.databaseService.db.query.productCategories.findFirst({
        where: eq(tb.productCategories.id, id),
        with: {
          input_on_product_category: {
            with: {
              input_field: true,
            },
          },
          product_sub_categories: {
            with: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const inputFields = category.input_on_product_category.map(
      (input) => input.input_field,
    );

    delete category.input_on_product_category;

    return {
      success: true,
      data: {
        ...category,
        input_fields: inputFields,
      },
    };
  }

  async getBySlug(slug: string): Promise<{ success: boolean; data: any }> {
    const category =
      await this.databaseService.db.query.productCategories.findFirst({
        where: eq(tb.productCategories.slug, slug),
        with: {
          input_on_product_category: {
            with: {
              input_field: true,
            },
          },
          product_sub_categories: {
            with: {
              products: true,
            },
          },
        },
      });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    const inputFields = category.input_on_product_category.map(
      (input) => input.input_field,
    );

    delete category.input_on_product_category;

    return {
      success: true,
      data: {
        ...category,
        input_fields: inputFields,
      },
    };
  }
}
