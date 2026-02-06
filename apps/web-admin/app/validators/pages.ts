import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const createPageValidator = vine.object({
  title: vine.string().trim().minLength(1).maxLength(255),
  slug: vine.string().trim().minLength(1).maxLength(255),
  content: vine.string().trim().minLength(1),
  is_published: vine.boolean().optional(),
  order: vine.number().optional(),
})

export const updatePageValidator = vine.object({
  title: vine.string().trim().minLength(1).maxLength(255).optional(),
  slug: vine.string().trim().minLength(1).maxLength(255).optional(),
  content: vine.string().trim().minLength(1).optional(),
  is_published: vine.boolean().optional(),
  order: vine.number().optional(),
})

export type CreatePageValidator = Infer<typeof createPageValidator>
export type UpdatePageValidator = Infer<typeof updatePageValidator>
