import { ColumnDef } from '@tanstack/react-table'
import AddOfferPaymentModal from './add-modal'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '~/utils/axios'
import { DataTable } from '@repo/ui/components/data-table'
import { useState } from 'react'
import { OferPaymentMethodQueryValidator } from '#validators/offer'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { formatDate } from '~/utils'
import DeleteOfferPaymentModal from './delete-modal'

export default function OfferPaymentSection({ offerId }: { offerId: string }) {
  const [query, setQuery] = useState<OferPaymentMethodQueryValidator>({
    page: 1,
    limit: 10,
    searchBy: 'name',
    searchQuery: '',
  })

  const paymentOffers = useQuery({
    queryKey: ['offerPayments', offerId, query],
    queryFn: async () =>
      apiClient
        .get(`/admin/offers/${offerId}/payment-methods`, {
          params: query,
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error('Error fetching offer payments:', err)
          throw new Error('Failed to fetch offer payments')
        }),
  })

  return (
    <>
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg">Payments who can use the offer</h3>
        <AddOfferPaymentModal offerId={offerId} />
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
        {paymentOffers.isLoading && <div className="text-center">Loading...</div>}
        {paymentOffers.isError && (
          <div className="text-red-500 text-center">
            Error loading payments: {paymentOffers.error.message}
          </div>
        )}

        {paymentOffers.isSuccess && <DataTable data={paymentOffers.data.data} columns={columns} />}

        {/* pagination */}
        {paymentOffers.isSuccess && paymentOffers.data.meta && (
          <div className="flex justify-between items-center mt-4">
            <span>
              Page {paymentOffers.data.meta.page} of {paymentOffers.data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={paymentOffers.data.meta.page <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={paymentOffers.data.meta.page >= paymentOffers.data.meta.totalPages}
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

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'payment_method_name',
    header: 'Name',
  },
  {
    accessorKey: 'payment_method_provider_name',
    header: 'Provider',
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
        <DeleteOfferPaymentModal
          offerId={row.original.offer_id}
          paymentId={row.original.payment_method_id}
        />
      </div>
    ),
  },
]

type Payment = {
  id: string
  offer_id: string
  payment_method_id: string
  payment_method_name: string
  payment_method_provider_name: string
  created_at: Date
  updated_at: Date
}
