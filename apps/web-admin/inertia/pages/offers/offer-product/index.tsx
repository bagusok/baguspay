import { ColumnDef } from '@tanstack/react-table'
import AddOfferProductModal from './add-modal'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '~/utils/axios'
import { DataTable } from '@repo/ui/components/data-table'
import { useState } from 'react'
import { OferProductQueryValidator } from '#validators/offer'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { formatDate } from '~/utils'
import DeleteOfferProductModal from './delete-modal'

export default function OfferProductSection({ offerId }: { offerId: string }) {
  const [query, setQuery] = useState<OferProductQueryValidator>({
    page: 1,
    limit: 10,
    searchBy: 'name',
    searchQuery: '',
  })

  const productOffers = useQuery({
    queryKey: ['offerProducts', offerId, query],
    queryFn: async () =>
      apiClient
        .get(`/admin/offers/${offerId}/products`, {
          params: query,
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error('Error fetching offer products:', err)
          throw new Error('Failed to fetch offer products')
        }),
  })

  return (
    <>
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg">Products who can use the offer</h3>
        <AddOfferProductModal offerId={offerId} />
      </div>
      <div className="mb-4 flex gap-2 items-end">
        <Input
          value={query.searchQuery}
          onChange={(e) => setQuery((q) => ({ ...q, searchQuery: e.target.value }))}
          placeholder={`Search by ${query.searchBy}`}
          className="w-64 h-8"
        />
        <Button size="sm" onClick={() => setQuery((q) => ({ ...q, page: 1 }))}>
          Search
        </Button>
      </div>
      <div className="grid overflow-hidden">
        {productOffers.isLoading && <div className="text-center">Loading...</div>}
        {productOffers.isError && (
          <div className="text-red-500 text-center">
            Error loading products: {productOffers.error.message}
          </div>
        )}

        {productOffers.isSuccess && <DataTable data={productOffers.data.data} columns={columns} />}

        {/* pagination */}
        {productOffers.isSuccess && productOffers.data.meta && (
          <div className="flex justify-between items-center mt-4">
            <span>
              Page {productOffers.data.meta.page} of {productOffers.data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={productOffers.data.meta.page <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={productOffers.data.meta.page >= productOffers.data.meta.totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'product.name',
    header: 'Product Name',
  },
  {
    accessorKey: 'product.product_sub_category.name',
    header: 'Sub Category',
  },
  {
    accessorKey: 'product.product_sub_category.product_category.name',
    header: 'Category',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <DeleteOfferProductModal
          offerId={row.original.offer_id}
          productId={row.original.product.id}
        />
      </div>
    ),
  },
]

type Product = {
  id: string
  offer_id: string
  product: {
    id: string
    name: string
    product_sub_category: {
      id: string
      name: string
      product_category: {
        id: string
        name: string
      }
    }
  }
}
