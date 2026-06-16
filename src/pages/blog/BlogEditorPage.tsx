import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Eye, Save } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { BlogPost, BlogStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { ImageUpload } from '@/components/ImageUpload'

const BLOG_CATEGORIES = ['Tin tức', 'Hướng dẫn', 'Case study', 'Sản phẩm', 'Academy']

export function BlogEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const postIdRef = useRef(id)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'Tin tức',
    thumbnail: '',
    summary: '',
    content: '',
    status: 'draft' as BlogStatus,
    tags: '',
  })

  const formRef = useRef(form)
  formRef.current = form

  useEffect(() => {
    if (isNew) return

    async function load() {
      const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id!).single()
      if (error) {
        toast.error(error.message)
        navigate('/admin/blog')
        return
      }
      const post = data as BlogPost
      setForm({
        title: post.title,
        slug: post.slug,
        category: post.category,
        thumbnail: post.thumbnail ?? '',
        summary: post.summary,
        content: post.content,
        status: post.status,
        tags: (post.tags ?? []).join(', '),
      })
      setSlugManual(true)
      setLoading(false)
    }
    load()
  }, [id, isNew, navigate])

  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title) }))
    }
  }, [form.title, slugManual])

  const save = useCallback(
    async (silent = false) => {
      const current = formRef.current
      if (!current.title.trim()) {
        if (!silent) toast.error('Vui lòng nhập tiêu đề')
        return false
      }

      setSaving(true)
      const payload = {
        title: current.title,
        slug: current.slug || slugify(current.title),
        category: current.category,
        thumbnail: current.thumbnail || null,
        summary: current.summary,
        content: current.content,
        status: current.status,
        tags: current.tags.split(',').map((t) => t.trim()).filter(Boolean),
        author_id: user?.id ?? null,
        published_at: current.status === 'published' ? new Date().toISOString() : null,
      }

      const currentId = postIdRef.current
      let error

      if (!currentId || currentId === 'new') {
        const { data, error: insertError } = await supabase
          .from('blog_posts')
          .insert(payload)
          .select('id')
          .single()
        error = insertError
        if (!error && data) {
          postIdRef.current = data.id
          if (!silent) toast.success('Đã tạo bài viết')
          navigate(`/admin/blog/${data.id}`, { replace: true })
        }
      } else {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', currentId)
        error = updateError
        if (!error && !silent) toast.success('Đã lưu bài viết')
      }

      setSaving(false)
      if (error) {
        if (!silent) toast.error(error.message)
        return false
      }

      setLastSavedAt(new Date())
      return true
    },
    [navigate, user?.id],
  )

  useEffect(() => {
    postIdRef.current = id
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef.current.title.trim()) {
        save(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [save])

  const saveIndicator = saving
    ? 'Đang lưu...'
    : lastSavedAt
      ? `Đã lưu lúc ${lastSavedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
      : 'Auto-save mỗi 30 giây'

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}</h1>
          <p className={`text-sm ${saving ? 'text-primary' : 'text-muted-foreground'}`}>{saveIndicator}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={() => save()} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugManual(true)
                setForm({ ...form, slug: e.target.value })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Tóm tắt</Label>
            <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Nội dung</Label>
            <RichTextEditor
              key={id ?? 'new'}
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ImageUpload
                label="Thumbnail"
                value={form.thumbnail}
                onChange={(url) => setForm({ ...form, thumbnail: url })}
              />
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BlogStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags (phân cách bằng dấu phẩy)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="noko, supply, academy" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <article>
            {form.thumbnail && (
              <img src={form.thumbnail} alt="" className="mb-4 w-full rounded-lg object-cover max-h-64" />
            )}
            <h1 className="text-2xl font-bold mb-2">{form.title || 'Tiêu đề bài viết'}</h1>
            <p className="text-muted-foreground mb-4">{form.summary}</p>
            <div className="blog-prose text-base" dangerouslySetInnerHTML={{ __html: form.content }} />
          </article>
        </DialogContent>
      </Dialog>
    </div>
  )
}
