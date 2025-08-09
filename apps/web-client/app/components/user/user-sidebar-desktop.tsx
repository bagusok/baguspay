import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { cn } from "@repo/ui/lib/utils";
import { useAtomValue } from "jotai";
import { userAtom } from "~/store/user";
import { navData } from "../header";
import NavLinkWithLocale from "../navlink";

export default function UserSidebarDesktop() {
  const user = useAtomValue(userAtom);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-950 border rounded-xl border-gray-200 dark:border-gray-800 h-fit sticky top-24">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <Avatar className="w-8 h-8">
              {user.data?.image_url && (
                <AvatarImage src={user.data?.image_url} />
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
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.data?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.data?.email || "Tidak ada email"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navData.navUser.items.map((item) => {
            return (
              <li key={item.href}>
                <NavLinkWithLocale to={item.href} end={true}>
                  {({ isActive }) => (
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200",
                        {
                          "bg-primary text-primary-foreground shadow-sm":
                            isActive,
                          "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white":
                            !isActive,
                        },
                      )}
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </div>
                  )}
                </NavLinkWithLocale>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
