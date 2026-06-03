// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Emergency\EmergencyPortal.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile } from '../../services/db';
import { 
  ShieldAlert, 
  PhoneCall, 
  Heart, 
  Activity, 
  CheckCircle, 
  Pill, 
  AlertTriangle,
  ArrowLeft,
  Search,
  MessageSquare
} from 'lucide-react';

interface EmergencyPortalProps {
  patientIdQuery?: string;
  onNavigate: (view: string) => void;
}

export const EmergencyPortal: React.FC<EmergencyPortalProps> = ({ patientIdQuery = '', onNavigate }) => {
  const [patientId, setPatientId] = useState(patientIdQuery || '');
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  
  // Quick Search bypass input
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Call simulation overlay state
  const [activeCall, setActiveCall] = useState<string | null>(null);

  const loadPatient = (id: string) => {
    const p = DatabaseService.getPatientById(id);
    if (p) {
      setPatient(p);
      setPatientId(id);
      setSearchError('');
    } else {
      setSearchError('Invalid Emergency Medical ID code. Please enter a valid registered ID.');
      setTimeout(() => setSearchError(''), 4000);
    }
  };

  useEffect(() => {
    if (patientIdQuery) {
      loadPatient(patientIdQuery);
    } else {
      const allPats = DatabaseService.getPatients();
      if (allPats.length > 0) {
        loadPatient(allPats[0].id);
      }
    }
  }, [patientIdQuery]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    loadPatient(searchInput.trim());
  };

  const handleDial = (contactName: string, phone: string) => {
    setActiveCall(`Calling ${contactName} at ${phone}...`);
    setTimeout(() => {
      setActiveCall(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-[#0B0F19] text-white transition-colors duration-300 p-6 relative text-left">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight block text-rose-500">SANJEEVANI EMERGENCY ACCESS</span>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Unified First Responder Portal</span>
          </div>
        </div>

        <button 
          onClick={() => {
            const session = DatabaseService.getActiveSession();
            onNavigate(session.role ? (session.role === 'doctor' ? 'doctor/dashboard' : 'patient/dashboard') : 'welcome');
          }}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Portal
        </button>
      </div>

      {/* CALL OVERLAY MODAL */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-fade-in text-center">
          <div className="h-20 w-20 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center animate-ping text-white">
            <PhoneCall className="h-8 w-8 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">{activeCall}</h3>
            <p className="text-xs text-rose-400 font-semibold animate-pulse">Sanjeevani Smart Voice Link Routing Active...</p>
          </div>
          <button 
            onClick={() => setActiveCall(null)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-rose-700 text-white font-bold rounded-xl text-xs mt-4 transition-all"
          >
            Hang Up Call
          </button>
        </div>
      )}

      {/* Hospital-Grade Top High Visibility Alert Bar */}
      <div className="p-4 bg-rose-600 text-white rounded-2xl flex gap-3 items-center border border-rose-500/20 mb-8 relative overflow-hidden animate-pulse">
        <ShieldAlert className="h-6 w-6 text-white shrink-0 animate-bounce" />
        <div className="text-xs">
          <span className="font-extrabold uppercase block">AUTHORIZATION DISPATCH ACTIVE</span>
          <span className="font-semibold text-rose-100 block mt-0.5">Critical allergy exclusions and direct-dial emergency contacts unlocked. Bypassing user login checks.</span>
        </div>
      </div>

      {/* Grid: Search Bypass (Left) & Core Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: ID Search Bypass Lookup */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-rose-500 flex items-center gap-1.5 uppercase">
              <Search className="h-4.5 w-4.5" />
              Patient Bypass Search
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Type the patient's Sanjeevani ID to query critical vitals and allergies (e.g. <span className="text-teal-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">SJV-PAT-XXXXXX</span>).
            </p>

            <form onSubmit={handleLookup} className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter patient ID code..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-white"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
              {searchError && (
                <span className="text-[10px] text-rose-400 font-bold block animate-pulse">{searchError}</span>
              )}
              <button type="submit" className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">
                Fetch Patient Critical Record
              </button>
            </form>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2">
            {DatabaseService.getPatients().slice(0, 2).map((p) => (
              <button 
                key={p.id}
                onClick={() => loadPatient(p.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  patientId === p.id ? 'bg-rose-600/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {p.name} · {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: High Visibility Clinical profile card */}
        <div className="lg:col-span-8 space-y-6">
          {patient ? (
            <div className="p-6 sm:p-8 bg-slate-800/60 border border-slate-700 rounded-3xl space-y-8 relative">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-sm text-teal-400">
                    {patient.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{patient.name}</h2>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      ID: {patient.id} • {patient.age} Yrs • Blood Group: <span className="text-rose-500 font-black">{patient.bloodGroup}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/10 text-[10px] font-bold uppercase">
                    Critical Pass Active
                  </span>
                </div>
              </div>

              {/* Red glowing allergy section */}
              {patient.allergies.length > 0 && (
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 ring-1 ring-rose-500/5">
                  <span className="text-xs font-black text-rose-500 flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                    SEVERE DRUG EXCLUSIONS (DO NOT PRESCRIBE)
                  </span>
                  {patient.allergies.map((a, i) => (
                    <div key={i} className="text-xs text-rose-200">
                      • <span className="font-extrabold text-white text-sm">{a.allergen}</span> (Reaction: {a.reaction} - Severe {a.severity})
                    </div>
                  ))}
                </div>
              )}

              {/* Emergency Vitals snapshot */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Live Synchronized Vital Vitals</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Blood Pressure</span>
                    <span className="text-lg font-black text-white block mt-1">
                      {patient.vitals.systolicBP}/{patient.vitals.diastolicBP}
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Heart Telemetry</span>
                    <span className="text-lg font-black text-white block mt-1 flex items-center justify-center gap-1">
                      {patient.vitals.heartRate} <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Oxygen Sat</span>
                    <span className="text-lg font-black text-emerald-400 block mt-1">
                      {patient.vitals.oxygenSat}%
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Blood Sugar</span>
                    <span className="text-lg font-black text-white block mt-1">
                      {patient.vitals.bloodGlucose || 100} <span className="text-[9px] text-slate-400 font-normal">mg/dL</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Medication schedule */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Medications Log</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {patient.activeMedications.map((med, i) => (
                    <div key={i} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                      <Pill className="h-5 w-5 text-rose-500" />
                      <div>
                        <span className="text-xs font-bold text-white block">{med.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{med.dosage} • {med.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct call action contact */}
              <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Primary Emergency Contact</span>
                  <span className="text-base font-black text-white block mt-0.5">{patient.emergencyContact.name}</span>
                  <span className="text-xs text-rose-500 font-bold block mt-0.5">{patient.emergencyContact.phone}</span>
                </div>

                <button 
                  onClick={() => handleDial(patient.emergencyContact.name, patient.emergencyContact.phone)}
                  className="px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2.5 shadow-lg relative overflow-hidden group active:scale-95 transition-all"
                >
                  <PhoneCall className="h-4.5 w-4.5 text-white animate-bounce" />
                  PULSE CALL SPOUSE DIRECTLY
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              Select or search a patient on the left.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
