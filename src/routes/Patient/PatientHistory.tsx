// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Patient\PatientHistory.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile, ClinicalVisit, UploadedReport, realtimeBroker } from '../../services/db';
import { 
  Stethoscope, 
  FileText, 
  Calendar, 
  Pill, 
  ChevronRight, 
  ShieldCheck,
  User,
  Heart,
  TrendingUp
} from 'lucide-react';

interface PatientHistoryProps {
  onNavigate: (view: string) => void;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({ onNavigate }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [visits, setVisits] = useState<ClinicalVisit[]>([]);
  const [reports, setReports] = useState<UploadedReport[]>([]);

  // Feedback State
  const [feedbackVisitId, setFeedbackVisitId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');

  const loadData = () => {
    const { user } = DatabaseService.getActiveSession();
    if (user) {
      setPatient(DatabaseService.getPatientById(user.id));
      setVisits(DatabaseService.getVisits(user.id));
      setReports(DatabaseService.getReports(user.id));
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime database updates for this patient
    const { user } = DatabaseService.getActiveSession();
    if (!user) return;

    const unsubscribe = realtimeBroker.subscribe(`patient-${user.id}`, () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!patient) return null;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Clinical History & Archives</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Review your complete diagnostic timeline, clinical visits, and laboratory summaries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Timeline: Clinical Consultations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Clinical Consultation Timeline
            </h3>

            <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {visits.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-xs text-slate-400 font-semibold block">No clinical visits logged.</span>
                </div>
              ) : (
                visits.map((visit) => (
                  <div key={visit.id} className="relative pl-12 group">
                    
                    {/* Timeline dot icon */}
                    <div className="absolute left-3 top-1.5 h-6 w-6 rounded-full border-2 border-white bg-teal-50 flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-all">
                      <Stethoscope className="h-3 w-3" />
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold text-slate-800 text-sm">{visit.reasonForVisit}</span>
                        <span className="font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {visit.date}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs leading-relaxed text-slate-600">
                        <div>
                          <span className="font-bold text-slate-400">Diagnosis:</span>
                          <span className="font-bold text-slate-800 ml-1.5">{visit.diagnosis}</span>
                        </div>

                        {visit.notes && (
                          <div>
                            <span className="font-bold text-slate-400 block mb-0.5">Clinical Examination Notes:</span>
                            <p className="text-slate-600 italic">{visit.notes}</p>
                          </div>
                        )}

                        {visit.prescriptions && (
                          <div className="border-t border-slate-200/60 pt-2.5 mt-2.5 flex flex-col gap-2">
                            <span className="font-bold text-slate-400 flex items-center gap-1">
                              <Pill className="h-3.5 w-3.5 text-primary" /> Active Prescription Drugs
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {visit.prescriptions.drugs.map((drug, i) => (
                                <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-bold rounded-lg text-slate-700">
                                  {drug.name} ({drug.dosage}) - {drug.frequency}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t border-slate-200/60 pt-3 mt-3">
                          {visit.feedbackId ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <ShieldCheck className="h-3 w-3" /> Feedback Submitted
                            </span>
                          ) : feedbackVisitId === visit.id ? (
                            <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-3">
                              <h5 className="text-[10px] font-bold text-slate-600 uppercase">Consultation Feedback</h5>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Rating (1-5)</label>
                                <input 
                                  type="number" 
                                  min="1" max="5" 
                                  value={feedbackRating}
                                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Feedback / Experience</label>
                                <textarea 
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => setFeedbackVisitId(null)}
                                  className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => {
                                    if (feedbackText.trim() !== '') {
                                      DatabaseService.addConsultationFeedback(
                                        visit.id,
                                        patient.id,
                                        visit.doctorId,
                                        feedbackText,
                                        feedbackRating
                                      );
                                      setFeedbackVisitId(null);
                                    }
                                  }}
                                  className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setFeedbackVisitId(visit.id);
                                setFeedbackRating(5);
                                setFeedbackText('');
                              }}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <Stethoscope className="h-3 w-3" /> Provide Doctor Feedback
                            </button>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Timeline: Digitized Lab Reports */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              My Laboratory Reports
            </h3>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-400">No laboratory files catalogued.</span>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{report.title}</h4>
                        <span className="text-[9px] text-indigo-600 font-bold block mt-0.5">{report.category}</span>
                        <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Uploaded {report.date}</span>
                      </div>
                    </div>

                    {report.parsedSummary && (
                      <div className="p-2.5 bg-white border border-indigo-50 rounded-lg text-[10px] leading-relaxed text-slate-500 font-semibold">
                        <span className="font-extrabold text-indigo-800 block mb-0.5 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> AI OCR Extraction Summary:
                        </span>
                        {report.parsedSummary}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
