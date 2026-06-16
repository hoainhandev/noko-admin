import { useEffect, useMemo, useState } from 'react'
import { Download, Mail, Search } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { downloadCsv, formatDateTime } from '@/lib/utils'
import { CONTACT_STATUS_LABELS, type ContactStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/Pagination'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  service?: string | null
  interested_in?: string | null
  service_interest?: string | null
  status: ContactStatus
  created_at: string
}

const PAGE_SIZE = 20

const statusVariant = (status: ContactStatus) => {
  if (status === 'new') return 'destructive' as const
  if (status === 'read') return 'secondary' as const
  return 'success' as const
}

function getService(msg: ContactMessage): string {
  return msg.service_interest ?? msg.interested_in ?? msg.service ?? 'Other'
}

export function ContactListPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContactStatus>('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [editStatus, setEditStatus] = useState<ContactStatus>('new')
  const [savingStatus, setSavingStatus] = useState(false)

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const normalized = ((data as ContactMessage[]) ?? []).map((m) => ({
      ...m,
      status: (m.status ?? 'new') as ContactStatus,
    }))
    setMessages(normalized)
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const serviceOptions = useMemo(() => {
    const set = new Set(messages.map((m) => getService(m)))
    return Array.from(set).sort()
  }, [messages])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return messages.filter((m) => {
      const okSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
      const okStatus = statusFilter === 'all' || m.status === statusFilter
      const okService = serviceFilter === 'all' || getService(m) === serviceFilter
      return okSearch && okStatus && okService
    })
  }, [messages, search, statusFilter, serviceFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, serviceFilter])

  const openDetail = (msg: ContactMessage) => {
    setSelected(msg)
    setEditStatus(msg.status)
  }

  const updateStatus = async () => {
    if (!selected) return
    setSavingStatus(true)
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: editStatus })
      .eq('id', selected.id)
    setSavingStatus(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Status updated')
    setSelected(null)
    fetchMessages()
  }

  const exportCsv = () => {
    downloadCsv(
      'contact-messages.csv',
      ['Full Name', 'Email', 'Phone', 'Interested In', 'Message', 'Submitted', 'Status'],
      filtered.map((m) => [
        m.name ?? '',
        m.email ?? '',
        m.phone ?? '',
        getService(m),
        m.message ?? '',
        formatDateTime(m.created_at),
        CONTACT_STATUS_LABELS[m.status],
      ]),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">{filtered.length} messages</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Contact list</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | ContactStatus)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {serviceOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
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
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Phone</th>
                    <th className="pb-3 pr-4 font-medium">Interested In</th>
                    <th className="pb-3 pr-4 font-medium">Message</th>
                    <th className="pb-3 pr-4 font-medium">Submitted</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => openDetail(m)}
                      className="cursor-pointer border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-3 pr-4 font-medium">{m.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{m.email}</td>
                      <td className="py-3 pr-4">{m.phone ?? '—'}</td>
                      <td className="py-3 pr-4">{getService(m)}</td>
                      <td className="py-3 pr-4 max-w-[280px] truncate">{m.message}</td>
                      <td className="py-3 pr-4">{formatDateTime(m.created_at)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant(m.status)}>{CONTACT_STATUS_LABELS[m.status]}</Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDetail(m)
                          }}
                        >
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><span className="text-muted-foreground">Full Name:</span> {selected.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {selected.phone ?? '—'}</p>
                <p><span className="text-muted-foreground">Interested In:</span> {getService(selected)}</p>
                <p><span className="text-muted-foreground">Submitted:</span> {formatDateTime(selected.created_at)}</p>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm leading-relaxed">
                  {selected.message || '—'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ContactStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={updateStatus} disabled={savingStatus}>
                  {savingStatus ? 'Saving...' : 'Save Status'}
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:${selected.email}`}>
                    <Mail className="h-4 w-4" />
                    Send Reply Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
