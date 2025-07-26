import { UserRegisteredType, UserRole } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

// Custom rule untuk phone number harus diawali 62 dan hanya angka
export const phoneNumberRule = vine.createRule((value: unknown, _, field) => {
  if (typeof value !== 'string') {
    return field.report('Phone number must be a string or number', 'phone', field)
  }

  const phoneStr = value.toString()
  if (!/^\d+$/.test(phoneStr)) {
    return field.report(`Phone number must contain only digits`, 'phone', field)
  }
  if (!phoneStr.startsWith('62')) {
    return field.report(`Phone number must start with 62`, 'phone', field)
  }

  if (phoneStr.length < 10 || phoneStr.length > 15) {
    return field.report(`Phone number must be between 10 and 15 digits`, 'phone', field)
  }

  return true
})

export const passwordRule = vine.createRule((value: unknown, _, field) => {
  if (typeof value !== 'string') {
    return field.report('Password harus berupa string', 'password', field)
  }
  if (value.length < 8) {
    return field.report('Password minimal 8 karakter', 'password', field)
  }
  if (!/[A-Z]/.test(value)) {
    return field.report('Password harus mengandung minimal 1 huruf besar', 'password', field)
  }
  if (!/[a-z]/.test(value)) {
    return field.report('Password harus mengandung minimal 1 huruf kecil', 'password', field)
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return field.report('Password harus mengandung minimal 1 simbol', 'password', field)
  }
  return true
})

const searchSchema = vine.group([
  vine.group.if((data) => data.searchBy === 'id', {
    searchQuery: vine.string().uuid().optional(),
  }),
  vine.group.else({
    searchQuery: vine.string().maxLength(100).optional(),
  }),
])

export const userQueryValidator = vine
  .object({
    page: vine.number().min(1).optional(),
    limit: vine.number().min(10).optional(),
    searchBy: vine.enum(['name', 'email', 'id']).optional(),
  })
  .merge(searchSchema)

export type UserQueryValidator = Infer<typeof userQueryValidator>

export const createUserValidator = vine.object({
  name: vine.string().minLength(3).maxLength(50),
  email: vine
    .string()
    .email({
      require_tld: true,
    })
    .normalizeEmail({
      all_lowercase: true,
      gmail_lowercase: true,
      gmail_remove_dots: true,
    }),
  password: vine.string().use(passwordRule()),
  phone: vine.string().use(phoneNumberRule()),
  role: vine.enum(UserRole),
  is_banned: vine.boolean(),
  is_email_verified: vine.boolean(),
  registered_type: vine.enum(UserRegisteredType).optional(),
})

export type CreateUserValidator = Infer<typeof createUserValidator>

export const deleteUserParamsValidator = vine.object({
  id: vine.string().uuid(),
})

export type DeleteUserParamsValidator = Infer<typeof deleteUserParamsValidator>

export const updateUserValidator = vine.object({
  name: vine.string().minLength(3).maxLength(50).optional(),
  email: vine
    .string()
    .email({
      require_tld: true,
    })
    .normalizeEmail({
      all_lowercase: true,
      gmail_lowercase: true,
      gmail_remove_dots: true,
    })
    .optional(),
  password: vine.string().use(passwordRule()).optional(),
  phone: vine.string().use(phoneNumberRule()).optional(),
  role: vine.enum(UserRole).optional(),
  is_banned: vine.boolean().optional(),
  is_email_verified: vine.boolean().optional(),
  registered_type: vine.enum(UserRegisteredType).optional(),
})

export type UpdateUserValidator = Infer<typeof updateUserValidator>

export const addBalanceValidator = vine.object({
  amount: vine.number().min(1),
  message: vine.string().maxLength(255),
})

export type AddBalanceValidator = Infer<typeof addBalanceValidator>

export const deductBalanceValidator = vine.object({
  amount: vine.number().min(1),
  message: vine.string().maxLength(255),
})

export type DeductBalanceValidator = Infer<typeof deductBalanceValidator>
