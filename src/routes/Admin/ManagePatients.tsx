// src/routes/Admin/ManagePatients.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService, DoctorProfile, PatientProfile, realtimeBroker, generatePatientId } from '../../services/db';
import { UserPlus, ArrowRight, ArrowLeft, CheckCircle2, Stethoscope, Building2, Calendar, Ticket, User, ShieldCheck, FileText } from 'lucide-react';

interface ManagePatientsProps {
  onNavigate: (view: string) => void;
}

export const ManagePatients: React.FC<ManagePatientsProps> = ({ onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();
  const portalId = user?.hospitalPortalId || user?.id || '';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  // Step 1: Patient Information State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [emailAddress, setEmailAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Step 2: Appointment & Doctor Assignment State
  const [department, setDepartment] = useState('General Medicine');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('Today 10:00 AM - 10:30 AM');
  const [reasonForVisit, setReasonForVisit] = useState('Walk-in Consultation & OPD Checkup');

  // Preview generated IDs
  const [previewPatientId, setPreviewPatientId] = useState('');
  const [tokenNumberPreview, setTokenNumberPreview] = useState('');

  // Success State
  const [createdPatient, setCreatedPatient] = useState<PatientProfile | null>(null);
  const [createdToken, setCreatedToken] = useState('');
  const [assignedDocName, setAssignedDocName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user || !portalId) return;

    const loadDoctors = () => {
      const hospitalDocs = DatabaseService.getDoctors(portalId).filter(d => d.approvalStatus === 'accepted');
      setDoctors(hospitalDocs);
      if (hospitalDocs.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(hospitalDocs[0].id);
        if (hospitalDocs[0].specialty) {
          setDepartment(hospitalDocs[0].specialty);
        }
      }
    };

    loadDoctors();
    const unsub = realtimeBroker.subscribe('doctors-update', loadDoctors);
    return () => unsub();
  }, [user?.id, portalId]);

  // Handle Step 1 -> Step 2
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !age || !mobileNumber || !emailAddress || !emergencyName || !emergencyPhone) {
      setErrorMsg('Please fill in all required fields marked with *.');
      return;
    }

    // Generate preview Patient ID and Token Number
    const sampleId = generatePatientId();
    const sampleToken = DatabaseService.generateTokenNumber(portalId);

    setPreviewPatientId(sampleId);
    setTokenNumberPreview(sampleToken);
    setStep(2);
  };

  // Handle Final Submit: Register Patient & Assign Doctor
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedDoctorId) {
      setErrorMsg('Please select a doctor to assign the walk-in patient appointment.');
      return;
    }

    try {
      // 1. Register Walk-in Patient
      const patient = DatabaseService.registerWalkInPatient({
        hospitalPortalId: portalId,
        name: fullName,
        age: parseInt(age, 10),
        gender,
        phone: mobileNumber,
        email: emailAddress,
        address,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone
      });

      // 2. Create Appointment & Assign Doctor immediately
      const doctorObj = doctors.find(d => d.id === selectedDoctorId);
      const docName = doctorObj ? doctorObj.name : 'Assigned Doctor';

      DatabaseService.requestAppointment({
        patientId: patient.id,
        hospitalId: portalId,
        doctorId: selectedDoctorId,
        department,
        tokenNumber: tokenNumberPreview,
        timeRange: appointmentTime,
        reason: reasonForVisit
      });

      setCreatedPatient(patient);
      setCreatedToken(tokenNumberPreview);
      setAssignedDocName(docName);
      setStep(3); // Success Screen
    } catch (err: any) {
      setErrorMsg(err.message || 'Walk-in registration & appointment creation failed.');
    }
  };

  const handleReset = () => {
    setStep(1);
    setFullName('');
    setAge('');
    setGender('Male');
    setEmailAddress('');
    setMobileNumber('');
    setAddress('');
    setEmergencyName('');
    setEmergencyPhone('');
    setDepartment('General Medicine');
    setReasonForVisit('Walk-in Consultation & OPD Checkup');
    setCreatedPatient(null);
    setCreatedToken('');
    setAssignedDocName('');
    setErrorMsg('');
  };

  const filteredDoctors = doctors.filter(d => 
    !department || (d.specialty && d.specialty.toLowerCase().includes(department.toLowerCase())) || (d.department && d.department.toLowerCase().includes(department.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            <UserPlus className="h-7 w-7 text-teal-600" />
            Patient Registration & Doctor Assignment
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Walk-in Patient Workflow &bull; Hospital Portal ID: <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{portalId}</span>
          </p>
        </div>

        {step !== 3 && (
          <button
            type="button"
            onClick={() => onNavigate('admin/all-patients')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            View All Patients
          </button>
        )}
      </div>

      {/* Progress Wizard Bar */}
      {step !== 3 && (
        <div className="glass-card p-4 rounded-2xl border-teal-500/20 shadow-sm flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-extrabold ${step === 1 ? 'text-teal-700' : 'text-emerald-600'}`}>
            <span className={`h-7 w-7 rounded-full flex items-center justify-center font-mono ${step === 1 ? 'bg-teal-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              1
            </span>
            <span>Step 1: Patient Information</span>
          </div>

          <div className="h-0.5 flex-1 bg-slate-200 mx-4" />

          <div className={`flex items-center gap-2 text-xs font-extrabold ${step === 2 ? 'text-teal-700' : 'text-slate-400'}`}>
            <span className={`h-7 w-7 rounded-full flex items-center justify-center font-mono ${step === 2 ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
              2
            </span>
            <span>Step 2: Appointment & Doctor Assignment</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      {/* ── STEP 1: PATIENT INFORMATION ── */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="glass-card p-6 sm:p-8 rounded-3xl border-teal-500/20 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Walk-in Patient Details
            </h3>
            <p className="text-xs text-slate-500 font-medium">Enter patient personal & emergency contact details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Suresh Raina" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

            {/* Age & Gender */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Age <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                required 
                placeholder="35" 
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input 
                type="email" 
                required 
                placeholder="patient@gmail.com" 
                value={emailAddress}
                onChange={e => setEmailAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input 
                type="tel" 
                required 
                placeholder="9876543210" 
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

            {/* Residential Address */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Residential Address</label>
              <input 
                type="text" 
                placeholder="Street Address, City, Pin Code" 
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

            {/* Emergency Contact Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Emergency Contact Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                placeholder="Relative Name" 
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

            {/* Emergency Contact Number */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Emergency Contact Number <span className="text-rose-500">*</span>
              </label>
              <input 
                type="tel" 
                required 
                placeholder="Relative Phone" 
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" className="btn-medical py-3 px-8 font-bold text-xs shadow-premium flex items-center gap-2">
              Next: Appointment & Doctor Assignment <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 2: APPOINTMENT & DOCTOR ASSIGNMENT ── */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border-teal-500/20 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                Step 2: Assign Department & Doctor
              </h3>
              <p className="text-xs text-slate-500 font-medium">Create OPD appointment and generate hospital token number.</p>
            </div>
            
            {/* Generated Badges */}
            <div className="flex gap-2">
              <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Patient ID</span>
                <span className="text-xs font-mono font-black text-teal-800">{previewPatientId}</span>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Token Number</span>
                <span className="text-xs font-mono font-black text-amber-800">{tokenNumberPreview}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Assign Department */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Assign Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              >
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pediatrics</option>
                <option>Orthopedics</option>
                <option>Dermatology</option>
                <option>ENT</option>
                <option>Ophthalmology</option>
                <option>Gynecology</option>
                <option>Dental</option>
              </select>
            </div>

            {/* Assign Doctor */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Assign Doctor <span className="text-rose-500">*</span>
              </label>
              {doctors.length === 0 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                  No approved doctors found in your hospital. Please approve doctors under Doctor Approval Requests first.
                </div>
              ) : (
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-teal-300 text-xs font-extrabold focus:outline-none bg-teal-50/30"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Appointment Slot / Date Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Appointment Date & Slot <span className="text-rose-500">*</span>
              </label>
              <select
                value={appointmentTime}
                onChange={e => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              >
                <option>Today 10:00 AM - 10:30 AM</option>
                <option>Today 10:30 AM - 11:00 AM</option>
                <option>Today 11:00 AM - 11:30 AM</option>
                <option>Today 11:30 AM - 12:00 PM</option>
                <option>Today 02:00 PM - 02:30 PM</option>
                <option>Today 03:00 PM - 03:30 PM</option>
                <option>Tomorrow 10:00 AM - 10:30 AM</option>
              </select>
            </div>

            {/* Reason for Visit */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Reason for Visit</label>
              <input 
                type="text" 
                placeholder="OPD Consultation, Fever, Routine Checkup" 
                value={reasonForVisit}
                onChange={e => setReasonForVisit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none bg-white"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <button type="submit" className="btn-medical py-3 px-8 font-extrabold text-xs shadow-premium flex items-center gap-2">
              Register Patient & Assign Doctor <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* ── STEP 3: SUCCESS CONFIRMATION ── */}
      {step === 3 && createdPatient && (
        <div className="glass-card p-8 rounded-3xl border-emerald-500/30 text-center space-y-6 shadow-premium animate-fade-in bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="h-16 w-16 bg-emerald-100 rounded-full text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800">Walk-in Patient Registered & Doctor Assigned!</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Appointment has been forwarded directly to the assigned doctor's dashboard.
            </p>
          </div>

          {/* Generated ID & Token Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-white rounded-2xl border border-emerald-200 shadow-sm text-left">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Permanent Patient ID</span>
              <span className="text-lg font-mono font-black text-teal-800 block">{createdPatient.id}</span>
              <span className="text-[10px] font-bold text-slate-700 block mt-0.5">{createdPatient.name} ({createdPatient.age}y)</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Token Number</span>
              <span className="text-lg font-mono font-black text-amber-800 block">{createdToken}</span>
              <span className="text-[10px] font-bold text-slate-700 block mt-0.5">{department}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Doctor</span>
              <span className="text-sm font-black text-slate-800 block">{assignedDocName}</span>
              <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">Status = Forwarded</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="btn-medical py-3 px-6 text-xs font-bold shadow-md"
            >
              Register Another Walk-in Patient
            </button>
            
            <button
              onClick={() => onNavigate('admin/all-patients')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              View All Patients
            </button>

            <button
              onClick={() => onNavigate('admin/appointments')}
              className="px-6 py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all"
            >
              View Appointment Requests
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
