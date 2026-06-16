export type LeadStatus = 'new' | 'contacted' | 'registered'

export type BlogStatus = 'draft' | 'published'

export type ProductCategory =
  | 'Rau củ'
  | 'Thịt & Hải sản'
  | 'Gia vị'
  | 'Đồ khô'
  | 'Bao bì'

export interface AcademyRegistration {
  id: string
  name: string
  phone: string
  email: string
  course: string | null
  status: LeadStatus
  created_at: string
}

export interface SupplyLead {
  id: string
  restaurant_name: string
  name: string
  phone: string
  email: string
  state: string | null
  pos_status: string
  needs: string[]
  status: LeadStatus
  created_at: string
}

export interface Course {
  id: string
  name: string
  description: string
  target: string
  content: string
  price: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  unit: string
  badge: string | null
  is_active: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  thumbnail: string | null
  summary: string
  content: string
  status: BlogStatus
  tags: string[]
  author_id: string | null
  created_at: string
  published_at: string | null
}

export interface Database {
  public: {
    Tables: {
      academy_registrations: {
        Row: AcademyRegistration
        Insert: Partial<AcademyRegistration> & Pick<AcademyRegistration, 'name' | 'phone' | 'email'>
        Update: Partial<AcademyRegistration>
        Relationships: []
      }
      supply_leads: {
        Row: SupplyLead
        Insert: Partial<SupplyLead> & Pick<SupplyLead, 'restaurant_name' | 'name' | 'phone' | 'email'>
        Update: Partial<SupplyLead>
        Relationships: []
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Course>
        Relationships: []
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Product>
        Relationships: []
      }
      blog_posts: {
        Row: BlogPost
        Insert: Omit<BlogPost, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<BlogPost>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  registered: 'Đã đăng ký',
}

export const ACADEMY_COURSES = [
  'Khóa 1 — Mở quán từ A–Z',
  'Khóa 2 — Vận hành & Tối ưu',
  'Khóa 3 — Mở rộng chuỗi',
  'Khóa 4 — Đào tạo nhân viên',
] as const

export const PRODUCT_CATEGORIES: (ProductCategory | 'Tất cả')[] = [
  'Tất cả',
  'Rau củ',
  'Thịt & Hải sản',
  'Gia vị',
  'Đồ khô',
  'Bao bì',
]

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]
