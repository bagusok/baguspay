import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'
import { UnderlinedInput } from '~/components/form-fields'
import { queryClient } from '~/store/store'
import { apiClient } from '~/utils/axios'
import type { ModalType } from './index'

type Props = {
  activeModal: ModalType
  setActiveModal: (modal: ModalType) => void
}

const setPinSchema = z
  .object({
    pin: z.string().min(6, 'PIN harus 6 digit').max(6, 'PIN harus 6 digit'),
    pin_confirm: z
      .string()
      .min(6, 'Konfirmasi PIN harus 6 digit')
      .max(6, 'Konfirmasi PIN harus 6 digit'),
  })
  .refine((data) => data.pin === data.pin_confirm, {
    message: 'PIN dan konfirmasi tidak cocok',
    path: ['pin_confirm'],
  })

type SetPinForm = z.infer<typeof setPinSchema>

export default function SetPinModal({ activeModal, setActiveModal }: Props) {
  const form = useForm<SetPinForm>()

  const setPin = useMutation({
    mutationKey: ['set-pin'],
    mutationFn: (data: SetPinForm) =>
      apiClient.post('/payments/pin/set', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userSecurityAtom'],
        exact: true,
      })
      toast.success('PIN berhasil disimpan!')
      setActiveModal(null)
      form.reset()
    },
    onError: (error: any) => {
      form.setError('pin', { message: error.response?.data?.message || 'Gagal menyimpan PIN' })
      toast.error(error.response?.data?.message || 'Gagal menyimpan PIN')
    },
  })

  return (
    <Dialog
      open={activeModal === 'pin-add'}
      onOpenChange={(isOpen) => {
        // Only allow closing when mutation is not in progress
        if (!isOpen && !setPin.isPending) {
          setActiveModal(null)
        }
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-106.25"
      >
        <form onSubmit={form.handleSubmit((data) => setPin.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Tambah PIN</DialogTitle>
            <DialogDescription>Buat PIN 6 digit untuk mengamankan transaksi.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <UnderlinedInput
              {...form.register('pin')}
              error={form.formState.errors.pin?.message}
              label="PIN Baru"
              id="pin"
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              maxLength={6}
              required
            />

            <UnderlinedInput
              {...form.register('pin_confirm')}
              error={form.formState.errors.pin_confirm?.message}
              label="Konfirmasi PIN"
              id="pin_confirm"
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              maxLength={6}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              disabled={setPin.isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="secondary" disabled={setPin.isPending}>
              {setPin.isPending ? 'Menyimpan...' : 'Simpan PIN'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
