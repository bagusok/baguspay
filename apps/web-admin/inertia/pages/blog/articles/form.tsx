import type { InferPageProps } from '@adonisjs/inertia/types'
import { Link, useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { Separator } from '@repo/ui/components/ui/separator'
import { Switch } from '@repo/ui/components/ui/switch'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { ArrowLeft, ImageIcon, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type ArticlesController from '#controllers/blog/articles_controller'
import FileManager from '~/components/file-manager'
import Image from '~/components/image'
import AdminLayout from '~/components/layout/admin-layout'
import { SimpleEditor } from '~/components/tiptap/tiptap-templates/simple/simple-editor'

type CreateProps = InferPageProps<ArticlesController, 'create'>
type EditProps = InferPageProps<ArticlesController, 'edit'>

type Props = (CreateProps | EditProps) & {
  article: ArticleData | null
  categories: CategoryItem[]
  mode: 'create' | 'edit'
}

type CategoryItem = {
  id: string
  name: string
  slug: string
}

type ArticleData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  image_url: string | null
  article_category_id: string | null
  is_published: boolean
  is_featured: boolean
  order: number
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
}

export default function ArticleForm(props: Props) {
  const article = (props.article as ArticleData | null) ?? null
  const categories = props.categories as CategoryItem[]
  const isEdit = props.mode === 'edit'

  const [showFileManager, setShowFileManager] = useState(false)
  const [tagsInput, setTagsInput] = useState((article?.tags ?? []).join(', '))

  const { data, setData, post, patch, processing, errors } = useForm({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    image_url: article?.image_url ?? '',
    article_category_id: article?.article_category_id ?? '',
    is_published: article?.is_published ?? false,
    is_featured: article?.is_featured ?? false,
    order: article?.order ?? 0,
    tags: article?.tags ?? ([] as string[]),
    meta_title: article?.meta_title ?? '',
    meta_description: article?.meta_description ?? '',
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

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    setData('tags', tags)
  }

  const handleImageSelect = (file: { url: string }) => {
    setData('image_url', file.url)
    setShowFileManager(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEdit && article) {
      patch(`/admin/blog/articles/${article.id}`, {
        onSuccess: () => {
          toast.success('Artikel berhasil diperbarui')
        },
        onError: () => {
          toast.error('Gagal memperbarui artikel')
        },
      })
    } else {
      post('/admin/blog/articles', {
        onSuccess: () => {
          toast.success('Artikel berhasil dibuat')
        },
        onError: () => {
          toast.error('Gagal membuat artikel')
        },
      })
    }
  }

  return (
    <AdminLayout>
      <div className="mt-5">
        <Link
          href="/admin/blog/articles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Artikel
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Perbarui informasi artikel' : 'Buat artikel blog baru'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold">Informasi Artikel</h2>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="title">Judul Artikel *</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={handleTitleChange}
                  placeholder="Contoh: Cara Top Up Game dengan Mudah"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="Contoh: cara-top-up-game-dengan-mudah"
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{data.slug || 'slug-artikel'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Ringkasan</Label>
                <Textarea
                  id="excerpt"
                  value={data.excerpt}
                  onChange={(e) => setData('excerpt', e.target.value)}
                  placeholder="Deskripsi singkat artikel (opsional)"
                  rows={3}
                />
                {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold">Konten Artikel</h2>
              <Separator />

              <div className="space-y-2">
                <Label>Konten *</Label>
                <div className="border rounded-lg overflow-hidden">
                  <SimpleEditor value={data.content} onChange={(val) => setData('content', val)} />
                </div>
                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold">SEO</h2>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={data.meta_title}
                  onChange={(e) => setData('meta_title', e.target.value)}
                  placeholder="Title untuk SEO (opsional)"
                />
                <p className="text-xs text-muted-foreground">
                  {data.meta_title.length}/60 karakter (rekomendasi)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={data.meta_description}
                  onChange={(e) => setData('meta_description', e.target.value)}
                  placeholder="Deskripsi untuk SEO (opsional)"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {data.meta_description.length}/160 karakter (rekomendasi)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold">Publikasi</h2>
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Status Publikasi</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.is_published}
                      onCheckedChange={(value) => setData('is_published', value)}
                    />
                    <span className="text-sm">{data.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Featured</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.is_featured}
                      onCheckedChange={(value) => setData('is_featured', value)}
                    />
                    <span className="text-sm">{data.is_featured ? 'Ya' : 'Tidak'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Urutan</Label>
                  <Input
                    id="order"
                    type="number"
                    value={data.order}
                    onChange={(e) => setData('order', parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold">Kategori & Tags</h2>
              <Separator />

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={data.article_category_id}
                  onValueChange={(value) => setData('article_category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-muted-foreground">Pisahkan dengan koma</p>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 space-y-4">
              <h2 className="text-sm font-semibold">Gambar Utama</h2>
              <Separator />

              {data.image_url ? (
                <div className="relative">
                  <Image
                    src={data.image_url}
                    alt="Article thumbnail"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setData('image_url', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => setShowFileManager(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pilih Gambar</span>
                  </div>
                </Button>
              )}

              {data.image_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowFileManager(true)}
                >
                  Ganti Gambar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/blog/articles">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={processing}>
            {processing ? 'Menyimpan...' : isEdit ? 'Perbarui Artikel' : 'Simpan Artikel'}
          </Button>
        </div>
      </form>

      <Dialog open={showFileManager} onOpenChange={setShowFileManager}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Pilih Gambar</DialogTitle>
          </DialogHeader>
          <FileManager onFilesSelected={handleImageSelect} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
