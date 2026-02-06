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
import type { AddOfferUserValidator } from '#validators/offer'
import { apiClient } from '~/utils/axios'

export default function AddOfferUserModal({ offerId }: { offerId: string }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)

  const queryClient = useQueryClient()

  const usersQuery = useQuery<{
    data: any[]
    meta: { page: number; limit: number; totalPages: number }
  }>({
    queryKey: ['offerUserPicker', offerId, page, limit, deferredSearch],
    queryFn: async () =>
      apiClient
        .get('/admin/users/get-json', {
          params: { page, limit, searchQuery: deferredSearch },
        })
        .then((res) => res.data),
    enabled: isOpen,
  })

  const visibleIds = usersQuery.data?.data.map((user) => user.id) ?? []
  const selectedSet = useMemo(() => new Set(selectedUsers), [selectedUsers])

  const toggleSelectAll = () => {
    setSelectedUsers((prev) => (prev.length === visibleIds.length ? [] : visibleIds))
  }

  const toggleSelectOne = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const addUsers = useMutation({
    mutationFn: async () =>
      apiClient.post<AddOfferUserValidator>(`/admin/offers/${offerId}/connect/user`, {
        users: selectedUsers.map((userId) => ({ user_id: userId })),
      }),
    onSuccess: () => {
      setSelectedUsers([])
      queryClient.invalidateQueries({ queryKey: ['offerUsers', offerId], exact: false })
      setIsOpen(false)
    },
    onError: (error: any) => {
      console.error('Failed to add users', error?.response?.data?.error || error?.message)
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add New</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add User to Offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="Search users..."
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
                          visibleIds.length > 0 && selectedUsers.length === visibleIds.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left bg-muted/50">Name</th>
                    <th className="px-3 py-2 text-left bg-muted/50">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.isLoading && (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        Loading users...
                      </td>
                    </tr>
                  )}
                  {!usersQuery.isLoading && (usersQuery.data?.data?.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  )}
                  {usersQuery.data?.data?.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedSet.has(user.id)}
                          onChange={() => toggleSelectOne(user.id)}
                        />
                      </td>
                      <td className="px-3 py-2">{user.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {usersQuery.data?.meta.page ?? 1} of {usersQuery.data?.meta.totalPages ?? 1}
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
                disabled={(usersQuery.data?.meta.page ?? 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={
                  (usersQuery.data?.meta.page ?? 1) >= (usersQuery.data?.meta.totalPages ?? 1)
                }
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setSelectedUsers([])}>
            Clear
          </Button>
          <Button
            type="button"
            disabled={addUsers.isPending || selectedUsers.length === 0}
            onClick={() => addUsers.mutate()}
          >
            {addUsers.isPending ? 'Adding...' : 'Add Users'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
