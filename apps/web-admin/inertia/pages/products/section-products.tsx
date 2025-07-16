import { GetAllProductsQueryValidator } from '#validators/product'
import { useEffect, useState } from 'react'
import AddProductModal from './add-modal'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '~/utils/axios'
import { InferSelectModel } from '@repo/db'
import { tb } from '@repo/db/types'
import { MetaPagination } from '~/utils/types/pagination_types'
import { ColumnDef } from '@tanstack/react-table'
import { formatDate, formatPrice } from '~/utils'
import { DataTable } from '@repo/ui/components/data-table'
import DeleteProductModal from './delete-modal'
import EditProductModal from './edit-modal'
import IsAvailableSwitchProduct from './is-available-switch'

type Props = {
  productSubCategoryId: string | null
}

type Product = InferSelectModel<typeof tb.products>

export default function SectionProducts({ productSubCategoryId }: Props) {
  const [queryParams, setQueryParams] = useState<GetAllProductsQueryValidator>({
    page: 1,
    limit: 10,
    searchQuery: '',
    searchBy: 'name',
    sortColumn: 'created_at',
    sortOrder: 'desc',
    productSubCategoryId: productSubCategoryId ?? undefined,
  })

  useEffect(() => {
    if (productSubCategoryId) {
      setQueryParams((prev) => ({
        ...prev,
        productSubCategoryId,
      }))
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

  return (
    <section className="mt-4">
      <div className="flex justify-between gap-4 items-end">
        <h2 className="text-lg font-semibold">Products</h2>
        {productSubCategoryId && <AddProductModal productSubCategoryId={productSubCategoryId} />}
      </div>
      <div className="mt-4 grid">
        {products.isLoading && <p className="text-center">Loading products...</p>}
        {products.isError && (
          <p className="text-red-500 text-center">Failed to load products. Please try again.</p>
        )}
        {products.isSuccess && <DataTable columns={columns} data={products.data.data} />}
      </div>
    </section>
  )
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => (
      <div className="aspect-square w-8 overflow-hidden rounded-md">
        <img
          src={`${import.meta.env.VITE_S3_URL}${row.original.image_url}`}
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
]
