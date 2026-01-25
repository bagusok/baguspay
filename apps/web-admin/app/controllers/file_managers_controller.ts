// import type { HttpContext } from '@adonisjs/core/http'

import env from '#start/env'
import {
  deleteFileValidator,
  deleteFilesValidator,
  listFileQueryValidator,
  uploadFileValidator,
  uploadFilesValidator,
} from '#validators/file_manager'
import { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import { count, db, desc, eq } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import sharp from 'sharp'

export default class FileManagersController {
  public async upload(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(vine.compile(uploadFileValidator))

      const disk = drive.use('s3')

      if (data.file.type === 'image') {
        const fileBuffer = await fs.readFile(data.file.tmpPath!)

        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

        const exist = await disk.exists(`storage/images/${fileHash}.webp`)

        if (exist) {
          return ctx.response.status(400).json({
            error: 'File already exists',
          })
        }

        const convertedImage = await sharp(data.file.tmpPath).toFormat('webp').toBuffer()

        await disk.put(`storage/images/${fileHash}.webp`, convertedImage, {
          visibility: 'public',
        })

        const fileSize = await disk.getBytes(`storage/images/${fileHash}.webp`)
        // save to db
        const save = await db
          .insert(tb.fileManager)
          .values({
            name: `${fileHash}.webp`,
            url: `/storage/images/${fileHash}.webp`,
            size: fileSize.byteLength,
            mime_type: 'image/webp',
          })
          .returning()

        console.log('File saved to database:', save)

        return ctx.response.json({
          message: 'File uploaded successfully',
          file: {
            id: save[0].id,
            name: `${fileHash}.webp`,
            url:
              env.get('S3_ENDPOINT') +
              env.get('S3_BUCKET_NAME') +
              `/storage/images/${fileHash}.webp`,
          },
        })
      } else {
        return ctx.response.status(400).json({
          error: 'Unsupported file type. Only images are allowed.',
        })
      }
    } catch (error) {
      console.error('File upload error:', error)
      return ctx.response.status(500).json({
        error: 'An error occurred while uploading the file. Please try again later.',
      })
    }
  }

  public async uploadMany(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(vine.compile(uploadFilesValidator))

      const disk = drive.use('s3')
      const uploaded: { id: string; name: string; url: string }[] = []
      const errors: { name: string; error: string }[] = []

      for (const file of data.files) {
        if (file.type !== 'image' || !file.tmpPath) {
          errors.push({ name: file.clientName, error: 'Unsupported file type' })
          continue
        }

        const fileBuffer = await fs.readFile(file.tmpPath)
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex')
        const filePath = `storage/images/${fileHash}.webp`
        const exist = await disk.exists(filePath)

        if (exist) {
          errors.push({ name: file.clientName, error: 'File already exists' })
          continue
        }

        const convertedImage = await sharp(file.tmpPath).toFormat('webp').toBuffer()

        await disk.put(filePath, convertedImage, {
          visibility: 'public',
        })

        const fileSize = await disk.getBytes(filePath)
        const save = await db
          .insert(tb.fileManager)
          .values({
            name: `${fileHash}.webp`,
            url: `/storage/images/${fileHash}.webp`,
            size: fileSize.byteLength,
            mime_type: 'image/webp',
          })
          .returning()

        uploaded.push({
          id: save[0].id,
          name: `${fileHash}.webp`,
          url:
            env.get('S3_ENDPOINT') + env.get('S3_BUCKET_NAME') + `/storage/images/${fileHash}.webp`,
        })
      }

      return ctx.response.json({
        message: 'Files uploaded',
        files: uploaded,
        errors,
      })
    } catch (error) {
      console.error('File upload error:', error)
      return ctx.response.status(500).json({
        error: 'An error occurred while uploading the files. Please try again later.',
      })
    }
  }

  public async destroy(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(vine.compile(deleteFileValidator), {
        data: ctx.request.params(),
      })

      const disk = drive.use('s3')

      const file = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, data.id),
      })

      if (!file) {
        return ctx.response.status(404).json({
          error: 'File not found',
        })
      }

      const check = await disk.exists(file.url)

      if (!check) {
        await db.delete(tb.fileManager).where(eq(tb.fileManager.id, data.id))
        return ctx.response.status(404).json({
          error: 'File not found on disk',
        })
      }

      await disk.delete(file.url)
      await db.delete(tb.fileManager).where(eq(tb.fileManager.id, data.id))

      return ctx.response.json({
        message: 'File deleted successfully',
      })
    } catch (error) {
      console.error('File deletion error:', error)
      return ctx.response.status(500).json({
        error: 'An error occurred while deleting the file. Please try again later.',
      })
    }
  }

  public async destroyBulk(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(vine.compile(deleteFilesValidator))
      const disk = drive.use('s3')
      const deleted: string[] = []
      const errors: { id: string; error: string }[] = []

      for (const id of data.ids) {
        const file = await db.query.fileManager.findFirst({
          where: eq(tb.fileManager.id, id),
        })

        if (!file) {
          errors.push({ id, error: 'File not found' })
          continue
        }

        const check = await disk.exists(file.url)

        if (!check) {
          await db.delete(tb.fileManager).where(eq(tb.fileManager.id, id))
          deleted.push(id)
          continue
        }

        await disk.delete(file.url)
        await db.delete(tb.fileManager).where(eq(tb.fileManager.id, id))
        deleted.push(id)
      }

      return ctx.response.json({
        message: 'Files deleted',
        deleted,
        errors,
      })
    } catch (error) {
      console.error('File deletion error:', error)
      return ctx.response.status(500).json({
        error: 'An error occurred while deleting the files. Please try again later.',
      })
    }
  }

  public async list(ctx: HttpContext) {
    try {
      const { page = 1, limit = 20 } = await ctx.request.validateUsing(
        vine.compile(listFileQueryValidator)
      )

      const files = await db.query.fileManager.findMany({
        orderBy: [desc(tb.fileManager.created_at)],
        offset: (page - 1) * limit,
        limit,
      })

      const [fCount] = await db
        .select({
          count: count(tb.fileManager.id),
        })
        .from(tb.fileManager)

      return ctx.response.json({
        data: files,
        pagination: {
          page,
          limit,
          total: Number(fCount.count),
          totalPages: Math.ceil(Number(fCount.count) / limit),
        },
      })
    } catch (error) {
      console.error('File list error:', error)
      return ctx.response.status(500).json({
        error: 'An error occurred while fetching the file list. Please try again later.',
      })
    }
  }

  public async getById(ctx: HttpContext) {
    try {
      const { id } = await ctx.request.validateUsing(vine.compile(deleteFileValidator), {
        data: ctx.request.params(),
      })

      const file = await db.query.fileManager.findFirst({
        where: eq(tb.fileManager.id, id),
      })

      if (!file) {
        return ctx.response.status(404).json({
          error: 'File not found',
        })
      }

      return ctx.response.json({
        data: file,
      })
    } catch (error) {
      console.error('Get file by ID error:', error)
      return ctx.response.status(500).json({
        error: 'An error occurred while fetching the file. Please try again later.',
      })
    }
  }
}
