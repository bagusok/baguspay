import { AddBalanceValidator } from '#validators/user'
import { useForm } from '@inertiajs/react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { ArrowUpRightIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatPrice } from '~/utils'

export default function AddBalanceModal({
  userId,
  userName,
  currentBalance,
}: {
  userId: string
  userName: string
  userEmail: string
  currentBalance: number
}) {
  const [open, setOpen] = useState(false)

  const { data, errors, setData, post, processing } = useForm<AddBalanceValidator>({
    amount: 0,
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(`/admin/users/${userId}/add-balance`, {
      onSuccess: () => {
        toast.success('Balance added successfully')
        setOpen(false)
      },
      onError: (errors) => {
        if (errors?.error) {
          toast.error(errors.error)
        }
        console.error(errors)
      },
    })
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <button className="flex justify-start items-center text-sm p-2 hover:bg-primary/10 w-full rounded text-green-500">
          <ArrowUpRightIcon className="h-4 w-4 mr-2" />
          Add Balance
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">Add Balance for {userName}</DialogTitle>
          <DialogDescription className="mt-2">
            Current Balance: <strong>{formatPrice(currentBalance)}</strong>
          </DialogDescription>

          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="amount" className="mb-2">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={data.amount}
                min={0}
                onChange={(e) => setData('amount', +e.target.value)}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>
            <div>
              <Label htmlFor="message" className="mb-2">
                Message
              </Label>
              <Textarea value={data.message} onChange={(e) => setData('message', e.target.value)} />
              {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            </div>
          </form>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-6">
          <DialogClose>Close</DialogClose>
          <Button type="button" onClick={(e) => handleSubmit(e)} disabled={processing}>
            {processing ? 'Adding...' : 'Add Balance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
