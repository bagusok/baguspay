import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { useLocale } from "remix-i18next/react";
import { authTokenAtom } from "~/store/token";
import type { UserMe } from "~/store/user";

type Props = {
  user: UserMe;
};

export default function NavUser({ user }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuthToken = useSetAtom(authTokenAtom);
  const locale = useLocale();

  const handleLogout = () => {
    setAuthToken(null);
    queryClient.invalidateQueries({ queryKey: ["userAtom"], exact: false });
    toast.success("Berhasil keluar");
    navigate(`/${locale}/auth/login`, { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden md:flex gap-2 overflow-hidden max-w-48 hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors">
          <Avatar className="flex-shrink-0">
            {user.image_url && <AvatarImage src={user.image_url} />}
            <AvatarFallback>
              {user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-start">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border shadoww">
        <DropdownMenuLabel className="bg-secondary rounded">
          {/* info saldo */}
          <Link
            to={`/${locale}/users/balance/mutations`}
            className="flex items-center justify-between"
          >
            <span className="text-sm font-medium text-foreground">Saldo</span>
            <span className="text-sm font-semibold text-primary">
              Rp {user.balance.toLocaleString("id-ID")}
            </span>
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to={`/${locale}/user/profile`}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to={`/${locale}/user/deposit`}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Deposit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            to={`/${locale}/user/order/history`}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            History Transaksi
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleLogout()}
          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
