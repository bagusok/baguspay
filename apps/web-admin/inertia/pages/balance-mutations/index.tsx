import BalanceMutationsController from '#controllers/balance_mutations_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/react'
import { BalanceMutationRefType, BalanceMutationType } from '@repo/db/types'
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
import { cn } from '@repo/ui/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { FormEvent, useState } from 'react'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate, formatPrice } from '~/utils'

type Props = InferPageProps<BalanceMutationsController, 'index'>

const columns: ColumnDef<Props['mutations'][number]>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'user.name',
    header: 'User',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      return (
        <span
          className={cn('font-semibold', {
            'text-red-500': row.original.type === BalanceMutationType.DEBIT,
            'text-green-500': row.original.type === BalanceMutationType.CREDIT,
          })}
        >
          {formatPrice(row.getValue('amount'))}
        </span>
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return (
        <span
          className={cn('font-semibold', {
            'text-red-500': row.original.type === BalanceMutationType.DEBIT,
            'text-green-500': row.original.type === BalanceMutationType.CREDIT,
          })}
        >
          {row.getValue('type')}
        </span>
      )
    },
  },
  {
    accessorKey: 'ref_type',
    header: 'Ref Type',
    cell: ({ row }) => {
      return (
        <span
          className={cn('capitalize px-2 py-0.5 text-xs rounded font-medium', {
            'bg-pink-200 text-pink-700': row.getValue('ref_type') === BalanceMutationRefType.ORDER,
            'bg-purple-200 text-purple-700':
              row.getValue('ref_type') === BalanceMutationRefType.DEPOSIT,
            'bg-yellow-200 text-yellow-700':
              row.getValue('ref_type') === BalanceMutationRefType.WITHDRAWAL,
          })}
        >
          {row.getValue('ref_type')}
        </span>
      )
    },
  },
  {
    accessorKey: 'balance_before',
    header: 'Balance Before',
    cell: ({ row }) => formatPrice(row.getValue('balance_before')),
  },
  {
    accessorKey: 'balance_after',
    header: 'Balance After',
    cell: ({ row }) => formatPrice(row.getValue('balance_after')),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
]

export default function OrderPrepaidIndex(props: Props) {
  const { mutations, pagination, filters } = props
  const [userId, setUserId] = useState(filters.userId || undefined)
  const [sortBy, setSortBy] = useState(filters.sortBy || 'asc')
  const [sortColumn, setSortColumn] = useState(filters.sortColumn || 'created_at')
  const [limit, setLimit] = useState(pagination.limit || 10)

  const [startDate, setStartDate] = useState(filters.startDate || undefined)
  const [endDate, setEndDate] = useState(filters.endDate || undefined)
  const [refType, setRefType] = useState(filters.refType || undefined)
  const [type, setType] = useState(filters.type || undefined)

  // For closing dialog after filter
  const [open, setOpen] = useState(false)
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    router.get(
      '/admin/balance-mutations',
      {
        userId: userId && userId !== '' ? userId : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        refType: refType || undefined,
        type: type || undefined,
        page: 1,
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
    setStartDate(undefined)
    setEndDate(undefined)
    setRefType(undefined)
    setType(undefined)
    setSortBy('desc')
    setSortColumn('created_at')
    setLimit(10)
    router.get(
      '/admin/balance-mutations',
      { limit: 10, page: 1, sortBy, sortColumn },
      { onSuccess: () => setOpen(false) }
    )
  }

  const handleLimitChange = (v: string) => {
    const newLimit = parseInt(v, 10)
    setLimit(newLimit)
    router.get('/admin/balance-mutations', {
      ...filters,
      limit: newLimit,
      page: 1,
    })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/balance-mutations', { ...filters, page, limit })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">Balance Mutations</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Filter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Balance Mutations</DialogTitle>
                <DialogDescription>Set filter options for balance mutations.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col gap-6">
                  {/* Kelompok Tanggal */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label className="mb-1">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="mb-1">End Date</Label>
                      <Input
                        type="date"
                        value={endDate || ''}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Kelompok User */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label className="mb-1">User ID</Label>
                      <Input
                        type="text"
                        value={userId || ''}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Kelompok Ref Type & Type */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label className="mb-1">Ref Type</Label>
                      <Select
                        onValueChange={(v) => setRefType(v as BalanceMutationRefType)}
                        value={refType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Ref Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(BalanceMutationRefType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="mb-1">Type</Label>
                      <Select onValueChange={(v) => setType(v as BalanceMutationType)} value={type}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(BalanceMutationType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Kelompok Sort */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
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
                    <div className="flex-1">
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
                </div>
                <DialogFooter className="flex flex-col items-stretch gap-2">
                  <Button type="submit" variant="default">
                    Apply Filter
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {(userId ||
            startDate ||
            endDate ||
            refType ||
            type ||
            sortBy !== 'desc' ||
            sortColumn !== 'created_at') && (
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
        <DataTable columns={columns} data={mutations} />
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
