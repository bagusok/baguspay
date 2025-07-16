'use client'

import * as React from 'react'
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  ShoppingBagIcon,
  PenIcon,
  DollarSignIcon,
  BanknoteArrowDown,
  ArrowLeftRight,
  RefreshCcwIcon,
  UserIcon,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/ui/sidebar'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Products',
      url: '/admin/product-categories',
      icon: ShoppingBagIcon,
      isActive: true,
      items: [],
    },
    {
      title: 'Inputs',
      url: '/admin/input-fields',
      icon: PenIcon,
      items: [],
    },
    {
      title: 'Payments',
      url: '#',
      icon: DollarSignIcon,
      items: [
        {
          title: 'Categories',
          url: '/admin/payments/categories',
        },
        {
          title: 'Payment Methods',
          url: '/admin/payments/methods',
        },
      ],
    },
    {
      title: 'Deposits',
      url: '/admin/deposits',
      icon: BanknoteArrowDown,
      items: [],
    },
    {
      title: 'Orders',
      url: '/admin/orders',
      icon: ArrowLeftRight,
      items: [],
    },
    {
      title: 'Balance Mutations',
      url: '/admin/balance-mutations',
      icon: RefreshCcwIcon,
      items: [],
    },
    {
      title: 'User Managements',
      url: '/admin/users',
      icon: UserIcon,
      items: [],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Baguspay</span>
                  <span className="truncate text-xs">Admin Page</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
