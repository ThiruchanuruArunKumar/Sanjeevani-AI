// src/routes/Doctor/NewConsultation.tsx
// Full real-time consultation form: vitals + drugs + diagnosis + notes + follow-up
import React, { useState, useEffect } from 'react';
import {
  DatabaseService,
  PatientProfile,
  ClinicalVisit,
  UploadedReport,
  RecommendedTestRecord,
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
  History,
  FileSearch,
  CheckSquare,
  Square
} from 'lucide-react';

interface NewConsultationProps {
  patientId: string;
  onNavigate: (view: string) => void;
}

interface DrugEntry {
  id: number;
  name: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  durationDays: number;
  foodInstruction: 'Before Food' | 'After Food' | 'With Food' | 'No instruction';
  specialInstruction: string;
}

const COMMON_TESTS = [
  'CBC (Complete Blood Count)',
  'Fasting Blood Sugar',
  'Postprandial Blood Sugar',
  'HbA1c (Glycated Hemoglobin)',
  'Chest X-Ray (PA View)',
  'Brain MRI Scan',
  'Abdominal CT Scan',
  '12-Lead ECG / EKG',
  'Urine Routine & Microscopy',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (T3, T4, TSH)',
  'Ultrasound Abdomen & Pelvis'
];

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
  const [previousVisits, setPreviousVisits] = useState<ClinicalVisit[]>([]);
  const [previousReports, setPreviousReports] = useState<UploadedReport[]>([]);
  const [previousTests, setPreviousTests] = useState<RecommendedTestRecord[]>([]);

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
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [drugs,     setDrugs]     = useState<DrugEntry[]>([
    {
      id: 1,
      name: '',
      dosage: '500mg',
      morning: true,
      afternoon: false,
      night: true,
      durationDays: 5,
      foodInstruction: 'After Food',
      specialInstruction: ''
    }
  ]);

  // Recommended Tests state
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTestInput, setCustomTestInput] = useState('');

  // ── UI state ───────────────────────────────────────────
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [step,    setStep]    = useState<'vitals' | 'history' | 'clinical' | 'meds' | 'tests'>('vitals');

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

      // Load patient history
      setPreviousVisits(DatabaseService.getVisits(patientId));
      setPreviousReports(DatabaseService.getReports(patientId));
      setPreviousTests(DatabaseService.getRecommendedTests(patientId));
    }
    const unsub = realtimeBroker.subscribe(`patient-${patientId}`, () => {
      const updated = DatabaseService.getPatientById(patientId);
      if (updated) {
        setPatient(updated);
        setPreviousVisits(DatabaseService.getVisits(patientId));
        setPreviousReports(DatabaseService.getReports(patientId));
        setPreviousTests(DatabaseService.getRecommendedTests(patientId));
      }
    });
    return () => unsub();
  }, [patientId]);

  // ── Drug management ────────────────────────────────────
  const addDrug = () =>
    setDrugs(d => [...d, { 
      id: Date.now(), 
      name: '', 
      dosage: '1 tablet', 
      morning: true, 
      afternoon: false, 
      night: true, 
      durationDays: 5, 
      foodInstruction: 'After Food', 
      specialInstruction: '' 
    }]);
  const removeDrug = (id: number) =>
    setDrugs(d => d.filter(x => x.id !== id));
  const updateDrug = (id: number, field: keyof DrugEntry, val: any) =>
    setDrugs(d => d.map(x => x.id === id ? { ...x, [field]: val } : x));

  // Recommended test toggle helper
  const toggleTest = (testName: string) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(t => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const addCustomTest = () => {
    if (customTestInput.trim() && !selectedTests.includes(customTestInput.trim())) {
      setSelectedTests([...selectedTests, customTestInput.trim()]);
      setCustomTestInput('');
    }
  };

  // ── Save ───────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !diagnosis || !patient) return;

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
      .map(d => ({ 
        name: d.name, 
        dosage: d.dosage, 
        frequency: `${d.morning ? '1' : '0'}-${d.afternoon ? '1' : '0'}-${d.night ? '1' : '0'}`,
        morning: d.morning,
        afternoon: d.afternoon,
        night: d.night,
        durationDays: d.durationDays,
        foodInstruction: d.foodInstruction,
        specialInstruction: d.specialInstruction
      }));

    // Create Consultation Note for Hospital Admin
    const doctorSession = DatabaseService.getActiveSession();
    const docUser = doctorSession.user;
    const hPortalId = docUser?.hospitalId || patient.hospitalPortalId || '';

    // 1. Create Clinical Visit Record
    const newVisit = DatabaseService.addVisit(
      patientId,
      docUser?.id || 'doc_1',
      reason,
      vitals,
      diagnosis,
      `${symptoms ? `Symptoms: ${symptoms}\n` : ''}${notes}${followUp ? `\nFollow-up: ${followUp}` : ''}${nextVisitDate ? `\nNext Visit: ${nextVisitDate}` : ''}`,
      validDrugs,
      'Take as prescribed. Contact clinic if symptoms worsen.'
    );

    // 2. Add Recommended Tests Records
    if (selectedTests.length > 0 && hPortalId && newVisit) {
      DatabaseService.addRecommendedTests(
        selectedTests.map(testName => ({
          patientId: patient.id,
          hospitalPortalId: hPortalId,
          visitId: newVisit.id,
          testName: testName,
          category: testName.toLowerCase().includes('x-ray') ? 'X-Ray' : testName.toLowerCase().includes('mri') ? 'MRI Scan' : testName.toLowerCase().includes('ct') ? 'CT Scan' : 'Blood Report',
          recommendedByDoctor: docUser?.name || 'Attending Doctor'
        }))
      );
    }

    if (hPortalId) {
      DatabaseService.addConsultationNote({
        hospitalPortalId: hPortalId,
        patientId: patient.id,
        patientName: patient.name,
        doctorId: docUser?.id || 'doc_1',
        doctorName: docUser?.name || 'Doctor',
        diagnosis: diagnosis,
        prescribedMedicines: validDrugs,
        recommendedTests: selectedTests,
        followUpAdvice: `${followUp}${nextVisitDate ? ` (Next Visit: ${nextVisitDate})` : ''}` || 'Follow instructions as prescribed.'
      });
    }

    setSaving(false);
    setSuccess(true);

    setTimeout(() => {
      onNavigate(`doctor/patient/${patientId}`);
    }, 2000);
  };

  if (!patient) {
    return (
      <div className="glass-card p-12 text-center rounded-3xl space-y-4 max-w-md mx-auto my-12 shadow-sm animate-fade-in">
        <div className="h-16 w-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <Stethoscope className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black text-slate-800">No appointments assigned today</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please select an assigned patient from your appointment list or wait for your Hospital Administrator to assign patients.
        </p>
        <button
          onClick={() => onNavigate('doctor/appointments')}
          className="btn-medical py-2.5 px-6 font-bold text-xs shadow-sm"
        >
          View Today's Appointments
        </button>
      </div>
    );
  }

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
    { key: 'vitals',   label: 'Live Vitals',    icon: <Activity className="h-4 w-4" /> },
    { key: 'history',  label: 'Medical History', icon: <History className="h-4 w-4" /> },
    { key: 'clinical', label: 'Clinical Notes',  icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'meds',     label: 'Medicines',       icon: <Pill className="h-4 w-4" /> },
    { key: 'tests',    label: 'Recommend Tests', icon: <FileSearch className="h-4 w-4" /> },
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
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block">
              Doctor Consultation
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {patient.name}
              <span className="text-xs text-slate-400 font-mono font-medium">({patient.id})</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Hospital Live Sync Active
          </div>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
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
              Enter measured vitals. Status badges update automatically. Patient record syncs on save.
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('history')}
              className="btn-medical text-xs font-bold"
            >
              View Patient Medical History →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 2: MEDICAL HISTORY ══════════════ */}
      {step === 'history' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Patient Complete Medical History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review past diagnoses, previous consultations, active medications, and diagnostic scans.
            </p>
          </div>

          {/* Past Consultations */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              Previous Consultations ({previousVisits.length})
            </h3>
            {previousVisits.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous consultation records found for this patient.</p>
            ) : (
              <div className="space-y-3">
                {previousVisits.map(v => (
                  <div key={v.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-800">{v.diagnosis}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{v.date} &bull; Dr. {v.doctorName}</span>
                    </div>
                    <p className="text-slate-600"><strong>Reason:</strong> {v.reasonForVisit}</p>
                    {v.notes && <p className="text-slate-500 italic">"{v.notes}"</p>}
                    {v.prescriptions && v.prescriptions.drugs.length > 0 && (
                      <div className="mt-1 pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] font-bold text-teal-700">Prescribed: </span>
                        <span className="text-slate-700">{v.prescriptions.drugs.map(d => d.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Scans & Reports */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-teal-600" />
              Uploaded Diagnostic Reports & Scans ({previousReports.length})
            </h3>
            {previousReports.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No uploaded reports attached to patient record.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {previousReports.map(rep => (
                  <div key={rep.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{rep.title}</span>
                      <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">{rep.category}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{rep.date} &bull; Uploaded by {rep.uploaderName}</span>
                    {rep.parsedSummary && <p className="text-slate-600 text-[11px] mt-1">{rep.parsedSummary}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('vitals')} className="btn-medical-secondary text-xs font-bold">
              ← Back to Vitals
            </button>
            <button type="button" onClick={() => setStep('clinical')} className="btn-medical text-xs font-bold">
              Continue to Clinical Notes →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 3: CLINICAL ══════════════ */}
      {step === 'clinical' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Clinical Details & Diagnosis</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Document the consultation reason, presenting symptoms, clinical diagnosis, and follow-up advice.
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
                placeholder="e.g. Routine OPD Follow-up & Chest Pain Review"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Clinical Diagnosis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Bronchitis / Essential Hypertension"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Presenting Symptoms
              </label>
              <input
                type="text"
                placeholder="e.g. Persistent dry cough, mild fever, fatigue for 3 days"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Physician Clinical Notes
              </label>
              <textarea
                rows={3}
                placeholder="Detailed clinical examination findings, dietary advice, or lifestyle modifications…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Follow-up Advice
              </label>
              <input
                type="text"
                placeholder="e.g. Rest, increase fluid intake, avoid cold items"
                value={followUp}
                onChange={e => setFollowUp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-teal-600" /> Next Visit Date (Optional)
              </label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={e => setNextVisitDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('history')} className="btn-medical-secondary text-xs font-bold">
              ← Back to History
            </button>
            <button type="button" onClick={() => setStep('meds')} className="btn-medical text-xs font-bold">
              Continue to Prescribe Medicines →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 4: MEDICINES ══════════════ */}
      {step === 'meds' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Prescribe Medicines</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify medicine name, dosage, daily timing (Morning, Afternoon, Night), duration, and food instructions.
            </p>
          </div>

          <div className="space-y-4">
            {drugs.map((drug, idx) => (
              <div
                key={drug.id}
                className="glass-card p-5 rounded-2xl space-y-4 border-slate-200 relative"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-teal-700 uppercase tracking-wider">
                    Medicine #{idx + 1}
                  </span>
                  {drugs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDrug(drug.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol / Amoxicillin / Metformin"
                      value={drug.name}
                      onChange={e => updateDrug(drug.id, 'name', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg or 1 tablet"
                      value={drug.dosage}
                      onChange={e => updateDrug(drug.id, 'dosage', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>
                </div>

                {/* Timing Checkboxes & Food Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100/60 items-center">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Daily Schedule</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={drug.morning}
                          onChange={e => updateDrug(drug.id, 'morning', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        🌅 Morning
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={drug.afternoon}
                          onChange={e => updateDrug(drug.id, 'afternoon', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        ☀️ Afternoon
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={drug.night}
                          onChange={e => updateDrug(drug.id, 'night', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        🌙 Night
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Duration (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={drug.durationDays}
                      onChange={e => updateDrug(drug.id, 'durationDays', Number(e.target.value))}
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Food Timing</label>
                    <select
                      value={drug.foodInstruction}
                      onChange={e => updateDrug(drug.id, 'foodInstruction', e.target.value as any)}
                      className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    >
                      <option value="After Food">🥣 After Food</option>
                      <option value="Before Food">🍎 Before Food</option>
                      <option value="With Food">🍲 With Food</option>
                      <option value="No instruction">⏱️ No Instruction</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addDrug}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-teal-300 text-teal-700 text-xs font-bold rounded-xl hover:bg-teal-50 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Another Medicine
          </button>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('clinical')} className="btn-medical-secondary text-xs font-bold">
              ← Back to Clinical Notes
            </button>
            <button type="button" onClick={() => setStep('tests')} className="btn-medical text-xs font-bold">
              Continue to Recommend Tests →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ STEP 5: RECOMMEND TESTS ══════════════ */}
      {step === 'tests' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-800">Recommend Laboratory & Diagnostic Tests</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select diagnostic tests required for the patient. Recommended tests will appear as 'Pending' in the patient portal.
            </p>
          </div>

          {/* Test Selector Grid */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">
              Common Recommended Tests
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {COMMON_TESTS.map(testName => {
                const isSelected = selectedTests.includes(testName);
                return (
                  <button
                    key={testName}
                    type="button"
                    onClick={() => toggleTest(testName)}
                    className={`p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{testName}</span>
                    {isSelected ? <CheckSquare className="h-4 w-4 text-teal-600 shrink-0" /> : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Test Entry */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Enter custom lab or scan test..."
                value={customTestInput}
                onChange={e => setCustomTestInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="button"
                onClick={addCustomTest}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Add Test
              </button>
            </div>
          </div>

          {/* Summary before saving */}
          <div className="glass-card p-5 rounded-2xl space-y-3 border-teal-500/20">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" />
              Final Consultation Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Patient</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{patient.name}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Diagnosis</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block truncate">{diagnosis || 'Not entered'}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Medicines</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{drugs.filter(d => d.name).length} Prescribed</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Recommended Tests</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{selectedTests.length} Selected</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('meds')} className="btn-medical-secondary text-xs font-bold">
              ← Back to Prescribe Medicines
            </button>
            <button
              type="submit"
              disabled={saving || !reason || !diagnosis}
              className={`btn-medical text-xs font-bold flex-1 py-3 ${saving ? 'opacity-70' : ''}`}
            >
              {saving ? (
                <>
                  <Activity className="h-4 w-4 animate-spin inline mr-2" />
                  Saving & Syncing Consultation…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 inline mr-2" />
                  Save Complete Consultation & Sync Record
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
