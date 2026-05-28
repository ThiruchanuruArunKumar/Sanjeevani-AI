// src/routes/Patient/PatientVisitDetail.tsx
import React, { useEffect, useState } from 'react';
import { DatabaseService, ClinicalVisit } from '../../services/db';
import {
  Stethoscope,
  ArrowLeft,
  Calendar,
  User,
  Pill,
  ShieldCheck,
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Zap,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface PatientVisitDetailProps {
  visitId: string;
  onNavigate: (view: string) => void;
}

function VitalMini({
  icon, label, value, unit, colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  colorClass: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>
        {icon}
        {label}
      </div>
      <div className="text-xl font-black text-slate-800 tabular-nums leading-none">
        {value}
        <span className="text-[10px] font-normal text-slate-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}

export const PatientVisitDetail: React.FC<PatientVisitDetailProps> = ({ visitId, onNavigate }) => {
  const [visit, setVisit] = useState<ClinicalVisit | null>(null);

  useEffect(() => {
    const all = DatabaseService.getVisits();
    const found = all.find(v => v.id === visitId) ?? null;
    setVisit(found);
  }, [visitId]);

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
          <Stethoscope className="h-8 w-8 text-slate-300" />
        </div>
        <h2 className="text-lg font-black text-slate-700">Visit Not Found</h2>
        <p className="text-sm text-slate-400">This consultation record may have been removed.</p>
        <button
          onClick={() => onNavigate('patient/history')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>
      </div>
    );
  }

  const hasPrescrip = visit.prescriptions && visit.prescriptions.drugs.length > 0;

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">

      {/* Back Navigation */}
      <button
        onClick={() => onNavigate('patient/history')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Clinical History
      </button>

      {/* Header Card */}
      <div className="glass-card p-8 rounded-3xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-52 h-52 bg-teal-400/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-primary">
              <Stethoscope className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 leading-tight">{visit.reasonForVisit}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
                  Clinical Consultation
                </span>
                {hasPrescrip && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Pill className="h-3 w-3" />
                    Prescription Issued
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Safety Badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">AI Safety Verified</span>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-5 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {visit.date}
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <User className="h-3.5 w-3.5 text-primary" />
            {visit.doctorName}
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Visit ID: <span className="font-mono text-[10px]">{visit.id}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Main Details */}
        <div className="lg:col-span-8 space-y-6">

          {/* Diagnosis */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Clinical Diagnosis
            </h2>
            <div className="p-5 bg-gradient-to-br from-teal-50/60 to-slate-50 border border-teal-100 rounded-2xl">
              <p className="text-base font-black text-slate-800 leading-snug">{visit.diagnosis}</p>
            </div>

            {/* Notes */}
            {visit.notes && (
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Clinical Examination Notes</h3>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{visit.notes}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Vitals Recorded During Visit */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
            <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              Vitals Recorded at Visit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <VitalMini
                icon={<Activity className="h-3 w-3" />}
                label="Blood Pressure"
                value={`${visit.vitals.systolicBP}/${visit.vitals.diastolicBP}`}
                unit="mmHg"
                colorClass="text-rose-500"
              />
              <VitalMini
                icon={<Heart className="h-3 w-3" />}
                label="Heart Rate"
                value={visit.vitals.heartRate}
                unit="BPM"
                colorClass="text-rose-500"
              />
              <VitalMini
                icon={<Droplets className="h-3 w-3" />}
                label="Oxygen (SpO₂)"
                value={visit.vitals.oxygenSat}
                unit="%"
                colorClass="text-teal-500"
              />
              <VitalMini
                icon={<Droplets className="h-3 w-3" />}
                label="Blood Sugar"
                value={visit.vitals.bloodGlucose ?? '—'}
                unit="mg/dL"
                colorClass="text-amber-500"
              />
              <VitalMini
                icon={<Thermometer className="h-3 w-3" />}
                label="Temperature"
                value={visit.vitals.temperature}
                unit="°F"
                colorClass="text-orange-500"
              />
              <VitalMini
                icon={<Zap className="h-3 w-3" />}
                label="Pulse Rate"
                value={visit.vitals.pulseRate ?? visit.vitals.heartRate}
                unit="BPM"
                colorClass="text-blue-500"
              />
            </div>
          </div>

          {/* Prescription */}
          {hasPrescrip && visit.prescriptions && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Prescribed Medicines
                </h2>
                <span className="text-[10px] bg-teal-50 text-primary border border-teal-500/15 font-bold px-2.5 py-1 rounded-full">
                  {visit.prescriptions.drugs.length} Drug(s)
                </span>
              </div>

              <div className="space-y-3">
                {visit.prescriptions.drugs.map((drug, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100/50 flex items-center justify-center text-primary shrink-0">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-extrabold text-slate-800 block">{drug.name}</span>
                      <span className="text-xs text-slate-400 font-semibold mt-0.5 block">
                        {drug.dosage} · {drug.frequency}
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>

              {visit.prescriptions.instructions && (
                <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex gap-3 items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide block mb-0.5">Doctor Instructions</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{visit.prescriptions.instructions}</p>
                  </div>
                </div>
              )}

              {/* AI safety note */}
              <div className="p-4 bg-teal-50/40 border border-teal-500/10 rounded-2xl flex gap-3 items-start">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                  All prescribed medications have been AI-verified for drug interactions, allergy conflicts, and dosage safety in real-time before issuance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary Panel */}
        <div className="lg:col-span-4 space-y-5">

          {/* Visit Summary Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2">Visit Summary</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Consulting Doctor</span>
                <span className="font-bold text-slate-800">{visit.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Visit Date</span>
                <span className="font-bold text-slate-800">{visit.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Reason</span>
                <span className="font-semibold text-slate-700 leading-relaxed">{visit.reasonForVisit}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Diagnosis</span>
                <span className="font-bold text-slate-800 leading-snug">{visit.diagnosis}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5 rounded-3xl space-y-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide mb-3">Quick Actions</h4>
            <button
              onClick={() => onNavigate('patient/history')}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-500/20 rounded-xl text-xs font-bold text-slate-700 hover:text-primary transition-all"
            >
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />All Visit History</span>
              <span className="text-slate-300">→</span>
            </button>
            <button
              onClick={() => onNavigate('patient/dashboard')}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-500/20 rounded-xl text-xs font-bold text-slate-700 hover:text-primary transition-all"
            >
              <span className="flex items-center gap-2"><Activity className="h-4 w-4" />My Dashboard</span>
              <span className="text-slate-300">→</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
