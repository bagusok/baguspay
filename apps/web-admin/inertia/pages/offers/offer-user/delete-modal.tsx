import { router } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Trash } from 'lucide-react'
import { useState } from 'react'

export default function DeleteOfferUserModal({
  userId,
  offerId,
}: {
  userId: string
  offerId: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const handleDelete = () => {
    router.post(
      `/admin/offers/${offerId}/disconnect/user`,
      {
        user_ids: [userId],
      },
      {
        onStart: () => setIsLoading(true),
        onFinish: () => {
          setIsLoading(false)
          setIsOpen(false)
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['offerUsers', offerId], exact: false })
        },
        preserveScroll: true,
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          {isLoading ? <LoaderCircle className="animate-spin" /> : <Trash className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to remove this user from the offer?</p>
        <DialogFooter>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete()}
            disabled={isLoading}
          >
            Delete
          </Button>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
