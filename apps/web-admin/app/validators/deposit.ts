import { DepositStatus } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const getDepositQueryValidator = vine.object({
  page: vine.number().optional(),
  limit: vine.number().optional(),
  sortBy: vine.enum(['asc', 'desc']).optional(),
  sortColumn: vine.enum(['created_at', 'updated_at']).optional(),
  userId: vine.string().uuid().optional(),
  depositId: vine.string().optional(),
  status: vine.enum(DepositStatus).optional(),
})

export type GetDepositQueryValidator = Infer<typeof getDepositQueryValidator>

export const depositIdValidator = vine.object({
  id: vine.string(),
})

export type DepositIdValidator = Infer<typeof depositIdValidator>

export const changeStatusValidator = vine.object({
  status: vine.enum(DepositStatus),
  updateBalance: vine.boolean().optional(),
})

export type ChangeStatusValidator = Infer<typeof changeStatusValidator>
