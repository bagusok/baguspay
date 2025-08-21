import { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/react'
import { SidebarInset, SidebarProvider } from '@repo/ui/components/ui/sidebar'
import { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { AppSidebar } from '../sidebar/app-sidebar'
import { SiteHeader } from '../sidebar/site-header'

export const query = new QueryClient()

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage<SharedProps>()

  useEffect(() => {
    if (props.success) {
      // Show success message using toast
      toast.success(props.success)
    }

    if (props.errors) {
      if (props.errors.error) {
        // Show error message using toast
        toast.error(props.errors.error)
      }
    }
  }, [props])

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-6 lg:p-12">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
