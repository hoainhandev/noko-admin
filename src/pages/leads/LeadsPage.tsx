import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { LEAD_STATUS_LABELS, type AcademyRegistration, type SupplyLead } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CombinedLead =
  | (AcademyRegistration & { type: 'academy' })
  | (SupplyLead & { type: 'supply' })

export function LeadsPage() {
  const [leads, setLeads] = useState<CombinedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const [academy, supply] = await Promise.all([
        supabase.from('academy_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('supply_leads').select('*').order('created_at', { ascending: false }),
      ])

      if (academy.error || supply.error) {
        toast.error(academy.error?.message ?? supply.error?.message)
      }

      const combined: CombinedLead[] = [
        ...((academy.data as AcademyRegistration[]) ?? []).map((l) => ({ ...l, type: 'academy' as const })),
        ...((supply.data as SupplyLead[]) ?? []).map((l) => ({ ...l, type: 'supply' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setLeads(combined)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = leads
    if (typeFilter === 'academy') result = result.filter((l) => l.type === 'academy')
    if (typeFilter === 'supply') result = result.filter((l) => l.type === 'supply')

    const q = search.toLowerCase().trim()
    if (!q) return result

    return result.filter((l) => {
      if (l.type === 'academy') {
        return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.email.toLowerCase().includes(q)
      }
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.restaurant_name.toLowerCase().includes(q)
      )
    })
  }, [leads, search, typeFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Leads</h1>
        <p className="text-muted-foreground">
          Academy + Supply ·{' '}
          <Link to="/admin/leads/academy" className="text-primary hover:underline">Academy</Link>
          {' · '}
          <Link to="/admin/leads/supply" className="text-primary hover:underline">Supply</Link>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{filtered.length} leads</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="academy">Academy</TabsTrigger>
                  <TabsTrigger value="supply">Supply</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">Full Name</th>
                  <th className="pb-3 pr-4 font-medium">Phone</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Details</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={`${lead.type}-${lead.id}`} className="border-b border-border/50">
                    <td className="py-3 pr-4">
                      <Badge variant={lead.type === 'academy' ? 'default' : 'secondary'}>
                        {lead.type === 'academy' ? 'Academy' : 'Supply'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 font-medium">{lead.name}</td>
                    <td className="py-3 pr-4">{lead.phone}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{lead.email}</td>
                    <td className="py-3 pr-4">
                      {lead.type === 'academy' ? (lead.course ?? '—') : lead.restaurant_name}
                    </td>
                    <td className="py-3 pr-4">{formatDateTime(lead.created_at)}</td>
                    <td className="py-3">{LEAD_STATUS_LABELS[lead.status ?? 'new']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
