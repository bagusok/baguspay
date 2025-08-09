import { UserRole } from "@repo/db/types";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  HistoryIcon,
  HomeIcon,
  MenuIcon,
  MoonIcon,
  NewspaperIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SunIcon,
  TablePropertiesIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { isOpenSidebarAtom } from "~/store/sidebar";
import { Theme, themeAtom } from "~/store/theme";
import { userAtom } from "~/store/user";
import LinkWithLocale from "./link";
import NavUser from "./nav-user";
import NavLinkWithLocale from "./navlink";

export type LocalLabel =
  | "navbar.home"
  | "navbar.priceList"
  | "navbar.news"
  | "loading"
  | "error"
  | "notFound"
  | "backToHome"
  | "navbar.login"
  | "navbar.register"
  | "navbar.about"
  | "navbar.contact";

export const navData = {
  navMain: {
    items: [
      {
        label: "Beranda",
        href: "/",
        icon: <HomeIcon className="h-4 w-4" />,
        local_label: "navbar.home",
      },
      {
        label: "Cek Order",
        href: "/check-order",
        icon: <ShoppingBagIcon className="h-4 w-4" />,
        local_label: "navbar.checkTransaction",
      },
      {
        label: "Daftar Harga",
        href: "/price-list",
        icon: <TablePropertiesIcon className="h-4 w-4" />,
        local_label: "navbar.priceList",
      },
      {
        label: "Berita",
        href: "/news",
        icon: <NewspaperIcon className="h-4 w-4" />,
        local_label: "navbar.news",
      },
    ],
  },
  navUser: {
    items: [
      {
        label: "Dashboard",
        href: "/user",
        icon: <HomeIcon className="h-4 w-4" />,
      },
      {
        label: "Deposit History",
        href: "/user/deposit/history",
        icon: <WalletIcon className="h-4 w-4" />,
      },
      {
        label: "Order History",
        href: "/user/orders",
        icon: <HistoryIcon className="h-4 w-4" />,
      },
      {
        label: "Profile",
        href: "/user/profile",
        icon: <UserIcon className="h-4 w-4" />,
      },
      {
        label: "Settings",
        href: "/user/settings",
        icon: <SettingsIcon className="h-4 w-4" />,
      },
    ],
  },
};

export default function Header() {
  const setOpenSidebar = useSetAtom(isOpenSidebarAtom);
  const { t } = useTranslation("common");

  const [theme, setTheme] = useAtom(themeAtom);
  const user = useAtomValue(userAtom);

  return (
    <header className="w-full md:max-w-7xl mx-auto sticky top-0 backdrop-blur-sm z-40">
      <div className="flex gap-4 p-4 justify-between items-center">
        <div className="flex gap-6">
          <h1 className="font-bold text-xl text-foreground">Baguspay</h1>
          <div className="items-end hidden md:flex ml-10 gap-6">
            {navData.navMain.items.map((item) => (
              <NavLinkWithLocale
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    `flex items-center gap-2  font-medium text-sm text-foreground`,
                    {
                      "font-bold": isActive,
                      "hover:opacity-75": !isActive,
                    },
                  )
                }
              >
                {t(item.local_label as LocalLabel)}
              </NavLinkWithLocale>
            ))}
          </div>
        </div>

        {user.isSuccess && user?.data?.role !== UserRole.GUEST ? (
          <NavUser user={user.data} />
        ) : (
          <div className="hidden md:flex gap-2 items-center">
            <Button variant="secondary" asChild>
              <LinkWithLocale to="/auth/register">
                {t("navbar.register")}
              </LinkWithLocale>
            </Button>
            <Button asChild>
              <LinkWithLocale to="/auth/login">
                {t("navbar.login")}
              </LinkWithLocale>
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setTheme((prev) =>
                  prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
                )
              }
            >
              {theme == Theme.LIGHT ? (
                <SunIcon className="h-6 w-6 text-foreground" />
              ) : (
                <MoonIcon className="h-6 w-6 text-foreground" />
              )}
            </Button>
          </div>
        )}
        <div className="flex md:hidden gap-2 items-center">
          <Button
            variant="ghost"
            className="rounded-full"
            size="icon"
            onClick={() => setOpenSidebar(true)}
          >
            <MenuIcon className="h-6 w-6 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
