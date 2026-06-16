import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Plus, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) toast.error(error.message)
      else setPosts((data as BlogPost[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return posts
    return posts.filter((p) => p.status === statusFilter)
  }, [posts, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground">{filtered.length} bài viết</p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="h-4 w-4" />
            Viết bài mới
          </Link>
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader />
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Tiêu đề</th>
                  <th className="pb-3 pr-4 font-medium">Danh mục</th>
                  <th className="pb-3 pr-4 font-medium">Ngày</th>
                  <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">Chưa có bài viết</td>
                  </tr>
                ) : (
                  filtered.map((post) => (
                    <tr key={post.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium max-w-xs truncate">{post.title}</td>
                      <td className="py-3 pr-4">{post.category}</td>
                      <td className="py-3 pr-4">{formatDate(post.published_at ?? post.created_at)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={post.status === 'published' ? 'success' : 'secondary'}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/blog/${post.id}`}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
