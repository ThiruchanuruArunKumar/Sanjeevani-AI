// src/components/RegisterPatientModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '../services/db';
import {
  X,
  User,
  Phone,
  Mail,
  Droplets,
  Heart,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Calendar,
} from 'lucide-react';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patientId: string, patientName: string) => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];
const COMMON_CONDITIONS = [
  'Hypertension', 'Diabetes Type 2', 'Diabetes Type 1', 'Asthma',
  'Heart Disease', 'Chronic Kidney Disease', 'COPD', 'Hypothyroidism',
  'Hyperthyroidism', 'Arthritis', 'Epilepsy', 'Depression', 'Anxiety',
];

interface AllergyEntry { allergen: string; severity: string; reaction: string; }

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen, onClose, onSuccess,
}) => {
  // ── Core fields ──────────────────────────────────────────
  const [name,   setName]   = useState('');
  const [age,    setAge]    = useState('');
  const [gender, setGender] = useState('Male');
  const [blood,  setBlood]  = useState('O+');
  const [phone,  setPhone]  = useState('');
  const [email,  setEmail]  = useState('');
  const [ecName, setEcName] = useState('');
  const [ecPhone,setEcPhone]= useState('');

  // ── Allergies (multi-entry) ───────────────────────────────
  const [allergies,    setAllergies]    = useState<AllergyEntry[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergySev,   setAllergySev]   = useState('Moderate');
  const [allergyReact, setAllergyReact] = useState('');

  // ── Chronic Conditions (chips) ────────────────────────────
  const [conditions,    setConditions]    = useState<string[]>([]);
  const [conditionInput,setConditionInput]= useState('');

  // ── UI state ──────────────────────────────────────────────
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [newId,   setNewId]   = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset state on close
  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName(''); setAge(''); setGender('Male'); setBlood('O+');
    setPhone(''); setEmail(''); setEcName(''); setEcPhone('');
    setAllergies([]); setAllergyInput(''); setAllergySev('Moderate'); setAllergyReact('');
    setConditions([]); setConditionInput('');
    setError(''); setSuccess(false); setSaving(false); setNewId('');
  };

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [saving]);

  // ── Allergy helpers ──────────────────────────────────────
  const addAllergy = () => {
    if (!allergyInput.trim()) return;
    setAllergies(prev => [...prev, {
      allergen: allergyInput.trim(),
      severity: allergySev,
      reaction: allergyReact.trim() || 'Adverse reaction',
    }]);
    setAllergyInput(''); setAllergyReact('');
  };
  const removeAllergy = (i: number) => setAllergies(prev => prev.filter((_, idx) => idx !== i));

  // ── Condition helpers ────────────────────────────────────
  const addCondition = (cond: string) => {
    const trimmed = cond.trim();
    if (!trimmed || conditions.includes(trimmed)) return;
    setConditions(prev => [...prev, trimmed]);
    setConditionInput('');
  };
  const removeCondition = (c: string) => setConditions(prev => prev.filter(x => x !== c));

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim())  { setError('Full name is required.'); return; }
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      setError('Please enter a valid age (1–120).'); return;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit phone number.'); return;
    }

    setSaving(true);
    await new Promise(r => setTimeout(r, 600)); // slight UX delay

    const newPatient = DatabaseService.registerPatient({
      name: name.trim(),
      age: Number(age),
      gender,
      bloodGroup: blood,
      phone: phone.trim(),
      email: email.trim(),
      emergencyContactName: ecName.trim() || 'Not provided',
      emergencyContactPhone: ecPhone.trim() || '0000000000',
      allergies,
      chronicConditions: conditions,
    });

    setSaving(false);
    setSuccess(true);
    setNewId(newPatient.id);

    setTimeout(() => {
      onSuccess(newPatient.id, newPatient.name);
      handleClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-teal-50/80 to-emerald-50/40 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Register New Patient</h2>
              <p className="text-xs text-slate-400 mt-0.5">Auto-generates SJV-PAT-XXXXXX ID</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={saving}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success screen */}
        {success && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 gap-5 animate-fade-in px-8">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800">Patient Registered!</h3>
              <p className="text-sm text-slate-500 mt-1">
                <strong>{name}</strong> has been added to the database
              </p>
              <p className="text-xs text-primary font-bold mt-2 font-mono">{newId}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-700 font-bold animate-pulse">
              <ShieldCheck className="h-4 w-4" />
              Auto-selecting patient & syncing all modules…
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-8 py-6 space-y-7">

              {/* Error */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex gap-2 items-start text-xs text-rose-800 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* ── Section 1: Identity ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" /> Patient Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input ref={firstInputRef} type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Priya Nair"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Age <span className="text-rose-500">*</span>
                    </label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)}
                      placeholder="e.g. 35" min={1} max={120}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50">
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-rose-500" /> Blood Group <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {BLOOD_GROUPS.map(bg => (
                        <button key={bg} type="button" onClick={() => setBlood(bg)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition-all ${
                            blood === bg
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'
                          }`}>
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Section 2: Contact ── */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="patient@email.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Emergency Contact Name</label>
                    <input type="text" value={ecName} onChange={e => setEcName(e.target.value)}
                      placeholder="e.g. Rahul Nair (Spouse)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Emergency Contact Phone</label>
                    <input type="tel" value={ecPhone} onChange={e => setEcPhone(e.target.value)}
                      placeholder="Emergency phone number"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50" />
                  </div>
                </div>
              </section>

              {/* ── Section 3: Allergies ── */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Documented Allergies
                </h3>

                {/* Existing allergy chips */}
                {allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((a, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] font-bold">
                        <AlertTriangle className="h-3 w-3 text-rose-500" />
                        {a.allergen} — {a.severity}
                        <button type="button" onClick={() => removeAllergy(i)}
                          className="ml-1 text-rose-400 hover:text-rose-700 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add allergy row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Allergen</label>
                    <input type="text" value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); }}}
                      placeholder="e.g. Penicillin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Severity</label>
                    <select value={allergySev} onChange={e => setAllergySev(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white/50">
                      {SEVERITY_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={addAllergy}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </section>

              {/* ── Section 4: Chronic Conditions ── */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-primary" /> Chronic Conditions
                </h3>

                {/* Condition chips */}
                {conditions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {conditions.map(c => (
                      <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-[11px] font-bold">
                        {c}
                        <button type="button" onClick={() => removeCondition(c)}
                          className="ml-1 text-indigo-400 hover:text-indigo-700 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick-pick common conditions */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Quick Select Common Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_CONDITIONS.map(c => (
                      <button key={c} type="button"
                        onClick={() => conditions.includes(c) ? removeCondition(c) : addCondition(c)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          conditions.includes(c)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom condition input */}
                <div className="flex gap-3">
                  <input type="text" value={conditionInput} onChange={e => setConditionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCondition(conditionInput); }}}
                    placeholder="Type a custom condition and press Enter…"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white/50" />
                  <button type="button" onClick={() => addCondition(conditionInput)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/60 flex gap-3 items-center shrink-0">
              <button type="button" onClick={handleClose} disabled={saving}
                className="flex-1 px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-100 transition-all disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:opacity-90 text-white font-bold rounded-2xl text-sm transition-all active:scale-95 shadow-premium disabled:opacity-60">
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Registering…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Register Patient
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
