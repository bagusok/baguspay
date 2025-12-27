import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from '@repo/db';
import { BannerLocation, ProductGroupingMenuType, tb } from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
import { DatabaseService } from 'src/database/database.service';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: StorageService,
  ) {}

  public async getBanners() {
    let banners = await this.databaseService.db.query.banners.findMany({
      where: and(
        eq(tb.banners.is_available, true),
        inArray(tb.banners.banner_location, [
          BannerLocation.HOME_TOP,
          BannerLocation.HOME_MIDDLE,
          BannerLocation.HOME_BOTTOM,
        ]),
      ),
    });

    banners = banners.map((banner) => ({
      ...banner,
      image_url: this.storageService.getFileUrl(banner.image_url),
    }));

    return SendResponse.success({
      home_top: banners.filter(
        (banner) => banner.banner_location === BannerLocation.HOME_TOP,
      ),
      home_middle: banners.filter(
        (banner) => banner.banner_location === BannerLocation.HOME_MIDDLE,
      ),
      home_bottom: banners.filter(
        (banner) => banner.banner_location === BannerLocation.HOME_BOTTOM,
      ),
    });
  }

  public async getFastMenus() {
    const fastMenus =
      await this.databaseService.db.query.productGroupings.findMany({
        columns: {
          id: true,
          name: true,
          image_url: true,
          redirect_url: true,
          app_key: true,
          platform: true,
          type: true,
          order: true,
          is_special_feature: true,
          special_feature_key: true,
          is_featured: true,
          label: true,
        },
        where: and(
          eq(tb.productCategories.is_available, true),
          eq(tb.productGroupings.menu_type, ProductGroupingMenuType.FAST_MENU),
          eq(tb.productGroupings.is_available, true),
        ),
        with: {
          productCategories: {
            columns: {},
            with: {
              productCategory: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  image_url: true,
                  icon_url: true,
                  publisher: true,
                  label: true,
                  sub_name: true,
                  is_featured: true,
                  is_available: true,
                },
              },
            },
          },
        },
        orderBy: tb.productGroupings.order,
      });

    const newFastMenus = fastMenus.map((section) => {
      const products = section.productCategories.map(
        (pc) => pc.productCategory,
      );
      delete section.productCategories;
      return {
        ...section,
        image_url: this.storageService.getFileUrl(section.image_url),
        product_categories: products.map((product) => ({
          ...product,
          image_url: this.storageService.getFileUrl(product.image_url),
        })),
      };
    });

    return SendResponse.success(newFastMenus);
  }

  public async getHomeProductSections() {
    const homeProductSections =
      await this.databaseService.db.query.productGroupings.findMany({
        where: and(
          eq(tb.productCategories.is_available, true),
          eq(tb.productGroupings.menu_type, ProductGroupingMenuType.HOME_MENU),
          eq(tb.productGroupings.is_available, true),
        ),
        orderBy: tb.productGroupings.order,
        columns: {
          name: true,
          image_url: true,
          order: true,
          is_featured: true,
          label: true,
        },
        with: {
          productCategories: {
            columns: {},
            with: {
              productCategory: {
                columns: {
                  id: true,
                  name: true,
                  sub_name: true,
                  slug: true,
                  image_url: true,
                  icon_url: true,
                  is_featured: true,
                  is_available: true,
                  label: true,
                  publisher: true,
                  tags1: true,
                  tags2: true,
                },
              },
            },
          },
        },
      });

    const newHomeProductSections = homeProductSections.map((section) => {
      const products = section.productCategories.map(
        (pc) => pc.productCategory,
      );

      delete section.productCategories;

      return {
        ...section,
        image_url: this.storageService.getFileUrl(section.image_url),
        product_categories: products.map((product) => ({
          ...product,
          image_url: this.storageService.getFileUrl(product.image_url),
        })),
      };
    });

    return SendResponse.success(newHomeProductSections);
  }

  public async getProducts() {
    // Get all categories with basic information
    let categories = await this.databaseService.db
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

    categories = categories.map((category) => ({
      ...category,
      image_url: this.storageService.getFileUrl(category.image_url),
    }));

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
