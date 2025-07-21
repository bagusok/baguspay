import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const insertOfferValidator = vine.object({
  name: vine.string().maxLength(100),
  sub_name: vine.string().maxLength(100).optional(),
  image_id: vine.string().uuid(),
  description: vine.string(),
  code: vine.string().maxLength(50),
  quota: vine.number(),
  discount_static: vine.number(),
  discount_percentage: vine.number().max(100).min(0),
  discount_maximum: vine.number(),
  start_date: vine.date({
    formats: ['YYYY-MM-DDTHH:mm:ss.SSS[Z]'],
  }),
  end_date: vine.date({
    formats: ['YYYY-MM-DDTHH:mm:ss.SSS[Z]'],
  }),
  is_available: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().maxLength(20).optional(),
  is_all_users: vine.boolean(),
  is_all_payment_methods: vine.boolean(),
  is_all_products: vine.boolean(),
  is_deleted: vine.boolean(),

  is_need_redeem: vine.boolean(),
  is_new_user: vine.boolean(),
})

export type InsertOfferValidator = Infer<typeof insertOfferValidator>

export const updateOfferValidator = vine.object({
  name: vine.string().maxLength(100).optional(),
  sub_name: vine.string().maxLength(100).optional(),
  image_id: vine.string().uuid().optional(),
  description: vine.string().optional(),
  code: vine.string().maxLength(50).optional(),
  quota: vine.number().optional(),
  discount_static: vine.number().optional(),
  discount_percentage: vine.number().max(100).min(0).optional(),
  discount_maximum: vine.number().optional(),
  start_date: vine
    .date({
      formats: ['YYYY-MM-DDTHH:mm:ss.SSS[Z]'],
    })
    .optional(),
  end_date: vine
    .date({
      formats: ['YYYY-MM-DDTHH:mm:ss.SSS[Z]'],
    })
    .optional(),
  is_available: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  label: vine.string().maxLength(20).optional(),
  is_all_users: vine.boolean().optional(),
  is_all_payment_methods: vine.boolean().optional(),
  is_all_products: vine.boolean().optional(),

  is_deleted: vine.boolean().optional(),
  is_new_user: vine.boolean().optional(),
  is_need_redeem: vine.boolean().optional(),
})

export type UpdateOfferValidator = Infer<typeof updateOfferValidator>

export const offerIdValidator = vine.object({
  id: vine.string().uuid(),
})

export type OfferIdValidator = Infer<typeof offerIdValidator>

export const addOfferUserValidator = vine.object({
  users: vine.array(
    vine.object({
      user_id: vine.string().uuid(),
    })
  ),
})

export type AddOfferUserValidator = Infer<typeof addOfferUserValidator>

export const addOfferProductValidator = vine.object({
  products: vine.array(
    vine.object({
      product_id: vine.string().uuid(),
    })
  ),
})

export type AddOfferProductValidator = Infer<typeof addOfferProductValidator>

export const addOfferPaymentMethodValidator = vine.object({
  payments: vine.array(
    vine.object({
      payment_method_id: vine.string().uuid(),
    })
  ),
})

export type AddOfferPaymentMethodValidator = Infer<typeof addOfferPaymentMethodValidator>

const searchSchema = vine.group([
  vine.group.if((data) => data.searchBy === 'id', {
    searchQuery: vine.string().uuid().optional(),
  }),
  vine.group.else({
    searchQuery: vine.string().maxLength(100).optional(),
  }),
])

export const offerQueryValidator = vine
  .object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
    searchBy: vine.enum(['code', 'id', 'name']).optional(),
  })
  .merge(searchSchema)

export type OferQueryValidator = Infer<typeof offerQueryValidator>

export const offerUserQueryValidator = vine
  .object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
    searchBy: vine.enum(['name', 'id', 'email']).optional(),
  })
  .merge(searchSchema)

export type OferUserQueryValidator = Infer<typeof offerUserQueryValidator>

export const offerProductQueryValidator = vine
  .object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
    searchBy: vine.enum(['name', 'id']).optional(),
  })
  .merge(searchSchema)
export type OferProductQueryValidator = Infer<typeof offerProductQueryValidator>

export const offerPaymentMethodQueryValidator = vine
  .object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
    searchBy: vine.enum(['name', 'id']).optional(),
  })
  .merge(searchSchema)
export type OferPaymentMethodQueryValidator = Infer<typeof offerPaymentMethodQueryValidator>

export const deleteOfferUserValidator = vine.object({
  user_ids: vine.array(vine.string().uuid()),
})

export type DeleteOfferUserValidator = Infer<typeof deleteOfferUserValidator>

export const deleteOfferProductValidator = vine.object({
  product_ids: vine.array(vine.string().uuid()),
})

export type DeleteOfferProductValidator = Infer<typeof deleteOfferProductValidator>

export const deleteOfferPaymentMethodValidator = vine.object({
  payment_method_ids: vine.array(vine.string().uuid()),
})

export type DeleteOfferPaymentMethodValidator = Infer<typeof deleteOfferPaymentMethodValidator>

export const offerUserIdValidator = vine.object({
  user_id: vine.string().uuid(),
})
