import ConfigHomesController from '#controllers/configs/config_homes_controller'
import { UpdateHomeProductSectionValidator } from '#validators/config_home'
import { InferPageProps } from '@adonisjs/inertia/types'
import { useForm } from '@inertiajs/react'
import { AppPlatform, ProductGroupingMenuType, ProductGroupingType } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { Switch } from '@repo/ui/components/ui/switch'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { PencilIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import FileManager from '~/components/file-manager'

type Props = {
  productSection?: InferPageProps<ConfigHomesController, 'index'>['productSections'][number]
}

export default function EditProductSectionModal({ productSection }: Props) {
  const [open, setOpen] = useState(false)
  const { data, setData, errors, processing, patch } = useForm<UpdateHomeProductSectionValidator>({
    name: productSection?.name || '',
    description: productSection?.description || '',
    // @ts-ignore
    image_id: productSection?.image_id || '',
    redirect_url: productSection?.redirect_url || '',
    app_key: productSection?.app_key || '',
    platform: productSection?.platform || AppPlatform.WEB,
    type: productSection?.type || ProductGroupingType.MODAL,
    menu_type: productSection?.menu_type || ProductGroupingMenuType.HOME_MENU,
    is_available: productSection?.is_available || false,
    is_featured: productSection?.is_featured || false,
    label: productSection?.label || '',
    order: productSection?.order || 0,
    is_special_feature: productSection?.is_special_feature || false,
    special_feature_key: productSection?.special_feature_key || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(`/admin/config/home/fast-menu/${productSection?.id}`, {
      onSuccess: () => {
        setOpen(false)
        toast.success('Product section updated successfully')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Product Section</DialogTitle>
          <DialogDescription>Edit section produk untuk Home.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Image */}
          <div>
            <Label htmlFor="image_id" className="mb-2">
              Image
            </Label>
            <div className="mt-1">
              <FileManager
                defaultFileId={data.image_id || undefined}
                onFilesSelected={(file) => setData('image_id', file.id)}
              />
            </div>
            {errors.image_id && <p className="text-xs text-red-500 mt-1">{errors.image_id}</p>}
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Redirect URL */}
          <div>
            <Label htmlFor="redirect_url" className="mb-2">
              Redirect URL
            </Label>
            <Input
              id="redirect_url"
              value={data.redirect_url}
              onChange={(e) => setData('redirect_url', e.target.value)}
              placeholder="Optional redirect URL"
            />
            {errors.redirect_url && (
              <p className="text-xs text-red-500 mt-1">{errors.redirect_url}</p>
            )}
          </div>

          {/* App Key */}
          <div>
            <Label htmlFor="app_key" className="mb-2">
              App Key
            </Label>
            <Input
              id="app_key"
              value={data.app_key}
              onChange={(e) => setData('app_key', e.target.value)}
              placeholder="Optional app key"
            />
            {errors.app_key && <p className="text-xs text-red-500 mt-1">{errors.app_key}</p>}
          </div>

          {/* Enums */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="platform" className="mb-2">
                Platform
              </Label>
              <Select
                value={data.platform}
                onValueChange={(v) => setData('platform', v as AppPlatform)}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AppPlatform).map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform && <p className="text-xs text-red-500 mt-1">{errors.platform}</p>}
            </div>

            <div>
              <Label htmlFor="type" className="mb-2">
                Type
              </Label>
              <Select
                value={data.type}
                onValueChange={(v) => setData('type', v as ProductGroupingType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductGroupingType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>

            <div>
              <Label htmlFor="menu_type" className="mb-2">
                Menu Type
              </Label>
              <Select
                value={data.menu_type}
                onValueChange={(v) => setData('menu_type', v as ProductGroupingMenuType)}
              >
                <SelectTrigger id="menu_type">
                  <SelectValue placeholder="Select menu type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductGroupingMenuType).map((menuType) => (
                    <SelectItem key={menuType} value={menuType}>
                      {menuType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.menu_type && <p className="text-xs text-red-500 mt-1">{errors.menu_type}</p>}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_available"
                checked={data.is_available}
                onCheckedChange={(v) => setData('is_available', v)}
              />
              <Label htmlFor="is_available">Available</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={data.is_featured}
                onCheckedChange={(v) => setData('is_featured', v)}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_special_feature"
                checked={data.is_special_feature}
                onCheckedChange={(v) => setData('is_special_feature', v)}
              />
              <Label htmlFor="is_special_feature">Special Feature</Label>
            </div>
          </div>
          {errors.is_available && (
            <p className="text-xs text-red-500 mt-1">{errors.is_available}</p>
          )}
          {errors.is_featured && <p className="text-xs text-red-500 mt-1">{errors.is_featured}</p>}
          {errors.is_special_feature && (
            <p className="text-xs text-red-500 mt-1">{errors.is_special_feature}</p>
          )}

          {/* Label, Order, and Special Feature Key */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="label" className="mb-2">
                Label
              </Label>
              <Input
                id="label"
                value={data.label || ''}
                onChange={(e) => setData('label', e.target.value)}
                placeholder="Optional label"
              />
              {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
            </div>

            <div>
              <Label htmlFor="order" className="mb-2">
                Order
              </Label>
              <Input
                id="order"
                type="number"
                value={data.order}
                onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
              />
              {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order}</p>}
            </div>

            <div>
              <Label htmlFor="special_feature_key" className="mb-2">
                Special Feature Key
              </Label>
              <Input
                id="special_feature_key"
                value={data.special_feature_key || ''}
                onChange={(e) => setData('special_feature_key', e.target.value)}
                placeholder="Optional special feature key"
              />
              {errors.special_feature_key && (
                <p className="text-xs text-red-500 mt-1">{errors.special_feature_key}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <DialogClose type="button" className="mr-2">
              Cancel
            </DialogClose>
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
