import React, { useState, useEffect } from 'react';
import { DatabaseService, ConsultationNote, realtimeBroker } from '../../services/db';
import { FileText, CheckCircle2, Clock, Stethoscope, User, Search, AlertCircle, Pill, ClipboardList, Info } from 'lucide-react';

interface ConsultationNotesProps {
  onNavigate: (view: string) => void;
}

export const ConsultationNotes: React.FC<ConsultationNotesProps> = () => {
  const { user } = DatabaseService.getActiveSession();
  const portalId = user?.hospitalPortalId || user?.id || '';

  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'explained'>('all');
  const [selectedNote, setSelectedNote] = useState<ConsultationNote | null>(null);

  useEffect(() => {
    if (!user || !portalId) return;

    const loadNotes = () => {
      const hospitalNotes = DatabaseService.getConsultationNotes(portalId);
      setNotes(hospitalNotes);
    };

    loadNotes();
    const unsub = realtimeBroker.subscribe('consultation-notes-update', loadNotes);
    return () => unsub();
  }, [user?.id, portalId]);

  const handleMarkExplained = (noteId: string) => {
    DatabaseService.markConsultationNoteExplained(noteId);
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({
        ...selectedNote,
        status: 'explained',
        explainedAt: new Date().toISOString()
      });
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.patientName.toLowerCase().includes(search.toLowerCase()) ||
      n.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      n.diagnosis.toLowerCase().includes(search.toLowerCase());

    if (filterTab === 'pending') return matchesSearch && n.status === 'pending_explanation';
    if (filterTab === 'explained') return matchesSearch && n.status === 'explained';
    return matchesSearch;
  });

  const pendingCount = notes.filter(n => n.status === 'pending_explanation').length;
  const explainedCount = notes.filter(n => n.status === 'explained').length;

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600" />
            Patient Consultation Notes & Discharge
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Review doctor consultation notes, explain prescribed treatment to patients, and mark as 'Explained'.
          </p>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl shrink-0">
          <button 
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            All ({notes.length})
          </button>
          <button 
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Unexplained ({pendingCount})
          </button>
          <button 
            onClick={() => setFilterTab('explained')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterTab === 'explained' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Explained ({explainedCount})
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card overflow-hidden rounded-3xl border-teal-500/20 shadow-premium">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search notes by patient, doctor, or diagnosis..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 focus:outline-none bg-transparent"
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Info className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No consultation notes found.</p>
            <p className="text-xs text-slate-400">
              When doctors complete consultations, notes will automatically populate here for reception/admin explanation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Patient Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Attending Doctor</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Diagnosis</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map(n => (
                  <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">
                      {n.patientName}
                      <span className="block text-[10px] text-slate-400 font-mono">{n.patientId}</span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-700">
                      Dr. {n.doctorName}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600 max-w-[220px] truncate">
                      {n.diagnosis}
                    </td>
                    <td className="p-4">
                      {n.status === 'pending_explanation' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          <Clock className="h-3.5 w-3.5" /> Pending Explanation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Explained to Patient
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedNote(n)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                        >
                          View Details
                        </button>
                        {n.status === 'pending_explanation' && (
                          <button 
                            onClick={() => handleMarkExplained(n.id)}
                            className="btn-medical py-1.5 px-3 text-xs font-bold"
                          >
                            Mark as Explained
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-fade-in border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block">Consultation Record</span>
                <h3 className="text-xl font-black text-slate-800">Patient: {selectedNote.patientName}</h3>
                <p className="text-xs text-slate-400 font-mono">Attending: Dr. {selectedNote.doctorName}</p>
              </div>
              <button 
                onClick={() => setSelectedNote(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Diagnosis Banner */}
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">Clinical Diagnosis</span>
              <p className="text-sm font-black text-slate-800">{selectedNote.diagnosis}</p>
            </div>

            {/* Prescribed Medicines */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="h-4 w-4 text-emerald-600" /> Prescribed Medicines
              </span>
              {selectedNote.prescribedMedicines && selectedNote.prescribedMedicines.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedNote.prescribedMedicines.map((med, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 block">{med.name} ({med.dosage})</span>
                        <span className="text-[10px] text-slate-400">{med.frequency} {med.foodInstruction ? `&bull; ${med.foodInstruction}` : ''}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                        {med.durationDays ? `${med.durationDays} Days` : 'As Prescribed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No medicines prescribed during this visit.</p>
              )}
            </div>

            {/* Recommended Tests */}
            {selectedNote.recommendedTests && selectedNote.recommendedTests.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-amber-500" /> Recommended Tests
                </span>
                <ul className="list-disc list-inside text-xs font-semibold text-slate-700 bg-amber-50/40 p-3 rounded-xl border border-amber-100 space-y-1">
                  {selectedNote.recommendedTests.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow Up Advice */}
            {selectedNote.followUpAdvice && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Follow-Up & Doctor Advice:</span>
                <p className="text-slate-600">{selectedNote.followUpAdvice}</p>
              </div>
            )}

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setSelectedNote(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
              >
                Close
              </button>
              {selectedNote.status === 'pending_explanation' && (
                <button 
                  onClick={() => handleMarkExplained(selectedNote.id)}
                  className="flex-1 btn-medical py-2.5 font-bold text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark as Explained
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
