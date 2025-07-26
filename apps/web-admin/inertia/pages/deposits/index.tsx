import DepositsController from '#controllers/deposits_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/react'
import { DepositStatus } from '@repo/db/types'
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
import { Label } from '@repo/ui/components/ui/label'
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
import { formatDate, formatPrice } from '~/utils'
import ChangeStatusModal from './change-status-modal'
import DetailDepositModal from './detail-modal'

type Props = InferPageProps<DepositsController, 'index'>

const columns: ColumnDef<Props['deposits'][number]>[] = [
  {
    accessorKey: 'deposit_id',
    header: 'Deposit ID',
  },
  {
    accessorKey: 'user.name',
    header: 'User Name',
  },
  {
    accessorKey: 'amount_received',
    header: 'Amount Received',
    cell: ({ row }) => formatPrice(row.getValue('amount_received')),
  },
  {
    accessorKey: 'amount_fee',
    header: 'Amount Fee',
    cell: ({ row }) => formatPrice(row.getValue('amount_fee')),
  },
  {
    accessorKey: 'amount_pay',
    header: 'Amount Pay',
    cell: ({ row }) => formatPrice(row.getValue('amount_pay')),
  },
  {
    accessorKey: 'payment_method.name',
    header: 'Payment Method',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      let badgeColor = 'text-primary bg-primary'

      switch (row.original.status) {
        case DepositStatus.PENDING:
          badgeColor = 'text-yellow-500 bg-yellow-100'
          break
        case DepositStatus.COMPLETED:
          badgeColor = 'text-green-500 bg-green-100'
          break
        case DepositStatus.FAILED:
          badgeColor = 'text-red-500 bg-red-100'
          break
        case DepositStatus.CANCELED:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
        case DepositStatus.EXPIRED:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
      }

      return (
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeColor}`}
          >
            {row.getValue('status')}
          </span>
          <ChangeStatusModal depositId={row.original.deposit_id} status={row.original.status} />
        </div>
      )
    },
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
        <DetailDepositModal depositId={row.getValue('deposit_id')} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Jangan Pernah Hapus Deposit?</DialogTitle>
              <DialogDescription>
                Daripada Menghapus deposit, lebih baik set saja ke failed atau cancelled.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  const DepositId = row.getValue('id')
                  router.delete(`/admin/deposits/${DepositId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/deposits')
                    },
                  })
                }}
              >
                Yes, delete deposit
              </Button>
              <Button variant="outline">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    ),
  },
]

export default function DepositIndex(props: Props) {
  const { deposits, pagination, filters } = props
  const [userId, setUserId] = useState(filters.userId || undefined)
  const [depositId, setDepositId] = useState(filters.depositId || undefined)
  const [status, setStatus] = useState(filters.status || undefined)
  const [sortBy, setSortBy] = useState(filters.sortBy || 'asc')
  const [sortColumn, setSortColumn] = useState(filters.sortColumn || 'created_at')
  const [limit, setLimit] = useState(pagination.limit || 10)

  // For closing dialog after filter
  const [open, setOpen] = useState(false)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      '/admin/deposits',
      {
        userId: userId && userId !== '' ? userId : undefined,
        depositId: depositId && depositId !== '' ? depositId : undefined,
        status: status ? status : undefined,
        sortBy,
        sortColumn,
        limit,
      },
      {
        onSuccess: () => setOpen(false),
      }
    )
  }

  const handleReset = () => {
    setUserId(undefined)
    setDepositId('')
    setStatus(undefined)
    setSortBy('desc')
    setSortColumn('created_at')
    setLimit(10)
    router.get(
      '/admin/deposits',
      { limit: 10, page: 1, sortBy, sortColumn },
      { onSuccess: () => setOpen(false) }
    )
  }

  const handleLimitChange = (v: string) => {
    const newLimit = parseInt(v, 10)
    setLimit(newLimit)
    router.get('/admin/deposits', {
      ...filters,
      limit: newLimit,
      page: 1,
    })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/deposits', { ...filters, page, limit })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">Deposit Management</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Filter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Deposits</DialogTitle>
                <DialogDescription>Set filter options for deposits.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">User ID</Label>
                    <Input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1">Deposit ID</Label>
                    <Input
                      type="text"
                      value={depositId}
                      onChange={(e) => setDepositId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1">Status</Label>
                    <Select onValueChange={(v) => setStatus(v as DepositStatus)} value={status}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DepositStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={DepositStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={DepositStatus.FAILED}>Failed</SelectItem>
                        <SelectItem value={DepositStatus.CANCELED}>Canceled</SelectItem>
                        <SelectItem value={DepositStatus.EXPIRED}>Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1">Sort By</Label>
                    <Select onValueChange={(v) => setSortBy(v as 'asc' | 'desc')} value={sortBy}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Sort Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1">Sort Column</Label>
                    <Select
                      onValueChange={(v) => setSortColumn(v as typeof sortColumn)}
                      value={sortColumn}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Sort Column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Created At</SelectItem>
                        <SelectItem value="updated_at">Updated At</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex flex-col items-stretch gap-2">
                  <Button type="submit" variant="default">
                    Apply Filter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {(userId || depositId || status || sortBy !== 'desc' || sortColumn !== 'created_at') && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset Filter
            </Button>
          )}

          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid">
        <DataTable columns={columns} data={deposits} />
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
