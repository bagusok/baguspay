import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Button } from '@repo/ui/components/ui/button'
import { Trash2Icon } from 'lucide-react'
import { router } from '@inertiajs/react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export default function DeleteProductModal({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2Icon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              router.delete(`/admin/products/${productId}`, {
                preserveScroll: true,
                onSuccess: () => {
                  setOpen(false)
                  queryClient.invalidateQueries({
                    queryKey: ['products'],
                    exact: false,
                  })
                },
              })
            }}
          >
            Yes, delete account
          </Button>
          <Button variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
