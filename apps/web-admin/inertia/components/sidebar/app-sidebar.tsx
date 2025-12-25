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
      title: 'Products Prabayar',
      url: '#',
      icon: ShoppingBagIcon,
      isActive: false,
      items: [
        {
          title: 'All Products',
          url: '/admin/product-categories',
        },
        {
          title: 'Games',
          url: '/admin/product-categories/game',
        },
        {
          title: 'Pulsa',
          url: '/admin/product-categories/pulsa',
        },
        {
          title: 'Kuota Data',
          url: '/admin/product-categories/kuota',
        },
        {
          title: 'Token PLN (Prepaid)',
          url: '/admin/product-categories/token-pln',
        },
        {
          title: 'E-Wallet',
          url: '/admin/product-categories/e-wallet',
        },
        {
          title: 'Voucher',
          url: '/admin/product-categories/voucher',
        },
        {
          title: 'App Premium',
          url: '/admin/product-categories/app-premium',
        },
        {
          title: 'Other Prepaid',
          url: '/admin/product-categories/other-prepaid',
        },
      ],
    },
    {
      title: 'Products Pascabayar',
      url: '#',
      icon: ShoppingBagIcon,
      isActive: false,
      items: [
        {
          title: 'All Products',
          url: '/admin/product-categories/postpaid',
        },
        {
          title: 'PLN Tagihan (Postpaid)',
          url: '/admin/product-categories/pln-tagihan',
        },
        {
          title: 'PLN Non Taglist (Postpaid)',
          url: '/admin/product-categories/pln-non-taglist',
        },
        {
          title: 'PDAM',
          url: '/admin/product-categories/pdam',
        },
        {
          title: 'Internet',
          url: '/admin/product-categories/internet',
        },
        {
          title: 'Kuota Rekomendasi',
          url: '/admin/product-categories/kuota-rekomendasi',
        },
        {
          title: 'BPJS Kesehatan',
          url: '/admin/product-categories/bpjs-kesehatan',
        },
        {
          title: 'BPJS Ketenagakerjaan',
          url: '/admin/product-categories/bpjs-ketenagakerjaan',
        },
        {
          title: 'Other Postpaid',
          url: '/admin/product-categories/other-postpaid',
        },
      ],
    },
    {
      title: 'Products Fitur Khusus',
      url: '#',
      icon: ShoppingBagIcon,
      isActive: false,
      items: [
        {
          title: 'Send Money',
          url: '/admin/product-categories/send-money',
        },
        {
          title: 'Ewallet (Bebas Nominal)',
          url: '/admin/product-categories/e-wallet-bebas-nominal',
        },
        {
          title: 'E-Money',
          url: '/admin/product-categories/e-money',
        },
        {
          title: 'Kereta Api',
          url: '/admin/product-categories/kereta-api',
        },
      ],
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
