import { AddOfferUserValidator } from '#validators/offer'
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

interface UserOption {
  value: string // user.id
  label: string // user.name or user.email
}

export default function AddOfferUserModal({ offerId }: { offerId: string }) {
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const loadUserOptions = async (inputValue: string): Promise<UserOption[]> => {
    if (!inputValue) return []
    const res = await apiClient.get(`/admin/users/get-json`, {
      params: { searchQuery: inputValue },
    })
    return res.data.data.map((user: any) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }))
  }

  const handleSubmit = async () => {
    router.post<AddOfferUserValidator>(
      `/admin/offers/${offerId}/connect/user`,
      {
        users: selectedUsers.map((user) => ({ user_id: user.value })),
      },
      {
        onStart: () => setIsLoading(true),
        onSuccess: () => {
          setSelectedUsers([])
          setIsLoading(false)
          router.reload()
          queryClient.invalidateQueries({ queryKey: ['offerUsers', offerId], exact: false })
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
          <DialogTitle>Add User to Offer</DialogTitle>
        </DialogHeader>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadUserOptions}
          isMulti
          value={selectedUsers}
          onChange={(options) => setSelectedUsers(options as UserOption[])}
          placeholder="Search and select users..."
          className="mb-4"
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setSelectedUsers([])}>
            Clear
          </Button>
          <Button
            type="button"
            disabled={isLoading || selectedUsers.length === 0}
            onClick={handleSubmit}
          >
            {isLoading ? 'Adding...' : 'Add Users'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
