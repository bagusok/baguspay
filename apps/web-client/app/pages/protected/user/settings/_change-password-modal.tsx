import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { useAtom } from 'jotai'
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

const changePasswordSchema = z
  .object({
    old_password: z.string().min(6, 'Kata sandi lama harus minimal 6 karakter'),
    new_password: z.string().min(6, 'Kata sandi baru harus minimal 6 karakter'),
    confirm_new_password: z.string().min(6, 'Konfirmasi kata sandi baru harus minimal 6 karakter'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Kata sandi baru dan konfirmasi tidak cocok',
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function ChangePasswordModal({ activeModal, setActiveModal }: Props) {
  const form = useForm<ChangePasswordForm>()
  const [user] = useAtom(userAtom)

  const changePassword = useFormMutation({
    form,
    mutationKey: ['change-password'],
    mutationFn: (s: ChangePasswordForm) =>
      apiClient.post('/user/settings/change-password', s).then((res) => res.data),
    onSuccess: () => {
      user.refetch()
      toast.success('Kata sandi berhasil diubah!')
      setActiveModal(null)
      form.reset()
    },
  })

  return (
    <Dialog
      open={activeModal === 'password'}
      onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-106.25"
      >
        <form onSubmit={form.handleSubmit((data) => changePassword.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Ubah Kata Sandi</DialogTitle>
            <DialogDescription>
              Masukkan kata sandi lama Anda dan kata sandi yang baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <UnderlinedInput
              {...form.register('old_password')}
              error={form.formState.errors.old_password?.message}
              label="Kata Sandi Lama"
              id="old_password"
              type="password"
              placeholder="Masukkan kata sandi saat ini"
              required
            />

            <UnderlinedInput
              {...form.register('new_password')}
              error={form.formState.errors.new_password?.message}
              label="Kata Sandi Baru"
              id="new_password"
              type="password"
              placeholder="Masukkan kata sandi baru"
              required
            />

            <UnderlinedInput
              {...form.register('confirm_new_password')}
              error={form.formState.errors.confirm_new_password?.message}
              label="Konfirmasi Kata Sandi Baru"
              id="confirm_password"
              type="password"
              placeholder="Ulangi kata sandi baru"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              disabled={changePassword.isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="secondary" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
