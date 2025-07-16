import { router, useForm } from '@inertiajs/react'
import { useState, FormEvent, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'

export function EditPaymentCategoryModal({ id, name }: { id: number | string; name: string }) {
  const [open, setOpen] = useState(false)
  const form = useForm<{ name: string }>({
    name: name || '',
  })

  useEffect(() => {
    form.setData('name', name)
  }, [name])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    form.patch(`/admin/payments/categories/${id}`, {
      onSuccess: () => {
        setOpen(false)
        router.flushAll()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name" className="mb-2">
              Name
            </Label>
            <Input
              id="edit-name"
              placeholder="Name"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              required
            />
            {form.errors.name && (
              <div className="text-red-500 text-xs mt-1">{form.errors.name}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.processing}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
