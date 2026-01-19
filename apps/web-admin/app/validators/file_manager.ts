import vine from '@vinejs/vine'

export const uploadFileValidator = vine.object({
  file: vine.file({
    size: '5mb',
    extnames: ['jpg', 'jpeg', 'heic', 'heif', 'png', 'webp', 'avif'],
  }),
})

export const deleteFileValidator = vine.object({
  id: vine.string().uuid(),
})

export const listFileQueryValidator = vine.object({
  page: vine.number().min(1).positive().optional(),
  limit: vine.number().min(1).positive().optional(),
})
