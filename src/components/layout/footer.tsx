import { footerNav } from "@/config/navigation"
import { siteConfig } from "@/config/site"

export function Footer() {
  return (
    <footer className="border-t-2 border-imperium-steel-dark bg-imperium-black-deep">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="font-display text-sm uppercase tracking-wider text-imperium-crimson">About</h3>
            <p className="font-terminal text-sm text-imperium-steel">
              {siteConfig.description}
            </p>
          </div>
          {footerNav.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="font-display text-sm uppercase tracking-wider text-imperium-crimson">{column.title}</h3>
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="font-terminal text-sm text-imperium-steel hover:text-imperium-crimson transition-colors border-l-2 border-transparent hover:border-imperium-crimson pl-2"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t-2 border-imperium-steel-dark pt-8 text-center">
          <p className="font-terminal text-sm text-imperium-steel-dark">
            {'//'} &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved. {'//'}
          </p>
        </div>
      </div>
    </footer>
  )
}
