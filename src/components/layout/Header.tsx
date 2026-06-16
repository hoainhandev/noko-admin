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
  new: 'Viết bài mới',
  settings: 'Settings',
  login: 'Đăng nhập',
}

export function Header() {
  const location = useLocation()
  const { user } = useAuth()

  const segments = location.pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] ?? (seg.length > 20 ? 'Chi tiết' : seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'NA'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {crumb.href !== crumbs[0].href && <ChevronRight className="h-4 w-4" />}
            {crumb.isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:block">{user?.email}</span>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
