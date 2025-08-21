import { AppPlatform, ProductGroupingMenuType, ProductGroupingType } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const createHomeProductSectionValidator = vine.object({
  name: vine.string().maxLength(255),
  image_id: vine.string().uuid(),
  platform: vine.enum(AppPlatform),
  type: vine.enum(ProductGroupingType),
  menu_type: vine.enum(ProductGroupingMenuType),
  is_available: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().optional(),
  order: vine.number(),
  description: vine.string().optional(),
})

export type CreateHomeProductSectionValidator = Infer<typeof createHomeProductSectionValidator>

export const updateHomeProductSectionValidator = vine.object({
  name: vine.string().maxLength(255).optional(),
  image_id: vine.string().uuid().optional(),
  platform: vine.enum(AppPlatform).optional(),
  type: vine.enum(ProductGroupingType).optional(),
  menu_type: vine.enum(ProductGroupingMenuType).optional(),
  is_available: vine.boolean().optional(),
  is_featured: vine.boolean(),
  label: vine.string().optional().optional(),
  order: vine.number().optional(),
  description: vine.string().optional(),
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
