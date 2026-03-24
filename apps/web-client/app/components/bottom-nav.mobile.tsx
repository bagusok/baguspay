import { Home, ReceiptText, TicketPercent, User } from 'lucide-react'
import { useIsMobile } from '~/hooks/use-is-mobile'
import NavLinkWithLocale from './navlink'

const NAV_ITEMS = [
  { name: 'Beranda', icon: Home, path: '/' },
  { name: 'Riwayat', icon: ReceiptText, path: '/user/orders' },
  { name: 'Promo', icon: TicketPercent, path: '/offers' },
  { name: 'Akun', icon: User, path: '/user' },
]

export default function BottomNavMobile() {
  const isMobile = useIsMobile()

  if (!isMobile) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLinkWithLocale
              className="flex flex-col items-center gap-1"
              key={item.name}
              to={item.path}
              end={item.path === '/' || item.path === `/id`}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`size-5 transition-all duration-200 ${
                      isActive ? 'stroke-primary fill-primary/20 scale-110' : 'stroke-[1.5px]'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLinkWithLocale>
          )
        })}
      </nav>
    </div>
  )
}
