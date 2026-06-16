import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const emptyForm = {
  name: '',
  category: 'Rau củ' as ProductCategory,
  unit: 'kg',
  badge: '',
  is_active: true,
}

export function SupplyPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('Tất cả')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at')
    if (error) toast.error(error.message)
    else setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filtered = useMemo(() => {
    if (category === 'Tất cả') return products
    return products.filter((p) => p.category === category)
  }, [products, category])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      badge: product.badge ?? '',
      is_active: product.is_active,
    })
    setModalOpen(true)
  }

  const saveProduct = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      category: form.category,
      unit: form.unit,
      badge: form.badge || null,
      is_active: form.is_active,
    }

    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload)

    setSaving(false)
    if (error) toast.error(error.message)
    else {
      toast.success(editing ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      setModalOpen(false)
      fetchProducts()
    }
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Xóa sản phẩm "${product.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) toast.error(error.message)
    else {
      toast.success('Đã xóa sản phẩm')
      fetchProducts()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm Supply</h1>
          <p className="text-muted-foreground">{filtered.length} sản phẩm</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto">
          {PRODUCT_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
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
                  <th className="pb-3 pr-4 font-medium">Tên</th>
                  <th className="pb-3 pr-4 font-medium">Danh mục</th>
                  <th className="pb-3 pr-4 font-medium">Đơn vị</th>
                  <th className="pb-3 pr-4 font-medium">Badge</th>
                  <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium">{product.name}</td>
                    <td className="py-3 pr-4">{product.category}</td>
                    <td className="py-3 pr-4">{product.unit}</td>
                    <td className="py-3 pr-4">
                      {product.badge ? <Badge variant="outline">{product.badge}</Badge> : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={product.is_active ? 'success' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteProduct(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên sản phẩm</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Badge (tùy chọn)</Label>
              <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Bestseller, Mới..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <Button className="w-full" onClick={saveProduct} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
