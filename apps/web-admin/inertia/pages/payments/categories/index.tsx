import PaymentsController from '#controllers/payments_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { AddPaymentCategoryModal } from './add-payment-category-modal'
import AdminLayout from '~/components/layout/admin-layout'
import { DataTable } from '@repo/ui/components/data-table'
import { formatDate } from '~/utils/index'
import { Button } from '@repo/ui/components/ui/button'
import { router } from '@inertiajs/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'

import { ColumnDef } from '@tanstack/react-table'
import { EditPaymentCategoryModal } from './edit-payment-category-modal'

// Props type
// Assume controller returns categories: Array<{ id, name, description, created_at }>
type Props = InferPageProps<PaymentsController, 'indexCategory'>

const columns: ColumnDef<Props['categories'][number]>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'description', header: 'Description' },
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
        <EditPaymentCategoryModal name={row.getValue('name')} id={row.original.id} />
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
                This action cannot be undone. This will permanently delete this payment category.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  const id = row.getValue('id')
                  router.delete(`/admin/payments/categories/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/payments/categories')
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

export default function PaymentCategoryIndex(props: Props) {
  const { categories } = props
  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">Payment Categories</h1>
        <AddPaymentCategoryModal />
      </div>
      <div className="grid">
        <DataTable columns={columns} data={categories} />
      </div>
    </AdminLayout>
  )
}
