'use client'

import {
  ArrowLeftRight,
  BanknoteArrowDown,
  Command,
  DollarSignIcon,
  LayoutGrid,
  PenIcon,
  RefreshCcwIcon,
  Settings2Icon,
  ShoppingBagIcon,
  TicketIcon,
  UserIcon,
} from 'lucide-react'
import * as React from 'react'

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
      title: 'Offers',
      url: '#',
      icon: TicketIcon,
      items: [
        {
          title: 'Vouchers',
          url: '/admin/offers/voucher',
        },
        {
          title: 'Flash Sales',
          url: '/admin/offers/flash-sale',
        },
        {
          title: 'Discounts',
          url: '/admin/offers/discount',
        },
        {
          title: 'Offers History',
          url: '/admin/offers/history',
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
      url: '#',
      icon: ArrowLeftRight,
      items: [
        {
          title: 'Prepaid',
          url: '/admin/orders/prepaid',
        },
        {
          title: 'Postpaid',
          url: '/admin/orders/postpaid',
        },
      ],
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
  config: [
    {
      title: 'Home',
      url: '#',
      icon: LayoutGrid,
      isActive: true,
      items: [
        {
          title: 'Home Product Sections',
          url: '/admin/config/home/product-sections',
        },
        {
          title: 'Home Fast Menu',
          url: '/admin/config/home/fast-menu',
        },
        {
          title: 'Banner',
          url: '/admin/config/home/banner',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2Icon,
      items: [
        {
          title: 'General Settings',
          url: '/admin/config/settings/general',
        },
      ],
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
        <NavMain items={data.config} title="Config" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
