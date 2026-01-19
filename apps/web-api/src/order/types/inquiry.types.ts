import { ProductBillingType, ProductProvider } from '@repo/db/types'

export type GetInquiryFromProviderInput = {
  inquiry_id: string
  amount?: number
  year?: number
  product_provider_name: ProductProvider
  provider_code: string
  billing_type: ProductBillingType
  customer_input: string
}

export type CreateInquiryPostpaidInput = {
  inquiry_id: string
  amount?: number
  year?: number
  product_provider_name: ProductProvider
  provider_code: string
  billing_type: ProductBillingType
  customer_input: string
}
