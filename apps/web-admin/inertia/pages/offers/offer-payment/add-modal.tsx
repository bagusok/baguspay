import { AddOfferPaymentMethodValidator } from '#validators/offer'
import { router } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import AsyncSelect from 'react-select/async'
import { apiClient } from '~/utils/axios'

interface PaymentOption {
  value: string // payment.id
  label: string // payment.name or payment.email
}

export default function AddOfferPaymentModal({ offerId }: { offerId: string }) {
  const [selectedPayments, setSelectedPayments] = useState<PaymentOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const loadPaymentOptions = async (inputValue: string): Promise<PaymentOption[]> => {
    if (!inputValue) return []
    const res = await apiClient.get(`/admin/payments/methods/get-json`, {
      params: { searchQuery: inputValue },
    })
    return res.data.data.map((payment: any) => ({
      value: payment.id,
      label: `${payment.name} (${payment.provider_name})`,
    }))
  }

  const handleSubmit = async () => {
    router.post<AddOfferPaymentMethodValidator>(
      `/admin/offers/${offerId}/connect/payment-method`,
      {
        payments: selectedPayments.map((payment) => ({ payment_method_id: payment.value })),
      },
      {
        onStart: () => setIsLoading(true),
        onSuccess: () => {
          setSelectedPayments([])
          setIsLoading(false)
          router.reload()
          queryClient.invalidateQueries({ queryKey: ['offerPayments', offerId], exact: false })
        },
        onError: () => setIsLoading(false),
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment to Offer</DialogTitle>
        </DialogHeader>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadPaymentOptions}
          isMulti
          value={selectedPayments}
          onChange={(options) => setSelectedPayments(options as PaymentOption[])}
          placeholder="Search and select payments..."
          className="mb-4"
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setSelectedPayments([])}>
            Clear
          </Button>
          <Button
            type="button"
            disabled={isLoading || selectedPayments.length === 0}
            onClick={handleSubmit}
          >
            {isLoading ? 'Adding...' : 'Add Payments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
