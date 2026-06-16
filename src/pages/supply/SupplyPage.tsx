import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from '@/types/database'
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
  TableActionButton,
} from '@/components/DataTable'
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
  const [category, setCategory] = useState<string>('All')
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
    if (category === 'All') return products
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
      toast.error('Please enter a product name')
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
      toast.success(editing ? 'Product updated' : 'Product added')
      setModalOpen(false)
      fetchProducts()
    }
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete product "${product.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) toast.error(error.message)
    else {
      toast.success('Product deleted')
      fetchProducts()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supply Product Management</h1>
          <p className="text-muted-foreground">{filtered.length} products</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <FilterTabs
        value={category}
        onValueChange={setCategory}
        items={PRODUCT_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
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
                <DataTableTh>Product Name</DataTableTh>
                <DataTableTh>Category</DataTableTh>
                <DataTableTh>Unit</DataTableTh>
                <DataTableTh>Badge</DataTableTh>
                <DataTableTh>Status</DataTableTh>
                <DataTableTh>Actions</DataTableTh>
              </DataTableHead>
              <DataTableBody>
                {filtered.length === 0 ? (
                  <DataTableEmpty colSpan={6} />
                ) : (
                  filtered.map((product) => (
                    <DataTableRow key={product.id} interactive={false}>
                      <DataTableTd className="font-medium">{product.name}</DataTableTd>
                      <DataTableTd>{product.category}</DataTableTd>
                      <DataTableTd muted>{product.unit}</DataTableTd>
                      <DataTableTd>
                        {product.badge ? <Badge variant="outline">{product.badge}</Badge> : '—'}
                      </DataTableTd>
                      <DataTableTd>
                        <Badge variant={product.is_active ? 'enrolled' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </DataTableTd>
                      <DataTableTd>
                        <div className="flex gap-1">
                          <TableActionButton onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </TableActionButton>
                          <TableActionButton
                            className="hover:text-red-400"
                            onClick={() => deleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </TableActionButton>
                        </div>
                      </DataTableTd>
                    </DataTableRow>
                  ))
                )}
              </DataTableBody>
            </DataTable>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Badge (optional)</Label>
              <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Bestseller, New..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
            <Button className="w-full" onClick={saveProduct} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
