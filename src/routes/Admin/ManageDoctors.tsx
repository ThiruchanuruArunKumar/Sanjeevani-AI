import React, { useState, useEffect } from 'react';
import { DatabaseService, DoctorProfile, realtimeBroker } from '../../services/db';
import { Stethoscope, CheckCircle, XCircle, Clock, UserPlus, Edit3, Trash2, Search, Plus, Building } from 'lucide-react';

interface ManageDoctorsProps {
  onNavigate: (view: string) => void;
}

export const ManageDoctors: React.FC<ManageDoctorsProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const portalId = user?.hospitalPortalId || user?.id || '';

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    clinicName: ''
  });

  useEffect(() => {
    if (!user || !portalId) return;

    const loadDoctors = async () => {
      const hospitalDocs = await DatabaseService.fetchDoctorsFromSupabase(portalId);
      setDoctors(hospitalDocs);
    };

    loadDoctors();
    const pollInterval = setInterval(loadDoctors, 5000);
    const unsub = realtimeBroker.subscribe('doctors-update', loadDoctors);
    return () => {
      clearInterval(pollInterval);
      unsub();
    };
  }, [user?.id, portalId]);

  const handleApproval = async (doctorId: string, status: 'accepted' | 'rejected') => {
    if (status === 'accepted') {
      await DatabaseService.approveDoctor(doctorId);
    } else {
      await DatabaseService.rejectDoctor(doctorId);
    }
    const updated = await DatabaseService.fetchDoctorsFromSupabase(portalId);
    setDoctors(updated);
  };

  const pendingDoctors = doctors.filter(d => d.approvalStatus === 'pending');

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.specialty) return;

    DatabaseService.addDoctor({
      name: formData.name,
      email: formData.email,
      specialty: formData.specialty,
      clinicName: formData.clinicName || user?.hospitalName || 'General OPD',
      hospitalId: portalId,
      approvalStatus: 'accepted'
    });

    setShowAddModal(false);
    setFormData({ name: '', email: '', specialty: '', clinicName: '' });
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    DatabaseService.updateDoctor({
      ...editingDoctor,
      name: formData.name,
      email: formData.email,
      specialty: formData.specialty,
      clinicName: formData.clinicName
    });

    setEditingDoctor(null);
    setFormData({ name: '', email: '', specialty: '', clinicName: '' });
  };

  const handleDeleteDoctor = (doctorId: string, doctorName: string) => {
    if (window.confirm(`Are you sure you want to remove Dr. ${doctorName} from your hospital?`)) {
      DatabaseService.deleteDoctor(doctorId);
    }
  };

  const startEdit = (doc: DoctorProfile) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      email: doc.email,
      specialty: doc.specialty,
      clinicName: doc.clinicName
    });
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            Manage Doctors & Clinicians
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Hospital Portal ID: <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{portalId}</span>
          </p>
        </div>

        <button 
          onClick={() => {
            setFormData({ name: '', email: '', specialty: '', clinicName: user?.hospitalName || 'General OPD' });
            setShowAddModal(true);
          }}
          className="btn-medical py-2 px-4 flex items-center gap-2 text-sm font-bold shadow-md"
        >
          <UserPlus className="h-4 w-4" /> Add New Doctor
        </button>
      </div>

      {/* 🚨 Pending Doctor Registration Requests Section */}
      {pendingDoctors.length > 0 && (
        <div className="glass-card p-6 rounded-3xl bg-amber-50/70 border border-amber-300 space-y-4 shadow-md animate-slide-down">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-amber-600 animate-spin" />
              Pending Doctor Registration Requests ({pendingDoctors.length})
            </h3>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Requires Admin Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDoctors.map(doc => (
              <div key={doc.id} className="p-4 bg-white rounded-2xl border border-amber-200 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">{doc.name}</h4>
                    {doc.medicalRegNumber && (
                      <span className="text-[10px] font-mono text-slate-500 block">Reg No: {doc.medicalRegNumber}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                    {doc.specialty}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p><strong>Department:</strong> {doc.department || doc.specialty}</p>
                  <p><strong>Medical Email:</strong> {doc.email}</p>
                  <p><strong>Hospital Portal ID:</strong> <span className="font-mono text-teal-800 font-bold">{doc.hospitalId || portalId}</span></p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApproval(doc.id, 'accepted')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Doctor
                  </button>
                  <button
                    onClick={() => handleApproval(doc.id, 'rejected')}
                    className="py-2 px-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-premium">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search doctor by name, specialty, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 focus:outline-none bg-transparent"
          />
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Building className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No doctors registered yet under your hospital.</p>
            <p className="text-xs text-slate-400">Click "Add New Doctor" above to create doctor profiles for your hospital.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Doctor Name & ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Specialty & Department</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Approval Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{doc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-teal-700 block">{doc.specialty}</span>
                      <span className="text-[11px] text-slate-400">{doc.clinicName}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{doc.email}</td>
                    <td className="p-4">
                      {doc.approvalStatus === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          <Clock className="h-3.5 w-3.5" /> Pending Approval
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
                      <div className="flex items-center justify-end gap-2">
                        {doc.approvalStatus === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproval(doc.id, 'accepted')}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                              title="Approve Doctor"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleApproval(doc.id, 'rejected')}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                              title="Reject Doctor"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => startEdit(doc)}
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                          title="Edit Doctor"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                          title="Delete Doctor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      {(showAddModal || editingDoctor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">
              {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor to Hospital'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {editingDoctor ? 'Update doctor credentials and specialty.' : `Directly register a doctor under Portal ID ${portalId}.`}
            </p>

            <form onSubmit={editingDoctor ? handleUpdateDoctor : handleAddDoctor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Doctor Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Specialty</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cardiology / Orthopedics / Pediatrics"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="doctor@hospital.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Clinic / OPD Unit Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. OPD Block A - Cardiology"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDoctor(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-medical py-2.5 font-bold text-sm"
                >
                  {editingDoctor ? 'Save Changes' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

