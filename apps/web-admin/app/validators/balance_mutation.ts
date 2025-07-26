import { BalanceMutationRefType, BalanceMutationType } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const getBalanceMutationQueryValidator = vine.object({
  page: vine.number().optional(),
  limit: vine.number().optional(),
  sortBy: vine.enum(['asc', 'desc']).optional(),
  sortColumn: vine.enum(['created_at', 'updated_at']).optional(),
  userId: vine.string().uuid().optional(),
  type: vine.enum(BalanceMutationType).optional(),
  refType: vine.enum(BalanceMutationRefType).optional(),
  startDate: vine.date().optional(),
  endDate: vine.date().optional(),
})

export type GetBalanceMutationQueryValidator = Infer<typeof getBalanceMutationQueryValidator>
