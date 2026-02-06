import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/ui/accordion'
import { Badge } from '@repo/ui/components/ui/badge'
import {
  BuildingIcon,
  CreditCardIcon,
  LogInIcon,
  SmartphoneIcon,
  StarIcon,
  StoreIcon,
  WalletIcon,
} from 'lucide-react'
import { formatPrice } from '~/utils/format'

export type PaymentItem = {
  id: string
  name: string
  fee_percentage: number
  fee_static: number
  is_available: boolean
  cut_off_start: string
  cut_off_end: string
  image_url: string
  label: string | null
  is_featured: boolean
  min_amount: number
  max_amount: number
  is_need_email: boolean
  is_need_phone_number: boolean
  total_fee: number
  total_price: number
}

export type PaymentMethod = {
  name: string
  items: PaymentItem[]
}

export type BalancePaymentData = {
  id: string
  name: string
  type: string
  is_available: boolean
  image_url: string
  user_balance: number
} | null

type Props = {
  paymentMethods: PaymentMethod[]
  selectedPayment: PaymentItem | null
  onSelectPayment: (item: PaymentItem) => void
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  balanceData?: BalancePaymentData
  balanceMessage?: string
  isBalanceLoading?: boolean
  productPrice?: number
}

const getPaymentIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'balance':
      return <WalletIcon className="w-5 h-5" />
    case 'qris':
      return <SmartphoneIcon className="w-5 h-5" />
    case 'transfer bank':
      return <BuildingIcon className="w-5 h-5" />
    case 'e wallet':
      return <CreditCardIcon className="w-5 h-5" />
    case 'gerai retail':
      return <StoreIcon className="w-5 h-5" />
    default:
      return <CreditCardIcon className="w-5 h-5" />
  }
}

export default function PaymentMethodSelector({
  paymentMethods,
  selectedPayment,
  onSelectPayment,
  isLoading = false,
  isError = false,
  errorMessage = 'Error loading payment methods',
  balanceData,
  balanceMessage,
  isBalanceLoading = false,
  productPrice = 0,
}: Props) {
  // Convert balance data to PaymentItem format for selection
  const handleBalanceSelect = () => {
    if (balanceData?.is_available && balanceData.user_balance >= productPrice) {
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
        total_price: productPrice,
      }
      onSelectPayment(balanceItem)
    }
  }

  const isBalanceSelected = selectedPayment?.id === balanceData?.id
  const isBalanceSufficient = balanceData ? balanceData.user_balance >= productPrice : false

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Memuat metode pembayaran...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive text-sm">{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Balance Payment Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20 text-primary shrink-0">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium">Saldo</p>
              <p className="text-xs text-muted-foreground">Bayar dengan saldo akun Anda</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {isBalanceLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Memuat saldo...</span>
            </div>
          ) : balanceData ? (
            <div
              onClick={handleBalanceSelect}
              className={`
                relative p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${
                  isBalanceSelected
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20 dark:bg-primary/10 dark:border-primary/60'
                    : 'border-slate-400 hover:border-primary/50 dark:hover:border-primary/40'
                }
                ${!isBalanceSufficient ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'}
              `}
            >
              {!isBalanceSufficient && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                  <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                    Saldo Tidak Cukup
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={balanceData.image_url}
                    alt={balanceData.name}
                    className="w-12 object-cover rounded"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <StarIcon className="w-2 h-2 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{balanceData.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      Tanpa Biaya Admin
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saldo Anda:{' '}
                    <span className="font-semibold text-primary">
                      {formatPrice(balanceData.user_balance)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end justify-center text-right shrink-0">
                  <p className="text-lg font-bold text-primary">{formatPrice(productPrice)}</p>
                  <p className="text-xs text-green-600">Gratis admin</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-400 bg-muted/30">
              <div className="p-2 rounded-full bg-muted text-muted-foreground shrink-0">
                <LogInIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-muted-foreground">
                  Login untuk menggunakan saldo
                </p>
                <p className="text-xs text-muted-foreground">
                  {balanceMessage || 'Silakan login untuk melihat saldo Anda'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Atau pilih metode lain</span>
        </div>
      </div>

      {/* Other Payment Methods */}
      <Accordion type="multiple" className="w-full space-y-2">
        {paymentMethods.map((method: PaymentMethod) => {
          const hasItems = method.items && method.items.length > 0

          return (
            <AccordionItem
              key={method.name}
              value={method.name}
              className="border border-border dark:border-slate-400 rounded-lg"
              disabled={!hasItems}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                    {getPaymentIcon(method.name)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {hasItems ? `${method.items.length} opsi tersedia` : 'Tidak tersedia'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {method.items.some((item) => item.is_featured) && (
                      <Badge variant="secondary" className="text-xs">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Rekomendasi
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              {hasItems && (
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2 pt-2">
                    {method.items.map((item: PaymentItem) => {
                      const itemAvailable = item.is_available

                      return (
                        <div
                          key={item.id}
                          onClick={() => itemAvailable && onSelectPayment(item)}
                          className={`
                          relative p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                          ${
                            selectedPayment?.id === item.id
                              ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20 dark:bg-primary/10 dark:border-primary/60'
                              : 'border-slate-400 hover:border-primary/50 dark:hover:border-primary/40 dark:hover:opacity-65'
                          }
                          ${
                            !itemAvailable
                              ? 'opacity-60 cursor-not-allowed grayscale'
                              : 'hover:shadow-sm'
                          }
                        `}
                        >
                          {/* Unavailable Overlay */}
                          {!itemAvailable && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                              <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                                Tidak Tersedia
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={
                                  item.image_url.startsWith('http')
                                    ? item.image_url
                                    : `https://is3.cloudhost.id/bagusok${item.image_url}`
                                }
                                alt={item.name}
                                className="w-12 object-cover"
                              />
                              {item.is_featured && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <StarIcon className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                {item.label && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs shrink-0 dark:border-gray-500 dark:text-gray-300"
                                  >
                                    {item.label}
                                  </Badge>
                                )}
                              </div>

                              {/* Show payment fee if exists */}
                              {item.total_fee > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Biaya admin: {formatPrice(item.total_fee)}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end justify-center text-right shrink-0">
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(item.total_price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
