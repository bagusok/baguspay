import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

export default function NavLinkWithLocale(props: React.ComponentPropsWithoutRef<typeof NavLink>) {
  const { i18n } = useTranslation()
  const { to, ...rest } = props

  // Pastikan to selalu diawali dengan /<locale>
  const toWithLocale =
    typeof to === 'string'
      ? to.startsWith(`/${i18n.language}`)
        ? to
        : `/${i18n.language}${to.startsWith('/') ? to : `/${to}`}`
      : to

  return <NavLink to={toWithLocale} {...rest} />
}
