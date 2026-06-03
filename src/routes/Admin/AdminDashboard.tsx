import React, { useState, useEffect } from 'react';
import { DatabaseService, realtimeBroker, Appointment, DoctorProfile } from '../../services/db';
import { Building, Stethoscope, Users, History, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      const allApts = DatabaseService.getAppointments();
      const allDocs = DatabaseService.getDoctors();
      
      console.log('--- ADMIN DASHBOARD DATA LOAD ---');
      console.log('Admin ID:', user.id);
      console.log('All Doctors:', allDocs);
      allDocs.forEach(d => console.log(`Doctor ${d.name} | HospitalID: ${d.hospitalId} | Match: ${d.hospitalId === user.id}`));
      
      setAppointments(allApts);
      setDoctors(allDocs.filter(d => d.hospitalId?.trim() === user.id?.trim()));
    };

    loadData();

    const unsubApts = realtimeBroker.subscribe('appointments-update', loadData);
    const unsubDocs = realtimeBroker.subscribe('doctors-update', loadData);

    return () => {
      unsubApts();
      unsubDocs();
    };
  }, [user?.id]);

  if (!user) return null;

  const pendingApts = appointments.filter(a => a.status === 'pending');
  const pendingDocs = doctors.filter(d => d.approvalStatus === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Building className="h-8 w-8 text-teal-600" />
            {user.hospitalName} Dashboard
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Hospital Admin Portal &bull; ID: <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{user.id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending Appointments Metric */}
        <div 
          onClick={() => onNavigate('admin/appointments')}
          className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium flex items-center justify-between cursor-pointer hover:bg-teal-50/50 transition-all active:scale-95"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Pending Appointments</span>
            <span className="text-4xl font-black text-slate-800">{pendingApts.length}</span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200 shadow-sm">
            <Activity className="h-7 w-7 text-amber-500 animate-pulse" />
          </div>
        </div>

        {/* Doctors Pending Approval */}
        <div 
          onClick={() => onNavigate('admin/doctors')}
          className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium flex items-center justify-between cursor-pointer hover:bg-teal-50/50 transition-all active:scale-95"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Pending Clinicians</span>
            <span className="text-4xl font-black text-slate-800">{pendingDocs.length}</span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200 shadow-sm">
            <ShieldCheck className="h-7 w-7 text-rose-500" />
          </div>
        </div>

        {/* Total Patients */}
        <div 
          onClick={() => onNavigate('admin/patients')}
          className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium flex items-center justify-between cursor-pointer hover:bg-teal-50/50 transition-all active:scale-95"
        >
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Active Doctors</span>
            <span className="text-4xl font-black text-slate-800">
              {doctors.filter(d => d.approvalStatus === 'accepted').length}
            </span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200 shadow-sm">
            <Stethoscope className="h-7 w-7 text-emerald-500" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Actions / Alerts */}
        <div className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Action Required
          </h3>
          
          <div className="space-y-3">
            {pendingApts.length === 0 && pendingDocs.length === 0 ? (
              <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl text-center">
                All caught up! No pending requests.
              </div>
            ) : (
              <>
                {pendingDocs.slice(0, 3).map(d => (
                  <div key={d.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Doctor Approval: {d.name}</span>
                    <button onClick={() => onNavigate('admin/doctors')} className="text-xs font-bold text-rose-600 hover:underline">Review</button>
                  </div>
                ))}
                {pendingApts.slice(0, 3).map(a => (
                  <div key={a.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">New Appointment: {a.reason}</span>
                    <button onClick={() => onNavigate('admin/appointments')} className="text-xs font-bold text-amber-600 hover:underline">Assign</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-premium">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-primary" />
            Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('admin/patients')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200"
            >
              <Users className="h-6 w-6 text-slate-600" />
              <span className="text-xs font-bold text-slate-700">Manage Patients</span>
            </button>
            <button 
              onClick={() => onNavigate('admin/doctors')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200"
            >
              <Stethoscope className="h-6 w-6 text-slate-600" />
              <span className="text-xs font-bold text-slate-700">Manage Doctors</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
