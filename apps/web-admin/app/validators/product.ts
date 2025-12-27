import {
  ProductBillingType,
  ProductCategoryType,
  ProductFullfillmentType,
  ProductProvider,
} from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const createProductCategoryValidator = vine.object({
  file_image_id: vine.string().uuid(),
  file_banner_id: vine.string().uuid(),
  file_icon_id: vine.string().uuid().optional(),
  name: vine.string(),
  sub_name: vine.string().optional(),
  description: vine.string(),
  publisher: vine.string(),
  is_available: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().optional(),
  delivery_type: vine.enum(['instant', 'manual']),
  is_seo_enabled: vine.boolean(),
  seo_title: vine.string().optional(),
  seo_description: vine.string().optional(),
  seo_image_id: vine.string().uuid().optional(),

  type: vine.enum(ProductCategoryType),
  product_billing_type: vine.enum(ProductBillingType),
  product_fullfillment_type: vine.enum(ProductFullfillmentType),

  is_special_feature: vine.boolean().optional(),
  special_feature_key: vine.string().optional(),

  tags1: vine.array(vine.string()),
  tags2: vine.array(vine.string()),
})

export type CreateProductCategoryValidator = Infer<typeof createProductCategoryValidator>

export const updateProductCategoryValidator = vine.object({
  file_image_id: vine.string().uuid().optional(),
  file_banner_id: vine.string().uuid().optional(),
  file_icon_id: vine.string().uuid().optional(),
  name: vine.string().optional(),
  sub_name: vine.string().optional(),
  description: vine.string().optional(),
  publisher: vine.string().optional(),
  is_available: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  label: vine.string().optional(),
  delivery_type: vine.enum(['instant', 'manual']).optional(),
  is_seo_enabled: vine.boolean().optional(),
  seo_title: vine.string().optional(),
  seo_description: vine.string().optional(),
  seo_image_id: vine.string().uuid().optional(),

  type: vine.enum(ProductCategoryType).optional(),
  product_billing_type: vine.enum(ProductBillingType).optional(),
  product_fullfillment_type: vine.enum(ProductFullfillmentType).optional(),

  is_special_feature: vine.boolean().optional(),
  special_feature_key: vine.string().optional(),

  tags1: vine.array(vine.string()).optional(),
  tags2: vine.array(vine.string()).optional(),
})
export type UpdateProductCategoryValidator = Infer<typeof updateProductCategoryValidator>

export const productCategoryIdValidator = vine.object({
  id: vine.string().uuid(),
})

export const productCategoriesQueryValidator = vine.object({
  page: vine.number().min(1).optional(),
  limit: vine.number().min(10).optional(),
  searchQuery: vine.string().optional(),
  searchBy: vine.enum(['name', 'id']).optional(),
})

export type ProductCategoriesQueryValidator = Infer<typeof productCategoriesQueryValidator>

export const createProductSubCategoryValidator = vine.object({
  product_category_id: vine.string().uuid(),
  image_id: vine.string().uuid(),
  name: vine.string(),
  sub_name: vine.string().optional(),
  description: vine.string().optional(),
  is_available: vine.boolean(),
  is_featured: vine.boolean().optional(),
  label: vine.string().optional(),
})

export type CreateProductSubCategoryValidator = Infer<typeof createProductSubCategoryValidator>

export const updateProductSubCategoryValidator = vine.object({
  product_category_id: vine.string().uuid().optional(),
  image_id: vine.string().uuid().optional(),
  name: vine.string().optional(),
  sub_name: vine.string().optional(),
  description: vine.string().optional(),
  is_available: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  label: vine.string().optional(),
})

export type UpdateProductSubCategoryValidator = Infer<typeof updateProductSubCategoryValidator>

export const productIdValidator = vine.object({
  id: vine.string().uuid(),
})

export const createProductValidator = vine.object({
  product_sub_category_id: vine.string().uuid(),
  name: vine.string().maxLength(100),
  sub_name: vine.string().maxLength(100).optional(),
  description: vine.string().maxLength(100).optional(),
  is_available: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().maxLength(25).optional(),
  label_image: vine.string().optional(),
  image_id: vine.string().uuid(),
  sku_code: vine.string().maxLength(15),
  profit_static: vine.number().min(0),
  profit_percentage: vine.number().min(0).max(100),
  stock: vine.number().min(0),

  provider_code: vine.string().maxLength(50),
  provider_name: vine.enum(ProductProvider),
  provider_price: vine.number().min(0),
  provider_max_price: vine.number().min(0),
  provider_input_separator: vine.string().maxLength(3).optional(),

  cut_off_start: vine.string().optional(),
  cut_off_end: vine.string().optional(),

  notes: vine.string().optional(),
  billing_type: vine.enum(ProductBillingType),
  fullfillment_type: vine.enum(ProductFullfillmentType),
})

export type CreateProductValidator = Infer<typeof createProductValidator>

export const updateProductValidator = vine.object({
  product_sub_category_id: vine.string().uuid().optional(),
  name: vine.string().maxLength(100),
  sub_name: vine.string().maxLength(100).optional(),
  description: vine.string().maxLength(100).optional(),
  is_available: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().maxLength(25).optional(),
  label_image: vine.string().optional(),
  image_id: vine.string().uuid(),
  sku_code: vine.string().maxLength(15),
  profit_static: vine.number().min(0),
  profit_percentage: vine.number().min(0).max(100),
  stock: vine.number().min(0),

  provider_code: vine.string().maxLength(50),
  provider_name: vine.enum(ProductProvider),
  provider_price: vine.number().min(0),
  provider_max_price: vine.number().min(0),
  provider_input_separator: vine.string().maxLength(3).optional(),

  cut_off_start: vine.string().optional(),
  cut_off_end: vine.string().optional(),

  notes: vine.string().optional(),
  billing_type: vine.enum(ProductBillingType),
  fullfillment_type: vine.enum(ProductFullfillmentType),
})

export type UpdateProductValidator = Infer<typeof updateProductValidator>

export const getAllProductsQueryValidator = vine.object({
  page: vine.number().min(1).optional(),
  limit: vine.number().min(10).optional(),
  searchQuery: vine.string().optional(),
  searchBy: vine.enum(['name', 'id', 'sku_code', 'provider_code']).optional(),
  sortColumn: vine
    .enum(['name', 'provider_price', 'profit_static', 'price', 'created_at', 'stock'])
    .optional(),
  sortOrder: vine.enum(['asc', 'desc']).optional(),
  productSubCategoryId: vine.string().uuid().optional(),
})

export type GetAllProductsQueryValidator = Infer<typeof getAllProductsQueryValidator>

const searchSchema = vine.group([
  vine.group.if((data) => data.searchBy === 'id', {
    searchQuery: vine.string().uuid().optional(),
  }),
  vine.group.else({
    searchQuery: vine.string().maxLength(100).optional(),
  }),
])

export const productCategoryQueryValidator = vine
  .object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
    searchBy: vine.enum(['name', 'id']).optional(),
  })
  .merge(searchSchema)

export type ProductCategoryQueryValidator = Infer<typeof productCategoryQueryValidator>
