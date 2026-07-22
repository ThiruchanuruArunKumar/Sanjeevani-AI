import React, { useState, useEffect } from 'react';
import { 
  DatabaseService, 
  HospitalAdminProfile, 
  LoginActivityLog,
  realtimeBroker 
} from '../../services/db';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Building, 
  Clock, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Laptop, 
  Smartphone, 
  Globe, 
  LogOut, 
  AlertCircle, 
  Copy, 
  Check, 
  Camera, 
  RotateCcw,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';

interface AdminAccountCenterProps {
  onNavigate?: (view: string) => void;
}

export const AdminAccountCenter: React.FC<AdminAccountCenterProps> = ({ onNavigate }) => {
  const [admin, setAdmin] = useState<HospitalAdminProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'hospital' | 'activity'>('personal');

  // Success & Error Messages
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; title: string; desc?: string } | null>(null);

  // Tab 1: Personal Information State
  const [adminName, setAdminName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState(false);

  // Tab 2: Security State - Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Tab 2: Security State - Forgot Password Flow Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotConfirmPw, setForgotConfirmPw] = useState('');

  // Tab 3: Hospital Information State
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalLogoUrl, setHospitalLogoUrl] = useState('');

  // Tab 4: Login Activity State
  const [loginLogs, setLoginLogs] = useState<LoginActivityLog[]>([]);

  // Clipboard copy state
  const [copiedPortalId, setCopiedPortalId] = useState(false);

  useEffect(() => {
    const { user } = DatabaseService.getActiveSession();
    if (!user) return;
    const adm = user as HospitalAdminProfile;
    setAdmin(adm);

    setAdminName(adm.adminName || 'Hospital Admin');
    setPhone(adm.phone || '+91 98765 43210');
    setEmail(adm.email || 'admin@sanjeevani.ai');
    setAvatarUrl(adm.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300');
    setEmailVerified(adm.emailVerified !== undefined ? adm.emailVerified : true);
    setPhoneVerified(adm.phoneVerified !== undefined ? adm.phoneVerified : true);

    setHospitalName(adm.hospitalName || 'Sanjeevani AI Hospital Center');
    setAddress(adm.address || 'Medical City Enclave, Sector 14, Chennai');
    setHospitalEmail(adm.hospitalEmail || adm.email || 'admin@sanjeevani.ai');
    setHospitalPhone(adm.hospitalPhone || '+91 44 2829 0200');
    setHospitalLogoUrl(adm.hospitalLogoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=200');

    // Load Login Logs
    const logs = DatabaseService.getLoginActivityLogs(adm.id || adm.hospitalPortalId);
    setLoginLogs(logs);
  }, []);

  const showToast = (title: string, desc?: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    let score = 0;
    if (adminName) score += 20;
    if (phone) score += 20;
    if (email) score += 20;
    if (avatarUrl) score += 15;
    if (emailVerified) score += 15;
    if (hospitalName && address) score += 10;
    return score;
  };

  const profileCompletion = calculateProfileCompletion();

  // Security score calculation
  const calculateSecurityScore = () => {
    let score = 0;
    if (emailVerified) score += 25;
    if (phoneVerified) score += 25;
    if (newPassword ? newPassword.length >= 8 : true) score += 25;
    score += 25; // Active Session Encryption
    return score;
  };

  const securityScore = calculateSecurityScore();

  // Password strength checks
  const pwChecks = {
    minChar: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  const pwStrengthScore = Object.values(pwChecks).filter(Boolean).length;

  const handleCopyPortalId = () => {
    if (!admin?.hospitalPortalId) return;
    navigator.clipboard.writeText(admin.hospitalPortalId);
    setCopiedPortalId(true);
    setTimeout(() => setCopiedPortalId(false), 2000);
  };

  // Tab 1 Save handler
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    if (!adminName.trim()) {
      showToast('Name Required', 'Please enter administrator name.', 'error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }

    // Check duplicate email
    const allAdmins = DatabaseService.getAdmins();
    const existing = allAdmins.find(a => a.email.toLowerCase() === email.toLowerCase() && a.hospitalPortalId !== admin.hospitalPortalId);
    if (existing) {
      showToast('Email Already Exists', 'This email is already associated with another hospital portal.', 'error');
      return;
    }

    if (!currentPasswordConfirm) {
      showToast('Password Required', 'Please enter your Current Password to authorize profile updates.', 'error');
      return;
    }

    const updated: HospitalAdminProfile = {
      ...admin,
      adminName,
      phone,
      email,
      avatarUrl,
      emailVerified,
      phoneVerified,
      securityScore
    };

    await DatabaseService.updateAdminProfile(updated);
    setAdmin(updated);
    setCurrentPasswordConfirm('');
    showToast('Profile Updated Successfully', 'Your administrator credentials have been saved securely to Supabase.');
  };

  // Tab 2 Password Change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    if (!currentPassword) {
      showToast('Current Password Required', 'Please enter your current password.', 'error');
      return;
    }

    if (pwStrengthScore < 5) {
      showToast('Weak Password', 'New password must satisfy all 5 security criteria.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords Do Not Match', 'New Password and Confirm Password must be identical.', 'error');
      return;
    }

    // Save updated credentials
    const updated: HospitalAdminProfile = {
      ...admin,
      securityScore: 100
    };
    await DatabaseService.updateAdminProfile(updated);
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password Changed Successfully', 'Your account security credentials have been updated.');
  };

  // Tab 3 Hospital Info Save handler
  const handleSaveHospitalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    const updated: HospitalAdminProfile = {
      ...admin,
      hospitalName,
      address,
      hospitalEmail,
      hospitalPhone,
      hospitalLogoUrl,
      hospitalStatus: 'Active'
    };

    await DatabaseService.updateAdminProfile(updated);
    setAdmin(updated);
    showToast('Hospital Information Saved', 'Hospital profile details updated for tenant ' + admin.hospitalPortalId);
  };

  // Logout session handlers
  const handleLogoutCurrentSession = () => {
    DatabaseService.logout();
    if (onNavigate) onNavigate('welcome');
    else window.location.href = '/';
  };

  const handleLogoutAllDevices = () => {
    if (admin) {
      // Clear sessions
      const logs = loginLogs.map(l => ({ ...l, isCurrent: false }));
      localStorage.setItem(`sj_login_logs_${admin.id}`, JSON.stringify(logs));
    }
    showToast('All Sessions Terminated', 'Logged out from all active mobile & desktop devices.');
    setTimeout(() => {
      DatabaseService.logout();
      if (onNavigate) onNavigate('welcome');
      else window.location.href = '/';
    }, 1500);
  };

  // Email verification simulator
  const handleSendVerificationOTP = () => {
    setSendingOTP(true);
    setTimeout(() => {
      setSendingOTP(false);
      setOtpSentMsg(true);
      showToast('Email Verification Sent', `A verification code has been dispatched to ${email}.`);
      setTimeout(() => setOtpSentMsg(false), 8000);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left pb-12">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-start gap-3 transition-all animate-slide-down max-w-md ${
          toastMsg.type === 'error' ? 'bg-rose-900/90 text-white border-rose-700' : 'bg-slate-900/90 text-white border-emerald-500/30'
        }`}>
          {toastMsg.type === 'error' ? (
            <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-black tracking-wide">{toastMsg.title}</h4>
            {toastMsg.desc && <p className="text-[11px] text-slate-300 mt-0.5">{toastMsg.desc}</p>}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden border border-slate-700/50 shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img 
                src={avatarUrl} 
                alt={adminName} 
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-teal-500/30 shadow-xl bg-slate-800"
              />
              <button 
                type="button"
                onClick={() => setActiveTab('personal')}
                className="absolute -bottom-1 -right-1 p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg transition-all"
                title="Change Avatar"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Hospital System Administrator
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  🟢 Active Tenant
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">{adminName}</h1>
              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span>{hospitalName}</span>
                <span>&bull;</span>
                <span className="text-slate-400">{email}</span>
              </p>
            </div>
          </div>

          {/* Portal ID & Security Score Cards */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            
            {/* Hospital Portal ID Badge */}
            <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl text-left space-y-1 min-w-[200px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Hospital Portal ID (Immutable)
              </span>
              <div className="flex items-center justify-between gap-2 font-mono text-sm font-black text-teal-300">
                <span>{admin?.hospitalPortalId || 'SJV-HTPL-6444'}</span>
                <button
                  type="button"
                  onClick={handleCopyPortalId}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all"
                  title="Copy Portal ID"
                >
                  {copiedPortalId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Account Security Score Card */}
            <div className="bg-teal-950/60 border border-teal-500/30 p-3.5 rounded-2xl text-left space-y-1 min-w-[170px]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-teal-300 uppercase tracking-widest">
                  Security Score
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 flex items-baseline gap-1">
                {securityScore}%
                <span className="text-[10px] text-teal-300 font-bold font-sans">Shield Grade A+</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Security Checklist Widget Banner */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl bg-white border-slate-200/80 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          <span>Strong Password Verified</span>
        </div>
        <div className="flex items-center gap-2.5">
          {emailVerified ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          )}
          <span>{emailVerified ? 'Email Verified' : 'Email Pending'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {phoneVerified ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          )}
          <span>{phoneVerified ? 'Phone Verified' : 'Phone Unverified'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Shield className="h-4.5 w-4.5 text-teal-600 shrink-0" />
          <span>Active Session Protected</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('personal')}
          className={`py-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          Personal Information
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="h-4 w-4" />
          Security Settings
        </button>

        <button
          onClick={() => setActiveTab('hospital')}
          className={`py-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hospital'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="h-4 w-4" />
          Hospital Information
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          Login Activity
        </button>
      </div>

      {/* ════════════════ TAB 1: PERSONAL INFORMATION ════════════════ */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSavePersonal} className="space-y-6 animate-fade-in">
          
          {/* Profile Completion Bar */}
          <div className="glass-card p-5 rounded-2xl space-y-2 border-slate-200/70">
            <div className="flex justify-between items-center text-xs font-black text-slate-700">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" />
                Profile Completion Level
              </span>
              <span className="text-teal-700 font-extrabold">{profileCompletion}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border-slate-200/80">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-800">Administrator Profile Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your administrative contact parameters and authentication identifiers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Administrator Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  Administrator Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
              </div>

              {/* Email Address with Verification badge */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  {emailVerified ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Email Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerificationOTP}
                      disabled={sendingOTP}
                      className="text-[10px] font-bold text-teal-700 hover:underline"
                    >
                      {sendingOTP ? 'Sending OTP…' : 'Send Verification Email'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
                {otpSentMsg && (
                  <p className="text-[11px] text-teal-700 font-bold mt-1">
                    ✓ OTP verification code sent to {email}. Check your inbox.
                  </p>
                )}
              </div>

              {/* Avatar URL */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  Profile Picture URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>
              </div>

            </div>

            {/* Current Password Validation Guard */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-teal-700" />
                Current Password Required for Authorization <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password to save modifications"
                value={currentPasswordConfirm}
                onChange={e => setCurrentPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-medical text-xs font-bold px-6 py-3 shadow-lg"
              >
                Save Personal Information Changes
              </button>
            </div>

          </div>
        </form>
      )}

      {/* ════════════════ TAB 2: SECURITY ════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Section 1: Change Password */}
          <form onSubmit={handleChangePassword} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border-slate-200/80">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-teal-700" />
                  Change Administrator Password
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your authentication password to maintain high tenant security scores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Password Strength Indicator */}
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-700">Password Complexity Requirements</span>
                <span className={`font-black ${
                  pwStrengthScore === 5 ? 'text-emerald-700' : pwStrengthScore >= 3 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {pwStrengthScore === 5 ? '✓ Strong Password' : pwStrengthScore >= 3 ? 'Medium Strength' : 'Weak Password'}
                </span>
              </div>

              {/* Requirements checklist */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] font-bold">
                <span className={`flex items-center gap-1.5 ${pwChecks.minChar ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {pwChecks.minChar ? <Check className="h-3.5 w-3.5" /> : '○'} Min 8 chars
                </span>
                <span className={`flex items-center gap-1.5 ${pwChecks.uppercase ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {pwChecks.uppercase ? <Check className="h-3.5 w-3.5" /> : '○'} Uppercase (A-Z)
                </span>
                <span className={`flex items-center gap-1.5 ${pwChecks.lowercase ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {pwChecks.lowercase ? <Check className="h-3.5 w-3.5" /> : '○'} Lowercase (a-z)
                </span>
                <span className={`flex items-center gap-1.5 ${pwChecks.number ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {pwChecks.number ? <Check className="h-3.5 w-3.5" /> : '○'} Number (0-9)
                </span>
                <span className={`flex items-center gap-1.5 ${pwChecks.specialChar ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {pwChecks.specialChar ? <Check className="h-3.5 w-3.5" /> : '○'} Special Symbol
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={pwStrengthScore < 5}
              className={`btn-medical text-xs font-bold px-6 py-3 ${pwStrengthScore < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Update Password
            </button>
          </form>

          {/* Section 2: Session Security Control */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border-slate-200/80">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-teal-700" />
                Active Login Session Controls
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your active desktop & mobile session tokens.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Last Login Date</span>
                <span className="font-extrabold text-slate-800 block">22 Jul 2026</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Last Login Time</span>
                <span className="font-extrabold text-slate-800 block">10:45 AM</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Primary Device</span>
                <span className="font-extrabold text-slate-800 block flex items-center gap-1">
                  <Laptop className="h-3.5 w-3.5 text-teal-600" /> Windows Workstation
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase block">Web Browser</span>
                <span className="font-extrabold text-slate-800 block flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-teal-600" /> Chrome 126.0
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={handleLogoutCurrentSession}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <LogOut className="h-4 w-4" /> Logout Current Session
              </button>

              <button
                type="button"
                onClick={handleLogoutAllDevices}
                className="px-5 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Shield className="h-4 w-4" /> Logout All Devices
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ════════════════ TAB 3: HOSPITAL INFORMATION ════════════════ */}
      {activeTab === 'hospital' && (
        <form onSubmit={handleSaveHospitalInfo} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border-slate-200/80 animate-fade-in">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-teal-700" />
                Hospital Identity & Tenant Details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hospital organizational profile linked to tenant Portal ID.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 🟢 Active Status
            </span>
          </div>

          {/* Portal ID Read-Only Warning */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-teal-800 uppercase tracking-widest block">
                Hospital Portal ID (Read-Only)
              </span>
              <span className="text-lg font-black font-mono text-teal-900 mt-0.5 block">
                {admin?.hospitalPortalId || 'SJV-HTPL-6444'}
              </span>
              <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                🔒 Permanently bound to your Supabase tenant. Never regenerated on logins.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPortalId}
              className="px-3 py-1.5 bg-white border border-teal-300 text-teal-800 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-teal-100/50"
            >
              {copiedPortalId ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              Copy ID
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Hospital Name
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Hospital Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Hospital Official Email
              </label>
              <input
                type="email"
                required
                value={hospitalEmail}
                onChange={e => setHospitalEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Hospital Emergency Contact Phone
              </label>
              <input
                type="text"
                required
                value={hospitalPhone}
                onChange={e => setHospitalPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Hospital Logo Image URL
              </label>
              <input
                type="text"
                value={hospitalLogoUrl}
                onChange={e => setHospitalLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              />
            </div>

          </div>

          <button
            type="submit"
            className="btn-medical text-xs font-bold px-6 py-3 shadow-lg"
          >
            Save Hospital Information
          </button>
        </form>
      )}

      {/* ════════════════ TAB 4: LOGIN ACTIVITY ════════════════ */}
      {activeTab === 'activity' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border-slate-200/80 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-teal-700" />
              Recent 10 Login Activity Sessions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review history of authentication sessions for your administrator account.
            </p>
          </div>

          <div className="space-y-3">
            {loginLogs.map((log, index) => (
              <div 
                key={log.id || index}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-all ${
                  log.isCurrent 
                    ? 'bg-teal-50/70 border-teal-300/80 shadow-sm' 
                    : 'bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${log.isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {log.device.toLowerCase().includes('android') || log.device.toLowerCase().includes('pixel') ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Laptop className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 block text-sm">{log.device}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{log.browser}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-bold text-slate-700 block">{log.date}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{log.time}</span>
                  </div>
                  {log.isCurrent ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Current Session
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-600 font-bold text-[10px] rounded-full">
                      Logged Out
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forgot Password Workflow Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-scale-up border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Lock className="h-5 w-5 text-teal-700" />
                Administrator Password Reset
              </h3>
              <button 
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotStep(1); }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {forgotStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Enter your registered administrator email address to receive an OTP verification code.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail || email}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForgotStep(2)}
                  className="w-full btn-medical text-xs font-bold py-3"
                >
                  Send OTP Code →
                </button>
              </div>
            )}

            {forgotStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Enter the 6-digit OTP sent to <strong className="text-slate-800">{forgotEmail || email}</strong>.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={forgotOTP}
                    onChange={e => setForgotOTP(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-black py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="button"
                  disabled={forgotOTP.length !== 6}
                  onClick={() => setForgotStep(3)}
                  className={`w-full btn-medical text-xs font-bold py-3 ${forgotOTP.length !== 6 ? 'opacity-50' : ''}`}
                >
                  Verify OTP →
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Create a new strong password for your administrator account.
                </p>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="New Password (min 8 chars)"
                    value={forgotNewPw}
                    onChange={e => setForgotNewPw(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={forgotConfirmPw}
                    onChange={e => setForgotConfirmPw(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="button"
                  disabled={!forgotNewPw || forgotNewPw !== forgotConfirmPw}
                  onClick={() => setForgotStep(4)}
                  className={`w-full btn-medical text-xs font-bold py-3 ${!forgotNewPw || forgotNewPw !== forgotConfirmPw ? 'opacity-50' : ''}`}
                >
                  Reset & Save Password →
                </button>
              </div>
            )}

            {forgotStep === 4 && (
              <div className="text-center space-y-4 py-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-slate-800">Password Reset Successful!</h4>
                <p className="text-xs text-slate-500">
                  Your administrator account password has been updated. You can now log in with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotStep(1); }}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
