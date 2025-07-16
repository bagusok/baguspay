import ProductsCategoriesController from '#controllers/product_categories_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link, router } from '@inertiajs/react'
import AdminLayout from '~/components/layout/admin-layout'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { Input } from '@repo/ui/components/ui/input'
import { Button } from '@repo/ui/components/ui/button'
import { DataTable } from '@repo/ui/components/data-table'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '~/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'

import IsAvailable from './product-categories/is-avalable'

type Props = InferPageProps<ProductsCategoriesController, 'index'>

export default function ProductCategory(props: Props) {
  const { productCategories, pagination, filters } = props
  const [searchBy, setSearchBy] = useState(filters.searchBy || 'id')
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/admin/product-categories', { searchBy, searchQuery })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/product-categories', { ...filters, page })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <Button asChild>
          <Link href="/admin/product-categories/create">Add New</Link>
        </Button>
      </div>
      <form className="flex gap-2" onSubmit={handleSearch}>
        <Select onValueChange={(v) => setSearchBy(v as 'id' | 'name')} value={searchBy}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-48 h-8 text-sm"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
      <DataTable columns={columns} data={productCategories} />
      <div className="flex justify-between items-center mt-4">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

const columns: ColumnDef<Props['productCategories'][number]>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => (
      <div className="aspect-square w-20 overflow-hidden rounded-md">
        <img
          src={`${import.meta.env.VITE_S3_URL}${row.original.image_url}`}
          alt={row.getValue('name')}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'is_available',
    header: 'Available',
    cell: ({ row }) => (
      <IsAvailable
        key={row.original.id}
        isAvailable={row.original.is_available}
        id={row.original.id}
      />
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
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/product-categories/${row.original.id}`}>Detail</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/admin/product-categories/${row.original.id}/edit`}>Edit</Link>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  router.delete(`/admin/product-categories/${row.original.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/product-categories')
                    },
                  })
                }}
              >
                Yes, delete account
              </Button>
              <Button variant="outline">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    ),
  },
]
