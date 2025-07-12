import { SidebarInset, SidebarProvider } from '@repo/ui/components/ui/sidebar'
import { SiteHeader } from '../sidebar/site-header'
import { AppSidebar } from '../sidebar/app-sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usePage } from '@inertiajs/react'
import { SharedProps } from '@adonisjs/inertia/types'
import { useEffect } from 'react'

const query = new QueryClient()

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage<SharedProps>()

  useEffect(() => {
    if (props.success) {
      // Show success message using toast
      toast.success(props.success)
    }

    console
  }, [props])

  return (
    <QueryClientProvider client={query}>
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </QueryClientProvider>
  )
}
