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
          <p className="text-muted-foreground">{filtered.length} posts</p>
        </div>
        <Button asChild>
          <Link to="/admin/blog/new">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <FilterTabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        items={[
          { value: 'all', label: 'All' },
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Draft' },
        ]}
      />

      <Card>
        <CardHeader />
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable>
              <DataTableHead>
                <DataTableTh>Title</DataTableTh>
                <DataTableTh>Category</DataTableTh>
                <DataTableTh>Date</DataTableTh>
                <DataTableTh>Status</DataTableTh>
                <DataTableTh>Actions</DataTableTh>
              </DataTableHead>
              <DataTableBody>
                {filtered.length === 0 ? (
                  <DataTableEmpty colSpan={5} message="No posts yet" />
                ) : (
                  filtered.map((post) => (
                    <DataTableRow key={post.id} interactive={false}>
                      <DataTableTd className="font-medium max-w-xs truncate">{post.title}</DataTableTd>
                      <DataTableTd>{post.category}</DataTableTd>
                      <DataTableTd muted>{formatDate(post.published_at ?? post.created_at)}</DataTableTd>
                      <DataTableTd>
                        <Badge variant={post.status === 'published' ? 'enrolled' : 'secondary'}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </DataTableTd>
                      <DataTableTd>
                        <Link
                          to={`/admin/blog/${post.id}`}
                          className="inline-flex p-1.5 rounded-lg text-[#C4BAA8] hover:text-[#F5F0E8] hover:bg-[#F5F0E8]/10 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
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
