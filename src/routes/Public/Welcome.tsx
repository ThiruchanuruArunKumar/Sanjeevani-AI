// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Public\Welcome.tsx
import React, { useState } from 'react';
import { AISafetyEngine, Drug } from '../../services/ai';
import { DatabaseService } from '../../services/db';
import { 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  User, 
  Pill, 
  ShieldCheck, 
  Flame, 
  Compass, 
  Heart,
  QrCode,
  ArrowRight
} from 'lucide-react';

interface WelcomeProps {
  onNavigate: (view: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  const [selectedDrugA, setSelectedDrugA] = useState('warfarin');
  const [selectedDrugB, setSelectedDrugB] = useState('aspirin');
  const [hasAllergy, setHasAllergy] = useState(true);
  const [quickLookupId, setQuickLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  // Run on-page AI safety simulation
  const proposedDrugs: Drug[] = [
    { name: selectedDrugA, dosage: '10mg', frequency: 'Once daily' },
    { name: selectedDrugB, dosage: '325mg', frequency: 'Once daily' }
  ];

  const allergies = hasAllergy ? [{ allergen: 'Penicillin', severity: 'Severe' as const, reaction: 'Anaphylaxis' }] : [];
  if (selectedDrugA === 'amoxicillin' && hasAllergy) {
    allergies.push({ allergen: 'Penicillin', severity: 'Severe' as const, reaction: 'Anaphylaxis' });
  }

  const { alerts, riskLevel, riskScore } = AISafetyEngine.runCompleteSafetyAudit(
    proposedDrugs,
    allergies,
    ['Hypertension', 'Chronic Kidney Disease'],
    []
  );

  const handleEmergencyLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const lookupId = quickLookupId.trim();
    if (DatabaseService.getPatientById(lookupId)) {
      onNavigate(`emergency/details?id=${lookupId}`);
    } else {
      setLookupError('Invalid Patient ID. Please enter a valid registered ID.');
      setTimeout(() => setLookupError(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 flex flex-col justify-between">
      
      {/* Top Welcome Header */}
      <nav className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Sanjeevani AI" className="h-11 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onNavigate('admin/login')} 
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            Hospital Admin
          </button>
          <button 
            onClick={() => onNavigate('doctor/login')} 
            className="px-4 py-2 text-sm font-bold text-primary hover:bg-teal-50 rounded-xl transition-all"
          >
            Doctor Login
          </button>
          <button 
            onClick={() => onNavigate('patient/login')} 
            className="btn-medical text-xs sm:text-sm font-bold"
          >
            Patient Portal
          </button>
        </div>
      </nav>

      {/* Main Landing Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Premium Value Pitch */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-primary border border-teal-500/10 text-xs font-bold">
            <Compass className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
            Next-Gen Smart Healthcare Analytics
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
            AI-Powered <br />
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Drug Safety Monitoring
            </span> <br />
            & Emergency Sync.
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
            Sanjeevani AI is a premium clinical decision assistance platform connecting healthcare providers and patients. It detects harmful drug-drug interactions, cross-matches allergen profiles, and synchronizes medical alerts instantly in real-time.
          </p>

          {/* Quick Gates */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate('doctor/login')} 
              className="px-6 py-4 bg-accent hover:bg-accent-light text-white rounded-2xl flex items-center justify-center font-bold gap-3 shadow-premium active:scale-98 transition-all"
            >
              <User className="h-5 w-5" />
              I am a Healthcare Clinician
              <ArrowRight className="h-4 w-4" />
            </button>

            <button 
              onClick={() => onNavigate('patient/login')} 
              className="px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl flex items-center justify-center font-bold gap-3 shadow-sm active:scale-98 transition-all"
            >
              <Activity className="h-5 w-5 text-primary" />
              Patient Login (OTP)
            </button>
          </div>

          {/* First Responder Bypass */}
          <div className="pt-6 border-t border-slate-200/60 max-w-md">
            <form onSubmit={handleEmergencyLookup} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                EMERGENCY MEDICAL SCAN BYPASS (NO AUTH NEEDED)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder='Enter Patient ID (e.g. SJV-PAT-XXXXXX)' 
                  value={quickLookupId}
                  onChange={(e) => setQuickLookupId(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary text-sm font-semibold"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <QrCode className="h-4 w-4" />
                  View ID
                </button>
              </div>
              {lookupError && (
                <span className="text-xs font-semibold text-rose-600 block mt-1 animate-pulse">{lookupError}</span>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: AI interactive simulator widget */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 sm:p-8 rounded-3xl relative border-teal-500/20 shadow-premium medical-glow-active">
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-teal-50 text-[10px] font-bold text-primary px-2.5 py-1 rounded-full uppercase tracking-wider border border-teal-500/10">
              <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
              AI Safety Simulator
            </div>

            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Clinical Check Widget
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select two clinical compounds to analyze interaction risks instantly.
            </p>

            {/* Input Selectors */}
            <div className="space-y-4 mt-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">Proposed Medication</label>
                <select 
                  value={selectedDrugA} 
                  onChange={(e) => setSelectedDrugA(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                >
                  <option value="warfarin">Warfarin (Blood Thinner)</option>
                  <option value="lisinopril">Lisinopril (BP medication)</option>
                  <option value="metformin">Metformin (Diabetes drug)</option>
                  <option value="amoxicillin">Amoxicillin (Antibiotic)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">Medication 2 (In System)</label>
                <select 
                  value={selectedDrugB} 
                  onChange={(e) => setSelectedDrugB(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary"
                >
                  <option value="aspirin">Aspirin (Antiplatelet / Pain)</option>
                  <option value="spironolactone">Spironolactone (BP diuretic)</option>
                  <option value="ibuprofen">Ibuprofen (NSAID pain relief)</option>
                  <option value="metformin">Metformin (Diabetes drug)</option>
                </select>
              </div>

              {/* Patient Allergies Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-700 block">Cross Match Allergy Profiles</span>
                  <span className="text-[10px] text-slate-400 block">Simulates severe Penicillin allergy.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasAllergy} 
                    onChange={(e) => setHasAllergy(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Analysis Results Display */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">AI Safety Index Score</span>
                <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-full ${
                  riskLevel === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  riskLevel === 'elevated' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {riskLevel} ({riskScore}/100)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-550 ${
                    riskLevel === 'critical' ? 'bg-rose-500' :
                    riskLevel === 'elevated' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${riskScore}%` }}
                ></div>
              </div>

              {/* Alerts Log */}
              <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/40 rounded-xl border border-emerald-500/10 text-emerald-800 text-xs font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    No interactions or allergy conflicts. Safe for prescribing.
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                        alert.severity === 'critical' 
                          ? 'bg-rose-50/50 border-rose-500/10 text-rose-800' 
                          : 'bg-amber-50/50 border-amber-500/10 text-amber-800'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" />
                        {alert.title}
                      </span>
                      <span className="text-[10px] leading-relaxed text-slate-500">{alert.message}</span>
                      {alert.suggestedAlternative && (
                        <span className="text-[10px] leading-relaxed text-teal-800 bg-teal-50 rounded-lg p-1.5 mt-1 border border-teal-500/5 font-semibold">
                          Alternative: {alert.suggestedAlternative}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white/50 text-center">
        <img src="/logo.png" alt="Sanjeevani AI" className="h-10 w-auto object-contain mx-auto opacity-70" />
      </footer>

    </div>
  );
};
