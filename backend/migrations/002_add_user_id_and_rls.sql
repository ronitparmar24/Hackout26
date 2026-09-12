-- Migration: 002_add_user_id_and_rls.sql
-- Description: Add user_id column to runs, enable Row Level Security (RLS), and restrict access by auth.uid()

-- 1. Add user_id column referencing Supabase auth.users
ALTER TABLE runs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);

-- 2. Enable Row Level Security (RLS) on runs
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can select only their own runs
DROP POLICY IF EXISTS "Users can view own runs" ON runs;
CREATE POLICY "Users can view own runs" ON runs
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Policy: Users can insert their own runs
DROP POLICY IF EXISTS "Users can insert own runs" ON runs;
CREATE POLICY "Users can insert own runs" ON runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Users can update their own runs
DROP POLICY IF EXISTS "Users can update own runs" ON runs;
CREATE POLICY "Users can update own runs" ON runs
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own runs
DROP POLICY IF EXISTS "Users can delete own runs" ON runs;
CREATE POLICY "Users can delete own runs" ON runs
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Secure suppliers table via parent run_id ownership
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access suppliers of own runs" ON suppliers;
CREATE POLICY "Users can access suppliers of own runs" ON suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM runs 
      WHERE runs.id = suppliers.run_id 
      AND runs.user_id = auth.uid()
    )
  );

-- 8. Secure recommendations table via parent run_id ownership
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access recommendations of own runs" ON recommendations;
CREATE POLICY "Users can access recommendations of own runs" ON recommendations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM runs 
      WHERE runs.id = recommendations.run_id 
      AND runs.user_id = auth.uid()
    )
  );

-- 9. Update company_settings with user_id 1:1 linkage
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own company settings" ON company_settings;
CREATE POLICY "Users can manage own company settings" ON company_settings
  FOR ALL USING (auth.uid() = user_id);
