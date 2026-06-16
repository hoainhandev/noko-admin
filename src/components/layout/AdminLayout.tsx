import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-60">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
