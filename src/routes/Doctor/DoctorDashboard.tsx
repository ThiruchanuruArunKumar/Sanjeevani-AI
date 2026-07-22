import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile, Appointment, realtimeBroker } from '../../services/db';
import { AISafetyEngine } from '../../services/ai';
import { 
  Search, 
  User, 
  Activity, 
  Pill, 
  Upload, 
  ShieldAlert, 
  Heart, 
  CheckCircle,
  FileText,
  AlertCircle,
  Stethoscope,
  Clock,
  Lock,
  Calendar,
  Users
} from 'lucide-react';

import { useIsMobile } from '../../services/platform';

interface DoctorDashboardProps {
  onNavigate: (view: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const isMobile = useIsMobile();
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [completedVisits, setCompletedVisits] = useState<any[]>([]);
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'alerts' | 'all'>('alerts');

  const doctorPortalId = user?.hospitalId || user?.hospital_portal_id || user?.id || '';
  const doctorId = user?.id || '';

  const loadData = () => {
    if (!user) return;

    // 1. Fetch appointments assigned to THIS doctor in THIS hospital
    const allHospitalApts = DatabaseService.getAppointments(doctorPortalId);
    const myAppointments = allHospitalApts.filter(a => 
      a.doctorId === doctorId &&
      (!a.hospitalId || a.hospitalId.toUpperCase() === doctorPortalId.toUpperCase())
    );
    
    setAppointments(myAppointments);
    setPendingAppointments(myAppointments.filter(a => a.status === 'forwarded' || a.status === 'pending'));

    // 2. Fetch completed clinical visits by THIS doctor
    const myVisits = DatabaseService.getVisits().filter(v => 
      v.doctorId === doctorId && 
      (!v.hospitalPortalId || v.hospitalPortalId.toUpperCase() === doctorPortalId.toUpperCase())
    );
    setCompletedVisits(myVisits);

    // 3. Collect assigned patient IDs for this doctor
    const assignedPatientIds = new Set([
      ...myAppointments.map(a => a.patientId),
      ...myVisits.map(v => v.patientId)
    ]);

    // 4. Fetch patients assigned to this doctor in this hospital ONLY
    const hospitalPatients = DatabaseService.getPatients(doctorPortalId);
    const myPatients = hospitalPatients.filter(p => assignedPatientIds.has(p.id));
    setPatients(myPatients);

    // 5. Fetch reports and feedbacks for assigned patients ONLY
    const allReports = DatabaseService.getReports().filter(r => 
      assignedPatientIds.has(r.patientId) && 
      (!r.hospitalPortalId || r.hospitalPortalId.toUpperCase() === doctorPortalId.toUpperCase())
    );
    setReportsCount(allReports.length);

    const allFeedbacks = DatabaseService.getFeedbacks();
    setFeedbacks(allFeedbacks.filter(f => assignedPatientIds.has(f.patientId)));
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime database updates
    const unsubscribe = realtimeBroker.subscribe('patients-update', loadData);
    const unsubscribeFeedbacks = realtimeBroker.subscribe('feedbacks-update', loadData);
    const unsubscribeApts = realtimeBroker.subscribe('appointments-update', loadData);
    const unsubscribeVisits = realtimeBroker.subscribe('visits-update', loadData);

    return () => {
      unsubscribe();
      unsubscribeFeedbacks();
      unsubscribeApts();
      unsubscribeVisits();
    };
  }, [user?.id, doctorPortalId]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  // Exact Stats calculation (Strict zero-defaults, NO sample fallbacks)
  const totalPatients = patients.length;
  const criticalPatients = patients.filter(p => p.vitals.systolicBP > 140 || p.vitals.oxygenSat < 95).length;
  const averageBPM = totalPatients > 0 
    ? Math.round(patients.reduce((sum, p) => sum + p.vitals.heartRate, 0) / totalPatients) 
    : 0;
  const activeFeedbackAlerts = feedbacks.filter(f => !f.readByDoctor && (f.aiSeverity === 'critical' || f.aiSeverity === 'elevated')).length;
  const pendingCount = pendingAppointments.length;
  const completedCount = completedVisits.length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isMobile ? 'Doctors Dashboard' : 'Clinical Dashboard'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Welcome, <strong className="text-teal-800 font-extrabold">{user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Doctor'}</strong>.
            {doctorPortalId && (
              <span className="ml-2 font-mono text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 font-bold">
                {doctorPortalId}
              </span>
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => onNavigate('doctor/appointments')} 
            className="btn-medical text-xs font-bold shadow-premium flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Today's Appointments
          </button>
          <button 
            onClick={() => onNavigate('doctor/patients')} 
            className="btn-medical-secondary text-xs font-bold flex items-center gap-1.5"
          >
            <Users className="h-4 w-4 text-primary" />
            My Patients
          </button>
        </div>
      </div>

      {/* Top Clinical Stats Row (Strict Real Counts) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 rounded-2xl space-y-1 text-left border-teal-500/10">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Today's Appointments</span>
          <span className="text-xl sm:text-2xl font-black text-teal-700 block">{appointments.length}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1 text-left border-amber-500/10">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Waiting Patients</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 block">{pendingCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1 text-left border-rose-500/10">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Pending Consultations</span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 block">{pendingCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1 text-left border-emerald-500/10">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Completed Consultations</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 block">{completedCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1 text-left border-blue-500/10">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Medical Reports</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 block">{reportsCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl space-y-1 text-left border-slate-200/80">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Assigned Patients</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 block">{totalPatients}</span>
        </div>
      </div>

      {/* 🟢 Professional Empty State for Newly Registered/Approved Doctors */}
      {totalPatients === 0 && appointments.length === 0 && (
        <div className="glass-card p-10 rounded-3xl border-slate-200/70 text-center space-y-4 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
          <div className="h-16 w-16 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-center mx-auto text-teal-700">
            <User className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-slate-800">No appointments assigned yet</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Welcome to Sanjeevani AI! Your doctor profile is active under Hospital Portal ID <strong className="font-mono text-teal-800">{doctorPortalId}</strong>.<br/>
              Please wait for your Hospital Administrator to assign patients or appointments to your account.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px] font-bold">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              No patients assigned
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              No consultation history available
            </span>
            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200 font-mono">
              Portal ID: {doctorPortalId}
            </span>
          </div>
        </div>
      )}



      {/* Alert Warning Box if critical parameters exist (Desktop) */}
      {!isMobile && criticalPatients > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-500/10 flex gap-3.5 items-start medical-glow-active">
          <AlertCircle className="h-5.5 w-5.5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 text-left">
            <span className="text-sm font-bold text-rose-900 block">AI Critical Vitals Watchlist Recommendation</span>
            <span className="text-xs leading-relaxed text-rose-800 block mt-1">
              Patient <span className="font-bold">Rohan Sharma</span> has active Stage 3 Kidney Impairment (eGFR 52 mL/min) and high-dose systolic BP ({patients.find(p=>p.id==='SJV-PAT-000001')?.vitals.systolicBP} mmHg). Spironolactone or high NSAIDs are highly discouraged. Ensure prescribing safety audit is performed.
            </span>
          </div>
        </div>
      )}

      {/* Clinician Adherence Watchlist Banner (Desktop) */}
      {!isMobile && (() => {
        const lowAdherencePats = patients.filter(p => DatabaseService.getAdherenceScore(p.id) < 80);
        if (lowAdherencePats.length === 0) return null;
        return (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-500/10 flex gap-3.5 items-start medical-glow-active">
            <ShieldAlert className="h-5.5 w-5.5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 text-left">
              <span className="text-sm font-bold text-amber-900 block">AI Medication Adherence Watchlist Warning</span>
              <div className="text-xs leading-relaxed text-amber-800 block mt-1">
                The following patients have dynamic medication compliance below the safety threshold (<span className="font-bold">80%</span>). Review schedules and guide patients immediately:
                <div className="flex flex-wrap gap-2 mt-2">
                  {lowAdherencePats.map(p => {
                    const score = DatabaseService.getAdherenceScore(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => onNavigate(`doctor/patient/${p.id}`)}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300/35 rounded-lg font-bold transition-all text-[10px] active:scale-95 shadow-sm flex items-center gap-1"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        {p.name} ({score.toFixed(0)}% Adherence)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 📅 Assigned Appointments from Admin (Mobile) */}
      {isMobile && pendingAppointments.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-blue-200/60 bg-blue-50/30 shadow-premium space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              New Patient Appointments Assigned
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                {pendingAppointments.length}
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {pendingAppointments.map(apt => {
              const allPats = DatabaseService.getPatients();
              const pat = allPats.find(p => p.id === apt.patientId);
              return (
                <div key={apt.id} className="bg-white rounded-2xl p-4 border border-blue-100 flex items-center gap-4 text-left">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800">{pat?.name || 'Unknown Patient'}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{apt.reason}</p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">⏰ {apt.timeRange} · 📞 {pat?.phone || 'No phone'}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(`doctor/patient/${apt.patientId}`)}
                    className="btn-medical py-1.5 px-3 text-xs font-bold shrink-0"
                  >
                    View Patient
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🩺 AI-Powered Post-Prescription Patient Monitoring Tracker */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-left border border-teal-500/10 shadow-premium">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Stethoscope className="h-5.5 w-5.5 text-primary animate-pulse" />
              AI-Powered Post-Prescription Patient Monitoring
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Track medication compliance, daily recovery reports, and drug safety feedback in real-time.</p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'alerts'
                  ? 'bg-primary text-white shadow-premium'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Drug Safety Alerts ({activeFeedbackAlerts})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-premium'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Daily Reports ({feedbacks.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'alerts' ? (
          <div className="space-y-4">
            {feedbacks.filter(f => !f.readByDoctor && (f.aiSeverity === 'critical' || f.aiSeverity === 'elevated')).length === 0 ? (
              <div className="py-8 bg-slate-50/50 border border-slate-100 rounded-2xl text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-slate-700">All Patients Recovering Stably</h4>
                <p className="text-xs text-slate-400 font-medium">No unresolved adverse side effect logs or safety engine notifications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks
                  .filter(f => !f.readByDoctor && (f.aiSeverity === 'critical' || f.aiSeverity === 'elevated'))
                  .map((fb) => (
                    <div
                      key={fb.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                        fb.aiSeverity === 'critical'
                          ? 'bg-rose-50/20 border-rose-500/10'
                          : 'bg-amber-50/25 border-amber-500/10'
                      }`}
                    >
                      {/* Alert header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Patient Safety Alert</span>
                          <h4 className="text-sm font-black text-slate-800 mt-0.5">{fb.patientName} ({fb.patientId})</h4>
                          <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">{fb.date}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          fb.aiSeverity === 'critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {fb.aiSeverity}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-bold w-16 shrink-0">Medication</span>
                          <span className="font-extrabold text-slate-800">{fb.drugName}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-bold w-16 shrink-0">Feeling</span>
                          <span className={`font-black uppercase ${
                            fb.feeling === 'Worse' ? 'text-amber-700' : 'text-rose-700'
                          }`}>{fb.feeling}</span>
                        </div>
                        {fb.symptoms.length > 0 && (
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className="text-slate-400 font-bold w-16 shrink-0">Symptoms</span>
                            <div className="flex flex-wrap gap-1">
                              {fb.symptoms.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 font-bold rounded text-[9px] capitalize">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {fb.notes && (
                          <div className="p-3 bg-white border border-slate-100 rounded-xl italic leading-relaxed text-slate-600 font-semibold">
                            &ldquo;{fb.notes}&rdquo;
                          </div>
                        )}
                        {/* AI safety assessment */}
                        <div className={`p-3 rounded-xl border leading-relaxed font-semibold ${
                          fb.aiSeverity === 'critical'
                            ? 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          <strong className="block mb-0.5 uppercase tracking-wide">Sanjeevani AI Diagnostic Summary:</strong>
                          {fb.aiAnalysis}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-slate-100 pt-3 flex justify-between items-center gap-2">
                        <button
                          onClick={() => onNavigate(`doctor/patient/${fb.patientId}`)}
                          className="text-[11px] text-primary font-bold hover:underline"
                        >
                          Open Patient Record →
                        </button>
                        <button
                          onClick={() => DatabaseService.markFeedbackAsRead(fb.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500/25 hover:bg-emerald-50/20 text-slate-600 hover:text-emerald-700 rounded-lg text-[10px] font-bold shadow-sm transition-all"
                        >
                          Acknowledge & Archive
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          /* ALL DAILY LOGS FEED */
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {feedbacks.length === 0 ? (
              <div className="py-8 bg-slate-50/50 border border-slate-100 rounded-2xl text-center">
                <span className="text-xs text-slate-400 font-semibold">No daily monitoring logs submitted by patients yet.</span>
              </div>
            ) : (
              feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs hover:border-primary/20 transition-all text-left"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-800 text-sm">{fb.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{fb.date}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        fb.aiSeverity === 'critical' ? 'bg-rose-50 text-rose-700' :
                        fb.aiSeverity === 'elevated' ? 'bg-amber-50 text-amber-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        AI: {fb.aiSeverity}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-bold uppercase">Med:</span>
                      <span className="font-extrabold text-slate-700">{fb.drugName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-bold uppercase">Feeling:</span>
                      <span className={`font-black uppercase ${
                        fb.feeling === 'Better' ? 'text-emerald-600 font-sans' :
                        fb.feeling === 'Same' ? 'text-slate-600 font-sans' :
                        fb.feeling === 'Worse' ? 'text-amber-600 font-sans' :
                        'text-rose-600 font-bold font-sans'
                      }`}>{fb.feeling}</span>
                      {fb.symptoms.length > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 font-bold uppercase">Side effects:</span>
                          <div className="flex gap-1 flex-wrap">
                            {fb.symptoms.map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 font-bold rounded text-[9px] capitalize">
                                {s}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {fb.notes && (
                      <p className="text-[10.5px] italic text-slate-500 leading-normal font-semibold">
                        &ldquo;{fb.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate(`doctor/patient/${fb.patientId}`)}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-500/20 text-slate-700 hover:text-primary rounded-lg text-[10px] font-bold transition-all shadow-sm"
                    >
                      Patient Record
                    </button>
                    {!fb.readByDoctor && (
                      <button
                        onClick={() => DatabaseService.markFeedbackAsRead(fb.id)}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-500/25 hover:bg-emerald-50/20 text-slate-500 hover:text-emerald-700 rounded-lg text-[10px] font-bold shadow-sm transition-all"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🔮 AI Clinical Risk Telemetric Priority Queue */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-left border border-teal-500/10 shadow-premium">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-rose-500 animate-pulse" />
            Sanjeevani AI Preventative Priority Queue
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time health forecasts predicting complication incidents before emergency care is triggered.</p>
        </div>

        {(() => {
          // Dynamic priority queue calculation
          const patientRiskProfiles = patients.map(p => {
            const pFeedbacks = feedbacks.filter(f => f.patientId === p.id);
            const pred = AISafetyEngine.predictHealthRisk(p, pFeedbacks, []);
            return {
              patient: p,
              score: pred.score,
              severity: prMap(pred.severity),
              predictedRisk: pred.predictedRisk,
              notes: pred.notes
            };
          });

          // Helper to cast
          function prMap(s: string): 'stable' | 'moderate' | 'high' | 'critical' {
            if (s === 'critical' || s === 'high' || s === 'moderate') return s;
            return 'stable';
          }

          const queue = [...patientRiskProfiles]
            .filter(pr => pr.severity === 'critical' || pr.severity === 'high' || pr.severity === 'moderate')
            .sort((a, b) => b.score - a.score);

          if (queue.length === 0) {
            return (
              <div className="py-8 bg-slate-50/50 border border-slate-100 rounded-2xl text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-slate-700">All Tracked Patients Stable</h4>
                <p className="text-xs text-slate-400 font-medium">Predictive diagnostics indicate no active high-risk clinical forecasts.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queue.map((item) => (
                <div
                  key={item.patient.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 relative overflow-hidden transition-all hover:shadow-premium ${
                    item.severity === 'critical' ? 'bg-rose-50/10 border-rose-500/10' :
                    item.severity === 'high' ? 'bg-orange-50/10 border-orange-500/10' :
                    'bg-amber-50/10 border-amber-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Predictive Risk Complication Warning</span>
                      <h4 className="text-sm font-black text-slate-800 mt-0.5">{item.patient.name} ({item.patient.id})</h4>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded mt-1.5 inline-block border ${
                        item.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                        item.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.severity} Risk: {item.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-left">
                    <div className="flex gap-2">
                      <span className="text-slate-400 font-bold w-16 shrink-0">Forecast</span>
                      <span className="font-extrabold text-slate-800">{item.predictedRisk}</span>
                    </div>
                    <p className={`p-3 rounded-xl border text-[10.5px] leading-relaxed font-semibold ${
                      item.severity === 'critical' ? 'bg-rose-50/50 border-rose-200 text-rose-800 animate-pulse' :
                      item.severity === 'high' ? 'bg-orange-50/50 border-orange-200 text-orange-850' :
                      'bg-amber-50/50 border-amber-200 text-amber-850'
                    }`}>
                      {item.notes}
                    </p>
                  </div>

                  <div className="border-t border-slate-100/50 pt-3 flex justify-between items-center gap-2">
                    <button
                      onClick={() => onNavigate(`doctor/patient/${item.patient.id}`)}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-teal-500/25 hover:bg-teal-50/20 text-slate-700 hover:text-primary rounded-lg text-[10px] font-bold shadow-sm transition-all"
                    >
                      Coordinate Preventative Care →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Patients List and Search */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        
        {/* Header and Search input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-800">Unified Patient Directory</h3>
            <p className="text-xs text-slate-400">Search profiles, view diagnostic timelines, and review safety metrics.</p>
          </div>

          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="Search by ID, name, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <span className="text-slate-400 font-bold block text-sm">No matching clinical records found</span>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isCritical = patient.vitals.systolicBP > 140 || patient.vitals.oxygenSat < 95;
              return (
                <div 
                  key={patient.id} 
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-6 hover:shadow-premium ${
                    isCritical 
                      ? 'bg-rose-50/20 border-rose-500/10' 
                      : 'bg-white border-slate-100 hover:border-teal-500/20'
                  }`}
                >
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {patient.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-800">{patient.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          ID: {patient.id} • {patient.age} Yrs • Blood Group: {patient.bloodGroup}
                        </span>
                      </div>
                    </div>

                    <span className={isCritical ? 'badge-critical' : 'badge-stable'}>
                      <Heart className="h-3 w-3" />
                      {isCritical ? 'Attention' : 'Stable'}
                    </span>
                  </div>

                  {/* Dynamic AI Risk Score Barometer */}
                  {(() => {
                    const patientFeedbacks = feedbacks.filter(f => f.patientId === patient.id);
                    const pred = AISafetyEngine.predictHealthRisk(patient, patientFeedbacks, []);
                    const adherence = DatabaseService.getAdherenceScore(patient.id);
                    return (
                      <div className="space-y-1.5 text-left bg-slate-50/30 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-wider">AI Predictive Risk</span>
                          <span className={`uppercase px-2 py-0.5 rounded text-[8px] font-extrabold ${
                            pred.severity === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse' :
                            pred.severity === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                            pred.severity === 'moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {pred.severity} ({pred.score}/100)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pred.severity === 'critical' ? 'bg-rose-500 animate-pulse' :
                              pred.severity === 'high' ? 'bg-orange-500' :
                              pred.severity === 'moderate' ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${pred.score}%` }}
                          />
                        </div>
                        <span className="text-[9.5px] italic text-slate-500 block truncate font-semibold mt-1">AI Forecast: {pred.predictedRisk}</span>
                        
                        {/* Dynamic Medication Adherence Dial */}
                        <div className="flex justify-between items-center text-[10px] font-bold mt-2 pt-2 border-t border-slate-200/40">
                          <span className="text-slate-400 uppercase tracking-wider">Medication Adherence</span>
                          <span className={`uppercase px-2 py-0.5 rounded text-[8px] font-extrabold ${
                            adherence >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                          }`}>
                            {adherence.toFixed(0)}% Adherence
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Vitals Summary Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/60 p-3 rounded-xl border border-slate-100/50 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">BP Status</span>
                      <span className={`text-xs font-bold block mt-0.5 ${patient.vitals.systolicBP > 140 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {patient.vitals.systolicBP}/{patient.vitals.diastolicBP}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">O₂ Saturation</span>
                      <span className={`text-xs font-bold block mt-0.5 ${patient.vitals.oxygenSat < 95 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {patient.vitals.oxygenSat}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Blood Sugar</span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5">
                        {patient.vitals.bloodGlucose || 100} mg/dL
                      </span>
                    </div>
                  </div>

                  {/* Conditions & Allergies Tags */}
                  <div className="space-y-2 text-left">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Chronic:</span>
                      {patient.chronicConditions.map((cond, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                          {cond}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Allergies:</span>
                      {patient.allergies.length === 0 ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">None Documented</span>
                      ) : (
                        patient.allergies.map((allergy, i) => (
                          <span key={i} className="text-[9px] bg-rose-50 text-rose-700 border border-rose-100 font-bold px-2 py-0.5 rounded animate-pulse">
                            {allergy.allergen} ({allergy.severity})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center gap-4">
                    <span className="text-[10px] text-slate-400 font-medium">Emergency Contact: {patient.emergencyContact.name}</span>
                    <button 
                      onClick={() => onNavigate(`doctor/patient/${patient.id}`)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Patient Record
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
