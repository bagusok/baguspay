import { updateSettingsValidator } from '#validators/config_settings'
import type { HttpContext } from '@adonisjs/core/http'
import { db, eq, inArray } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

const SETTINGS_KEYS = {
  maintenance_enabled: 'maintenance.enabled',
  app_name: 'app.name',
  app_description: 'app.description',
  app_icon_url: 'app.icon_url',
  maintenance_banner_image_url: 'MAINTENANCE_BANNER_IMAGE_URL',
  app_version: 'app.version',
  api_version: 'api.version',
  contact_email: 'contact.email',
  contact_whatsapp: 'contact.whatsapp',
  contact_telegram: 'contact.telegram',
  contact_instagram: 'contact.instagram',
  contact_facebook: 'contact.facebook',
  contact_tiktok: 'contact.tiktok',
  contact_support_phone: 'contact.support_phone',
  contact_support_name: 'contact.support_name',
  contact_website: 'contact.website',
  app_ig_name: 'APP_IG_NAME',
  app_ig_url: 'APP_IG_URL',
  app_fb_name: 'APP_FB_NAME',
  app_fb_url: 'APP_FB_URL',
  app_tt_name: 'APP_TT_NAME',
  app_tt_url: 'APP_TT_URL',
  app_tg_name: 'APP_TG_NAME',
  app_tg_url: 'APP_TG_URL',
  app_tw_name: 'APP_TW_NAME',
  app_tw_url: 'APP_TW_URL',
  app_yt_name: 'APP_YT_NAME',
  app_yt_url: 'APP_YT_URL',
  feature_topup: 'feature.topup',
  feature_ppob: 'feature.ppob',
  feature_voucher: 'feature.voucher',
  feature_deposit: 'feature.deposit',
  feature_maintenance_banner: 'feature.maintenance_banner',
} as const

export default class SettingsController {
  public async index({ inertia }: HttpContext) {
    const keys = Object.values(SETTINGS_KEYS)
    const existing = await db.query.appConfig.findMany({
      where: inArray(tb.appConfig.key, keys),
    })

    const map = new Map(existing.map((item) => [item.key, item.value]))

    const appIconUrl = map.get(SETTINGS_KEYS.app_icon_url) || ''
    const maintenanceBannerUrl = map.get(SETTINGS_KEYS.maintenance_banner_image_url) || ''
    const [appIconFile, maintenanceBannerFile] = await Promise.all([
      appIconUrl
        ? db.query.fileManager.findFirst({ where: eq(tb.fileManager.url, appIconUrl) })
        : null,
      maintenanceBannerUrl
        ? db.query.fileManager.findFirst({ where: eq(tb.fileManager.url, maintenanceBannerUrl) })
        : null,
    ])

    return inertia.render('configs/settings/general', {
      settings: {
        maintenance_enabled: map.get(SETTINGS_KEYS.maintenance_enabled) === 'true',
        app_name: map.get(SETTINGS_KEYS.app_name) || '',
        app_description: map.get(SETTINGS_KEYS.app_description) || '',
        app_icon_url: appIconUrl,
        app_icon_file_id: appIconFile?.id || '',
        maintenance_banner_image_url: maintenanceBannerUrl,
        maintenance_banner_file_id: maintenanceBannerFile?.id || '',
        app_version: map.get(SETTINGS_KEYS.app_version) || '',
        api_version: map.get(SETTINGS_KEYS.api_version) || '',
        contact_email: map.get(SETTINGS_KEYS.contact_email) || '',
        contact_whatsapp: map.get(SETTINGS_KEYS.contact_whatsapp) || '',
        contact_telegram: map.get(SETTINGS_KEYS.contact_telegram) || '',
        contact_instagram: map.get(SETTINGS_KEYS.contact_instagram) || '',
        contact_facebook: map.get(SETTINGS_KEYS.contact_facebook) || '',
        contact_tiktok: map.get(SETTINGS_KEYS.contact_tiktok) || '',
        contact_support_phone: map.get(SETTINGS_KEYS.contact_support_phone) || '',
        contact_support_name: map.get(SETTINGS_KEYS.contact_support_name) || '',
        contact_website: map.get(SETTINGS_KEYS.contact_website) || '',
        app_ig_name: map.get(SETTINGS_KEYS.app_ig_name) || '',
        app_ig_url: map.get(SETTINGS_KEYS.app_ig_url) || '',
        app_fb_name: map.get(SETTINGS_KEYS.app_fb_name) || '',
        app_fb_url: map.get(SETTINGS_KEYS.app_fb_url) || '',
        app_tt_name: map.get(SETTINGS_KEYS.app_tt_name) || '',
        app_tt_url: map.get(SETTINGS_KEYS.app_tt_url) || '',
        app_tg_name: map.get(SETTINGS_KEYS.app_tg_name) || '',
        app_tg_url: map.get(SETTINGS_KEYS.app_tg_url) || '',
        app_tw_name: map.get(SETTINGS_KEYS.app_tw_name) || '',
        app_tw_url: map.get(SETTINGS_KEYS.app_tw_url) || '',
        app_yt_name: map.get(SETTINGS_KEYS.app_yt_name) || '',
        app_yt_url: map.get(SETTINGS_KEYS.app_yt_url) || '',
        feature_topup: map.get(SETTINGS_KEYS.feature_topup) === 'true',
        feature_ppob: map.get(SETTINGS_KEYS.feature_ppob) === 'true',
        feature_voucher: map.get(SETTINGS_KEYS.feature_voucher) === 'true',
        feature_deposit: map.get(SETTINGS_KEYS.feature_deposit) === 'true',
        feature_maintenance_banner: map.get(SETTINGS_KEYS.feature_maintenance_banner) === 'true',
      },
    })
  }

  public async update(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(vine.compile(updateSettingsValidator), {
      data: ctx.request.body(),
    })

    const entries: Array<{ key: string; value: string }> = [
      { key: SETTINGS_KEYS.maintenance_enabled, value: String(!!data.maintenance_enabled) },
      { key: SETTINGS_KEYS.app_name, value: data.app_name ?? '' },
      { key: SETTINGS_KEYS.app_description, value: data.app_description ?? '' },
      { key: SETTINGS_KEYS.app_icon_url, value: data.app_icon_url ?? '' },
      {
        key: SETTINGS_KEYS.maintenance_banner_image_url,
        value: data.maintenance_banner_image_url ?? '',
      },
      { key: SETTINGS_KEYS.app_version, value: data.app_version ?? '' },
      { key: SETTINGS_KEYS.api_version, value: data.api_version ?? '' },
      { key: SETTINGS_KEYS.contact_email, value: data.contact_email ?? '' },
      { key: SETTINGS_KEYS.contact_whatsapp, value: data.contact_whatsapp ?? '' },
      { key: SETTINGS_KEYS.contact_telegram, value: data.contact_telegram ?? '' },
      { key: SETTINGS_KEYS.contact_instagram, value: data.contact_instagram ?? '' },
      { key: SETTINGS_KEYS.contact_facebook, value: data.contact_facebook ?? '' },
      { key: SETTINGS_KEYS.contact_tiktok, value: data.contact_tiktok ?? '' },
      { key: SETTINGS_KEYS.contact_support_phone, value: data.contact_support_phone ?? '' },
      { key: SETTINGS_KEYS.contact_support_name, value: data.contact_support_name ?? '' },
      { key: SETTINGS_KEYS.contact_website, value: data.contact_website ?? '' },
      { key: SETTINGS_KEYS.app_ig_name, value: data.app_ig_name ?? '' },
      { key: SETTINGS_KEYS.app_ig_url, value: data.app_ig_url ?? '' },
      { key: SETTINGS_KEYS.app_fb_name, value: data.app_fb_name ?? '' },
      { key: SETTINGS_KEYS.app_fb_url, value: data.app_fb_url ?? '' },
      { key: SETTINGS_KEYS.app_tt_name, value: data.app_tt_name ?? '' },
      { key: SETTINGS_KEYS.app_tt_url, value: data.app_tt_url ?? '' },
      { key: SETTINGS_KEYS.app_tg_name, value: data.app_tg_name ?? '' },
      { key: SETTINGS_KEYS.app_tg_url, value: data.app_tg_url ?? '' },
      { key: SETTINGS_KEYS.app_tw_name, value: data.app_tw_name ?? '' },
      { key: SETTINGS_KEYS.app_tw_url, value: data.app_tw_url ?? '' },
      { key: SETTINGS_KEYS.app_yt_name, value: data.app_yt_name ?? '' },
      { key: SETTINGS_KEYS.app_yt_url, value: data.app_yt_url ?? '' },
      { key: SETTINGS_KEYS.feature_topup, value: String(!!data.feature_topup) },
      { key: SETTINGS_KEYS.feature_ppob, value: String(!!data.feature_ppob) },
      { key: SETTINGS_KEYS.feature_voucher, value: String(!!data.feature_voucher) },
      { key: SETTINGS_KEYS.feature_deposit, value: String(!!data.feature_deposit) },
      {
        key: SETTINGS_KEYS.feature_maintenance_banner,
        value: String(!!data.feature_maintenance_banner),
      },
    ]

    await db.transaction(async (tx) => {
      for (const entry of entries) {
        const existing = await tx.query.appConfig.findFirst({
          where: eq(tb.appConfig.key, entry.key),
        })

        if (existing) {
          await tx
            .update(tb.appConfig)
            .set({ value: entry.value })
            .where(eq(tb.appConfig.key, entry.key))
        } else {
          await tx.insert(tb.appConfig).values({ key: entry.key, value: entry.value })
        }
      }
    })

    ctx.session.flash('success', 'Settings updated successfully')
    return ctx.response.redirect().back()
  }
}
