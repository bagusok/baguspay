import { ChangeStatusValidator } from '#validators/deposit'
import { useForm } from '@inertiajs/react'
import { DepositStatus } from '@repo/db/types'
import { Button } from '@repo/ui/components/ui/button'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
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

export default function ChangeStatusModal({
  depositId,
  status,
}: {
  depositId: string
  status: DepositStatus
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<ChangeStatusValidator>({
    status: status,
    updateBalance: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.patch(`/admin/deposits/${depositId}`, {
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
        <Button size="icon" variant="ghost">
          <PencilIcon className="h-4 w-4" />
        </Button>
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
              onValueChange={(value) => form.setData('status', value as DepositStatus)}
              value={form.data.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DepositStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.errors.status && (
              <p className="text-red-500 text-sm mt-1">{form.errors.status}</p>
            )}
          </div>
          {(status !== DepositStatus.COMPLETED && form.data.status === DepositStatus.COMPLETED) ||
          (status === DepositStatus.COMPLETED && form.data.status !== DepositStatus.COMPLETED) ? (
            <div>
              <Label htmlFor="status" className="block mb-2">
                Update Balance
              </Label>
              <Checkbox
                checked={form.data.updateBalance}
                onCheckedChange={(c) => form.setData('updateBalance', c ? true : false)}
              />
              {form.errors.status && (
                <p className="text-red-500 text-sm mt-1">{form.errors.status}</p>
              )}
              <br />

              <small className="text-primary mt-1 text-sm">
                Penting! Perubahan status dari not completed ke completed pastikan mencentang update
                saldo, agar saldo user bertambah sesuai jumlah deposit. Jika tidak dicentang, saldo
                user tidak akan berubah.
              </small>
              <br />
              <hr />
              <small className="text-primary mt-1 text-sm">
                Penting! Perubahan status dari completed ke not completed pastikan juga mencentang
                update balance, agar saldo user berkurang sesuai jumlah deposit. Jika tidak
                dicentang, saldo user tidak akan berubah.
              </small>
              <br />
              <hr />
              <small className="text-primary mt-1 text-sm">
                Gunakan dengan hati-hati, perubahan status deposit akan mempengaruhi saldo user dan
                menjaga agar mutasi saldo tetap konsisten. Sebaiknya kalo ada masalah deposit, entah
                pending lama atau lainnya, set saja ke failed. dan direfund saja, dan user disuruh
                deposit ulang. Pastikan juga cek ke payment gateway apakah pembayaran sudah diterima
                atau belum.
              </small>
            </div>
          ) : null}

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
