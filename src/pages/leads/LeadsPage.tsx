import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { LEAD_STATUS_LABELS, type AcademyRegistration, type LeadStatus, type SupplyLead } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterTabs } from '@/components/FilterTabs'
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from '@/components/DataTable'

type CombinedLead =
  | (AcademyRegistration & { type: 'academy' })
  | (SupplyLead & { type: 'supply' })

const statusVariant = (status: LeadStatus) => {
  if (status === 'new') return 'warning' as const
  if (status === 'contacted') return 'secondary' as const
  return 'enrolled' as const
}

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
              <FilterTabs
                value={typeFilter}
                onValueChange={setTypeFilter}
                items={[
                  { value: 'all', label: 'All' },
                  { value: 'academy', label: 'Academy' },
                  { value: 'supply', label: 'Supply' },
                ]}
              />
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
            <DataTable>
              <DataTableHead>
                <DataTableTh>Type</DataTableTh>
                <DataTableTh>Full Name</DataTableTh>
                <DataTableTh>Phone</DataTableTh>
                <DataTableTh>Email</DataTableTh>
                <DataTableTh>Details</DataTableTh>
                <DataTableTh>Date</DataTableTh>
                <DataTableTh>Status</DataTableTh>
              </DataTableHead>
              <DataTableBody>
                {filtered.length === 0 ? (
                  <DataTableEmpty colSpan={7} />
                ) : (
                  filtered.map((lead) => (
                    <DataTableRow key={`${lead.type}-${lead.id}`} interactive={false}>
                      <DataTableTd>
                        <Badge variant={lead.type === 'academy' ? 'enrolled' : 'secondary'}>
                          {lead.type === 'academy' ? 'Academy' : 'Supply'}
                        </Badge>
                      </DataTableTd>
                      <DataTableTd className="font-medium">{lead.name}</DataTableTd>
                      <DataTableTd>{lead.phone}</DataTableTd>
                      <DataTableTd muted>{lead.email}</DataTableTd>
                      <DataTableTd>
                        {lead.type === 'academy' ? (lead.course ?? '—') : lead.restaurant_name}
                      </DataTableTd>
                      <DataTableTd muted>{formatDateTime(lead.created_at)}</DataTableTd>
                      <DataTableTd>
                        <Badge variant={statusVariant(lead.status ?? 'new')}>
                          {LEAD_STATUS_LABELS[lead.status ?? 'new']}
                        </Badge>
                      </DataTableTd>
                    </DataTableRow>
                  ))
                )}
              </DataTableBody>
            </DataTable>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
