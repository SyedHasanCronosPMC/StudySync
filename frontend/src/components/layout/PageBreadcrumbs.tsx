import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type BreadcrumbItem = {
  label: string
  href?: string
}

type PageBreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  if (!items.length) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link to={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && 'text-foreground font-medium')}>{item.label}</span>
              )}
              {!isLast && <span className="text-muted-foreground">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

