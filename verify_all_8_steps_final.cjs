const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runStepReport() {
  const hospitalId = 'admin_1784738108261';

  // STEP 4: Queries
  const { data: allDocs } = await supabase.from('doctors').select('*').or(`hospital_id.eq.${hospitalId},hospital_id.eq.SJV-HTPL-2828`);
  const { data: pendingDocs } = await supabase.from('doctors').select('*').or(`hospital_id.eq.${hospitalId},hospital_id.eq.SJV-HTPL-2828`).eq('approval_status', 'pending');

  console.log('=== STEP 4: SUPABASE QUERY RESULTS ===');
  console.log(`Query 1 (All Doctors for Hospital): ${allDocs ? allDocs.length : 0} rows`);
  console.log(`Query 2 (Pending Requests for Hospital): ${pendingDocs ? pendingDocs.length : 0} rows`);

  console.log('\n=== STEP 5: RAW JSON OF NEWLY REGISTERED PENDING DOCTOR ===');
  if (pendingDocs && pendingDocs.length > 0) {
    console.log(JSON.stringify(pendingDocs[0], null, 2));
  } else {
    console.log('No pending doctors currently in database.');
  }
}

runStepReport();
