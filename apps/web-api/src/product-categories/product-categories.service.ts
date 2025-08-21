/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, gte, lte, ne, or } from '@repo/db';
import { OfferType, tb } from '@repo/db/types';
import { SendResponse } from 'src/common/utils/response';
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

  // async getBySlug(slug: string): Promise<{ success: boolean; data: any }> {
  //   const category =
  //     await this.databaseService.db.query.productCategories.findFirst({
  //       where: eq(tb.productCategories.slug, slug),
  //       columns: {
  //         id: true,
  //         name: true,
  //         slug: true,
  //         delivery_type: true,
  //         description: true,
  //         image_url: true,
  //         is_featured: true,
  //         is_available: true,
  //         label: true,
  //         banner_url: true,
  //         publisher: true,
  //         is_seo_enabled: true,
  //         seo_title: true,
  //         seo_description: true,
  //         seo_image: true,
  //         sub_name: true,
  //       },
  //       with: {
  //         input_on_product_category: {
  //           with: {
  //             input_field: {
  //               columns: {
  //                 name: true,
  //                 type: true,
  //                 options: true,
  //                 placeholder: true,
  //                 is_required: true,
  //                 title: true,
  //               },
  //             },
  //           },
  //         },
  //         product_sub_categories: {
  //           columns: {
  //             name: true,
  //             sub_name: true,
  //             image_url: true,
  //             is_featured: true,
  //             is_available: true,
  //             label: true,
  //           },
  //           with: {
  //             products: {
  //               columns: {
  //                 id: true,
  //                 name: true,
  //                 image_url: true,
  //                 price: true,
  //                 is_available: true,
  //                 is_featured: true,
  //                 notes: true,
  //                 stock: true,
  //                 billing_type: true,
  //                 cut_off_start: true,
  //                 cut_off_end: true,
  //                 description: true,
  //                 label_text: true,
  //                 sku_code: true,
  //                 sub_name: true,
  //                 label_image: true,
  //               },
  //               orderBy: asc(tb.products.price),
  //             },
  //           },
  //         },
  //       },
  //     });

  //   if (!category) {
  //     throw new NotFoundException(`Category with slug ${slug} not found`);
  //   }

  //   const inputFields = category.input_on_product_category.map(
  //     (input) => input.input_field,
  //   );

  //   delete category.input_on_product_category;

  //   // Get Discount Available

  //   // Discount khusus kategori
  //   const categoryDiscounts = await this.databaseService.db
  //     .select({
  //       product: {
  //         id: tb.products.id,
  //         name: tb.products.name,
  //         image_url: tb.products.image_url,
  //         price: tb.products.price,
  //         is_available: tb.products.is_available,
  //         is_featured: tb.products.is_featured,
  //         notes: tb.products.notes,
  //         stock: tb.products.stock,
  //         billing_type: tb.products.billing_type,
  //         cut_off_start: tb.products.cut_off_start,
  //         cut_off_end: tb.products.cut_off_end,
  //         description: tb.products.description,
  //         label_text: tb.products.label_text,
  //         sku_code: tb.products.sku_code,
  //         sub_name: tb.products.sub_name,
  //         label_image: tb.products.label_image,
  //       },
  //       offer: {
  //         id: tb.offers.id,
  //         name: tb.offers.name,
  //         discount_static: tb.offers.discount_static,
  //         discount_percentage: tb.offers.discount_percentage,
  //         discount_maximum: tb.offers.discount_maximum,
  //         start_date: tb.offers.start_date,
  //         end_date: tb.offers.end_date,
  //         is_available: tb.offers.is_available,
  //         is_all_payment_method: tb.offers.is_all_payment_methods,
  //         is_all_products: tb.offers.is_all_products,
  //         is_all_users: tb.offers.is_all_users,
  //         quota: tb.offers.quota,
  //         usage_count: tb.offers.usage_count,
  //         is_allow_guest: tb.offers.is_allow_guest,
  //         is_unlimited_date: tb.offers.is_unlimited_date,
  //         is_unlimited_quota: tb.offers.is_unlimited_quota,
  //         type: tb.offers.type,
  //       },
  //     })
  //     .from(tb.offer_products)
  //     .innerJoin(tb.products, eq(tb.offer_products.product_id, tb.products.id))
  //     .innerJoin(
  //       tb.productSubCategories,
  //       eq(tb.products.product_sub_category_id, tb.productSubCategories.id),
  //     )
  //     .innerJoin(
  //       tb.productCategories,
  //       eq(
  //         tb.productSubCategories.product_category_id,
  //         tb.productCategories.id,
  //       ),
  //     )
  //     .innerJoin(tb.offers, eq(tb.offer_products.offer_id, tb.offers.id))
  //     .where(
  //       and(
  //         eq(tb.productCategories.id, category.id),
  //         eq(tb.offers.is_available, true),
  //         or(
  //           and(
  //             lte(tb.offers.start_date, new Date()),
  //             gte(tb.offers.end_date, new Date()),
  //           ),
  //           eq(tb.offers.is_unlimited_date, true),
  //         ),
  //         or(eq(tb.offers.is_unlimited_quota, true), gte(tb.offers.quota, 1)),
  //         eq(tb.offers.is_deleted, false),
  //         ne(tb.offers.type, OfferType.VOUCHER),
  //         eq(tb.offers.is_all_products, false),
  //       ),
  //     );

  //   // Discount global (is_all_products)
  //   const globalOffers = await this.databaseService.db
  //     .select({
  //       offer: {
  //         id: tb.offers.id,
  //         name: tb.offers.name,
  //         discount_static: tb.offers.discount_static,
  //         discount_percentage: tb.offers.discount_percentage,
  //         discount_maximum: tb.offers.discount_maximum,
  //         start_date: tb.offers.start_date,
  //         end_date: tb.offers.end_date,
  //         is_available: tb.offers.is_available,
  //         is_all_payment_method: tb.offers.is_all_payment_methods,
  //         is_all_products: tb.offers.is_all_products,
  //         is_all_users: tb.offers.is_all_users,
  //         quota: tb.offers.quota,
  //         usage_count: tb.offers.usage_count,
  //         is_allow_guest: tb.offers.is_allow_guest,
  //         is_unlimited_date: tb.offers.is_unlimited_date,
  //         is_unlimited_quota: tb.offers.is_unlimited_quota,
  //         type: tb.offers.type,
  //       },
  //     })
  //     .from(tb.offers)
  //     .where(
  //       and(
  //         eq(tb.offers.is_available, true),
  //         eq(tb.offers.is_all_products, true),
  //         or(
  //           and(
  //             lte(tb.offers.start_date, new Date()),
  //             gte(tb.offers.end_date, new Date()),
  //           ),
  //           eq(tb.offers.is_unlimited_date, true),
  //         ),
  //         or(eq(tb.offers.is_unlimited_quota, true), gte(tb.offers.quota, 1)),
  //         eq(tb.offers.is_deleted, false),
  //         ne(tb.offers.type, OfferType.VOUCHER),
  //       ),
  //     );

  //   // Mapping global offer ke semua produk di kategori (cukup satu kali)
  //   const globalDiscounts = this.mapGlobalDiscounts(category, globalOffers);

  //   // Gabungkan keduanya
  //   const discounts = [...categoryDiscounts, ...globalDiscounts];

  //   const buildDiscounts = category.product_sub_categories.map(
  //     (subCategory) => {
  //       const products = subCategory.products.map((product) => {
  //         // Filter discounts yang berlaku untuk produk ini
  //         const productDiscounts = discounts.filter((d) => {
  //           // Hanya offer tipe DISCOUNT
  //           if (d.offer.type !== OfferType.DISCOUNT) return false;
  //           // Jika offer is_all_products, berlaku untuk semua produk
  //           if (d.offer.is_all_products) return true;
  //           // Jika tidak, cocokkan id produk
  //           return d.product.id === product.id;
  //         });

  //         // Ambil diskon tertinggi
  //         let maxDiscount = null;
  //         let discountPrice = null;
  //         if (productDiscounts.length > 0) {
  //           maxDiscount = productDiscounts.reduce((prev, curr) => {
  //             // Hitung nilai diskon: static + percentage
  //             let prevDiscount =
  //               (prev.offer.discount_percentage
  //                 ? (product.price * prev.offer.discount_percentage) / 100
  //                 : 0) + (prev.offer.discount_static || 0);
  //             let currDiscount =
  //               (curr.offer.discount_percentage
  //                 ? (product.price * curr.offer.discount_percentage) / 100
  //                 : 0) + (curr.offer.discount_static || 0);
  //             // Batasi dengan discount_maximum jika ada
  //             if (prev.offer.discount_maximum)
  //               prevDiscount = Math.min(
  //                 prevDiscount,
  //                 prev.offer.discount_maximum,
  //               );
  //             if (curr.offer.discount_maximum)
  //               currDiscount = Math.min(
  //                 currDiscount,
  //                 curr.offer.discount_maximum,
  //               );
  //             return currDiscount > prevDiscount ? curr : prev;
  //           }, productDiscounts[0]);

  //           // Hitung harga diskon
  //           let discountValue = 0;
  //           if (maxDiscount) {
  //             discountValue =
  //               (maxDiscount.offer.discount_percentage
  //                 ? (product.price * maxDiscount.offer.discount_percentage) /
  //                   100
  //                 : 0) + (maxDiscount.offer.discount_static || 0);
  //             if (maxDiscount.offer.discount_maximum) {
  //               discountValue = Math.min(
  //                 discountValue,
  //                 maxDiscount.offer.discount_maximum,
  //               );
  //             }
  //           }
  //           discountPrice = Math.max(product.price - discountValue, 0);
  //         }

  //         // Produk Flash Sale

  //         return {
  //           ...product,
  //           discount: discountPrice
  //             ? Math.round(product.price - (discountPrice || 0))
  //             : 0,
  //           total_price: Math.round(discountPrice || product.price),
  //           offer: maxDiscount ? maxDiscount.offer : null,
  //         };
  //       });

  //       return {
  //         ...subCategory,
  //         products: products,
  //       };
  //     },
  //   );

  //   delete category.product_sub_categories;

  //   const offerFlashSale = categoryDiscounts.filter(
  //     (d) => d.offer.type === OfferType.FLASH_SALE,
  //   );
  //   const buildProductFlashSale = offerFlashSale.map((offer) => {
  //     let totalDiscount =
  //       offer.product.price * (offer.offer.discount_percentage / 100) -
  //       offer.offer.discount_static;

  //     if (offer.offer.discount_maximum < totalDiscount) {
  //       totalDiscount = offer.offer.discount_maximum;
  //     }

  //     return {
  //       ...offer.product,
  //       discount: Math.round(totalDiscount),
  //       total_price: Math.round(offer.product.price - (totalDiscount || 0)),
  //       offer: offer.offer,
  //     };
  //   });

  //   return SendResponse.success(
  //     {
  //       ...category,
  //       input_fields: inputFields,
  //       product_sub_categories: buildDiscounts,
  //       flash_sales: buildProductFlashSale,
  //     },
  //     'Category retrieved successfully',
  //   );
  // }

  async getBySlug(slug: string): Promise<{ success: boolean; data: any }> {
    const category =
      await this.databaseService.db.query.productCategories.findFirst({
        where: eq(tb.productCategories.slug, slug),
        columns: {
          id: true,
          name: true,
          slug: true,
          delivery_type: true,
          description: true,
          image_url: true,
          is_featured: true,
          is_available: true,
          label: true,
          banner_url: true,
          publisher: true,
          is_seo_enabled: true,
          seo_title: true,
          seo_description: true,
          seo_image: true,
          sub_name: true,
        },
        with: {
          input_on_product_category: {
            with: {
              input_field: {
                columns: {
                  name: true,
                  type: true,
                  options: true,
                  placeholder: true,
                  is_required: true,
                  title: true,
                },
              },
            },
          },
          product_sub_categories: {
            columns: {
              name: true,
              sub_name: true,
              image_url: true,
              is_featured: true,
              is_available: true,
              label: true,
            },
            with: {
              products: {
                columns: {
                  id: true,
                  name: true,
                  image_url: true,
                  price: true,
                  is_available: true,
                  is_featured: true,
                  notes: true,
                  stock: true,
                  billing_type: true,
                  cut_off_start: true,
                  cut_off_end: true,
                  description: true,
                  label_text: true,
                  sku_code: true,
                  sub_name: true,
                  label_image: true,
                },
                orderBy: asc(tb.products.price), // ✅ sudah ASC
              },
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

    // Jalankan discount query paralel
    const [categoryDiscounts, globalOffers] = await Promise.all([
      this.databaseService.db
        .select({
          product: {
            id: tb.products.id,
            name: tb.products.name,
            image_url: tb.products.image_url,
            price: tb.products.price,
            is_available: tb.products.is_available,
            is_featured: tb.products.is_featured,
            notes: tb.products.notes,
            stock: tb.products.stock,
            billing_type: tb.products.billing_type,
            cut_off_start: tb.products.cut_off_start,
            cut_off_end: tb.products.cut_off_end,
            description: tb.products.description,
            label_text: tb.products.label_text,
            sku_code: tb.products.sku_code,
            sub_name: tb.products.sub_name,
            label_image: tb.products.label_image,
          },
          offer: {
            id: tb.offers.id,
            name: tb.offers.name,
            discount_static: tb.offers.discount_static,
            discount_percentage: tb.offers.discount_percentage,
            discount_maximum: tb.offers.discount_maximum,
            start_date: tb.offers.start_date,
            end_date: tb.offers.end_date,
            is_available: tb.offers.is_available,
            is_all_payment_method: tb.offers.is_all_payment_methods,
            is_all_products: tb.offers.is_all_products,
            is_all_users: tb.offers.is_all_users,
            quota: tb.offers.quota,
            usage_count: tb.offers.usage_count,
            is_allow_guest: tb.offers.is_allow_guest,
            is_unlimited_date: tb.offers.is_unlimited_date,
            is_unlimited_quota: tb.offers.is_unlimited_quota,
            type: tb.offers.type,
          },
        })
        .from(tb.offer_products)
        .innerJoin(
          tb.products,
          eq(tb.offer_products.product_id, tb.products.id),
        )
        .innerJoin(
          tb.productSubCategories,
          eq(tb.products.product_sub_category_id, tb.productSubCategories.id),
        )
        .innerJoin(
          tb.productCategories,
          eq(
            tb.productSubCategories.product_category_id,
            tb.productCategories.id,
          ),
        )
        .innerJoin(tb.offers, eq(tb.offer_products.offer_id, tb.offers.id))
        .where(
          and(
            eq(tb.productCategories.id, category.id),
            eq(tb.offers.is_available, true),
            or(
              and(
                lte(tb.offers.start_date, new Date()),
                gte(tb.offers.end_date, new Date()),
              ),
              eq(tb.offers.is_unlimited_date, true),
            ),
            or(eq(tb.offers.is_unlimited_quota, true), gte(tb.offers.quota, 1)),
            eq(tb.offers.is_deleted, false),
            ne(tb.offers.type, OfferType.VOUCHER),
            eq(tb.offers.is_all_products, false),
          ),
        ),

      this.databaseService.db
        .select({
          offer: {
            id: tb.offers.id,
            name: tb.offers.name,
            discount_static: tb.offers.discount_static,
            discount_percentage: tb.offers.discount_percentage,
            discount_maximum: tb.offers.discount_maximum,
            start_date: tb.offers.start_date,
            end_date: tb.offers.end_date,
            is_available: tb.offers.is_available,
            is_all_payment_method: tb.offers.is_all_payment_methods,
            is_all_products: tb.offers.is_all_products,
            is_all_users: tb.offers.is_all_users,
            quota: tb.offers.quota,
            usage_count: tb.offers.usage_count,
            is_allow_guest: tb.offers.is_allow_guest,
            is_unlimited_date: tb.offers.is_unlimited_date,
            is_unlimited_quota: tb.offers.is_unlimited_quota,
            type: tb.offers.type,
          },
        })
        .from(tb.offers)
        .where(
          and(
            eq(tb.offers.is_available, true),
            eq(tb.offers.is_all_products, true),
            or(
              and(
                lte(tb.offers.start_date, new Date()),
                gte(tb.offers.end_date, new Date()),
              ),
              eq(tb.offers.is_unlimited_date, true),
            ),
            or(eq(tb.offers.is_unlimited_quota, true), gte(tb.offers.quota, 1)),
            eq(tb.offers.is_deleted, false),
            ne(tb.offers.type, OfferType.VOUCHER),
          ),
        ),
    ]);

    const globalDiscounts = this.mapGlobalDiscounts(category, globalOffers);

    const discounts = [...categoryDiscounts, ...globalDiscounts];

    const buildDiscounts = category.product_sub_categories.map(
      (subCategory) => {
        const products = subCategory.products.map((product) => {
          // Filter discounts yang berlaku untuk produk ini
          const productDiscounts = discounts.filter((d) => {
            // Hanya offer tipe DISCOUNT
            if (d.offer.type !== OfferType.DISCOUNT) return false;
            // Jika offer is_all_products, berlaku untuk semua produk
            if (d.offer.is_all_products) return true;
            // Jika tidak, cocokkan id produk
            return d.product.id === product.id;
          });

          // Ambil diskon tertinggi
          let maxDiscount = null;
          let discountPrice = null;
          if (productDiscounts.length > 0) {
            maxDiscount = productDiscounts.reduce((prev, curr) => {
              // Hitung nilai diskon: static + percentage
              let prevDiscount =
                (prev.offer.discount_percentage
                  ? (product.price * prev.offer.discount_percentage) / 100
                  : 0) + (prev.offer.discount_static || 0);
              let currDiscount =
                (curr.offer.discount_percentage
                  ? (product.price * curr.offer.discount_percentage) / 100
                  : 0) + (curr.offer.discount_static || 0);
              // Batasi dengan discount_maximum jika ada
              if (prev.offer.discount_maximum)
                prevDiscount = Math.min(
                  prevDiscount,
                  prev.offer.discount_maximum,
                );
              if (curr.offer.discount_maximum)
                currDiscount = Math.min(
                  currDiscount,
                  curr.offer.discount_maximum,
                );
              return currDiscount > prevDiscount ? curr : prev;
            }, productDiscounts[0]);

            // Hitung harga diskon
            let discountValue = 0;
            if (maxDiscount) {
              discountValue =
                (maxDiscount.offer.discount_percentage
                  ? (product.price * maxDiscount.offer.discount_percentage) /
                    100
                  : 0) + (maxDiscount.offer.discount_static || 0);
              if (maxDiscount.offer.discount_maximum) {
                discountValue = Math.min(
                  discountValue,
                  maxDiscount.offer.discount_maximum,
                );
              }
            }
            discountPrice = Math.max(product.price - discountValue, 0);
          }

          // Produk Flash Sale

          return {
            ...product,
            discount: discountPrice
              ? Math.round(product.price - (discountPrice || 0))
              : 0,
            total_price: Math.round(discountPrice || product.price),
            offer: maxDiscount ? maxDiscount.offer : null,
          };
        });

        return {
          ...subCategory,
          products: products,
        };
      },
    );

    delete category.product_sub_categories;

    const offerFlashSale = categoryDiscounts.filter(
      (d) => d.offer.type === OfferType.FLASH_SALE,
    );
    const buildProductFlashSale = offerFlashSale.map((offer) => {
      let totalDiscount =
        offer.product.price * (offer.offer.discount_percentage / 100) -
        offer.offer.discount_static;

      if (offer.offer.discount_maximum < totalDiscount) {
        totalDiscount = offer.offer.discount_maximum;
      }

      return {
        ...offer.product,
        discount: Math.round(totalDiscount),
        total_price: Math.round(offer.product.price - (totalDiscount || 0)),
        offer: offer.offer,
      };
    });

    return SendResponse.success(
      {
        ...category,
        input_fields: inputFields,
        product_sub_categories: buildDiscounts,
        flash_sales: buildProductFlashSale,
      },
      'Category retrieved successfully',
    );
  }

  private mapGlobalDiscounts(category: any, globalOffers: any[]) {
    const result: Array<{
      product: any;
      category: any;
      sub_category: any;
      offer: any;
    }> = [];
    category.product_sub_categories.forEach((subCategory: any) => {
      subCategory.products.forEach((product: any) => {
        globalOffers.forEach((gOffer: any) => {
          result.push({
            product: { id: product.id, name: product.name },
            category: { id: category.id, name: category.name },
            sub_category: { id: subCategory.id, name: subCategory.name },
            offer: gOffer.offer,
          });
        });
      });
    });
    return result;
  }
}
