import { Moon, Network, Sun } from 'lucide-react'
import { site } from '@/data/site'
import { useTheme } from '@/hooks/useTheme'

const links = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const { isDark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-mono text-sm font-medium">
          <Network className="size-4 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline">{site.handle}</span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="flex items-center sm:gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-md px-2 py-1.5 text-[13px] text-muted transition-colors hover:text-fg sm:px-3 sm:text-sm"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="ml-1 grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </nav>
    </header>
  )
}
