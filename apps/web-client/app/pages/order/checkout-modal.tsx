import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { useMutation, useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue } from 'jotai'
import { ChevronRightIcon, CircleCheckIcon, Clock, CreditCardIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import z from 'zod'
import { apiClient } from '~/utils/axios'
import { formatPrice, formatTime } from '~/utils/format'
import PaymentMethodSelector, {
  type PaymentItem,
  type PaymentMethod,
} from './payment-method-selector'
import type { InquiryForm } from './slug'

type Props = {
  data: InquiryData
}

const checkoutSchema = z.object({
  inquiry_id: z.string(),
  payment_method_id: z.string(),
  payment_phone_number: z.string().optional(),
  checkout_token: z.string(),
})

export type CheckoutData = z.infer<typeof checkoutSchema>

export const isOpenModalCheckout = atom(false)
export const inquiryTimeAtom = atom<number>(Date.now())
export const checkoutTokenAtom = atom<string | null>(null)
export const inquiryIdAtom = atom<string | null>(null)
export const inquiryRequestDataAtom = atom<InquiryForm | null>(null)
export const preselectedPaymentMethodIdAtom = atom<string | null>(null)

export default function CheckoutModal({ data }: Props) {
  const [isOpen, setIsOpen] = useAtom(isOpenModalCheckout)
  const inquiryTime = useAtomValue(inquiryTimeAtom)
  const [timeLeft, setTimeLeft] = useState(360)
  const checkoutToken = useAtomValue(checkoutTokenAtom)
  const inquiryId = useAtomValue(inquiryIdAtom)
  const preselectedPaymentId = useAtomValue(preselectedPaymentMethodIdAtom)
  const navigate = useNavigate()

  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null)
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('')
  const [isPaymentSelectorOpen, setIsPaymentSelectorOpen] = useState(false)

  // Fetch payment methods based on inquiry_id
  const paymentMethods = useQuery({
    queryKey: ['paymentMethods', inquiryId],
    queryFn: async () =>
      apiClient
        .get(`/order/payment-method/${inquiryId}`)
        .then((res) => res.data)
        .catch((error) => {
          throw new Error(error.response?.data?.message || 'Failed to fetch payment methods')
        }),
    enabled: !!inquiryId && isOpen,
  })

  // Fetch balance payment method
  const balancePaymentMethod = useQuery({
    queryKey: ['getBalancePaymentMethod'],
    queryFn: async () =>
      apiClient
        .get('/payments/methods/balance')
        .then((res) => res.data)
        .catch((error) => {
          throw new Error(error.response?.data?.message || 'Failed to fetch balance payment method')
        }),
    enabled: isOpen,
  })

  // Auto-select payment method
  useEffect(() => {
    // Don't re-select if already selected
    if (selectedPayment) return

    // Wait for payment methods to load
    if (!paymentMethods.isSuccess || !paymentMethods.data?.data) return

    const balanceData = balancePaymentMethod.data?.data

    // Build all available items from payment methods
    const allItems: PaymentItem[] = []
    paymentMethods.data.data.forEach((method: PaymentMethod) => {
      if (method.items) {
        allItems.push(...method.items.filter((item: PaymentItem) => item.is_available))
      }
    })

    // Priority 1: If user has preselected a payment method before inquiry, use that
    if (preselectedPaymentId) {
      // Check if preselected is balance
      if (balanceData && preselectedPaymentId === balanceData.id) {
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
          total_price: data.total_price,
        }
        setSelectedPayment(balanceItem)
        return
      }

      // Check in other payment methods
      const preselected = allItems.find((item) => item.id === preselectedPaymentId)
      if (preselected) {
        setSelectedPayment(preselected)
        return
      }
    }

    // Priority 2: If no preselected and balance is sufficient, auto-select balance
    if (
      balanceData &&
      balanceData.is_available &&
      data?.total_price &&
      balanceData.user_balance >= data.total_price
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
        total_price: data.total_price,
      }
      setSelectedPayment(balanceItem)
      return
    }

    // Priority 3: Otherwise select cheapest
    if (allItems.length > 0) {
      const cheapest = allItems.sort((a, b) => a.total_price - b.total_price)[0]
      setSelectedPayment(cheapest)
    }
  }, [
    paymentMethods.isSuccess,
    paymentMethods.data,
    preselectedPaymentId,
    selectedPayment,
    balancePaymentMethod.data,
    data?.total_price,
  ])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsOpen(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, timeLeft, setIsOpen])

  const checkout = useMutation({
    mutationKey: ['checkout'],
    mutationFn: async () => {
      if (!selectedPayment) {
        throw new Error('Please select a payment method')
      }

      const payload: any = {
        inquiry_id: inquiryId,
        payment_method_id: selectedPayment.id,
        checkout_token: checkoutToken,
      }

      if (selectedPayment.is_need_phone_number && paymentPhoneNumber) {
        payload.payment_phone_number = paymentPhoneNumber
      }

      return apiClient
        .post('/order/checkout', payload, {
          headers: {
            'X-Time': inquiryTime,
          },
        })
        .then((res) => res.data)
        .catch((error) => {
          toast.error(error.response?.data?.message || 'Checkout failed')
          throw error
        })
    },
    onSuccess: (data) => {
      toast.success('Checkout successful!')
      setIsOpen(false)
      navigate(`/order/detail/${data.data.order_id}`)
    },
  })

  const handleCheckout = () => {
    if (!selectedPayment) {
      toast.error('Silakan pilih metode pembayaran')
      return
    }

    if (selectedPayment.is_need_phone_number && !paymentPhoneNumber) {
      toast.error('Nomor telepon pembayaran diperlukan')
      return
    }

    checkout.mutate()
  }

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(360)
    }
  }, [isOpen])

  if (!data) return null

  const isTimeRunningOut = timeLeft <= 60 // Last minute warning

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <DialogContent className="max-w-sm mx-auto p-6 gap-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="text-start">Konfirmasi Pesanan</DialogTitle>
          <div
            role="timer"
            aria-live="polite"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              isTimeRunningOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </DialogHeader>

        {/* Content */}
        <div id="dialog-description" className="space-y-6 mt-4">
          {/* Product & Price Summary */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Produk:</span>
              <span className="font-medium text-right">
                {data.product?.category} - {data.product?.name}
              </span>
            </div>

            {/* Bills Detail - for postpaid products */}
            {data.bills && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detail Tagihan
                </h4>

                {data.bills.customer_name && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Nama Pelanggan:</span>
                    <span className="font-medium">{data.bills.customer_name}</span>
                  </div>
                )}

                {(data.bills.tarif || data.bills.daya) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Tarif / Daya:</span>
                    <span className="font-medium">
                      {data.bills.tarif}
                      {data.bills.daya && ` - ${data.bills.daya} VA`}
                    </span>
                  </div>
                )}

                {/* Bill Period Details */}
                {data.bills.detail && data.bills.detail.length > 0 && (
                  <div className="mt-2 pt-2 border-t dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      Periode ({data.bills.lembar_tagihan} Lembar):
                    </p>
                    <div className="space-y-1">
                      {data.bills.detail.map((bill, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-slate-800 rounded px-2 py-1.5 text-xs"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{bill.periode}</span>
                            <span>{formatPrice(Number(bill.nilai_tagihan))}</span>
                          </div>
                          {Number(bill.denda) > 0 && (
                            <div className="flex justify-between text-red-600 dark:text-red-400 mt-0.5">
                              <span>Denda</span>
                              <span>{formatPrice(Number(bill.denda))}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t dark:border-slate-700 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Jumlah Tagihan:</span>
                    <span className="font-medium">{formatPrice(data.bills.jumlah_tagihan)}</span>
                  </div>
                  {data.bills.fee > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Biaya Admin:</span>
                      <span className="font-medium">{formatPrice(data.bills.fee)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input Fields - compact (only show if no bills) */}
            {!data.bills &&
              (data.input_fields ?? []).map((field, index) => (
                <div key={field.name ?? index} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{field.name}:</span>
                  <span className="font-medium text-right max-w-[60%] wrap-break-word">
                    {field.value}
                  </span>
                </div>
              ))}
          </div>

          <hr className="border-slate-300" />

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4 text-gray-600" />
              <Label className="text-sm font-semibold">Metode Pembayaran</Label>
            </div>

            {paymentMethods.isPending && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-xs text-muted-foreground">Memuat...</span>
              </div>
            )}

            {paymentMethods.isError && (
              <div className="text-center py-4">
                <p className="text-destructive text-xs">Error loading payment methods</p>
              </div>
            )}

            {paymentMethods.isSuccess && selectedPayment && (
              <>
                <Button
                  type="button"
                  onClick={() => setIsPaymentSelectorOpen(true)}
                  variant="outline"
                  className="w-full justify-between p-3 h-auto border-dashed border-2 hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedPayment.image_url.startsWith('http')
                          ? selectedPayment.image_url
                          : `https://is3.cloudhost.id/bagusok${selectedPayment.image_url}`
                      }
                      alt={selectedPayment.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div className="text-left">
                      <p className="text-xs font-medium">{selectedPayment.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatPrice(selectedPayment.total_price)}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>

                {/* Payment Selector Dialog */}
                <Dialog open={isPaymentSelectorOpen} onOpenChange={setIsPaymentSelectorOpen}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-foreground">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <CreditCardIcon className="w-5 h-5" />
                        Pilih Metode Pembayaran
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 mt-4">
                      <PaymentMethodSelector
                        paymentMethods={paymentMethods.data.data}
                        selectedPayment={selectedPayment}
                        onSelectPayment={(item) => {
                          setSelectedPayment(item)
                          setIsPaymentSelectorOpen(false)
                        }}
                        isLoading={false}
                        isError={false}
                        balanceData={balancePaymentMethod.data?.data}
                        balanceMessage={balancePaymentMethod.data?.message}
                        isBalanceLoading={balancePaymentMethod.isPending}
                        productPrice={data.total_price}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Payment Phone Number */}
            {selectedPayment?.is_need_phone_number && (
              <div className="space-y-1">
                <Label htmlFor="payment_phone" className="text-xs">
                  Nomor WhatsApp untuk Pembayaran
                </Label>
                <Input
                  id="payment_phone"
                  type="text"
                  placeholder="628123456789"
                  value={paymentPhoneNumber}
                  onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>

          <hr className="border-slate-300" />

          {/* Price Breakdown - Simple */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Harga Produk:</span>
              <span>{formatPrice(data.product_price)}</span>
            </div>

            {selectedPayment && selectedPayment.total_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Admin:</span>
                <span>{formatPrice(selectedPayment.total_fee)}</span>
              </div>
            )}

            {data.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diskon:</span>
                <span className="text-green-600">-{formatPrice(data.discount)}</span>
              </div>
            )}

            {(data.offers ?? []).map((offer, index) => (
              <div key={offer.name ?? index} className="flex justify-between text-xs">
                <span className="text-gray-600">&nbsp; - {offer.name}:</span>
                <span className="text-green-600">-{formatPrice(offer.total_discount)}</span>
              </div>
            ))}

            <hr className="border-slate-300" />

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold text-blue-600">
                {selectedPayment
                  ? formatPrice(selectedPayment.total_price - data.discount)
                  : formatPrice(data.total_price)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4 grid grid-cols-2">
          <DialogClose asChild>
            <Button type="button" className="w-full" variant="destructive" size="sm">
              <XIcon /> Batalkan
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="w-full"
            size="sm"
            onClick={handleCheckout}
            disabled={checkout.isPending || !selectedPayment}
          >
            <CircleCheckIcon />
            {checkout.isPending ? 'Memproses...' : 'Konfirmasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export interface InquiryResponse {
  success: boolean
  message: string
  data: InquiryData
}

export interface InquiryData {
  inquiry_id: string
  product: Product
  payment_method: InquiryPaymentMethodInfo
  offers: Offer[]
  input_fields: InputField[]
  merged_input: string
  product_price: number
  fee: number
  discount: number
  total_price: number
  checkout_token: string
  // PLN Postpaid specific fields (optional)
  customer_name?: string
  customer_id?: string
  power?: string
  bill_period?: string
  bill_amount?: number
  penalty?: number
  admin_fee?: number
  total_amount?: number
  // Bills structure for postpaid products
  bills?: {
    jumlah_tagihan: number
    fee: number
    customer_name?: string
    tarif?: string
    daya?: number
    lembar_tagihan?: number
    detail?: Array<{
      periode: string
      nilai_tagihan: string
      admin: string
      denda: string
    }>
  }
}

export interface Product {
  category: string
  sub_category: string
  name: string
  price: number
}

export interface InquiryPaymentMethodInfo {
  id: string
  name: string
  type: string
}

export interface Offer {
  name: string
  type: string
  discount_percentage: number
  discount_static: number
  discount_maximum: number
  total_discount: number
}

export interface InputField {
  name: string
  value: string
}
