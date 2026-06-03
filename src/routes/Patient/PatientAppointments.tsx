// src/routes/Patient/PatientAppointments.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, HospitalAdminProfile, Appointment, realtimeBroker } from '../../services/db';
import {
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  PlusCircle,
  Building,
  Stethoscope,
  User,
  AlertCircle,
  X
} from 'lucide-react';

interface PatientAppointmentsProps {
  onNavigate: (view: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending: {
    label: 'Waiting for Admin',
    icon: <Clock className="h-3.5 w-3.5" />,
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  forwarded: {
    label: 'Assigned to Doctor',
    icon: <ChevronRight className="h-3.5 w-3.5" />,
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<HospitalAdminProfile[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [bookHospitalId, setBookHospitalId] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [bookTimeRange, setBookTimeRange] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadData = () => {
      const allApts = DatabaseService.getAppointments();
      setAppointments(allApts.filter(a => a.patientId === user.id));
      setHospitals(DatabaseService.getAdmins());
    };
    loadData();
    const unsub = realtimeBroker.subscribe('appointments-update', loadData);
    return () => unsub();
  }, [user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookHospitalId || !bookReason || !bookTimeRange || !user) return;
    setSubmitting(true);
    DatabaseService.requestAppointment({
      patientId: user.id,
      hospitalId: bookHospitalId,
      timeRange: bookTimeRange,
      reason: bookReason,
    });
    setBookingSuccess(true);
    setBookHospitalId('');
    setBookReason('');
    setBookTimeRange('');
    setSubmitting(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setBookingSuccess(false);
    setBookHospitalId('');
    setBookReason('');
    setBookTimeRange('');
  };

  if (!user) return null;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const forwardedCount = appointments.filter(a => a.status === 'forwarded').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-teal-600" />
            My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Book and track your hospital consultation requests.
          </p>
        </div>
        <button
          id="book-appointment-btn"
          onClick={() => { setShowForm(true); setBookingSuccess(false); }}
          className="btn-medical py-2.5 px-5 flex items-center gap-2 font-bold text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock className="h-5 w-5" /> },
          { label: 'Assigned', count: forwardedCount, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Stethoscope className="h-5 w-5" /> },
          { label: 'Completed', count: completedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle className="h-5 w-5" /> },
        ].map(s => (
          <div key={s.label} className={`glass-card p-4 rounded-2xl border ${s.border} flex items-center gap-3`}>
            <div className={`h-10 w-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{s.count}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments list */}
      <div className="glass-card rounded-3xl border-teal-500/20 shadow-premium overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-700">No appointments yet</p>
              <p className="text-sm text-slate-400 mt-1">Click "Book Appointment" to request a consultation.</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setBookingSuccess(false); }}
              className="btn-medical py-2 px-5 text-sm font-bold"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map(apt => {
              const hospital = hospitals.find(h => h.id === apt.hospitalId);
              const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
              return (
                <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                    <Building className="h-6 w-6 text-teal-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{hospital?.hospitalName || 'Hospital'}</p>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{apt.reason}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        <Clock className="h-3 w-3" />
                        {apt.timeRange}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${cfg.cls}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                    {apt.status === 'forwarded' && (
                      <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Your request has been assigned to a doctor. You will be contacted soon.
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400 font-medium">
                      {new Date(apt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-300 font-mono mt-0.5">{apt.id}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-fade-in border border-slate-200 relative">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Appointment Requested!</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                  Your request has been sent to the hospital. The admin will review and assign a doctor to you shortly.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-6 btn-medical py-2.5 px-6 font-bold text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  Book an Appointment
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Select a hospital, describe your reason, and choose a preferred time range.
                </p>

                {hospitals.length === 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 mb-4">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-xs font-semibold text-amber-700">No hospitals registered yet. Please check back later.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Hospital</label>
                    <select
                      id="apt-hospital"
                      value={bookHospitalId}
                      onChange={e => setBookHospitalId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                      required
                    >
                      <option value="" disabled>-- Select a hospital --</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.hospitalName} — {h.address}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Reason for Visit</label>
                    <textarea
                      id="apt-reason"
                      value={bookReason}
                      onChange={e => setBookReason(e.target.value)}
                      placeholder="Describe your symptoms or the purpose of the visit..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Preferred Time Range</label>
                    <select
                      id="apt-time"
                      value={bookTimeRange}
                      onChange={e => setBookTimeRange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                      required
                    >
                      <option value="" disabled>-- Select preferred time --</option>
                      <option value="Morning (8AM–12PM)">Morning (8AM–12PM)</option>
                      <option value="Afternoon (12PM–4PM)">Afternoon (12PM–4PM)</option>
                      <option value="Evening (4PM–8PM)">Evening (4PM–8PM)</option>
                      <option value="Anytime">Anytime (Flexible)</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="apt-submit-btn"
                      disabled={submitting || hospitals.length === 0}
                      className="flex-1 btn-medical py-2.5 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting…' : 'Request Appointment'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
