import OrdersController from '#controllers/orders_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/react'
import { OrderStatus, PaymentStatus, RefundStatus } from '@repo/db/types'
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
import { useState } from 'react'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate, formatPrice } from '~/utils'
import ChangeOrderStatusModal from '../change-order-status-modal'
import ChangePaymentStatusModal from '../change-payment-status-modal'
import ChangeRefundStatusModal from '../change-refund-status-modal'
import OrderDetailModal from '../order-detail-modal'
import RefundOrderModal from '../refund-modal'

type Props = InferPageProps<OrdersController, 'indexPrepaid'>

const columns: ColumnDef<Props['orders'][number]>[] = [
  {
    accessorKey: 'order_id',
    header: 'Order ID',
  },
  {
    accessorKey: 'user.name',
    header: 'User Name',
  },
  {
    accessorKey: 'product_snapshot.name',
    header: 'Product Name',
  },
  {
    accessorKey: 'category_sub_category_name',
    header: 'Category Name',
    cell: ({ row }) => {
      const categoryName = row.original.product_snapshot.category_name || 'N/A'
      const subCategoryName = row.original.product_snapshot.sub_category_name || 'N/A'
      return (
        <span className="text-sm">
          {categoryName} / {subCategoryName}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_price',
    header: 'Pay Total',
    cell: ({ row }) => formatPrice(row.getValue('total_price')),
  },
  {
    accessorKey: 'original_price',
    header: 'Original Price',
    cell: ({ row }) => formatPrice(row.original.total_price + row.original.discount_price),
  },
  {
    accessorKey: 'fee',
    header: 'Fee',
    cell: ({ row }) => formatPrice(row.getValue('fee')),
  },
  {
    accessorKey: 'cost_price',
    header: 'Cost Price',
    cell: ({ row }) => formatPrice(row.getValue('cost_price')),
  },
  {
    accessorKey: 'profit',
    header: 'Profit',
    cell: ({ row }) => (
      <span
        className={cn({
          'text-green-500': row.original.profit >= 0,
          'text-red-500': row.original.profit < 0,
        })}
      >
        {formatPrice(row.original.profit || 0)}
      </span>
    ),
  },
  {
    accessorKey: 'use_discount',
    header: 'Use Discount',
    cell: ({ row }) => {
      const useDiscount = row.original.offer_on_order
      if (useDiscount) {
        return <span className="text-green-500 font-semibold">Yes</span>
      } else {
        return <span className="text-red-500 font-semibold">No</span>
      }
    },
  },
  {
    accessorKey: 'discount_price',
    header: 'Discount Price',
    cell: ({ row }) => formatPrice(row.getValue('discount_price')),
  },
  {
    accessorKey: 'payment_snapshot.name',
    header: 'Payment Method',
  },
  {
    accessorKey: 'payment_status',
    header: 'Payment Status',
    cell: ({ row }) => {
      let badgeColor = 'text-primary bg-primary'

      switch (row.original.payment_status) {
        case PaymentStatus.PENDING:
          badgeColor = 'text-yellow-500 bg-yellow-100'
          break
        case PaymentStatus.SUCCESS:
          badgeColor = 'text-green-500 bg-green-100'
          break
        case PaymentStatus.FAILED:
          badgeColor = 'text-red-500 bg-red-100'
          break
        case PaymentStatus.CANCELLED:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
        case PaymentStatus.EXPIRED:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
      }

      return (
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeColor}`}
          >
            {row.getValue('payment_status')}
          </span>
          <ChangePaymentStatusModal
            orderId={row.original.order_id}
            status={row.original.payment_status}
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'order_status',
    header: 'Order Status',
    cell: ({ row }) => {
      let badgeColor = 'text-primary bg-primary'

      switch (row.original.order_status) {
        case OrderStatus.PENDING:
          badgeColor = 'text-yellow-500 bg-yellow-100'
          break
        case OrderStatus.COMPLETED:
          badgeColor = 'text-green-500 bg-green-100'
          break
        case OrderStatus.FAILED:
          badgeColor = 'text-red-500 bg-red-100'
          break
        case OrderStatus.CANCELLED:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
        case OrderStatus.NONE:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
      }

      return (
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeColor}`}
          >
            {row.getValue('order_status')}
          </span>
          <ChangeOrderStatusModal
            orderId={row.original.order_id}
            status={row.original.order_status}
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'refund_status',
    header: 'Refund Status',
    cell: ({ row }) => {
      let badgeColor = 'text-primary bg-primary'

      switch (row.original.refund_status) {
        case RefundStatus.PROCESSING:
          badgeColor = 'text-yellow-500 bg-yellow-100'
          break
        case RefundStatus.COMPLETED:
          badgeColor = 'text-green-500 bg-green-100'
          break
        case RefundStatus.FAILED:
          badgeColor = 'text-red-500 bg-red-100'
          break
        case RefundStatus.NONE:
          badgeColor = 'text-gray-500 bg-gray-100'
          break
      }

      return (
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeColor}`}
          >
            {row.getValue('refund_status')}
          </span>
          <ChangeRefundStatusModal
            orderId={row.original.order_id}
            status={row.original.refund_status}
          />
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
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: ({ row }) => formatDate(row.getValue('updated_at')),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        {row.original.user &&
          row.original.payment_status == PaymentStatus.SUCCESS &&
          row.original.order_status == OrderStatus.FAILED &&
          row.original.refund_status !== RefundStatus.COMPLETED && (
            <RefundOrderModal orderId={row.original.order_id} />
          )}
        {!row.original.user &&
          row.original.payment_status == PaymentStatus.SUCCESS &&
          row.original.order_status == OrderStatus.FAILED &&
          row.original.refund_status !== RefundStatus.COMPLETED && <p>Refund Manual</p>}
        <OrderDetailModal orderId={row.original.order_id} />
        {/* <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Jangan Pernah Hapus Order?</DialogTitle>
              <DialogDescription>
                Daripada Menghapus order, lebih baik set saja ke failed atau cancelled.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  const OrderId = row.getValue('id')
                  router.delete(`/admin/orders/${OrderId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                      router.get('/admin/orders')
                    },
                  })
                }}
              >
                Yes, delete order
              </Button>
              <Button variant="outline">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>
    ),
  },
]

export default function OrderPrepaidIndex(props: Props) {
  const { orders, pagination, filters } = props
  const [userId, setUserId] = useState(filters.userId || undefined)
  const [orderId, setOrderId] = useState(filters.orderId || undefined)
  const [paymentStatus, setPaymentStatus] = useState(filters.paymentStatus || undefined)
  const [orderStatus, setOrderStatus] = useState(filters.orderStatus || undefined)
  const [refundStatus, setRefundStatus] = useState(filters.refundStatus || undefined)
  const [sortBy, setSortBy] = useState(filters.sortBy || 'asc')
  const [sortColumn, setSortColumn] = useState(filters.sortColumn || 'created_at')
  const [limit, setLimit] = useState(pagination.limit || 10)

  // For closing dialog after filter
  const [open, setOpen] = useState(false)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      '/admin/orders/prepaid',
      {
        userId: userId && userId !== '' ? userId : undefined,
        orderId: orderId && orderId !== '' ? orderId : undefined,
        paymentStatus: paymentStatus ? paymentStatus : undefined,
        orderStatus: orderStatus ? orderStatus : undefined,
        refundStatus: refundStatus ? refundStatus : undefined,
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
    setOrderId('')
    setPaymentStatus(undefined)
    setOrderStatus(undefined)
    setRefundStatus(undefined)
    setSortBy('desc')
    setSortColumn('created_at')
    setLimit(10)
    router.get(
      '/admin/orders/prepaid',
      { limit: 10, page: 1, sortBy, sortColumn },
      { onSuccess: () => setOpen(false) }
    )
  }

  const handleLimitChange = (v: string) => {
    const newLimit = parseInt(v, 10)
    setLimit(newLimit)
    router.get('/admin/orders/prepaid', {
      ...filters,
      limit: newLimit,
      page: 1,
    })
  }

  const handlePageChange = (page: number) => {
    router.get('/admin/orders/prepaid', { ...filters, page, limit })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between mt-5 mb-2">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Filter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Orders</DialogTitle>
                <DialogDescription>Set filter options for orders.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">User ID</Label>
                    <Input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1">Order ID</Label>
                    <Input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1">Payment Status</Label>
                    <Select
                      onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
                      value={paymentStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1">Order Status</Label>
                    <Select
                      onValueChange={(v) => setOrderStatus(v as OrderStatus)}
                      value={orderStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(OrderStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1">Refund Status</Label>
                    <Select
                      onValueChange={(v) => setRefundStatus(v as RefundStatus)}
                      value={refundStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(RefundStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
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
          {(userId ||
            orderId ||
            paymentStatus ||
            orderStatus ||
            refundStatus ||
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
        <DataTable columns={columns} data={orders} />
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
