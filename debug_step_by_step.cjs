const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runStepByStepDebug() {
  console.log('======================================================================');
  console.log('                 STEP-BY-STEP DATABASE QUERY DEBUG                    ');
  console.log('======================================================================\n');

  // STEP 1: Print doctors table columns & rows for test4 admin
  const adminId = 'admin_1784738108261';
  const altPortalId = 'SJV-HTPL-2828';

  console.log('[STEP 1] Target Admin ID:', adminId);
  console.log('[STEP 1] Alternative Portal ID:', altPortalId);

  // STEP 4: Print exact Supabase queries
  console.log('\n[STEP 4] Executing Query 1: SELECT * FROM doctors WHERE hospital_id = ?');
  const { data: q1_adminId } = await supabase.from('doctors').select('*').eq('hospital_id', adminId);
  const { data: q1_portalId } = await supabase.from('doctors').select('*').eq('hospital_id', altPortalId);
  
  console.log(`  - Results for hospital_id='${adminId}': ${q1_adminId ? q1_adminId.length : 0} rows`);
  console.log(`  - Results for hospital_id='${altPortalId}': ${q1_portalId ? q1_portalId.length : 0} rows`);

  console.log('\n[STEP 4] Executing Query 2: SELECT * FROM doctors WHERE hospital_id = ? AND approval_status = \'pending\'');
  const { data: q2_adminId } = await supabase.from('doctors').select('*').eq('hospital_id', adminId).eq('approval_status', 'pending');
  const { data: q2_portalId } = await supabase.from('doctors').select('*').eq('hospital_id', altPortalId).eq('approval_status', 'pending');

  console.log(`  - Pending results for hospital_id='${adminId}': ${q2_adminId ? q2_adminId.length : 0} rows`);
  console.log(`  - Pending results for hospital_id='${altPortalId}': ${q2_portalId ? q2_portalId.length : 0} rows`);

  // STEP 5: Print raw JSON
  console.log('\n[STEP 5] Raw JSON returned for admin_1784738108261 query:');
  console.log(JSON.stringify(q1_adminId, null, 2));

  console.log('\n[STEP 5] Raw JSON returned for SJV-HTPL-2828 query:');
  console.log(JSON.stringify(q1_portalId, null, 2));

  // STEP 6 & 7: Check approval_status values & capitalization
  const allDocs = [...(q1_adminId || []), ...(q1_portalId || [])];
  console.log('\n[STEP 6 & 7] Checking approval_status column values & capitalization:');
  allDocs.forEach(d => {
    console.log(`  - Doctor Name: "${d.name}", hospital_id: "${d.hospital_id}", approval_status: "${d.approval_status}" (type: ${typeof d.approval_status})`);
  });
}

runStepByStepDebug();
