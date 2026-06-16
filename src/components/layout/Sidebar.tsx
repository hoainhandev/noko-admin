import { Link, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
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
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  {
    label: 'Leads',
    icon: Users,
    children: [
      { label: 'All', href: '/admin/leads' },
      { label: 'Academy', href: '/admin/leads/academy' },
      { label: 'Supply', href: '/admin/leads/supply' },
    ],
  },
  { label: 'Courses', href: '/admin/academy', icon: GraduationCap },
  { label: 'Products', href: '/admin/supply', icon: Package },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
]

const navInactive =
  'text-[#C4BAA8] hover:text-[#F5F0E8] hover:bg-[#F5F0E8]/5'
const navActive =
  'bg-[#F5F0E8]/10 text-[#F5F0E8] border-l-2 border-[#E8C97A] rounded-l-none'

export function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [leadsOpen, setLeadsOpen] = useState(
    location.pathname.startsWith('/admin/leads'),
  )

  useEffect(() => {
    async function loadUnreadCount() {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
      setUnreadCount(count ?? 0)
    }
    loadUnreadCount()
  }, [location.pathname])

  const isActive = (href: string, exact = false) =>
    exact ? location.pathname === href : location.pathname.startsWith(href)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[#F5F0E8]/10 bg-[#0F1F52]">
      <div className="flex h-16 items-center gap-3 border-b border-[#F5F0E8]/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5F0E8] to-[#E8C97A] text-sm font-bold text-[#1B2B6B]">
          N
        </div>
        <div>
          <p className="text-sm font-semibold text-[#F5F0E8]">Noko Admin</p>
          <p className="text-xs text-[#C4BAA8]">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          if (item.children) {
            const leadsActive = location.pathname.startsWith('/admin/leads')
            return (
              <Collapsible key={item.label} open={leadsOpen} onOpenChange={setLeadsOpen}>
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    navInactive,
                    leadsActive && navActive,
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {leadsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l border-[#F5F0E8]/10 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                        navInactive,
                        isActive(child.href, child.href === '/admin/leads') && navActive,
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
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                navInactive,
                isActive(item.href!, item.exact) && navActive,
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <Link
          to="/admin/contacts"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            navInactive,
            isActive('/admin/contacts') && navActive,
          )}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="flex-1">Contact Messages</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#E8C97A] px-2 py-0.5 text-xs font-semibold text-[#1B2B6B]">
              {unreadCount}
            </span>
          )}
        </Link>

        <Separator className="my-3 bg-[#F5F0E8]/10" />

        <Link
          to="/admin/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            navInactive,
            isActive('/admin/settings') && navActive,
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <button
          type="button"
          onClick={() => signOut()}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            navInactive,
            'hover:text-red-400',
          )}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  )
}
