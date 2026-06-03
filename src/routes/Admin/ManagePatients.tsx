import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile, realtimeBroker } from '../../services/db';
import { Users, UserPlus, Upload, FileText, Calendar, Search } from 'lucide-react';

interface ManagePatientsProps {
  onNavigate: (view: string) => void;
}

export const ManagePatients: React.FC<ManagePatientsProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [search, setSearch] = useState('');

  // Patient Creation Form State
  const [showCreate, setShowCreate] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', phone: '', email: '',
    address: '', emergencyName: '', emergencyPhone: ''
  });

  useEffect(() => {
    if (!user) return;
    const loadPatients = () => setPatients(DatabaseService.getPatients());
    loadPatients();
    const unsub = realtimeBroker.subscribe('patients-update', loadPatients);
    return () => unsub();
  }, [user?.id]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    DatabaseService.registerPatient({
      name: newPatient.name,
      age: parseInt(newPatient.age, 10),
      gender: 'Unknown',
      bloodGroup: 'Unknown',
      phone: newPatient.phone,
      email: newPatient.email || `${newPatient.phone}@offline.local`, // fallback email
      address: newPatient.address,
      emergencyContactName: newPatient.emergencyName,
      emergencyContactPhone: newPatient.emergencyPhone,
      allergies: [],
      chronicConditions: []
    });
    setShowCreate(false);
    setNewPatient({ name: '', age: '', phone: '', email: '', address: '', emergencyName: '', emergencyPhone: '' });
  };

  // Deduplicate patient list by phone number to show only unique real users
  const uniquePatients = Array.from(
    patients.reduce((map, pat) => {
      if (pat && pat.phone) {
        const phone = pat.phone.trim();
        // Keep the one with a more complete ID or the first occurrence
        if (!map.has(phone) || pat.id.startsWith('SJV-PAT-')) {
          map.set(phone, pat);
        }
      }
      return map;
    }, new Map<string, PatientProfile>()).values()
  );

  const filteredPatients = uniquePatients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            Manage Patients
          </h2>
          <p className="text-slate-500 text-sm mt-1">Register offline patients and upload external medical reports.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="btn-medical py-2 px-4 flex items-center gap-2 text-sm font-bold"
        >
          {showCreate ? 'Cancel Registration' : <><UserPlus className="h-4 w-4" /> Register Offline Patient</>}
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium animate-fade-in">
          <h3 className="text-lg font-black text-slate-800 mb-4">Offline Patient Registration</h3>
          <form onSubmit={handleCreatePatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="input-medical" />
            <input type="number" placeholder="Age" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className="input-medical" />
            <input type="tel" placeholder="Phone Number (used as login)" required value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} className="input-medical" />
            <input type="email" placeholder="Email (Optional)" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} className="input-medical" />
            <input type="text" placeholder="Address" required value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} className="input-medical md:col-span-2" />
            
            <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Emergency Contact</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Emergency Contact Name" required value={newPatient.emergencyName} onChange={e => setNewPatient({...newPatient, emergencyName: e.target.value})} className="input-medical" />
                <input type="tel" placeholder="Emergency Contact Phone" required value={newPatient.emergencyPhone} onChange={e => setNewPatient({...newPatient, emergencyPhone: e.target.value})} className="input-medical" />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="btn-medical py-2.5 px-6 font-bold text-sm">Create Record</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-premium">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 focus:outline-none bg-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Patient Name & ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Emergency Contact</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(pat => (
                <tr key={pat.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-800 block">{pat.name} <span className="text-slate-400 font-medium text-xs ml-1">({pat.age}y)</span></span>
                    <span className="text-[10px] text-slate-400 font-mono">{pat.id}</span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-600">
                    <div className="flex flex-col">
                      <span>{pat.phone}</span>
                      <span className="text-[10px] text-slate-400">{pat.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">
                    {pat.emergencyContact?.name} ({pat.emergencyContact?.phone})
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => alert('Uploading reports is handled via the Doctor Upload feature currently. Direct admin upload coming soon.')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Report
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
