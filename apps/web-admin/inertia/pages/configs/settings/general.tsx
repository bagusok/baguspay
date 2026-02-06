import type { InferPageProps } from '@adonisjs/inertia/types'
import { useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Separator } from '@repo/ui/components/ui/separator'
import { Switch } from '@repo/ui/components/ui/switch'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type SettingsController from '#controllers/configs/settings_controller'
import FileManager from '~/components/file-manager'
import AdminLayout from '~/components/layout/admin-layout'

type Props = InferPageProps<SettingsController, 'index'>

export default function GeneralSettings(props: Props) {
  const [appIconId, setAppIconId] = useState(props.settings.app_icon_file_id || '')
  const [maintenanceBannerId, setMaintenanceBannerId] = useState(
    props.settings.maintenance_banner_file_id || '',
  )
  const { data, setData, patch, processing } = useForm({
    maintenance_enabled: props.settings.maintenance_enabled,
    app_name: props.settings.app_name,
    app_description: props.settings.app_description,
    app_icon_url: props.settings.app_icon_url,
    app_android_url: props.settings.app_android_url,
    app_ios_url: props.settings.app_ios_url,
    maintenance_banner_image_url: props.settings.maintenance_banner_image_url,
    app_version: props.settings.app_version,
    api_version: props.settings.api_version,
    contact_email: props.settings.contact_email,
    contact_whatsapp: props.settings.contact_whatsapp,
    contact_telegram: props.settings.contact_telegram,
    contact_instagram: props.settings.contact_instagram,
    contact_facebook: props.settings.contact_facebook,
    contact_tiktok: props.settings.contact_tiktok,
    contact_support_phone: props.settings.contact_support_phone,
    contact_support_name: props.settings.contact_support_name,
    contact_website: props.settings.contact_website,
    app_ig_name: props.settings.app_ig_name,
    app_ig_url: props.settings.app_ig_url,
    app_fb_name: props.settings.app_fb_name,
    app_fb_url: props.settings.app_fb_url,
    app_tt_name: props.settings.app_tt_name,
    app_tt_url: props.settings.app_tt_url,
    app_tg_name: props.settings.app_tg_name,
    app_tg_url: props.settings.app_tg_url,
    app_tw_name: props.settings.app_tw_name,
    app_tw_url: props.settings.app_tw_url,
    app_yt_name: props.settings.app_yt_name,
    app_yt_url: props.settings.app_yt_url,
    feature_topup: props.settings.feature_topup,
    feature_ppob: props.settings.feature_ppob,
    feature_voucher: props.settings.feature_voucher,
    feature_deposit: props.settings.feature_deposit,
    feature_maintenance_banner: props.settings.feature_maintenance_banner,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch('/admin/config/settings/general', {
      onSuccess: () => {
        toast.success('Settings updated successfully')
      },
      onError: () => {
        toast.error('Failed to update settings')
      },
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mt-5">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-sm text-muted-foreground">Manage global system configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">Maintenance</h2>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">
                When enabled, users will see a maintenance notice.
              </p>
            </div>
            <Switch
              checked={data.maintenance_enabled}
              onCheckedChange={(value) => setData('maintenance_enabled', value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Maintenance Banner Image</Label>
            <FileManager
              defaultFileId={maintenanceBannerId}
              onFilesSelected={(file) => {
                setMaintenanceBannerId(file.id)
                setData('maintenance_banner_image_url', file.url)
              }}
            />
            <p className="text-xs text-muted-foreground">Recommended size: 1920x720.</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">App Information</h2>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>App Name</Label>
              <Input value={data.app_name} onChange={(e) => setData('app_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>App Version</Label>
              <Input
                value={data.app_version}
                onChange={(e) => setData('app_version', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>API Version</Label>
              <Input
                value={data.api_version}
                onChange={(e) => setData('api_version', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={data.contact_website}
                onChange={(e) => setData('contact_website', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>App Description</Label>
            <Textarea
              value={data.app_description}
              onChange={(e) => setData('app_description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>App Icon</Label>
            <FileManager
              defaultFileId={appIconId}
              onFilesSelected={(file) => {
                setAppIconId(file.id)
                setData('app_icon_url', file.url)
              }}
            />
            <p className="text-xs text-muted-foreground">Recommended size: 512x512.</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">App Download Links</h2>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Android Download URL</Label>
              <Input
                value={data.app_android_url}
                onChange={(e) => setData('app_android_url', e.target.value)}
                placeholder="https://play.google.com/store/..."
              />
            </div>
            <div className="space-y-2">
              <Label>iOS Download URL</Label>
              <Input
                value={data.app_ios_url}
                onChange={(e) => setData('app_ios_url', e.target.value)}
                placeholder="https://apps.apple.com/..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">Contact Info</h2>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Support Name</Label>
              <Input
                value={data.contact_support_name}
                onChange={(e) => setData('contact_support_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                value={data.contact_email}
                onChange={(e) => setData('contact_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={data.contact_whatsapp}
                onChange={(e) => setData('contact_whatsapp', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input
                value={data.contact_support_phone}
                onChange={(e) => setData('contact_support_phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">Social Media</h2>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Instagram</p>
              <div className="space-y-2">
                <Label>Handle</Label>
                <Input
                  value={data.app_ig_name}
                  onChange={(e) => setData('app_ig_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={data.app_ig_url}
                  onChange={(e) => setData('app_ig_url', e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Facebook</p>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={data.app_fb_name}
                  onChange={(e) => setData('app_fb_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={data.app_fb_url}
                  onChange={(e) => setData('app_fb_url', e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">TikTok</p>
              <div className="space-y-2">
                <Label>Handle</Label>
                <Input
                  value={data.app_tt_name}
                  onChange={(e) => setData('app_tt_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={data.app_tt_url}
                  onChange={(e) => setData('app_tt_url', e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Telegram</p>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={data.app_tg_name}
                  onChange={(e) => setData('app_tg_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={data.app_tg_url}
                  onChange={(e) => setData('app_tg_url', e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Twitter / X</p>
              <div className="space-y-2">
                <Label>Handle</Label>
                <Input
                  value={data.app_tw_name}
                  onChange={(e) => setData('app_tw_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={data.app_tw_url}
                  onChange={(e) => setData('app_tw_url', e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">YouTube</p>
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input
                  value={data.app_yt_name}
                  onChange={(e) => setData('app_yt_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={data.app_yt_url}
                  onChange={(e) => setData('app_yt_url', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">Feature Flags</h2>
          <Separator />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Switch
                checked={data.feature_topup}
                onCheckedChange={(value) => setData('feature_topup', value)}
              />
              <Label>Topup</Label>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Switch
                checked={data.feature_ppob}
                onCheckedChange={(value) => setData('feature_ppob', value)}
              />
              <Label>PPOB</Label>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Switch
                checked={data.feature_voucher}
                onCheckedChange={(value) => setData('feature_voucher', value)}
              />
              <Label>Voucher</Label>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Switch
                checked={data.feature_deposit}
                onCheckedChange={(value) => setData('feature_deposit', value)}
              />
              <Label>Deposit</Label>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Switch
                checked={data.feature_maintenance_banner}
                onCheckedChange={(value) => setData('feature_maintenance_banner', value)}
              />
              <Label>Maintenance Banner</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={processing}>
            {processing ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
