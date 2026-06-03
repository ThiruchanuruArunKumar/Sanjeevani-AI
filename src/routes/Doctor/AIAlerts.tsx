// src/routes/Doctor/AIAlerts.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile, realtimeBroker } from '../../services/db';
import { AlertCircle, ShieldAlert, Heart, Activity } from 'lucide-react';

interface AIAlertsProps {
  onNavigate: (view: string) => void;
}

export const AIAlerts: React.FC<AIAlertsProps> = ({ onNavigate }) => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);

  const loadData = () => {
    setPatients(DatabaseService.getPatients());
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime database updates
    const unsubscribe = realtimeBroker.subscribe('patients-update', () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const criticalPatients = patients.filter(p => p.vitals.systolicBP > 140 || p.vitals.oxygenSat < 95);
  const lowAdherencePats = patients.filter(p => DatabaseService.getAdherenceScore(p.id) < 80);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Safety Alerts</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time critical vitals and medication adherence watchlist.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Critical Vitals Alerts Panel */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-left border border-rose-500/10 shadow-premium flex flex-col h-full">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Heart className="h-5.5 w-5.5 text-rose-500 animate-pulse" />
              Critical Vitals Watchlist
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Patients currently requiring immediate clinical assessment.</p>
          </div>
          
          <div className="flex-1 space-y-4">
            {criticalPatients.length === 0 ? (
              <div className="py-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-2">
                <Activity className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-slate-700">No Critical Vitals Flagged</h4>
                <p className="text-xs text-slate-400 font-medium">All active patient telemetry is within stable limits.</p>
              </div>
            ) : (
              criticalPatients.map(p => (
                <div key={p.id} className="p-4 rounded-2xl bg-rose-50 border border-rose-500/20 flex flex-col gap-3.5 items-start medical-glow-active">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5.5 w-5.5 text-rose-600 shrink-0" />
                    <span className="text-sm font-bold text-rose-900 block">AI Intervention Recommendation</span>
                  </div>
                  <div className="w-full text-left">
                    <span className="text-xs leading-relaxed text-rose-800 block">
                      Patient <span className="font-bold">{p.name} ({p.id})</span> has critical vitals (Systolic BP: <span className="font-bold">{p.vitals.systolicBP} mmHg</span>, O₂: <span className="font-bold">{p.vitals.oxygenSat}%</span>). Please ensure prescribing safety audit is performed before administering any new medication.
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate(`doctor/patient/${p.id}`)}
                    className="mt-2 px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-all"
                  >
                    Assess Patient Records
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medication Adherence Alerts Panel */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 text-left border border-amber-500/10 shadow-premium flex flex-col h-full">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ShieldAlert className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
              Medication Adherence Watchlist
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Patients trending below the 80% minimum compliance threshold.</p>
          </div>
          
          <div className="flex-1 space-y-4">
            {lowAdherencePats.length === 0 ? (
              <div className="py-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-2">
                <Activity className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-slate-700">Excellent Medication Compliance</h4>
                <p className="text-xs text-slate-400 font-medium">All active patients are adhering to their prescription schedules.</p>
              </div>
            ) : (
              lowAdherencePats.map(p => {
                const score = DatabaseService.getAdherenceScore(p.id);
                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-500/20 flex flex-col gap-3.5 items-start medical-glow-active">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="h-5.5 w-5.5 text-amber-600 shrink-0" />
                      <span className="text-sm font-bold text-amber-900 block">Compliance Warning</span>
                    </div>
                    <div className="w-full text-left">
                      <span className="text-xs leading-relaxed text-amber-800 block">
                        Patient <span className="font-bold">{p.name} ({p.id})</span> has a compliance score of <span className="font-bold text-rose-600">{score.toFixed(0)}%</span>. Review schedules and provide patient guidance.
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate(`doctor/patient/${p.id}`)}
                      className="mt-2 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold transition-all"
                    >
                      Review Prescription Logs
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
