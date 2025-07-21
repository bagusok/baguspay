import { AddOfferProductValidator } from '#validators/offer'
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
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import AsyncSelect from 'react-select/async'
import { apiClient } from '~/utils/axios'

interface ProductOption {
  value: string // product.id
  label: string // product.name or product.email
}

export default function AddOfferProductModal({ offerId }: { offerId: string }) {
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const loadProductOptions = async (inputValue: string): Promise<ProductOption[]> => {
    if (!inputValue) return []
    const res = await apiClient.get(`/admin/product-categories/get-json`, {
      params: { searchQuery: inputValue, searchBy: 'name' },
    })
    return res.data.data.map((product: any) => ({
      value: product.product_id,
      label: `${product.product_name} (${product.product_category_name})`,
    }))
  }

  const handleSubmit = async () => {
    router.post<AddOfferProductValidator>(
      `/admin/offers/${offerId}/connect/product`,
      {
        products: selectedProducts.map((product) => ({ product_id: product.value })),
      },
      {
        onStart: () => setIsLoading(true),
        onSuccess: () => {
          setSelectedProducts([])
          setIsLoading(false)
          router.reload()
          queryClient.invalidateQueries({ queryKey: ['offerProducts', offerId], exact: false })
        },
        onError: () => setIsLoading(false),
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product to Offer</DialogTitle>
        </DialogHeader>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadProductOptions}
          isMulti
          value={selectedProducts}
          onChange={(options) => setSelectedProducts(options as ProductOption[])}
          placeholder="Search and select products..."
          className="mb-4"
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setSelectedProducts([])}>
            Clear
          </Button>
          <Button
            type="button"
            disabled={isLoading || selectedProducts.length === 0}
            onClick={handleSubmit}
          >
            {isLoading ? 'Adding...' : 'Add Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
