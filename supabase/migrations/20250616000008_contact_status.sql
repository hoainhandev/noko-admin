ALTER TABLE contact_messages
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

CREATE POLICY "Admins can read contacts"
ON contact_messages FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' LIKE '%@noko.com');

CREATE POLICY "Admins can update contacts"
ON contact_messages FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' LIKE '%@noko.com');
