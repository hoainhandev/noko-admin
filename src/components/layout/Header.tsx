import { Link, useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

const routeLabels: Record<string, string> = {
  admin: 'Dashboard',
  leads: 'Leads',
  academy: 'Academy',
  supply: 'Supply',
  blog: 'Blog',
  contacts: 'Contact Messages',
  new: 'New Post',
  settings: 'Settings',
  login: 'Login',
}

export function Header() {
  const location = useLocation()
  const { user } = useAuth()

  const segments = location.pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] ?? (seg.length > 20 ? 'Details' : seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'NA'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#F5F0E8]/10 bg-[#1B2B6B] px-6 backdrop-blur-md">
      <nav className="flex items-center gap-1 text-sm text-[#C4BAA8]">
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {crumb.href !== crumbs[0].href && <ChevronRight className="h-4 w-4" />}
            {crumb.isLast ? (
              <span className="font-medium text-[#F5F0E8]">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="hover:text-[#F5F0E8] transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-[#C4BAA8] sm:block">{user?.email}</span>
        <Avatar className="border border-[#F5F0E8]/20">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
