// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Doctor\PrescriptionCreator.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile, realtimeBroker } from '../../services/db';
import { AISafetyEngine, Drug, SafetyAlert } from '../../services/ai';
import { PatientSearchDropdown } from '../../components/PatientSearchDropdown';
import { RegisterPatientModal } from '../../components/RegisterPatientModal';
import {
  Stethoscope,
  Pill,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  User,
  Plus,
  Compass,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  Activity,
} from 'lucide-react';

interface PrescriptionCreatorProps {
  initialPatientId?: string;
  onNavigate: (view: string) => void;
}

export const PrescriptionCreator: React.FC<PrescriptionCreatorProps> = ({ initialPatientId = '', onNavigate }) => {
  const [patients,           setPatients]           = useState<PatientProfile[]>([]);
  const [selectedPatientId,  setSelectedPatientId]  = useState(initialPatientId);
  const [activePatient,      setActivePatient]      = useState<PatientProfile | null>(null);
  const [showRegisterModal,  setShowRegisterModal]  = useState(false);

  // Drug form state
  const [drugName,  setDrugName]  = useState('');
  const [dosage,    setDosage]    = useState('');
  const [frequency, setFrequency] = useState('');
  const [morning, setMorning] = useState(false);
  const [afternoon, setAfternoon] = useState(false);
  const [night, setNight] = useState(false);
  const [foodInstruction, setFoodInstruction] = useState<'Before Food' | 'After Food' | 'With Food' | 'No instruction'>('No instruction');
  const [exactTime, setExactTime] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [specialInstruction, setSpecialInstruction] = useState('');

  // Prescription draft
  const [proposedDrugs, setProposedDrugs] = useState<Drug[]>([]);

  // AI Safety state
  const [alerts,    setAlerts]    = useState<SafetyAlert[]>([]);
  const [riskLevel, setRiskLevel] = useState<'stable' | 'elevated' | 'critical'>('stable');
  const [riskScore, setRiskScore] = useState(0);

  const [instructions,    setInstructions]    = useState('');
  const [publishSuccess,  setPublishSuccess]  = useState(false);

  // ── Load patients + realtime subscription ─────────────────
  useEffect(() => {
    setPatients(DatabaseService.getPatients());
    const unsub = realtimeBroker.subscribe('patients-update', () => {
      setPatients(DatabaseService.getPatients());
    });
    return () => unsub();
  }, []);

  // ── Auto-select first patient if none selected ────────────
  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // ── Resolve active patient ─────────────────────────────────
  useEffect(() => {
    const p = DatabaseService.getPatientById(selectedPatientId);
    setActivePatient(p);
    // Reset proposed drugs when patient changes
    setProposedDrugs([]);
    setInstructions('');
  }, [selectedPatientId, patients]);

  // ── AI Safety audit (live) ────────────────────────────────
  useEffect(() => {
    if (!activePatient) { setAlerts([]); setRiskLevel('stable'); setRiskScore(0); return; }
    const audit = AISafetyEngine.runCompleteSafetyAudit(
      proposedDrugs,
      activePatient.allergies,
      activePatient.chronicConditions,
      activePatient.activeMedications,
      activePatient.vitals
    );
    setAlerts(audit.alerts);
    setRiskLevel(audit.riskLevel);
    setRiskScore(audit.riskScore);
  }, [proposedDrugs, activePatient]);

  // ── Drug management ───────────────────────────────────────
  const handleAddDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;
    setProposedDrugs(prev => [...prev, {
      name: drugName.trim(),
      dosage: dosage.trim() || '—',
      frequency: frequency.trim() || '—',
      morning,
      afternoon,
      night,
      foodInstruction,
      exactTime: exactTime.trim() || undefined,
      durationDays: Number(durationDays) || 7,
      specialInstruction: specialInstruction.trim() || undefined,
    }]);
    setDrugName(''); setDosage(''); setFrequency('');
    setMorning(false); setAfternoon(false); setNight(false);
    setFoodInstruction('No instruction'); setExactTime(''); setDurationDays(7); setSpecialInstruction('');
  };

  const handleRemoveDrug = (index: number) =>
    setProposedDrugs(prev => prev.filter((_, i) => i !== index));

  // ── Publish prescription ──────────────────────────────────
  const handlePublishPrescription = () => {
    if (proposedDrugs.length === 0) {
      alert('Add at least one medication to the prescription.');
      return;
    }
    if (!activePatient) return;

    DatabaseService.addVisit(
      activePatient.id,
      'doc_1',
      'Prescription Consultation & AI Safety Audit',
      activePatient.vitals,
      'Medication adjustment session',
      'AI Safety checked. Interaction checking finalized.',
      proposedDrugs,
      instructions
    );

    setPublishSuccess(true);
    setProposedDrugs([]);
    setInstructions('');
    setTimeout(() => {
      setPublishSuccess(false);
      onNavigate(`doctor/patient/${activePatient.id}`);
    }, 3000);
  };

  // ── Register new patient callback ─────────────────────────
  const handlePatientRegistered = (newPatientId: string) => {
    setSelectedPatientId(newPatientId);
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Prescription Safety Prescriber</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Configure pharmaceuticals with live clinical cross-matching checks.
          </p>
        </div>
        {/* Register new patient shortcut */}
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-primary rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          + Register New Patient
        </button>
      </div>

      {/* Success Banner */}
      {publishSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-500/10 rounded-2xl flex items-center gap-3 animate-pulse">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          Prescription published successfully! Real-time notification transmitted to patient dashboard. Redirecting…
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left Column ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Patient Selector */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Select Consultation Patient
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">
                {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
              </span>
            </div>

            <PatientSearchDropdown
              value={selectedPatientId}
              onChange={id => setSelectedPatientId(id)}
              onRegisterNew={() => setShowRegisterModal(true)}
            />

            {/* Selected patient info strip */}
            {activePatient && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/60 space-y-3">
                {/* Basic info row */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Patient</span>
                    <span className="font-extrabold text-slate-800 mt-0.5 block">{activePatient.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">ID</span>
                    <span className="font-bold text-primary mt-0.5 block font-mono text-[10px]">{activePatient.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Age / Blood</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{activePatient.age} yrs · {activePatient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Phone</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{activePatient.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs border-t border-slate-100 pt-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 font-bold block mb-1">Chronic Conditions</span>
                    {activePatient.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {activePatient.chronicConditions.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold rounded-lg">{c}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px]">None documented</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-400 block mb-1">Documented Allergies</span>
                    {activePatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {activePatient.allergies.map((a, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold rounded-lg animate-pulse">
                            <ShieldAlert className="h-2.5 w-2.5" />{a.allergen}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-bold text-[10px]">✓ No known allergies</span>
                    )}
                  </div>
                </div>

                {/* Active meds */}
                {activePatient.activeMedications.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1 mb-1.5">
                      <Pill className="h-3 w-3 text-primary" /> Current Active Medications
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activePatient.activeMedications.map((m, i) => (
                        <span key={i} className="px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-800 text-[10px] font-bold rounded-lg">
                          {m.name} · {m.dosage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!activePatient && (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <User className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">Search for a patient or register a new one</p>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Register New Patient
                </button>
              </div>
            )}
          </div>

          {/* Drug addition form */}
          {activePatient && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Add Pharmaceutical Compound
              </h3>

              <form onSubmit={handleAddDrug} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Medication Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Metformin"
                      value={drugName}
                      onChange={e => setDrugName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Standard Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg"
                      value={dosage}
                      onChange={e => setDosage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Frequency Schedule</label>
                    <input
                      type="text"
                      placeholder="e.g. Twice daily"
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                </div>

                {/* Timing & Scheduling Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 border-t border-slate-100/70">
                  <div className="sm:col-span-6 text-left space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Schedule Slots</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMorning(!morning)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          morning
                            ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm shadow-amber-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>☀</span> Morning
                      </button>
                      <button
                        type="button"
                        onClick={() => setAfternoon(!afternoon)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          afternoon
                            ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm shadow-orange-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>🌤</span> Afternoon
                      </button>
                      <button
                        type="button"
                        onClick={() => setNight(!night)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          night
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-100'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>🌙</span> Night
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-6 text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Food Instruction</label>
                    <select
                      value={foodInstruction}
                      onChange={e => setFoodInstruction(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    >
                      <option value="No instruction">No instruction</option>
                      <option value="Before Food">Before Food</option>
                      <option value="After Food">After Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Exact Intake Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00 AM"
                      value={exactTime}
                      onChange={e => setExactTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Duration (Days)</label>
                    <input
                      type="number"
                      placeholder="7"
                      min={1}
                      value={durationDays}
                      onChange={e => setDurationDays(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Special Guidance</label>
                    <input
                      type="text"
                      placeholder="e.g. Take with water spacing"
                      value={specialInstruction}
                      onChange={e => setSpecialInstruction(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-medical text-xs py-2.5 mt-2 flex items-center justify-center gap-1.5 w-full">
                  <Plus className="h-4 w-4" />
                  Add Medication to Draft
                </button>
              </form>
            </div>
          )}

          {/* Prescription draft list */}
          {activePatient && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Prescription Draft</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold ${
                  proposedDrugs.length > 0
                    ? 'bg-teal-50 text-primary border border-teal-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {proposedDrugs.length} medication{proposedDrugs.length !== 1 ? 's' : ''}
                </span>
              </h3>

              {proposedDrugs.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <span className="text-xs text-slate-400 font-semibold block">Add medications above to construct the prescription.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {proposedDrugs.map((drug, index) => (
                    <div key={index} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-teal-100/60 flex items-center justify-center text-primary shrink-0">
                           <Pill className="h-4 w-4" />
                        </div>
                        <div className="text-left space-y-1">
                          <span className="text-xs font-extrabold text-slate-800 block">{drug.name}</span>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                            <span>{drug.dosage} · {drug.frequency}</span>
                            <span>·</span>
                            <span className="text-primary font-bold">{drug.durationDays} Days</span>
                            {drug.foodInstruction && drug.foodInstruction !== 'No instruction' && (
                              <>
                                <span>·</span>
                                <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[9px] font-bold border border-teal-100">{drug.foodInstruction}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Schedule slots badges */}
                          {(drug.morning || drug.afternoon || drug.night) && (
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {drug.morning && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-bold rounded border border-amber-100">☀ Morning</span>}
                              {drug.afternoon && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-[8px] font-bold rounded border border-orange-100">🌤 Afternoon</span>}
                              {drug.night && <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-bold rounded border border-indigo-100">🌙 Night</span>}
                              {drug.exactTime && <span className="text-[9px] font-medium text-slate-500 font-mono ml-1">🕒 {drug.exactTime}</span>}
                            </div>
                          )}
                          {drug.specialInstruction && (
                            <p className="text-[9px] text-indigo-600 font-semibold italic mt-0.5">💡 {drug.specialInstruction}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDrug(index)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {proposedDrugs.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Prescription Intake Instructions
                    </label>
                    <textarea
                      placeholder="Provide customized scheduling advice…"
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white/50 h-20 resize-none"
                    />
                  </div>
                  <button
                    onClick={handlePublishPrescription}
                    className="btn-medical w-full py-3 font-bold text-sm shadow-premium flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Validate & Publish Prescription
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right Column: AI Safety Engine ── */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-teal-500/20 shadow-premium relative overflow-hidden medical-glow-active">
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-teal-50 text-[10px] font-bold text-primary px-2.5 py-1 rounded-full uppercase tracking-wider border border-teal-500/10">
              <Compass className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: '7s' }} />
              Live Safety Auditor
            </div>

            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              AI Safety Integrity Audit
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Background audit maps your draft drugs against patient's active medications, allergies, and chronic conditions in real-time.
            </p>

            {!activePatient ? (
              <div className="mt-8 p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <Activity className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">Select a patient to activate the AI safety engine</p>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                {/* Risk level */}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wide">Prescription Risk Level</span>
                  <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    riskLevel === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    riskLevel === 'elevated' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {riskLevel} ({riskScore}/100)
                  </span>
                </div>

                {/* Risk bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      riskLevel === 'critical' ? 'bg-gradient-to-r from-rose-400 to-rose-600' :
                      riskLevel === 'elevated' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                      'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    }`}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>

                {/* Alerts */}
                <div className="space-y-3 pt-3 border-t border-slate-100 max-h-[380px] overflow-y-auto pr-1">
                  {alerts.length === 0 ? (
                    <div className="p-4 bg-emerald-50/45 rounded-xl border border-emerald-500/10 text-emerald-800 text-xs font-medium flex items-center gap-2.5 text-left">
                      <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                      {proposedDrugs.length === 0
                        ? 'Add medications to begin the AI safety audit.'
                        : 'Prescription fully validated. No interactions, allergy, or contraindications flagged.'}
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 text-left relative overflow-hidden ${
                          alert.severity === 'critical'
                            ? 'bg-rose-50/50 border-rose-500/10 text-rose-800'
                            : 'bg-amber-50/50 border-amber-500/10 text-amber-800'
                        }`}
                      >
                        <span className="font-extrabold flex items-center gap-1">
                          <Flame className="h-4 w-4 shrink-0" />
                          {alert.title}
                        </span>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{alert.message}</p>
                        {alert.suggestedAlternative && (
                          <div className="p-2.5 bg-teal-50 border border-teal-500/5 text-primary font-bold rounded-lg text-[10px] leading-normal">
                            Alternative Recommendation:<br />
                            <span className="text-slate-700 font-semibold">{alert.suggestedAlternative}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Register Patient Modal */}
      <RegisterPatientModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handlePatientRegistered}
      />
    </div>
  );
};
