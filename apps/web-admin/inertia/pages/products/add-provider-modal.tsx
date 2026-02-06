import { ProductBillingType, ProductFullfillmentType, ProductProvider } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from '@repo/ui/components/ui/switch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import FileManager from '~/components/file-manager'
import { apiClient } from '~/utils/axios'

type DigiflazzProductPrepaid = {
  product_name: string
  category: string
  brand: string
  type: string
  seller_name: string
  price: number
  buyer_sku_code: string
  buyer_product_status: boolean
  seller_product_status: boolean
  unlimited_stock: boolean
  stock: number
  multi: boolean
  start_cut_off: string
  end_cut_off: string
  desc: string
}

type Props = {
  productSubCategoryId: string
  subCategoryName?: string | null
  isSubCategoryActive: boolean
}

export default function AddProviderProductsModal({
  productSubCategoryId,
  subCategoryName,
  isSubCategoryActive,
}: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [provider, setProvider] = useState<ProductProvider>(ProductProvider.DIGIFLAZZ)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [profitStatic, setProfitStatic] = useState(0)
  const [profitPercentage, setProfitPercentage] = useState(0)
  const [maxPriceMode, setMaxPriceMode] = useState<'provider' | 'total'>('provider')
  const [stockMode, setStockMode] = useState<'provider' | 'manual'>('provider')
  const [stockOverride, setStockOverride] = useState(0)
  const [imageId, setImageId] = useState('')
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes])
  const [skipExisting, setSkipExisting] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const providerProducts = useQuery<{ data: DigiflazzProductPrepaid[] }>({
    queryKey: ['digiflazz-products', provider],
    queryFn: async () =>
      apiClient
        .get('/admin/providers/digiflazz/products', {
          params: { billingType: 'prepaid' },
        })
        .then((res) => res.data),
    enabled: open && provider === ProductProvider.DIGIFLAZZ,
    retry: 1,
  })

  const existingCodesQuery = useQuery<{ codes: string[] }>({
    queryKey: ['existing-product-codes', productSubCategoryId, provider],
    queryFn: async () =>
      apiClient
        .get('/admin/products/existing', {
          params: {
            productSubCategoryId,
            providerName: provider,
          },
        })
        .then((res) => res.data),
    enabled: open,
  })

  const existingCodes = useMemo(
    () => new Set(existingCodesQuery.data?.codes ?? []),
    [existingCodesQuery.data?.codes],
  )

  const options = useMemo(() => {
    const list = providerProducts.data?.data ?? []
    const categories = Array.from(new Set(list.map((item) => item.category))).sort()

    const brandBase =
      categoryFilter === 'all' ? list : list.filter((item) => item.category === categoryFilter)
    const brands = Array.from(new Set(brandBase.map((item) => item.brand))).sort()

    const typeBase =
      brandFilter === 'all' ? brandBase : brandBase.filter((item) => item.brand === brandFilter)
    const types = Array.from(new Set(typeBase.map((item) => item.type))).sort()

    return { categories, brands, types }
  }, [providerProducts.data?.data, categoryFilter, brandFilter])

  const filteredProducts = useMemo(() => {
    const list = providerProducts.data?.data ?? []
    return list.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (brandFilter !== 'all' && item.brand !== brandFilter) return false
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (deferredSearch) {
        const target = `${item.product_name} ${item.buyer_sku_code} ${item.brand}`.toLowerCase()
        if (!target.includes(deferredSearch.toLowerCase())) return false
      }
      if (skipExisting && existingCodes.has(item.buyer_sku_code)) return false
      return true
    })
  }, [
    providerProducts.data?.data,
    categoryFilter,
    brandFilter,
    typeFilter,
    deferredSearch,
    skipExisting,
    existingCodes,
  ])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => Number(a.price) - Number(b.price))
  }, [filteredProducts])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const pageSafe = Math.min(page, totalPages)
  const pagedProducts = useMemo(() => {
    const start = (pageSafe - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, pageSafe, pageSize])

  const toggleSelection = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    )
  }

  const resetPaging = () => setPage(1)

  const addProducts = useMutation({
    mutationFn: async () => {
      if (!imageId) {
        throw new Error('Please select an image first')
      }
      const selectedItems = filteredProducts.filter((item) =>
        selectedCodes.includes(item.buyer_sku_code),
      )
      for (const item of selectedItems) {
        if (existingCodes.has(item.buyer_sku_code)) {
          continue
        }
        const totalPrice =
          Number(item.price) +
          Number(profitStatic) +
          (Number(item.price) * Number(profitPercentage)) / 100
        const providerMaxPrice =
          maxPriceMode === 'total' ? Math.ceil(totalPrice) : Number(item.price)
        const stockValue =
          stockMode === 'manual' ? Number(stockOverride) : item.unlimited_stock ? 0 : item.stock
        await apiClient.post('/admin/products', {
          product_sub_category_id: productSubCategoryId,
          name: item.product_name.slice(0, 100),
          sub_name: '',
          description: (item.desc || '').slice(0, 100),
          is_available: item.buyer_product_status && item.seller_product_status,
          is_featured: false,
          label: '',
          label_image: '',
          image_id: imageId,
          sku_code: item.buyer_sku_code.slice(0, 15),
          profit_static: profitStatic,
          profit_percentage: profitPercentage,
          stock: stockValue,
          provider_code: item.buyer_sku_code,
          provider_name: ProductProvider.DIGIFLAZZ,
          provider_price: item.price,
          provider_max_price: providerMaxPrice,
          provider_input_separator: '',
          notes: (item.desc || '').slice(0, 100),
          cut_off_start: item.start_cut_off || '00:00',
          cut_off_end: item.end_cut_off || '00:00',
          billing_type: ProductBillingType.PREPAID,
          fullfillment_type: ProductFullfillmentType.AUTOMATIC_DIRECT,
        })
      }
    },
    onSuccess: () => {
      toast.success('Products added successfully')
      setSelectedCodes([])
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false })
      queryClient.invalidateQueries({
        queryKey: ['existing-product-codes', productSubCategoryId, provider],
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to add products')
    },
  })

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setSelectedCodes([])
      setSearch('')
      setPage(1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={!isSubCategoryActive}>
          Add from Provider
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90vw] md:max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Products from Provider</DialogTitle>
          <DialogDescription>
            {subCategoryName ? `Sub Category: ${subCategoryName}` : 'Select products to add'}
          </DialogDescription>
        </DialogHeader>

        {!isSubCategoryActive ? (
          <div className="text-sm text-muted-foreground">Sub category is not active.</div>
        ) : (
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as ProductProvider)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductProvider.DIGIFLAZZ}>Digiflazz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product Image</Label>
                <FileManager onFilesSelected={(file) => setImageId(file.id)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Profit Static (IDR)</Label>
                <Input
                  type="number"
                  value={profitStatic}
                  onChange={(e) => setProfitStatic(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Profit Percentage (%)</Label>
                <Input
                  type="number"
                  value={profitPercentage}
                  onChange={(e) => setProfitPercentage(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Provider Max Price</Label>
                <Select
                  value={maxPriceMode}
                  onValueChange={(v) => setMaxPriceMode(v as 'provider' | 'total')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select max price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="provider">Use Provider Price</SelectItem>
                    <SelectItem value="total">Use Total Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    resetPaging()
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Stock Source</Label>
                <Select
                  value={stockMode}
                  onValueChange={(v) => setStockMode(v as 'provider' | 'manual')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="provider">Use Provider Stock</SelectItem>
                    <SelectItem value="manual">Manual Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Manual Stock</Label>
                <Input
                  type="number"
                  value={stockOverride}
                  onChange={(e) => setStockOverride(Number(e.target.value))}
                  disabled={stockMode !== 'manual'}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={skipExisting} onCheckedChange={setSkipExisting} />
                <span className="text-sm">Hide existing products</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value)
                    setBrandFilter('all')
                    setTypeFilter('all')
                    resetPaging()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {options.categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={brandFilter}
                  onValueChange={(value) => {
                    setBrandFilter(value)
                    setTypeFilter('all')
                    resetPaging()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {options.brands.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value)
                    resetPaging()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {options.types.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Select</th>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Brand</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerProducts.isLoading && (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                          Loading products...
                        </td>
                      </tr>
                    )}
                    {providerProducts.isError && (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-red-500">
                          Failed to load provider products. Please try again later.
                        </td>
                      </tr>
                    )}
                    {!providerProducts.isLoading && pagedProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                          No products found
                        </td>
                      </tr>
                    )}
                    {pagedProducts.map((item) => {
                      const exists = existingCodes.has(item.buyer_sku_code)
                      const selectable = !exists
                      return (
                        <tr key={item.buyer_sku_code} className="border-t">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              disabled={!selectable}
                              checked={selectedSet.has(item.buyer_sku_code)}
                              onChange={() => toggleSelection(item.buyer_sku_code)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">{item.buyer_sku_code}</p>
                          </td>
                          <td className="px-3 py-2">{item.category}</td>
                          <td className="px-3 py-2">{item.brand}</td>
                          <td className="px-3 py-2">{item.type}</td>
                          <td className="px-3 py-2 text-right">
                            {Number(item.price).toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {exists
                              ? 'Exists'
                              : item.buyer_product_status && item.seller_product_status
                                ? 'Active'
                                : 'Inactive'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {(pageSafe - 1) * pageSize + 1}-
                {Math.min(pageSafe * pageSize, sortedProducts.length)} of {sortedProducts.length}
              </span>
              <div className="flex items-center gap-2">
                <select
                  className="h-7 rounded border px-2 text-xs"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage(pageSafe - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageSafe >= totalPages}
                  onClick={() => setPage(pageSafe + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            disabled={selectedCodes.length === 0 || addProducts.isPending}
            onClick={() => addProducts.mutate()}
          >
            {addProducts.isPending ? 'Adding...' : `Add Selected (${selectedCodes.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
