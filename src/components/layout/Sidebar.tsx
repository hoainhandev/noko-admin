import { Link, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Package,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  {
    label: 'Leads',
    icon: Users,
    children: [
      { label: 'Tất cả', href: '/admin/leads' },
      { label: 'Academy', href: '/admin/leads/academy' },
      { label: 'Supply', href: '/admin/leads/supply' },
    ],
  },
  { label: 'Academy', href: '/admin/academy', icon: GraduationCap },
  { label: 'Supply', href: '/admin/supply', icon: Package },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
]

export function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const [leadsOpen, setLeadsOpen] = useState(
    location.pathname.startsWith('/admin/leads'),
  )

  const isActive = (href: string, exact = false) =>
    exact ? location.pathname === href : location.pathname.startsWith(href)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
          N
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">Noko Admin</p>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <Collapsible key={item.label} open={leadsOpen} onOpenChange={setLeadsOpen}>
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                    location.pathname.startsWith('/admin/leads') && 'bg-sidebar-accent text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {leadsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        'block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent',
                        isActive(child.href, child.href === '/admin/leads') && 'bg-sidebar-accent text-primary font-medium',
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Link
              key={item.href}
              to={item.href!}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                isActive(item.href!, item.exact) && 'bg-sidebar-accent text-primary',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-3" />

        <Link
          to="/admin/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent',
            isActive('/admin/settings') && 'bg-sidebar-accent text-primary',
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  )
}
