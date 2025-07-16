import { UpdateProductValidator } from '#validators/product'
import { useForm } from '@inertiajs/react'
import { ProductBillingType, ProductFullfillmentType, ProductProvider, tb } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import FileManager from '~/components/file-manager'
import { PencilIcon } from 'lucide-react'
import { apiClient } from '~/utils/axios'
import { InferSelectModel } from '@repo/db'

type Props = {
  productId: string
}

type Product = InferSelectModel<typeof tb.products> & {
  image_id: string
}

export default function EditProductModal({ productId }: Props) {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data, setData, errors, processing, patch } = useForm<UpdateProductValidator>({
    name: '',
    sub_name: '',
    description: '',
    billing_type: ProductBillingType.PREPAID,
    fullfillment_type: ProductFullfillmentType.AUTOMATIC_DIRECT,
    is_available: false,
    is_featured: false,
    label: '',
    label_image: '',
    image_id: '',
    sku_code: '',
    profit_static: 0,
    profit_percentage: 0,
    stock: 0,
    provider_code: '',
    provider_price: 0,
    provider_max_price: 0,
    provider_name: ProductProvider.DIGIFLAZZ,
    provider_input_separator: '',
    notes: '',
  })

  const getProduct = useMutation<{ data: Product }>({
    mutationKey: ['product', productId],
    mutationFn: async () =>
      apiClient
        .get(`/admin/products/${productId}`)
        .then((res) => {
          console.log('Fetched product:', res.data)
          setData({
            name: res.data.data.name,
            sub_name: res.data.data.sub_name,
            description: res.data.data.description,
            billing_type: res.data.data.billing_type,
            fullfillment_type: res.data.data.fullfillment_type,
            is_available: res.data.data.is_available,
            is_featured: res.data.data.is_featured,
            label: res.data.data.label,
            label_image: res.data.data.label_image,
            image_id: res.data.data.image_id,
            sku_code: res.data.data.sku_code,
            profit_static: res.data.data.profit_static,
            profit_percentage: res.data.data.profit_percentage,
            stock: res.data.data.stock,
            provider_code: res.data.data.provider_code,
            provider_price: res.data.data.provider_price,
            provider_max_price: res.data.data.provider_max_price,
            provider_name: res.data.data.provider_name,
            provider_input_separator: res.data.data.provider_input_separator,
            notes: res.data.data.notes,
            cut_off_start: res.data.data.cut_off_start
              ? res.data.data.cut_off_start.slice(0, 5)
              : '00:00',
            cut_off_end: res.data.data.cut_off_end
              ? res.data.data.cut_off_end.slice(0, 5)
              : '00:00',
          })
          return res.data
        })
        .catch((err) => {
          console.error('Error fetching product:', err)
          throw new Error('Failed to fetch product')
        }),
  })

  useEffect(() => {
    if (open) {
      getProduct.mutate()
    }
  }, [open])

  const totalPrice = useMemo(
    () =>
      Number(data.provider_price) +
      Number(data.profit_static) +
      (Number(data.provider_price) * Number(data.profit_percentage)) / 100,
    [data.provider_price, data.profit_static, data.profit_percentage]
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    patch(`/admin/products/${productId}`, {
      onSuccess: () => {
        setOpen(false)
        queryClient.invalidateQueries({ queryKey: ['products'], exact: false })
      },
      onError: () => {
        console.error('Failed to create product', errors)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full md:min-w-2/3">
        <DialogHeader>
          <DialogTitle className="text-start">Edit Product</DialogTitle>
        </DialogHeader>

        {getProduct.isError && (
          <p className="text-red-500 text-center">Failed to load product. Please try again.</p>
        )}
        {getProduct.isPending && <p className="text-center">Loading...</p>}

        {getProduct.isSuccess && (
          <>
            <form className="space-y-4 overflow-y-auto md:max-h-96">
              <div className="w-full">
                <Label className="mb-2" htmlFor="name">
                  Image <span className="text-red-500">*</span>
                </Label>
                <FileManager
                  onFilesSelected={(f) => setData('image_id', f.id)}
                  defaultFileId={getProduct.data?.data.image_id}
                />
                {errors.image_id && <p className="text-red-500 text-sm">{errors.image_id}</p>}
              </div>
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="name">
                    Sub Name
                  </Label>
                  <Input
                    value={data.sub_name}
                    onChange={(e) => setData('sub_name', e.target.value)}
                  />
                  {errors.sub_name && <p className="text-red-500 text-sm">{errors.sub_name}</p>}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="name">
                    Billing Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={data.billing_type}
                    onValueChange={(v) => setData('billing_type', v as ProductBillingType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Billing Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductBillingType.PREPAID}>Prepaid</SelectItem>
                      <SelectItem value={ProductBillingType.POSTPAID}>Postpaid</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.billing_type && (
                    <p className="text-red-500 text-sm">{errors.billing_type}</p>
                  )}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="name">
                    Fullfillment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={data.fullfillment_type}
                    onValueChange={(v) =>
                      setData('fullfillment_type', v as ProductFullfillmentType)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Billing Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductFullfillmentType.AUTOMATIC_DIRECT}>
                        Automatic Direct
                      </SelectItem>
                      <SelectItem value={ProductFullfillmentType.AUTOMATIC_DIRECT_WITH_VOUCHER}>
                        Automatic Direct with Voucher
                      </SelectItem>
                      <SelectItem value={ProductFullfillmentType.MANUAL_DIRECT}>
                        Manual Direct
                      </SelectItem>
                      <SelectItem value={ProductFullfillmentType.MANUAL_DIRECT_WITH_VOUCHER}>
                        Manual Direct with Voucher
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fullfillment_type && (
                    <p className="text-red-500 text-sm">{errors.fullfillment_type}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full flex items-start gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="is_available">Available</Label>
                    <input
                      id="is_available"
                      type="checkbox"
                      role="switch"
                      checked={data.is_available}
                      onChange={(e) => setData('is_available', e.target.checked)}
                      className="accent-primary h-5 w-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="is_featured">Featured</Label>
                    <input
                      id="is_featured"
                      type="checkbox"
                      role="switch"
                      checked={data.is_featured}
                      onChange={(e) => setData('is_featured', e.target.checked)}
                      className="accent-primary h-5 w-10"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="label">
                    Label
                  </Label>
                  <Input value={data.label} onChange={(e) => setData('label', e.target.value)} />
                  {errors.label && <p className="text-red-500 text-sm">{errors.label}</p>}
                </div>
              </div>

              <h4 className="font-semibold mt-6 mb-4">Provider</h4>

              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="provider_name">
                    Provider Name
                  </Label>
                  <Select
                    value={data.provider_name}
                    onValueChange={(v) => setData('provider_name', v as ProductProvider)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductProvider.DIGIFLAZZ}>Digiflazz</SelectItem>
                      <SelectItem value={ProductProvider.ATLANTICH2H}>AtlanticH2H</SelectItem>
                      <SelectItem value={ProductProvider.MOOGOLD}>Moogold</SelectItem>
                      <SelectItem value={ProductProvider.VIPRESELLER}>VIP Reseller</SelectItem>
                      <SelectItem value={ProductProvider.VOCAGAME}>Vocagame</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.provider_name && (
                    <p className="text-red-500 text-sm">{errors.provider_name}</p>
                  )}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="provider_input_separator">
                    Provider Input Separator
                  </Label>
                  <Input
                    value={data.provider_input_separator}
                    onChange={(e) => setData('provider_input_separator', e.target.value)}
                  />
                  {errors.provider_input_separator && (
                    <p className="text-red-500 text-sm">{errors.provider_input_separator}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="sku_code">
                    SKU Code
                  </Label>
                  <Input
                    value={data.sku_code}
                    onChange={(e) => setData('sku_code', e.target.value)}
                  />
                  {errors.sku_code && <p className="text-red-500 text-sm">{errors.sku_code}</p>}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="provider_code">
                    Provider Code
                  </Label>
                  <Input
                    value={data.provider_code}
                    onChange={(e) => setData('provider_code', e.target.value)}
                  />
                  {errors.provider_code && (
                    <p className="text-red-500 text-sm">{errors.provider_code}</p>
                  )}
                </div>
              </div>
              <h4 className="font-semibold mt-6 mb-4">Price</h4>
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="provider_price">
                    Provider Price
                  </Label>
                  <Input
                    type="number"
                    value={data.provider_price}
                    onChange={(e) => setData('provider_price', Number(e.target.value))}
                  />
                  {errors.provider_price && (
                    <p className="text-red-500 text-sm">{errors.provider_price}</p>
                  )}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="provider_max_price">
                    Provider Max Price
                  </Label>
                  <Input
                    type="number"
                    value={data.provider_max_price}
                    onChange={(e) => setData('provider_max_price', Number(e.target.value))}
                  />
                  {errors.provider_max_price && (
                    <p className="text-red-500 text-sm">{errors.provider_max_price}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="profit_static">
                    Profit Static (IDR)
                  </Label>
                  <Input
                    type="number"
                    value={data.profit_static}
                    onChange={(e) => setData('profit_static', Number(e.target.value))}
                  />
                  {errors.profit_static && (
                    <p className="text-red-500 text-sm">{errors.profit_static}</p>
                  )}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="profit_percentage">
                    Profit Percentage (% skala 100)
                  </Label>
                  <Input
                    type="number"
                    value={data.profit_percentage}
                    onChange={(e) => setData('profit_percentage', Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                  {errors.profit_percentage && (
                    <p className="text-red-500 text-sm">{errors.profit_percentage}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="total_price">
                    Total Price
                  </Label>
                  <Input
                    type="number"
                    value={isNaN(totalPrice) ? '' : totalPrice}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="stock">
                    Stock
                  </Label>
                  <Input
                    type="number"
                    value={data.stock}
                    onChange={(e) => setData('stock', Number(e.target.value))}
                  />
                  {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
                </div>
              </div>

              {/* Cut Off Start & End */}
              <div className="flex gap-4">
                <div className="w-full">
                  <Label className="mb-2" htmlFor="cut_off_start">
                    Cut Off Start
                  </Label>
                  <Input
                    id="cut_off_start"
                    type="time"
                    value={data.cut_off_start}
                    onChange={(e) => setData('cut_off_start', e.target.value)}
                  />
                  {errors.cut_off_start && (
                    <p className="text-red-500 text-sm">{errors.cut_off_start}</p>
                  )}
                </div>
                <div className="w-full">
                  <Label className="mb-2" htmlFor="cut_off_end">
                    Cut Off End
                  </Label>
                  <Input
                    id="cut_off_end"
                    type="time"
                    value={data.cut_off_end}
                    onChange={(e) => setData('cut_off_end', e.target.value)}
                  />
                  {errors.cut_off_end && (
                    <p className="text-red-500 text-sm">{errors.cut_off_end}</p>
                  )}
                </div>
              </div>

              <div className="w-full">
                <Label className="mb-2" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
            </form>
            <DialogFooter>
              <Button type="button" disabled={processing} onClick={handleSubmit}>
                {processing ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
