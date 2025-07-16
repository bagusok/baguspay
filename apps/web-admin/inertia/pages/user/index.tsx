import UsersController from '#controllers/users_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import AdminLayout from '~/components/layout/admin-layout'
import { router, useForm, usePage } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { Input } from '@repo/ui/components/ui/input'
import { Button } from '@repo/ui/components/ui/button'
import { DataTable } from '@repo/ui/components/data-table'
import { formatDate, formatPrice } from '~/utils/index'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import AddUserModal from './add-user'
import EditUserModal from './edit-user'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'

type Props = InferPageProps<UsersController, 'index'>

const columns: ColumnDef<Props['users'][number]>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => formatPrice(row.getValue('balance')),
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'is_banned',
    header: 'Banned',
  },
  {
    accessorKey: 'is_email_verified',
    header: 'Email Verified',
  },
  {
    accessorKey: 'is_deleted',
    header: 'Deleted',
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
        <EditUserModal user={row.original} />
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
                  const userId = row.getValue('id')
                  router.delete(`/admin/users/${userId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/users')
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

export default function UserIndex(props: Props) {
  const { users, pagination, filters } = props
  const [searchBy, setSearchBy] = useState(filters.searchBy || 'id')
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')

  const pageProps = usePage().props

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/admin/users', { searchBy, searchQuery })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/users', { ...filters, page })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">User Management</h1>
        <AddUserModal />
      </div>
      <form className="flex gap-2" onSubmit={handleSearch}>
        <Select onValueChange={(v) => setSearchBy(v as 'id' | 'name' | 'email')} value={searchBy}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Pilih Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="email">Email</SelectItem>
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
        <DataTable columns={columns} data={users} />
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
