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
import { apiClient } from '~/utils/axios'
import type { ModalType } from './index'

type Props = {
  activeModal: ModalType
  setActiveModal: (modal: ModalType) => void
}

const changePinSchema = z
  .object({
    current_pin: z.string().min(6, 'PIN lama harus 6 digit').max(6, 'PIN lama harus 6 digit'),
    new_pin: z.string().min(6, 'PIN baru harus 6 digit').max(6, 'PIN baru harus 6 digit'),
    new_pin_confirm: z
      .string()
      .min(6, 'Konfirmasi PIN baru harus 6 digit')
      .max(6, 'Konfirmasi PIN baru harus 6 digit'),
  })
  .refine((data) => data.new_pin === data.new_pin_confirm, {
    message: 'PIN baru dan konfirmasi tidak cocok',
    path: ['new_pin_confirm'],
  })

type ChangePinForm = z.infer<typeof changePinSchema>

export default function ChangePinModal({ activeModal, setActiveModal }: Props) {
  const form = useForm<ChangePinForm>()

  const changePin = useMutation({
    mutationKey: ['change-pin'],
    mutationFn: (data: ChangePinForm) =>
      apiClient.post('/payments/pin/change', data).then((res) => res.data),
    onSuccess: () => {
      toast.success('PIN berhasil diubah!')
      setActiveModal(null)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengubah PIN')
    },
  })

  return (
    <Dialog
      open={activeModal === 'pin-change'}
      onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-106.25"
      >
        <form onSubmit={form.handleSubmit((data) => changePin.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Ubah PIN</DialogTitle>
            <DialogDescription>
              Masukkan PIN lama lalu setel PIN baru 6 digit untuk keamanan akun.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <UnderlinedInput
              {...form.register('current_pin')}
              error={form.formState.errors.current_pin?.message}
              label="PIN Lama"
              id="old_pin"
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              maxLength={6}
              required
            />

            <UnderlinedInput
              {...form.register('new_pin')}
              error={form.formState.errors.new_pin?.message}
              label="PIN Baru"
              id="new_pin"
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              maxLength={6}
              required
            />

            <UnderlinedInput
              {...form.register('new_pin_confirm')}
              error={form.formState.errors.new_pin_confirm?.message}
              label="Konfirmasi PIN Baru"
              id="new_pin_confirm"
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
              disabled={changePin.isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="secondary" disabled={changePin.isPending}>
              {changePin.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
