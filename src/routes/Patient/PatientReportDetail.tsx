// src/routes/Patient/PatientReportDetail.tsx
import React, { useEffect, useState } from 'react';
import { DatabaseService, UploadedReport } from '../../services/db';
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Download,
  Calendar,
  User,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

interface PatientReportDetailProps {
  reportId: string;
  onNavigate: (view: string) => void;
}

// Derive risk findings from parsed summary text
function deriveRiskFindings(summary: string): {
  critical: string[];
  warnings: string[];
  normal: string[];
} {
  const critical: string[] = [];
  const warnings: string[] = [];
  const normal: string[] = [];

  const lines = summary.split(/[.;]/).map(s => s.trim()).filter(Boolean);

  const criticalKeywords = ['critical', 'impairment', 'elevated', 'abnormal', 'stage 3', 'stage 4', 'severe', 'high risk', 'alert'];
  const warningKeywords   = ['requiring', 'review', 'avoidance', 'monitor', 'borderline', 'mild', 'low'];
  const normalKeywords    = ['within acceptable', 'normal', 'stable', 'within range', 'wnl'];

  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (criticalKeywords.some(k => lower.includes(k))) {
      critical.push(line);
    } else if (warningKeywords.some(k => lower.includes(k))) {
      warnings.push(line);
    } else if (normalKeywords.some(k => lower.includes(k))) {
      normal.push(line);
    } else if (line.length > 5) {
      normal.push(line);
    }
  });

  return { critical, warnings, normal };
}

function categoryColor(category: UploadedReport['category']) {
  const map: Record<string, string> = {
    'Lab Report':  'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Cardiology':  'bg-rose-50 text-rose-700 border-rose-200',
    'Radiology':   'bg-purple-50 text-purple-700 border-purple-200',
    'General':     'bg-slate-100 text-slate-700 border-slate-200',
  };
  return map[category] ?? 'bg-slate-100 text-slate-700 border-slate-200';
}

export const PatientReportDetail: React.FC<PatientReportDetailProps> = ({ reportId, onNavigate }) => {
  const [report, setReport] = useState<UploadedReport | null>(null);

  useEffect(() => {
    const all = DatabaseService.getReports();
    const found = all.find(r => r.id === reportId) ?? null;
    setReport(found);
  }, [reportId]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-slate-300" />
        </div>
        <h2 className="text-lg font-black text-slate-700">Report Not Found</h2>
        <p className="text-sm text-slate-400">This report may have been removed or the link is invalid.</p>
        <button
          onClick={() => onNavigate('patient/history')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>
      </div>
    );
  }

  const { critical, warnings, normal } = deriveRiskFindings(report.parsedSummary ?? '');
  const hasCritical = critical.length > 0;

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">

      {/* Back Navigation */}
      <button
        onClick={() => onNavigate('patient/history')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Clinical History
      </button>

      {/* Header */}
      <div className="glass-card p-8 rounded-3xl space-y-5 relative overflow-hidden">
        {/* Decorative glow for critical reports */}
        {hasCritical && (
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-400/8 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl border ${hasCritical ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 leading-tight">{report.title}</h1>
              <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${categoryColor(report.category)}`}>
                {report.category}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all shrink-0 shadow-premium"
            onClick={() => alert('Download feature: In production this would download the original file.')}
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        {/* Meta info row */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 font-semibold">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Uploaded on {report.date}
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <User className="h-3.5 w-3.5 text-primary" />
            {report.uploaderName}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-700 font-bold">AI Verified</span>
          </span>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {hasCritical && (
        <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex gap-4 items-start animate-slide-down">
          <div className="p-2 bg-rose-100 rounded-xl shrink-0">
            <AlertTriangle className="h-6 w-6 text-rose-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-rose-800 mb-1">⚠ Critical Findings Detected</h3>
            <p className="text-xs text-rose-700 font-medium leading-relaxed">
              AI analysis identified critical parameters in this report. Please consult your doctor immediately.
            </p>
            <ul className="mt-2 space-y-1">
              {critical.map((c, i) => (
                <li key={i} className="text-xs text-rose-800 font-bold flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: AI Summary + Risk Analysis */}
        <div className="lg:col-span-8 space-y-6">

          {/* AI OCR Extraction Summary */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              AI Lab Analysis Summary
            </h2>

            {report.parsedSummary ? (
              <div className="p-5 bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100 rounded-2xl">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  AI-Extracted Lab Parameters
                </p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {report.parsedSummary}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No AI summary available for this report.</p>
            )}

            {/* Risk parameter breakdown */}
            {(critical.length > 0 || warnings.length > 0 || normal.length > 0) && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Parameter Risk Analysis
                </h3>

                {critical.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Critical</span>
                    {critical.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-rose-800 font-semibold leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {warnings.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Requires Attention</span>
                    {warnings.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-amber-800 font-semibold leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {normal.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Within Range</span>
                    {normal.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-emerald-800 font-semibold leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor Notes */}
          {report.notes && (
            <div className="glass-card p-6 rounded-3xl space-y-3">
              <h2 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Doctor Notes
              </h2>
              <div className="p-4 bg-teal-50/40 border border-teal-500/10 rounded-2xl">
                <p className="text-sm text-slate-700 leading-relaxed font-medium italic">"{report.notes}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div className="lg:col-span-4 space-y-5">

          {/* Report Details Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2">Report Details</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Report ID</span>
                <span className="font-mono font-bold text-slate-700 text-[10px]">{report.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Category</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${categoryColor(report.category)}`}>{report.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Date</span>
                <span className="font-bold text-slate-700">{report.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Lab Source</span>
                <span className="font-bold text-slate-700 text-right max-w-[120px] leading-tight">{report.uploaderName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">AI Status</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Risk Score Summary */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Risk Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Critical Flags</span>
                <span className={`font-extrabold ${critical.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {critical.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Warnings</span>
                <span className={`font-extrabold ${warnings.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {warnings.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Normal Parameters</span>
                <span className="font-extrabold text-emerald-600">{normal.length}</span>
              </div>
            </div>
            <div className={`text-center text-[10px] py-2 px-3 rounded-xl font-black border uppercase tracking-wider ${
              hasCritical
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : warnings.length > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {hasCritical ? '🔴 Critical Review Required' : warnings.length > 0 ? '🟡 Follow Up Needed' : '🟢 Results Acceptable'}
            </div>
          </div>

          {/* Quick Action */}
          <button
            onClick={() => onNavigate('patient/history')}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-500/20 rounded-2xl text-xs font-bold text-slate-700 hover:text-primary transition-all"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Lab Reports
            </span>
            <span className="text-slate-300">→</span>
          </button>
        </div>
      </div>

    </div>
  );
};
