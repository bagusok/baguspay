import OfferController from '#controllers/offer_controller'
import { UpdateOfferValidator } from '#validators/offer'
import { InferPageProps } from '@adonisjs/inertia/types'
import { useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Textarea } from '@repo/ui/components/ui/textarea'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { FormEvent } from 'react'
import FileManager from '~/components/file-manager'
import AdminLayout from '~/components/layout/admin-layout'
import OfferPaymentSection from '../offer-payment'
import OfferProductSection from '../offer-product'
import OfferUserSection from '../offer-user'

dayjs.extend(utc)

type Props = InferPageProps<OfferController, 'editDiscount'>

export default function EditOfferDiscount({ offer }: Props) {
  const { data, setData, errors, processing, patch } = useForm<UpdateOfferValidator>({
    name: offer.name || '',
    sub_name: offer.sub_name || '',
    image_id: offer.image_id || '',
    description: offer.description || '',
    code: offer.code || '',
    quota: offer.quota || 0,
    discount_static: offer.discount_static || 0,
    discount_percentage: offer.discount_percentage || 0,
    discount_maximum: offer.discount_maximum || 0,
    start_date: offer.start_date ? new Date(offer.start_date) : new Date(),
    end_date: offer.end_date ? new Date(offer.end_date) : new Date(),
    is_available: offer.is_available || false,
    is_featured: offer.is_featured || false,
    is_all_users: offer.is_all_users || false,
    is_all_payment_methods: offer.is_all_payment_methods || false,
    is_all_products: offer.is_all_products || false,
    is_deleted: offer.is_deleted || false,
    is_need_redeem: offer.is_need_reedem || false,
    is_new_user: offer.is_new_user || false,
    label: offer.label || '',
    min_amount: offer.min_amount || 0,
    usage_limit: offer.usage_limit || 0,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    patch(`/admin/offers/${offer.id}/edit`, {
      preserveScroll: true,
    })
  }

  return (
    <AdminLayout>
      <div className="">
        <h1 className="text-2xl font-bold mb-6">Edit Discount</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="image_url">
              Image <span className="text-red-500">*</span>
            </Label>
            <FileManager
              onFilesSelected={(f) => setData('image_id', f.id)}
              defaultFileId={data.image_id}
            />
            {errors.image_id && <p className="text-red-500 text-sm">{errors.image_id}</p>}
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Label htmlFor="code">
                Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
              />
              {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
            </div>
            <div className="w-full">
              <Label htmlFor="quota">
                Quota <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quota"
                type="number"
                value={data.quota}
                onChange={(e) => setData('quota', Number(e.target.value))}
              />
              {errors.quota && <p className="text-red-500 text-sm">{errors.quota}</p>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Label htmlFor="discount_static">Discount Static</Label>
              <Input
                id="discount_static"
                type="number"
                value={data.discount_static}
                onChange={(e) => setData('discount_static', Number(e.target.value))}
              />
              {errors.discount_static && (
                <p className="text-red-500 text-sm">{errors.discount_static}</p>
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="discount_percentage">Discount %</Label>
              <Input
                id="discount_percentage"
                type="number"
                value={data.discount_percentage}
                onChange={(e) => setData('discount_percentage', Number(e.target.value))}
                min={0}
                max={100}
              />
              {errors.discount_percentage && (
                <p className="text-red-500 text-sm">{errors.discount_percentage}</p>
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="discount_maximum">Discount Maximum</Label>
              <Input
                id="discount_maximum"
                type="number"
                value={data.discount_maximum}
                onChange={(e) => setData('discount_maximum', Number(e.target.value))}
              />
              {errors.discount_maximum && (
                <p className="text-red-500 text-sm">{errors.discount_maximum}</p>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-full">
              <Label htmlFor="end_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={
                  typeof data.start_date === 'string'
                    ? data.start_date
                    : dayjs(data.start_date).format('YYYY-MM-DDTHH:mm')
                }
                onChange={(e) => setData('start_date', new Date(e.target.value))}
              />
              {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
            </div>
            <div className="w-full">
              <Label htmlFor="end_date">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={
                  typeof data.end_date === 'string'
                    ? data.end_date
                    : dayjs(data.end_date).format('YYYY-MM-DDTHH:mm')
                }
                onChange={(e) => setData('end_date', new Date(e.target.value))}
              />
              {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                id="is_available"
                type="checkbox"
                checked={data.is_available}
                onChange={(e) => setData('is_available', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_available">Available</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_all_payment_methods"
                type="checkbox"
                checked={data.is_all_payment_methods}
                onChange={(e) => setData('is_all_payment_methods', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_all_payment_methods">All Payment Methods</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_all_products"
                type="checkbox"
                checked={data.is_all_products}
                onChange={(e) => setData('is_all_products', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_all_products">All Products</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_allow_guest"
                type="checkbox"
                checked={data.is_allow_guest}
                onChange={(e) => setData('is_allow_guest', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_allow_guest">Allow Guest</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_unlimited_date"
                type="checkbox"
                checked={data.is_unlimited_date}
                onChange={(e) => setData('is_unlimited_date', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_unlimited_date">Unlimited Date</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_unlimited_quota"
                type="checkbox"
                checked={data.is_unlimited_quota}
                onChange={(e) => setData('is_unlimited_quota', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_unlimited_quota">Unlimited Quota</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_combinable_with_voucher"
                type="checkbox"
                checked={data.is_combinable_with_voucher}
                onChange={(e) => setData('is_combinable_with_voucher', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_combinable_with_voucher">Combinable with Voucher</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-full">
              <Label htmlFor="usage_limit">
                Usage Per User <span className="text-red-500">*</span>
              </Label>
              <Input
                id="usage_limit"
                type="number"
                value={data.usage_limit}
                onChange={(e) => setData('usage_limit', Number(e.target.value))}
                min={1}
              />
              {errors.usage_limit && <p className="text-red-500 text-sm">{errors.usage_limit}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>
          <Button type="submit" disabled={processing}>
            {processing ? 'Saving..' : 'Save'}
          </Button>
        </form>
      </div>
      <div className="mt-6">
        <h3 className="text-lg fon-semibold">Offer Policy</h3>
        <Tabs defaultValue="users" className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            {data.is_all_users ? (
              <p className="text-sm text-gray-500">This offer is available for all users.</p>
            ) : (
              <OfferUserSection offerId={offer.id} />
            )}
          </TabsContent>
          <TabsContent value="products">
            {data.is_all_products ? (
              <p className="text-sm text-gray-500">This offer is available for all products.</p>
            ) : (
              <OfferProductSection offerId={offer.id} />
            )}
          </TabsContent>
          <TabsContent value="payments">
            {data.is_all_payment_methods ? (
              <p className="text-sm text-gray-500">
                This offer is available for all payment methods.
              </p>
            ) : (
              <OfferPaymentSection offerId={offer.id} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
