const fs = require('fs');
const code = fs.readFileSync('src/services/db.ts', 'utf8');
const urlMatch = code.match(/const SUPABASE_URL = '([^']+)'/);
const keyMatch = code.match(/const SUPABASE_ANON_KEY = '([^']+)'/);

const SUPABASE_URL = urlMatch[1];
const SUPABASE_ANON_KEY = keyMatch[1];

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  // Try inserting a dummy row - if table doesn't exist it will fail
  // Instead, we'll use the Supabase management API to create the table
  // First let's try to use the REST API to call a stored procedure
  
  // Since we can't create tables with anon key, let's use the Supabase JS client
  // with a direct HTTP call to the SQL endpoint with the service role key approach
  
  // Actually, let's try a workaround: use the existing 'visits' table approach
  // by creating the table through Supabase's built-in pg functions
  
  // Try rpc with exec
  const { data, error } = await supabase.rpc('exec', { sql: 'SELECT 1' });
  console.log('rpc exec:', error?.message || data);
  
  // Alternative: just try to insert with upsert - if table doesn't exist, it will create via migration
  // We need to use service role key for DDL
  // Let's check if we have it in the environment
  console.log('\nSupabase URL:', SUPABASE_URL);
  console.log('\nTo create the appointments table, run this SQL in your Supabase SQL editor:');
  console.log('https://supabase.com/dashboard/project/kusyhlgdxgbsspwthcvv/sql/new');
  console.log('\n--- SQL TO RUN ---');
  console.log(`
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id),
  hospital_id TEXT REFERENCES public.admins(id),
  doctor_id TEXT REFERENCES public.doctors(id),
  time_range TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON public.appointments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
  `);
})();
