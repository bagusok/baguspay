import { DepositStatus, type PaymentMethodType } from '@repo/db/types'
import { DataTable } from '@repo/ui/components/data-table'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { Calendar } from '@repo/ui/components/ui/calendar'
import { Input } from '@repo/ui/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import BreadcrumbBasic from '~/components/breadcrumb-basic'
import { apiClient } from '~/utils/axios'
import { formatDate, formatPrice } from '~/utils/format'

const columns: ColumnDef<DepositHistoryData>[] = [
  {
    accessorKey: 'deposit_id',
    header: 'ID Deposit',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <code className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-mono font-medium border border-border">
          {row.original.deposit_id}
        </code>
      </div>
    ),
  },
  {
    accessorKey: 'amount_pay',
    header: 'Jumlah Bayar',
    cell: ({ row }) => (
      <span className="font-bold text-primary">{formatPrice(row.original.amount_pay)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      switch (row.original.status) {
        case DepositStatus.PENDING:
          return <Badge variant="soft-yellow">Pending</Badge>
        case DepositStatus.COMPLETED:
          return <Badge variant="soft-green">Completed</Badge>
        case DepositStatus.FAILED:
          return <Badge variant="soft-red">Failed</Badge>
        default:
          return (
            <Badge variant="outline" className="capitalize text-[11px]">
              {row.original.status.toLowerCase()}
            </Badge>
          )
      }
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Tanggal Dibuat',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.created_at)}</span>
    ),
  },
  {
    accessorKey: 'expired_at',
    header: 'Tanggal Kadaluarsa',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.expired_at ? formatDate(row.original.expired_at) : '-'}
      </span>
    ),
  },
]

export default function DepositHistory() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filter, setFilter] = useState<{
    deposit_id: string
    start_date: Date | undefined
    end_date: Date | undefined
  }>({
    deposit_id: '',
    start_date: undefined,
    end_date: undefined,
  })

  const depositHistory = useQuery({
    queryKey: ['depositHistory', page, limit, filter],
    queryFn: async () =>
      apiClient
        .get<DepositHistoryResponse>('/deposit/history', {
          params: {
            page,
            limit,
            ...filter,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          throw err.response?.data || err
        }),
  })

  useEffect(() => {
    //   set ke satu jika ada filter yang berubah
    if (filter.deposit_id || filter.start_date || filter.end_date) {
      setPage(1)
    }
  }, [filter])

  return (
    <>
      <BreadcrumbBasic
        items={[
          {
            label: 'Home',
            href: '/',
          },
          {
            label: 'User',
            href: '/user',
          },
          {
            label: 'Riwayat Deposit',
          },
        ]}
      />
      <section id="header">
        <div className="md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Detail Deposit</h1>
          <p className="text-muted-foreground">Informasi lengkap tentang deposit Anda</p>
        </div>
      </section>
      <section>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Cari ID Deposit"
            value={filter.deposit_id}
            onChange={(e) => setFilter({ ...filter, deposit_id: e.target.value })}
            className="w-full max-w-xs"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!filter.start_date}
                className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-border flex-1"
              >
                <CalendarIcon />
                {filter.start_date ? formatDate(filter.start_date) : 'Pilih Tanggal Mulai'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filter.start_date}
                onSelect={(date) =>
                  setFilter({
                    ...filter,
                    start_date: date,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!filter.end_date}
                className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal border-border flex-1"
              >
                <CalendarIcon />
                {filter.end_date ? formatDate(filter.end_date) : 'Pilih Tanggal Berakhir'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filter.end_date}
                onSelect={(date) =>
                  setFilter({
                    ...filter,
                    end_date: date,
                  })
                }
              />
            </PopoverContent>
          </Popover>
          <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Limit">{limit}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per halaman</SelectItem>
              <SelectItem value="10">10 per halaman</SelectItem>
              <SelectItem value="20">20 per halaman</SelectItem>
              <SelectItem value="50">50 per halaman</SelectItem>
              <SelectItem value="100">100 per halaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {depositHistory.isLoading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {depositHistory.isError && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{depositHistory.error.message || 'Terjadi kesalahan'}</p>
          </div>
        )}

        {depositHistory.isSuccess && (
          <div className="grid mt-4">
            <DataTable
              columns={columns}
              data={depositHistory.data?.data}
              onRowClick={(row) => navigate(`/user/deposit/history/${row.deposit_id}`)}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mt-6 mb-8">
          <div className="text-sm text-muted-foreground flex items-center justify-center h-9">
            Halaman{' '}
            <span className="font-semibold text-foreground mx-1">
              {depositHistory.data?.meta.pagination.page || 1}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-foreground ml-1">
              {depositHistory.data?.meta.pagination.total_pages || 1}
            </span>
          </div>
          <div className="flex gap-2 items-center bg-card border border-border p-1 rounded-lg">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-4 font-medium text-xs rounded-md"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Sebelumnya
            </Button>
            <div className="w-px h-4 bg-border mx-1"></div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-4 font-medium text-xs rounded-md"
              disabled={page >= (depositHistory.data?.meta.pagination.total_pages ?? 1)}
              onClick={() =>
                setPage((prev) =>
                  Math.min(prev + 1, depositHistory.data?.meta.pagination.total_pages ?? 1),
                )
              }
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export interface DepositHistoryResponse {
  success: boolean
  message: string
  data: DepositHistoryData[]
  meta: DepositHistoryMeta
}

export interface DepositHistoryData {
  id: string
  deposit_id: string
  amount_pay: number
  created_at: string
  expired_at: string
  status: DepositStatus
  payment_method: DepositHistoryPaymentMethod
}

export interface DepositHistoryPaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
}

export interface DepositHistoryMeta {
  pagination: DepositHistoryPagination
}

export interface DepositHistoryPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}
