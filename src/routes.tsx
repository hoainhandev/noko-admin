import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoginPage } from '@/pages/login/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LeadsPage } from '@/pages/leads/LeadsPage'
import { AcademyLeadsPage } from '@/pages/leads/AcademyLeadsPage'
import { SupplyLeadsPage } from '@/pages/leads/SupplyLeadsPage'
import { AcademyPage } from '@/pages/academy/AcademyPage'
import { SupplyPage } from '@/pages/supply/SupplyPage'
import { BlogListPage } from '@/pages/blog/BlogListPage'
import { BlogEditorPage } from '@/pages/blog/BlogEditorPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ContactListPage } from '@/pages/ContactList'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'leads', element: <LeadsPage /> },
          { path: 'leads/academy', element: <AcademyLeadsPage /> },
          { path: 'leads/supply', element: <SupplyLeadsPage /> },
          { path: 'academy', element: <AcademyPage /> },
          { path: 'supply', element: <SupplyPage /> },
          { path: 'blog', element: <BlogListPage /> },
          { path: 'blog/new', element: <BlogEditorPage /> },
          { path: 'blog/:id', element: <BlogEditorPage /> },
          { path: 'contacts', element: <ContactListPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin" replace />,
  },
])
