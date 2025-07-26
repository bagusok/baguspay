import PaymentsController from '#controllers/payments_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { router, usePage } from '@inertiajs/react'
import { DataTable } from '@repo/ui/components/data-table'
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
import { AddPaymentMethodModal } from './add-modal'
import { EditPaymentMethodModal } from './edit-modal'
import IsAvailableSwicthPaymentMethods from './is-available-switch'

type Props = InferPageProps<PaymentsController, 'indexPaymentMethod'>

const columns: ColumnDef<Props['paymentMethods'][number]>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    header: 'Available',
    cell: ({ row }) => (
      <IsAvailableSwicthPaymentMethods
        isAvailable={row.original.is_available}
        paymentMethodId={row.original.id}
      />
    ),
  },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'provider_name', header: 'Provider Name' },
  { accessorKey: 'provider_code', header: 'Provider Code' },
  { accessorKey: 'fee_type', header: 'Fee Type' },
  {
    accessorKey: 'fee_static',
    header: 'Fee Static',
    cell: ({ row }) => formatPrice(row.getValue('fee_static')),
  },
  { accessorKey: 'fee_percentage', header: 'Fee %' },
  { accessorKey: 'is_available', header: 'Available' },
  { accessorKey: 'is_featured', header: 'Featured' },
  {
    accessorKey: 'min_amount',
    header: 'Min Amount',
    cell: ({ row }) => formatPrice(row.getValue('min_amount')),
  },
  {
    accessorKey: 'max_amount',
    header: 'Max Amount',
    cell: ({ row }) => formatPrice(row.getValue('max_amount')),
  },
  { accessorKey: 'type', header: 'Type' },
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
        <EditPaymentMethodModal paymentMethodId={row.original.id} />
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
                This action cannot be undone. This will permanently delete this payment method.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  const id = row.getValue('id')
                  router.delete(`/admin/payments/methods/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/payments/methods')
                    },
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

export default function PaymentMethodsIndex(props: Props) {
  const { paymentMethods, pagination, filters } = props
  const [searchBy, setSearchBy] = useState(filters?.searchBy || 'id')
  const [searchQuery, setSearchQuery] = useState(filters?.searchQuery || '')
  const pageProps = usePage().props

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/admin/payments/methods', { searchBy, searchQuery })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/payments/methods', { ...filters, page })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <AddPaymentMethodModal categories={props.categories} />
      </div>
      <form className="flex gap-2" onSubmit={handleSearch}>
        <Select
          onValueChange={(v) => setSearchBy(v as 'id' | 'name' | 'provider_name' | 'provider_code')}
          value={searchBy}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Search By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="provider_name">Provider Name</SelectItem>
            <SelectItem value="provider_code">Provider Code</SelectItem>
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
        <DataTable columns={columns} data={paymentMethods} />
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
