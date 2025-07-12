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
      items: [
        {
          title: 'Product Categories',
          url: '/admin/product-categories',
        },
        {
          title: 'Add Product Category',
          url: '/admin/product-categories/create',
        },
        {
          title: 'Product Sub Categories',
          url: '/admin/product-sub-categories',
        },
        {
          title: 'Add Product Sub Category',
          url: '/admin/product-sub-categories/create',
        },
        {
          title: 'Products',
          url: '/admin/products',
        },
        {
          title: 'Add Product',
          url: '/admin/products/create',
        },
      ],
    },
    {
      title: 'Inputs',
      url: '#',
      icon: PenIcon,
      items: [
        {
          title: 'List Inputs',
          url: '/admin/inputs',
        },
        {
          title: 'Add Input',
          url: '/admin/inputs/create',
        },
      ],
    },
    {
      title: 'Payment Methods',
      url: '/admin/payment-methods',
      icon: DollarSignIcon,
      items: [
        {
          title: 'List Payment Methods',
          url: '/admin/payment-methods',
        },
        {
          title: 'Add Payment Method',
          url: '/admin/payment-methods/create',
        },
      ],
    },
    {
      title: 'Deposits',
      url: '/admin/deposits',
      icon: BanknoteArrowDown,
      items: [
        {
          title: 'List Deposits',
          url: '/admin/deposits',
        },
        {
          title: 'Add Deposit',
          url: '/admin/deposits/create',
        },
      ],
    },
    {
      title: 'Orders',
      url: '/admin/orders',
      icon: ArrowLeftRight,
      items: [
        {
          title: 'List Orders',
          url: '/admin/orders',
        },
        {
          title: 'Add Order',
          url: '/admin/orders/create',
        },
      ],
    },
    {
      title: 'Balance Mutations',
      url: '/admin/balance-mutations',
      icon: RefreshCcwIcon,
      items: [
        {
          title: 'List Orders',
          url: '/admin/balance-mutations',
        },
      ],
    },
    {
      title: 'User Managements',
      url: '/admin/users',
      icon: UserIcon,
      items: [
        {
          title: 'List Users',
          url: '/admin/users',
        },
        {
          title: 'Add User',
          url: '/admin/users/create',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
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
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
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
