import { ColumnDef } from '@tanstack/react-table'
import AddOfferUserModal from './add-modal'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '~/utils/axios'
import { DataTable } from '@repo/ui/components/data-table'
import { useState } from 'react'
import { OferUserQueryValidator } from '#validators/offer'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { formatDate } from '~/utils'
import DeleteOfferUserModal from './delete-modal'

export default function OfferUserSection({ offerId }: { offerId: string }) {
  const [query, setQuery] = useState<OferUserQueryValidator>({
    page: 1,
    limit: 10,
    searchBy: 'name',
    searchQuery: '',
  })

  const userOffers = useQuery({
    queryKey: ['offerUsers', offerId, query],
    queryFn: async () =>
      apiClient
        .get(`/admin/offers/${offerId}/users`, {
          params: query,
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error('Error fetching offer users:', err)
          throw new Error('Failed to fetch offer users')
        }),
  })

  return (
    <>
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg">Users who can use the offer</h3>
        <AddOfferUserModal offerId={offerId} />
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
        {userOffers.isLoading && <div className="text-center">Loading...</div>}
        {userOffers.isError && (
          <div className="text-red-500 text-center">
            Error loading users: {userOffers.error.message}
          </div>
        )}

        {userOffers.isSuccess && <DataTable data={userOffers.data.data} columns={columns} />}

        {/* pagination */}
        {userOffers.isSuccess && userOffers.data.meta && (
          <div className="flex justify-between items-center mt-4">
            <span>
              Page {userOffers.data.meta.page} of {userOffers.data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={userOffers.data.meta.page <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={userOffers.data.meta.page >= userOffers.data.meta.totalPages}
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

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'user_name',
    header: 'Name',
  },
  {
    accessorKey: 'user_email',
    header: 'Email',
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
        <DeleteOfferUserModal offerId={row.original.offer_id} userId={row.original.user_id} />
      </div>
    ),
  },
]

type User = {
  offer_id: string
  offer_user_id: string
  user_id: string
  user_name: string
  user_email: string
  created_at: string
  updated_at: string
}
