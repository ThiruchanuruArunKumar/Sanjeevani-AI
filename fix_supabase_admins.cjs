const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getDeterministicPortalId(email, id) {
  if (id && id.startsWith('SJV-HTPL-')) return id;
  // Specific fix for test7@gmail.com / test4 admin to guarantee SJV-HTPL-2828 matches user's active session
  if (email && email.toLowerCase() === 'test7@gmail.com') return 'SJV-HTPL-2828';
  
  let hash = 0;
  const str = (email || id || 'admin').toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const num = (Math.abs(hash) % 8999) + 1000;
  return `SJV-HTPL-${num}`;
}

async function fixAdminsInSupabase() {
  console.log('--- SYNCING & FIXING SUPABASE ADMIN PORTAL IDS ---');
  const { data: admins, error } = await supabase.from('admins').select('*');
  if (error) {
    console.error('Error fetching admins:', error);
    return;
  }

  for (const admin of admins) {
    let currentAddress = admin.address || '';
    let parsed = {};
    if (currentAddress.trim().startsWith('{')) {
      try {
        parsed = JSON.parse(currentAddress);
      } catch (e) {}
    } else {
      parsed = { address: currentAddress };
    }

    let portalId = parsed.hospitalPortalId;
    if (!portalId || !portalId.startsWith('SJV-HTPL-')) {
      portalId = getDeterministicPortalId(admin.email, admin.id);
      parsed.hospitalPortalId = portalId;

      const updatedAddress = JSON.stringify(parsed);
      const { error: updateErr } = await supabase.from('admins').update({ address: updatedAddress }).eq('id', admin.id);
      console.log(`Updated Admin [${admin.email || admin.id}] -> Hospital Portal ID: ${portalId}, Error: ${updateErr}`);
    } else {
      console.log(`Admin [${admin.email || admin.id}] already has Portal ID: ${portalId}`);
    }
  }

  console.log('--- FINISHED SYNCING ADMIN PORTAL IDS ---');
}

fixAdminsInSupabase();
