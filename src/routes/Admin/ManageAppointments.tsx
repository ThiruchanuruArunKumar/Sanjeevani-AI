import React, { useState, useEffect } from 'react';
import { DatabaseService, Appointment, DoctorProfile, PatientProfile, realtimeBroker } from '../../services/db';
import { History, CheckCircle, Clock, Calendar as CalendarIcon, User, ChevronRight, Plus, X, AlertCircle, Ban } from 'lucide-react';

interface ManageAppointmentsProps {
  onNavigate: (view: string) => void;
}

export const ManageAppointments: React.FC<ManageAppointmentsProps> = () => {
  const { user } = DatabaseService.getActiveSession();
  const portalId = user?.hospitalPortalId || user?.id || '';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  
  // State for assignment modal
  const [assigningAptId, setAssigningAptId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // State for creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newApt, setNewApt] = useState({
    patientId: '',
    doctorId: '',
    timeRange: 'Today 10:00 AM - 10:30 AM',
    reason: 'General OPD Checkup'
  });

  useEffect(() => {
    if (!user || !portalId) return;

    const loadData = () => {
      const hospitalApts = DatabaseService.getAppointments(portalId).filter(a => a && a.patientId);
      const hospitalDocs = DatabaseService.getDoctors(portalId).filter(d => d && d.approvalStatus === 'accepted');
      const hospitalPats = DatabaseService.getPatients(portalId);

      setAppointments(hospitalApts);
      setDoctors(hospitalDocs);
      setPatients(hospitalPats);
    };

    loadData();

    const unsubApts = realtimeBroker.subscribe('appointments-update', loadData);
    const unsubDocs = realtimeBroker.subscribe('doctors-update', loadData);
    const unsubPats = realtimeBroker.subscribe('patients-update', loadData);

    return () => {
      unsubApts();
      unsubDocs();
      unsubPats();
    };
  }, [user?.id, portalId]);

  const handleForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigningAptId && selectedDoctorId) {
      DatabaseService.forwardAppointment(assigningAptId, selectedDoctorId);
      setAssigningAptId(null);
      setSelectedDoctorId('');
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.patientId || !newApt.timeRange || !newApt.reason) return;

    DatabaseService.requestAppointment({
      patientId: newApt.patientId,
      hospitalId: portalId,
      timeRange: newApt.timeRange,
      reason: newApt.reason,
      doctorId: newApt.doctorId || undefined
    });

    setShowCreateModal(false);
    setNewApt({ patientId: '', doctorId: '', timeRange: 'Today 10:00 AM - 10:30 AM', reason: 'General OPD Checkup' });
  };

  const handleStatusUpdate = (aptId: string, status: Appointment['status']) => {
    DatabaseService.updateAppointmentStatus(aptId, status);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <History className="h-6 w-6 text-teal-600" />
            Manage Hospital Appointments
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Hospital Portal ID: <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{portalId}</span>
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-medical py-2 px-4 flex items-center gap-2 text-sm font-bold shadow-md"
        >
          <Plus className="h-4 w-4" /> Create Appointment
        </button>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-premium">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No appointments scheduled for your hospital.</p>
            <p className="text-xs text-slate-400">Click "Create Appointment" above to schedule a patient slot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Patient Name & ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Reason / Chief Complaint</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Scheduled Time</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Assigned Doctor / Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
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
                        <span className="font-bold text-slate-800 block">{pat?.name || 'Patient'}</span>
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
                        {(statusText === 'forwarded' || statusText === 'completed') && (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 w-max mb-1">
                              {statusText === 'forwarded' ? <ChevronRight className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              {displayStatus}
                            </span>
                            {doc && (
                              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                <User className="h-3 w-3" /> Dr. {displayDocName}
                              </span>
                            )}
                          </div>
                        )}
                        {statusText === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            <Ban className="h-3.5 w-3.5" /> Cancelled
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {statusText === 'pending' && (
                            <button 
                              onClick={() => setAssigningAptId(apt.id)}
                              className="btn-medical py-1.5 px-3 text-xs font-bold"
                            >
                              Assign Doctor
                            </button>
                          )}
                          {statusText === 'forwarded' && (
                            <button 
                              onClick={() => handleStatusUpdate(apt.id, 'completed')}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100"
                            >
                              Mark Done
                            </button>
                          )}
                          {statusText !== 'rejected' && statusText !== 'completed' && (
                            <button 
                              onClick={() => handleStatusUpdate(apt.id, 'rejected')}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold"
                              title="Cancel Appointment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">Create New Appointment</h3>
            <p className="text-xs text-slate-500 mb-6">Schedule a consultation for a patient under your hospital.</p>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Patient</label>
                <select 
                  value={newApt.patientId}
                  onChange={(e) => setNewApt({ ...newApt, patientId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                >
                  <option value="" disabled>-- Select registered patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone || p.id})</option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No patients registered. Please register a patient first in Manage Patients.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Doctor (Optional)</label>
                <select 
                  value={newApt.doctorId}
                  onChange={(e) => setNewApt({ ...newApt, doctorId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">-- Leave Unassigned (Assign later) --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Time Slot / Schedule</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Today 11:30 AM - 12:00 PM"
                  value={newApt.timeRange}
                  onChange={(e) => setNewApt({ ...newApt, timeRange: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Reason for Consultation</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Routine checkup / Fever / High Blood Pressure"
                  value={newApt.reason}
                  onChange={(e) => setNewApt({ ...newApt, reason: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newApt.patientId}
                  className="flex-1 btn-medical py-2.5 font-bold text-sm disabled:opacity-50"
                >
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <p className="text-xs text-rose-500 mt-1">No approved doctors available. Please approve or add doctors first.</p>
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
                  Assign Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

