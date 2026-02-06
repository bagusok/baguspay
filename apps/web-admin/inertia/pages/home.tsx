import type { InferPageProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/react'
import { OrderStatus, PaymentStatus } from '@repo/db/types'
import { DataTable } from '@repo/ui/components/data-table'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { cn } from '@repo/ui/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import type HomeController from '#controllers/home_controller'
import AdminLayout from '~/components/layout/admin-layout'
import { formatDate, formatPrice } from '~/utils'

type RechartsModule = typeof import('recharts')

type Props = InferPageProps<HomeController, 'index'>

const paymentStatusOrder = [
  PaymentStatus.PENDING,
  PaymentStatus.SUCCESS,
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
  PaymentStatus.EXPIRED,
]

const orderStatusOrder = [
  OrderStatus.PENDING,
  OrderStatus.COMPLETED,
  OrderStatus.FAILED,
  OrderStatus.CANCELLED,
  OrderStatus.NONE,
]

const columns: ColumnDef<Props['recentOrders'][number]>[] = [
  {
    accessorKey: 'order_id',
    header: 'Order ID',
  },
  {
    accessorKey: 'user.name',
    header: 'User',
    cell: ({ row }) => row.original.user?.name || 'Guest',
  },
  {
    accessorKey: 'product_snapshot.name',
    header: 'Product',
    cell: ({ row }) => row.original.product_snapshot?.name || 'N/A',
  },
  {
    accessorKey: 'total_price',
    header: 'Total',
    cell: ({ row }) => formatPrice(row.getValue('total_price')),
  },
  {
    accessorKey: 'payment_status',
    header: 'Payment',
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
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeColor}`}
        >
          {row.getValue('payment_status')}
        </span>
      )
    },
  },
  {
    accessorKey: 'order_status',
    header: 'Order',
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
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeColor}`}
        >
          {row.getValue('order_status')}
        </span>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
]

export default function Home(props: Props) {
  const {
    range,
    summary,
    paymentStatusCounts,
    orderStatusCounts,
    recentOrders,
    revenueTrend,
    salesProfitTrend,
    topProducts,
    topCategories,
    topUsers,
  } = props
  const [recharts, setRecharts] = useState<RechartsModule | null>(null)

  useEffect(() => {
    let mounted = true
    import('recharts').then((mod) => {
      if (mounted) {
        setRecharts(mod)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleRangeChange = (nextRange: string) => {
    router.get('/admin', { range: nextRange })
  }

  const getStatusCount = (items: { status: string; count: number }[], status: string) => {
    const match = items.find((item) => item.status === status)
    return match ? Number(match.count) : 0
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
          <p className="text-sm text-muted-foreground">Business overview and recent activity</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={range === 'today' ? 'default' : 'outline'}
            onClick={() => handleRangeChange('today')}
          >
            Today
          </Button>
          <Button
            variant={range === '7d' ? 'default' : 'outline'}
            onClick={() => handleRangeChange('7d')}
          >
            7d
          </Button>
          <Button
            variant={range === '30d' ? 'default' : 'outline'}
            onClick={() => handleRangeChange('30d')}
          >
            30d
          </Button>
          <Button
            variant={range === '90d' ? 'default' : 'outline'}
            onClick={() => handleRangeChange('90d')}
          >
            90d
          </Button>
          <Button
            variant={range === 'all' ? 'default' : 'outline'}
            onClick={() => handleRangeChange('all')}
          >
            All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 mt-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-semibold mt-1">{Number(summary.totalOrders)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-semibold mt-1">{formatPrice(Number(summary.totalRevenue))}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Profit</p>
          <p
            className={cn('text-2xl font-semibold mt-1', {
              'text-green-600': Number(summary.totalProfit) >= 0,
              'text-red-600': Number(summary.totalProfit) < 0,
            })}
          >
            {formatPrice(Number(summary.totalProfit))}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Discount</p>
          <p className="text-2xl font-semibold mt-1">
            {formatPrice(Number(summary.totalDiscount))}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Deposits</p>
          <p className="text-2xl font-semibold mt-1">{formatPrice(Number(summary.totalDeposit))}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-semibold mt-1">{Number(summary.totalUsers)}</p>
        </div>
      </div>

      <div className="grid gap-4 mt-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Top Products</p>
              <p className="text-xs text-muted-foreground">Completed vs total orders</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Top Products</DialogTitle>
                  <DialogDescription>Completed vs total orders</DialogDescription>
                </DialogHeader>
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-right">Completed</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((item) => (
                        <tr key={`${item.product_name}-${item.category_name}`} className="border-t">
                          <td className="px-3 py-2 font-medium">{item.product_name}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {item.category_name || 'Unknown'}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.completed_orders).toLocaleString('en-US')}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.total_orders).toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                      {topProducts.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-3 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Completed</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 3).map((item) => (
                  <tr key={`${item.product_name}-${item.category_name}`} className="border-t">
                    <td className="px-3 py-2">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category_name || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.completed_orders).toLocaleString('en-US')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.total_orders).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Top Categories</p>
              <p className="text-xs text-muted-foreground">Completed vs total orders</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Top Categories</DialogTitle>
                  <DialogDescription>Completed vs total orders</DialogDescription>
                </DialogHeader>
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-right">Completed</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCategories.map((item) => (
                        <tr key={item.category_name} className="border-t">
                          <td className="px-3 py-2 font-medium">
                            {item.category_name || 'Unknown'}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.completed_orders).toLocaleString('en-US')}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.total_orders).toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                      {topCategories.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-3 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-right">Completed</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.slice(0, 3).map((item) => (
                  <tr key={item.category_name} className="border-t">
                    <td className="px-3 py-2 font-medium">{item.category_name || 'Unknown'}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.completed_orders).toLocaleString('en-US')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.total_orders).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
                {topCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Top Users</p>
              <p className="text-xs text-muted-foreground">Completed vs total orders</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Detail
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Top Users</DialogTitle>
                  <DialogDescription>Completed vs total orders</DialogDescription>
                </DialogHeader>
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">User</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-right">Completed</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsers.map((item) => (
                        <tr key={item.user_id} className="border-t">
                          <td className="px-3 py-2 font-medium">{item.user_name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{item.user_email}</td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.completed_orders).toLocaleString('en-US')}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.total_orders).toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                      {topUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-3 overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-right">Completed</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.slice(0, 3).map((item) => (
                  <tr key={item.user_id} className="border-t">
                    <td className="px-3 py-2">
                      <p className="font-medium">{item.user_name}</p>
                      <p className="text-xs text-muted-foreground">{item.user_email}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.completed_orders).toLocaleString('en-US')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(item.total_orders).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
                {topUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mt-6 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-semibold">Payment Status</h2>
          <div className="mt-3 space-y-2">
            {paymentStatusOrder.map((status) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span>{status}</span>
                <span className="font-medium">{getStatusCount(paymentStatusCounts, status)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-semibold">Order Status</h2>
          <div className="mt-3 space-y-2">
            {orderStatusOrder.map((status) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span>{status}</span>
                <span className="font-medium">{getStatusCount(orderStatusCounts, status)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Revenue Trend</h2>
            <p className="text-xs text-muted-foreground">Revenue and order outcomes</p>
          </div>
        </div>
        {revenueTrend.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No data available</div>
        ) : !recharts ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading chart...</div>
        ) : (
          <div className="h-[260px] mt-4">
            {(() => {
              const {
                Area,
                CartesianGrid,
                Line,
                LineChart,
                ResponsiveContainer,
                Tooltip,
                XAxis,
                YAxis,
              } = recharts

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueTrend}
                    margin={{ left: 8, right: 16, top: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={70}
                      tickFormatter={(value: number | string) => formatPrice(Number(value))}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={40}
                    />
                    <Tooltip
                      formatter={(value: number | string, name: string) => {
                        if (name === 'revenue') {
                          return formatPrice(Number(value))
                        }
                        return Number(value)
                      }}
                      labelFormatter={(label: number | string) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      yAxisId="left"
                      stroke="hsl(var(--primary))"
                      fill="url(#revenueFill)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalOrders"
                      yAxisId="right"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="paymentSuccess"
                      yAxisId="right"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="paymentFailed"
                      yAxisId="right"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="orderSuccess"
                      yAxisId="right"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="orderFailed"
                      yAxisId="right"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            })()}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Completed Sales & Profit</h2>
            <p className="text-xs text-muted-foreground">Only completed orders are counted</p>
          </div>
        </div>
        {salesProfitTrend.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No data available</div>
        ) : !recharts ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading chart...</div>
        ) : (
          <div className="h-[260px] mt-4">
            {(() => {
              const { Line, LineChart, ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis } =
                recharts

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesProfitTrend}
                    margin={{ left: 8, right: 16, top: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={70}
                      tickFormatter={(value: number | string) => formatPrice(Number(value))}
                    />
                    <Tooltip
                      formatter={(value: number | string) => formatPrice(Number(value))}
                      labelFormatter={(label: number | string) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalProfit"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )
            })()}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Button variant="outline" size="sm" onClick={() => router.get('/admin/orders')}>
            View All
          </Button>
        </div>
        <DataTable columns={columns} data={recentOrders} />
      </div>
    </AdminLayout>
  )
}
