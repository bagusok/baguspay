import { InputFieldType } from '@repo/db/types'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const createInputFieldValidator = vine.object({
  identifier: vine.string(),
  title: vine.string(),
  name: vine.string().toLowerCase(),
  type: vine.enum(InputFieldType),
  is_required: vine.boolean(),
  placeholder: vine.string().optional(),
  options: vine
    .array(
      vine.object({
        label: vine.string(),
        value: vine.string(),
      })
    )
    .optional()
    .requiredWhen('type', '=', InputFieldType.SELECT),
})

export type CreateInputFieldValidator = Infer<typeof createInputFieldValidator>

export const updateInputFieldValidator = vine.object({
  identifier: vine.string().optional(),
  title: vine.string().optional(),
  name: vine.string().toLowerCase().optional(),
  type: vine.enum(InputFieldType),
  is_required: vine.boolean().optional(),
  placeholder: vine.string().optional(),
  options: vine
    .array(
      vine.object({
        label: vine.string(),
        value: vine.string(),
      })
    )
    .optional()
    .requiredWhen('type', '=', InputFieldType.SELECT),
})

export type UpdateInputFieldValidator = Infer<typeof updateInputFieldValidator>

export const inputIdValidator = vine.object({
  id: vine.string().uuid(),
})

export type InputIdValidator = Infer<typeof inputIdValidator>

export const connectInputFieldValidator = vine.object({
  input_field_id: vine.string().uuid(),
  product_category_id: vine.string().uuid(),
})

export type ConnectInputFieldValidator = Infer<typeof connectInputFieldValidator>
