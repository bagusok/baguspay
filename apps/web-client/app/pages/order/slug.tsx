import { ProductBillingType } from '@repo/db/types'
import { data } from 'react-router'
import z from 'zod'
import { apiClient } from '~/utils/axios'
import type { Route } from './+types/slug'
import OrderSlugPostpaidPage from './slug-postpaid'
import OrderSlugPrepaidPage from './slug-prepaid'

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const slug = params.slug

    if (!slug) {
      throw new Response('Slug not found', { status: 404 })
    }

    const response = await apiClient.get(`/product-categories/slug/${slug}`)

    // console.log(
    //   'Order slug page loaded successfully:',
    //   response.data.data.product_sub_categories[0],
    // )

    return data({
      success: true,
      message: 'Order details loaded successfully',
      data: response?.data.data,
    })
  } catch (_) {
    // console.error('Error loading order slug page:', error)
    return data({
      success: false,
      message: 'Failed to load order details. Please try again later.',
      data: null,
    })
  }
}

export const inquirySchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  voucher_id: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.email('Invalid email format'),
  payment_method_id: z.string().optional(), // Optional, untuk preselection
  input_fields: z
    .array(
      z.object({
        name: z.string().min(1, 'Name is required'),
        value: z.string().min(1, 'Value is required'),
      }),
    )
    .min(1, 'At least one input field is required'),
})

export type InquiryForm = z.infer<typeof inquirySchema>

export type OrderProducts = {
  id: string
  name: string
  image_url: string
  price: number
  is_available: boolean
  is_featured: boolean
  notes: string | null
  stock: number
  billing_type: string
  cut_off_start: string
  cut_off_end: string
  description: string
  label_text: string | null
  sku_code: string
  sub_name: string
  label_image: string | null
  discount: number
  total_price: number
  input_fields?: InputField[]
}

export type ProductSubCategory = {
  id: string
  name: string
  billing_type: string
  products: OrderProducts[]
}

export type InputField = {
  name: string
  title: string
  type: string
  placeholder: string
  is_required: boolean
  options?: Array<{
    label: string
    value: string
  }>
}

export type ProductCategoryData = {
  id: string
  name: string
  description: string | null
  image_url: string
  banner_url?: string
  billing_type: string
  type?: string // e.g., 'pln_postpaid', 'pdam_postpaid', etc.
  product_sub_categories: ProductSubCategory[]
  input_fields: InputField[]
  product_billing_type?: ProductBillingType
}

export type LoaderData = {
  success: boolean
  message: string
  data: ProductCategoryData | null
}

export default function OrderSlugPage({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData

  // Check for specific product types first
  // if (data?.type === 'pln_postpaid') {
  //   return <OrderSlugPlnPostpaidPage data={data} />
  // }

  // Then check billing type
  if (data.product_billing_type === ProductBillingType.POSTPAID) {
    return <OrderSlugPostpaidPage data={data} />
  }

  // Default: render prepaid page component
  return <OrderSlugPrepaidPage data={data} loaderData={loaderData} />
}
