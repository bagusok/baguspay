import { Link } from "react-router";
import { useLocale } from "remix-i18next/react";

export default function LinkWithLocale(
  props: React.ComponentPropsWithoutRef<typeof Link>,
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

  return <Link to={toWithLocale} {...rest} />;
}
