import { AppPlatform, ProductGroupingMenuType, ProductGroupingType } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const createHomeProductSectionValidator = vine.object({
  name: vine.string().maxLength(255),
  description: vine.string().optional(),
  image_id: vine.string().uuid(),
  redirect_url: vine.string().maxLength(255).optional(),
  app_key: vine.string().maxLength(100).optional(),
  platform: vine.enum(AppPlatform),
  type: vine.enum(ProductGroupingType),
  menu_type: vine.enum(ProductGroupingMenuType),
  is_available: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().maxLength(255).optional(),
  order: vine.number(),
  is_special_feature: vine.boolean(),
  special_feature_key: vine.string().maxLength(255).optional(),
})

export type CreateHomeProductSectionValidator = Infer<typeof createHomeProductSectionValidator>

export const updateHomeProductSectionValidator = vine.object({
  name: vine.string().maxLength(255).optional(),
  description: vine.string().optional(),
  image_id: vine.string().uuid().optional(),
  redirect_url: vine.string().maxLength(255).optional(),
  app_key: vine.string().maxLength(100).optional(),
  platform: vine.enum(AppPlatform).optional(),
  type: vine.enum(ProductGroupingType).optional(),
  menu_type: vine.enum(ProductGroupingMenuType).optional(),
  is_available: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  label: vine.string().maxLength(255).optional(),
  order: vine.number().optional(),
  is_special_feature: vine.boolean().optional(),
  special_feature_key: vine.string().maxLength(255).optional(),
})

export type UpdateHomeProductSectionValidator = Infer<typeof updateHomeProductSectionValidator>

export const configHomeIdValidator = vine.object({
  id: vine.string().uuid(),
})

export type ConfigHomeIdValidator = Infer<typeof configHomeIdValidator>

export const connectProductToSectionValidator = vine.object({
  product_category_id: vine.string().uuid(),
})

export type ConnectProductToSectionValidator = Infer<typeof connectProductToSectionValidator>
