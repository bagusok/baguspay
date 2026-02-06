import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import axios from 'axios'
import { DigiflazzService } from '#services/digiflazz_service'

const digiflazzQueryValidator = vine.object({
  billingType: vine.enum(['prepaid', 'postpaid']).optional(),
  category: vine.string().optional(),
  brand: vine.string().optional(),
  type: vine.string().optional(),
})

export default class ProvidersController {
  async digiflazzProducts(ctx: HttpContext) {
    const query = await ctx.request.validateUsing(vine.compile(digiflazzQueryValidator), {
      data: ctx.request.qs(),
    })

    const cacheKey = `digiflazz:${query.billingType ?? 'prepaid'}`
    const cached = await cache.get<unknown[]>({ key: cacheKey })

    if (cached) {
      return ctx.response.json({ data: cached })
    }

    const digiflazz = new DigiflazzService(axios)
    const response = await digiflazz.getProduct(query.billingType ?? 'prepaid')
    const data = response.data ?? []

    await cache.set({ key: cacheKey, value: data, ttl: '3m' })

    return ctx.response.json({
      data,
    })
  }
}
