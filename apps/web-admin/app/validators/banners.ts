import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const createBannerValidator = vine.object({
  title: vine.string().trim().minLength(1),
  image_id: vine.string().uuid(),
  description: vine.string().optional(),
  is_available: vine.boolean().optional(),
  product_category_id: vine.string().uuid().optional(),
})

export type CreateBannerValidator = Infer<typeof createBannerValidator>
