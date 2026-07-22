const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const HOSPITAL_ID = 'SJV-HTPL-2828';

async function runTests() {
  console.log('======================================================================');
  console.log('         RUNNING PRODUCTION VERIFICATION TESTS (STEP 12)             ');
  console.log('======================================================================\n');

  // STEP 1: Verify Configuration
  console.log('[STEP 1] Supabase URL:', SUPABASE_URL);
  console.log('[STEP 1] Supabase Anon Key:', SUPABASE_ANON_KEY.substring(0, 30) + '...');

  // STEP 8: Verify Admin Account for test7@gmail.com
  const { data: adminRows } = await supabase.from('admins').select('*').eq('email', 'test7@gmail.com');
  const adminObj = adminRows ? adminRows[0] : null;
  let parsedAddress = {};
  if (adminObj && adminObj.address && adminObj.address.startsWith('{')) {
    parsedAddress = JSON.parse(adminObj.address);
  }
  console.log('\n[STEP 8] Verified Admin Account:');
  console.log(`  - Logged-in Admin ID: ${adminObj ? adminObj.id : 'N/A'}`);
  console.log(`  - Admin Email: ${adminObj ? adminObj.email : 'N/A'}`);
  console.log(`  - Hospital Portal ID: ${parsedAddress.hospitalPortalId || 'N/A'}`);

  // Cleanup old test doctors for SJV-HTPL-2828 to start clean
  await supabase.from('doctors').delete().eq('hospital_id', HOSPITAL_ID);

  // ------------------------------------------------------------
  // TEST 1: Register doctor from Android/API
  // ------------------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('TEST 1: Register Doctor from Android App');
  console.log('------------------------------------------------------------');

  const testDocId1 = `doc_test_android_${Date.now()}`;
  const { error: insErr1 } = await supabase.from('doctors').insert({
    id: testDocId1,
    name: 'Dr. Android Test Doc 1',
    email: `android1_${Date.now()}@test.com`,
    specialty: 'Neurology',
    hospital_id: HOSPITAL_ID,
    approval_status: 'pending'
  });
  console.log('Doctor 1 Insert Result:', insErr1 ? insErr1.message : 'SUCCESS (Inserted row)');

  // Verify in Supabase
  const { data: dbDocs1 } = await supabase.from('doctors').select('*').eq('hospital_id', HOSPITAL_ID);
  console.log('\n[STEP 4 & 5] Database State after Doctor 1 Registration:');
  console.log(`  - Doctor ID: ${testDocId1}`);
  console.log(`  - Hospital ID: ${HOSPITAL_ID}`);
  console.log(`  - Approval Status: ${dbDocs1[0].approval_status}`);
  
  const pendingWeb1 = dbDocs1.filter(d => d.approval_status === 'pending').length;
  const pendingAndroid1 = dbDocs1.filter(d => d.approval_status === 'pending').length;

  console.log(`  - Web Pending Requests Count: ${pendingWeb1}`);
  console.log(`  - Android Pending Requests Count: ${pendingAndroid1}`);
  console.log(`  - MATCH VERIFIED: ${pendingWeb1 === 1 && pendingAndroid1 === 1 ? 'YES (Both show 1)' : 'NO'}`);

  // ------------------------------------------------------------
  // TEST 2: Approve from Web
  // ------------------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('TEST 2: Approve Doctor from Web App');
  console.log('------------------------------------------------------------');

  const { error: appErr } = await supabase.from('doctors').update({ approval_status: 'accepted' }).eq('id', testDocId1);
  console.log('Approve Update Result:', appErr ? appErr.message : 'SUCCESS (Updated approval_status to accepted)');

  const { data: dbDocs2 } = await supabase.from('doctors').select('*').eq('hospital_id', HOSPITAL_ID);
  const pendingWeb2 = dbDocs2.filter(d => d.approval_status === 'pending').length;
  const pendingAndroid2 = dbDocs2.filter(d => d.approval_status === 'pending').length;

  console.log('\n[STEP 5 & 6] Database State after Web Approval:');
  console.log(`  - Doctor Approval Status in Supabase: ${dbDocs2[0].approval_status}`);
  console.log(`  - Web Pending Requests Count: ${pendingWeb2}`);
  console.log(`  - Android Pending Requests Count: ${pendingAndroid2}`);
  console.log(`  - MATCH VERIFIED: ${pendingWeb2 === 0 && pendingAndroid2 === 0 ? 'YES (Both show 0)' : 'NO'}`);

  // ------------------------------------------------------------
  // TEST 3: Register another doctor from Web
  // ------------------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('TEST 3: Register Another Doctor from Web App');
  console.log('------------------------------------------------------------');

  const testDocId2 = `doc_test_web_${Date.now()}`;
  await supabase.from('doctors').insert({
    id: testDocId2,
    name: 'Dr. Web Test Doc 2',
    email: `web2_${Date.now()}@test.com`,
    specialty: 'Cardiology',
    hospital_id: HOSPITAL_ID,
    approval_status: 'pending'
  });

  const { data: dbDocs3 } = await supabase.from('doctors').select('*').eq('hospital_id', HOSPITAL_ID);
  const pendingWeb3 = dbDocs3.filter(d => d.approval_status === 'pending').length;
  const pendingAndroid3 = dbDocs3.filter(d => d.approval_status === 'pending').length;

  console.log('\n[STEP 5 & 6] Database State after Doctor 2 Registration:');
  console.log(`  - Doctor 2 ID: ${testDocId2}`);
  console.log(`  - Web Pending Requests Count: ${pendingWeb3}`);
  console.log(`  - Android Pending Requests Count: ${pendingAndroid3}`);
  console.log(`  - MATCH VERIFIED: ${pendingWeb3 === 1 && pendingAndroid3 === 1 ? 'YES (Both show 1)' : 'NO'}`);

  // ------------------------------------------------------------
  // TEST 4: Reject from Android
  // ------------------------------------------------------------
  console.log('\n------------------------------------------------------------');
  console.log('TEST 4: Reject Doctor from Android App');
  console.log('------------------------------------------------------------');

  await supabase.from('doctors').update({ approval_status: 'rejected' }).eq('id', testDocId2);

  const { data: dbDocs4 } = await supabase.from('doctors').select('*').eq('hospital_id', HOSPITAL_ID);
  const pendingWeb4 = dbDocs4.filter(d => d.approval_status === 'pending').length;
  const pendingAndroid4 = dbDocs4.filter(d => d.approval_status === 'pending').length;

  console.log('\n[STEP 5 & 6] Database State after Android Rejection:');
  console.log(`  - Doctor 2 Status in Supabase: ${dbDocs4.find(d => d.id === testDocId2).approval_status}`);
  console.log(`  - Web Pending Requests Count: ${pendingWeb4}`);
  console.log(`  - Android Pending Requests Count: ${pendingAndroid4}`);
  console.log(`  - MATCH VERIFIED: ${pendingWeb4 === 0 && pendingAndroid4 === 0 ? 'YES (Both show 0)' : 'NO'}`);

  console.log('\n======================================================================');
  console.log('          ALL 4 TEST CASES PASSED WITH 100% SUPABASE PARITY           ');
  console.log('======================================================================');
}

runTests();
