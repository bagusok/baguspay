import type { InferPageProps } from '@adonisjs/inertia/types'
import { Link, router } from '@inertiajs/react'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardFooter } from '@repo/ui/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Edit, Eye, EyeOff, Plus, Star, StarOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type ArticlesController from '#controllers/blog/articles_controller'
import Image from '~/components/image'
import AdminLayout from '~/components/layout/admin-layout'

type Props = InferPageProps<ArticlesController, 'index'>

type CategoryItem = {
  id: string
  name: string
  slug: string
}

type ArticleItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  category: CategoryItem | null
}

export default function ArticlesIndex(props: Props) {
  const articles = props.articles as ArticleItem[]
  const categories = props.categories as CategoryItem[]
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filteredArticles =
    filterCategory === 'all' ? articles : articles.filter((a) => a.category?.id === filterCategory)

  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return

    router.delete(`/admin/blog/articles/${id}`, {
      onSuccess: () => {
        toast.success('Artikel berhasil dihapus')
      },
      onError: () => {
        toast.error('Gagal menghapus artikel')
      },
    })
  }

  const handleTogglePublish = (id: string) => {
    router.post(
      `/admin/blog/articles/${id}/toggle-publish`,
      {},
      {
        onSuccess: () => {
          toast.success('Status publikasi berhasil diubah')
        },
        onError: () => {
          toast.error('Gagal mengubah status publikasi')
        },
      },
    )
  }

  const handleToggleFeatured = (id: string) => {
    router.post(
      `/admin/blog/articles/${id}/toggle-featured`,
      {},
      {
        onSuccess: () => {
          toast.success('Status featured berhasil diubah')
        },
        onError: () => {
          toast.error('Gagal mengubah status featured')
        },
      },
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mt-5">
        <div>
          <h1 className="text-2xl font-bold">Artikel</h1>
          <p className="text-sm text-muted-foreground">Kelola artikel blog Anda</p>
        </div>
        <Link href="/admin/blog/articles/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Artikel
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Filter Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Menampilkan {filteredArticles.length} artikel
        </p>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="mt-6 rounded-lg border bg-white p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada artikel. Klik tombol "Tambah Artikel" untuk membuat artikel baru.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {article.is_featured && (
                    <Badge variant="default" className="bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                  {article.is_published ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {article.category && <Badge variant="outline">{article.category.name}</Badge>}
                </div>
                <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {article.published_at
                    ? format(new Date(article.published_at), 'dd MMMM yyyy', { locale: id })
                    : format(new Date(article.created_at), 'dd MMMM yyyy', { locale: id })}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(article.id)}
                    title={article.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {article.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleFeatured(article.id)}
                    title={article.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {article.is_featured ? (
                      <StarOff className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Link href={`/admin/blog/articles/${article.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
