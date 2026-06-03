import React, { useState, useEffect } from 'react';
import { DatabaseService, Appointment, DoctorProfile, PatientProfile, realtimeBroker } from '../../services/db';
import { History, CheckCircle, Clock, Calendar as CalendarIcon, User, ChevronRight } from 'lucide-react';

interface ManageAppointmentsProps {
  onNavigate: (view: string) => void;
}

export const ManageAppointments: React.FC<ManageAppointmentsProps> = () => {
  const { user } = DatabaseService.getActiveSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  
  // State for assignment modal
  const [assigningAptId, setAssigningAptId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    const loadData = () => {
      const allApts = DatabaseService.getAppointments().filter(a => a && a.patientId);
      const allDocs = DatabaseService.getDoctors().filter(d => d && d.hospitalId?.trim() === user.id?.trim() && d.approvalStatus === 'accepted');
      setAppointments(allApts);
      setDoctors(allDocs);
      setPatients(DatabaseService.getPatients().filter(Boolean));
    };
    loadData();

    const unsubApts = realtimeBroker.subscribe('appointments-update', loadData);
    const unsubDocs = realtimeBroker.subscribe('doctors-update', loadData);
    return () => {
      unsubApts();
      unsubDocs();
    };
  }, [user?.id]);

  const handleForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigningAptId && selectedDoctorId) {
      DatabaseService.forwardAppointment(assigningAptId, selectedDoctorId);
      setAssigningAptId(null);
      setSelectedDoctorId('');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <History className="h-6 w-6 text-teal-600" />
          Manage Appointments
        </h2>
        <p className="text-slate-500 text-sm mt-1">Review patient requests and assign them to approved doctors.</p>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-premium">
        {appointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No appointment requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Patient</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Reason</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Time Range</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status / Doctor</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.filter(a => a && a.id).map(apt => {
                  const pat = patients.find(p => p && p.id === apt.patientId);
                  const doc = apt.doctorId ? doctors.find(d => d && d.id === apt.doctorId) : null;
                  
                  const statusText = apt.status ? String(apt.status) : 'pending';
                  const displayStatus = statusText.charAt(0).toUpperCase() + statusText.slice(1);
                  const displayReason = typeof apt.reason === 'object' ? JSON.stringify(apt.reason) : String(apt.reason || '');
                  const displayTime = typeof apt.timeRange === 'object' ? JSON.stringify(apt.timeRange) : String(apt.timeRange || '');
                  const displayPatientId = typeof apt.patientId === 'object' ? JSON.stringify(apt.patientId) : String(apt.patientId || '');
                  const displayDocName = doc ? (typeof doc.name === 'object' ? JSON.stringify(doc.name) : String(doc.name || '')) : '';

                  return (
                    <tr key={String(apt.id)} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{pat?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{displayPatientId}</span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-600 max-w-[200px] truncate">
                        {displayReason}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {displayTime}
                        </span>
                      </td>
                      <td className="p-4">
                        {statusText === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                            <Clock className="h-3.5 w-3.5" /> Unassigned
                          </span>
                        )}
                        {(statusText === 'forwarded' || statusText === 'completed') && doc && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 w-max mb-1">
                              {statusText === 'forwarded' ? <ChevronRight className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              {displayStatus}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                              <User className="h-3 w-3" /> Dr. {displayDocName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {statusText === 'pending' && (
                          <button 
                            onClick={() => setAssigningAptId(apt.id)}
                            className="btn-medical py-1.5 px-3 text-xs font-bold"
                          >
                            Assign Doctor
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {assigningAptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">Assign Doctor to Appointment</h3>
            <p className="text-xs text-slate-500 mb-6">Select an approved doctor from your hospital to handle this consultation.</p>
            
            <form onSubmit={handleForward} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Doctor</label>
                <select 
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                >
                  <option value="" disabled>-- Select an active doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>
                  ))}
                </select>
                {doctors.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">No approved doctors available. Please approve doctors first.</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setAssigningAptId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!selectedDoctorId || doctors.length === 0}
                  className="flex-1 btn-medical py-2.5 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forward Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
