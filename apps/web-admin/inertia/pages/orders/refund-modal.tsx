import { useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { RecycleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function RefundOrderModal({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)

  const form = useForm()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post(`/admin/orders/${orderId}/refund`, {
      onSuccess: () => {
        setOpen(false)
      },
      onError: (error) => {
        toast.error('Error changing status: ' + error.error)
        console.error('Error changing status:', error)
      },
    })
  }

  useEffect(() => {
    if (open) {
      form.setData('status', status)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="hover:opacity-70 cursor-pointer">
          <RecycleIcon className="w-3.5 h-3.5" />
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Refund to Balance</DialogTitle>
          <DialogDescription className="text-red-500">
            Apakah Anda yakin ingin melakukan refund ke saldo pengguna? Pastikan untuk memeriksa
            kembali sebelum melanjutkan.
            <br />
            Order ID: {orderId}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" size="sm" onClick={handleSubmit} disabled={form.processing}>
              {form.processing ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
