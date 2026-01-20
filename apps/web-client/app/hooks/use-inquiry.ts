import { useAtom, useSetAtom } from 'jotai'
import type { UseFormReturn } from 'react-hook-form'
import { useFormMutation } from '~/hooks/use-form-mutation'
import { apiClient } from '~/utils/axios'
import {
  checkoutTokenAtom,
  inquiryIdAtom,
  inquiryRequestDataAtom,
  inquiryTimeAtom,
  isOpenModalCheckout,
  preselectedPaymentMethodIdAtom,
  type InquiryResponse,
} from '../pages/order/checkout-modal'
import type { InquiryForm } from '../pages/order/slug'

interface UseInquiryOptions {
  form: UseFormReturn<InquiryForm>
  mutationKey?: string[]
}

/**
 * Custom hook untuk handle inquiry logic
 * Bisa digunakan oleh prepaid dan postpaid page
 */
export function useInquiry({ form, mutationKey = ['inquiry'] }: UseInquiryOptions) {
  const [inquiryTime, setInquiryTime] = useAtom(inquiryTimeAtom)
  const setIsOpenModalConfirmation = useSetAtom(isOpenModalCheckout)
  const setCheckoutToken = useSetAtom(checkoutTokenAtom)
  const setInquiryId = useSetAtom(inquiryIdAtom)
  const setInquiryRequestData = useSetAtom(inquiryRequestDataAtom)
  const setPreselectedPaymentId = useSetAtom(preselectedPaymentMethodIdAtom)

  const inquiry = useFormMutation({
    form,
    mutationKey,
    mutationFn: async (formData: InquiryForm) =>
      apiClient
        .post<InquiryResponse>('/order/inquiry', formData, {
          headers: {
            'X-Time': inquiryTime,
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          throw err
        }),
    onSuccess: (data) => {
      setIsOpenModalConfirmation(true)
      setCheckoutToken(data.data.checkout_token)
      setInquiryId(data.data.inquiry_id)
    },
  })

  const handleInquiry = (formData: InquiryForm) => {
    const { voucher_id, payment_method_id, ...rest } = formData

    // Store payment_method_id for preselection in checkout modal
    if (payment_method_id) {
      setPreselectedPaymentId(payment_method_id)
    }

    // Store inquiry request data untuk checkout modal
    setInquiryRequestData(formData)

    // Generate random inquiry time untuk tracking
    if (!inquiryTime) {
      const randomTime = Date.now()
      setInquiryTime(randomTime)
    }

    // Submit inquiry tanpa payment_method_id (karena optional dan bisa diubah di checkout modal)
    inquiry.mutate(rest)
  }

  return {
    inquiry,
    handleInquiry,
    isLoading: inquiry.isPending,
  }
}
