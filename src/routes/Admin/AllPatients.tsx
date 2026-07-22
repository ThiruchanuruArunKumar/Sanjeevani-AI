// src/routes/Admin/AllPatients.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile, realtimeBroker } from '../../services/db';
import { Users, Search, Filter, Phone, Mail, User, ShieldCheck, Calendar, X, Eye, Clock } from 'lucide-react';

interface AllPatientsProps {
  onNavigate: (view: string) => void;
}

export const AllPatients: React.FC<AllPatientsProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const portalId = user?.hospitalPortalId || user?.id || '';

  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ONLINE' | 'WALK_IN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Pending Activation'>('ALL');

  // Selected Patient Details Modal
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);

  const loadPatients = () => {
    const allPats = DatabaseService.getPatients(portalId);
    setPatients(allPats);
  };

  useEffect(() => {
    if (!user) return;
    loadPatients();
    const unsub = realtimeBroker.subscribe('patients-update', loadPatients);
    return () => unsub();
  }, [user?.id, portalId]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.phone && p.phone.includes(search));

    const regType = p.registrationType || (p.passwordHash ? 'ONLINE' : 'WALK_IN');
    const matchesType = typeFilter === 'ALL' || regType === typeFilter;

    const status = p.accountStatus === 'activated' ? 'Active' : 'Pending Activation';
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (!user) return null;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-teal-600" />
            All Patients
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Central Patient Directory &bull; Hospital Portal ID: <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{portalId}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigate('admin/patient-registration')}
          className="btn-medical py-2.5 px-5 text-xs font-bold shadow-md"
        >
          + Register Walk-in Patient
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl border-teal-500/20 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by Patient ID, Name, Email, or Mobile Number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
          >
            <option value="ALL">All Types (ONLINE & WALK_IN)</option>
            <option value="ONLINE">ONLINE Patients Only</option>
            <option value="WALK_IN">WALK_IN Patients Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Pending Activation">Pending Activation</option>
          </select>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-500 uppercase">
                <th className="p-4">Patient ID</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Registration Type</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                    No matching patient records found in your hospital directory.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => {
                  const regType = pat.registrationType || (pat.passwordHash ? 'ONLINE' : 'WALK_IN');
                  const status = pat.accountStatus === 'activated' ? 'Active' : 'Pending Activation';

                  return (
                    <tr key={pat.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-teal-800 bg-teal-50/50 rounded-lg">{pat.id}</td>
                      <td className="p-4 font-extrabold text-slate-800">
                        {pat.name} <span className="text-slate-400 font-semibold">({pat.age}y &bull; {pat.gender})</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{pat.phone}</td>
                      <td className="p-4 font-semibold text-slate-600">{pat.email || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                          regType === 'ONLINE' 
                            ? 'bg-blue-50 text-blue-800 border-blue-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {regType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                          status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedPatient(pat)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl font-bold text-xs flex items-center gap-1 ml-auto border border-slate-200 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-fade-in text-left border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block">Patient Profile Record</span>
                <h3 className="text-xl font-black text-slate-800">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Age: {selectedPatient.age} &bull; Gender: {selectedPatient.gender || 'N/A'}
                </p>
              </div>

              <button 
                onClick={() => setSelectedPatient(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Permanent Patient ID</span>
                <span className="font-mono font-black text-teal-800 text-sm block">{selectedPatient.id}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Registration Type</span>
                <span className="font-black text-slate-800 text-sm block">
                  {selectedPatient.registrationType || (selectedPatient.passwordHash ? 'ONLINE' : 'WALK_IN')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mobile Number</span>
                <span className="font-bold text-slate-800 block">{selectedPatient.phone}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span>
                <span className="font-bold text-slate-800 block">{selectedPatient.email || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Residential Address</span>
                <span className="font-semibold text-slate-700 block">{selectedPatient.address || 'Not provided'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Emergency Contact</span>
                <span className="font-bold text-slate-800 block">
                  {selectedPatient.emergencyContact?.name || 'N/A'} ({selectedPatient.emergencyContact?.phone || 'N/A'})
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="btn-medical py-2 px-6 font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
