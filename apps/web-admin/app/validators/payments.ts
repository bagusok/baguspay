import {
  PaymentMethodAllowAccess,
  PaymentMethodFeeType,
  PaymentMethodProvider,
  PaymentMethodType,
} from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const createPayementMethodCategoryValidator = vine.object({
  name: vine.string().maxLength(100),
})

export type CreatePayementMethodCategoryValidator = Infer<
  typeof createPayementMethodCategoryValidator
>

export const updatePayementMethodCategoryValidator = vine.object({
  name: vine.string().maxLength(100).optional(),
})

export type UpdatePayementMethodCategoryValidator = Infer<
  typeof updatePayementMethodCategoryValidator
>

export const paymentIdValidator = vine.object({
  id: vine.string().uuid(),
})

export const createPaymentMethodsValidator = vine.object({
  name: vine.string().maxLength(100),
  payment_method_category_id: vine.string().uuid(),
  image_id: vine.string().uuid(),
  fee_static: vine.number(),
  fee_percentage: vine.number().min(0).max(100),
  fee_type: vine.enum(PaymentMethodFeeType),
  is_available: vine.boolean(),
  is_need_phone_number: vine.boolean(),
  is_need_email: vine.boolean(),
  is_featured: vine.boolean(),
  label: vine.string().maxLength(20).optional(),
  provider_name: vine.enum(PaymentMethodProvider),
  provider_code: vine.string().maxLength(50),
  min_amount: vine.number().min(0),
  max_amount: vine.number().min(0),
  type: vine.enum(PaymentMethodType),
  allow_access: vine.array(vine.enum(PaymentMethodAllowAccess)),
  expired_in: vine.number().min(0),
  cut_off_start: vine.string().optional(),
  cut_off_end: vine.string().optional(),
  instruction: vine.string(),
})

export type CreatePaymentMethodsValidator = Infer<typeof createPaymentMethodsValidator>

export const updatePaymentMethodsValidator = vine.object({
  name: vine.string().maxLength(100).optional(),
  payment_method_category_id: vine.string().uuid().optional(),
  image_id: vine.string().uuid().optional(),
  fee_static: vine.number().optional(),
  fee_percentage: vine.number().min(0).max(100).optional(),
  fee_type: vine.enum(PaymentMethodFeeType).optional(),
  is_available: vine.boolean().optional(),
  is_need_phone_number: vine.boolean().optional(),
  is_need_email: vine.boolean().optional(),
  is_featured: vine.boolean().optional(),
  label: vine.string().maxLength(20).optional(),
  provider_name: vine.enum(PaymentMethodProvider).optional(),
  provider_code: vine.string().maxLength(50).optional(),
  min_amount: vine.number().min(0).optional(),
  max_amount: vine.number().min(0).optional(),
  type: vine.enum(PaymentMethodType).optional(),
  allow_access: vine.array(vine.enum(PaymentMethodAllowAccess)).optional(),
  expired_in: vine.number().min(0).optional(),
  cut_off_start: vine.string().optional(),
  cut_off_end: vine.string().optional(),
  instruction: vine.string().optional(),
})

export type UpdatePaymentMethodsValidator = Infer<typeof updatePaymentMethodsValidator>

export const paymentMethodsQueryValidator = vine.object({
  page: vine.number().min(1).optional(),
  limit: vine.number().min(1).max(100).optional(),
  searchBy: vine.enum(['id', 'name', 'provider_name', 'provider_code']).optional(),
  searchQuery: vine.string().optional(),
})
