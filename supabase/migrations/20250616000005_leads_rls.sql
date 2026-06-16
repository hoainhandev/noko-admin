-- RLS policies for admin access to leads tables

ALTER TABLE academy_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_leads ENABLE ROW LEVEL SECURITY;

-- Allow public insert (from website forms)
CREATE POLICY IF NOT EXISTS "Public can insert academy registrations"
  ON academy_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Public can insert supply leads"
  ON supply_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin read/update for @noko.com users
CREATE POLICY IF NOT EXISTS "Noko admins can read academy registrations"
  ON academy_registrations FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@noko.com');

CREATE POLICY IF NOT EXISTS "Noko admins can update academy registrations"
  ON academy_registrations FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@noko.com')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@noko.com');

CREATE POLICY IF NOT EXISTS "Noko admins can read supply leads"
  ON supply_leads FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@noko.com');

CREATE POLICY IF NOT EXISTS "Noko admins can update supply leads"
  ON supply_leads FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' LIKE '%@noko.com')
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@noko.com');
