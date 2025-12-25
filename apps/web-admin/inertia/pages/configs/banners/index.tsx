import BannersController from '#controllers/banners_controller'
import { CreateBannerValidator } from '#validators/banners'
import { InferPageProps } from '@adonisjs/inertia/types'
import { router, useForm } from '@inertiajs/react'
import { BannerLocation } from '@repo/db/types'
import { DataTable } from '@repo/ui/components/data-table'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
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
import { useMutation } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import FileManager from '~/components/file-manager'
import Image from '~/components/image'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate } from '~/utils'
import { apiClient } from '~/utils/axios'

type Props = InferPageProps<BannersController, 'index'>

type Banner = {
  id: string
  title: string
  description: string | null
  image_url: string
  is_available: boolean | null
  product_category_id: string | null
  created_at?: string | Date | null
  updated_at?: string | Date | null
}

function AddBannerDialog() {
  const [open, setOpen] = useState(false)
  const form = useForm<CreateBannerValidator>({
    title: '',
    image_id: '' as any,
    description: '',
    is_available: true,
    product_category_id: '' as any,
    banner_location: BannerLocation.HOME_TOP,
    href_url: '',
    app_url: '',
  })

  const [categoryQuery, setCategoryQuery] = useState('')
  const [categoryResults, setCategoryResults] = useState<Array<{ id: string; name: string }>>([])

  const searchCategories = useMutation({
    mutationKey: ['searchProductCategories'],
    mutationFn: async (q: string) => {
      const res = await apiClient.get('/admin/product-categories/get-json', {
        params: { searchBy: 'name', searchQuery: q, page: 1, limit: 100 },
      })
      const payload = res.data ?? {}
      const list = Array.isArray(payload.productCategories)
        ? payload.productCategories
        : Array.isArray(payload.data)
          ? payload.data
          : []
      return list as Array<{ id: string; name: string; slug?: string }>
    },
    onSuccess: (items) =>
      setCategoryResults(
        items.map((x) => ({ id: x.id, name: (x as any).name ?? (x as any).slug ?? x.id }))
      ),
  })

  useEffect(() => {
    if (!categoryQuery || categoryQuery.length < 2) {
      setCategoryResults([])
      return
    }
    const t = setTimeout(() => searchCategories.mutate(categoryQuery), 300)
    return () => clearTimeout(t)
  }, [categoryQuery])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/admin/config/home/banner', {
      preserveScroll: true,
      onSuccess: () => {
        setOpen(false)
        form.reset()
        setCategoryQuery('')
        setCategoryResults([])
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Banner</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Banner</DialogTitle>
          <DialogDescription>Isi data banner di bawah ini.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={form.data.title}
              onChange={(e) => form.setData('title', e.target.value)}
            />
            {form.errors.title && <p className="text-xs text-red-500 mt-1">{form.errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={form.data.description || ''}
              onChange={(e) => form.setData('description', e.target.value)}
            />
            {form.errors.description && (
              <p className="text-xs text-red-500 mt-1">{form.errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <FileManager onFilesSelected={(f) => form.setData('image_id', (f as any).id)} />
            {form.errors.image_id && (
              <p className="text-xs text-red-500 mt-1">{form.errors.image_id}</p>
            )}
          </div>

          <div>
            <Label htmlFor="banner_location">Banner Location</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih lokasi banner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BannerLocation.HOME_TOP}>Home TOP</SelectItem>
                <SelectItem value={BannerLocation.HOME_MIDDLE}>Home MIDDLE</SelectItem>
                <SelectItem value={BannerLocation.HOME_BOTTOM}>Home BOTTOM</SelectItem>
              </SelectContent>
            </Select>
            {form.errors.banner_location && (
              <p className="text-xs text-red-500 mt-1">{form.errors.banner_location}</p>
            )}
          </div>

          <div>
            <Label htmlFor="href_url">Href URL</Label>
            <Input
              id="href_url"
              value={form.data.href_url}
              onChange={(e) => form.setData('href_url', e.target.value)}
            />
            {form.errors.href_url && (
              <p className="text-xs text-red-500 mt-1">{form.errors.href_url}</p>
            )}
          </div>

          <div>
            <Label htmlFor="app_url">App URL</Label>
            <Input
              id="app_url"
              value={form.data.app_url}
              onChange={(e) => form.setData('app_url', e.target.value)}
            />
            {form.errors.app_url && (
              <p className="text-xs text-red-500 mt-1">{form.errors.app_url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_available"
                checked={!!form.data.is_available}
                onCheckedChange={(v) => form.setData('is_available', v)}
              />
              <Label htmlFor="is_available">Aktif</Label>
            </div>
            <div>
              <Label htmlFor="product_category_id">Product Category (opsional)</Label>
              <Input
                id="product_category_search"
                value={categoryQuery}
                onChange={(e) => setCategoryQuery(e.target.value)}
                placeholder="Cari kategori..."
              />
              {searchCategories.isPending && (
                <p className="text-xs text-muted-foreground mt-1">Mencari…</p>
              )}
              {categoryResults.length > 0 && (
                <div className="max-h-56 overflow-auto border rounded-md divide-y mt-2">
                  {categoryResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-muted ${
                        form.data.product_category_id === c.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => form.setData('product_category_id', c.id)}
                    >
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.id}</div>
                    </button>
                  ))}
                </div>
              )}
              <Input
                className="mt-2"
                id="product_category_id"
                value={form.data.product_category_id || ''}
                onChange={(e) => form.setData('product_category_id', e.target.value)}
                placeholder="Atau masukkan UUID manual"
              />
              {form.errors.product_category_id && (
                <p className="text-xs text-red-500 mt-1">{form.errors.product_category_id}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.processing}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteBannerDialog({ title, onConfirm }: { title: string; onConfirm?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Hapus
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus banner?</DialogTitle>
          <DialogDescription>Ini hanya UI. Tekan Hapus untuk konfirmasi.</DialogDescription>
        </DialogHeader>
        <p className="text-sm">
          Banner: <span className="font-medium">{title}</span>
        </p>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm?.()
              setOpen(false)
            }}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function BannersIndex({ banners }: Props) {
  const [items, setItems] = useState<Banner[]>(() =>
    Array.isArray(banners) ? (banners as any) : []
  )
  useEffect(() => {
    setItems(Array.isArray(banners) ? (banners as any) : [])
  }, [banners])

  const columns = useMemo<ColumnDef<Banner>[]>(
    () => [
      {
        accessorKey: 'image_url',
        header: 'Image',
        cell: ({ row }) => (
          <div className="w-16 h-10 border rounded overflow-hidden bg-muted flex items-center justify-center">
            {row.original.image_url ? (
              <Image
                src={row.original.image_url}
                alt={row.original.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-muted-foreground">No image</span>
            )}
          </div>
        ),
      },
      { accessorKey: 'title', header: 'Title' },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-105 text-muted-foreground text-sm">
            {row.original.description ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'is_available',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={row.original.is_available ? 'bg-green-600' : 'bg-gray-500'}>
            {row.original.is_available ? 'Active' : 'Hidden'}
          </Badge>
        ),
      },
      {
        accessorKey: 'product_category_id',
        header: 'Category',
        cell: ({ row }) => row.original.product_category_id ?? '-',
      },
      {
        accessorKey: 'banner_location',
        header: 'Location',
        cell: ({ row }) => row.original.banner_location ?? '-',
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => formatDate(row.getValue('created_at')),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <DeleteBannerDialog
              title={row.original.title}
              onConfirm={() =>
                router.delete(`/admin/config/home/banner/${row.original.id}` as any, {
                  preserveScroll: true,
                  onSuccess: () => setItems((prev) => prev.filter((x) => x.id !== row.original.id)),
                })
              }
            />
          </div>
        ),
      },
    ],
    []
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Banners</h1>
        <AddBannerDialog />
      </div>

      <DataTable columns={columns} data={items} />
    </AdminLayout>
  )
}
