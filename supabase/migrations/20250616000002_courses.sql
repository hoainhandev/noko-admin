-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);

-- Seed 4 default courses
INSERT INTO courses (name, description, target, content, price, is_active)
VALUES
  (
    'Khóa 1 — Mở quán từ A–Z',
    'Hướng dẫn toàn diện từ ý tưởng đến khai trương quán ăn đầu tiên.',
    'Người mới bắt đầu, chưa có kinh nghiệm F&B',
    'Concept & branding, chọn địa điểm, thiết kế menu, tuyển dụng, marketing khai trương.',
    2990000,
    true
  ),
  (
    'Khóa 2 — Vận hành & Tối ưu',
    'Tối ưu chi phí, quy trình bếp và vận hành hàng ngày.',
    'Chủ quán đang vận hành 1–2 năm',
    'Food cost, inventory, SOP bếp, quản lý nhân sự, KPI vận hành.',
    3990000,
    true
  ),
  (
    'Khóa 3 — Mở rộng chuỗi',
    'Chuẩn hóa quy trình và mở rộng từ 1 quán lên chuỗi.',
    'Chủ quán muốn scale',
    'Franchise model, chuẩn hóa SOP, quản lý đa chi nhánh, tài chính chuỗi.',
    5990000,
    true
  ),
  (
    'Khóa 4 — Đào tạo nhân viên',
    'Xây dựng đội ngũ và chương trình đào tạo nội bộ.',
    'Chủ quán / quản lý cấp cao',
    'Onboarding, training manual, đánh giá hiệu suất, văn hóa doanh nghiệp.',
    1990000,
    true
  )
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active courses"
  ON courses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated noko admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@noko.com')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@noko.com');
