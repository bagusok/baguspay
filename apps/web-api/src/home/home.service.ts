import { Injectable } from '@nestjs/common';
import { eq } from '@repo/db';
import { tb } from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class HomeService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async getProducts() {
    // Get all categories with basic information
    const categories = await this.databaseService.db
      .select({
        id: tb.productCategories.id,
        name: tb.productCategories.name,
        slug: tb.productCategories.slug,
        image_url: tb.productCategories.image_url,
        is_featured: tb.productCategories.is_featured,
        is_available: tb.productCategories.is_available,
        type: tb.productCategories.type,
        description: tb.productCategories.description,
        publisher: tb.productCategories.publisher,
        label: tb.productCategories.label,
      })
      .from(tb.productCategories)
      .where(eq(tb.productCategories.is_available, true))
      .orderBy(tb.productCategories.name);

    // Group categories by type
    const groupedByType = categories.reduce(
      (acc: Record<string, { type: string; items: any[] }>, category) => {
        const { type, ...categoryData } = category;

        if (!acc[type]) {
          acc[type] = {
            type,
            items: [],
          };
        }

        acc[type].items.push(categoryData);
        return acc;
      },
      {},
    );

    // Define the order for category types
    const typeOrder = [
      'game',
      'voucher',
      'entertainment',
      'pulsa',
      'kuota',
      'ecommerce',
      'finance',
      'billing',
      'topup',
      'send_money',
      'other',
    ];

    // Convert to array format with specified order
    const result = typeOrder
      .map((type) => groupedByType[type])
      .filter((item): item is { type: string; items: any[] } => Boolean(item)); // Remove undefined entries for types that don't exist

    return SendResponse.success(result);
  }
}
