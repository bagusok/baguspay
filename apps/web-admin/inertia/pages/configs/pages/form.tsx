import type { InferPageProps } from '@adonisjs/inertia/types'
import { Link, useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Separator } from '@repo/ui/components/ui/separator'
import { Switch } from '@repo/ui/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import type PagesController from '#controllers/configs/pages_controller'
import AdminLayout from '~/components/layout/admin-layout'
import { SimpleEditor } from '~/components/tiptap/tiptap-templates/simple/simple-editor'

type CreateProps = InferPageProps<PagesController, 'create'>
type EditProps = InferPageProps<PagesController, 'edit'>

type Props = (CreateProps | EditProps) & {
  page: PageData | null
  mode: 'create' | 'edit'
}

type PageData = {
  id: string
  title: string
  slug: string
  content: string
  is_published: boolean
  order: number
}

export default function PageForm(props: Props) {
  const page = (props.page as PageData | null) ?? null
  const isEdit = props.mode === 'edit'

  const { data, setData, post, patch, processing, errors } = useForm({
    title: page?.title ?? '',
    slug: page?.slug ?? '',
    content: page?.content ?? '',
    is_published: page?.is_published ?? false,
    order: page?.order ?? 0,
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setData('title', title)
    if (!isEdit) {
      setData('slug', generateSlug(title))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEdit && page) {
      patch(`/admin/config/pages/${page.id}`, {
        onSuccess: () => {
          toast.success('Halaman berhasil diperbarui')
        },
        onError: () => {
          toast.error('Gagal memperbarui halaman')
        },
      })
    } else {
      post('/admin/config/pages', {
        onSuccess: () => {
          toast.success('Halaman berhasil dibuat')
        },
        onError: () => {
          toast.error('Gagal membuat halaman')
        },
      })
    }
  }

  return (
    <AdminLayout>
      <div className="mt-5">
        <Link
          href="/admin/config/pages"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Halaman
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Halaman' : 'Tambah Halaman Baru'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? 'Perbarui informasi halaman yang sudah ada'
              : 'Buat halaman baru seperti Kebijakan Privasi atau Syarat & Ketentuan'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">Informasi Halaman</h2>
          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Halaman *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={handleTitleChange}
                placeholder="Contoh: Kebijakan Privasi"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                placeholder="Contoh: kebijakan-privasi"
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
              <p className="text-xs text-muted-foreground">
                URL: /pages/{data.slug || 'slug-halaman'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order">Urutan</Label>
              <Input
                id="order"
                type="number"
                value={data.order}
                onChange={(e) => setData('order', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Angka lebih tinggi akan ditampilkan lebih dulu
              </p>
            </div>

            <div className="space-y-2">
              <Label>Status Publikasi</Label>
              <div className="flex items-center gap-3 mt-2">
                <Switch
                  checked={data.is_published}
                  onCheckedChange={(value) => setData('is_published', value)}
                />
                <span className="text-sm">{data.is_published ? 'Published' : 'Draft'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Halaman draft tidak akan ditampilkan ke publik
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold">Konten Halaman</h2>
          <Separator />

          <div className="space-y-2">
            <Label>Konten *</Label>
            <div className="border rounded-lg overflow-hidden">
              <SimpleEditor value={data.content} onChange={(val) => setData('content', val)} />
            </div>
            {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/config/pages">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={processing}>
            {processing ? 'Menyimpan...' : isEdit ? 'Perbarui Halaman' : 'Simpan Halaman'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
