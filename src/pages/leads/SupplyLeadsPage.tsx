import { useEffect, useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { downloadCsv, formatDateTime } from '@/lib/utils'
import { LEAD_STATUS_LABELS, US_STATES, type LeadStatus, type SupplyLead } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/Pagination'

const PAGE_SIZE = 20

const statusVariant = (status: LeadStatus) => {
  if (status === 'new') return 'warning' as const
  if (status === 'contacted') return 'secondary' as const
  return 'success' as const
}

const posLabel = (pos: string) => {
  if (pos === 'pos-user') return 'Yes'
  if (pos === 'supply-only') return 'No'
  return pos
}

export function SupplyLeadsPage() {
  const [leads, setLeads] = useState<SupplyLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [posFilter, setPosFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<SupplyLead | null>(null)
  const [editStatus, setEditStatus] = useState<LeadStatus>('new')
  const [saving, setSaving] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    let query = supabase.from('supply_leads').select('*').order('created_at', { ascending: false })

    if (stateFilter !== 'all') query = query.eq('state', stateFilter)
    if (posFilter !== 'all') query = query.eq('pos_status', posFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data, error } = await query
    if (error) toast.error(error.message)
    else setLeads((data as SupplyLead[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [stateFilter, posFilter, statusFilter])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return leads
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.restaurant_name.toLowerCase().includes(q),
    )
  }, [leads, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [search, stateFilter, posFilter, statusFilter])

  const openDetail = (lead: SupplyLead) => {
    setSelected(lead)
    setEditStatus(lead.status ?? 'new')
  }

  const saveStatus = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase.from('supply_leads').update({ status: editStatus }).eq('id', selected.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Status updated')
      setSelected(null)
      fetchLeads()
    }
  }

  const exportCsv = () => {
    downloadCsv(
      'supply-leads.csv',
      ['Restaurant', 'Full Name', 'Phone', 'Email', 'State', 'POS', 'Needs', 'Date', 'Status'],
      filtered.map((l) => [
        l.restaurant_name,
        l.name,
        l.phone,
        l.email,
        l.state ?? '',
        posLabel(l.pos_status),
        (l.needs ?? []).join('; '),
        formatDateTime(l.created_at),
        LEAD_STATUS_LABELS[l.status ?? 'new'],
      ]),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads Supply</h1>
          <p className="text-muted-foreground">{filtered.length} leads</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name, phone, or restaurant..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={posFilter} onValueChange={setPosFilter}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="POS" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All POS</SelectItem>
                <SelectItem value="pos-user">Using POS</SelectItem>
                <SelectItem value="supply-only">Not using POS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="registered">Enrolled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Restaurant</th>
                    <th className="pb-3 pr-4 font-medium">Full Name</th>
                    <th className="pb-3 pr-4 font-medium">Phone</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">State</th>
                    <th className="pb-3 pr-4 font-medium">POS?</th>
                    <th className="pb-3 pr-4 font-medium">Needs</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lead) => (
                    <tr key={lead.id} className="cursor-pointer border-b border-border/50 hover:bg-muted/30" onClick={() => openDetail(lead)}>
                      <td className="py-3 pr-4 font-medium">{lead.restaurant_name}</td>
                      <td className="py-3 pr-4">{lead.name}</td>
                      <td className="py-3 pr-4">{lead.phone}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{lead.email}</td>
                      <td className="py-3 pr-4">{lead.state ?? '—'}</td>
                      <td className="py-3 pr-4">{posLabel(lead.pos_status)}</td>
                      <td className="py-3 pr-4 max-w-[150px] truncate">{(lead.needs ?? []).join(', ')}</td>
                      <td className="py-3 pr-4">{formatDateTime(lead.created_at)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant(lead.status ?? 'new')}>{LEAD_STATUS_LABELS[lead.status ?? 'new']}</Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(lead) }}>View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supply Lead Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><span className="text-muted-foreground">Restaurant:</span> {selected.restaurant_name}</p>
                <p><span className="text-muted-foreground">Full Name:</span> {selected.name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {selected.phone}</p>
                <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
                <p><span className="text-muted-foreground">State:</span> {selected.state ?? '—'}</p>
                <p><span className="text-muted-foreground">POS:</span> {posLabel(selected.pos_status)}</p>
                <p><span className="text-muted-foreground">Needs:</span> {(selected.needs ?? []).join(', ') || '—'}</p>
                <p><span className="text-muted-foreground">Date:</span> {formatDateTime(selected.created_at)}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as LeadStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="registered">Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={saveStatus} disabled={saving}>
                {saving ? 'Saving...' : 'Save Status'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
