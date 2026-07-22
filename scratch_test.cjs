const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAllTables() {
  const { data: dData, error: dErr } = await supabase.from('doctors').select('*').limit(1);
  console.log('Doctors cols:', dData && dData[0] ? Object.keys(dData[0]) : [], dErr);

  const { data: aData, error: aErr } = await supabase.from('admins').select('*').limit(1);
  console.log('Admins cols:', aData && aData[0] ? Object.keys(aData[0]) : [], aErr);

  const { data: apData, error: apErr } = await supabase.from('appointments').select('*').limit(1);
  console.log('Appointments cols:', apData && apData[0] ? Object.keys(apData[0]) : [], apErr);

  const { data: vData, error: vErr } = await supabase.from('visits').select('*').limit(1);
  console.log('Visits cols:', vData && vData[0] ? Object.keys(vData[0]) : [], vErr);
}

testAllTables();
