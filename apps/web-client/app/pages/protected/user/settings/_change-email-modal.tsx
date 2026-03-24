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
import z, { email } from 'zod'
import { UnderlinedInput } from '~/components/form-fields'
import { useFormMutation } from '~/hooks/use-form-mutation'
import { queryClient } from '~/store/store'
import { userAtom } from '~/store/user'
import { apiClient } from '~/utils/axios'

type Props = {
  activeModal: 'password' | 'email' | 'phone' | null
  setActiveModal: (modal: 'password' | 'email' | 'phone' | null) => void
}

const schema = z.object({
  password: z.string().min(6, 'Kata sandi harus minimal 6 karakter'),
  new_email: email('Format email tidak valid'),
})

type Schema = z.infer<typeof schema>

export default function ChangeEmailModal({ activeModal, setActiveModal }: Props) {
  const form = useForm<Schema>()
  const user = useAtomValue(userAtom)

  const handleSubmit = useFormMutation({
    form,
    mutationKey: ['change-email'],
    mutationFn: (s: Schema) =>
      apiClient.post('/user/settings/change-email', s).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userAtom'],
      })
      toast.success('Email berhasil diubah!')
      setActiveModal(null)
      form.reset()
    },
  })

  return (
    <Dialog
      open={activeModal === 'email'}
      onOpenChange={(isOpen) => !isOpen && setActiveModal(null)}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-106.25"
      >
        <form onSubmit={form.handleSubmit((data) => handleSubmit.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Ubah Email</DialogTitle>
            <DialogDescription>Masukkan alamat email baru untuk akun Anda.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <UnderlinedInput
              label="Email"
              id="email"
              type="email"
              placeholder="contoh@gmail.com"
              value={user?.data?.email || ''}
              disabled
            />
            <UnderlinedInput
              {...form.register('new_email')}
              error={form.formState.errors.new_email?.message}
              label="Email Baru"
              id="new_email"
              type="email"
              placeholder="contoh@gmail.com"
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
            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              disabled={handleSubmit.isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="secondary" disabled={handleSubmit.isPending}>
              {handleSubmit.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
