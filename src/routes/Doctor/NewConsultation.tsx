// src/routes/Doctor/NewConsultation.tsx
// Full real-time consultation form: vitals + drugs + diagnosis + notes + follow-up
import React, { useState, useEffect } from 'react';
import {
  DatabaseService,
  PatientProfile,
  realtimeBroker,
} from '../../services/db';
import {
  ArrowLeft,
  Stethoscope,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Zap,
  Scale,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  CalendarDays,
  Pill,
  FileText,
  Save,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

interface NewConsultationProps {
  patientId: string;
  onNavigate: (view: string) => void;
}

interface DrugEntry {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
}

// ── Status badge helpers ────────────────────────────────
function bpStatus(sys: number) {
  if (sys > 160) return { label: 'Critical', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
  if (sys > 140) return { label: 'High', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  if (sys < 90)  return { label: 'Low', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
  return { label: 'Stable', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}
function hrStatus(hr: number) {
  if (hr > 100) return { label: 'High', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  if (hr < 50)  return { label: 'Low', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
  return { label: 'Stable', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}
function spo2Status(spo2: number) {
  if (spo2 < 92) return { label: 'Critical', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
  if (spo2 < 95) return { label: 'Low', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  return { label: 'Normal', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}
function sugarStatus(g: number) {
  if (g > 200) return { label: 'Critical', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
  if (g > 140) return { label: 'High', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  if (g < 70)  return { label: 'Low', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
  return { label: 'Normal', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}
function tempStatus(t: number) {
  if (t > 103) return { label: 'High Fever', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
  if (t > 100.4) return { label: 'Fever', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  if (t < 96.5) return { label: 'Low', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
  return { label: 'Normal', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}

// ── Mini Vital Input Card ───────────────────────────────
function VitalInput({
  icon, label, unit, value, onChange, status, min, max, step,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  status: { label: string; cls: string };
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="glass-card p-4 rounded-2xl space-y-2 relative group">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          {icon}
          {label}
        </span>
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${status.cls}`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full text-2xl font-black text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none pb-1 transition-colors"
        />
        <span className="text-xs text-slate-400 font-semibold pb-1.5 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

export const NewConsultation: React.FC<NewConsultationProps> = ({ patientId, onNavigate }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  // ── Vitals state ───────────────────────────────────────
  const [sysBP,    setSysBP]    = useState(120);
  const [diaBP,    setDiaBP]    = useState(80);
  const [heartRate,setHeartRate]= useState(72);
  const [spo2,     setSpo2]     = useState(98);
  const [glucose,  setGlucose]  = useState(100);
  const [temp,     setTemp]     = useState(98.6);
  const [weight,   setWeight]   = useState(70);
  const [pulse,    setPulse]    = useState(72);

  // ── Clinical fields ────────────────────────────────────
  const [reason,    setReason]    = useState('');
  const [symptoms,  setSymptoms]  = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes,     setNotes]     = useState('');
  const [followUp,  setFollowUp]  = useState('');
  const [drugs,     setDrugs]     = useState<DrugEntry[]>([
    { id: 1, name: '', dosage: '', frequency: '' }
  ]);

  // ── UI state ───────────────────────────────────────────
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [step,    setStep]    = useState<'vitals' | 'clinical' | 'meds'>('vitals');

  useEffect(() => {
    const p = DatabaseService.getPatientById(patientId);
    if (p) {
      setPatient(p);
      // Pre-fill from last recorded vitals
      setSysBP(p.vitals.systolicBP);
      setDiaBP(p.vitals.diastolicBP);
      setHeartRate(p.vitals.heartRate);
      setSpo2(p.vitals.oxygenSat);
      setGlucose(p.vitals.bloodGlucose ?? 100);
      setTemp(p.vitals.temperature ?? 98.6);
      setPulse(p.vitals.heartRate);
    }
    const unsub = realtimeBroker.subscribe(`patient-${patientId}`, () => {
      const updated = DatabaseService.getPatientById(patientId);
      if (updated) setPatient(updated);
    });
    return () => unsub();
  }, [patientId]);

  // ── Drug management ────────────────────────────────────
  const addDrug = () =>
    setDrugs(d => [...d, { id: Date.now(), name: '', dosage: '', frequency: '' }]);
  const removeDrug = (id: number) =>
    setDrugs(d => d.filter(x => x.id !== id));
  const updateDrug = (id: number, field: keyof DrugEntry, val: string) =>
    setDrugs(d => d.map(x => x.id === id ? { ...x, [field]: val } : x));

  // ── Save ───────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !diagnosis) return;

    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // simulate async

    const vitals = {
      systolicBP:  sysBP,
      diastolicBP: diaBP,
      heartRate,
      oxygenSat:   spo2,
      bloodGlucose: glucose,
      temperature:  temp,
      weight,
      pulseRate:    pulse,
    };

    const validDrugs = drugs
      .filter(d => d.name.trim())
      .map(d => ({ name: d.name, dosage: d.dosage, frequency: d.frequency }));

    DatabaseService.addVisit(
      patientId,
      'doc_1',
      reason,
      vitals,
      diagnosis,
      `${symptoms ? `Symptoms: ${symptoms}\n` : ''}${notes}${followUp ? `\nFollow-up: ${followUp}` : ''}`,
      validDrugs,
      'Take as prescribed. Contact clinic if symptoms worsen.'
    );

    setSaving(false);
    setSuccess(true);

    setTimeout(() => {
      onNavigate(`doctor/patient/${patientId}`);
    }, 2000);
  };

  if (!patient) return null;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-5 animate-fade-in">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Consultation Saved!</h2>
        <p className="text-sm text-slate-500 max-w-xs text-center">
          Vitals and clinical notes have been synced to{' '}
          <strong>{patient.name}</strong>'s health portal in real-time.
        </p>
        <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse">
          <Activity className="h-4 w-4" />
          Patient dashboard updating…
        </div>
      </div>
    );
  }

  const stepTabs = [
    { key: 'vitals',   label: 'Live Vitals',   icon: <Activity className="h-4 w-4" /> },
    { key: 'clinical', label: 'Clinical Notes', icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'meds',     label: 'Medicines',      icon: <Pill className="h-4 w-4" /> },
  ] as const;

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fade-in text-left max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(`doctor/patient/${patientId}`)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">
              New Consultation
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {patient.name}
              <span className="ml-3 text-sm text-slate-400 font-semibold">{patient.id}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live Sync Active
          </div>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {stepTabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setStep(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              step === t.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ STEP 1: VITALS ══════════════ */}
      {step === 'vitals' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Live Vitals Entry</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter measured vitals. Status badges update automatically. Patient dashboard syncs on save.
            </p>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalInput
              icon={<Activity className="h-3 w-3 text-rose-500" />}
              label="Systolic BP"
              unit="mmHg"
              value={sysBP}
              onChange={setSysBP}
              status={bpStatus(sysBP)}
              min={60} max={250}
            />
            <VitalInput
              icon={<Activity className="h-3 w-3 text-slate-400" />}
              label="Diastolic BP"
              unit="mmHg"
              value={diaBP}
              onChange={setDiaBP}
              status={bpStatus(diaBP + 40)}
              min={40} max={150}
            />
            <VitalInput
              icon={<Heart className="h-3 w-3 text-rose-500" />}
              label="Heart Rate"
              unit="BPM"
              value={heartRate}
              onChange={setHeartRate}
              status={hrStatus(heartRate)}
              min={30} max={220}
            />
            <VitalInput
              icon={<Zap className="h-3 w-3 text-blue-500" />}
              label="Pulse Rate"
              unit="BPM"
              value={pulse}
              onChange={setPulse}
              status={hrStatus(pulse)}
              min={30} max={220}
            />
            <VitalInput
              icon={<Droplets className="h-3 w-3 text-teal-500" />}
              label="SpO₂"
              unit="%"
              value={spo2}
              onChange={setSpo2}
              status={spo2Status(spo2)}
              min={70} max={100}
            />
            <VitalInput
              icon={<Droplets className="h-3 w-3 text-amber-500" />}
              label="Blood Sugar"
              unit="mg/dL"
              value={glucose}
              onChange={setGlucose}
              status={sugarStatus(glucose)}
              min={40} max={600}
            />
            <VitalInput
              icon={<Thermometer className="h-3 w-3 text-orange-500" />}
              label="Temperature"
              unit="°F"
              value={temp}
              onChange={setTemp}
              status={tempStatus(temp)}
              min={90} max={110} step={0.1}
            />
            <VitalInput
              icon={<Scale className="h-3 w-3 text-indigo-500" />}
              label="Weight"
              unit="kg"
              value={weight}
              onChange={setWeight}
              status={{ label: 'Recorded', cls: 'bg-slate-100 text-slate-600 border-slate-200' }}
              min={20} max={300}
            />
          </div>

          {/* Summary strip */}
          <div className="glass-card p-4 rounded-2xl bg-slate-50/60 border-slate-200/60">
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-semibold">
              <span>BP: <strong className="text-slate-800">{sysBP}/{diaBP} mmHg</strong></span>
              <span>HR: <strong className="text-slate-800">{heartRate} BPM</strong></span>
              <span>SpO₂: <strong className="text-slate-800">{spo2}%</strong></span>
              <span>Sugar: <strong className="text-slate-800">{glucose} mg/dL</strong></span>
              <span>Temp: <strong className="text-slate-800">{temp}°F</strong></span>
              <span>Weight: <strong className="text-slate-800">{weight} kg</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('clinical')}
            className="btn-medical text-xs font-bold"
          >
            Continue to Clinical Notes →
          </button>
        </div>
      )}

      {/* ══════════════ STEP 2: CLINICAL ══════════════ */}
      {step === 'clinical' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Clinical Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Document the consultation reason, symptoms, diagnosis, and follow-up.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Reason for Visit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BP Follow-up & Diabetes Review"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Clinical Diagnosis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Controlled Hypertension Stage 2"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Presenting Symptoms
              </label>
              <input
                type="text"
                placeholder="e.g. Fatigue, morning headache, mild dyspnea"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Physician Clinical Notes
              </label>
              <textarea
                rows={4}
                placeholder="Detailed examination findings, dietary restrictions, lifestyle advice, referrals…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUp}
                onChange={e => setFollowUp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white"
              />
            </div>
          </div>

          {/* Allergy warning reminder */}
          {patient.allergies.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <strong className="block mb-1">⚠ Active Allergy Flags:</strong>
                {patient.allergies.map((a, i) => (
                  <span key={i} className="inline-block mr-3">
                    <strong>{a.allergen}</strong> — {a.severity} ({a.reaction})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('vitals')} className="btn-medical-secondary text-xs font-bold">
              ← Back to Vitals
            </button>
            <button type="button" onClick={() => setStep('meds')} className="btn-medical text-xs font-bold">
              Continue to Medicines →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 3: MEDICINES ══════════════ */}
      {step === 'meds' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Prescribe Medicines</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Medicines added here become active medications on the patient's profile immediately after save.
            </p>
          </div>

          <div className="space-y-3">
            {drugs.map((drug, idx) => (
              <div
                key={drug.id}
                className="glass-card p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end relative"
              >
                <span className="absolute -top-2 -left-1 text-[9px] font-black text-slate-400 uppercase">
                  Drug #{idx + 1}
                </span>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Metformin"
                    value={drug.name}
                    onChange={e => updateDrug(drug.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={drug.dosage}
                    onChange={e => updateDrug(drug.id, 'dosage', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-1 flex-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                      Frequency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Twice daily after food"
                      value={drug.frequency}
                      onChange={e => updateDrug(drug.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                  {drugs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDrug(drug.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all mb-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addDrug}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-teal-300 text-primary text-xs font-bold rounded-xl hover:bg-teal-50 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Another Medicine
          </button>

          {/* AI Safety notice */}
          <div className="p-4 bg-teal-50/60 border border-teal-500/15 rounded-2xl flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-teal-800">
              <strong className="block mb-1">AI Drug Safety Engine Active</strong>
              All prescriptions are cross-checked against {patient.name}'s documented allergies and
              existing active medications automatically upon save.
            </div>
          </div>

          {/* Summary before saving */}
          <div className="glass-card p-5 rounded-2xl space-y-3 border-primary/10">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Consultation Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Patient</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{patient.name}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">BP</span>
                <span className={`font-extrabold mt-0.5 block ${sysBP > 140 ? 'text-rose-700' : 'text-slate-800'}`}>
                  {sysBP}/{diaBP} mmHg
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">SpO₂</span>
                <span className={`font-extrabold mt-0.5 block ${spo2 < 92 ? 'text-rose-700' : 'text-slate-800'}`}>
                  {spo2}%
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Blood Sugar</span>
                <span className={`font-extrabold mt-0.5 block ${glucose > 140 ? 'text-amber-700' : 'text-slate-800'}`}>
                  {glucose} mg/dL
                </span>
              </div>
            </div>
            {reason && (
              <div className="text-xs text-slate-600">
                <strong>Diagnosis:</strong> {diagnosis || '—'}
              </div>
            )}
            <div className="text-xs text-slate-600">
              <strong>Medicines:</strong>{' '}
              {drugs.filter(d => d.name).map(d => d.name).join(', ') || 'None added'}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('clinical')} className="btn-medical-secondary text-xs font-bold">
              ← Back to Clinical
            </button>
            <button
              type="submit"
              disabled={saving || !reason || !diagnosis}
              className={`btn-medical text-xs font-bold flex-1 ${saving ? 'opacity-70' : ''}`}
            >
              {saving ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Saving & Syncing…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Consultation & Sync Patient
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
