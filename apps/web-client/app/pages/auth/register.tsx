import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/components/ui/button'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import z from 'zod'
import { UnderlinedInput } from '~/components/form-fields'
import { useFormMutation } from '~/hooks/use-form-mutation'
import { getInstance } from '~/middlewares/i8n'
import { apiClient } from '~/utils/axios'
import type { Route } from './+types/register'

export async function loader({ context }: Route.LoaderArgs) {
  const { t } = getInstance(context)

  return {
    meta: {
      title: `${t('appName', { ns: 'common' })} | Daftar`,
      description:
        'Login ke Baguspay untuk membeli pulsa, voucher game, dan berbagai produk PPOB dengan mudah dan aman.',
    },
  }
}

const schema = z
  .object({
    name: z.string().min(3, 'Nama tidak boleh kosong'),
    email: z.email('Email tidak valid'),
    phone: z
      .string()
      .min(10, 'Nomor telepon tidak valid')
      .max(15, 'Nomor telepon tidak valid')
      .startsWith('62', 'Nomor telepon harus diawali dengan 62'),
    password: z
      .string()
      .min(8, 'Minimal 8 karakter')
      .regex(/[a-z]/, 'Harus ada huruf kecil')
      .regex(/[A-Z]/, 'Harus ada huruf besar')
      .regex(/[0-9]/, 'Harus ada angka')
      .regex(/[\W_]/, 'Harus ada karakter khusus'),
    confirm_password: z.string().min(8, 'Minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password dan konfirmasi password harus sama',
  })

type Schema = z.infer<typeof schema>

export default function Register({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation('register')

  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(schema),
  })

  const register = useFormMutation({
    form,
    mutationKey: ['register'],
    mutationFn: async (data: Schema) =>
      apiClient
        .post('/auth/register', data)
        .then((res) => res.data.data)
        .catch((err) => {
          throw new Error(err.response?.data?.message || 'Registration failed. Please try again.')
        }),
    onSuccess: () => {
      toast.success('Registration successful! Please log in.')
      navigate(`/${i18n.language}/auth/login`, {
        replace: true,
      })
    },
  })

  const onSubmit = (data: Schema) => {
    register.mutate(data)
  }

  return (
    <>
      <title>{loaderData?.meta.title}</title>
      <meta property="og:title" content={loaderData.meta.title} />
      <meta name="description" content={loaderData.meta.description} />

      <main className="container mx-auto p-6 md:p-0">
        <div className="max-w-md mx-auto text-center mt-10">
          <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        <form
          action=""
          className="max-w-md mx-auto space-y-4 mt-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div>
            <UnderlinedInput
              label={t('nameLabel')}
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
          </div>
          <div>
            <UnderlinedInput
              label={t('emailLabel')}
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>
          <div>
            <UnderlinedInput
              label="Nomor HP"
              {...form.register('phone')}
              error={form.formState.errors.phone?.message}
              placeholder="628xxxxx"
            />
          </div>
          <div>
            <UnderlinedInput
              label={t('passwordLabel')}
              type="password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
          </div>
          <div>
            <UnderlinedInput
              label={t('confirmPasswordLabel')}
              type="password"
              {...form.register('confirm_password')}
              error={form.formState.errors.confirm_password?.message}
            />
          </div>
          <Button type="submit" className="w-full">
            {register.isPending ? 'Loading...' : t('submitButton')}
          </Button>
        </form>
        <div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">
              {t('loginLinkText')}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
