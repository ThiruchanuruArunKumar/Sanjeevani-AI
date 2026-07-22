const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectDoctorsTable() {
  console.log('=== STEP 1: RAW SUPABASE DOCTORS TABLE INSPECTION ===\n');
  const { data: rows, error } = await supabase.from('doctors').select('*');
  if (error) {
    console.error('Error fetching doctors:', error);
    return;
  }

  console.log(`Total Rows in doctors table: ${rows ? rows.length : 0}\n`);
  console.log('RAW JSON ROWS:');
  console.log(JSON.stringify(rows, null, 2));
}

inspectDoctorsTable();
