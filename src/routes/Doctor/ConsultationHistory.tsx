// src/routes/Doctor/ConsultationHistory.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, ConsultationNote, ClinicalVisit, UploadedReport, realtimeBroker } from '../../services/db';
import { History, Calendar, User, FileText, Pill, Stethoscope, Search, CheckCircle, ShieldCheck, Download, ExternalLink } from 'lucide-react';

interface ConsultationHistoryProps {
  onNavigate: (view: string) => void;
}

export const ConsultationHistory: React.FC<ConsultationHistoryProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const doctorPortalId = user?.hospitalId || user?.hospital_portal_id || user?.id || '';
  const doctorId = user?.id || '';

  const [consultations, setConsultations] = useState<ConsultationNote[]>([]);
  const [visits, setVisits] = useState<ClinicalVisit[]>([]);
  const [reportsMap, setReportsMap] = useState<Record<string, UploadedReport[]>>({});
  const [search, setSearch] = useState('');

  const loadHistory = () => {
    if (!user) return;

    // Fetch consultation notes for this hospital & doctor
    const allNotes = DatabaseService.getConsultationNotes(doctorPortalId);
    const myNotes = allNotes.filter(n => 
      n.doctorId === doctorId || 
      (n.doctorName && user.name && n.doctorName.toLowerCase() === user.name.toLowerCase())
    );
    setConsultations(myNotes);

    // Fetch clinical visits
    const allVisits = DatabaseService.getVisits().filter(v => v.doctorId === doctorId);
    setVisits(allVisits);

    // Load patient reports map
    const patientIds = Array.from(new Set(myNotes.map(n => n.patientId)));
    const map: Record<string, UploadedReport[]> = {};
    patientIds.forEach(pid => {
      map[pid] = DatabaseService.getReports(pid);
    });
    setReportsMap(map);
  };

  useEffect(() => {
    loadHistory();
    const unsubNotes = realtimeBroker.subscribe('consultation-notes-update', loadHistory);
    const unsubVisits = realtimeBroker.subscribe('visits-update', loadHistory);

    return () => {
      unsubNotes();
      unsubVisits();
    };
  }, [user?.id, doctorPortalId]);

  const filtered = consultations.filter(c => 
    c.patientName.toLowerCase().includes(search.toLowerCase()) ||
    c.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <History className="h-7 w-7 text-teal-600" />
            Consultation History
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Permanent, read-only record of all completed patient consultations for Hospital Portal ID <span className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{doctorPortalId}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>{consultations.length} Completed Consultations</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-card p-3 rounded-2xl flex items-center gap-3 border-teal-500/10 shadow-sm">
        <Search className="h-4 w-4 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search by patient name, diagnosis, or consultation ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm font-semibold text-slate-700 bg-transparent focus:outline-none"
        />
      </div>

      {/* Consultations List */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-3">
          <History className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No consultation history available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            When you perform consultations and click "Complete Consultation", permanent record entries will automatically populate here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const attachedReports = reportsMap[item.patientId] || [];
            const matchingVisit = visits.find(v => v.patientId === item.patientId && v.diagnosis === item.diagnosis);

            return (
              <div key={item.id} className="glass-card p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-sm hover:shadow-md transition-all">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-sm">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                        {item.patientName}
                        <button 
                          onClick={() => onNavigate(`doctor/patient/${item.patientId}`)}
                          className="text-[10px] text-teal-700 hover:underline font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-flex items-center gap-1"
                        >
                          View Patient Record <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">Consultation ID: {item.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/70">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Diagnosis & Symptoms */}
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                    <span className="font-extrabold text-teal-800 uppercase tracking-wider text-[10px] block">Diagnosis & Condition</span>
                    <p className="font-bold text-slate-800 text-sm">{item.diagnosis}</p>
                    {matchingVisit?.notes && (
                      <p className="text-slate-600 leading-relaxed italic">{matchingVisit.notes}</p>
                    )}
                  </div>

                  {/* Prescribed Medicines */}
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2">
                    <span className="font-extrabold text-teal-800 uppercase tracking-wider text-[10px] block flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5 text-teal-600" /> Prescribed Medicines
                    </span>
                    {item.prescribedMedicines.length === 0 ? (
                      <span className="text-slate-400 italic">No medicines prescribed</span>
                    ) : (
                      <div className="space-y-1.5">
                        {item.prescribedMedicines.map((m: any, idx: number) => (
                          <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200/70 flex justify-between items-center">
                            <span className="font-bold text-slate-800">{m.name || m.drugName}</span>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {m.dosage} • {m.frequency || `${m.morning?'M':''}${m.afternoon?'A':''}${m.night?'N':''}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Tests & Follow-up Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  {/* Recommended Tests */}
                  <div className="p-3.5 bg-teal-50/40 rounded-2xl border border-teal-100 space-y-1.5">
                    <span className="font-extrabold text-teal-900 uppercase tracking-wider text-[10px] block">Recommended Diagnostic Tests</span>
                    {item.recommendedTests && item.recommendedTests.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.recommendedTests.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white text-teal-800 border border-teal-200 text-[10px] font-bold rounded-lg">
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No diagnostic tests recommended</span>
                    )}
                  </div>

                  {/* Follow-Up Advice */}
                  <div className="p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100 space-y-1">
                    <span className="font-extrabold text-blue-900 uppercase tracking-wider text-[10px] block">Follow-Up Advice</span>
                    <p className="text-blue-950 font-medium leading-relaxed">
                      {item.followUpAdvice || 'Take medicines as directed and return if symptoms persist.'}
                    </p>
                  </div>
                </div>

                {/* Attached Reports View */}
                {attachedReports.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                    <span className="font-extrabold text-slate-600 uppercase tracking-wider text-[10px] block flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" /> Attached Laboratory & Diagnostic Reports ({attachedReports.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attachedReports.map(rep => (
                        <div key={rep.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">{rep.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{rep.category} • Uploaded by Admin</span>
                          </div>
                          {rep.fileUrl && (
                            <a 
                              href={rep.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Download className="h-3 w-3" /> View Report
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Read-Only Status Indicator */}
                <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle className="h-3.5 w-3.5" /> Complete Consultation Record
                  </span>
                  <span className="italic">Read-only historical document. Completed consultations cannot be modified.</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
