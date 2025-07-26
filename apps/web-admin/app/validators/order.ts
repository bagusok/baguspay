import { OrderStatus, PaymentStatus, RefundStatus } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const getOrderQueryValidator = vine.object({
  page: vine.number().optional(),
  limit: vine.number().optional(),
  sortBy: vine.enum(['asc', 'desc']).optional(),
  sortColumn: vine.enum(['created_at', 'updated_at']).optional(),
  userId: vine.string().uuid().optional().nullable(),
  orderId: vine.string().optional(),
  orderStatus: vine.enum(OrderStatus).optional(),
  paymentStatus: vine.enum(PaymentStatus).optional(),
  refundStatus: vine.enum(RefundStatus).optional(),
})

export type GetOrderQueryValidator = Infer<typeof getOrderQueryValidator>

export const orderIdValidator = vine.object({
  id: vine.string(),
})

export type OrderIdValidator = Infer<typeof orderIdValidator>

export const updateOrderStatusValidator = vine.object({
  status: vine.enum(OrderStatus),
})

export type UpdateOrderStatusValidator = Infer<typeof updateOrderStatusValidator>

export const updateOrderPaymentStatusValidator = vine.object({
  status: vine.enum(PaymentStatus),
})

export type UpdateOrderPaymentStatusValidator = Infer<typeof updateOrderPaymentStatusValidator>

export const updateOrderRefundStatusValidator = vine.object({
  status: vine.enum(RefundStatus),
})

export type UpdateOrderRefundStatusValidator = Infer<typeof updateOrderRefundStatusValidator>
