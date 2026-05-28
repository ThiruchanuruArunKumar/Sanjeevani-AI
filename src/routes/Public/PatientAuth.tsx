// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Public\PatientAuth.tsx
import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { Stethoscope, Phone, MessageSquare, ArrowRight, ShieldCheck, Mail, AlertCircle } from 'lucide-react';

interface PatientAuthProps {
  onNavigate: (view: string) => void;
}

export const PatientAuth: React.FC<PatientAuthProps> = ({ onNavigate }) => {
  const [phone, setPhone] = useState('9876543210'); // Prefill Rohan's phone
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [smsSent, setSmsSent] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    const result = DatabaseService.requestPatientOTP(phone);
    if (result.success) {
      setStep('otp');
      setSmsSent(result.otp);
      setError('');
    } else {
      setError('Phone number not registered. Use preset "9876543210" or "9876543220" for simulation.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = DatabaseService.loginPatient(phone, otp);
    if (patient) {
      onNavigate('patient/dashboard');
    } else {
      setError('Invalid verification code. Enter "4582" to proceed.');
      setTimeout(() => setError(''), 4500);
    }
  };

  // Google single-sign on bypass (logs in Rohan Sharma)
  const handleGoogleAuth = () => {
    DatabaseService.loginPatient('9876543210', '4582');
    onNavigate('patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 flex items-center justify-center p-6 relative">
      
      {/* Back to home logo */}
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => onNavigate('welcome')}>
        <img src="/logo.png" alt="Sanjeevani AI" className="h-10 w-auto object-contain" />
      </div>

      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-3xl relative border-teal-500/20 shadow-premium">
          
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Sanjeevani AI" className="h-16 w-auto object-contain mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 leading-tight">Patient Health Portal</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Verify your identity to synchronize your active prescriptions and emergency cards.
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Registered Mobile Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="9876543210" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                  />
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200/50 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  {error}
                </div>
              )}

              <div className="p-3.5 bg-teal-50/60 text-slate-600 rounded-xl border border-teal-500/10 text-xs leading-relaxed font-medium">
                <span className="font-bold text-primary block">Patient Demo Presets:</span>
                • Rohan Sharma: <span className="font-semibold text-slate-800 bg-slate-100 px-1 py-0.5 rounded">9876543210</span> <span className="text-primary font-bold">(SJV-PAT-000001)</span> — Hypertension, Penicillin Allergy<br/>
                • Ananya Iyer: <span className="font-semibold text-slate-800 bg-slate-100 px-1 py-0.5 rounded">9876543220</span> <span className="text-primary font-bold">(SJV-PAT-000002)</span> — Asthma, Aspirin Sensitivity
              </div>

              <button type="submit" className="w-full btn-medical py-3 font-bold text-sm shadow-premium">
                Send OTP Verification
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Verification PIN (OTP)</label>
                  <button 
                    type="button" 
                    onClick={() => { setStep('phone'); setSmsSent(null); }}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter 4-digit code" 
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50 text-center"
                  />
                  <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {smsSent && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-500/10 flex flex-col gap-1 relative overflow-hidden animate-slide-up">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    SMS Dispatcher Simulator
                  </div>
                  <span className="text-[10px] leading-relaxed text-slate-500">
                    Sanjeevani SMS Sent to <span className="font-semibold text-slate-700">{phone}</span>: <br/>
                    "Your safety platform gateway access key is <span className="font-extrabold text-primary bg-emerald-100/50 px-1 py-0.5 rounded">{smsSent}</span>."
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200/50 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" className="w-full btn-medical py-3 font-bold text-sm shadow-premium">
                Verify PIN & Login
              </button>
            </form>
          )}

          {/* Social Google Auth Gate */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="relative flex justify-center text-xs uppercase mb-4">
              <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">Or Sign In With</span>
            </div>

            <button 
              onClick={handleGoogleAuth}
              className="w-full btn-medical-secondary py-3 flex items-center justify-center font-bold text-xs gap-2 shadow-sm border-slate-200/60 hover:bg-slate-50"
            >
              <Mail className="h-4.5 w-4.5 text-slate-500" />
              Continue with Google Account
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
