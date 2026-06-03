// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\routes\Shared\Profile.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, DoctorProfile, PatientProfile, HospitalAdminProfile, realtimeBroker } from '../../services/db';
import { 
  User, 
  Mail, 
  Phone, 
  Award, 
  Home, 
  ShieldCheck, 
  Save, 
  ShieldAlert, 
  Activity,
  Heart,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (view: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { role, user } = DatabaseService.getActiveSession();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Doctor state
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docClinic, setDocClinic] = useState('');

  // Patient state
  const [patName, setPatName] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patEmergencyName, setPatEmergencyName] = useState('');
  const [patEmergencyPhone, setPatEmergencyPhone] = useState('');

  // Admin state
  const [adminName, setAdminName] = useState('');
  const [adminHospitalName, setAdminHospitalName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAddress, setAdminAddress] = useState('');

  useEffect(() => {
    if (!user) return;

    if (role === 'doctor') {
      const doc = user as DoctorProfile;
      setDocName(doc.name);
      setDocEmail(doc.email);
      setDocSpecialty(doc.specialty);
      setDocClinic(doc.clinicName);
    } else if (role === 'patient') {
      const pat = user as PatientProfile;
      setPatName(pat.name);
      setPatEmail(pat.email);
      setPatPhone(pat.phone);
      setPatEmergencyName(pat.emergencyContact.name);
      setPatEmergencyPhone(pat.emergencyContact.phone);
    } else if (role === 'admin') {
      const adm = user as HospitalAdminProfile;
      setAdminName(adm.adminName);
      setAdminHospitalName(adm.hospitalName);
      setAdminEmail(adm.email);
      setAdminAddress(adm.address);
    }
  }, [user, role]);

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docEmail) {
      setErrorMsg('Name and Email fields are required.');
      return;
    }

    const updatedDoc: DoctorProfile = {
      ...user,
      name: docName,
      email: docEmail,
      specialty: docSpecialty,
      clinicName: docClinic
    };

    // Save to localStorage and Supabase
    DatabaseService.updateDoctorProfile(updatedDoc);
    
    setSuccessMsg('Clinical profile updated successfully.');
    setErrorMsg('');
    realtimeBroker.publish('patients-update'); // Refresh layouts

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName || !patPhone) {
      setErrorMsg('Name and Phone number are required.');
      return;
    }

    const patients = DatabaseService.getPatients();
    const index = patients.findIndex(p => p.id === user.id);
    
    if (index !== -1) {
      const updatedPat: PatientProfile = {
        ...patients[index],
        name: patName,
        email: patEmail,
        phone: patPhone,
        emergencyContact: {
          name: patEmergencyName,
          phone: patEmergencyPhone
        }
      };

      // Save to localStorage and Supabase
      DatabaseService.updatePatientProfile(updatedPat);

      setSuccessMsg('Personal health profile updated successfully.');
      setErrorMsg('');
      
      // Notify components and sync database
      realtimeBroker.publish('patients-update');
      realtimeBroker.publish(`patient-${user.id}`);
      realtimeBroker.publish(`alerts-${user.id}`);

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    }
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminHospitalName || !adminEmail) {
      setErrorMsg('Name, Hospital Name and Email fields are required.');
      return;
    }

    const updatedAdmin: HospitalAdminProfile = {
      ...user,
      adminName,
      hospitalName: adminHospitalName,
      email: adminEmail,
      address: adminAddress
    };

    // Save to localStorage
    DatabaseService.updateAdminProfile(updatedAdmin);
    
    setSuccessMsg('Admin profile updated successfully.');
    setErrorMsg('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <span className="text-slate-400 font-bold block text-sm">No active session found.</span>
      </div>
    );
  }

  const handleBack = () => {
    if (role === 'doctor') onNavigate('doctor/dashboard');
    else if (role === 'admin') onNavigate('admin/dashboard');
    else onNavigate('patient/dashboard');
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Premium Back Navigation & Breadcrumbs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover dark:text-teal-400 dark:hover:text-teal-300 transition-all duration-300 active:scale-95 border border-slate-200/60 dark:border-slate-800/80 hover:border-primary/30 dark:hover:border-teal-500/30 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#121826] shadow-sm cursor-pointer w-fit"
          title="Return to your main workspace dashboard"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
          <span className="cursor-pointer hover:text-primary dark:hover:text-teal-400" onClick={handleBack}>Dashboard</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary dark:text-teal-400">
            {role === 'doctor' ? 'Doctor Profile' : role === 'admin' ? 'Admin Profile' : 'Patient Profile'}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Update credentials, manage personal details, and configure emergency parameters.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-500/10 rounded-2xl animate-pulse">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 text-sm font-bold border border-rose-500/10 rounded-2xl">
          {errorMsg}
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card Summary (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl text-center space-y-5">
            <div className="h-20 w-20 rounded-full bg-teal-100 border border-teal-200 shadow-sm mx-auto flex items-center justify-center text-teal-800 font-black text-2xl overflow-hidden relative group">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-800">{role === 'admin' ? user.adminName : user.name}</h3>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-1">
                {role === 'doctor' ? user.specialty : role === 'admin' ? user.hospitalName : `Patient ID: ${user.id}`}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 leading-normal">
              Registered email contact:<br/>
              <span className="font-bold text-slate-800 block mt-0.5">{user.email || 'None registered'}</span>
            </div>
          </div>

          {/* Secure lock status */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 items-center">
            <ShieldCheck className="h-5.5 w-5.5 text-primary shrink-0" />
            <div className="text-[10px] leading-relaxed text-slate-400">
              <span className="font-bold text-slate-700 block">Unified Security Lock</span>
              Your settings are locally encrypted and securely backed up on the Sanjeevani healthcare server.
            </div>
          </div>
        </div>

        {/* Edit Form Fields (Right) */}
        <div className="lg:col-span-8">
          
          {role === 'doctor' ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
                Clinician Directory Details
              </h3>

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name & Title</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinical Specialty</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={docSpecialty}
                        onChange={(e) => setDocSpecialty(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Medical Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={docEmail}
                        onChange={(e) => setDocEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinic / Hospital Branch</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={docClinic}
                        onChange={(e) => setDocClinic(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      <Home className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-medical py-2.5 text-xs font-bold shadow-premium flex items-center justify-center gap-1.5 mt-4">
                  <Save className="h-4.5 w-4.5" />
                  Save Clinical Settings
                </button>
              </form>
            </div>
          ) : role === 'patient' ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
                Patient Account Details
              </h3>

              <form onSubmit={handleSavePatient} className="space-y-6">
                
                {/* Core Personal details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Patient Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={patName}
                        onChange={(e) => setPatName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mobile Number</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={patPhone}
                        onChange={(e) => setPatPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Personal Email</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={patEmail}
                        onChange={(e) => setPatEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Read only blood groups */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blood Group (Secure Lock)</span>
                    <span className="text-sm font-black text-rose-600 block mt-1">{(user as PatientProfile).bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chronic Conditions</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1">{(user as PatientProfile).chronicConditions.join(', ')}</span>
                  </div>
                </div>

                {/* Emergency details */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
                    Emergency Contact Details (Displayed on QR Pass)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Full Name</label>
                      <input 
                        type="text" 
                        value={patEmergencyName}
                        onChange={(e) => setPatEmergencyName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Phone Number</label>
                      <input 
                        type="tel" 
                        value={patEmergencyPhone}
                        onChange={(e) => setPatEmergencyPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-medical py-2.5 text-xs font-bold shadow-premium flex items-center justify-center gap-1.5 mt-2">
                  <Save className="h-4.5 w-4.5" />
                  Save Account Changes
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3">
                Hospital Administration Details
              </h3>

              <form onSubmit={handleSaveAdmin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Administrator Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hospital Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={adminHospitalName}
                        onChange={(e) => setAdminHospitalName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <Home className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Email</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hospital Address</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={adminAddress}
                        onChange={(e) => setAdminAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                      <Activity className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-medical py-2.5 text-xs font-bold shadow-premium flex items-center justify-center gap-1.5 mt-4">
                  <Save className="h-4.5 w-4.5" />
                  Save Admin Settings
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
