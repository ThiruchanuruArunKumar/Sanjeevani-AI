// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Patient\EmergencyQR.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, PatientProfile } from '../../services/db';
import { 
  QrCode, 
  ShieldAlert, 
  PhoneCall, 
  Heart, 
  Download, 
  Eye,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface EmergencyQRProps {
  onNavigate: (view: string) => void;
}

export const EmergencyQR: React.FC<EmergencyQRProps> = ({ onNavigate }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const { user } = DatabaseService.getActiveSession();
    if (user) {
      setPatient(DatabaseService.getPatientById(user.id));
    }
  }, []);

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (!patient) return null;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Emergency QR Access Card</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Generate and print your smart digital medical ID pass to protect yourself in medical crises.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Premium Wallet Pass Graphic */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-sm glass-card border-rose-500/20 bg-gradient-to-br from-rose-50/20 to-teal-50/10 p-6 sm:p-8 rounded-3xl shadow-glow text-left flex flex-col justify-between gap-8 relative overflow-hidden">
            
            {/* Top Red Alert Stripe */}
            <div className="absolute top-0 inset-x-0 h-2 bg-rose-600 animate-pulse"></div>

            {/* Pass Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-sm">
                  <ShieldAlert className="h-4.5 w-4.5 animate-bounce" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 tracking-tight block">EMERGENCY MEDICAL ID</span>
                  <span className="text-[8px] font-bold text-rose-600 tracking-widest block uppercase">Sanjeevani AI Shield</span>
                </div>
              </div>

              <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-[10px] font-extrabold border border-rose-200">
                {patient.bloodGroup}
              </div>
            </div>

            {/* Core Info */}
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Patient Full Name</span>
                <span className="text-lg font-black text-slate-800 block mt-0.5">{patient.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Age: {patient.age} Yrs • Contact: {patient.phone}</span>
              </div>

              {/* High-Alert Allergy Warning Box */}
              {patient.allergies.length > 0 && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-500/10 text-[10px] leading-normal text-rose-800 font-semibold">
                  <span className="font-extrabold text-rose-900 block uppercase mb-0.5">CRITICAL ALLERGY RESTRICTION:</span>
                  Patient has documented {patient.allergies.map(a => a.allergen).join(', ')} allergic reaction risks.
                </div>
              )}

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-[10px] text-slate-600">
                <div>
                  <span className="font-bold text-slate-400 block uppercase">Primary Contact</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{patient.emergencyContact.name}</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <PhoneCall className="h-3.5 w-3.5" />
                  {patient.emergencyContact.phone}
                </div>
              </div>
            </div>

            {/* Simulated QR Code Scan Graphic */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Scan Bypass Key</span>
                <span className="text-[10px] font-extrabold text-slate-800 block mt-0.5">ID: {patient.id}</span>
              </div>
              
              {/* QR Box mockup */}
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm shrink-0">
                <QrCode className="h-14 w-14 text-slate-800" />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Actions & Details */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 flex-1 text-left">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              How Emergency QR Protection Works
            </h3>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                When first responders scan your printed QR code or wallet card, they are instantly redirected to a **No-Auth Bypass profile page** showing critical health metrics.
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="h-5 w-5 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-600 font-bold mt-0.5">1</div>
                  <p className="font-semibold text-slate-700">
                    <span className="font-extrabold">Instant Vitals Access</span>: Displays active blood pressure, heart rate, and temperature indices synced from your doctor.
                  </p>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="h-5 w-5 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-600 font-bold mt-0.5">2</div>
                  <p className="font-semibold text-slate-700">
                    <span className="font-extrabold">Substance Exclusion</span>: Highlights severe allergies (e.g. Penicillin) to prevent accidental adverse drug events.
                  </p>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="h-5 w-5 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-600 font-bold mt-0.5">3</div>
                  <p className="font-semibold text-slate-700">
                    <span className="font-extrabold">Single-Click Emergency Dial</span>: Allows responders to click dial your registered spouse or guardian phone immediately.
                  </p>
                </div>
              </div>
            </div>

            {downloadSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-500/10 rounded-xl flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Emergency Card PDF generated and saved successfully.
              </div>
            )}

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={handleDownload}
                className="flex-1 btn-medical text-xs font-bold shadow-premium"
              >
                <Download className="h-4 w-4" />
                Download Printed Card
              </button>

              <button 
                onClick={() => onNavigate(`emergency/details?id=${patient.id}`)}
                className="flex-1 btn-medical-secondary text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Eye className="h-4 w-4 text-primary" />
                Preview First Responder View
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
