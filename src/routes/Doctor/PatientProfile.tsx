import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile as PP, ClinicalVisit, UploadedReport, RecommendedTestRecord, realtimeBroker } from '../../services/db';
import { 
  Stethoscope, 
  ArrowLeft, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  FileText, 
  Calendar,
  Pill,
  User,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface PatientProfileProps {
  patientId: string;
  onNavigate: (view: string) => void;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, onNavigate }) => {
  const [patient, setPatient] = useState<PP | null>(null);
  const [visits, setVisits] = useState<ClinicalVisit[]>([]);
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [recommendedTests, setRecommendedTests] = useState<RecommendedTestRecord[]>([]);
  
  // Clinical Visit Creator Form State
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [sysBP, setSysBP] = useState(130);
  const [diaBP, setDiaBP] = useState(85);
  const [heartRate, setHeartRate] = useState(76);
  const [oxygen, setOxygen] = useState(97);
  const [glucose, setGlucose] = useState(110);
  
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    const p = DatabaseService.getPatientById(patientId);
    if (p) {
      setPatient(p);
      setVisits(DatabaseService.getVisits(patientId));
      setReports(DatabaseService.getReports(patientId));
      setRecommendedTests(DatabaseService.getRecommendedTests(patientId));
      
      // Seed vitals into editor defaults
      setSysBP(p.vitals.systolicBP);
      setDiaBP(p.vitals.diastolicBP);
      setHeartRate(p.vitals.heartRate);
      setOxygen(p.vitals.oxygenSat);
      setGlucose(p.vitals.bloodGlucose || 100);
    }
  };

  useEffect(() => {
    loadData();

    // Sync on updates
    const unsubscribe = realtimeBroker.subscribe(`patient-${patientId}`, () => {
      loadData();
    });

    const unsubRecTests = realtimeBroker.subscribe('recommended-tests-update', () => {
      loadData();
    });

    return () => {
      unsubscribe();
      unsubRecTests();
    };
  }, [patientId]);

  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !diagnosis) {
      alert('Please fill in Reason for Visit and Clinical Diagnosis.');
      return;
    }

    const vitals = {
      systolicBP: Number(sysBP),
      diastolicBP: Number(diaBP),
      heartRate: Number(heartRate),
      temperature: 98.6,
      oxygenSat: Number(oxygen),
      bloodGlucose: Number(glucose)
    };

    DatabaseService.addVisit(
      patientId,
      'doc_1',
      reason,
      vitals,
      diagnosis,
      notes,
      [], // No drugs added directly in this quick form; they'll use prescription editor
      'Follow instructions as prescribed.'
    );

    setSuccessMsg('Visit recorded successfully. Real-time patient alerts fired.');
    setReason('');
    setDiagnosis('');
    setNotes('');
    setShowAddVisit(false);

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  if (!patient) {
    return (
      <div className="text-center py-20 space-y-4">
        <span className="text-slate-500 font-bold block">Patient record not found.</span>
        <button onClick={() => onNavigate('doctor/dashboard')} className="btn-medical text-xs mx-auto">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isCritical = patient.vitals.systolicBP > 140 || patient.vitals.oxygenSat < 95;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('doctor/dashboard')} 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="Back to Directory"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Electronic Health Record</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 mt-0.5">
              {patient.name}
              <span className={isCritical ? 'badge-critical' : 'badge-stable'}>
                {isCritical ? 'Alert Vitals' : 'Stable'}
              </span>
            </h1>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate(`doctor/patient/${patient.id}/consult`)}
            className="btn-medical text-xs font-bold"
          >
            <Stethoscope className="h-4 w-4" />
            New Consultation
          </button>
          <button 
            onClick={() => onNavigate(`doctor/prescription?patientId=${patient.id}`)}
            className="btn-medical-secondary text-xs font-bold"
          >
            <Pill className="h-4.5 w-4.5 text-primary" />
            AI Prescriber
          </button>
          <button 
            onClick={() => onNavigate(`doctor/upload-report?patientId=${patient.id}`)}
            className="btn-medical-secondary text-xs font-bold"
          >
            <Plus className="h-4.5 w-4.5 text-primary" />
            Add Lab Report
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-500/10 rounded-2xl animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Grid: Left Column (Patient Card & Vitals) - Right Column (History & Visits) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Card & Vitals telemetry) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Info Card */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              Patient Profile Details
            </h3>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Patient ID</span>
                <span className="font-black text-slate-800">{patient.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Mobile Phone</span>
                <span className="font-semibold text-slate-800">{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Email Address</span>
                <span className="font-semibold text-slate-800">{patient.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Age / Gender</span>
                <span className="font-semibold text-slate-800">{patient.age} Years • Male</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400">Blood Group</span>
                <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">{patient.bloodGroup}</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-400 block mb-1">Emergency Contact</span>
                <span className="font-bold text-slate-800 block">{patient.emergencyContact.name}</span>
                <span className="font-semibold text-primary block mt-0.5">{patient.emergencyContact.phone}</span>
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Tracker */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-primary animate-pulse" />
                Live Vitals Sync
              </h3>
              <button 
                onClick={() => setShowAddVisit(!showAddVisit)}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                Record Vitals
              </button>
            </div>

            <div className="space-y-3.5">
              
              {/* BP vital */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blood Pressure</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-0.5">
                    {patient.vitals.systolicBP}/{patient.vitals.diastolicBP} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  patient.vitals.systolicBP > 140 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {patient.vitals.systolicBP > 140 ? 'High' : 'Normal'}
                </span>
              </div>

              {/* HR vital */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Heart Rate</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-0.5">
                    {patient.vitals.heartRate} <span className="text-[10px] text-slate-400 font-normal">BPM</span>
                  </span>
                </div>
                <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
              </div>

              {/* O2 vital */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Oxygen Sat (SpO₂)</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-0.5">
                    {patient.vitals.oxygenSat}%
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  patient.vitals.oxygenSat < 95 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {patient.vitals.oxygenSat < 95 ? 'Critical' : 'Stable'}
                </span>
              </div>

            </div>
          </div>

          {/* Allergy Flag Alert */}
          {patient.allergies.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-500/10 space-y-2 text-left relative overflow-hidden ring-1 ring-rose-500/5 animate-pulse">
              <span className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                Documented Allergy Flags
              </span>
              {patient.allergies.map((allergy, i) => (
                <div key={i} className="text-xs text-rose-700 leading-normal">
                  <span className="font-extrabold">{allergy.allergen}</span> is categorized as <span className="font-bold underline">{allergy.severity}</span>.<br/>
                  Reaction detail: <span className="italic">{allergy.reaction}</span>.
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column (Clinical Visit Recorder & Diagnostic timelines) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Embedded Visit Creator Form */}
          {showAddVisit && (
            <div className="glass-card p-6 sm:p-8 rounded-2xl border-teal-500/20 space-y-5 animate-slide-down">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Record New Clinical Visit & Vitals
                </h3>
                <button 
                  onClick={() => setShowAddVisit(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmitVisit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason for Clinical Visit</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Regular Cardiac Evaluation" 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinical Diagnosis</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Controlled Hypertension Stage 1" 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Vitals inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Sys BP (mmHg)</label>
                    <input 
                      type="number" 
                      value={sysBP}
                      onChange={(e) => setSysBP(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Dia BP (mmHg)</label>
                    <input 
                      type="number" 
                      value={diaBP}
                      onChange={(e) => setDiaBP(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Heart (BPM)</label>
                    <input 
                      type="number" 
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">O₂ Sat (%)</label>
                    <input 
                      type="number" 
                      value={oxygen}
                      onChange={(e) => setOxygen(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Sugar (mg/dL)</label>
                    <input 
                      type="number" 
                      value={glucose}
                      onChange={(e) => setGlucose(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Physician Clinical Notes</label>
                  <textarea 
                    placeholder="Write detailed diagnostic outcomes, dietary restrictions..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white h-24"
                  />
                </div>

                <button type="submit" className="btn-medical text-xs font-bold w-full py-2.5">
                  Record Visit Summary
                </button>
              </form>
            </div>
          )}

          {/* Visits Timeline History */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Clinical Consultation Logs</h3>
                <p className="text-xs text-slate-400">Timeline of active diagnoses, diagnostic findings, and clinical notes.</p>
              </div>

              {!showAddVisit && (
                <button 
                  onClick={() => setShowAddVisit(true)}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-500/10 text-primary font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Log Consultation
                </button>
              )}
            </div>

            <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {visits.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-400 font-semibold block">No clinical visits logged in system.</span>
                </div>
              ) : (
                visits.map((visit) => (
                  <div key={visit.id} className="relative pl-12 group">
                    {/* Circle icon marker */}
                    <div className="absolute left-3 top-1.5 h-6 w-6 rounded-full border-2 border-white bg-teal-50 flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-all">
                      <Stethoscope className="h-3 w-3" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold text-slate-800 text-sm">{visit.reasonForVisit}</span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="font-semibold">{visit.date}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-400">Physician Diagnosis:</span>
                          <span className="font-bold text-slate-800 ml-1.5">{visit.diagnosis}</span>
                        </div>
                        
                        {visit.notes && (
                          <div>
                            <span className="font-bold text-slate-400 block mb-0.5">Clinical Examination Notes:</span>
                            <p className="text-slate-600 leading-relaxed italic">{visit.notes}</p>
                          </div>
                        )}

                        {/* Associated prescription list */}
                        {visit.prescriptions && (
                          <div className="border-t border-slate-200/60 pt-2.5 mt-2 flex flex-col gap-2">
                            <span className="font-bold text-slate-400 flex items-center gap-1">
                              <Pill className="h-3.5 w-3.5 text-primary" /> Active Prescription Drugs
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {visit.prescriptions.drugs.map((drug, i) => (
                                <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-bold rounded-lg text-slate-700 flex items-center gap-1.5">
                                  {drug.name} ({drug.dosage}) - {drug.frequency}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Diagnostic Lab Reports */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-5">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Digitized Diagnostic & Lab Reports
            </h3>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-xs text-slate-400 font-semibold block">No digital diagnostics filed yet.</span>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-left flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">{report.title}</h4>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Uploaded on {report.date} by {report.uploaderName} • <span className="text-indigo-600">{report.category}</span>
                        </span>
                        
                        {report.parsedSummary && (
                          <div className="p-3 bg-white border border-indigo-50/50 rounded-lg text-[10px] text-slate-600 leading-relaxed font-medium max-w-xl mt-2">
                            <span className="font-extrabold text-indigo-800 block mb-1 flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                              AI Report OCR Analytics Summary:
                            </span>
                            {report.parsedSummary}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Diagnostic Tests Tracker */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                Recommended Diagnostic & Laboratory Tests ({recommendedTests.length})
              </h3>
            </div>

            {recommendedTests.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recommended laboratory or scan tests ordered for this patient yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedTests.map(rt => (
                  <div key={rt.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-slate-800 block">{rt.testName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Ordered: {rt.date} &bull; Dr. {rt.recommendedByDoctor}</span>
                    </div>
                    {rt.status === 'Completed' ? (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg">
                        ✓ Report Ready
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-lg">
                        ⏳ Pending Test
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
