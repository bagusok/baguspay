import { UserRole } from "@repo/db/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isOpenSidebarAtom } from "~/store/sidebar";
import { userAtom } from "~/store/user";
import { navData, type LocalLabel } from "./header";
import LinkWithLocale from "./link";
import NavLinkWithLocale from "./navlink";

export default function Sidebar() {
  const [isOpenSidebar, setIsOpenSidebar] = useAtom(isOpenSidebarAtom);
  const user = useAtomValue(userAtom);
  const { t } = useTranslation("common");

  return (
    <aside
      className={`fixed top-0 left-0 w-full h-full min-h-screen z-50 transition-colors duration-300 md:hidden ${
        isOpenSidebar ? "bg-black/50" : "bg-transparent pointer-events-none"
      }`}
      onClick={() => isOpenSidebar && setIsOpenSidebar(false)}
    >
      <div
        className={`flex flex-col absolute top-0 left-0 h-full bg-background transition-transform duration-300 w-3/4 shadow-lg ${
          isOpenSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between p-4">
          <h1 className="font-bold text-xl text-foreground">Baguspay</h1>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setIsOpenSidebar(false)}
          >
            <XIcon className="h-6 w-6" />
          </Button>
        </div>

        {user.isSuccess && user.data.role !== UserRole.GUEST && (
          <div className="px-4 pb-4">
            <div className="rounded-xl p-2 bg-secondary/50">
              <div className="flex items-center gap-2">
                <Avatar className="flex-shrink-0">
                  {user.data?.image_url && (
                    <AvatarImage src={user.data.image_url}></AvatarImage>
                  )}
                  <AvatarFallback>
                    {user.data?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.data?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.data?.email}
                  </p>
                </div>
              </div>
              {/* Sisa Saldo */}
              <div className="mt-4 pt-4 flex items-center justify-between border-t border-border">
                <p className="text-sm font-medium text-foreground">Saldo</p>
                <p className="text-sm font-semibold text-primary">
                  Rp {user.data?.balance.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 p-2">
          {navData.navMain.items.map((item) => (
            <NavLinkWithLocale
              key={item.label}
              to={item.href}
              end={item.href === "/" || item.href === `/id`}
              onClick={() => setIsOpenSidebar(false)}
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    "flex items-center gap-2.5 p-2 text-sm mb-2 rounded-md font-medium text-foreground",
                    {
                      "bg-primary text-primary-foreground": isActive,
                      "hover:bg-secondary": !isActive,
                    },
                  )}
                >
                  {item.icon}
                  {t(item.local_label as LocalLabel)}
                </div>
              )}
            </NavLinkWithLocale>
          ))}
        </div>

        {user.isSuccess && user.data.role !== UserRole.GUEST && (
          <div className="space-y-2 p-2">
            <h3 className="text-xs font-semibold">User</h3>

            {navData.navUser.items.map((item) => (
              <NavLinkWithLocale
                key={item.label}
                to={item.href}
                end={true}
                onClick={() => setIsOpenSidebar(false)}
              >
                {({ isActive }) => (
                  <div
                    className={cn(
                      "flex items-center gap-2.5 p-2 text-sm mb-2 rounded-md font-medium text-foreground",
                      {
                        "bg-primary text-primary-foreground": isActive,
                        "hover:bg-secondary": !isActive,
                      },
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                )}
              </NavLinkWithLocale>
            ))}
          </div>
        )}
        {user.isSuccess && user.data.role === UserRole.GUEST && (
          <div className="mt-auto p-4">
            <Button variant="secondary" className="w-full" asChild>
              <LinkWithLocale to="/auth/register">Daftar</LinkWithLocale>
            </Button>
            <Button className="w-full mt-2" asChild>
              <LinkWithLocale to="/auth/login">Masuk</LinkWithLocale>
            </Button>
          </div>
        )}

        {/* Logout Button */}
        {user.isSuccess && user.data.role !== UserRole.GUEST && (
          <div className="p-4 mt-auto">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                // Handle logout logic here
                setIsOpenSidebar(false);
              }}
            >
              Keluar
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
