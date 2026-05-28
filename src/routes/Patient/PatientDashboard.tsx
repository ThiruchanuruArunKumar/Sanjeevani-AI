// src/routes/Patient/PatientDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService, PatientProfile, ClinicalVisit, realtimeBroker } from '../../services/db';
import { AISafetyEngine } from '../../services/ai';
import {
  Activity,
  Heart,
  Pill,
  ShieldAlert,
  QrCode,
  Stethoscope,
  ShieldCheck,
  TrendingUp,
  Check,
  Droplets,
  Thermometer,
  Zap,
  Scale,
  Calendar,
  Clock,
  Bell,
  RefreshCw,
} from 'lucide-react';

interface PatientDashboardProps {
  onNavigate: (view: string) => void;
}

// ── Status logic ─────────────────────────────────────────
function bpStatus(sys: number): { label: string; color: string; bg: string; border: string } {
  if (sys > 160) return { label: 'Critical', color: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200' };
  if (sys > 140) return { label: 'High',     color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' };
  if (sys < 90)  return { label: 'Low',      color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' };
  return              { label: 'Stable',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
}
function hrStatus(hr: number) {
  if (hr > 100) return { label: 'High',     color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' };
  if (hr < 50)  return { label: 'Low',      color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' };
  return              { label: 'Normal',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
}
function spo2Status(v: number) {
  if (v < 92) return { label: 'Critical', color: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200' };
  if (v < 95) return { label: 'Low',      color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' };
  return            { label: 'Normal',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
}
function sugarStatus(v: number) {
  if (v > 200) return { label: 'Critical', color: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200' };
  if (v > 140) return { label: 'High',     color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' };
  if (v < 70)  return { label: 'Low',      color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' };
  return              { label: 'Normal',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
}
function tempStatus(v: number) {
  if (v > 103)   return { label: 'High Fever', color: 'text-rose-700',   bg: 'bg-rose-50',    border: 'border-rose-200' };
  if (v > 100.4) return { label: 'Fever',      color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' };
  if (v < 96.5)  return { label: 'Low',        color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' };
  return                { label: 'Normal',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
}

// ── Premium Vital Card ───────────────────────────────────
function VitalCard({
  icon, label, value, unit, status, pulse: doPulse = false, updated = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  status: { label: string; color: string; bg: string; border: string };
  pulse?: boolean;
  updated?: boolean;
}) {
  return (
    <div
      className={`glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between h-36 relative overflow-hidden transition-all ${
        updated ? 'ring-2 ring-primary/40 shadow-premium' : ''
      }`}
    >
      {/* Updated flash overlay */}
      {updated && (
        <div className="absolute inset-0 bg-teal-500/5 pointer-events-none rounded-2xl animate-pulse" />
      )}

      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          {icon}
          {label}
        </span>
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
          {status.label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-black text-slate-800 leading-none tabular-nums">
          {value}
          <span className="text-[11px] font-normal text-slate-400 ml-1">{unit}</span>
        </span>
        {doPulse && (
          <Heart className="h-5 w-5 text-rose-500 animate-pulse shrink-0" />
        )}
      </div>

      {/* Bottom glow bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
        status.label === 'Critical' ? 'bg-rose-400' :
        status.label === 'High' || status.label === 'Fever' ? 'bg-amber-400' :
        status.label === 'Low' ? 'bg-blue-400' :
        'bg-emerald-400'
      } opacity-60`} />
    </div>
  );
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
  const [patient,    setPatient]    = useState<PatientProfile | null>(null);
  const [lastVisit,  setLastVisit]  = useState<ClinicalVisit | null>(null);
  const [syncMsg,    setSyncMsg]    = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [updatedKeys, setUpdatedKeys] = useState<Set<string>>(new Set());
  const prevVitals = useRef<any>(null);

  // Medication Feedback State
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [activeFeedbackDrug, setActiveFeedbackDrug] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<'Better' | 'Same' | 'Worse' | 'Severe Side Effects' | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // AI Predictions State
  const [predictions, setPredictions] = useState<any[]>([]);
  const [scanningAI, setScanningAI] = useState(false);

  // Smart Medication Timeline & Adherence HUD State
  const [adherenceScore, setAdherenceScore] = useState<number>(100);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);

  const loadData = () => {
    const { user } = DatabaseService.getActiveSession();
    if (!user) return;
    const p = DatabaseService.getPatientById(user.id);
    if (!p) return;

    // Detect which vitals changed to flash their cards
    if (prevVitals.current) {
      const changed = new Set<string>();
      const v = p.vitals;
      const pv = prevVitals.current;
      if (v.systolicBP  !== pv.systolicBP)  { changed.add('bp');    }
      if (v.heartRate   !== pv.heartRate)    { changed.add('hr');    }
      if (v.oxygenSat   !== pv.oxygenSat)   { changed.add('spo2');  }
      if (v.bloodGlucose!== pv.bloodGlucose){ changed.add('sugar'); }
      if (v.temperature !== pv.temperature)  { changed.add('temp');  }
      if (v.weight      !== pv.weight)       { changed.add('wt');    }
      if (v.pulseRate   !== pv.pulseRate)    { changed.add('pulse'); }
      if (changed.size > 0) {
        setUpdatedKeys(changed);
        setTimeout(() => setUpdatedKeys(new Set()), 4000);
      }
    }

    prevVitals.current = { ...p.vitals };
    setPatient(p);
    setLastSynced(new Date());

    const visits = DatabaseService.getVisits(user.id);
    setLastVisit(visits[0] ?? null);

    setFeedbacks(DatabaseService.getFeedbacks(user.id));
    setPredictions(DatabaseService.getPredictions(user.id));

    // Load scheduling and compliance telemetry
    const logs = DatabaseService.getMedicationLogs(p.id);
    const score = DatabaseService.getAdherenceScore(p.id);
    setAdherenceScore(score);

    const todayStr = new Date().toISOString().split('T')[0];
    setTodayLogs(logs.filter(l => l.date === todayStr));
  };

  useEffect(() => {
    loadData();
    const { user } = DatabaseService.getActiveSession();
    if (!user) return;

    const unsub = realtimeBroker.subscribe(`patient-${user.id}`, () => {
      loadData();
      setSyncMsg('Dr. Aarav Mehta updated your health record. Dashboard synced in real-time.');
      setTimeout(() => setSyncMsg(null), 6000);
    });

    const unsubFeedbacks = realtimeBroker.subscribe('feedbacks-update', () => {
      loadData();
    });

    const unsubPredictions = realtimeBroker.subscribe('predictions-update', () => {
      loadData();
    });

    const unsubLogs = realtimeBroker.subscribe('medication-logs-update', () => {
      loadData();
    });

    return () => {
      unsub();
      unsubFeedbacks();
      unsubPredictions();
      unsubLogs();
    };
  }, []);

  if (!patient) return null;

  const { riskLevel, riskScore } = AISafetyEngine.runCompleteSafetyAudit(
    patient.activeMedications,
    patient.allergies,
    patient.chronicConditions,
    [],
    patient.vitals
  );

  const v = patient.vitals;
  const bp = bpStatus(v.systolicBP);

  return (
    <div className="space-y-8 animate-fade-in text-left">

      {/* ── Real-time sync banner ── */}
      {syncMsg && (
        <div className="p-4 bg-teal-50 border border-teal-400/25 text-primary font-bold text-xs rounded-2xl flex items-center gap-3 animate-slide-down medical-glow-active">
          <RefreshCw className="h-4 w-4 text-primary animate-spin" />
          {syncMsg}
          <span className="ml-auto text-[9px] bg-primary text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            ✓ Live Synced
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Health Portal</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium flex items-center gap-2">
            Welcome, <strong>{patient.name}</strong>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Live • Synced {lastSynced.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <button
          onClick={() => onNavigate('patient/qr')}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-premium active:scale-95 transition-all"
        >
          <QrCode className="h-4.5 w-4.5 animate-pulse" />
          Emergency QR Card
        </button>
      </div>

      {/* ── 8 Live Vitals Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            Live Health Vitals
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold">
            Updated by Dr. Aarav Mehta · {lastVisit?.date ?? 'Not yet recorded'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Blood Pressure */}
          <VitalCard
            icon={<Activity className="h-3 w-3 text-rose-500" />}
            label="Blood Pressure"
            value={`${v.systolicBP}/${v.diastolicBP}`}
            unit="mmHg"
            status={bp}
            updated={updatedKeys.has('bp')}
          />

          {/* Heart Rate */}
          <VitalCard
            icon={<Heart className="h-3 w-3 text-rose-500" />}
            label="Heart Rate"
            value={v.heartRate}
            unit="BPM"
            status={hrStatus(v.heartRate)}
            pulse
            updated={updatedKeys.has('hr')}
          />

          {/* SpO2 */}
          <VitalCard
            icon={<Droplets className="h-3 w-3 text-teal-500" />}
            label="Oxygen (SpO₂)"
            value={v.oxygenSat}
            unit="%"
            status={spo2Status(v.oxygenSat)}
            updated={updatedKeys.has('spo2')}
          />

          {/* Blood Sugar */}
          <VitalCard
            icon={<Droplets className="h-3 w-3 text-amber-500" />}
            label="Blood Sugar"
            value={v.bloodGlucose ?? '—'}
            unit="mg/dL"
            status={sugarStatus(v.bloodGlucose ?? 100)}
            updated={updatedKeys.has('sugar')}
          />

          {/* Temperature */}
          <VitalCard
            icon={<Thermometer className="h-3 w-3 text-orange-500" />}
            label="Temperature"
            value={v.temperature}
            unit="°F"
            status={tempStatus(v.temperature)}
            updated={updatedKeys.has('temp')}
          />

          {/* Pulse Rate */}
          <VitalCard
            icon={<Zap className="h-3 w-3 text-blue-500" />}
            label="Pulse Rate"
            value={v.pulseRate ?? v.heartRate}
            unit="BPM"
            status={hrStatus(v.pulseRate ?? v.heartRate)}
            updated={updatedKeys.has('pulse')}
          />

          {/* Weight */}
          <VitalCard
            icon={<Scale className="h-3 w-3 text-indigo-500" />}
            label="Weight"
            value={v.weight ?? '—'}
            unit="kg"
            status={{ label: 'Recorded', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }}
            updated={updatedKeys.has('wt')}
          />

          {/* Diastolic separately */}
          <VitalCard
            icon={<Activity className="h-3 w-3 text-purple-500" />}
            label="Diastolic BP"
            value={v.diastolicBP}
            unit="mmHg"
            status={bpStatus(v.diastolicBP + 40)}
            updated={updatedKeys.has('bp')}
          />
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Active prescriptions + last visit */}
        <div className="lg:col-span-7 space-y-6">

          {/* Last Visit Summary */}
          {lastVisit && (
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Latest Consultation
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {lastVisit.date}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <span className="text-slate-400 font-bold w-20 shrink-0">Reason</span>
                  <span className="font-semibold text-slate-700">{lastVisit.reasonForVisit}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400 font-bold w-20 shrink-0">Diagnosis</span>
                  <span className="font-bold text-slate-800">{lastVisit.diagnosis}</span>
                </div>
                {lastVisit.notes && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-slate-600 mt-2">
                    {lastVisit.notes}
                  </div>
                )}
              </div>

              {lastVisit.prescriptions && lastVisit.prescriptions.drugs.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Pill className="h-3 w-3 text-primary" />
                    Prescribed Medicines
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lastVisit.prescriptions.drugs.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 bg-teal-50 border border-teal-500/15 text-teal-800 text-[10px] font-bold rounded-lg">
                        {d.name} · {d.dosage} · {d.frequency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => onNavigate('patient/history')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mt-1"
              >
                <Clock className="h-3.5 w-3.5" />
                View full visit history →
              </button>
            </div>
          )}

          {/* 🩺 Sanjeevani AI Post-Prescription Follow-Up & Recovery Monitor */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-teal-500/10 shadow-premium relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Sanjeevani AI Drug Safety & Recovery Monitor
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Post-prescription daily monitoring and clinical symptoms checker.</p>
              </div>
            </div>

            {feedbackSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-scale-up">
                <div className="h-12 w-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold font-sans">✓</div>
                <h4 className="text-sm font-black text-emerald-800">Daily Log Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700 leading-normal font-semibold">
                  Sanjeevani AI has analyzed your parameters and synced the safety report with your cardiologist in real-time.
                </p>
                <button
                  onClick={() => {
                    setFeedbackSuccess(false);
                    setActiveFeedbackDrug(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Log Another Medicine
                </button>
              </div>
            ) : activeFeedbackDrug ? (
              /* FEEDBACK SUBMISSION FORM */
              <div className="space-y-4 text-left animate-slide-down">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl">
                  <span className="text-xs font-extrabold text-slate-700">
                    Logging daily recovery report for <strong className="text-primary">{activeFeedbackDrug}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setActiveFeedbackDrug(null);
                      setFeeling(null);
                      setSelectedSymptoms([]);
                      setFeedbackNotes('');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    [Cancel]
                  </button>
                </div>

                {/* Overall Feeling Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">How are you feeling after taking this medicine?</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Better', 'Same', 'Worse', 'Severe Side Effects'] as const).map((opt) => {
                      const isActive = feeling === opt;
                      const colorClass = 
                        opt === 'Better' ? (isActive ? 'bg-emerald-500 border-emerald-500 text-white font-sans' : 'hover:bg-emerald-50 text-emerald-700 border-emerald-200 bg-white font-sans') :
                        opt === 'Same' ? (isActive ? 'bg-slate-500 border-slate-500 text-white font-sans' : 'hover:bg-slate-100 text-slate-700 border-slate-200 bg-white font-sans') :
                        opt === 'Worse' ? (isActive ? 'bg-amber-500 border-amber-500 text-white font-sans' : 'hover:bg-amber-50 text-amber-700 border-amber-200 bg-white font-sans') :
                        (isActive ? 'bg-rose-500 border-rose-500 text-white animate-pulse font-sans' : 'hover:bg-rose-50 text-rose-700 border-rose-200 bg-white font-sans');
                      
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFeeling(opt)}
                          className={`px-3 py-2.5 rounded-xl border text-[11px] font-black transition-all text-center leading-none ${colorClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Symptoms Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Select any side effects or clinical symptoms noticed:</span>
                  <div className="flex flex-wrap gap-2">
                    {['headache', 'dizziness', 'vomiting', 'allergy', 'chest pain', 'breathing issue', 'weakness'].map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      const isCritical = sym === 'chest pain' || sym === 'breathing issue';
                      const activeStyle = isSelected
                        ? (isCritical ? 'bg-rose-500 text-white border-rose-500 font-sans' : 'bg-amber-500 text-white border-amber-500 font-sans')
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 font-sans';

                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
                            } else {
                              setSelectedSymptoms([...selectedSymptoms, sym]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold capitalize transition-all ${activeStyle}`}
                        >
                          {sym === 'allergy' ? '🚨 Skin Allergy/Hives' : sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Additional comments (optional):</span>
                  <textarea
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Describe any side effects, symptom timing, or blood pressure changes..."
                    className="w-full min-h-[60px] p-3 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-white transition-all font-semibold text-slate-700"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  disabled={!feeling}
                  onClick={() => {
                    if (!feeling) return;
                    const activePresId = lastVisit?.prescriptions?.id ?? 'pres_1';
                    DatabaseService.submitFeedback({
                      patientId: patient.id,
                      patientName: patient.name,
                      prescriptionId: activePresId,
                      drugName: activeFeedbackDrug,
                      feeling,
                      symptoms: selectedSymptoms,
                      notes: feedbackNotes
                    });

                    setFeedbackSuccess(true);
                    setFeeling(null);
                    setSelectedSymptoms([]);
                    setFeedbackNotes('');
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    feeling ? 'bg-primary hover:opacity-95 shadow-premium active:scale-95' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Submit Daily Report & Verify with AI
                </button>
              </div>
            ) : (
              /* DRUG SELECTION GRID */
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-left">
                  👉 Choose a medication to submit active feedback:
                </span>
                
                {patient.activeMedications.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-400 text-xs font-semibold">
                    No active prescriptions found to monitor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {patient.activeMedications.map((med, i) => {
                      const latestFeedback = feedbacks.find(f => f.drugName.toLowerCase() === med.name.toLowerCase());
                      return (
                        <div
                          key={i}
                          className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between gap-3 hover:border-primary/20 transition-all"
                        >
                          <div>
                            <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                              <Pill className="h-3.5 w-3.5 text-primary" />
                              {med.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">{med.dosage} · {med.frequency}</span>
                            {latestFeedback && (
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded mt-2 inline-block ${
                                latestFeedback.aiSeverity === 'critical' ? 'bg-rose-50 text-rose-700' :
                                latestFeedback.aiSeverity === 'elevated' ? 'bg-amber-50 text-amber-700' :
                                'bg-emerald-50 text-emerald-700'
                              }`}>
                                Latest: {latestFeedback.feeling}
                              </span>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setActiveFeedbackDrug(med.name)}
                            className="w-full py-1.5 bg-white border border-slate-200 hover:border-primary/30 text-primary hover:bg-teal-50/20 rounded-lg text-[10px] font-bold text-center transition-all"
                          >
                            Log Daily Status
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 📜 RECOVERY HISTORY / LOGS */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide text-left flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                My Recovery Logs & AI Safety Status
              </h4>

              {feedbacks.length === 0 ? (
                <div className="text-left py-4 px-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-400 text-[10px] font-semibold">
                  No monitoring feedback reported yet. Logs will generate once you submit status checks above.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1 text-left">
                  {feedbacks.map((fb, idx) => (
                    <div
                      key={fb.id || idx}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800">{fb.drugName} Report</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{fb.date}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400 font-bold uppercase mr-1">Feeling:</span>
                        <span className={`font-black uppercase px-2 py-0.5 rounded ${
                          fb.feeling === 'Better' ? 'bg-emerald-50 text-emerald-700' :
                          fb.feeling === 'Same' ? 'bg-slate-100 text-slate-600' :
                          fb.feeling === 'Worse' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700 animate-pulse'
                        }`}>
                          {fb.feeling}
                        </span>

                        {fb.symptoms.length > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 font-bold uppercase mr-1">Side Effects:</span>
                            {fb.symptoms.map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 font-bold rounded capitalize">
                                {s}
                              </span>
                            ))}
                          </>
                        )}
                      </div>

                      {fb.notes && (
                        <p className="text-[10.5px] italic text-slate-500 leading-normal font-semibold">
                          &ldquo;{fb.notes}&rdquo;
                        </p>
                      )}

                      {/* AI Safety Analysis */}
                      <div className={`p-3 rounded-lg border text-[10.5px] leading-relaxed font-semibold ${
                        fb.aiSeverity === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                        fb.aiSeverity === 'elevated' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                        'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <span className="font-black block mb-0.5 uppercase tracking-wide flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                          Sanjeevani AI Safety Status: {fb.aiSeverity}
                        </span>
                        {fb.aiAnalysis}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 🩺 Smart Medication Timeline & Guidance HUD */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-teal-500/10 shadow-premium relative overflow-hidden">
            {/* Background glowing line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-teal-500 to-indigo-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Smart Medication Scheduling & Reminder HUD
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Interactive timeline, intake schedules, compliance tracking, and live AI guidance tips.</p>
              </div>
              <span className="text-[10px] bg-teal-50 text-primary border border-teal-500/15 font-bold px-2.5 py-1 rounded-full shrink-0">
                {patient.activeMedications.length} Active Medicines
              </span>
            </div>

            {/* Performance Indicators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Compliance Score Dial Card */}
              <div className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden ${
                adherenceScore >= 80 ? 'bg-emerald-50/50 border-emerald-500/10 text-emerald-950' : 'bg-rose-50/50 border-rose-500/10 text-rose-950 animate-pulse'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compliance Rate</span>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                    adherenceScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {adherenceScore >= 80 ? 'Optimal' : 'Adherence Warning'}
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-black block tracking-tight">
                    {adherenceScore.toFixed(0)}%
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                    {adherenceScore >= 80 ? '✓ Keep taking medications scheduled on time.' : '⚠️ Adherence is below the critical 80% threshold!'}
                  </p>
                </div>
              </div>

              {/* Medication Course Duration Progress Card */}
              {(() => {
                const prescriptionDateStr = lastVisit?.prescriptions?.date ?? '2026-05-24';
                const presDate = new Date(prescriptionDateStr);
                const today = new Date('2026-05-28');
                const diffTime = Math.abs(today.getTime() - presDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Day counter
                const duration = lastVisit?.prescriptions?.drugs[0]?.durationDays ?? 14;
                const progressPercent = Math.min(100, (diffDays / duration) * 100);

                return (
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 text-left flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Medication Course Progress</span>
                      <span className="text-[9px] font-extrabold text-primary uppercase bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">
                        {progressPercent.toFixed(0)}% Completed
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-800 block">
                        Day {diffDays} of {duration} Days Course
                      </span>
                      {/* Smooth progress bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-100">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-primary rounded-full transition-all duration-1000"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Adherence Alert Warning Card */}
            {adherenceScore < 80 && (
              <div className="p-3.5 bg-rose-50 border-rose-500/10 text-rose-800 rounded-2xl text-xs font-semibold flex items-start gap-2.5 text-left animate-pulse">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">🚨 Adherence Watchlist Escalation</span>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold mt-0.5">
                    Your medication compliance rating has dipped to {adherenceScore.toFixed(0)}% which is critical. An automated safety notice has been delivered to Dr. Aarav Mehta's dashboard for clinical guidance support.
                  </p>
                </div>
              </div>
            )}

            {/* Smart 3-Column Interactive Timeline grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider text-left flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Interactive Scheduled Timeline (Today, May 28, 2026)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* ☀ Morning Scheduled Column */}
                {(() => {
                  const morningMeds = patient.activeMedications.filter(m => m.morning);
                  return (
                    <div className="p-4 bg-amber-50/20 border border-amber-500/5 rounded-2xl text-left space-y-3 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-[11px] font-black text-amber-700 flex items-center gap-1 border-b border-amber-500/5 pb-1.5 mb-2.5">
                          ☀ Morning Doses
                        </span>
                        {morningMeds.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic block font-semibold py-4 text-center">No morning medicines scheduled.</span>
                        ) : (
                          <div className="space-y-3">
                            {morningMeds.map((med, idx) => {
                              const logged = todayLogs.find(l => l.medicineName.toLowerCase() === med.name.toLowerCase() && l.timeSlot === 'morning');
                              const activePresId = lastVisit?.prescriptions?.id ?? 'pres_1';
                              const todayStr = '2026-05-28';

                              return (
                                <div key={idx} className="p-3 bg-white border border-amber-100 rounded-xl space-y-2.5 shadow-sm">
                                  <div>
                                    <span className="text-xs font-extrabold text-slate-800 block">{med.name}</span>
                                    <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">
                                      {med.dosage} · {med.foodInstruction} · {med.exactTime ?? '08:00 AM'}
                                    </span>
                                  </div>
                                  
                                  {/* Intake actions */}
                                  {logged ? (
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 ${
                                        logged.status === 'taken' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                      }`}>
                                        {logged.status === 'taken' ? '✓ Taken' : '✕ Missed'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'morning', logged.status === 'taken' ? 'missed' : 'taken')}
                                        className="text-[9px] text-slate-400 hover:text-primary font-bold transition-all animate-pulse"
                                      >
                                        [Toggle]
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1.5 border-t border-slate-50 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'morning', 'taken')}
                                        className="flex-1 py-1 px-2 border border-emerald-200 bg-white hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-lg text-[9px] font-bold text-center transition-all active:scale-95"
                                      >
                                        Taken
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'morning', 'missed')}
                                        className="flex-1 py-1 px-2 border border-rose-200 bg-white hover:bg-rose-500 hover:text-white text-rose-700 rounded-lg text-[9px] font-bold text-center transition-all active:scale-95"
                                      >
                                        Missed
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 🌤 Afternoon Scheduled Column */}
                {(() => {
                  const afternoonMeds = patient.activeMedications.filter(m => m.afternoon);
                  return (
                    <div className="p-4 bg-orange-50/20 border border-orange-500/5 rounded-2xl text-left space-y-3 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-[11px] font-black text-orange-700 flex items-center gap-1 border-b border-orange-500/5 pb-1.5 mb-2.5">
                          🌤 Afternoon Doses
                        </span>
                        {afternoonMeds.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic block font-semibold py-4 text-center">No afternoon medicines scheduled.</span>
                        ) : (
                          <div className="space-y-3">
                            {afternoonMeds.map((med, idx) => {
                              const logged = todayLogs.find(l => l.medicineName.toLowerCase() === med.name.toLowerCase() && l.timeSlot === 'afternoon');
                              const activePresId = lastVisit?.prescriptions?.id ?? 'pres_1';
                              const todayStr = '2026-05-28';

                              return (
                                <div key={idx} className="p-3 bg-white border border-orange-100 rounded-xl space-y-2.5 shadow-sm">
                                  <div>
                                    <span className="text-xs font-extrabold text-slate-800 block">{med.name}</span>
                                    <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">
                                      {med.dosage} · {med.foodInstruction} · {med.exactTime ?? '02:00 PM'}
                                    </span>
                                  </div>
                                  
                                  {/* Intake actions */}
                                  {logged ? (
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 ${
                                        logged.status === 'taken' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                      }`}>
                                        {logged.status === 'taken' ? '✓ Taken' : '✕ Missed'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'afternoon', logged.status === 'taken' ? 'missed' : 'taken')}
                                        className="text-[9px] text-slate-400 hover:text-primary font-bold transition-all animate-pulse"
                                      >
                                        [Toggle]
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1.5 border-t border-slate-50 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'afternoon', 'taken')}
                                        className="flex-1 py-1 px-2 border border-emerald-200 bg-white hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-lg text-[9px] font-bold text-center transition-all active:scale-95"
                                      >
                                        Taken
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'afternoon', 'missed')}
                                        className="flex-1 py-1 px-2 border border-rose-200 bg-white hover:bg-rose-500 hover:text-white text-rose-700 rounded-lg text-[9px] font-bold text-center transition-all active:scale-95"
                                      >
                                        Missed
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 🌙 Night Scheduled Column */}
                {(() => {
                  const nightMeds = patient.activeMedications.filter(m => m.night);
                  return (
                    <div className="p-4 bg-indigo-50/20 border border-indigo-500/5 rounded-2xl text-left space-y-3 flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1 border-b border-indigo-500/5 pb-1.5 mb-2.5">
                          🌙 Night Doses
                        </span>
                        {nightMeds.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic block font-semibold py-4 text-center">No night medicines scheduled.</span>
                        ) : (
                          <div className="space-y-3">
                            {nightMeds.map((med, idx) => {
                              const logged = todayLogs.find(l => l.medicineName.toLowerCase() === med.name.toLowerCase() && l.timeSlot === 'night');
                              const activePresId = lastVisit?.prescriptions?.id ?? 'pres_1';
                              const todayStr = '2026-05-28';

                              return (
                                <div key={idx} className="p-3 bg-white border border-indigo-100 rounded-xl space-y-2.5 shadow-sm">
                                  <div>
                                    <span className="text-xs font-extrabold text-slate-800 block">{med.name}</span>
                                    <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">
                                      {med.dosage} · {med.foodInstruction} · {med.exactTime ?? '08:00 PM'}
                                    </span>
                                  </div>
                                  
                                  {/* Intake actions */}
                                  {logged ? (
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 ${
                                        logged.status === 'taken' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                      }`}>
                                        {logged.status === 'taken' ? '✓ Taken' : '✕ Missed'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'night', logged.status === 'taken' ? 'missed' : 'taken')}
                                        className="text-[9px] text-slate-400 hover:text-primary font-bold transition-all animate-pulse"
                                      >
                                        [Toggle]
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-1.5 border-t border-slate-50 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'night', 'taken')}
                                        className="flex-1 py-1 px-2 border border-emerald-200 bg-white hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-lg text-[9px] font-bold text-center transition-all active:scale-95"
                                      >
                                        Taken
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => DatabaseService.logMedication(patient.id, activePresId, med.name, todayStr, 'night', 'missed')}
                                        className="flex-1 py-1 px-2 border border-rose-200 bg-white hover:bg-rose-500 hover:text-white text-rose-700 rounded-lg text-[9px] font-bold text-center transition-all active:scale-95"
                                      >
                                        Missed
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* 💡 Live AI Medication Guidance Panel */}
            <div className="border-t border-slate-100 pt-5 space-y-3.5">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide text-left flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Live AI Clinical Guidance & Medication safety advice
              </h4>

              {patient.activeMedications.length === 0 ? (
                <div className="text-left py-4 px-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-400 text-[10px] font-semibold">
                  No active medicines to analyze. Clinical tips will appear when doctor prescribes medications.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                  {patient.activeMedications.map((med, idx) => {
                    const guidanceList = AISafetyEngine.getMedicationGuidance(med.name);
                    return (
                      <div key={idx} className="p-4 bg-teal-50/20 border border-teal-500/10 rounded-2xl space-y-2">
                        <span className="text-xs font-extrabold text-slate-800 block flex items-center gap-1.5">
                          <Pill className="h-4 w-4 text-primary shrink-0" />
                          {med.name} Clinical Tips
                        </span>
                        
                        <ul className="space-y-1">
                          {guidanceList.map((tip, tIdx) => (
                            <li key={tIdx} className="text-[10px] text-slate-500 font-semibold leading-relaxed flex items-start gap-1">
                              <span className="text-primary mt-0.5 shrink-0">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Verification confirmation strip */}
            <div className="p-4 bg-teal-50/40 border border-teal-500/10 rounded-2xl flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                Sanjeevani AI scheduling engine has computed your daily optimal drug intake. Your cardiology data and logs are synced with Dr. Aarav Mehta in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Risk Index + Alerts + AI Tips */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI-Powered Predictive Health Risk Intelligence Center */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-500/10 shadow-premium relative overflow-hidden">
            {/* Background design */}
            <div className="absolute -top-12 -right-12 h-32 w-32 bg-teal-500/5 rounded-full pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  AI Health Risk Intelligence
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Proactive health predictions and complication tracking.</p>
              </div>
              
              {/* Scan Trigger Button */}
              <button
                type="button"
                disabled={scanningAI}
                onClick={() => {
                  setScanningAI(true);
                  setTimeout(() => {
                    DatabaseService.recalculatePredictions(patient.id);
                    setScanningAI(false);
                  }, 1200);
                }}
                className={`px-3 py-1.5 bg-teal-50 border border-teal-500/15 hover:bg-primary hover:text-white text-primary text-[10px] font-black rounded-lg transition-all flex items-center gap-1 active:scale-95 ${
                  scanningAI ? 'cursor-wait opacity-80' : ''
                }`}
              >
                <RefreshCw className={`h-3 w-3 ${scanningAI ? 'animate-spin' : ''}`} />
                {scanningAI ? 'Scanning Telemetry…' : 'AI Scan'}
              </button>
            </div>

            {/* Calculations & Indicators */}
            {(() => {
              const latestPred = predictions[0] ?? null;
              const activeScore = latestPred ? latestPred.aiScore : riskScore;
              const activeSeverity = latestPred ? latestPred.severity : riskLevel;
              const activeRisk = latestPred ? latestPred.predictedRisk : 'Stable Clinical Recovery';
              const activeNotes = latestPred ? latestPred.predictionNotes : 'Optimal recovery timeline tracked by safety engine.';

              return (
                <div className="space-y-5 mt-5">
                  
                  {/* Score Dial & Status Bar */}
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Dynamic Risk Score</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border leading-none ${
                        activeSeverity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                        activeSeverity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        activeSeverity === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {activeSeverity} Risk ({activeScore}/100)
                      </span>
                    </div>

                    {/* Bar visual */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          activeSeverity === 'critical' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                          activeSeverity === 'high' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          activeSeverity === 'moderate' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                          'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${activeScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Prediction Complication alert box */}
                  <div className={`p-4 rounded-2xl border text-left space-y-1 relative overflow-hidden transition-all ${
                    activeSeverity === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse' :
                    activeSeverity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-950' :
                    activeSeverity === 'moderate' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                    'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">Predicted Recovery Status</span>
                    <strong className="text-xs block font-extrabold">{activeRisk}</strong>
                    <p className="text-[10.5px] leading-relaxed font-semibold mt-1 opacity-90">{activeNotes}</p>
                  </div>

                  {/* AI Health Complications Timeline Tracker */}
                  <div className="pt-4 border-t border-slate-100 space-y-3 text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      🔮 48-Hour Predictive Complication Checklist
                    </span>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {/* BP Crises */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700">Hypertension Crisis Risk</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          patient.vitals.systolicBP > 155 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {patient.vitals.systolicBP > 155 ? 'Elevated' : 'Low'}
                        </span>
                      </div>

                      {/* Respiratory distress */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700">Respiratory distress Risk</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          patient.vitals.oxygenSat < 94 ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {patient.vitals.oxygenSat < 94 ? 'High Risk' : 'Optimal'}
                        </span>
                      </div>

                      {/* Cardiac instability */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700">Cardiac Instability Risk</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          patient.vitals.heartRate > 95 || patient.vitals.heartRate < 55 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {patient.vitals.heartRate > 95 || patient.vitals.heartRate < 55 ? 'Monitor' : 'Low'}
                        </span>
                      </div>

                      {/* Medication intolerability */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-teal-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700">Medication Intolerance</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          feedbacks.some(f => f.feeling === 'Worse' || f.feeling === 'Severe Side Effects') ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {feedbacks.some(f => f.feeling === 'Worse' || f.feeling === 'Severe Side Effects') ? 'Critical' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allergy flags list if exists */}
                  {patient.allergies.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-left space-y-1 mt-2">
                      <span className="text-[9px] font-black text-rose-700 uppercase tracking-wide flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Active Allergy Flags
                      </span>
                      {patient.allergies.map((a: any, i: number) => (
                        <div key={i} className="text-[10px] text-rose-800 font-semibold leading-normal">
                          ⚠ Documented reaction to <strong>{a.allergen}</strong> ({a.severity})
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })()}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Quick Actions</h4>
            <button
              onClick={() => onNavigate('patient/history')}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-500/20 rounded-xl text-xs font-bold text-slate-700 hover:text-primary transition-all"
            >
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />Visit History</span>
              <span className="text-slate-300">→</span>
            </button>
            <button
              onClick={() => onNavigate('patient/qr')}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-700 transition-all"
            >
              <span className="flex items-center gap-2"><QrCode className="h-4 w-4" />Emergency QR</span>
              <span className="text-slate-300">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
