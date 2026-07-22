const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function registerNewDoctorFixed() {
  console.log('=== TESTING SUPABASE INSERT WITHOUT INVALID COLUMNS ===\n');

  const newDocId = `doc_real_${Date.now()}`;
  const hospitalId = 'admin_1784738108261';

  const serializedClinicName = JSON.stringify({
    clinicName: 'Sanjeevani Real OPD',
    department: 'Cardiology',
    medicalRegNumber: 'MCI-2026-99999',
    passwordHash: 'doctor123'
  });

  const { data, error } = await supabase.from('doctors').insert({
    id: newDocId,
    name: 'Dr. Real User Pending Test',
    email: `realdoc_${Date.now()}@sanjeevani.ai`,
    specialty: 'Cardiology & AI Drug Safety',
    clinic_name: serializedClinicName,
    avatar_url: null,
    hospital_id: hospitalId,
    approval_status: 'pending'
  }).select('*');

  if (error) {
    console.error('INSERT ERROR:', error);
    return;
  }

  console.log('SUCCESS! INSERTED ROW IN SUPABASE:');
  console.log(JSON.stringify(data[0], null, 2));

  // Query Dashboard Filter
  console.log('\n--- DASHBOARD QUERY SIMULATION ---');
  const { data: allDocs } = await supabase.from('doctors').select('*').eq('hospital_id', hospitalId);
  const pendingDocs = allDocs ? allDocs.filter(d => d.approval_status === 'pending') : [];

  console.log(`Total Doctors for ${hospitalId}: ${allDocs ? allDocs.length : 0}`);
  console.log(`Pending Doctors (Doctor Approval Requests): ${pendingDocs.length}`);
  console.log('Pending Doctor Object:', pendingDocs[0]);
}

registerNewDoctorFixed();
