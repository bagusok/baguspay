import { router, useForm } from '@inertiajs/react'
import { useState, FormEvent } from 'react'
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

export function AddPaymentCategoryModal() {
  const [open, setOpen] = useState(false)
  const form = useForm<{ name: string }>({
    name: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    form.post('/admin/payments/categories', {
      onSuccess: () => {
        setOpen(false)
        form.reset()
        router.reload()
      },
      onError: () => {
        console.error('Failed to add payment category', form.errors)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add New</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>
            <Input
              id="name"
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
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
