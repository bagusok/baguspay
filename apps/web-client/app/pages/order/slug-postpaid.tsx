import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import {
  InfoIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  PackageIcon,
  ShieldCheckIcon,
  TrendingDownIcon,
  ZapIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { UnderlinedInput, UnderlinedSelect } from '~/components/form-fields'
import Image from '~/components/image'
import VoucherInput from '~/components/voucher-input'
import { useInquiry } from '../../hooks/use-inquiry'
import CheckoutModal from './checkout-modal'
import {
  type InputField,
  type InquiryForm,
  inquirySchema,
  type OrderProducts,
  type ProductCategoryData,
} from './slug'

type Props = {
  data: ProductCategoryData | null
}

export default function OrderSlugPostpaidPage({ data }: Props) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    data?.product_sub_categories[0]?.name || '',
  )
  const [selectedProduct, setSelectedProduct] = useState<OrderProducts | null>(
    data?.product_sub_categories[0]?.products[0] || null,
  )

  const form = useForm<InquiryForm>({
    defaultValues: {
      product_id: selectedProduct?.id || '',
      phone_number: '',
      email: '',
      payment_method_id: '',
      input_fields:
        data?.input_fields?.map((field) => ({
          name: field.name,
          value: '',
        })) || [],
    },
    resolver: zodResolver(inquirySchema),
    mode: 'onChange',
  })

  const {
    inquiry,
    handleInquiry,
    isLoading: isInquiryLoading,
  } = useInquiry({
    form,
    mutationKey: ['inquiry-postpaid', selectedProduct?.id || 'unknown'],
  })

  const { update } = useFieldArray({
    control: form.control,
    name: 'input_fields',
  })

  // Get selected subcategory data
  const currentSubCategory = data?.product_sub_categories.find(
    (sub) => sub.name === selectedSubCategory,
  )

  // Update form when product changes
  useEffect(() => {
    if (selectedProduct) {
      form.setValue('product_id', selectedProduct.id)
    }
  }, [selectedProduct, form])

  const onSubmit = handleInquiry

  // Get inquiry response data
  const inquiryData = inquiry.data?.data

  if (!data) {
    return (
      <div className="w-full md:max-w-7xl mx-auto space-y-4">
        <p className="text-center text-muted-foreground">Product data not found</p>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="w-full md:max-w-7xl mx-auto space-y-4">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-start gap-4 rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
          <div className="w-32 rounded-lg overflow-hidden">
            <Image src={data.image_url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{data.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 text-ellipsis line-clamp-2">
              {data.description || 'No description available.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                <ZapIcon className="w-3 h-3" />
                Cepat
              </Badge>
              <Badge className="rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-800/30 dark:text-pink-500">
                <PackageIcon className="w-3 h-3" />
                Postpaid
              </Badge>
              <Badge className="rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500">
                <ShieldCheckIcon className="w-3 h-3" />
                Aman
              </Badge>
              <Badge className="rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-500">
                <TrendingDownIcon className="w-3 h-3" />
                Murah
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
          <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Pilih kategori dan produk terlebih dahulu, kemudian masukkan data pelanggan untuk
            mengecek tagihan
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column: Product Selection & Customer Data */}
          <div className="space-y-4">
            {/* Dynamic Input Fields Section */}
            {data.input_fields && data.input_fields.length > 0 && (
              <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-6 dark:border-none dark:bg-secondary/40 text-secondary-foreground relative overflow-hidden">
                <div className="inline-flex gap-3 items-center mb-6">
                  <div className="rounded-xl p-2.5 bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 text-primary-foreground">
                    <KeyRoundIcon className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Detail Akun</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  {data.input_fields.map((field: InputField, index: number) => {
                    const isSelect = field.type === 'select'

                    const label = (
                      <>
                        {field.title}
                        {field.is_required && <span className="text-red-500 ml-0.5">*</span>}
                      </>
                    )

                    if (isSelect) {
                      return (
                        <UnderlinedSelect
                          key={field.name}
                          id={field.name}
                          label={label}
                          value={form.watch(`input_fields.${index}.value`)}
                          onValueChange={(value) => {
                            update(index, { name: field.name, value })
                          }}
                          options={field.options || []}
                          placeholder={field.placeholder}
                          error={form.formState.errors.input_fields?.[index]?.value?.message}
                          disabled={isInquiryLoading}
                        />
                      )
                    }

                    return (
                      <UnderlinedInput
                        key={field.name}
                        id={field.name}
                        label={label}
                        type={field.type}
                        placeholder={field.placeholder}
                        {...form.register(`input_fields.${index}.value`)}
                        error={form.formState.errors.input_fields?.[index]?.value?.message}
                        disabled={isInquiryLoading}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <h2 className="text-base font-semibold mb-4">Pilih Produk</h2>

              <div className="space-y-4">
                {/* Subcategory Select */}
                <div className="space-y-2">
                  <UnderlinedSelect
                    label={
                      <>
                        Kategori <span className="text-red-500">*</span>
                      </>
                    }
                    value={selectedSubCategory}
                    onValueChange={(value) => {
                      setSelectedSubCategory(value)
                      const subCat = data?.product_sub_categories.find((sub) => sub.name === value)
                      if (subCat?.products[0]) {
                        setSelectedProduct(subCat.products[0])
                      }
                    }}
                    placeholder="Pilih kategori"
                    options={
                      data?.product_sub_categories.map((subCategory) => ({
                        label: subCategory.name,
                        value: subCategory.name,
                      })) || []
                    }
                  />
                </div>

                {/* Product Select */}
                <div className="space-y-2">
                  <UnderlinedSelect
                    label={
                      <>
                        Produk <span className="text-red-500">*</span>
                      </>
                    }
                    value={selectedProduct?.id || ''}
                    onValueChange={(value) => {
                      const product = currentSubCategory?.products.find((p) => p.id === value)
                      if (product) {
                        setSelectedProduct(product)
                      }
                    }}
                    placeholder="Pilih produk"
                    options={
                      currentSubCategory?.products.map((product) => ({
                        label: product.name,
                        value: product.id,
                      })) || []
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Voucher & Contact */}
          <div className="space-y-4">
            <VoucherInput
              form={form}
              productId={selectedProduct?.id || ''}
              productPrice={selectedProduct?.total_price}
            />

            <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
              <h3 className="text-base font-semibold mb-4">Informasi Kontak</h3>

              <div className="space-y-4">
                <div>
                  <UnderlinedInput
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...form.register('email')}
                    label={
                      <>
                        Email <span className="text-red-500">*</span>
                      </>
                    }
                    error={form.formState.errors.email?.message}
                  />
                </div>

                <div>
                  <UnderlinedInput
                    id="phone_number"
                    type="text"
                    placeholder="08123456789"
                    {...form.register('phone_number')}
                    label="Nomor Telepon (Opsional)"
                    error={form.formState.errors.phone_number?.message}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isInquiryLoading || !form.formState.isValid}
                >
                  {isInquiryLoading ? (
                    <>
                      <LoaderCircleIcon className="w-5 h-5 mr-2 animate-spin" />
                      Mengecek Tagihan...
                    </>
                  ) : (
                    <>
                      <ZapIcon className="w-5 h-5 mr-2" />
                      Cek Tagihan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {inquiry.isSuccess && inquiryData && <CheckoutModal data={inquiryData} />}
    </form>
  )
}
