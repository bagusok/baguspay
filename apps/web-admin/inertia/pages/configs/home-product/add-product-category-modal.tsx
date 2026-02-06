import { router } from '@inertiajs/react'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useState } from 'react'
import { apiClient } from '~/utils/axios'

interface Props {
  productSectionId: string
  connectedCategoryIds: string[]
  trigger?: React.ReactNode
}

export default function AddProductCategoryModal({
  productSectionId,
  connectedCategoryIds,
  trigger,
}: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)

  const queryClient = useQueryClient()

  const categoriesQuery = useQuery<{
    data: Array<{ id: string; name: string; slug: string }>
    meta: { page: number; limit: number; totalPages: number }
  }>({
    queryKey: ['productCategoryPicker', productSectionId, page, limit, deferredSearch],
    queryFn: async () =>
      apiClient
        .get('/admin/product-categories/get-json', {
          params: { page, limit, searchQuery: deferredSearch, searchBy: 'name' },
        })
        .then((res) => res.data),
    enabled: isOpen,
  })

  const categories = categoriesQuery.data?.data ?? []
  const visibleIds = categories.map((cat) => cat.id)
  const availableIds = visibleIds.filter((id) => !connectedCategoryIds.includes(id))
  const selectedSet = useMemo(() => new Set(selectedCategories), [selectedCategories])

  const toggleSelectAll = () => {
    setSelectedCategories((prev) => (prev.length === availableIds.length ? [] : availableIds))
  }

  const toggleSelectOne = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const addCategories = useMutation({
    mutationFn: async () =>
      apiClient.post(
        `/admin/config/home/product-sections/${productSectionId}/bulk-connect-product`,
        {
          product_category_ids: selectedCategories,
        },
      ),
    onSuccess: () => {
      setSelectedCategories([])
      queryClient.invalidateQueries({ queryKey: ['productCategoryPicker'], exact: false })
      setIsOpen(false)
      router.reload({ only: ['productOnProductSections'] })
    },
    onError: (error: any) => {
      console.error('Failed to connect categories', error?.response?.data?.error || error?.message)
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Tambah Product Category</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect Product Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
          />
          <div className="rounded-md border overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left bg-muted/50">
                      <input
                        type="checkbox"
                        checked={
                          availableIds.length > 0 &&
                          selectedCategories.length === availableIds.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left bg-muted/50">Name</th>
                    <th className="px-3 py-2 text-left bg-muted/50">Slug</th>
                    <th className="px-3 py-2 text-left bg-muted/50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesQuery.isLoading && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        Loading categories...
                      </td>
                    </tr>
                  )}
                  {!categoriesQuery.isLoading && categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        No categories found
                      </td>
                    </tr>
                  )}
                  {categories.map((cat) => {
                    const isConnected = connectedCategoryIds.includes(cat.id)
                    return (
                      <tr key={cat.id} className={`border-t ${isConnected ? 'opacity-50' : ''}`}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedSet.has(cat.id)}
                            onChange={() => toggleSelectOne(cat.id)}
                            disabled={isConnected}
                          />
                        </td>
                        <td className="px-3 py-2">{cat.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{cat.slug}</td>
                        <td className="px-3 py-2">
                          {isConnected ? (
                            <span className="text-xs text-green-600 font-medium">Connected</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Available</span>
                          )}
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
              Page {categoriesQuery.data?.meta.page ?? 1} of{' '}
              {categoriesQuery.data?.meta.totalPages ?? 1}
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
                disabled={(categoriesQuery.data?.meta.page ?? 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={
                  (categoriesQuery.data?.meta.page ?? 1) >=
                  (categoriesQuery.data?.meta.totalPages ?? 1)
                }
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setSelectedCategories([])}>
            Clear
          </Button>
          <Button
            type="button"
            disabled={addCategories.isPending || selectedCategories.length === 0}
            onClick={() => addCategories.mutate()}
          >
            {addCategories.isPending ? 'Connecting...' : `Connect (${selectedCategories.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
