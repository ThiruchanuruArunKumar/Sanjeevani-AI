import React, { useState, useEffect } from 'react';
import { DatabaseService, realtimeBroker, Appointment, DoctorProfile, ConsultationNote, PatientProfile } from '../../services/db';
import { Building, Stethoscope, Users, History, Activity, ShieldCheck, AlertTriangle, FileText, CheckCircle2, Copy } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const portalId = user?.hospitalPortalId || user?.id || '';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || !portalId) return;

    const loadData = () => {
      const hospitalApts = DatabaseService.getAppointments(portalId);
      const hospitalDocs = DatabaseService.getDoctors(portalId);
      const hospitalPats = DatabaseService.getPatients(portalId);
      const hospitalNotes = DatabaseService.getConsultationNotes(portalId);

      setAppointments(hospitalApts);
      setDoctors(hospitalDocs);
      setPatients(hospitalPats);
      setConsultationNotes(hospitalNotes);
    };

    loadData();
    DatabaseService.syncFromSupabase().then(loadData);

    const unsubApts = realtimeBroker.subscribe('appointments-update', loadData);
    const unsubDocs = realtimeBroker.subscribe('doctors-update', loadData);
    const unsubPats = realtimeBroker.subscribe('patients-update', loadData);
    const unsubNotes = realtimeBroker.subscribe('consultation-notes-update', loadData);

    return () => {
      unsubApts();
      unsubDocs();
      unsubPats();
      unsubNotes();
    };
  }, [user?.id, portalId]);

  if (!user) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(portalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingApts = appointments.filter(a => a.status === 'pending');
  const pendingDocs = doctors.filter(d => d.approvalStatus === 'pending');
  const activeDocs = doctors.filter(d => d.approvalStatus === 'accepted');
  const pendingNotes = consultationNotes.filter(n => n.status === 'pending_explanation');

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border-teal-500/20 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-white via-slate-50 to-teal-50/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building className="h-7 w-7 text-teal-600" />
            <h1 className="text-2xl md:text-3xl font-black text-slate-800">
              {user.hospitalName || 'Hospital Admin'} Dashboard
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-xs md:text-sm">
            Central Command &bull; {user.address || 'Main Campus'} &bull; Admin: <span className="font-bold text-slate-700">{user.adminName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Hospital Portal ID</span>
            <span className="text-sm font-mono font-black tracking-wider text-amber-400">{portalId}</span>
          </div>
          <button 
            onClick={handleCopyId}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Copy Portal ID"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Metric Cards Grid (Exact Requirements) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Total Doctors */}
        <div 
          onClick={() => onNavigate('admin/doctors')}
          className="glass-card p-4 rounded-2xl border-teal-500/20 shadow-sm cursor-pointer hover:border-teal-400 transition-all text-left space-y-1"
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Doctors</span>
          <span className="text-xl font-black text-teal-700 block">{doctors.length}</span>
        </div>

        {/* Total Patients */}
        <div 
          onClick={() => onNavigate('admin/all-patients')}
          className="glass-card p-4 rounded-2xl border-teal-500/20 shadow-sm cursor-pointer hover:border-teal-400 transition-all text-left space-y-1"
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
          <span className="text-xl font-black text-teal-700 block">{patients.length}</span>
        </div>

        {/* Online Patients */}
        <div 
          onClick={() => onNavigate('admin/all-patients')}
          className="glass-card p-4 rounded-2xl border-blue-500/20 shadow-sm cursor-pointer hover:border-blue-400 transition-all text-left space-y-1 bg-blue-50/20"
        >
          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider block">Online Patients</span>
          <span className="text-xl font-black text-blue-700 block">
            {patients.filter(p => p.registrationType === 'ONLINE' || p.passwordHash).length}
          </span>
        </div>

        {/* Walk-in Patients */}
        <div 
          onClick={() => onNavigate('admin/all-patients')}
          className="glass-card p-4 rounded-2xl border-amber-500/20 shadow-sm cursor-pointer hover:border-amber-400 transition-all text-left space-y-1 bg-amber-50/20"
        >
          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Walk-in Patients</span>
          <span className="text-xl font-black text-amber-700 block">
            {patients.filter(p => p.registrationType === 'WALK_IN' || (!p.registrationType && !p.passwordHash)).length}
          </span>
        </div>

        {/* Today's Appointments */}
        <div 
          onClick={() => onNavigate('admin/appointments')}
          className="glass-card p-4 rounded-2xl border-indigo-500/20 shadow-sm cursor-pointer hover:border-indigo-400 transition-all text-left space-y-1"
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Today's Appointments</span>
          <span className="text-xl font-black text-indigo-700 block">{appointments.length}</span>
        </div>

        {/* Pending Requests */}
        <div 
          onClick={() => onNavigate('admin/appointments')}
          className="glass-card p-4 rounded-2xl border-rose-500/20 shadow-sm cursor-pointer hover:border-rose-400 transition-all text-left space-y-1 bg-rose-50/20"
        >
          <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Pending Requests</span>
          <span className="text-xl font-black text-rose-700 block">{pendingApts.length}</span>
        </div>

        {/* Consultations Completed Today */}
        <div 
          onClick={() => onNavigate('admin/consultations')}
          className="glass-card p-4 rounded-2xl border-emerald-500/20 shadow-sm cursor-pointer hover:border-emerald-400 transition-all text-left space-y-1 bg-emerald-50/20"
        >
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Consults Completed</span>
          <span className="text-xl font-black text-emerald-700 block">{consultationNotes.length}</span>
        </div>

      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Action Required */}
        <div className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Action Required
          </h3>
          
          <div className="space-y-3">
            {pendingApts.length === 0 && pendingDocs.length === 0 && pendingNotes.length === 0 ? (
              <div className="text-sm text-slate-500 p-6 bg-slate-50 rounded-2xl text-center">
                🎉 All caught up! No pending requests or unexplained notes for your hospital.
              </div>
            ) : (
              <>
                {pendingNotes.slice(0, 2).map(n => (
                  <div key={n.id} className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Consultation Note: {n.patientName}</span>
                      <span className="text-[10px] text-slate-500">Dr. {n.doctorName} &bull; {n.diagnosis}</span>
                    </div>
                    <button onClick={() => onNavigate('admin/consultation-notes')} className="text-xs font-bold text-teal-600 hover:underline shrink-0">
                      Review & Explain
                    </button>
                  </div>
                ))}
                {pendingDocs.slice(0, 2).map(d => (
                  <div key={d.id} className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Doctor Approval: {d.name} ({d.specialty})</span>
                    <button onClick={() => onNavigate('admin/doctors')} className="text-xs font-bold text-rose-600 hover:underline shrink-0">Review</button>
                  </div>
                ))}
                {pendingApts.slice(0, 2).map(a => (
                  <div key={a.id} className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Appointment Request: {a.reason}</span>
                    <button onClick={() => onNavigate('admin/appointments')} className="text-xs font-bold text-amber-600 hover:underline shrink-0">Assign Doctor</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick Modules */}
        <div className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-teal-600" />
            Hospital Administration Modules
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('admin/patients')}
              className="p-4 bg-slate-50 hover:bg-teal-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200 hover:border-teal-300"
            >
              <Users className="h-6 w-6 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Manage Patients</span>
            </button>
            
            <button 
              onClick={() => onNavigate('admin/doctors')}
              className="p-4 bg-slate-50 hover:bg-teal-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200 hover:border-teal-300"
            >
              <Stethoscope className="h-6 w-6 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Manage Doctors</span>
            </button>

            <button 
              onClick={() => onNavigate('admin/appointments')}
              className="p-4 bg-slate-50 hover:bg-teal-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200 hover:border-teal-300"
            >
              <History className="h-6 w-6 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Manage Appointments</span>
            </button>

            <button 
              onClick={() => onNavigate('admin/consultation-notes')}
              className="p-4 bg-slate-50 hover:bg-teal-50/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200 hover:border-teal-300"
            >
              <FileText className="h-6 w-6 text-slate-700" />
              <span className="text-xs font-bold text-slate-800">Consultation Notes</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

