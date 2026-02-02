import Link from "next/link"
import { BreadcrumbSchema, type BreadcrumbItem } from "./BreadcrumbSchema"

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-slate-500">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center gap-2">
            {index > 0 && <span className="text-slate-300">/</span>}
            {index === items.length - 1 ? (
              <span className="text-slate-700 dark:text-slate-300" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </nav>
    </>
  )
}
