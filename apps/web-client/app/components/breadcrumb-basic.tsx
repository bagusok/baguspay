import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/ui/breadcrumb'
import React, { useId } from 'react'
import { Link } from 'react-router'

export interface BreadcrumbItemType {
  label: React.ReactNode
  href?: string
}

export interface BreadcrumbBasicProps {
  items: BreadcrumbItemType[]
}

export default function BreadcrumbBasic({ items }: BreadcrumbBasicProps) {
  const randId = useId()

  // Jika tidak ada item, jangan render apa-apa
  if (!items || items.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={randId}>
              <BreadcrumbItem>
                {!isLast && item.href ? (
                  <Link to={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
