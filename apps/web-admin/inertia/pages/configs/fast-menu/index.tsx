import ConfigHomesController from '#controllers/configs/config_homes_controller'
import { CreateHomeProductSectionValidator } from '#validators/config_home'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link, router, useForm } from '@inertiajs/react'
import { AppPlatform, ProductGroupingMenuType, ProductGroupingType } from '@repo/db/types'
import { DataTable } from '@repo/ui/components/data-table'
import { Badge } from '@repo/ui/components/ui/badge'
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
import { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import FileManager from '~/components/file-manager'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate } from '~/utils'
import EditProductSectionModal from './edit-modal'

type Props = InferPageProps<ConfigHomesController, 'index'>

const columns: ColumnDef<Props['productSections'][number]>[] = [
  {
    accessorKey: 'image_url',
    header: 'Image',
    cell: ({ row }) => (
      <div className="w-12 h-12 rounded border overflow-hidden flex items-center justify-center bg-muted">
        {row.original.image_url ? (
          <img
            className="object-contain w-full h-full"
            src={`${import.meta.env.VITE_S3_URL}${row.original.image_url}`}
            alt={row.original.name}
          />
        ) : (
          <span className="text-xs text-muted-foreground">No Image</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'platform',
    header: 'Platform',
    cell: ({ row }) => <Badge variant="secondary">{row.original.platform}</Badge>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <Badge>{row.original.type}</Badge>,
  },
  {
    accessorKey: 'menu_type',
    header: 'Menu Type',
    cell: ({ row }) => <Badge variant="outline">{row.original.menu_type}</Badge>,
  },
  {
    accessorKey: 'is_available',
    header: 'Available',
    cell: ({ row }) => (
      <Badge
        className={String(row.original.is_available) === 'true' ? 'bg-green-600' : 'bg-red-600'}
      >
        {String(row.original.is_available) === 'true' ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'is_featured',
    header: 'Featured',
    cell: ({ row }) => (
      <Badge
        className={String(row.original.is_featured) === 'true' ? 'bg-blue-600' : 'bg-gray-500'}
      >
        {String(row.original.is_featured) === 'true' ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/admin/config/home/fast-menu/${row.original.id}`}>
            <EyeIcon />
          </Link>
        </Button>
        <EditProductSectionModal productSection={row.original} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <TrashIcon />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete product section?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently remove the section.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  const id = row.original.id
                  router.delete(`/admin/config/home/fast-menu/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => router.get('/admin/config/home/product-sections'),
                  })
                }}
              >
                Yes, delete
              </Button>
              <Button variant="outline">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    ),
  },
]

export default function ProductSectionsIndex({ productSections }: Props) {
  const [open, setOpen] = useState(false)

  const { data, setData, post, processing, errors, reset } =
    useForm<CreateHomeProductSectionValidator>({
      name: '',
      description: '',
      image_id: '',
      redirect_url: '',
      app_key: '',
      platform: AppPlatform.WEB,
      type: ProductGroupingType.MODAL,
      menu_type: ProductGroupingMenuType.HOME_MENU,
      is_available: false,
      is_featured: false,
      label: '',
      order: 0,
      is_special_feature: false,
      special_feature_key: '',
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/config/home/product-sections', {
      preserveScroll: true,
      onSuccess: () => {
        setOpen(false)
        reset()
      },
    })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Home Sections</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Home Section</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create Home Section</DialogTitle>
              <DialogDescription>Tambahkan section produk untuk Home.</DialogDescription>
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
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
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
                  {errors.platform && (
                    <p className="text-xs text-red-500 mt-1">{errors.platform}</p>
                  )}
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
                  {errors.menu_type && (
                    <p className="text-xs text-red-500 mt-1">{errors.menu_type}</p>
                  )}
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
              {errors.is_featured && (
                <p className="text-xs text-red-500 mt-1">{errors.is_featured}</p>
              )}
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
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={productSections} />
      </div>
    </AdminLayout>
  )
}
