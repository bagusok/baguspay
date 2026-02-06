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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useState } from 'react'
import type { AddOfferProductValidator } from '#validators/offer'
import { apiClient } from '~/utils/axios'

export default function AddOfferProductModal({ offerId }: { offerId: string }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [categoryId, setCategoryId] = useState('all')
  const [subCategoryId, setSubCategoryId] = useState('all')

  const queryClient = useQueryClient()

  const productsQuery = useQuery<{
    data: any[]
    productCategories: any[]
    productSubCategories: any[]
    meta: { page: number; limit: number; totalPages: number }
  }>({
    queryKey: [
      'offerProductPicker',
      offerId,
      page,
      limit,
      deferredSearch,
      categoryId,
      subCategoryId,
    ],
    queryFn: async () =>
      apiClient
        .get('/admin/products/get-json', {
          params: {
            page,
            limit,
            searchQuery: deferredSearch,
            searchBy: 'name',
            categoryId: categoryId !== 'all' ? categoryId : undefined,
            subCategoryId: subCategoryId !== 'all' ? subCategoryId : undefined,
          },
        })
        .then((res) => res.data),
    enabled: isOpen,
  })

  const visibleIds = productsQuery.data?.data.map((item) => item.product_id) ?? []
  const selectedSet = useMemo(() => new Set(selectedProducts), [selectedProducts])

  const toggleSelectAll = () => {
    setSelectedProducts((prev) => (prev.length === visibleIds.length ? [] : visibleIds))
  }

  const toggleSelectOne = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const addProducts = useMutation({
    mutationFn: async () =>
      apiClient.post<AddOfferProductValidator>(`/admin/offers/${offerId}/connect/product`, {
        products: selectedProducts.map((productId) => ({ product_id: productId })),
      }),
    onSuccess: () => {
      setSelectedProducts([])
      queryClient.invalidateQueries({ queryKey: ['offerProducts', offerId], exact: false })
      setIsOpen(false)
    },
    onError: (error: any) => {
      console.error('Failed to add products', error?.response?.data?.error || error?.message)
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add New</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Product to Offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value)
                setSubCategoryId('all')
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {productsQuery.data?.productCategories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={subCategoryId}
              onValueChange={(value) => {
                setSubCategoryId(value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sub-categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {productsQuery.data?.productSubCategories?.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left bg-muted/50">
                      <input
                        type="checkbox"
                        checked={
                          visibleIds.length > 0 && selectedProducts.length === visibleIds.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left bg-muted/50">Product</th>
                    <th className="px-3 py-2 text-left bg-muted/50">Category</th>
                    <th className="px-3 py-2 text-left bg-muted/50">Sub Category</th>
                  </tr>
                </thead>
                <tbody>
                  {productsQuery.isLoading && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        Loading products...
                      </td>
                    </tr>
                  )}
                  {!productsQuery.isLoading && (productsQuery.data?.data?.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        No products found
                      </td>
                    </tr>
                  )}
                  {productsQuery.data?.data?.map((item) => (
                    <tr key={item.product_id} className="border-t">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedSet.has(item.product_id)}
                          onChange={() => toggleSelectOne(item.product_id)}
                        />
                      </td>
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {item.product_category_name}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {item.product_sub_category_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {productsQuery.data?.meta.page ?? 1} of{' '}
              {productsQuery.data?.meta.totalPages ?? 1}
            </span>
            <div className="flex items-center gap-2">
              <select
                className="h-7 rounded border px-2 text-xs"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                disabled={(productsQuery.data?.meta.page ?? 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={
                  (productsQuery.data?.meta.page ?? 1) >= (productsQuery.data?.meta.totalPages ?? 1)
                }
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setSelectedProducts([])}>
            Clear
          </Button>
          <Button
            type="button"
            disabled={addProducts.isPending || selectedProducts.length === 0}
            onClick={() => addProducts.mutate()}
          >
            {addProducts.isPending ? 'Adding...' : 'Add Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
