import { CreateProductCategoryValidator } from '#validators/product'
import { useForm } from '@inertiajs/react'
import { ProductBillingType, ProductCategoryType, ProductFullfillmentType } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { Switch } from '@repo/ui/components/ui/switch'
import { Textarea } from '@repo/ui/components/ui/textarea'
import toast from 'react-hot-toast'
import FileManager from '~/components/file-manager'
import AdminLayout from '~/components/layout/admin-layout'

export default function CreateProductCategory() {
  const { data, errors, setData, post, processing } = useForm<CreateProductCategoryValidator>(
    'createpulsa',
    {
      file_image_id: 'cffe1506-4a45-4ee5-aa7d-eb69748192a9',
      file_icon_id: '',
      file_banner_id: '',
      name: '',
      sub_name: '',
      description: '',
      publisher: '',
      is_available: true,
      is_featured: false,
      label: '',
      delivery_type: 'instant',
      is_seo_enabled: false,
      seo_title: '',
      seo_description: '',
      seo_image_id: '',
      product_billing_type: ProductBillingType.PREPAID,
      type: ProductCategoryType.PULSA,
      product_fullfillment_type: ProductFullfillmentType.AUTOMATIC_DIRECT,
      is_special_feature: false,
      special_feature_key: '',
      tags1: [],
      tags2: [],
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/product-categories/pulsa/create', {
      onSuccess: () => {
        toast.success('Product category created successfully!')
      },
      onError: (errors) => {
        Object.keys(errors).forEach((key) => {
          toast.error(errors[key])
        })
      },
    })
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mt-4">Create Product Category</h2>
      <form className="w-full mx-auto bg-white rounded-lg space-y-4 mt-6" onSubmit={handleSubmit}>
        {/* File Image */}
        <div>
          <Label htmlFor="file_image_id" className="mb-2">
            Image (Large)
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <FileManager onFilesSelected={(file) => setData('file_image_id', file.id)} />
          </div>
          {errors.file_image_id && (
            <p className="text-xs text-red-500 mt-1">{errors.file_image_id}</p>
          )}
        </div>
        {/* File Icon */}
        <div>
          <Label htmlFor="file_icon_id" className="mb-2">
            Image (Icon APK)
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <FileManager onFilesSelected={(file) => setData('file_icon_id', file.id)} />
          </div>
          {errors.file_icon_id && (
            <p className="text-xs text-red-500 mt-1">{errors.file_icon_id}</p>
          )}
        </div>

        {/* File Banner */}
        <div>
          <Label htmlFor="file_banner_id" className="mb-2">
            Banner
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <FileManager onFilesSelected={(file) => setData('file_banner_id', file.id)} />
          </div>
          {errors.file_banner_id && (
            <p className="text-xs text-red-500 mt-1">{errors.file_banner_id}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="name" className="mb-2">
            Name
          </Label>
          <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Sub Name */}
        <div>
          <Label htmlFor="sub_name" className="mb-2">
            Sub Name
          </Label>
          <Input
            id="sub_name"
            value={data.sub_name || ''}
            onChange={(e) => setData('sub_name', e.target.value)}
          />
          {errors.sub_name && <p className="text-xs text-red-500 mt-1">{errors.sub_name}</p>}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Publisher */}
        <div>
          <Label htmlFor="publisher" className="mb-2">
            Publisher
          </Label>
          <Input
            id="publisher"
            value={data.publisher}
            onChange={(e) => setData('publisher', e.target.value)}
          />
          {errors.publisher && <p className="text-xs text-red-500 mt-1">{errors.publisher}</p>}
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={data.is_available}
            onCheckedChange={(val) => setData('is_available', val)}
          />
          <Label htmlFor="is_active" className="mb-2">
            Active
          </Label>
        </div>
        {errors.is_available && <p className="text-xs text-red-500 mt-1">{errors.is_available}</p>}

        {/* Is Featured */}
        <div className="flex items-center gap-2">
          <Switch
            id="is_featured"
            checked={data.is_featured}
            onCheckedChange={(val) => setData('is_featured', val)}
          />
          <Label htmlFor="is_featured" className="mb-2">
            Featured
          </Label>
        </div>
        {errors.is_featured && <p className="text-xs text-red-500 mt-1">{errors.is_featured}</p>}

        {/* Label */}
        <div>
          <Label htmlFor="label" className="mb-2">
            Label
          </Label>
          <Input
            id="label"
            value={data.label || ''}
            onChange={(e) => setData('label', e.target.value)}
          />
          {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
        </div>

        {/* Delivery Type */}
        <div>
          <Label htmlFor="delivery_type" className="mb-2">
            Delivery Type
          </Label>
          <Select
            value={data.delivery_type}
            onValueChange={(val) => setData('delivery_type', val as any)}
          >
            <SelectTrigger id="delivery_type">
              <SelectValue placeholder="Select delivery type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instant</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          {errors.delivery_type && (
            <p className="text-xs text-red-500 mt-1">{errors.delivery_type}</p>
          )}
        </div>
        {/* Billing & Fullfilment Type */}
        <div className="form-group flex gap-4 ">
          {/* <div>
            <Label htmlFor="billing_type" className="mb-2">
              Billing Type
            </Label>
            <Select
              value={data.product_billing_type}
              onValueChange={(val) => setData('product_billing_type', val as any)}
            >
              <SelectTrigger id="product_billing_type">
                <SelectValue placeholder="Select billing type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductBillingType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_billing_type && (
              <p className="text-xs text-red-500 mt-1">{errors.product_billing_type}</p>
            )}
          </div> */}
          <div>
            <Label htmlFor="billing_type" className="mb-2">
              Fullfillment Type
            </Label>
            <Select
              value={data.product_fullfillment_type}
              onValueChange={(val) => setData('product_fullfillment_type', val as any)}
            >
              <SelectTrigger id="product_fullfillment_type">
                <SelectValue placeholder="Select fullfillment type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ProductFullfillmentType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_billing_type && (
              <p className="text-xs text-red-500 mt-1">{errors.product_billing_type}</p>
            )}
          </div>
        </div>

        {/* SEO Enabled */}

        <div className="flex items-center gap-2">
          <Switch
            id="is_seo_enabled"
            checked={data.is_seo_enabled}
            onCheckedChange={(val) => setData('is_seo_enabled', val)}
          />
          <Label htmlFor="is_seo_enabled" className="mb-2">
            Enable SEO
          </Label>
        </div>
        {errors.is_seo_enabled && (
          <p className="text-xs text-red-500 mt-1">{errors.is_seo_enabled}</p>
        )}

        {data.is_seo_enabled && (
          <>
            {/* SEO Title */}
            <div>
              <Label htmlFor="seo_title" className="mb-2">
                SEO Title
              </Label>
              <Input
                id="seo_title"
                value={data.seo_title || ''}
                onChange={(e) => setData('seo_title', e.target.value)}
              />
              {errors.seo_title && <p className="text-xs text-red-500 mt-1">{errors.seo_title}</p>}
            </div>

            {/* SEO Description */}
            <div>
              <Label htmlFor="seo_description" className="mb-2">
                SEO Description
              </Label>
              <Textarea
                id="seo_description"
                value={data.seo_description || ''}
                onChange={(e) => setData('seo_description', e.target.value)}
              />
              {errors.seo_description && (
                <p className="text-xs text-red-500 mt-1">{errors.seo_description}</p>
              )}
            </div>

            {/* SEO Image */}
            <div>
              <Label htmlFor="seo_image_id" className="mb-2">
                SEO Image
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <FileManager onFilesSelected={(file) => setData('seo_image_id', file.id)} />
              </div>
              {errors.seo_image_id && (
                <p className="text-xs text-red-500 mt-1">{errors.seo_image_id}</p>
              )}
            </div>
          </>
        )}

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={processing}>
            {processing ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
