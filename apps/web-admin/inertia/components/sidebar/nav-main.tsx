'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@repo/ui/components/ui/sidebar'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'

export function NavMain({
  items,
  title = 'Main Menu',
}: {
  title?: string
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { url } = usePage()
  const pathname = url.split('?')[0]

  const isMatch = (target: string) =>
    target !== '#' && (pathname === target || pathname.startsWith(`${target}/`))

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const subActive = item.items?.some((subItem) => isMatch(subItem.url)) ?? false
          const itemActive = subActive || isMatch(item.url)
          const linkUrl = item.url === '#' && item.items?.length ? item.items[0].url : item.url

          return (
            <Collapsible key={item.title} asChild defaultOpen={itemActive || item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} data-active={itemActive}>
                  <Link href={linkUrl}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild data-active={isMatch(subItem.url)}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
