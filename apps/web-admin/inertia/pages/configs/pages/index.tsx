import type { InferPageProps } from '@adonisjs/inertia/types'
import { Link, router } from '@inertiajs/react'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui/table'
import { Edit, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type PagesController from '#controllers/configs/pages_controller'
import AdminLayout from '~/components/layout/admin-layout'

type Props = InferPageProps<PagesController, 'index'>

type PageItem = {
  id: string
  title: string
  slug: string
  content: string
  is_published: boolean
  order: number
  created_at: string
  updated_at: string | null
}

export default function PagesIndex(props: Props) {
  const pages = props.pages as PageItem[]

  const handleDelete = (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus halaman ini?')) return

    router.delete(`/admin/config/pages/${id}`, {
      onSuccess: () => {
        toast.success('Halaman berhasil dihapus')
      },
      onError: () => {
        toast.error('Gagal menghapus halaman')
      },
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mt-5">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Halaman</h1>
          <p className="text-sm text-muted-foreground">
            Kelola halaman seperti Kebijakan Privasi, Syarat & Ketentuan, dll.
          </p>
        </div>
        <Link href="/admin/config/pages/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Halaman
          </Button>
        </Link>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada halaman. Klik tombol "Tambah Halaman" untuk membuat halaman baru.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    {page.is_published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{page.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/config/pages/${page.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(page.id)}>
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
    </AdminLayout>
  )
}
