import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { BoltIcon, CheckCircle2Icon, InfoIcon, LoaderCircleIcon, ZapIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Image from '~/components/image'
import { useInquiry } from '~/hooks/use-inquiry'
import CheckoutModal from './checkout-modal'
import { type InquiryForm, inquirySchema, type ProductCategoryData } from './slug'

type Props = {
  data: ProductCategoryData | null
}

export default function OrderSlugPlnPostpaidPage({ data }: Props) {
  const form = useForm<InquiryForm>({
    defaultValues: {
      product_id: data?.product_sub_categories[0]?.products[0]?.id || '',
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
    mutationKey: [
      'inquiry-pln-postpaid',
      data?.product_sub_categories[0]?.products[0]?.id || 'unknown',
    ],
  })

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
              {data.description || 'Bayar tagihan listrik PLN dengan mudah dan cepat'}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="rounded-full text-xs font-medium" variant="default">
                <BoltIcon className="w-3 h-3" />
                Listrik PLN
              </Badge>
              <Badge className="rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                <ZapIcon className="w-3 h-3" />
                Instan
              </Badge>
              <Badge className="rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                <CheckCircle2Icon className="w-3 h-3" />
                Aman & Terpercaya
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
          <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Masukkan nomor meter/ID pelanggan PLN Anda (11-12 digit) untuk mengecek tagihan
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Customer ID Input Section */}
          <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <div className="inline-flex gap-2 items-center mb-4">
              <div className="rounded-full p-2 bg-primary">
                <BoltIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-base font-semibold">ID Pelanggan</h2>
            </div>

            <div className="space-y-4">
              {/* Dynamic Input Fields */}
              {data.input_fields.map((field, index) => (
                <div key={field.name} className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    {field.title}
                    {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    type={field.type}
                    id={field.name}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg dark:border-none"
                    {...form.register(`input_fields.${index}.value`)}
                    disabled={isInquiryLoading}
                  />
                  {form.formState.errors.input_fields?.[index]?.value && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.input_fields[index]?.value?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="w-full h-fit rounded-xl shadow-xs border border-gray-200 p-4 dark:border-none dark:bg-secondary text-secondary-foreground">
            <h3 className="text-base font-semibold mb-4">Informasi Kontak</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  className="w-full mt-2 rounded-lg dark:border-none"
                  placeholder="user@example.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number" className="text-sm font-medium">
                  Nomor Telepon (Opsional)
                </Label>
                <Input
                  type="text"
                  id="phone_number"
                  className="w-full mt-2 rounded-lg dark:border-none"
                  placeholder="08123456789"
                  {...form.register('phone_number')}
                />
                {form.formState.errors.phone_number && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.phone_number.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
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
                    <BoltIcon className="w-5 h-5 mr-2" />
                    Cek Tagihan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {inquiry.isSuccess && inquiryData && <CheckoutModal data={inquiryData} />}
    </form>
  )
}
