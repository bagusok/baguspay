import { InferPageProps } from '@adonisjs/inertia/types'
import AdminLayout from '~/components/layout/admin-layout'
import { router, useForm } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@repo/ui/components/ui/button'
import { DataTable } from '@repo/ui/components/data-table'
import { formatDate } from '~/utils/index'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'

import InputFieldsController from '#controllers/input_fields_controller'
import CreateInputFieldsModal from './create-modal'

type Props = InferPageProps<InputFieldsController, 'index'>

const columns: ColumnDef<Props['inputFields'][number]>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'identifier',
    header: 'Identifier',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: ({ row }) => formatDate(row.getValue('updated_at')),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
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
                  router.delete(`/admin/input-fields/${row.original.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/input-fields')
                    },
                  })
                }}
              >
                Yes, delete account
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    ),
  },
]

export default function UserIndex(props: Props) {
  const { inputFields } = props

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="flex justify-end">
        <CreateInputFieldsModal />
      </div>

      <DataTable columns={columns} data={inputFields} />
    </AdminLayout>
  )
}
