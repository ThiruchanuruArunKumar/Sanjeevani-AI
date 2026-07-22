const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  console.log('--- TESTING SUPABASE DIRECT CONNECTION ---');
  
  // 1. Fetch admins
  const { data: admins, error: adminErr } = await supabase.from('admins').select('*');
  console.log('Admins Count:', admins ? admins.length : 0, 'Error:', adminErr);
  if (admins && admins.length > 0) {
    console.log('Admins Sample:', admins.map(a => ({ id: a.id, portal_id: a.hospital_portal_id, name: a.hospital_name, email: a.email })));
  }

  // 2. Fetch doctors
  const { data: doctors, error: docErr } = await supabase.from('doctors').select('*');
  console.log('\nDoctors Count:', doctors ? doctors.length : 0, 'Error:', docErr);
  if (doctors && doctors.length > 0) {
    console.log('Doctors Sample:', doctors.map(d => ({ id: d.id, name: d.name, email: d.email, hospital_id: d.hospital_id, status: d.approval_status })));
  }
}

testSupabase();
