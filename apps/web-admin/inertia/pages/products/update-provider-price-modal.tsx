import { ProductProvider } from '@repo/db/types'
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
import { apiClient } from '~/utils/axios'

type DigiflazzProductPrepaid = {
  product_name: string
  category: string
  brand: string
  type: string
  price: number
  buyer_sku_code: string
  buyer_product_status: boolean
  seller_product_status: boolean
}

type ProviderProductMap = {
  id: string
  name: string
  provider_code: string
  provider_price: number
  provider_max_price: number
  profit_static: number
  profit_percentage: number
}

type Props = {
  productSubCategoryId: string
  isSubCategoryActive: boolean
}

export default function UpdateProviderPriceModal({
  productSubCategoryId,
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
  const [maxPriceMode, setMaxPriceMode] = useState<'provider' | 'total'>('provider')
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes])
  const [hideUnmatched, setHideUnmatched] = useState(true)
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

  const providerMap = useQuery<{ data: ProviderProductMap[] }>({
    queryKey: ['provider-map', productSubCategoryId, provider],
    queryFn: async () =>
      apiClient
        .get('/admin/products/provider-map', {
          params: { productSubCategoryId, providerName: provider },
        })
        .then((res) => res.data),
    enabled: open,
  })

  const mapByCode = useMemo(() => {
    const entries = providerMap.data?.data ?? []
    return new Map(entries.map((item) => [item.provider_code, item]))
  }, [providerMap.data?.data])

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
      if (hideUnmatched && !mapByCode.has(item.buyer_sku_code)) return false
      return true
    })
  }, [
    providerProducts.data?.data,
    categoryFilter,
    brandFilter,
    typeFilter,
    deferredSearch,
    hideUnmatched,
    mapByCode,
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

  const updatePrices = useMutation({
    mutationFn: async () => {
      const selectedItems = filteredProducts.filter((item) =>
        selectedCodes.includes(item.buyer_sku_code),
      )
      for (const item of selectedItems) {
        const match = mapByCode.get(item.buyer_sku_code)
        if (!match) continue

        const totalPrice =
          Number(item.price) +
          Number(match.profit_static) +
          (Number(item.price) * Number(match.profit_percentage)) / 100
        const providerMaxPrice =
          maxPriceMode === 'total' ? Math.ceil(totalPrice) : Number(item.price)

        await apiClient.patch(`/admin/products/${match.id}/update-provider-price`, {
          provider_price: item.price,
          provider_max_price: providerMaxPrice,
        })
      }
    },
    onSuccess: () => {
      toast.success('Prices updated successfully')
      setSelectedCodes([])
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to update prices')
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={!isSubCategoryActive}>
          Update Prices
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[90vw] md:max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Update Prices from Provider</DialogTitle>
          <DialogDescription>Select provider items to sync prices.</DialogDescription>
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

            <div className="grid gap-4 md:grid-cols-3">
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
              <div className="flex items-center gap-3">
                <Switch checked={hideUnmatched} onCheckedChange={setHideUnmatched} />
                <span className="text-sm">Hide unmatched products</span>
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
                      <th className="px-3 py-2 text-right">Provider Price</th>
                      <th className="px-3 py-2 text-right">Match</th>
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
                      const match = mapByCode.get(item.buyer_sku_code)
                      const selectable = !!match
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
                            {match ? 'Matched' : 'Unmatched'}
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
            disabled={selectedCodes.length === 0 || updatePrices.isPending}
            onClick={() => updatePrices.mutate()}
          >
            {updatePrices.isPending ? 'Updating...' : `Update Selected (${selectedCodes.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
