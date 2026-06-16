-- Add status column to academy_registrations (if not exists)
ALTER TABLE academy_registrations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'registered'));

CREATE INDEX IF NOT EXISTS idx_academy_registrations_status ON academy_registrations(status);
CREATE INDEX IF NOT EXISTS idx_academy_registrations_created_at ON academy_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academy_registrations_course ON academy_registrations(course);

-- Add status column to supply_leads (if not exists)
ALTER TABLE supply_leads
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'registered'));

CREATE INDEX IF NOT EXISTS idx_supply_leads_status ON supply_leads(status);
CREATE INDEX IF NOT EXISTS idx_supply_leads_created_at ON supply_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supply_leads_state ON supply_leads(state);
