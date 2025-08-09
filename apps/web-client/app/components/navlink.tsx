import { NavLink } from "react-router";
import { useLocale } from "remix-i18next/react";

export default function NavLinkWithLocale(
  props: React.ComponentPropsWithoutRef<typeof NavLink>,
) {
  const locale = useLocale();
  const { to, ...rest } = props;

  // Pastikan to selalu diawali dengan /<locale>
  let toWithLocale =
    typeof to === "string"
      ? to.startsWith(`/${locale}`)
        ? to
        : `/${locale}${to.startsWith("/") ? to : `/${to}`}`
      : to;

  return <NavLink to={toWithLocale} {...rest} />;
}
