import { Button } from '@repo/ui/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ClockIcon, Loader2Icon, SearchIcon, TicketCheckIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { UnderlinedInput } from '~/components/form-fields'
import LinkWithLocale from '~/components/link'
import { apiClient } from '~/utils/axios'
import { formatDate, formatPrice } from '~/utils/format'

export default function CheckOrderPage() {
  const [orderId, setOrderId] = useState('')

  const checkOrder = useMutation({
    mutationKey: ['check-order'],
    mutationFn: async (orderId: string) =>
      apiClient.get(`/order/check/${orderId}`).then((res) => res.data),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) {
      toast.error('Order ID tidak boleh kosong')
      return
    }
    checkOrder.mutate(orderId)
  }

  return (
    <div className="md:max-w-7xl mx-auto">
      {/* Hero */}
      <section className="text-center relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-secondary/10 to-transparent p-6 md:p-10 border border-border">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-xs md:text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            Cek Status Order
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Lacak Pesanan Anda
          </h1>
          <p className="mt-3 md:mt-8 text-sm md:text-base text-muted-foreground">
            Masukkan Order ID untuk melihat status terbaru dari pesanan Anda.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </section>

      {/* Form */}
      <section className="mt-8 rounded-xl border border-border bg-card p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2 text-center">
              <UnderlinedInput
                label="Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                id="orderId"
                placeholder="Contoh: T1234XXXXXX"
                name="orderId"
                autoComplete="off"
                className="text-center"
              />

              <p className="text-xs text-muted-foreground italic">
                * Hanya masukkan Order ID tanpa spasi. Contoh bisa ditemukan pada email/riwayat
                pesanan Anda.
              </p>

              <Button
                type="submit"
                disabled={checkOrder.isPending}
                className="shrink-0 mt-6"
                variant="default"
                size="lg"
              >
                {checkOrder.isPending ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <SearchIcon className="size-4" />
                    Cek Transaksi
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* Result */}
      <section className="mt-6">
        {checkOrder.isPending && (
          <div className="text-center justify-center rounded-xl border border-border p-6 flex items-center gap-3">
            <Loader2Icon className="size-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Mengambil data pesanan...</span>
          </div>
        )}

        {checkOrder.isError && (
          <div className="text-center rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
            {isAxiosError(checkOrder.error) && checkOrder.error.response?.status === 404
              ? 'Order ID tidak ditemukan. Periksa kembali dan coba lagi.'
              : 'Terjadi kesalahan saat memeriksa pesanan. Silakan coba lagi.'}
          </div>
        )}

        {checkOrder.isSuccess && (
          <article className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TicketCheckIcon className="size-5 text-primary" />
                <h2 className="font-semibold">Order #{checkOrder.data.data.order_id}</h2>
              </div>
              <Button asChild>
                <LinkWithLocale
                  to={`/order/detail/${checkOrder.data.data.order_id}`}
                  className="text-sm"
                >
                  Lihat Detail
                </LinkWithLocale>
              </Button>
              {/* {getStatusBadge(result.order_status, result.payment_status)} */}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-medium break-all">{checkOrder.data.data.order_id}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Status Pembayaran</p>
                <p className="font-medium capitalize">{checkOrder.data.data.payment_status}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Status Order</p>
                <p className="font-medium capitalize">{checkOrder.data.data.order_status}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">{formatPrice(checkOrder.data.data.total_price)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ClockIcon className="size-4" />
              <time>Dibuat pada {formatDate(checkOrder.data.data.created_at)}</time>
            </div>
          </article>
        )}
      </section>
    </div>
  )
}
