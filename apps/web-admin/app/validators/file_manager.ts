import vine from '@vinejs/vine'

export const uploadFileValidator = vine.object({
  file: vine.file({
    size: '5mb',
    extnames: ['jpg', 'png', 'webp', 'avif'],
  }),
})

export const deleteFileValidator = vine.object({
  id: vine.string().uuid(),
})

export const listFileQueryValidator = vine.object({
  page: vine.number().min(1).positive().optional(),
  limit: vine.number().min(1).positive().optional(),
})
