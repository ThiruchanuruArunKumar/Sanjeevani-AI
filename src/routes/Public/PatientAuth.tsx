// src/routes/Public/PatientAuth.tsx
import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { Phone, ArrowRight, Mail, AlertCircle, User, Activity, HeartPulse, Lock, Eye, EyeOff } from 'lucide-react';

interface PatientAuthProps {
  onNavigate: (view: string) => void;
}

export const PatientAuth: React.FC<PatientAuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup specific fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactEmail, setEmergencyContactEmail] = useState('');
  const [emergencyContactAddress, setEmergencyContactAddress] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (!phone || !password) {
        setError('Please enter your phone number and password.');
        return;
      }
      
      const patient = DatabaseService.loginPatient(phone, password);
      if (patient) {
        onNavigate('patient/dashboard');
      } else {
        setError('Invalid phone number or password.');
        setTimeout(() => setError(''), 4500);
      }
    } else {
      if (!name || !age || !email || !address || !phone || !emergencyContactName || !emergencyContactPhone || !password) {
        setError('Please fill in all required details.');
        return;
      }
      
      try {
        DatabaseService.registerPatient({
          name,
          age: parseInt(age, 10),
          gender: 'Unknown',
          bloodGroup: 'Unknown',
          phone,
          email,
          address,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactEmail,
          emergencyContactAddress,
          allergies: [],
          chronicConditions: []
        });
        onNavigate('patient/dashboard');
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await DatabaseService.loginPatientWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Auth failed to launch. Please try again.');
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
              {isLogin ? 'Patient Health Portal' : 'Register Patient Profile'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {isLogin 
                ? 'Login to synchronize your active prescriptions and emergency cards.' 
                : 'Create your secure health profile to access our safety network'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Patient Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Rohan Sharma" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-1 w-1/2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Age</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="e.g. 34" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                      />
                      <Activity className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1 w-1/2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        placeholder="patient@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Home Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. 123 Main St, City" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                    />
                    <Activity className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-rose-500" />
                    Emergency Contact
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Contact Name</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. Anjali Sharma" 
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                        />
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Contact Number</label>
                      <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="e.g. 9123456780" 
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                        />
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Contact Email (Optional)</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          placeholder="contact@example.com" 
                          value={emergencyContactEmail}
                          onChange={(e) => setEmergencyContactEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                        />
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Contact Address (Optional)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. 456 Secondary St" 
                          value={emergencyContactAddress}
                          onChange={(e) => setEmergencyContactAddress(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                        />
                        <Activity className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                {isLogin ? 'Registered Mobile Number' : 'Your Contact Number'}
              </label>
              <div className="relative">
                <input 
                  id="phone"
                  type="tel" 
                  placeholder="9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Password</label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-primary bg-white/50"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
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

            <button id="login-button" type="submit" className="w-full btn-medical py-3 font-bold text-sm shadow-premium mt-2">
              {isLogin ? 'Sign In as Patient' : 'Register Profile'}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline mb-4"
            >
              {isLogin 
                ? "Don't have a patient account? Register Profile" 
                : "Already registered? Login to Patient Portal"}
            </button>

            <div className="relative flex justify-center text-xs uppercase mb-4 mt-2">
              <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">Or Sign In With</span>
            </div>

            <button 
              onClick={handleGoogleAuth}
              className="w-full btn-medical-secondary py-3 flex items-center justify-center font-bold text-xs gap-2 shadow-sm border-slate-200/60 hover:bg-slate-50"
            >
              <Mail className="h-4.5 w-4.5 text-slate-500" />
              Continue with Google
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
