import UsersController from '#controllers/users_controller'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu'
import { Input } from '@repo/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate, formatPrice } from '~/utils/index'
import AddBalanceModal from './add-balance-modal'
import AddUserModal from './add-user'
import DeductAddBalanceModal from './deduct-balance-modal'
import EditUserModal from './edit-user'

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <EditUserModal user={row.original} />
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex justify-start items-center text-sm p-2 hover:bg-red-100 w-full rounded">
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete
              </button>
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
          <DropdownMenuSeparator />
          <AddBalanceModal
            userId={row.original.id}
            userName={row.original.name}
            userEmail={row.original.email}
            currentBalance={row.original.balance}
          />
          <DeductAddBalanceModal
            userId={row.original.id}
            userName={row.original.name}
            userEmail={row.original.email}
            currentBalance={row.original.balance}
          />
        </DropdownMenuContent>
      </DropdownMenu>
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
