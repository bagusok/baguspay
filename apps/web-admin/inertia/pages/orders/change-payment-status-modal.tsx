import { UpdateOrderPaymentStatusValidator } from '#validators/order'
import { useForm } from '@inertiajs/react'
import { PaymentStatus } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Label } from '@repo/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ChangePaymentStatusModal({
  orderId,
  status,
}: {
  orderId: string
  status: PaymentStatus
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<UpdateOrderPaymentStatusValidator>({
    status: status,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.patch(`/admin/orders/${orderId}/change-payment-status`, {
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
        <button className="hover:opacity-70 cursor-pointer">
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Change Deposit Status</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div>
            <Label htmlFor="status" className="block mb-2">
              Status
            </Label>
            <Select
              onValueChange={(value) => form.setData('status', value as PaymentStatus)}
              value={form.data.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.status && (
              <p className="text-red-500 text-sm mt-1">{form.errors.status}</p>
            )}
            <small className="text-xs text-red-500 italic">
              * Mengubah status pembayaran akan mempengaruhi proses order.
              <br />
              * Mengubah secara manual dapat menyebabkan ketidaksesuaian data.
              <br />
              * Pastikan untuk memeriksa dengan seksama baik di payment gateway maupun di sistem
              internal.
              <br />
              * Sebaiknya kalo ada error seperti pending lama, atau user sudah bayar tapi status
              masih pending, telanjur expired, atau user menekan tombol cancel. Sebaiknya di set ke
              Failed. Dan dilakukan refund manual ke rekening user.
              <br />* Apabila minta refund ke saldo, bisa di set paymentnya ke Success, dan order
              status ke Failed lalu di refund melalui tombol refund.
            </small>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" size="sm" onClick={handleSubmit} disabled={form.processing}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
