'use client'

import { Link } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/ui/sidebar'
import {
  ArrowLeftRight,
  BanknoteArrowDown,
  Command,
  DollarSignIcon,
  FileTextIcon,
  LayoutGrid,
  NewspaperIcon,
  PenIcon,
  RefreshCcwIcon,
  Settings2Icon,
  ShoppingBagIcon,
  TicketIcon,
  UserIcon,
} from 'lucide-react'
import type * as React from 'react'
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
          url: '/admin/product-categories/postpaid/tagihan-pln',
        },
        {
          title: 'PLN Non Taglist (Postpaid)',
          url: '/admin/product-categories/postpaid/pln-non-taglist',
        },
        {
          title: 'PDAM',
          url: '/admin/product-categories/postpaid/pdam',
        },
        {
          title: 'Internet',
          url: '/admin/product-categories/postpaid/internet',
        },
        {
          title: 'Kuota Rekomendasi',
          url: '/admin/product-categories/postpaid/kuota-rekomendasi',
        },
        {
          title: 'BPJS Kesehatan',
          url: '/admin/product-categories/postpaid/bpjs-kesehatan',
        },
        {
          title: 'BPJS Ketenagakerjaan',
          url: '/admin/product-categories/postpaid/bpjs-ketenagakerjaan',
        },
        {
          title: 'Other Postpaid',
          url: '/admin/product-categories/postpaid/other-postpaid',
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
    {
      title: 'Blog',
      url: '#',
      icon: NewspaperIcon,
      items: [
        {
          title: 'Articles',
          url: '/admin/blog/articles',
        },
        {
          title: 'Categories',
          url: '/admin/blog/categories',
        },
      ],
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
    {
      title: 'Pages',
      url: '#',
      icon: FileTextIcon,
      items: [
        {
          title: 'Manage Pages',
          url: '/admin/config/pages',
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
              <Link href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Baguspay</span>
                  <span className="truncate text-xs">Admin Page</span>
                </div>
              </Link>
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
