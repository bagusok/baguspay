import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const createArticleCategoryValidator = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100),
  slug: vine.string().trim().minLength(1).maxLength(255),
  description: vine.string().trim().maxLength(255).optional().nullable(),
})

export const updateArticleCategoryValidator = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100).optional(),
  slug: vine.string().trim().minLength(1).maxLength(255).optional(),
  description: vine.string().trim().maxLength(255).optional().nullable(),
})

export const createArticleValidator = vine.object({
  title: vine.string().trim().minLength(1).maxLength(255),
  slug: vine.string().trim().minLength(1).maxLength(255),
  excerpt: vine.string().trim().optional().nullable(),
  content: vine.string().trim().minLength(1),
  image_url: vine.string().trim().optional().nullable(),
  article_category_id: vine.string().uuid().optional().nullable(),
  is_published: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  order: vine.number().optional(),
  tags: vine.array(vine.string()).optional(),
  meta_title: vine.string().trim().maxLength(255).optional().nullable(),
  meta_description: vine.string().trim().maxLength(500).optional().nullable(),
})

export const updateArticleValidator = vine.object({
  title: vine.string().trim().minLength(1).maxLength(255).optional(),
  slug: vine.string().trim().minLength(1).maxLength(255).optional(),
  excerpt: vine.string().trim().optional().nullable(),
  content: vine.string().trim().minLength(1).optional(),
  image_url: vine.string().trim().optional().nullable(),
  article_category_id: vine.string().uuid().optional().nullable(),
  is_published: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  order: vine.number().optional(),
  tags: vine.array(vine.string()).optional(),
  meta_title: vine.string().trim().maxLength(255).optional().nullable(),
  meta_description: vine.string().trim().maxLength(500).optional().nullable(),
})

export type CreateArticleCategoryValidator = Infer<typeof createArticleCategoryValidator>
export type UpdateArticleCategoryValidator = Infer<typeof updateArticleCategoryValidator>
export type CreateArticleValidator = Infer<typeof createArticleValidator>
export type UpdateArticleValidator = Infer<typeof updateArticleValidator>
