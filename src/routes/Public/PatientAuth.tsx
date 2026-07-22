// src/routes/Public/PatientAuth.tsx
import React, { useState } from 'react';
import { DatabaseService, PatientProfile } from '../../services/db';
import { Phone, ArrowRight, Mail, AlertCircle, User, Activity, HeartPulse, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowLeft, KeyRound, Building2 } from 'lucide-react';

interface PatientAuthProps {
  onNavigate: (view: string) => void;
}

type AuthMode = 'login' | 'register' | 'activate' | 'forgot_password';

export const PatientAuth: React.FC<PatientAuthProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // ── Login State ─────────────────────────────────────
  const [identifier, setIdentifier] = useState(''); // Email or Patient ID
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Registration Form State (10 Fields) ────────────
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [emailAddress, setEmailAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');

  // ── Activate Existing Account State ─────────────────
  const [activatePatientId, setActivatePatientId] = useState('');
  const [activateEmail, setActivateEmail] = useState('');
  const [activatePassword, setActivatePassword] = useState('');
  const [activateConfirmPassword, setActivateConfirmPassword] = useState('');

  // ── Registration Success State ──────────────────────
  const [registeredPatient, setRegisteredPatient] = useState<PatientProfile | null>(null);

  // ── Forgot Password State ───────────────────────────
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [newPassword, setNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // UI status
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setRegisteredPatient(null);
    setResetStep(1);
    setOtpCode('');
    setNewPassword('');
    setResetConfirmPassword('');
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your Email or Patient ID and Password.');
      return;
    }

    setLoading(true);
    try {
      const patient = await DatabaseService.loginPatient(identifier, password);
      setLoading(false);
      if (patient) {
        onNavigate('patient/dashboard');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // 2. Handle New Patient Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !age || !emailAddress || !regPassword || !confirmPassword || !mobileNumber || !emergencyName || !emergencyNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const p = DatabaseService.registerOnlinePatient({
        name: fullName,
        age: parseInt(age, 10),
        gender,
        email: emailAddress,
        password: regPassword,
        phone: mobileNumber,
        address,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyNumber
      });
      setLoading(false);
      setRegisteredPatient(p);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  // 3. Handle Activate Existing Account (Hospital Patient)
  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activatePatientId || !activateEmail || !activatePassword || !activateConfirmPassword) {
      setError('Please fill in all activation fields.');
      return;
    }

    if (activatePassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (activatePassword !== activateConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const p = await DatabaseService.activateHospitalPatientAccount(activatePatientId, activateEmail, activatePassword);
      setLoading(false);
      setSuccessMsg(`Account Activated Successfully for Patient ID ${p.id}! You can now sign in using your Email or Patient ID and Password.`);
      setIdentifier(p.id);
      setMode('login');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Account activation failed.');
    }
  };

  // 4. Handle Forgot Password Actions
  const handleForgotSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resetIdentifier) {
      setError('Please enter your Email Address or Patient ID.');
      return;
    }

    try {
      const res = DatabaseService.requestPatientResetOTP(resetIdentifier);
      setSentOtp(res.otp);
      setResetStep(2);
      setSuccessMsg(`Password reset OTP sent. (OTP Code for testing: ${res.otp})`);
    } catch (err: any) {
      setError(err.message || 'Account lookup failed.');
    }
  };

  const handleResetPasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      DatabaseService.resetPatientPassword(resetIdentifier, otpCode, newPassword);
      setSuccessMsg('Password Reset Successfully! You can now log in with your new password.');
      setMode('login');
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md md:max-w-4xl mx-auto min-h-screen md:min-h-0 md:my-auto bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-4 md:p-8 relative overflow-x-hidden md:rounded-3xl shadow-2xl border-x md:border border-slate-200/60 dark:border-slate-800/80">
        
        {/* Top Header Navigation */}
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
          <div className="glass-card p-5 rounded-3xl relative border-teal-500/20 shadow-md text-left">
            
            {/* Banner */}
            <div className="text-center mb-5">
              <img src="/logo.png" alt="Sanjeevani AI" className="h-12 w-auto object-contain mx-auto mb-2" />
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">

              {registeredPatient 
                ? 'Registration Successful!' 
                : mode === 'login' 
                ? 'Patient Health Portal' 
                : mode === 'register' 
                ? 'Register Patient Account' 
                : mode === 'activate'
                ? 'Activate Existing Account'
                : 'Reset Password'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {registeredPatient 
                ? 'Welcome to Sanjeevani AI. Your patient health account is active.'
                : mode === 'login'
                ? 'Sign in to access your prescriptions, consultation notes, and health records'
                : mode === 'register'
                ? 'Create your instant health account to book appointments and access digital medical records'
                : mode === 'activate'
                ? 'Hospital-registered patients can verify details and set their password'
                : 'Verify OTP to update your password'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── SUCCESSFUL REGISTRATION SCREEN ── */}
          {registeredPatient ? (
            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl text-center space-y-5 animate-fade-in">
              <div className="h-16 w-16 bg-emerald-100 rounded-full text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800">Registration Successful!</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Welcome to Sanjeevani AI.</p>
              </div>

              {/* Patient ID Display */}
              <div className="p-4 bg-white rounded-2xl border border-emerald-300/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Patient ID</span>
                <span className="text-2xl font-mono font-black text-teal-800 tracking-wider block">{registeredPatient.id}</span>
                <span className="text-[10px] text-teal-700 font-medium block pt-1">
                  Please save your Patient ID for future login and hospital visits.
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('patient/dashboard')}
                className="w-full btn-medical py-3 text-xs font-bold shadow-premium"
              >
                Go to Dashboard
              </button>
            </div>
          ) : mode === 'login' ? (
            /* ── MODE 1: LOGIN ── */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Email Address or Patient ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. patient@gmail.com or SJV-PAT-100001" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <User className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('forgot_password');
                    }}
                    className="text-[10px] font-bold text-teal-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-medical py-3 font-bold text-xs shadow-premium mt-2"
              >
                {loading ? 'Authenticating…' : 'Sign In to Health Portal'}
              </button>

              {/* Quick Options Box */}
              <div className="mt-6 border-t border-slate-100 pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('register');
                  }}
                  className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs flex items-center justify-between border border-teal-200/80 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-600" />
                    Register as New Patient
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('activate');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-between border border-slate-200/80 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    Activate Existing Account
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            </form>
          ) : mode === 'register' ? (
            /* ── MODE 2: NEW PATIENT REGISTRATION ── */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* 1. Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ananya Iyer" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>

                {/* 2. Age & 3. Gender */}
                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="28" 
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* 4. Email Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="patient@gmail.com" 
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>

                {/* 5. Password & 6. Confirm Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>

                {/* 7. Mobile Number */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. 9876543210" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>

                {/* 8. Residential Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Residential Address</label>
                  <input 
                    type="text" 
                    placeholder="Street, City, Pin Code" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>

                {/* 9. Emergency Contact Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Emergency Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Relative Name" 
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>

                {/* 10. Emergency Contact Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Emergency Contact Number <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Relative Phone" 
                    value={emergencyNumber}
                    onChange={(e) => setEmergencyNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-medical py-3 font-bold text-xs shadow-premium mt-3"
              >
                {loading ? 'Registering…' : 'Register'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 text-center pt-2 block"
              >
                ← Return to Login Page
              </button>
            </form>
          ) : mode === 'activate' ? (
            /* ── MODE 3: ACTIVATE EXISTING ACCOUNT (Hospital Registered Patient) ── */
            <form onSubmit={handleActivateSubmit} className="space-y-3.5">
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs font-semibold text-teal-900 leading-relaxed">
                <strong>Activate Existing Account:</strong> This option is for patients already registered by the Hospital Admin. Verify your Patient ID & Registered Email to create your password.
              </div>

              {/* 1. Patient ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Patient ID <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. SJV-PAT-100001" 
                  value={activatePatientId}
                  onChange={(e) => setActivatePatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-teal-300 font-mono text-xs font-bold focus:outline-none bg-white"
                />
              </div>

              {/* 2. Registered Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="patient@gmail.com" 
                  value={activateEmail}
                  onChange={(e) => setActivateEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                />
              </div>

              {/* 3. Create Password & 4. Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={activatePassword}
                  onChange={(e) => setActivatePassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={activateConfirmPassword}
                  onChange={(e) => setActivateConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-medical py-3 font-bold text-xs shadow-premium mt-2"
              >
                {loading ? 'Activating Account…' : 'Activate Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 text-center pt-2 block"
              >
                ← Return to Login Page
              </button>
            </form>
          ) : (
            /* ── MODE 4: FORGOT PASSWORD ── */
            <div className="space-y-4">
              {resetStep === 1 && (
                <form onSubmit={handleForgotSendOTP} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Email Address or Patient ID <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. patient@gmail.com or SJV-PAT-100001" 
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
                    />
                  </div>

                  <button type="submit" className="w-full btn-medical py-2.5 font-bold text-xs shadow-sm">
                    Send Reset OTP
                  </button>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleResetPasswordSave} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Enter 6-Digit OTP Code <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      placeholder="458219" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3 py-2 text-center font-mono text-lg font-black rounded-xl border border-teal-400 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••" 
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <button type="submit" className="w-full btn-medical py-2.5 font-bold text-xs shadow-sm">
                    Update Password & Login
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 text-center pt-2 block"
              >
                ← Return to Login Page
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  </div>
);
};

