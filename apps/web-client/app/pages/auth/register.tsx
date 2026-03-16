import { Button } from '@repo/ui/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { UnderlinedInput } from '~/components/form-fields'
import { getInstance } from '~/middlewares/i8n'
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

export default function Register({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation('register')

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
        <form action="" className="max-w-md mx-auto space-y-4 mt-5">
          <div>
            <UnderlinedInput label={t('nameLabel')} name="name" />
          </div>
          <div>
            <UnderlinedInput label={t('emailLabel')} name="email" />
          </div>
          <div>
            <UnderlinedInput label={t('passwordLabel')} name="password" type="password" />
          </div>
          <div>
            <UnderlinedInput
              label={t('confirmPasswordLabel')}
              name="confirm_password"
              type="password"
            />
          </div>
          <Button type="submit" className="w-full">
            {t('submitButton')}
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
