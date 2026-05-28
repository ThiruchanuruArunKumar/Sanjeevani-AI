// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Public\DoctorAuth.tsx
import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { Stethoscope, Lock, Mail, User, ShieldAlert, Award, Home, Compass } from 'lucide-react';

interface DoctorAuthProps {
  onNavigate: (view: string) => void;
}

export const DoctorAuth: React.FC<DoctorAuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('doctor@sanjeevani.ai');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology & AI Pharmacology');
  const [clinic, setClinic] = useState('Sanjeevani AI Hospital, Block C');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      try {
        const user = await DatabaseService.loginDoctor(email, password);
        if (user) {
          onNavigate('doctor/dashboard');
        } else {
          setError('Authentication failed. No clinician profile returned.');
        }
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your internet connection or credentials.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in Name, Email address, and Password.');
        return;
      }
      try {
        await DatabaseService.registerDoctor(name, email, specialty, clinic, password);
        onNavigate('doctor/dashboard');
      } catch (err: any) {
        setError(err.message || 'Registration failed. Try using a stronger password.');
      }
    }
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
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              {isLogin ? 'Clinician Gateway' : 'Register Clinical Profile'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {isLogin 
                ? 'Access the Sanjeevani AI safety engine and patient database' 
                : 'Create your credentials to join our unified drug safety network'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Clinician Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Aarav Mehta" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Specialty & Department</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Cardiology" 
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                    />
                    <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Clinic / Hospital Center</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Block C, Digital Labs" 
                      value={clinic}
                      onChange={(e) => setClinic(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                    />
                    <Home className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Medical Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="doctor@sanjeevani.ai" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200/50 flex gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                {error}
              </div>
            )}

            {isLogin && (
              <div className="p-3 bg-teal-50/60 text-slate-600 rounded-xl border border-teal-500/10 text-[11px] leading-relaxed font-medium">
                <span className="font-bold text-primary block">Supabase Authentication Enabled:</span>
                Log in with your registered clinician credentials. For quick testing, you can use:
                <div className="mt-1 font-semibold text-slate-800 bg-slate-100/80 px-2 py-1 rounded select-all font-mono">
                  doctor@sanjeevani.ai / password123
                </div>
              </div>
            )}

            <button type="submit" className="w-full btn-medical py-3 font-bold text-sm shadow-premium mt-2">
              {isLogin ? 'Sign In as Doctor' : 'Submit Credentials'}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
            >
              {isLogin 
                ? "Don't have a clinician account? Register Clinic" 
                : "Already registered? Login to Doctor Portal"}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
