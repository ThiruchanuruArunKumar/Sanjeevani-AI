// src/routes/Doctor/SearchPatients.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseService, PatientProfile, realtimeBroker } from '../../services/db';
import { RegisterPatientModal } from '../../components/RegisterPatientModal';
import {
  Search,
  SlidersHorizontal,
  User,
  Heart,
  ShieldAlert,
  FileText,
  Clock,
  ChevronRight,
  X,
  Activity,
  Pill,
  Filter,
  UserPlus,
} from 'lucide-react';

interface SearchPatientsProps {
  onNavigate: (view: string) => void;
}

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RISK_FILTERS = ['All', 'Critical', 'Stable'];

export const SearchPatients: React.FC<SearchPatientsProps> = ({ onNavigate }) => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Load patients + subscribe to realtime updates
  const loadPatients = () => {
    const { user } = DatabaseService.getActiveSession();
    if (!user) return;
    
    const appointments = DatabaseService.getAppointments().filter(a => a.doctorId === user.id);
    const visits = DatabaseService.getVisits().filter(v => v.doctorId === user.id);
    const patientIds = new Set([...appointments.map(a => a.patientId), ...visits.map(v => v.patientId)]);
    
    const allPatients = DatabaseService.getPatients();
    setPatients(allPatients.filter(p => patientIds.has(p.id)));
  };

  useEffect(() => {
    loadPatients();
    const unsub = realtimeBroker.subscribe('patients-update', loadPatients);

    // Load recently-viewed IDs from sessionStorage
    try {
      const stored = JSON.parse(sessionStorage.getItem('sj_recent_patients') || '[]');
      setRecentIds(stored);
    } catch { /* ignore */ }

    return () => unsub();
  }, []);

  // Track recently viewed
  const openProfile = (id: string) => {
    const updated = [id, ...recentIds.filter(r => r !== id)].slice(0, 5);
    setRecentIds(updated);
    sessionStorage.setItem('sj_recent_patients', JSON.stringify(updated));
    onNavigate(`doctor/patient/${id}`);
  };

  // Filtering logic
  const isCritical = (p: PatientProfile) =>
    p.vitals.systolicBP > 140 || p.vitals.oxygenSat < 95;

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.bloodGroup.toLowerCase().includes(q) ||
        p.chronicConditions.some(c => c.toLowerCase().includes(q)) ||
        p.allergies.some(a => a.allergen.toLowerCase().includes(q));

      const matchesBlood =
        bloodGroupFilter === 'All' || p.bloodGroup === bloodGroupFilter;

      const matchesRisk =
        riskFilter === 'All' ||
        (riskFilter === 'Critical' && isCritical(p)) ||
        (riskFilter === 'Stable' && !isCritical(p));

      const matchesCond =
        !conditionFilter ||
        p.chronicConditions.some(c =>
          c.toLowerCase().includes(conditionFilter.toLowerCase())
        );

      return matchesQuery && matchesBlood && matchesRisk && matchesCond;
    });
  }, [patients, query, bloodGroupFilter, riskFilter, conditionFilter]);

  const recentPatients = recentIds
    .map(id => patients.find(p => p.id === id))
    .filter(Boolean) as PatientProfile[];

  const hasActiveFilters =
    bloodGroupFilter !== 'All' || riskFilter !== 'All' || conditionFilter !== '';

  const clearFilters = () => {
    setBloodGroupFilter('All');
    setRiskFilter('All');
    setConditionFilter('');
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">

      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Search Patients</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Find patients by name, Sanjeevani ID, blood group, or condition.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            {patients.length} registered
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-premium"
          >
            <UserPlus className="h-4 w-4" />
            + Register New Patient
          </button>
        </div>
      </div>

      {/* ── Search + Filter Row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, SJV-PAT-ID, phone, blood group, condition…"
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-primary shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-all shadow-sm ${
            hasActiveFilters || showFilters
              ? 'bg-primary text-white border-primary shadow-premium'
              : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="h-5 w-5 rounded-full bg-white/30 text-white text-[10px] font-black flex items-center justify-center">
              {[bloodGroupFilter !== 'All', riskFilter !== 'All', conditionFilter !== ''].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="glass-card p-5 rounded-2xl border-teal-500/15 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
              <Filter className="h-4 w-4 text-primary" /> Refine Results
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Blood Group
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BLOOD_GROUPS.map(bg => (
                  <button
                    key={bg}
                    onClick={() => setBloodGroupFilter(bg)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      bloodGroupFilter === bg
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Risk Level
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RISK_FILTERS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      riskFilter === r
                        ? r === 'Critical'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Chronic Condition */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Chronic Condition
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Asthma…"
                  value={conditionFilter}
                  onChange={e => setConditionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Patients ── */}
      {recentPatients.length > 0 && !query && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recently Viewed</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentPatients.map(p => (
              <button
                key={p.id}
                onClick={() => openProfile(p.id)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-primary hover:text-primary text-slate-700 text-xs font-bold transition-all shadow-sm"
              >
                <div className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 text-[9px] font-black flex items-center justify-center">
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                {p.name}
                <span className="text-[9px] text-slate-400 font-semibold">{p.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-semibold">
          {filtered.length === patients.length
            ? `All ${patients.length} patients`
            : `${filtered.length} of ${patients.length} matching`}
          {query && (
            <span className="ml-1 text-primary">for "<strong>{query}</strong>"</span>
          )}
        </span>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-primary font-bold hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Patient Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
            <Search className="h-7 w-7 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-600">No patients found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Try a different name, SJV-PAT-ID, or clear your filters.
          </p>
          {(query || hasActiveFilters) && (
            <button
              onClick={() => { setQuery(''); clearFilters(); }}
              className="btn-medical text-xs mx-auto mt-2"
            >
              Reset search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(patient => {
            const critical = isCritical(patient);
            const visits = DatabaseService.getVisits(patient.id);
            const lastVisit = visits[0]?.date ?? null;

            return (
              <div
                key={patient.id}
                className={`glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-4 cursor-pointer group transition-all ${
                  critical
                    ? 'border-rose-400/25 bg-rose-50/10'
                    : 'border-slate-200/80'
                }`}
                onClick={() => openProfile(patient.id)}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0 ${
                        critical
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="text-left min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-800 truncate">
                        {patient.name}
                      </h4>
                      {/* ── SJV-PAT-ID Badge ── */}
                      <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-teal-50 border border-teal-500/15 rounded-md text-[10px] font-black text-primary tracking-wide">
                        {patient.id}
                      </span>
                    </div>
                  </div>

                  {/* Risk badge */}
                  <span className={critical ? 'badge-critical shrink-0' : 'badge-stable shrink-0'}>
                    <Heart className="h-3 w-3" />
                    {critical ? 'Critical' : 'Stable'}
                  </span>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/70 rounded-xl p-3 border border-slate-100/60 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Age</span>
                    <span className="text-xs font-extrabold text-slate-700 mt-0.5 block">{patient.age} yrs</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Blood</span>
                    <span className={`text-xs font-extrabold mt-0.5 block ${critical ? 'text-rose-600' : 'text-slate-700'}`}>
                      {patient.bloodGroup}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">BP</span>
                    <span className={`text-xs font-extrabold mt-0.5 block ${patient.vitals.systolicBP > 140 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {patient.vitals.systolicBP}/{patient.vitals.diastolicBP}
                    </span>
                  </div>
                </div>

                {/* Conditions + Allergies */}
                <div className="space-y-2 text-left">
                  {patient.chronicConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-start">
                      <span className="text-[9px] text-slate-400 font-bold uppercase mr-0.5 mt-0.5">Conditions:</span>
                      {patient.chronicConditions.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                      {patient.chronicConditions.length > 3 && (
                        <span className="text-[9px] text-slate-400 font-bold">+{patient.chronicConditions.length - 3}</span>
                      )}
                    </div>
                  )}

                  {patient.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0" />
                      {patient.allergies.map((a, i) => (
                        <span key={i} className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100 font-bold px-2 py-0.5 rounded">
                          {a.allergen} ({a.severity})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Meds count */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Pill className="h-3.5 w-3.5 text-teal-500" />
                    {patient.activeMedications.length} active med{patient.activeMedications.length !== 1 ? 's' : ''}
                  </span>
                  {lastVisit && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Last visit: {lastVisit}
                    </span>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {patient.phone}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); openProfile(patient.id); }}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-bold rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap"
                  >
                    Open Profile
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Patient Modal */}
      <RegisterPatientModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(newId) => {
          setShowRegisterModal(false);
          openProfile(newId);
        }}
      />

    </div>
  );
};
