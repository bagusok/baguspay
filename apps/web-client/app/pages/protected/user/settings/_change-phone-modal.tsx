import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { useAtomValue } from 'jotai'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import z from 'zod'
import { UnderlinedInput } from '~/components/form-fields'
import { useFormMutation } from '~/hooks/use-form-mutation'
import { userAtom } from '~/store/user'
import { apiClient } from '~/utils/axios'
import type { ModalType } from './index'

type Props = {
  activeModal: ModalType
  setActiveModal: (modal: ModalType) => void
}

const schema = z.object({
  password: z.string().min(6, 'Kata sandi harus minimal 6 karakter'),
  new_phone: z
    .string()
    .min(10, 'Nomor telepon harus minimal 10 digit')
    .startsWith('62', 'Nomor telepon harus diawali dengan kode negara (62)'),
})

type Schema = z.infer<typeof schema>

export default function ChangePhoneModal({ activeModal, setActiveModal }: Props) {
  const form = useForm<Schema>()
  const user = useAtomValue(userAtom)

  const handleSubmit = useFormMutation({
    form,
    mutationKey: ['change-phone'],
    mutationFn: (data: Schema) =>
      apiClient.post('/user/settings/change-phone', data).then((res) => res.data),
    onSuccess: () => {
      user.refetch()
      toast.success('Nomor telepon berhasil diubah!')
      setActiveModal(null)
      form.reset()
    },
  })

  return (
    <Dialog
      open={activeModal === 'phone'}
      onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-106.25"
      >
        <form onSubmit={form.handleSubmit((data) => handleSubmit.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Ubah Nomor Telepon</DialogTitle>
            <DialogDescription>
              Masukkan nomor telepon/WhatsApp Anda yang baru dan aktif.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <UnderlinedInput
              label="Nomor Telepon Lama"
              id="old_phone"
              type="tel"
              placeholder="081234567890"
              value={user.data?.phone || ''}
              disabled
            />

            <UnderlinedInput
              {...form.register('new_phone')}
              error={form.formState.errors.new_phone?.message}
              label="Nomor Telepon Baru"
              id="new_phone"
              type="tel"
              placeholder="081234567890"
              required
            />
            <UnderlinedInput
              {...form.register('password')}
              error={form.formState.errors.password?.message}
              label="Kata Sandi"
              id="password"
              type="password"
              placeholder="Masukkan kata sandi Anda"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="default" onClick={() => setActiveModal(null)}>
              Batal
            </Button>
            <Button type="submit" variant="secondary">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
