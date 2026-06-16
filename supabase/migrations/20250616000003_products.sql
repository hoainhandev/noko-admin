-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Rau củ', 'Thịt & Hải sản', 'Gia vị', 'Đồ khô', 'Bao bì')),
  unit TEXT NOT NULL DEFAULT 'kg',
  badge TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Seed sample products
INSERT INTO products (name, category, unit, badge, is_active)
VALUES
  ('Xương bò tươi', 'Thịt & Hải sản', 'kg', 'Bestseller', true),
  ('Rau muống', 'Rau củ', 'kg', 'Bestseller', true),
  ('Nước mắm Phú Quốc', 'Gia vị', 'thùng', 'Bestseller', true),
  ('Hải sản mix đông lạnh', 'Thịt & Hải sản', 'kg', 'Mới', true),
  ('Gạo jasmine', 'Đồ khô', 'thùng', 'Bestseller', true),
  ('Hộp take-away kraft', 'Bao bì', 'hộp', 'Mới', true),
  ('Giá đỗ tươi', 'Rau củ', 'kg', NULL, true),
  ('Sốt tương đen', 'Gia vị', 'thùng', NULL, true),
  ('Thịt heo ba chỉ', 'Thịt & Hải sản', 'kg', NULL, true)
ON CONFLICT DO NOTHING;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated noko admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@noko.com')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@noko.com');
