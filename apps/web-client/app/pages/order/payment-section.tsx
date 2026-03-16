import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { ChevronRightIcon, CreditCardIcon, WalletMinimalIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import toast from 'react-hot-toast'
import { userAtom } from '~/store/user'
import { apiClient } from '~/utils/axios'
import { formatPrice } from '~/utils/format'
import PaymentMethodSelector, {
  type PaymentItem,
  type PaymentMethod,
} from './payment-method-selector'
import type { OrderProducts } from './slug'

type Props = {
  products: OrderProducts | null
  form: UseFormReturn<any>
}

export default function PaymentSection({ products, form }: Props) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const user = useAtomValue(userAtom)

  const paymentMethods = useMutation({
    mutationKey: ['paymentMethods', products?.id],
    mutationFn: async () =>
      apiClient
        .get(`/order/get-product-price/${products!.id}`)
        .then((res) => res.data)
        .catch((error) => {
          throw new Error(error.response?.data?.message || 'Failed to fetch payment methods')
        }),
  })

  const balancePaymentMethod = useMutation({
    mutationKey: ['getBalancePaymentMethod'],
    mutationFn: async () =>
      apiClient
        .get('/payments/methods/balance')
        .then((res) => res.data)
        .catch((error) => {
          throw new Error(error.response?.data?.message || 'Failed to fetch payment methods')
        }),
  })

  useEffect(() => {
    if (products) {
      paymentMethods.mutate()
      balancePaymentMethod.mutate()
      setSelectedPayment(null)
      form.setValue('payment_method_id', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products?.id])

  // Memoized calculations for payment options
  const _isGuest = !user.data?.role || user.data.role === 'guest'

  const paymentOptions = useMemo(() => {
    if (!paymentMethods.isSuccess || !paymentMethods.data?.data) {
      return { cheapestItem: null }
    }

    const paymentMethodsData = paymentMethods.data.data

    // Find cheapest payment
    const allAvailableItems: PaymentItem[] = []
    paymentMethodsData.forEach((method: PaymentMethod) => {
      if (method.items) {
        method.items.forEach((item: PaymentItem) => {
          if (item.is_available) {
            allAvailableItems.push(item)
          }
        })
      }
    })

    const cheapestItem = allAvailableItems.sort((a, b) => a.total_price - b.total_price)[0] || null

    return { cheapestItem }
  }, [paymentMethods.isSuccess, paymentMethods.data])

  // Auto-select payment method after data is loaded
  useEffect(() => {
    if (selectedPayment) return

    // Wait for both APIs to complete before auto-selecting
    if (!paymentMethods.isSuccess || balancePaymentMethod.isPending) return

    const balanceData = balancePaymentMethod.data?.data

    // If user is logged in and balance is sufficient, auto-select balance
    if (
      balanceData?.is_available &&
      products?.price &&
      balanceData.user_balance >= products.price
    ) {
      const balanceItem: PaymentItem = {
        id: balanceData.id,
        name: balanceData.name,
        fee_percentage: 0,
        fee_static: 0,
        is_available: true,
        cut_off_start: '',
        cut_off_end: '',
        image_url: balanceData.image_url,
        label: null,
        is_featured: true,
        min_amount: 0,
        max_amount: Infinity,
        is_need_email: false,
        is_need_phone_number: false,
        total_fee: 0,
        total_price: products.price,
      }
      setSelectedPayment(balanceItem)
      form.setValue('payment_method_id', balanceItem.id)
      return
    }

    // Otherwise, auto-select cheapest available payment
    if (paymentOptions.cheapestItem) {
      const { cheapestItem } = paymentOptions
      setSelectedPayment(cheapestItem)
      form.setValue('payment_method_id', cheapestItem.id)
    }
  }, [
    selectedPayment,
    paymentOptions,
    form,
    balancePaymentMethod.data,
    balancePaymentMethod.isPending,
    paymentMethods.isSuccess,
    products?.price,
  ])

  const handleSelectPayment = (item: PaymentItem) => {
    if (item.is_available) {
      setSelectedPayment(item)
      form.setValue('payment_method_id', item.id)
      setIsModalOpen(false) // Close modal after selection
    }
  }

  // Get payment methods from API response
  const sortedPaymentMethods = useMemo(() => {
    return paymentMethods.data?.data || []
  }, [paymentMethods.data])

  return (
    <div className="rounded-xl shadow-xs border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800/50 text-secondary-foreground">
      <div className="inline-flex gap-3 items-center mb-6">
        <div className="rounded-xl p-2.5 bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 text-primary-foreground">
          <WalletMinimalIcon className="w-5 h-5 text-background" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Metode Pembayaran</h2>
        </div>
      </div>

      {/* Payment Method Display/Selector */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Button
          type="button"
          onClick={() => {
            if (products) {
              setIsModalOpen(true)
            } else {
              toast('Silakan pilih produk terlebih dahulu', {
                icon: '⚠️',
              })
            }
          }}
          variant="outline"
          className="w-full justify-between p-4 h-auto border-dashed border-2 hover:border-primary/50 transition-all duration-200"
        >
          {selectedPayment ? (
            <div className="flex items-center gap-3">
              <img
                src={
                  selectedPayment.image_url.startsWith('http')
                    ? selectedPayment.image_url
                    : `https://is3.cloudhost.id/bagusok${selectedPayment.image_url}`
                }
                alt={selectedPayment.name}
                className="w-10 rounded object-cover"
              />
              <div className="text-left">
                <p className="font-medium text-sm">{selectedPayment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(selectedPayment.total_price)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCardIcon className="w-5 h-5" />
              <span>Pilih Metode Pembayaran</span>
            </div>
          )}
          <ChevronRightIcon className="w-4 h-4" />
        </Button>

        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CreditCardIcon className="w-5 h-5" />
              Pilih Metode Pembayaran
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <PaymentMethodSelector
              paymentMethods={sortedPaymentMethods}
              selectedPayment={selectedPayment}
              onSelectPayment={handleSelectPayment}
              isLoading={paymentMethods.isPending}
              isError={paymentMethods.isError}
              errorMessage={paymentMethods.error?.message}
              balanceData={balancePaymentMethod.data?.data}
              balanceMessage={balancePaymentMethod.data?.message}
              isBalanceLoading={balancePaymentMethod.isPending}
              productPrice={products?.price || 0}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Payment Summary */}
      {selectedPayment && (
        <div className="mt-4 space-y-4">
          {/* Order Summary */}
          {products && (
            <div className="p-3 bg-muted/30 border border-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CreditCardIcon className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Rincian Pesanan</p>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={
                    products.image_url?.startsWith('http')
                      ? products.image_url
                      : `https://is3.cloudhost.id/bagusok${products.image_url}`
                  }
                  alt={products.name}
                  className="w-12 h-12 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{products.name}</p>
                  {products.sub_name && (
                    <p className="text-xs text-muted-foreground">{products.sub_name}</p>
                  )}
                  {products.sku_code && (
                    <p className="text-xs text-muted-foreground">SKU: {products.sku_code}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatPrice(products.price)}</p>
                  <p className="text-xs text-muted-foreground">Qty: 1</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-muted">
                <div className="flex justify-between text-sm">
                  <span>Harga Produk</span>
                  <span>{formatPrice(products.price)}</span>
                </div>

                {selectedPayment.total_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Biaya Admin</span>
                    <span>{formatPrice(selectedPayment.total_fee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold pt-2 border-t border-muted">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">{formatPrice(selectedPayment.total_price)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
