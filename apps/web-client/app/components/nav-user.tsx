import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu'
import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router'
import { useLocale } from 'remix-i18next/react'
import { authTokenAtom } from '~/store/token'
import type { UserMe } from '~/store/user'

type Props = {
  user: UserMe
}

export default function NavUser({ user }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuthToken = useSetAtom(authTokenAtom)
  const locale = useLocale()

  const handleLogout = () => {
    setAuthToken(null)
    queryClient.invalidateQueries({ queryKey: ['userAtom'], exact: false })
    toast.success('Berhasil keluar')
    navigate(`/${locale}/auth/login`, { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden md:flex gap-2 overflow-hidden max-w-48 rounded-md transition-colors"
        >
          <Avatar className="shrink-0 w-10 h-10 hover:opacity-75">
            {user.image_url && <AvatarImage src={user.image_url} />}
            <AvatarFallback className="text-sm font-bold uppercase bg-secondary text-primary">
              {user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 border-0 dark:border dark:border-border"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal px-2 py-3">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <div className="px-2 pb-2">
          <Link
            to={`/${locale}/user/balance/mutations`}
            className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group"
          >
            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
              Saldo Active
            </span>
            <span className="text-sm font-bold text-primary">
              Rp {user.balance.toLocaleString('id-ID')}
            </span>
          </Link>
        </div>

        <DropdownMenuSeparator />
        <div className="p-1">
          <DropdownMenuItem asChild className="mb-0.5">
            <Link to={`/${locale}/user/profile`} className="cursor-pointer font-medium">
              Profile Saya
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="mb-0.5">
            <Link to={`/${locale}/user/deposit`} className="cursor-pointer font-medium">
              Isi Saldo
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/${locale}/user/orders`} className="cursor-pointer font-medium">
              Riwayat Transaksi
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleLogout()}
          className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground mt-1"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
