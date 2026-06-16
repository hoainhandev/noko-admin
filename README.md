# Noko Admin Dashboard

Admin dashboard cho hệ sinh thái Noko — quản lý leads, khóa học Academy, sản phẩm Supply và blog.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (Auth + Database)
- React Router v7
- Recharts

## Setup

1. Copy env file:

```bash
cp .env.local.example .env.local
```

2. Điền Supabase credentials:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

3. Chạy migrations trong `supabase/migrations/` trên Supabase project.

4. Cài dependencies và chạy dev:

```bash
npm install
npm run dev
```

## Auth

- Email/password qua Supabase Auth
- Chỉ email domain `@noko.com` được phép đăng nhập
- Protected routes cho tất cả `/admin/*` trừ `/admin/login`

## Routes

| Route | Mô tả |
|-------|-------|
| `/admin/login` | Đăng nhập |
| `/admin` | Dashboard tổng quan |
| `/admin/leads` | Tất cả leads |
| `/admin/leads/academy` | Leads Academy |
| `/admin/leads/supply` | Leads Supply |
| `/admin/academy` | Quản lý khóa học |
| `/admin/supply` | Quản lý sản phẩm |
| `/admin/blog` | Danh sách bài viết |
| `/admin/blog/new` | Tạo bài mới |
| `/admin/blog/:id` | Chỉnh sửa bài viết |

## Supabase Tables

- `academy_registrations` (existing)
- `supply_leads` (existing)
- `courses` (migration)
- `products` (migration)
- `blog_posts` (migration)
