import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Cài đặt hệ thống Noko Admin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Noko Admin Dashboard v1.0</p>
          <p>Supabase Auth · Chỉ email @noko.com</p>
          <p>Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY</p>
        </CardContent>
      </Card>
    </div>
  )
}
