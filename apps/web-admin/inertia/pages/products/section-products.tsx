import type { InferSelectModel } from '@repo/db'
import type { tb } from '@repo/db/types'
import { DataTable } from '@repo/ui/components/data-table'
import { Button } from '@repo/ui/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { GetAllProductsQueryValidator } from '#validators/product'
import Image from '~/components/image'
import { formatDate, formatPrice } from '~/utils'
import { apiClient } from '~/utils/axios'
import type { MetaPagination } from '~/utils/types/pagination_types'
import AddProductModal from './add-modal'
import AddProviderProductsModal from './add-provider-modal'
import DeleteProductModal from './delete-modal'
import EditProductModal from './edit-modal'
import IsAvailableSwitchProduct from './is-available-switch'
import UpdateProviderPriceModal from './update-provider-price-modal'

type Props = {
  productSubCategoryId: string | null
  selectedSubCategory?: {
    id: string
    is_available: boolean | null
    name: string
  } | null
}

type Product = InferSelectModel<typeof tb.products>

export default function SectionProducts({ productSubCategoryId, selectedSubCategory }: Props) {
  const [queryParams, setQueryParams] = useState<GetAllProductsQueryValidator>({
    page: 1,
    limit: 10,
    searchQuery: '',
    searchBy: 'name',
    sortColumn: 'created_at',
    sortOrder: 'desc',
    productSubCategoryId: productSubCategoryId ?? undefined,
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (productSubCategoryId) {
      setQueryParams((prev) => ({
        ...prev,
        productSubCategoryId,
      }))
      setSelectedIds([])
    }
  }, [productSubCategoryId])

  const products = useQuery<{ data: Product[]; meta: MetaPagination }>({
    queryKey: ['products', queryParams],
    queryFn: async () =>
      apiClient
        .get('/admin/products/all', {
          params: queryParams,
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error('Error fetching products:', err)
          throw new Error('Failed to fetch products')
        }),
    enabled: !!productSubCategoryId,
  })

  const handlePageChange = (nextPage: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: nextPage,
    }))
  }

  const handleLimitChange = (limit: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      limit,
    }))
  }

  const visibleIds = products.data?.data.map((item) => item.id) ?? []

  useEffect(() => {
    if (!products.data?.data) return
    setSelectedIds((prev) => prev.filter((id) => visibleIds.includes(id)))
  }, [products.data?.data, visibleIds])

  const toggleSelectAll = () => {
    if (visibleIds.length === 0) return
    setSelectedIds((prev) => (prev.length === visibleIds.length ? [] : visibleIds))
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} product(s)?`)) return

    const results = await Promise.allSettled(
      selectedIds.map((id) => apiClient.delete(`/admin/products/${id}`)),
    )

    const successCount = results.filter((res) => res.status === 'fulfilled').length
    const failCount = results.length - successCount

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} product(s)`)
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} product(s)`)
    }

    setSelectedIds([])
  }

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={visibleIds.length > 0 && selectedIds.length === visibleIds.length}
            onChange={toggleSelectAll}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={() => toggleSelectOne(row.original.id)}
          />
        ),
      },
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }) => (
          <div className="aspect-square w-8 overflow-hidden rounded-md">
            <Image
              src={`${row.original.image_url}`}
              alt={row.getValue('name')}
              className="w-full h-full object-cover"
            />
          </div>
        ),
      },
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'is_available',
        header: 'Available',
        cell: ({ row }) => (
          <IsAvailableSwitchProduct
            isAvailable={row.original.is_available}
            productId={row.original.id}
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'sku_code',
        header: 'SKU Code',
      },
      {
        accessorKey: 'provider_name',
        header: 'Provider',
      },
      {
        accessorKey: 'provider_code',
        header: 'Provider Code',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => formatPrice(row.original.price),
      },
      {
        accessorKey: 'provider_price',
        header: 'Provider Price',
        cell: ({ row }) => formatPrice(row.getValue('provider_price')),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => formatDate(row.getValue('created_at')),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <EditProductModal productId={row.original.id} />
            <DeleteProductModal productId={row.original.id} />
          </div>
        ),
      },
    ],
    [selectedIds, visibleIds, toggleSelectAll, toggleSelectOne],
  )

  return (
    <section className="mt-4">
      <div className="flex justify-between gap-4 items-end flex-wrap">
        <h2 className="text-lg font-semibold">Products</h2>
        {productSubCategoryId && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.length === 0}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedIds.length})
            </Button>
            <UpdateProviderPriceModal
              productSubCategoryId={productSubCategoryId}
              isSubCategoryActive={!!selectedSubCategory?.is_available}
            />
            <AddProviderProductsModal
              productSubCategoryId={productSubCategoryId}
              subCategoryName={selectedSubCategory?.name}
              isSubCategoryActive={!!selectedSubCategory?.is_available}
            />
            <AddProductModal productSubCategoryId={productSubCategoryId} />
          </div>
        )}
      </div>
      {selectedSubCategory && !selectedSubCategory.is_available && (
        <p className="text-xs text-muted-foreground mt-2">
          Sub category is inactive. Activate it to add products from provider.
        </p>
      )}
      <div className="mt-4 grid">
        {products.isLoading && <p className="text-center">Loading products...</p>}
        {products.isError && (
          <p className="text-red-500 text-center">Failed to load products. Please try again.</p>
        )}
        {products.isSuccess && (
          <>
            <DataTable columns={columns} data={products.data.data} />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
              <span className="text-xs text-muted-foreground">
                Page {products.data.meta.page} of {products.data.meta.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <select
                  className="h-8 rounded border px-2 text-sm"
                  value={products.data.meta.limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={products.data.meta.page <= 1}
                  onClick={() => handlePageChange(products.data.meta.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={products.data.meta.page >= products.data.meta.totalPages}
                  onClick={() => handlePageChange(products.data.meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
