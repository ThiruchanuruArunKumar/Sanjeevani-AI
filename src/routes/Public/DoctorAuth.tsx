import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { Stethoscope, Lock, Mail, User, ShieldAlert, Award, Home, Eye, EyeOff, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

interface DoctorAuthProps {
  onNavigate: (view: string) => void;
}

export const DoctorAuth: React.FC<DoctorAuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Doctor Registration fields
  const [name, setName] = useState('');
  const [medicalRegNumber, setMedicalRegNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [department, setDepartment] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalPortalId, setHospitalPortalId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submittedPending, setSubmittedPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      setSubmitting(true);
      try {
        const user = await DatabaseService.loginDoctor(email, password);
        setSubmitting(false);
        if (user) {
          onNavigate('doctor/dashboard');
        } else {
          setError('Authentication failed. No clinician profile returned.');
        }
      } catch (err: any) {
        setSubmitting(false);
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name || !email || !password || !confirmPassword || !hospitalPortalId) {
        setError('Please fill in Doctor Name, Hospital Portal ID, Medical Email, Password, and Confirm Password.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match.');
        return;
      }

      setSubmitting(true);
      try {
        await DatabaseService.registerDoctor(
          name, 
          email, 
          specialty || 'General Practice', 
          hospitalName, 
          password, 
          hospitalPortalId.trim(),
          medicalRegNumber,
          department || specialty
        );
        setSubmitting(false);
        setSubmittedPending(true);
      } catch (err: any) {
        setSubmitting(false);
        setError(err.message || 'Registration failed. Check if Hospital Portal ID is valid.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md md:max-w-4xl mx-auto min-h-screen md:min-h-0 md:my-auto bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-4 md:p-8 relative overflow-x-hidden md:rounded-3xl shadow-2xl border-x md:border border-slate-200/60 dark:border-slate-800/80">
        
        {/* Back to home logo */}
        <div className="flex items-center justify-between py-3 border-b border-slate-200/80 dark:border-slate-800">
          <button 
            onClick={() => onNavigate('welcome')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="Sanjeevani AI" className="h-7 w-auto object-contain" />
            <span className="text-xs font-black uppercase text-slate-900 dark:text-white">Sanjeevani <span className="text-teal-600">AI</span></span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="glass-card p-5 rounded-3xl relative border-teal-500/20 shadow-md">
            <div className="text-center mb-5">
              <img src="/logo.png" alt="Sanjeevani AI" className="h-12 w-auto object-contain mx-auto mb-2" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                {isLogin ? 'Doctor Portal Login' : 'Doctor Registration'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {isLogin 
                  ? 'Access your consultation dashboard, patient records, and safety alerts' 
                  : 'Register your doctor account to link with your Hospital Administration Portal'}
              </p>
            </div>


          {submittedPending ? (
            <div className="p-6 bg-amber-50 border border-amber-200/80 rounded-2xl text-center space-y-4 animate-scale-up">
              <div className="h-12 w-12 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-amber-900">Registration Submitted</h3>
              <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                Waiting for Hospital Admin Approval.<br/>
                Your registration details have been dispatched to your Hospital Administrator linked with Portal ID <strong className="font-mono text-amber-950">{hospitalPortalId}</strong>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmittedPending(false);
                  setIsLogin(true);
                }}
                className="w-full btn-medical py-2.5 text-xs font-bold"
              >
                Return to Login Page
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Doctor Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        Doctor Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Dr. Aarav Mehta" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                        />
                        <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Medical Reg Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        Medical Reg No. (Optional)
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. MCI-2026-8842" 
                          value={medicalRegNumber}
                          onChange={(e) => setMedicalRegNumber(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                        />
                        <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Specialization */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        Specialization <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Cardiology / Pediatrics" 
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                        />
                        <Award className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        Department
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. OPD OPD / Clinical Care" 
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                        />
                        <Stethoscope className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Hospital Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                        Hospital Name
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. City Apollo Hospital" 
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                        />
                        <Home className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Hospital Portal ID */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-700 uppercase tracking-wide block">
                        Hospital Portal ID <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. SJV-HTPL-6444" 
                          value={hospitalPortalId}
                          onChange={(e) => setHospitalPortalId(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-teal-300 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-teal-50/30"
                        />
                        <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-teal-600" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Medical Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Medical Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="email"
                    type="email" 
                    required
                    placeholder="doctor@sanjeevani.ai" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200/50 flex gap-2 items-center">
                  <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                id="login-button" 
                type="submit" 
                disabled={submitting}
                className="w-full btn-medical py-3 font-bold text-xs shadow-premium mt-2"
              >
                {submitting ? 'Processing Request…' : isLogin ? 'Sign In as Doctor' : 'Submit Registration Request'}
              </button>
            </form>
          )}

          {/* Toggle Switch */}
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSubmittedPending(false);
              }}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              {isLogin 
                ? "Don't have a doctor account? Register Doctor Profile" 
                : "Already registered? Login to Doctor Portal"}
            </button>
          </div>

          </div>
        </div>

      </div>
    </div>
  );
};


