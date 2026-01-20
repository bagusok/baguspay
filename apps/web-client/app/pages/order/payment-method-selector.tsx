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

type Props = {
  paymentMethods: PaymentMethod[]
  selectedPayment: PaymentItem | null
  onSelectPayment: (item: PaymentItem) => void
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
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
}: Props) {
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
  )
}
