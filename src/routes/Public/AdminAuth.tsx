import React, { useState } from 'react';
import { DatabaseService, HospitalAdminProfile } from '../../services/db';
import { Building, ArrowRight, AlertCircle, User, MapPin, Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AdminAuthProps {
  onNavigate: (view: string) => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [error, setError] = useState('');

  // Registration success state
  const [registeredAdmin, setRegisteredAdmin] = useState<HospitalAdminProfile | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter your credentials.');
        return;
      }
      try {
        const admin = await DatabaseService.loginAdmin(email, password);
        if (admin) {
          onNavigate('admin/dashboard');
        } else {
          setError('Invalid login credentials.');
        }
      } catch (err: any) {
        setError(err.message || 'Login failed.');
      }
    } else {
      if (!hospitalName || !address || !adminName || !email || !password) {
        setError('Please fill out all fields.');
        return;
      }
      try {
        const admin = await DatabaseService.registerAdmin(hospitalName, address, adminName, email, password);
        setRegisteredAdmin(admin);
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      }
    }
  };

  if (registeredAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-3xl border-emerald-500/30 shadow-premium text-center animate-fade-in">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Hospital Registered!</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your hospital account has been created successfully.
            </p>

            <div className="my-6 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-teal-400 tracking-wider block">Hospital Portal ID</span>
              <span className="text-2xl font-mono font-black text-amber-400 tracking-wider block">{registeredAdmin.hospitalPortalId || registeredAdmin.id}</span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Save this ID. All doctors and staff will use it to link under {registeredAdmin.hospitalName}.
              </span>
            </div>

            <button 
              onClick={() => onNavigate('admin/dashboard')}
              className="w-full btn-medical py-3 font-bold text-sm flex items-center justify-center gap-2"
            >
              Go to Hospital Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center">
      <div className="max-w-md mx-auto w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-4 relative overflow-x-hidden shadow-2xl border-x border-slate-200/60 dark:border-slate-800/80">
        
        {/* Top Header */}
        <div className="flex items-center justify-between py-3 border-b border-slate-200/80 dark:border-slate-800">
          <button 
            onClick={() => onNavigate('welcome')}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
          >
            ← Back to Portal
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="Sanjeevani AI" className="h-7 w-auto object-contain" />
            <span className="text-xs font-black uppercase text-slate-900 dark:text-white">Sanjeevani <span className="text-teal-600">AI</span></span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="glass-card p-6 rounded-3xl border-teal-500/20 shadow-md">
            <div className="text-center mb-6">
              <Building className="h-12 w-12 text-teal-600 mx-auto mb-3" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isLogin ? 'Hospital Admin Login' : 'Register Hospital'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isLogin ? 'Access your central hospital management console.' : 'Set up your hospital to manage doctors, patients, and appointments.'}
              </p>
            </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sanjeevani General Hospital"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Hospital Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 104 Health Ave, Sector 4"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Admin / Receptionist Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <input 
                  id="email"
                  type="email" 
                  required
                  placeholder="admin@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200/50 flex gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                {error}
              </div>
            )}

            <button id="login-button" type="submit" className="w-full btn-medical py-3 font-bold text-sm mt-2 flex items-center justify-center gap-2">
              {isLogin ? 'Login to Dashboard' : 'Register Hospital'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-5">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:hover:text-teal-400 hover:underline"
            >
              {isLogin ? "Need to register your hospital?" : "Already registered? Login"}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
);
};



