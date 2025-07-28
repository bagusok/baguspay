import OfferController from '#controllers/offer_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link, router, usePage } from '@inertiajs/react'
import { DataTable } from '@repo/ui/components/data-table'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate, formatPrice } from '~/utils/index'
import IsAvailableSwicthOffer from '../is-available-switch'

type Props = InferPageProps<OfferController, 'indexDiscount'>

const columns: ColumnDef<Props['offers'][number]>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'quota', header: 'Quota' },
  {
    accessorKey: 'discount_static',
    header: 'Discount Static',
    cell: ({ row }) => formatPrice(row.getValue('discount_static')),
  },
  { accessorKey: 'discount_percentage', header: 'Discount %' },
  {
    accessorKey: 'discount_maximum',
    header: 'Discount Max',
    cell: ({ row }) => formatPrice(row.getValue('discount_maximum')),
  },
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    cell: ({ row }) => formatDate(row.getValue('start_date')),
  },
  {
    accessorKey: 'end_date',
    header: 'End Date',
    cell: ({ row }) => formatDate(row.getValue('end_date')),
  },
  {
    accessorKey: 'is_available',
    header: 'Available',
    cell: ({ row }) => (
      <IsAvailableSwicthOffer
        offerId={row.getValue('id')}
        isAvailable={row.getValue('is_available')}
      />
    ),
  },
  { accessorKey: 'is_featured', header: 'Featured' },
  { accessorKey: 'label', header: 'Label' },
  { accessorKey: 'is_all_users', header: 'All Users' },
  { accessorKey: 'is_all_payment_methods', header: 'All Payment Methods' },
  { accessorKey: 'is_all_products', header: 'All Products' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button size="sm" asChild>
          <Link href={`/admin/offers/discount/${row.getValue('id')}/edit`}>Edit</Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const offerId = row.getValue('id')
            router.delete(`/admin/offers/${offerId}`, {
              preserveScroll: true,
              onSuccess: () => {
                router.get('/admin/offers/discount')
              },
            })
          }}
        >
          Delete
        </Button>
      </div>
    ),
  },
]

export default function OfferIndex(props: Props) {
  const { offers, pagination, filters } = props
  const [searchBy, setSearchBy] = useState(filters.searchBy || 'code')
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')

  const pageProps = usePage().props

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/admin/offers/discount', { searchBy, searchQuery })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/offers/discount', { ...filters, page })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2 items-start">
        <h1 className="text-2xl font-bold">Discount Management</h1>
        <Button asChild>
          <Link href="/admin/offers/discount/create">Create Discount</Link>
        </Button>
      </div>
      <form className="flex gap-2" onSubmit={handleSearch}>
        <Select onValueChange={(v) => setSearchBy(v as 'code' | 'id' | 'name')} value={searchBy}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="id">ID</SelectItem>
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
      {pageProps.errors?.searchQuery && (
        <p className="text-red-500 text-sm mt-2">{pageProps.errors.searchQuery}</p>
      )}
      <div className="grid">
        <DataTable columns={columns} data={offers} />
      </div>

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
