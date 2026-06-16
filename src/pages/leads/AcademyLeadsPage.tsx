import { useEffect, useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { downloadCsv, formatDateTime } from '@/lib/utils'
import { ACADEMY_COURSES, LEAD_STATUS_LABELS, type AcademyRegistration, type LeadStatus } from '@/types/database'
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
  return 'enrolled' as const
}

export function AcademyLeadsPage() {
  const [leads, setLeads] = useState<AcademyRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AcademyRegistration | null>(null)
  const [editStatus, setEditStatus] = useState<LeadStatus>('new')
  const [saving, setSaving] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    let query = supabase.from('academy_registrations').select('*').order('created_at', { ascending: false })

    if (courseFilter !== 'all') query = query.eq('course', courseFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)

    const { data, error } = await query
    if (error) toast.error(error.message)
    else setLeads((data as AcademyRegistration[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [courseFilter, statusFilter])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return leads
    return leads.filter((l) => l.name.toLowerCase().includes(q) || l.phone.includes(q))
  }, [leads, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [search, courseFilter, statusFilter])

  const openDetail = (lead: AcademyRegistration) => {
    setSelected(lead)
    setEditStatus(lead.status ?? 'new')
  }

  const saveStatus = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase
      .from('academy_registrations')
      .update({ status: editStatus })
      .eq('id', selected.id)
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Status updated')
      setSelected(null)
      fetchLeads()
    }
  }

  const exportCsv = () => {
    downloadCsv(
      'academy-leads.csv',
      ['Full Name', 'Phone', 'Email', 'Course', 'Registration Date', 'Status'],
      filtered.map((l) => [
        l.name,
        l.phone,
        l.email,
        l.course ?? '',
        formatDateTime(l.created_at),
        LEAD_STATUS_LABELS[l.status ?? 'new'],
      ]),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Academy Leads</h1>
          <p className="text-muted-foreground">{filtered.length} leads</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {ACADEMY_COURSES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
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
                    <th className="pb-3 pr-4 font-medium">Full Name</th>
                    <th className="pb-3 pr-4 font-medium">Phone</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Registration Date</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lead) => (
                    <tr
                      key={lead.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(lead)}
                    >
                      <td className="py-3 pr-4 font-medium">{lead.name}</td>
                      <td className="py-3 pr-4">{lead.phone}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{lead.email}</td>
                      <td className="py-3 pr-4 max-w-[200px] truncate">{lead.course ?? '—'}</td>
                      <td className="py-3 pr-4">{formatDateTime(lead.created_at)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant(lead.status ?? 'new')}>
                          {LEAD_STATUS_LABELS[lead.status ?? 'new']}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(lead) }}>
                          View Details
                        </Button>
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
            <DialogTitle>Academy Lead Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><span className="text-muted-foreground">Full Name:</span> {selected.name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {selected.phone}</p>
                <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
                <p><span className="text-muted-foreground">Course:</span> {selected.course ?? '—'}</p>
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
