import { useForm } from '@inertiajs/react'
import { InsertOfferValidator } from '#validators/offer'
import AdminLayout from '~/components/layout/admin-layout'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { FormEvent } from 'react'
import FileManager from '~/components/file-manager'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

type Form = Omit<InsertOfferValidator, 'start_date' | 'end_date'> & {
  start_date: string | Date
  end_date: string | Date
}

export default function CreateOffer() {
  const { data, setData, errors, processing, post } = useForm<Form>('create-offer-form', {
    name: '',
    sub_name: '',
    image_id: '',
    description: '',
    code: '',
    quota: 0,
    discount_static: 0,
    discount_percentage: 0,
    discount_maximum: 0,
    start_date: dayjs().utc().toISOString(),
    end_date: dayjs().utc().toISOString(),
    is_available: false,
    is_featured: false,
    label: '',
    is_all_users: false,
    is_all_payment_methods: false,
    is_all_products: false,
    is_deleted: false,
    is_need_redeem: false,
    is_new_user: false,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    post('/admin/offers/create', {
      preserveScroll: true,
    })
  }

  return (
    <AdminLayout>
      <div className="">
        <h1 className="text-2xl font-bold mb-6">Create Offer</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="image_url">
              Image <span className="text-red-500">*</span>
            </Label>
            <FileManager onFilesSelected={(f) => setData('image_id', f.id)} />
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
            <div className="w-full">
              <Label htmlFor="sub_name">Sub Name</Label>
              <Input
                id="sub_name"
                value={data.sub_name}
                onChange={(e) => setData('sub_name', e.target.value)}
              />
              {errors.sub_name && <p className="text-red-500 text-sm">{errors.sub_name}</p>}
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
                id="is_featured"
                type="checkbox"
                checked={data.is_featured}
                onChange={(e) => setData('is_featured', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_all_users"
                type="checkbox"
                checked={data.is_all_users}
                onChange={(e) => setData('is_all_users', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_all_users">All Users</Label>
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
                id="is_deleted"
                type="checkbox"
                checked={data.is_deleted}
                onChange={(e) => setData('is_deleted', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_deleted">Deleted</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_need_redeem"
                type="checkbox"
                checked={data.is_need_redeem}
                onChange={(e) => setData('is_need_redeem', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_need_redeem">Need Redeem</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_new_user"
                type="checkbox"
                checked={data.is_new_user}
                onChange={(e) => setData('is_new_user', e.target.checked)}
                className="accent-primary h-5 w-5"
              />
              <Label htmlFor="is_new_user">New User</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={data.label}
              onChange={(e) => setData('label', e.target.value)}
            />
            {errors.label && <p className="text-red-500 text-sm">{errors.label}</p>}
          </div>
          <Button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create Offer'}
          </Button>
        </form>
      </div>
    </AdminLayout>
  )
}
