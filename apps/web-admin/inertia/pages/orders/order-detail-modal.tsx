import { InferSelectModel } from '@repo/db'
import { OrderStatus, PaymentStatus, RefundStatus, tb } from '@repo/db/types'
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
import { Label } from '@repo/ui/components/ui/label'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { cn } from '@repo/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { EyeIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '~/utils/axios'

// Props: orderId (string)
type Props = {
  orderId: string
}

export default function OrderDetailModal({ orderId }: Props) {
  const [open, setOpen] = useState(false)

  const detailOrder = useMutation<{
    order: InferSelectModel<typeof tb.orders> & {
      user: InferSelectModel<typeof tb.users>
      product_snapshot: InferSelectModel<typeof tb.productSnapshots>
      payment_snapshot: InferSelectModel<typeof tb.paymentSnapshots>
      offer_on_order?: {
        offer: InferSelectModel<typeof tb.offers>
      }
    }
  }>({
    mutationKey: ['detailOrder', orderId],
    mutationFn: async () =>
      apiClient
        .get(`/admin/orders/${orderId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.error('Error fetching order details:', err)
          throw new Error('Failed to fetch order details')
        }),
  })

  useEffect(() => {
    if (open) {
      detailOrder.mutate()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <EyeIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-2/3 lg:min-w-1/2 max-h-[90vh] p-6">
        <DialogHeader>
          <DialogTitle>Order Detail</DialogTitle>
          <DialogDescription>
            Informasi lengkap order ID:{' '}
            <span className="font-semibold">{detailOrder.data?.order?.order_id || orderId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[65vh] pr-2">
          {detailOrder.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ) : detailOrder.isError ? (
            <div className="text-red-500 text-center py-4">Gagal mengambil detail order.</div>
          ) : detailOrder.data?.order ? (
            <div className="space-y-6 py-2">
              {/* User Info */}
              <div>
                <div className="font-semibold text-base mb-2 border-b pb-1">User Info</div>
                <div className="grid grid-cols-2 gap-4">
                  {detailOrder.data?.order.user ? (
                    <>
                      <div>
                        <Label className="mb-1">User ID</Label>
                        <div>{detailOrder.data?.order.user_id}</div>
                      </div>
                      <div>
                        <Label className="mb-1">User Name</Label>
                        <div>{detailOrder.data?.order.user?.name || '-'}</div>
                      </div>
                      <div>
                        <Label className="mb-1">User Email</Label>
                        <div>{detailOrder.data?.order.user?.email || '-'}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">Guest Order</div>
                  )}
                </div>
              </div>
              {/* Order Info */}
              <div>
                <div className="font-semibold text-base mb-2 border-b pb-1">Order Info</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">Order ID</Label>
                    <div className="font-medium">{detailOrder.data?.order.order_id}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Status</Label>
                    <div
                      className={cn('capitalize font-semibold p-1 rounded', {
                        'bg-red-200 text-red-500':
                          detailOrder.data?.order.order_status === OrderStatus.FAILED,
                        'bg-yellow-200 text-yellow-500':
                          detailOrder.data?.order.order_status === OrderStatus.PENDING,
                        'bg-green-200 text-green-500':
                          detailOrder.data?.order.order_status === OrderStatus.COMPLETED,
                        'bg-gray-200 text-gray-500':
                          detailOrder.data?.order.order_status === OrderStatus.NONE,
                        'bg-slate-200 text-slate-500':
                          detailOrder.data?.order.order_status === OrderStatus.CANCELLED,
                      })}
                    >
                      {detailOrder.data?.order.order_status}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Payment Status</Label>
                    <div
                      className={cn('capitalize font-semibold p-1 rounded', {
                        'bg-red-200 text-red-500':
                          detailOrder.data?.order.payment_status === PaymentStatus.FAILED,
                        'bg-yellow-200 text-yellow-500':
                          detailOrder.data?.order.payment_status === PaymentStatus.PENDING,
                        'bg-green-200 text-green-500':
                          detailOrder.data?.order.payment_status === PaymentStatus.SUCCESS,
                        'bg-gray-200 text-gray-500':
                          detailOrder.data?.order.payment_status === PaymentStatus.EXPIRED,
                        'bg-slate-200 text-slate-500':
                          detailOrder.data?.order.payment_status === PaymentStatus.CANCELLED,
                      })}
                    >
                      {detailOrder.data?.order.payment_status}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Refund Status</Label>
                    <div
                      className={cn('capitalize font-semibold p-1 rounded', {
                        'bg-red-200 text-red-500':
                          detailOrder.data?.order.refund_status === RefundStatus.FAILED,
                        'bg-yellow-200 text-yellow-500':
                          detailOrder.data?.order.refund_status === RefundStatus.PROCESSING,
                        'bg-green-200 text-green-500':
                          detailOrder.data?.order.refund_status === RefundStatus.COMPLETED,
                        'bg-gray-200 text-gray-500':
                          detailOrder.data?.order.refund_status === RefundStatus.NONE,
                      })}
                    >
                      {detailOrder.data?.order.refund_status}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Total Price</Label>
                    <div>{detailOrder.data?.order.total_price?.toLocaleString()}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Fee</Label>
                    <div>{detailOrder.data?.order.fee?.toLocaleString()}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Profit</Label>
                    <div>{detailOrder.data?.order.profit?.toLocaleString()}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Discount Price</Label>
                    <div>{detailOrder.data?.order.discount_price?.toLocaleString()}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Created At</Label>
                    <div>
                      {detailOrder.data?.order.created_at
                        ? new Date(detailOrder.data?.order.created_at).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Updated At</Label>
                    <div>
                      {detailOrder.data?.order.updated_at
                        ? new Date(detailOrder.data?.order.updated_at).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
              {/* Product Info */}
              <div>
                <div className="font-semibold text-base mb-2 border-b pb-1">Product Info</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">Product Name</Label>
                    <div>{detailOrder.data?.order.product_snapshot?.name || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Provider</Label>
                    <div>{detailOrder.data?.order.product_snapshot?.provider_name || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Category</Label>
                    <div>{detailOrder.data?.order.product_snapshot?.category_name || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Sub Category</Label>
                    <div>{detailOrder.data?.order.product_snapshot?.sub_category_name || '-'}</div>
                  </div>
                </div>
              </div>
              {/* Payment Info */}
              <div>
                <div className="font-semibold text-base mb-2 border-b pb-1">Payment Info</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">Payment Name</Label>
                    <div>{detailOrder.data?.order.payment_snapshot?.name || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Provider</Label>
                    <div>{detailOrder.data?.order.payment_snapshot?.provider_name || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Type</Label>
                    <div>{detailOrder.data?.order.payment_snapshot?.type || '-'}</div>
                  </div>
                </div>
              </div>
              {/* Offer Info */}
              <div>
                <div className="font-semibold text-base mb-2 border-b pb-1">Offer Info</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">Offer ID</Label>
                    <div>{detailOrder.data?.order.offer_on_order?.offer?.id || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Offer Name</Label>
                    <div>{detailOrder.data?.order.offer_on_order?.offer?.name || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Discount Maximum</Label>
                    <div>
                      {detailOrder.data?.order.offer_on_order?.offer?.discount_maximum || '-'}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Discount Percentage</Label>
                    <div>
                      {detailOrder.data?.order.offer_on_order?.offer?.discount_percentage || '-'}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Discount Static</Label>
                    <div>
                      {detailOrder.data?.order.offer_on_order?.offer?.discount_static || '-'}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Offer Code</Label>
                    <div>{detailOrder.data?.order.offer_on_order?.offer?.code || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Quota</Label>
                    <div>{detailOrder.data?.order.offer_on_order?.offer?.quota || '-'}</div>
                  </div>
                </div>
              </div>
              {/* Other Info */}
              <div>
                <div className="font-semibold text-base mb-2 border-b pb-1">Other Info</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1">Customer IP</Label>
                    <div>{detailOrder.data?.order.customer_ip || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">User Agent</Label>
                    <div>{detailOrder.data?.order.customer_ua || '-'}</div>
                  </div>
                  <div>
                    <Label className="mb-1">Type</Label>
                    <div className="text-ellipsis line-clamp-1">
                      {detailOrder.data?.order.customer_phone || '-'}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">Type</Label>
                    <div>{detailOrder.data?.order.customer_email || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
