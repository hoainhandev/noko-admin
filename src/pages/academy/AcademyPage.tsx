import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Course } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export function AcademyPage() {
  const [courses, setCourses] = useState<(Course & { leadCount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState({ name: '', description: '', target: '', content: '', price: 0, is_active: true })
  const [saving, setSaving] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    const [coursesRes, leadsRes] = await Promise.all([
      supabase.from('courses').select('*').order('created_at'),
      supabase.from('academy_registrations').select('course'),
    ])

    if (coursesRes.error) toast.error(coursesRes.error.message)

    const leadCounts = new Map<string, number>()
    leadsRes.data?.forEach((l) => {
      if (l.course) leadCounts.set(l.course, (leadCounts.get(l.course) ?? 0) + 1)
    })

    setCourses(
      ((coursesRes.data as Course[]) ?? []).map((c) => ({
        ...c,
        leadCount: leadCounts.get(c.name) ?? 0,
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const openEdit = (course: Course) => {
    setEditing(course)
    setForm({
      name: course.name,
      description: course.description,
      target: course.target,
      content: course.content,
      price: course.price,
      is_active: course.is_active,
    })
  }

  const saveCourse = async () => {
    if (!editing) return
    setSaving(true)
    const { error } = await supabase
      .from('courses')
      .update({
        name: form.name,
        description: form.description,
        target: form.target,
        content: form.content,
        price: form.price,
        is_active: form.is_active,
      })
      .eq('id', editing.id)

    setSaving(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Course updated')
      setEditing(null)
      fetchCourses()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">4 Noko Academy courses</p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-lg leading-snug">{course.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={course.is_active ? 'success' : 'secondary'}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{course.leadCount} leads</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openEdit(course)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <p className="mt-2 text-sm font-medium text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Course Content</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Price (VND)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active status</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <Button className="w-full" onClick={saveCourse} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
