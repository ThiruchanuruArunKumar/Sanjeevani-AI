// src/components/PatientSearchDropdown.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DatabaseService, PatientProfile, realtimeBroker } from '../services/db';
import { Search, UserPlus, X, Droplets, Heart, ShieldAlert } from 'lucide-react';

interface PatientSearchDropdownProps {
  value: string;                          // currently selected patient ID
  onChange: (patientId: string) => void;  // called when a patient is selected
  onRegisterNew: () => void;              // called when "+ Register New Patient" is clicked
  placeholder?: string;
  disabled?: boolean;
}

export const PatientSearchDropdown: React.FC<PatientSearchDropdownProps> = ({
  value,
  onChange,
  onRegisterNew,
  placeholder = 'Search by name, Patient ID, or phone…',
  disabled = false,
}) => {
  const [patients,  setPatients]  = useState<PatientProfile[]>([]);
  const [query,     setQuery]     = useState('');
  const [isOpen,    setIsOpen]    = useState(false);
  const [focused,   setFocused]   = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  // ── Load + subscribe ──────────────────────────────────────
  const loadPatients = useCallback(() => {
    setPatients(DatabaseService.getPatients());
  }, []);

  useEffect(() => {
    loadPatients();
    const unsub = realtimeBroker.subscribe('patients-update', loadPatients);
    return () => unsub();
  }, [loadPatients]);

  // ── Derive selected patient label ─────────────────────────
  const selectedPatient = patients.find(p => p.id === value) ?? null;

  // ── Filter patients ───────────────────────────────────────
  const filtered = query.trim()
    ? patients.filter(p => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.phone.includes(q)
        );
      })
    : patients;

  // ── Close on outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) { if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true); return; }
    const total = filtered.length + 1; // +1 for register button
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => (f + 1) % total); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => (f - 1 + total) % total); }
    if (e.key === 'Escape')    { setIsOpen(false); setQuery(''); inputRef.current?.blur(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focused < filtered.length) {
        selectPatient(filtered[focused]);
      } else {
        onRegisterNew();
        setIsOpen(false);
      }
    }
  };

  const selectPatient = (p: PatientProfile) => {
    onChange(p.id);
    setQuery('');
    setIsOpen(false);
    setFocused(0);
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setFocused(0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Initials avatar
  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger Input ── */}
      <div
        className={`relative flex items-center w-full rounded-xl border bg-white/70 transition-all ${
          isOpen
            ? 'border-primary ring-2 ring-teal-500/20 shadow-md'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 shrink-0" />

        {/* Show selected patient pill when closed + something selected */}
        {selectedPatient && !isOpen && (
          <div className="flex items-center gap-2 pl-10 pr-10 py-2.5 w-full cursor-pointer" onClick={handleInputClick}>
            <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-800 text-[10px] font-black flex items-center justify-center shrink-0">
              {initials(selectedPatient.name)}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-slate-800 block truncate">{selectedPatient.name}</span>
              <span className="text-[10px] text-primary font-bold">{selectedPatient.id} · {selectedPatient.age} yrs · {selectedPatient.bloodGroup}</span>
            </div>
          </div>
        )}

        {/* Search input — shown when open or nothing selected */}
        {(!selectedPatient || isOpen) && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setFocused(0); }}
            onFocus={handleInputClick}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        )}

        {/* Clear button */}
        {selectedPatient && (
          <button type="button" onClick={handleClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown List ── */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-slide-down max-h-80 overflow-y-auto">

          {/* No results */}
          {filtered.length === 0 && query && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-slate-500 font-semibold">No patients match "<strong>{query}</strong>"</p>
              <p className="text-[10px] text-slate-400 mt-1">Register them as a new patient below</p>
            </div>
          )}

          {/* Patient list */}
          {filtered.map((p, i) => {
            const isCritical = p.vitals.systolicBP > 140 || p.vitals.oxygenSat < 95;
            const isSelected = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); selectPatient(p); }}
                onMouseEnter={() => setFocused(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-slate-50 last:border-0 ${
                  focused === i
                    ? 'bg-teal-50/80'
                    : isSelected
                    ? 'bg-teal-50/40'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 ${
                  isCritical ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {initials(p.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-slate-800 truncate">{p.name}</span>
                    {isSelected && (
                      <span className="text-[9px] bg-teal-100 text-teal-700 font-black px-1.5 py-0.5 rounded-full">Selected</span>
                    )}
                    {isCritical && (
                      <span className="text-[9px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.5 rounded-full">Critical</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold text-primary">{p.id}</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Droplets className="h-2.5 w-2.5 text-rose-400" />{p.bloodGroup}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.age} yrs</span>
                    {p.allergies.length > 0 && (
                      <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        {p.allergies.map(a => a.allergen).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Condition count */}
                {p.chronicConditions.length > 0 && (
                  <span className="shrink-0 text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg">
                    {p.chronicConditions.length} condition{p.chronicConditions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            );
          })}

          {/* Register New Patient CTA */}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onRegisterNew(); setIsOpen(false); }}
            onMouseEnter={() => setFocused(filtered.length)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-t border-slate-100 transition-all ${
              focused === filtered.length ? 'bg-teal-50' : 'hover:bg-teal-50/60'
            }`}
          >
            <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center text-primary shrink-0">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-primary block">+ Register New Patient</span>
              <span className="text-[10px] text-slate-400 font-semibold">Create a new patient record with auto-generated SJV-PAT ID</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
