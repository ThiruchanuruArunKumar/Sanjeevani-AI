import React, { useState, useEffect } from 'react';
import { DatabaseService, DoctorProfile, realtimeBroker } from '../../services/db';
import { Stethoscope, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ManageDoctorsProps {
  onNavigate: (view: string) => void;
}

export const ManageDoctors: React.FC<ManageDoctorsProps> = () => {
  const { user } = DatabaseService.getActiveSession();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadDoctors = () => {
      const allDocs = DatabaseService.getDoctors();
      setDoctors(allDocs.filter(d => d.hospitalId?.trim() === user.id?.trim()));
    };
    loadDoctors();
    const unsub = realtimeBroker.subscribe('doctors-update', loadDoctors);
    return () => unsub();
  }, [user?.id]);

  const handleApproval = (doctorId: string, status: 'accepted' | 'rejected') => {
    DatabaseService.updateDoctorApproval(doctorId, status);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          Manage Doctors
        </h2>
        <p className="text-slate-500 text-sm mt-1">Approve or reject doctors requesting to join your hospital.</p>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-premium">
        {doctors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No doctors have registered under your Hospital ID yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Doctor Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Specialty</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.id}</span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-600">{doc.specialty}</td>
                    <td className="p-4 text-sm text-slate-500">{doc.email}</td>
                    <td className="p-4">
                      {doc.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                      {doc.approvalStatus === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5" /> Approved
                        </span>
                      )}
                      {doc.approvalStatus === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                          <XCircle className="h-3.5 w-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {doc.approvalStatus === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApproval(doc.id, 'accepted')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleApproval(doc.id, 'rejected')}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {doc.approvalStatus !== 'pending' && (
                        <span className="text-xs text-slate-400 font-medium italic">Action completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
