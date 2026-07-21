import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { Building, ArrowRight, AlertCircle, User, MapPin, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
        await DatabaseService.registerAdmin(hospitalName, address, adminName, email, password);
        onNavigate('admin/dashboard');
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => onNavigate('welcome')}>
        <img src="/logo.png" alt="Sanjeevani AI" className="h-10 w-auto object-contain" />
      </div>

      <div className="w-full max-w-md">
        <div className="glass-card p-8 rounded-3xl border-teal-500/20 shadow-premium">
          <div className="text-center mb-8">
            <Building className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800">
              {isLogin ? 'Hospital Admin Login' : 'Register Hospital'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              {isLogin ? 'Access your central hospital management console.' : 'Set up your hospital to manage doctors and patient appointments.'}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400"
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

          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            >
              {isLogin ? "Need to register your hospital?" : "Already registered? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
