import type { InferPageProps } from '@adonisjs/inertia/types'
import { router, useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui/table'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type ArticleCategoriesController from '#controllers/blog/article_categories_controller'
import AdminLayout from '~/components/layout/admin-layout'

type Props = InferPageProps<ArticleCategoriesController, 'index'>

type CategoryItem = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export default function ArticleCategoriesIndex(props: Props) {
  const categories = props.categories as CategoryItem[]
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)

  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name: '',
    slug: '',
    description: '',
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setData('name', name)
    if (!editingCategory) {
      setData('slug', generateSlug(name))
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    reset()
    setIsOpen(true)
  }

  const openEditModal = (category: CategoryItem) => {
    setEditingCategory(category)
    setData({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
    })
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setEditingCategory(null)
    reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCategory) {
      patch(`/admin/blog/categories/${editingCategory.id}`, {
        onSuccess: () => {
          toast.success('Kategori berhasil diperbarui')
          closeModal()
        },
        onError: () => {
          toast.error('Gagal memperbarui kategori')
        },
      })
    } else {
      post('/admin/blog/categories', {
        onSuccess: () => {
          toast.success('Kategori berhasil dibuat')
          closeModal()
        },
        onError: () => {
          toast.error('Gagal membuat kategori')
        },
      })
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return

    router.delete(`/admin/blog/categories/${id}`, {
      onSuccess: () => {
        toast.success('Kategori berhasil dihapus')
      },
      onError: () => {
        toast.error('Gagal menghapus kategori')
      },
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mt-5">
        <div>
          <h1 className="text-2xl font-bold">Kategori Artikel</h1>
          <p className="text-sm text-muted-foreground">Kelola kategori untuk artikel blog Anda</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada kategori. Klik tombol "Tambah Kategori" untuk membuat kategori baru.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{category.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Perbarui informasi kategori'
                : 'Buat kategori baru untuk artikel blog'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={handleNameChange}
                placeholder="Contoh: Tutorial"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                placeholder="Contoh: tutorial"
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Deskripsi singkat kategori (opsional)"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Menyimpan...' : editingCategory ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
