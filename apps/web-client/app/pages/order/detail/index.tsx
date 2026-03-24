import { OrderStatus, PaymentStatus, RefundStatus, UserRole } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import {
  AlertCircleIcon,
  CopyIcon,
  CreditCardIcon,
  GamepadIcon,
  GiftIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  Printer,
  ReceiptIcon,
  RefreshCwIcon,
  TagIcon,
  XCircleIcon,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import BreadcrumbBasic from '~/components/breadcrumb-basic'
import { userAtom } from '~/store/user'
import { apiClient } from '~/utils/axios'
import { formatPrice } from '~/utils/format'
import type { Route } from './+types'
import CancelTransactionModal from './cancel-transaction-modal'
import PaymentCountdown from './payment-countdown'
import PaymentMethodDisplay from './payment-method-display'
import PrintStruk from './print-struk'
import StatusBadge from './status-badge'

export default function OrderDetailPage({ params }: Route.ComponentProps) {
  const [, setCopiedField] = useState<string | null>(null)
  const [isCanceling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const user = useAtomValue(userAtom)

  const orderDetail = useQuery({
    queryKey: ['orderDetail', params.id],
    queryFn: async () =>
      apiClient
        .get<OrderDetailResponse>(`/order/${params.id}`)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data
        }),
    retry: false,
  })

  const cancelOrder = useMutation({
    mutationKey: ['cancelOrder', params.id],
    mutationFn: async () =>
      apiClient
        .delete(`/order/${params.id}`)
        .then((res) => res.data)
        .catch((error) => {
          throw error.response?.data
        }),
    onSuccess: () => {
      toast.success('Transaksi berhasil dibatalkan')
      orderDetail.refetch()
      setShowCancelModal(false)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Gagal membatalkan transaksi')
      setShowCancelModal(false)
    },
  })

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName)
      toast.success(`${fieldName} disalin ke clipboard`)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const handleChatCS = () => {
    const phoneNumber = '6281234567890' // Ganti dengan nomor WhatsApp CS
    const message = `Halo, saya ingin bertanya tentang transaksi dengan Order ID: ${data?.order_id}`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (orderDetail.isLoading) {
    return (
      <div className="w-full md:max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Memuat detail pesanan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (orderDetail.isError) {
    return (
      <div className="w-full md:max-w-7xl mx-auto">
        <div className="rounded-xl shadow-xs border border-red-200 p-8 dark:border-red-800/30 dark:bg-red-800/10 text-center">
          <XCircleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Gagal Memuat Detail Pesanan</h2>
          <p className="text-muted-foreground mb-4">
            {orderDetail.error?.message || 'Terjadi kesalahan saat memuat detail pesanan'}
          </p>
          <Button onClick={() => orderDetail.refetch()} className="gap-2">
            <RefreshCwIcon className="w-4 h-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  const data = orderDetail.data?.data
  if (!data) return null

  return (
    <div className="w-full md:max-w-7xl mx-auto space-y-4">
      <BreadcrumbBasic
        items={[
          {
            label: 'Home',
            href: '/',
          },
          ...(user.data?.role !== UserRole.GUEST
            ? [
                {
                  label: 'User',
                  href: '/user',
                },
              ]
            : []),
          {
            label: 'Order',
            href: '/user/orders',
          },
          {
            label: params.id,
          },
        ]}
      />
      {/* Header Section */}
      <section id="header" className="flex gap-4 items-center justify-between ">
        <div className="">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Detail Pesanan</h1>
          <p className="text-muted-foreground">Informasi lengkap tentang pesanan Anda</p>
        </div>
        {orderDetail.data?.data.order_status === OrderStatus.COMPLETED && (
          <Button size="icon" variant="link" onClick={() => setShowPrintModal(true)}>
            <Printer className="w-4 h-4" />
          </Button>
        )}
      </section>

      {/* Payment Countdown - Priority Display */}
      {data.payment.expired_at &&
        (data.payment_status === PaymentStatus.PENDING ||
          data.payment_status === PaymentStatus.EXPIRED ||
          data.payment_status === PaymentStatus.FAILED) && (
          <section id="payment-countdown">
            <PaymentCountdown
              expiredAt={data.payment.expired_at}
              paymentStatus={data.payment_status}
            />
          </section>
        )}

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-4">
          {/* Order Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <ReceiptIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Status Pesanan</h2>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {data.order_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(data.order_id, 'Order ID')}
                      className="p-1 h-auto"
                    >
                      <CopyIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.payment_status !== PaymentStatus.SUCCESS && (
                  <StatusBadge type="payment" status={data.payment_status} />
                )}
                {data.payment_status === PaymentStatus.SUCCESS && (
                  <StatusBadge type="order" status={data.order_status} />
                )}

                {data.refund_status !== RefundStatus.NONE && (
                  <StatusBadge type="refund" status={data.refund_status} />
                )}
              </div>
            </div>
          </div>

          {/* Product Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <GamepadIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Informasi Produk</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TagIcon className="w-4 h-4" />
                <span>
                  {data.product.category_name} • {data.product.sub_category_name}
                </span>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">{data.product.name}</h3>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">ID Akun</p>
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1">
                    {data.customer_input}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.customer_input, 'ID Akun')}
                    className="p-1 h-auto"
                  >
                    <CopyIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {data.sn_number && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Serial Number</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded text-sm font-mono flex-1 text-green-800 dark:text-green-400">
                      {data.sn_number}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(data.sn_number, 'Serial Number')}
                      className="p-1 h-auto"
                    >
                      <CopyIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <CreditCardIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Informasi Pembayaran</h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Metode Pembayaran</p>
                <p className="font-medium">{data.payment.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{data.customer_email}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nomor Telepon</p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{data.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Method Display */}
              <PaymentMethodDisplay
                paymentMethod={{
                  name: data.payment.name || 'Metode Pembayaran',
                  type: data.payment.type as any,
                  qr_code: data.payment.qr_code,
                  pay_url: data.payment.pay_url,
                  pay_code: data.payment.pay_code,
                }}
                paymentStatus={data.payment_status}
                orderStatus={data.order_status}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-4 md:sticky md:top-24">
            {/* Price Summary Card */}
            <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <div className="inline-flex gap-2 items-center mb-4">
                <div className="rounded-full p-2 bg-primary">
                  <TagIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Rincian Harga</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Harga Produk</span>
                  <span className="text-sm font-medium">{formatPrice(data.price)}</span>
                </div>

                {data.offers &&
                  data.offers.length > 0 &&
                  data.offers.map((offer) => (
                    <div
                      key={`${offer.name}-${offer.discount_total}`}
                      className="flex justify-between"
                    >
                      <span className="text-sm flex items-center gap-1 text-green-600">
                        <GiftIcon className="w-3 h-3" />
                        {offer.name}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        -{formatPrice(offer.discount_total)}
                      </span>
                    </div>
                  ))}

                <div className="flex justify-between">
                  <span className="text-sm">Biaya Admin</span>
                  <span className="text-sm font-medium">{formatPrice(data.fee)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Pembayaran</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(data.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {data.voucher_code && (
              <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
                <div className="inline-flex gap-2 items-center mb-4">
                  <div className="rounded-full p-2 bg-primary">
                    <AlertCircleIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">Informasi Tambahan</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kode Voucher</p>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono flex-1">
                        {data.voucher_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(data.voucher_code ?? '', 'Kode Voucher')}
                        className="p-1 h-auto"
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleChatCS}
                variant="outline"
                className="flex-1 gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-800/30"
              >
                <MessageCircleIcon className="w-4 h-4" />
                Butuh Bantuan?
              </Button>
              {data.payment_status === PaymentStatus.PENDING && (
                <Button
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  variant="destructive"
                  className="flex-1 w-full gap-2"
                  disabled={isCanceling}
                >
                  <XCircleIcon className="w-4 h-4" />
                  {isCanceling ? 'Membatalkan...' : 'Batalkan Transaksi'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Transaction Confirmation Modal */}
      <CancelTransactionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={cancelOrder.mutate}
        isLoading={cancelOrder.isPending}
        orderId={data.order_id}
      />

      {/* Print Struk Confirmation Modal */}
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent className="max-w-4xl border-gray-200 dark:border-zinc-800 bg-background sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">Cetak Struk Transaksi</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <PrintStruk
              data={{
                trxId: data.order_id,
                date: new Date(data.created_at).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
                productName: data.product.name,
                customerTarget: data.customer_input,
                sn: data.sn_number || '-',
                basePrice: data.total_price,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export interface OrderDetailResponse {
  success: boolean
  message: string
  data: OrderDetailData
}

export interface OrderDetailData {
  order_id: string
  order_status: string
  payment_status: string
  refund_status: string
  price: number
  total_price: number
  discount_price: number
  fee: number
  sn_number: string
  customer_input: string
  customer_email: string
  customer_phone: string
  voucher_code: string | null
  created_at: string
  updated_at: string
  product: OrderDetailProduct
  payment: OrderDetailPayment
  offers: OrderDetailOffer[]
  user: OrderDetailUser
}

export interface OrderDetailProduct {
  name: string
  category_name: string
  sub_category_name: string
  price: number
}

export interface OrderDetailPayment {
  name: string
  type: string
  qr_code: string | null
  pay_url: string | null
  pay_code: string | null
  expired_at: string
}

export interface OrderDetailOffer {
  name: string
  type: string
  discount_percentage: number
  discount_static: number
  discount_maximum: number
  discount_total: number
}

export interface OrderDetailUser {
  email: string
  name: string
}
