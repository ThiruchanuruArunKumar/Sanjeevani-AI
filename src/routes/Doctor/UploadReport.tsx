// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Doctor\UploadReport.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile } from '../../services/db';
import { 
  Upload, 
  FileText, 
  User, 
  CheckCircle, 
  ShieldCheck, 
  Cpu, 
  ArrowLeft,
  Settings,
  Plus
} from 'lucide-react';

interface UploadReportProps {
  initialPatientId?: string;
  onNavigate: (view: string) => void;
}

export const UploadReport: React.FC<UploadReportProps> = ({ initialPatientId = '', onNavigate }) => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || 'SJV-PAT-000001');
  
  const [reportTitle, setReportTitle] = useState('Comprehensive Renal Function Panel');
  const [category, setCategory] = useState<any>('Lab Report');
  
  // File upload simulator state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileName, setFileName] = useState('');

  // AI OCR simulator state
  const [aiOcrActive, setAiOcrActive] = useState(false);
  const [parsedSummary, setParsedSummary] = useState('');
  const [clinicianNotes, setClinicianNotes] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setPatients(DatabaseService.getPatients());
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    simulateUpload('kidney_panel_v2.pdf');
  };

  const simulateUpload = (name: string) => {
    setFileName(name);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
    setAiOcrActive(false);

    // Simulate progress bar filling
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          // Trigger OCR Scanner simulation after file uploaded
          simulateOcrAnalysis();
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const simulateOcrAnalysis = () => {
    setAiOcrActive(true);
    setParsedSummary('Analyzing parameters...');

    setTimeout(() => {
      // Seed high-fidelity OCR parameters based on selected title
      if (reportTitle.toLowerCase().includes('renal') || reportTitle.toLowerCase().includes('kidney')) {
        setParsedSummary(
          'eGFR: 52 mL/min (Indicating Stage 3 Kidney Impairment). Serum Creatinine: 1.4 mg/dL (Elevated). BUN: 22 mg/dL. Electrolytes balanced.'
        );
        setClinicianNotes('Avoid high-dose NSAIDs. Ensure Metformin is held if iodinated contrast is scheduled.');
      } else if (reportTitle.toLowerCase().includes('lipid') || reportTitle.toLowerCase().includes('cholesterol')) {
        setParsedSummary(
          'Total Cholesterol: 245 mg/dL (High). LDL: 165 mg/dL (Elevated). HDL: 42 mg/dL (Borderline). Triglycerides: 190 mg/dL.'
        );
        setClinicianNotes('Start diet modifications. Consider low-dose Statin under cardiological review.');
      } else {
        setParsedSummary(
          'Hemoglobin: 14.2 g/dL. White Blood Cell (WBC) Count: 6.8 x10^3/µL. Platelets: 250,000/µL. All core parameters within normal clinical ranges.'
        );
        setClinicianNotes('Overall health indicators stable.');
      }
      setAiOcrActive(false);
    }, 1500);
  };

  const handleSaveReport = () => {
    if (!uploadComplete) {
      alert('Please upload a diagnostic document file first.');
      return;
    }

    DatabaseService.uploadReport(
      selectedPatientId,
      reportTitle,
      category,
      parsedSummary,
      clinicianNotes
    );

    setSaveSuccess(true);
    setFileName('');
    setUploadComplete(false);
    setParsedSummary('');
    setClinicianNotes('');

    setTimeout(() => {
      setSaveSuccess(false);
      onNavigate(`doctor/patient/${selectedPatientId}`);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('doctor/dashboard')} 
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Lab Report Digitizer</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upload patient diagnostic files and extract clinical findings automatically using AI OCR.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-500/10 rounded-2xl animate-pulse">
          Lab report archived & synchronized with real-time patient alert dispatch! Redirecting to medical history...
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Drag-and-Drop */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              Document Upload Parameters
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Select Patient</label>
                  <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Report Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                  >
                    <option value="Lab Report">Lab Report (Renal, Metabolic, Blood)</option>
                    <option value="Cardiology">Cardiology (ECG, Stress Test)</option>
                    <option value="Radiology">Radiology (CT, X-Ray, MRI)</option>
                    <option value="General">General Medical History</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Diagnostic Report Title</label>
                <input 
                  type="text" 
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Drag and drop zone */}
              <div className="space-y-1 text-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Diagnostic Attachment</label>
                
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => simulateUpload('lipid_profile_report_2026.pdf')}
                  className="p-8 border-2 border-dashed border-teal-500/20 hover:border-primary rounded-2xl bg-slate-50/50 hover:bg-teal-50/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-all">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Drag & drop lab report file here</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Supports PDF, JPG, PNG up to 10MB • Or click to auto-upload mock file</span>
                  </div>
                </div>
              </div>

              {/* Progress bar loader */}
              {isUploading && (
                <div className="p-4 bg-teal-50/50 border border-teal-500/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-primary">
                    <span>Uploading attachment {fileName}...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadComplete && (
                <div className="p-4 bg-emerald-50/40 border border-emerald-500/10 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 animate-bounce" />
                    Uploaded: {fileName}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">Ready for Sync</span>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column: AI OCR Data Extraction Panel */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-indigo-500/20 shadow-premium relative overflow-hidden text-left">
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-indigo-50 text-[10px] font-bold text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-500/10">
              <Cpu className="h-3.5 w-3.5 animate-pulse" />
              OCR Engine
            </div>

            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              AI Optical Character Scanner
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              Extracts chemical measurements, kidney filtration metrics, and hemoglobin results instantly.
            </p>

            <div className="mt-8 space-y-5">
              {/* Scan summary display */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">OCR Parameters Extracted</label>
                {aiOcrActive ? (
                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center gap-2.5 text-slate-400 font-medium">
                    <Settings className="h-5 w-5 animate-spin text-indigo-500" />
                    <span className="text-[10px]">Processing document OCR matrices...</span>
                  </div>
                ) : parsedSummary ? (
                  <div className="p-4 bg-indigo-50/20 border border-indigo-500/10 text-slate-800 text-xs font-semibold rounded-xl leading-relaxed">
                    {parsedSummary}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-[10px] font-semibold">
                    Upload a file on the left to trigger the automated AI scanning.
                  </div>
                )}
              </div>

              {parsedSummary && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Clinician Interpretation Notes</label>
                    <textarea 
                      value={clinicianNotes}
                      onChange={(e) => setClinicianNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white h-24"
                    />
                  </div>

                  <button 
                    onClick={handleSaveReport}
                    className="btn-medical bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-full py-3 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Save & Sync Diagnostic Report
                  </button>
                </>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
