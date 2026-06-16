import { useEffect, useState } from 'react'
import { GraduationCap, Package, BookOpen, ShoppingBag, MessageSquare } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AcademyRegistration, SupplyLead } from '@/types/database'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="stat-card">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="stat-card-icon">{icon}</div>
        <div>
          <p className="stat-card-label">{title}</p>
          <p className="stat-card-value">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface ChartPoint {
  date: string
  academy: number
  supply: number
}

interface RecentLead {
  id: string
  type: 'academy' | 'supply'
  name: string
  email: string
  detail: string
  created_at: string
}

export function DashboardPage() {
  const [stats, setStats] = useState({ academy: 0, supply: 0, courses: 0, products: 0, contactsNew: 0 })
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        academyCount,
        supplyCount,
        coursesCount,
        productsCount,
        contactsNewCount,
        academyRecent,
        supplyRecent,
        academyChart,
        supplyChart,
      ] = await Promise.all([
        supabase.from('academy_registrations').select('*', { count: 'exact', head: true }),
        supabase.from('supply_leads').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('academy_registrations').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('supply_leads').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('academy_registrations').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('supply_leads').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
      ])

      setStats({
        academy: academyCount.count ?? 0,
        supply: supplyCount.count ?? 0,
        courses: coursesCount.count ?? 0,
        products: productsCount.count ?? 0,
        contactsNew: contactsNewCount.count ?? 0,
      })

      const dayMap = new Map<string, ChartPoint>()
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        dayMap.set(key, { date: formatDate(key), academy: 0, supply: 0 })
      }

      academyChart.data?.forEach((row) => {
        const key = row.created_at.slice(0, 10)
        const point = dayMap.get(key)
        if (point) point.academy++
      })

      supplyChart.data?.forEach((row) => {
        const key = row.created_at.slice(0, 10)
        const point = dayMap.get(key)
        if (point) point.supply++
      })

      setChartData(Array.from(dayMap.values()))

      const academyLeads: RecentLead[] = (academyRecent.data as AcademyRegistration[] ?? []).map((l) => ({
        id: l.id,
        type: 'academy' as const,
        name: l.name,
        email: l.email,
        detail: l.course ?? '—',
        created_at: l.created_at,
      }))

      const supplyLeads: RecentLead[] = (supplyRecent.data as SupplyLead[] ?? []).map((l) => ({
        id: l.id,
        type: 'supply' as const,
        name: l.name,
        email: l.email,
        detail: l.restaurant_name,
        created_at: l.created_at,
      }))

      const merged = [...academyLeads, ...supplyLeads]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setRecentLeads(merged)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5F0E8] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F0E8]">Dashboard</h1>
        <p className="text-[#C4BAA8]">Noko ecosystem overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Academy Leads" value={stats.academy} icon={<GraduationCap className="h-6 w-6" />} />
        <StatCard title="Total Supply Leads" value={stats.supply} icon={<Package className="h-6 w-6" />} />
        <StatCard title="Active Courses" value={stats.courses} icon={<BookOpen className="h-6 w-6" />} />
        <StatCard title="Active Products" value={stats.products} icon={<ShoppingBag className="h-6 w-6" />} />
        <StatCard title="New Messages" value={stats.contactsNew} icon={<MessageSquare className="h-6 w-6" />} />
      </div>

      <Card className="border-[#F5F0E8]/10">
        <CardHeader>
          <CardTitle className="text-[#F5F0E8]">Leads — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E8" strokeOpacity={0.1} />
                <XAxis dataKey="date" tick={{ fill: '#C4BAA8', fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#C4BAA8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#243580', border: '1px solid rgba(245,240,232,0.2)', borderRadius: 8 }}
                  labelStyle={{ color: '#F5F0E8' }}
                  itemStyle={{ color: '#C4BAA8' }}
                />
                <Legend wrapperStyle={{ color: '#C4BAA8' }} />
                <Line type="monotone" dataKey="academy" name="Academy" stroke="#F5F0E8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="supply" name="Supply" stroke="#E8C97A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#F5F0E8]/10">
        <CardHeader>
          <CardTitle className="text-[#F5F0E8]">5 latest leads</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Full Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Details</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#C4BAA8]">No leads yet</td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={`${lead.type}-${lead.id}`}>
                    <td className="py-3 pr-4">
                      <Badge variant={lead.type === 'academy' ? 'success' : 'secondary'}>
                        {lead.type === 'academy' ? 'Academy' : 'Supply'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{lead.name}</td>
                    <td className="py-3 pr-4 text-[#C4BAA8]">{lead.email}</td>
                    <td className="py-3 pr-4">{lead.detail}</td>
                    <td className="py-3">{formatDateTime(lead.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
