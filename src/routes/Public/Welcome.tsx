// src/routes/Public/Welcome.tsx — Production-Grade Role Portal Selection Screen
import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  User, 
  ArrowRight,
  QrCode,
  Sparkles,
  Building,
  HeartPulse,
  Lock
} from 'lucide-react';

interface WelcomeProps {
  onNavigate: (view: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  const [quickLookupId, setQuickLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  const handleEmergencyLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const lookupId = quickLookupId.trim().toUpperCase();
    if (DatabaseService.getPatientById(lookupId)) {
      onNavigate(`emergency/details?id=${lookupId}`);
    } else {
      setLookupError('No matching record found. Please verify the Patient ID.');
      setTimeout(() => setLookupError(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center">
      <div className="max-w-md mx-auto w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-5 relative overflow-x-hidden shadow-2xl border-x border-slate-200/60 dark:border-slate-800/80">
        
        {/* Background Glow Badges */}
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />


      {/* Top App Bar */}
      <header className="flex justify-between items-center z-10 py-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 backdrop-blur-md flex items-center justify-center p-1.5 border border-teal-200/60 dark:border-teal-800">
            <img src="/logo.png" alt="Sanjeevani AI" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight uppercase text-slate-900 dark:text-white block leading-none">
              Sanjeevani <span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider block mt-0.5">
              Clinical Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('admin/login')} 
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-700 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all shadow-xs"
          >
            Admin
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-lg mx-auto w-full flex flex-col justify-center py-8 z-10 space-y-6">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-[11px] font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
            Next-Gen Healthcare Portal
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Select Your <br />
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Portal Access
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-medium">
            Realtime AI drug safety audit, clinical decision assistance, and first-responder emergency QR pass system.
          </p>
        </div>

        {/* 3 MNC Role Cards */}
        <div className="space-y-3.5 pt-2">
          
          {/* Card 1: Patient Portal */}
          <button 
            onClick={() => onNavigate('patient/login')} 
            className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-900/60 hover:border-teal-400 shadow-md hover:shadow-lg flex items-center justify-between text-left group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800 shrink-0">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">Patient Portal</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                  View Vitals, OTP Sign In & Hospital Account Activation
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Card 2: Doctor Portal */}
          <button 
            onClick={() => onNavigate('doctor/login')} 
            className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-400 shadow-md hover:shadow-lg flex items-center justify-between text-left group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shrink-0">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">Healthcare Clinician</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                  Doctor Login, Patient Queue & AI Prescriber
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Card 3: Hospital Admin */}
          <button 
            onClick={() => onNavigate('admin/login')} 
            className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 shadow-md hover:shadow-lg flex items-center justify-between text-left group active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 dark:text-white block">Hospital Administrator</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                  Walk-In Registrations & Doctor Approval Queue
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

        </div>

        {/* Emergency Search Bar */}
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-left space-y-2.5 shadow-xs">
          <label className="text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />
            First Responder Emergency Pass Lookup
          </label>
          <form onSubmit={handleEmergencyLookup} className="flex gap-2">
            <input 
              type="text" 
              placeholder='Enter Patient ID (e.g. SJV-PAT-1000013)' 
              value={quickLookupId}
              onChange={(e) => setQuickLookupId(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
            />
            <button 
              type="submit" 
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs flex items-center gap-1 active:scale-95 transition-all shrink-0 shadow-xs"
            >
              <QrCode className="h-4 w-4" />
              Scan
            </button>
          </form>
          {lookupError && (
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block animate-pulse">{lookupError}</span>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-3 text-center border-t border-slate-200/80 dark:border-slate-800 z-10">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Sanjeevani AI • Production Clinical Platform
        </span>
      </footer>

      </div>
    </div>
  );
};


