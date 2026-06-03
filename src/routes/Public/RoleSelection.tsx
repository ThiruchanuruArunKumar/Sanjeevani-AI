import React from 'react';
import { Stethoscope, User, ShieldAlert, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface RoleSelectionProps {
  onNavigate: (view: string) => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Sanjeevani AI" className="h-9 w-auto object-contain" />
          <span className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Sanjeevani <span className="text-primary">AI</span></span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 text-slate-650 dark:text-slate-400 shadow-sm transition-all"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-teal-400" />}
        </button>
      </header>

      {/* Main Account Selector */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Choose Account Type</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Select your profile gateway to access the dashboard</p>
        </div>

        <div className="space-y-4">
          {/* Patient gateway card */}
          <button
            onClick={() => onNavigate('patient/login')}
            className="w-full flex items-center gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-premium active:scale-97 transition-all text-left group"
          >
            <div className="h-14 w-14 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">Patient Portal</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Submit side-effects, check vitals, view AI diagnostics & compliance logs.</p>
            </div>
          </button>

          {/* Doctor gateway card */}
          <button
            onClick={() => onNavigate('doctor/login')}
            className="w-full flex items-center gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-premium active:scale-97 transition-all text-left group"
          >
            <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 group-hover:scale-105 transition-transform">
              <Stethoscope className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">Clinician Workspace</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Perform drug-safety checks, analyze lab reports, and manage compliance alerts.</p>
            </div>
          </button>
        </div>

        {/* Emergency Scan Bypass */}
        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-900/20 p-4 rounded-2xl flex items-center gap-4 active:scale-98 transition-all cursor-pointer" onClick={() => onNavigate('emergency/scan')}>
          <div className="h-10 w-10 bg-rose-100 dark:bg-rose-950/50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Emergency Bypass</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-normal">Access patient record in trauma/critical situations</span>
          </div>
        </div>
      </div>

      {/* Admin Gateway & Footer */}
      <footer className="py-4 text-center flex flex-col items-center gap-3">
        <button
          onClick={() => onNavigate('admin/login')}
          className="text-xs text-slate-400 hover:text-primary dark:hover:text-teal-400 font-bold uppercase tracking-wider"
        >
          Hospital Admin Gateway
        </button>
        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">Sanjeevani AI v1.0.0</span>
      </footer>

    </div>
  );
};
