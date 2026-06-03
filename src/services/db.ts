// Sanjeevani AI Database & Real-Time Supabase Subscription Service
// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\services\db.ts

import { createClient } from '@supabase/supabase-js';
import { Drug, PatientAllergy, PatientVitals, AISafetyEngine } from './ai';

// Initialize Supabase Client
const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface HospitalAdminProfile {
  id: string;
  hospitalName: string;
  address: string;
  adminName: string;
  email: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  specialty: string;
  clinicName: string;
  avatarUrl?: string;
  hospitalId?: string; // Links to HospitalAdminProfile.id
  approvalStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  address?: string;
  bloodGroup: string;
  allergies: PatientAllergy[];
  chronicConditions: string[];
  activeMedications: Drug[];
  emergencyContact: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  vitals: PatientVitals;
}

export interface Appointment {
  id: string;
  patientId: string;
  hospitalId: string;
  doctorId?: string;
  timeRange: string;
  reason: string;
  status: 'pending' | 'forwarded' | 'completed' | 'rejected';
  createdAt: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  date: string;
  doctorName: string;
  drugs: Drug[];
  instructions?: string;
  aiSafetyVerified: boolean;
}

export interface ConsultationFeedback {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  feedbackText: string;
  rating: number;
  date: string;
}

export interface ClinicalVisit {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  reasonForVisit: string;
  vitals: PatientVitals;
  diagnosis: string;
  notes: string;
  prescriptions?: Prescription;
  feedbackId?: string;
}

export interface UploadedReport {
  id: string;
  patientId: string;
  title: string;
  date: string;
  category: 'Lab Report' | 'Cardiology' | 'Radiology' | 'General';
  fileUrl: string;
  parsedSummary?: string;
  notes?: string;
  uploaderName: string;
}

export interface HealthAlert {
  id: string;
  patientId: string;
  date: string;
  type: 'visit' | 'prescription' | 'report' | 'emergency' | 'vitals' | 'ai_alert';
  title: string;
  message: string;
  relatedId?: string;      // linked visitId / reportId / prescriptionId
  redirectUrl?: string;    // exact view route e.g. "patient/visit/visit_1"
  read: boolean;
}

export interface MedicationFeedback {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  drugName: string;
  date: string;
  feeling: 'Better' | 'Same' | 'Worse' | 'Severe Side Effects';
  symptoms: string[];
  notes?: string;
  aiSeverity: 'stable' | 'elevated' | 'critical';
  aiAnalysis: string;
  readByDoctor: boolean;
}

export interface HealthRiskPrediction {
  predictionId: string;
  patientId: string;
  aiScore: number;
  predictedRisk: string;
  severity: 'stable' | 'moderate' | 'high' | 'critical';
  predictionNotes: string;
  generatedAt: string;
}

export interface MedicationLog {
  id: string;
  patientId: string;
  prescriptionId: string;
  medicineName: string;
  date: string; // YYYY-MM-DD
  timeSlot: 'morning' | 'afternoon' | 'night';
  status: 'taken' | 'missed';
  loggedAt: string; // ISO string
}

// ----------------------------------------------------
// Core Database State / Mock LocalStorage Database Seeds
// ----------------------------------------------------

const SEED_DOCTOR: DoctorProfile | null = null;

const SEED_PATIENTS: PatientProfile[] = [];

const SEED_VISITS: ClinicalVisit[] = [];

const SEED_REPORTS: UploadedReport[] = [];

const SEED_ALERTS: HealthAlert[] = [];

const SEED_FEEDBACKS: MedicationFeedback[] = [];

const SEED_PREDICTIONS: HealthRiskPrediction[] = [];

const SEED_MEDICATION_LOGS: MedicationLog[] = [];

const SEED_ADMINS: HospitalAdminProfile[] = [];

const SEED_APPOINTMENTS: Appointment[] = [];

const SEED_CONSULTATION_FEEDBACKS: ConsultationFeedback[] = [];

// ----------------------------------------------------
// Patient ID Generator — SJV-PAT-XXXXXX
// ----------------------------------------------------
export function generatePatientId(): string {
  const current = parseInt(localStorage.getItem('sj_patient_counter') || '2', 10);
  const next = current + 1;
  localStorage.setItem('sj_patient_counter', String(next));
  return `SJV-PAT-${String(next).padStart(6, '0')}`;
}

// Realtime Event system
type Callback = () => void;
class RealtimeBroker {
  private listeners: Record<string, Callback[]> = {};

  subscribe(channel: string, callback: Callback): () => void {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
    return () => {
      this.listeners[channel] = this.listeners[channel].filter(cb => cb !== callback);
    };
  }

  publish(channel: string) {
    if (this.listeners[channel]) {
      this.listeners[channel].forEach(cb => cb());
    }
  }
}

export const realtimeBroker = new RealtimeBroker();

export class DatabaseService {
  private static isInitialized = false;
  private static hasSynced = false;

  private static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Force clear old demo data from browser cache for production launch
    if (localStorage.getItem('sj_prod_launch_v2') !== 'true') {
      localStorage.clear();
      localStorage.setItem('sj_prod_launch_v2', 'true');
    }

    if (!localStorage.getItem('sj_doctor')) {
      localStorage.setItem('sj_doctor', JSON.stringify(SEED_DOCTOR));
    }
    if (!localStorage.getItem('sj_doctors_list')) {
      localStorage.setItem('sj_doctors_list', JSON.stringify([SEED_DOCTOR]));
    }
    const patients = localStorage.getItem('sj_patients');
    if (!patients || patients === '[]') {
      localStorage.setItem('sj_patients', JSON.stringify(SEED_PATIENTS));
    }
    const visits = localStorage.getItem('sj_visits');
    if (!visits || visits === '[]') {
      localStorage.setItem('sj_visits', JSON.stringify(SEED_VISITS));
    }
    const reports = localStorage.getItem('sj_reports');
    if (!reports || reports === '[]') {
      localStorage.setItem('sj_reports', JSON.stringify(SEED_REPORTS));
    }
    if (!localStorage.getItem('sj_alerts')) {
      localStorage.setItem('sj_alerts', JSON.stringify(SEED_ALERTS));
    }
    if (!localStorage.getItem('sj_feedbacks')) {
      localStorage.setItem('sj_feedbacks', JSON.stringify(SEED_FEEDBACKS));
    }
    if (!localStorage.getItem('sj_predictions')) {
      localStorage.setItem('sj_predictions', JSON.stringify(SEED_PREDICTIONS));
    }
    if (!localStorage.getItem('sj_medication_logs')) {
      localStorage.setItem('sj_medication_logs', JSON.stringify(SEED_MEDICATION_LOGS));
    }
    if (!localStorage.getItem('sj_patient_counter')) {
      localStorage.setItem('sj_patient_counter', '2');
    }
    if (!localStorage.getItem('sj_admins')) {
      localStorage.setItem('sj_admins', JSON.stringify(SEED_ADMINS));
    }
    if (!localStorage.getItem('sj_appointments')) {
      localStorage.setItem('sj_appointments', JSON.stringify(SEED_APPOINTMENTS));
    }
    if (!localStorage.getItem('sj_consultation_feedbacks')) {
      localStorage.setItem('sj_consultation_feedbacks', JSON.stringify(SEED_CONSULTATION_FEEDBACKS));
    }

    // Launch background asynchronous sync from Supabase
    if (!this.hasSynced) {
      this.hasSynced = true;
      this.syncFromSupabase();
    }
  }

  // ----------------------------------------------------
  // Supabase Syncing Logic
  // ----------------------------------------------------
  static async syncFromSupabase() {
    try {
      console.log('Connecting to Supabase and pulling remote clinical database...');
      
      const [
        { data: docs, error: docsError },
        { data: pats, error: patsError },
        { data: visits, error: visitsError },
        { data: reports, error: reportsError },
        { data: alerts, error: alertsError },
        { data: feedbacks, error: feedbacksError },
        { data: predictions, error: predictionsError },
        { data: logs, error: logsError },
        { data: adminsList, error: adminsError },
        { data: apts, error: aptsError }
      ] = await Promise.all([
        supabase.from('doctors').select('*'),
        supabase.from('patients').select('*'),
        supabase.from('visits').select('*'),
        supabase.from('reports').select('*'),
        supabase.from('alerts').select('*'),
        supabase.from('feedbacks').select('*'),
        supabase.from('predictions').select('*'),
        supabase.from('medication_logs').select('*'),
        supabase.from('admins').select('*'),
        supabase.from('appointments').select('*')
      ]);

      if (docsError) console.error('Error fetching doctors from Supabase:', docsError);
      if (patsError) console.error('Error fetching patients from Supabase:', patsError);
      if (visitsError) console.error('Error fetching visits from Supabase:', visitsError);
      if (reportsError) console.error('Error fetching reports from Supabase:', reportsError);
      if (alertsError) console.error('Error fetching alerts from Supabase:', alertsError);
      if (feedbacksError) console.error('Error fetching feedbacks from Supabase:', feedbacksError);
      if (predictionsError) console.error('Error fetching predictions from Supabase:', predictionsError);
      if (logsError) console.error('Error fetching medication logs from Supabase:', logsError);

      if (adminsList && adminsList.length > 0) {
        const mappedAdmins = adminsList.map((a: any) => ({
          id: a.id,
          hospitalName: a.hospital_name,
          address: a.address,
          adminName: a.admin_name,
          email: a.email
        }));
        localStorage.setItem('sj_admins', JSON.stringify(mappedAdmins));
      }


      // Hydrate local cache and sync to browser
      if (docs && docs.length > 0) {
        const localDocs = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
        
        const mappedDocs = docs.map(d => {
          const localMatch = localDocs.find((ld: any) => ld.id === d.id);
          return {
            id: d.id,
            name: d.name,
            email: d.email,
            specialty: d.specialty,
            clinicName: d.clinic_name,
            avatarUrl: d.avatar_url,
            hospitalId: (d.hospital_id !== undefined && d.hospital_id !== null) ? d.hospital_id : localMatch?.hospitalId,
            approvalStatus: (d.approval_status !== undefined && d.approval_status !== null) ? d.approval_status : localMatch?.approvalStatus
          };
        });

        // Preserve strictly local doctors that failed to sync
        localDocs.forEach((ld: any) => {
          if (!mappedDocs.find(md => md.id === ld.id)) {
            mappedDocs.push(ld);
          }
        });

        localStorage.setItem('sj_doctors_list', JSON.stringify(mappedDocs));
        
        // Also ensure a default doctor profile is set in sj_doctor if empty
        const currentDoc = localStorage.getItem('sj_doctor');
        if ((!currentDoc || currentDoc === 'null') && mappedDocs.length > 0) {
          localStorage.setItem('sj_doctor', JSON.stringify(mappedDocs[0]));
        }
      }

      if (pats && pats.length > 0) {
        const localPats = JSON.parse(localStorage.getItem('sj_patients') || '[]');
        const mappedPats = pats.map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          phone: p.phone,
          email: p.email,
          bloodGroup: p.blood_group,
          allergies: p.allergies || [],
          chronicConditions: p.chronic_conditions || [],
          activeMedications: p.active_medications || [],
          emergencyContact: p.emergency_contact || { name: '', phone: '' },
          vitals: p.vitals || {}
        }));

        // Merge: keep local-only patients that haven't synced yet
        const mergedPats = [...mappedPats];
        localPats.forEach((lp: any) => {
          if (lp && lp.id && !mergedPats.find(mp => mp.id === lp.id)) {
            mergedPats.push(lp);
          }
        });

        localStorage.setItem('sj_patients', JSON.stringify(mergedPats));
      }

      if (visits && visits.length > 0) {
        const mappedVisits = visits.map(v => ({
          id: v.id,
          patientId: v.patient_id,
          doctorId: v.doctor_id,
          doctorName: v.doctor_name,
          date: v.date,
          reasonForVisit: v.reason_for_visit,
          vitals: v.vitals,
          diagnosis: v.diagnosis,
          notes: v.notes,
          prescriptions: v.prescriptions
        }));
        localStorage.setItem('sj_visits', JSON.stringify(mappedVisits));
      }

      // Sync appointments from Supabase (ignore error if table doesn't exist yet)
      if (!aptsError && apts && apts.length > 0) {
        const localApts: Appointment[] = (JSON.parse(localStorage.getItem('sj_appointments') || '[]') as any[]).filter(Boolean);
        const mappedApts: Appointment[] = apts.filter(Boolean).map((a: any) => ({
          id: a.id,
          patientId: a.patient_id,
          hospitalId: a.hospital_id,
          doctorId: a.doctor_id,
          timeRange: a.time_range,
          reason: a.reason,
          status: a.status,
          createdAt: a.created_at
        }));
        // Merge: remote wins for existing, keep local-only records
        const merged = [...mappedApts];
        localApts.forEach((la: Appointment) => {
          if (la && la.id && !merged.find(ma => ma.id === la.id)) merged.push(la);
        });
        localStorage.setItem('sj_appointments', JSON.stringify(merged));
      }

      if (reports && reports.length > 0) {
        localStorage.setItem('sj_reports', JSON.stringify(reports));
      }

      if (alerts && alerts.length > 0) {
        const mappedAlerts = alerts.map(a => ({
          id: a.id,
          patientId: a.patient_id,
          date: a.date,
          type: a.type,
          title: a.title,
          message: a.message,
          relatedId: a.related_id,
          redirectUrl: a.redirect_url,
          read: a.read
        }));
        localStorage.setItem('sj_alerts', JSON.stringify(mappedAlerts));
      }

      if (feedbacks && feedbacks.length > 0) {
        const mappedFeedbacks = feedbacks.map(f => ({
          id: f.id,
          patientId: f.patient_id,
          patientName: f.patient_name,
          prescriptionId: f.prescription_id,
          drugName: f.drug_name,
          date: f.date,
          feeling: f.feeling,
          symptoms: f.symptoms,
          notes: f.notes,
          aiSeverity: f.ai_severity,
          aiAnalysis: f.ai_analysis,
          readByDoctor: f.read_by_doctor
        }));
        localStorage.setItem('sj_feedbacks', JSON.stringify(mappedFeedbacks));
      }

      if (predictions && predictions.length > 0) {
        const mappedPredictions = predictions.map(p => ({
          predictionId: p.prediction_id,
          patientId: p.patient_id,
          aiScore: p.ai_score,
          predictedRisk: p.predicted_risk,
          severity: p.severity,
          predictionNotes: p.prediction_notes,
          generatedAt: p.generated_at
        }));
        localStorage.setItem('sj_predictions', JSON.stringify(mappedPredictions));
      }

      if (logs && logs.length > 0) {
        const mappedLogs = logs.map(l => ({
          id: l.id,
          patientId: l.patient_id,
          prescriptionId: l.prescription_id,
          medicineName: l.medicine_name,
          date: l.date,
          timeSlot: l.time_slot,
          status: l.status,
          loggedAt: l.logged_at
        }));
        localStorage.setItem('sj_medication_logs', JSON.stringify(mappedLogs));
      }

      // Update counters if needed
      const currentPats = this.getPatients();
      if (currentPats.length > 0) {
        const maxPatNum = currentPats.reduce((max, p) => {
          const num = parseInt(p.id.replace('SJV-PAT-', ''), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }, 2);
        localStorage.setItem('sj_patient_counter', String(maxPatNum));
      }

      // Trigger full-UI visual refresh
      realtimeBroker.publish('patients-update');
      realtimeBroker.publish('visits-update');
      realtimeBroker.publish('reports-update');
      realtimeBroker.publish('feedbacks-update');
      realtimeBroker.publish('predictions-update');
      realtimeBroker.publish('medication-logs-update');
      realtimeBroker.publish('doctors-update');
      
      console.log('Supabase sync complete. Application local cache fully hydrated.');
    } catch (e) {
      console.error('Supabase async sync failed, continuing offline:', e);
    }
  }

  // ----------------------------------------------------
  // Doctor Auth Actions
  // ----------------------------------------------------
  static async loginDoctor(email: string, password: string): Promise<DoctorProfile | null> {
    this.init();
    
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      return null;
    }

    // 2. Fetch the corresponding doctor profile from the public.doctors table
    const { data: doc, error: dbError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (dbError) {
      console.error('Error fetching doctor profile from DB:', dbError);
    }

    if (!doc) {
      await supabase.auth.signOut();
      throw new Error('Access denied. This account is not registered as a Doctor.');
    }

    const profile: DoctorProfile = {
      id: doc.id,
      name: doc.name,
      email: doc.email,
      specialty: doc.specialty,
      clinicName: doc.clinic_name,
      avatarUrl: doc.avatar_url,
      hospitalId: doc.hospital_id,
      approvalStatus: doc.approval_status
    };

    // Cache the authenticated doctor
    localStorage.setItem('sj_doctor', JSON.stringify(profile));
    localStorage.setItem('sj_active_role', 'doctor');
    localStorage.setItem('sj_active_user', JSON.stringify(profile));

    // Also update sj_doctors_list
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const idx = doctors.findIndex((d: any) => d && d.id === profile.id);
    if (idx !== -1) {
      doctors[idx] = profile;
    } else {
      doctors.push(profile);
    }
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    return profile;
  }

  static async registerDoctor(name: string, email: string, specialty: string, clinic: string, password?: string, hospitalId?: string): Promise<DoctorProfile> {
    this.init();

    if (!password) {
      throw new Error('Password is required for registration.');
    }

    // 1. Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Clinician registration failed in Supabase Auth');
    }

    const docId = authData.user.id;

    const newDoc: DoctorProfile = {
      id: docId,
      name,
      email,
      specialty,
      clinicName: clinic,
      hospitalId,
      approvalStatus: hospitalId ? 'pending' : undefined,
      avatarUrl: ''
    };

    localStorage.setItem('sj_doctor', JSON.stringify(newDoc));
    localStorage.setItem('sj_active_role', 'doctor');
    localStorage.setItem('sj_active_user', JSON.stringify(newDoc));

    // Update sj_doctors_list
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const existsIdx = doctors.findIndex((d: any) => d && d.email && d.email.toLowerCase() === email.toLowerCase());
    if (existsIdx !== -1) {
      doctors[existsIdx] = newDoc;
    } else {
      doctors.push(newDoc);
    }
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    // 2. Persist to public.doctors table
    const { error: dbError } = await supabase.from('doctors').upsert({
      id: newDoc.id,
      name: newDoc.name,
      email: newDoc.email,
      specialty: newDoc.specialty,
      clinic_name: newDoc.clinicName,
      avatar_url: newDoc.avatarUrl,
      hospital_id: newDoc.hospitalId,
      approval_status: newDoc.approvalStatus
    });

    if (dbError) {
      console.error('Supabase doctor register table insert failed:', dbError);
    }

    return newDoc;
  }

  static updateDoctorProfile(doc: DoctorProfile) {
    this.init();
    localStorage.setItem('sj_doctor', JSON.stringify(doc));
    localStorage.setItem('sj_active_user', JSON.stringify(doc));

    // Also update sj_doctors_list
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const idx = doctors.findIndex((d: any) => d && d.id === doc.id);
    if (idx !== -1) {
      doctors[idx] = doc;
    } else {
      doctors.push(doc);
    }
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    // Supabase upsert
    supabase.from('doctors').upsert({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      specialty: doc.specialty,
      clinic_name: doc.clinicName,
      avatar_url: doc.avatarUrl
    }).then(({ error }) => {
      if (error) console.error('Supabase doctor update failed:', error);
    });

    realtimeBroker.publish('patients-update');
  }

  // ----------------------------------------------------
  // Patient Auth Actions
  // ----------------------------------------------------
  static requestPatientOTP(phone: string): { success: boolean; otp: string } {
    this.init();
    const patients = this.getPatients();
    const patient = patients.find(p => p.phone === phone);
    if (patient) {
      const mockOTP = '4582';
      return { success: true, otp: mockOTP };
    }
    return { success: false, otp: '' };
  }

  static loginPatient(phone: string, password: string): PatientProfile | null {
    this.init();
    const patients = this.getPatients();
    const patient = patients.find(p => p.phone === phone);
    if (patient && password.length > 0) {
      localStorage.setItem('sj_active_role', 'patient');
      localStorage.setItem('sj_active_user', JSON.stringify(patient));
      return patient;
    }
    return null;
  }

  static async loginPatientWithGoogle() {
    this.init();
    localStorage.setItem('sj_oauth_intent', 'patient');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw new Error(error.message);
  }

  static async handlePatientOAuthResolution(session: any): Promise<boolean> {
    if (!session || !session.user) return false;
    
    const intent = localStorage.getItem('sj_oauth_intent');
    if (intent === 'patient') {
      localStorage.removeItem('sj_oauth_intent');
      
      const email = session.user.email;
      const { data: existingPatients } = await supabase
        .from('patients')
        .select('*')
        .eq('email', email);
        
      if (existingPatients && existingPatients.length > 0) {
        // Returning User
        const p = existingPatients[0];
        const patient: PatientProfile = {
          id: p.id,
          name: p.name,
          age: p.age,
          phone: p.phone || '',
          email: p.email,
          bloodGroup: p.blood_group || 'Unknown',
          allergies: p.allergies || [],
          chronicConditions: p.chronic_conditions || [],
          activeMedications: p.active_medications || [],
          emergencyContact: p.emergency_contact || { name: '', phone: '' },
          vitals: p.vitals || { systolicBP: 120, diastolicBP: 80, heartRate: 72, temperature: 98.6, oxygenSat: 98, bloodGlucose: 100, weight: 70, pulseRate: 72 }
        };
        localStorage.setItem('sj_active_role', 'patient');
        localStorage.setItem('sj_active_user', JSON.stringify(patient));
        
        const patients = this.getPatients();
        if (!patients.find(x => x.id === patient.id)) {
          patients.push(patient);
          localStorage.setItem('sj_patients', JSON.stringify(patients));
        }
      } else {
        // New User Auto-Creation
        const patientId = generatePatientId();
        const newPatient: PatientProfile = {
          id: patientId,
          name: session.user.user_metadata?.full_name || 'New Patient',
          age: 30,
          phone: '',
          email: email,
          bloodGroup: 'Unknown',
          allergies: [],
          chronicConditions: [],
          activeMedications: [],
          emergencyContact: { name: '', phone: '' },
          vitals: { systolicBP: 120, diastolicBP: 80, heartRate: 72, temperature: 98.6, oxygenSat: 98, bloodGlucose: 100, weight: 70, pulseRate: 72 }
        };
        
        await supabase.from('patients').insert({
          id: newPatient.id,
          name: newPatient.name,
          age: newPatient.age,
          phone: newPatient.phone,
          email: newPatient.email,
          blood_group: newPatient.bloodGroup,
          allergies: newPatient.allergies,
          chronic_conditions: newPatient.chronicConditions,
          active_medications: newPatient.activeMedications,
          emergency_contact: newPatient.emergencyContact,
          vitals: newPatient.vitals
        });
        
        localStorage.setItem('sj_active_role', 'patient');
        localStorage.setItem('sj_active_user', JSON.stringify(newPatient));
        
        const patients = this.getPatients();
        patients.push(newPatient);
        localStorage.setItem('sj_patients', JSON.stringify(patients));
      }
      return true;
    }
    return false;
  }

  static logout() {
    localStorage.removeItem('sj_active_role');
    localStorage.removeItem('sj_active_user');
  }

  static getActiveSession(): { role: 'doctor' | 'patient' | 'admin' | null; user: any } {
    const role = localStorage.getItem('sj_active_role') as 'doctor' | 'patient' | 'admin' | null;
    let user = JSON.parse(localStorage.getItem('sj_active_user') || 'null');
    
    // Ensure migrations run if admin BEFORE returning user
    if (role === 'admin') {
      const admins = this.getAdmins(); // Triggers migration if needed
      if (user && user.email) {
        user = admins.find(a => a.email === user.email) || user;
      }
    }

    // Cleanup legacy stock photos for existing sessions
    if (user && typeof user.avatarUrl === 'string' && user.avatarUrl.includes('unsplash.com')) {
      user.avatarUrl = '';
      localStorage.setItem('sj_active_user', JSON.stringify(user));
      
      const sjDoctor = JSON.parse(localStorage.getItem('sj_doctor') || 'null');
      if (sjDoctor && typeof sjDoctor.avatarUrl === 'string' && sjDoctor.avatarUrl.includes('unsplash.com')) {
        sjDoctor.avatarUrl = '';
        localStorage.setItem('sj_doctor', JSON.stringify(sjDoctor));
      }
    }
    
    return { role, user };
  }

  // ----------------------------------------------------
  // Hospital Admin Actions
  // ----------------------------------------------------
  static getAdmins(): HospitalAdminProfile[] {
    this.init();
    let admins: HospitalAdminProfile[] = JSON.parse(localStorage.getItem('sj_admins') || '[]');
    admins = admins.filter(a => a !== null && a !== undefined);
    let migrated = false;

    // Auto-migrate old UUIDs to new format seamlessly
    admins.forEach((admin) => {
      if (admin.id && !admin.id.startsWith('SJV-HTPL-')) {
        admin.id = `SJV-HTPL-${Math.floor(1000 + Math.random() * 9000)}`;
        migrated = true;
      }
    });

    if (migrated) {
      localStorage.setItem('sj_admins', JSON.stringify(admins));
      const activeUser = JSON.parse(localStorage.getItem('sj_active_user') || 'null');
      if (activeUser && activeUser.adminName && !activeUser.id.startsWith('SJV-HTPL-')) {
        const matchingAdmin = admins.find((a) => a.email === activeUser.email);
        if (matchingAdmin) {
          localStorage.setItem('sj_active_user', JSON.stringify(matchingAdmin));
        }
      }
    }
    
    return admins;
  }

  static async registerAdmin(hospitalName: string, address: string, adminName: string, email: string, password?: string): Promise<HospitalAdminProfile> {
    this.init();
    if (!password) throw new Error('Password is required');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Admin registration failed');

    const customId = `SJV-HTPL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAdmin: HospitalAdminProfile = {
      id: customId,
      hospitalName,
      address,
      adminName,
      email
    };

    const admins = this.getAdmins();
    admins.push(newAdmin);
    localStorage.setItem('sj_admins', JSON.stringify(admins));

    // Save to Supabase
    const { error: dbError } = await supabase.from('admins').upsert({
      id: newAdmin.id,
      hospital_name: newAdmin.hospitalName,
      address: newAdmin.address,
      admin_name: newAdmin.adminName,
      email: newAdmin.email
    });
    if (dbError) console.error('Supabase admin registration failed:', dbError);
    
    localStorage.setItem('sj_active_role', 'admin');
    localStorage.setItem('sj_active_user', JSON.stringify(newAdmin));
    return newAdmin;
  }

  static async updateAdminProfile(admin: HospitalAdminProfile) {
    this.init();
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.id === admin.id);
    if (idx !== -1) {
      admins[idx] = admin;
      localStorage.setItem('sj_admins', JSON.stringify(admins));
      localStorage.setItem('sj_active_user', JSON.stringify(admin));
      
      const { error: dbError } = await supabase.from('admins').upsert({
        id: admin.id,
        hospital_name: admin.hospitalName,
        address: admin.address,
        admin_name: admin.adminName,
        email: admin.email
      });
      if (dbError) console.error('Supabase admin update failed:', dbError);
    }
  }

  static async loginAdmin(email: string, password: string): Promise<HospitalAdminProfile | null> {
    this.init();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw new Error(authError.message);
    if (!authData.user) return null;

    // Fetch the admin row from remote Supabase database first to guarantee a stable ID
    const { data: dbAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!dbAdmin) {
      await supabase.auth.signOut();
      throw new Error('Access denied. This account is not registered as a Hospital Admin.');
    }

    let admin: HospitalAdminProfile = {
      id: dbAdmin.id,
      hospitalName: dbAdmin.hospital_name,
      address: dbAdmin.address,
      adminName: dbAdmin.admin_name,
      email: dbAdmin.email
    };

    // Update locally cached admins list
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.email === email);
    if (idx !== -1) {
      admins[idx] = admin;
    } else {
      admins.push(admin);
    }
    localStorage.setItem('sj_admins', JSON.stringify(admins));

    localStorage.setItem('sj_active_role', 'admin');
    localStorage.setItem('sj_active_user', JSON.stringify(admin));
    return admin;
  }

  static getDoctors(): DoctorProfile[] {
    this.init();
    let doctors: DoctorProfile[] = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    doctors = doctors.filter(d => d !== null && d !== undefined);
    let migrated = false;
    
    // Auto-migrate orphaned doctors to the first available admin if they have an old UUID format
    const admins = this.getAdmins();
    if (admins.length > 0) {
      doctors.forEach(doc => {
        if (doc.hospitalId && !doc.hospitalId.startsWith('SJV-HTPL-')) {
          doc.hospitalId = admins[0].id;
          migrated = true;
        }
      });
    }

    if (migrated) {
      localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));
    }
    
    return doctors;
  }

  static updateDoctorApproval(doctorId: string, status: 'accepted' | 'rejected') {
    const doctors = this.getDoctors();
    const docIdx = doctors.findIndex(d => d.id === doctorId);
    if (docIdx !== -1) {
      doctors[docIdx].approvalStatus = status;
      localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));
      
      // Update session if it's the current user
      const activeUser = JSON.parse(localStorage.getItem('sj_active_user') || 'null');
      if (activeUser && activeUser.id === doctorId) {
        localStorage.setItem('sj_active_user', JSON.stringify(doctors[docIdx]));
        localStorage.setItem('sj_doctor', JSON.stringify(doctors[docIdx]));
      }
      
      // Persist approval_status to Supabase so it survives page refreshes
      supabase.from('doctors').update({ approval_status: status }).eq('id', doctorId).then(({ error }) => {
        if (error) console.error('Supabase doctor approval update failed:', error);
        else console.log(`Doctor ${doctorId} approval_status set to '${status}' in Supabase`);
      });
      
      realtimeBroker.publish('doctors-update');
    }
  }

  // ----------------------------------------------------
  // Appointment Actions
  // ----------------------------------------------------
  static getAppointments(): Appointment[] {
    this.init();
    const apts = JSON.parse(localStorage.getItem('sj_appointments') || '[]');
    return (Array.isArray(apts) ? apts : []).filter(Boolean);
  }

  static requestAppointment(params: { patientId: string; hospitalId: string; timeRange: string; reason: string }): Appointment;
  static requestAppointment(patientId: string, hospitalId: string, timeRange: string, reason: string): Appointment;
  static requestAppointment(patientIdOrParams: string | { patientId: string; hospitalId: string; timeRange: string; reason: string }, hospitalId?: string, timeRange?: string, reason?: string): Appointment {
    let patientId: string, hId: string, tRange: string, rsn: string;
    if (typeof patientIdOrParams === 'object') {
      patientId = patientIdOrParams.patientId;
      hId = patientIdOrParams.hospitalId;
      tRange = patientIdOrParams.timeRange;
      rsn = patientIdOrParams.reason;
    } else {
      patientId = patientIdOrParams;
      hId = hospitalId!;
      tRange = timeRange!;
      rsn = reason!;
    }
    const apts = this.getAppointments();
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId,
      hospitalId: hId,
      timeRange: tRange,
      reason: rsn,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    apts.unshift(newApt);
    localStorage.setItem('sj_appointments', JSON.stringify(apts));

    // Persist to Supabase
    supabase.from('appointments').insert({
      id: newApt.id,
      patient_id: newApt.patientId,
      hospital_id: newApt.hospitalId,
      time_range: newApt.timeRange,
      reason: newApt.reason,
      status: newApt.status,
      created_at: newApt.createdAt
    }).then(({ error }) => {
      if (error) console.error('Supabase appointment insert failed:', error);
    });

    realtimeBroker.publish('appointments-update');
    return newApt;
  }

  static forwardAppointment(appointmentId: string, doctorId: string) {
    const apts = this.getAppointments();
    const aptIdx = apts.findIndex(a => a.id === appointmentId);
    if (aptIdx !== -1) {
      apts[aptIdx].doctorId = doctorId;
      apts[aptIdx].status = 'forwarded';
      localStorage.setItem('sj_appointments', JSON.stringify(apts));

      // Persist to Supabase
      supabase.from('appointments').update({ doctor_id: doctorId, status: 'forwarded' }).eq('id', appointmentId).then(({ error }) => {
        if (error) console.error('Supabase appointment forward failed:', error);
      });

      realtimeBroker.publish('appointments-update');
    }
  }

  static markAppointmentCompleted(appointmentId: string) {
    const apts = this.getAppointments();
    const aptIdx = apts.findIndex(a => a.id === appointmentId);
    if (aptIdx !== -1) {
      apts[aptIdx].status = 'completed';
      localStorage.setItem('sj_appointments', JSON.stringify(apts));
      realtimeBroker.publish('appointments-update');
    }
  }

  // ----------------------------------------------------
  // Consultation Feedback Actions
  // ----------------------------------------------------
  static getConsultationFeedbacks(): ConsultationFeedback[] {
    this.init();
    return JSON.parse(localStorage.getItem('sj_consultation_feedbacks') || '[]');
  }

  static addConsultationFeedback(visitId: string, patientId: string, doctorId: string, feedbackText: string, rating: number) {
    const feedbacks = this.getConsultationFeedbacks();
    const newFb: ConsultationFeedback = {
      id: `cfb_${Date.now()}`,
      visitId,
      patientId,
      doctorId,
      feedbackText,
      rating,
      date: new Date().toISOString()
    };
    feedbacks.unshift(newFb);
    localStorage.setItem('sj_consultation_feedbacks', JSON.stringify(feedbacks));

    const visits = this.getVisits();
    const vIdx = visits.findIndex(v => v.id === visitId);
    if (vIdx !== -1) {
      visits[vIdx].feedbackId = newFb.id;
      localStorage.setItem('sj_visits', JSON.stringify(visits));
    }

    realtimeBroker.publish('consultation-feedbacks-update');
    realtimeBroker.publish('visits-update');
  }

  // ----------------------------------------------------
  // Patients Retrieval & Management
  // ----------------------------------------------------
  static getPatients(): PatientProfile[] {
    this.init();
    return JSON.parse(localStorage.getItem('sj_patients') || '[]');
  }

  static getPatientById(id: string): PatientProfile | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  static registerPatient(params: {
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    phone: string;
    email: string;
    address?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactEmail?: string;
    emergencyContactAddress?: string;
    allergies: Array<{ allergen: string; severity: string; reaction: string }>;
    chronicConditions: string[];
  }): PatientProfile {
    this.init();
    const patientId = generatePatientId();
    const newPatient: PatientProfile = {
      id: patientId,
      name: params.name,
      age: params.age,
      phone: params.phone,
      email: params.email,
      address: params.address,
      bloodGroup: params.bloodGroup,
      allergies: params.allergies.map(a => ({
        allergen: a.allergen,
        severity: a.severity as 'Mild' | 'Moderate' | 'Severe',
        reaction: a.reaction
      })),
      chronicConditions: params.chronicConditions,
      activeMedications: [],
      emergencyContact: {
        name: params.emergencyContactName,
        phone: params.emergencyContactPhone,
        email: params.emergencyContactEmail,
        address: params.emergencyContactAddress
      },
      vitals: {
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 72,
        temperature: 98.6,
        oxygenSat: 98,
        bloodGlucose: 100,
        weight: 70,
        pulseRate: 72,
      },
    };

    const patients = this.getPatients();
    patients.push(newPatient);
    localStorage.setItem('sj_patients', JSON.stringify(patients));
    localStorage.setItem('sj_active_role', 'patient');
    localStorage.setItem('sj_active_user', JSON.stringify(newPatient));

    // Supabase insert patient
    supabase.from('patients').insert({
      id: newPatient.id,
      name: newPatient.name,
      age: newPatient.age,
      phone: newPatient.phone,
      email: newPatient.email,
      blood_group: newPatient.bloodGroup,
      allergies: newPatient.allergies,
      chronic_conditions: newPatient.chronicConditions,
      active_medications: newPatient.activeMedications,
      emergency_contact: newPatient.emergencyContact,
      vitals: newPatient.vitals
    }).then(({ error }) => {
      if (error) console.error('Supabase patient register failed:', error);
    });

    realtimeBroker.publish('patients-update');
    return newPatient;
  }

  static updatePatientProfile(pat: PatientProfile) {
    this.init();
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === pat.id);
    if (idx !== -1) {
      patients[idx] = pat;
      localStorage.setItem('sj_patients', JSON.stringify(patients));
      localStorage.setItem('sj_active_user', JSON.stringify(pat));

      // Supabase upsert patient
      supabase.from('patients').upsert({
        id: pat.id,
        name: pat.name,
        age: pat.age,
        phone: pat.phone,
        email: pat.email,
        blood_group: pat.bloodGroup,
        allergies: pat.allergies,
        chronic_conditions: pat.chronicConditions,
        active_medications: pat.activeMedications,
        emergency_contact: pat.emergencyContact,
        vitals: pat.vitals
      }).then(({ error }) => {
        if (error) console.error('Supabase patient update failed:', error);
      });

      realtimeBroker.publish('patients-update');
      realtimeBroker.publish(`patient-${pat.id}`);
    }
  }

  static updatePatientVitals(patientId: string, vitals: PatientVitals): boolean {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === patientId);
    if (index !== -1) {
      patients[index].vitals = vitals;
      localStorage.setItem('sj_patients', JSON.stringify(patients));

      // Supabase vitals sync
      const pat = patients[index];
      supabase.from('patients').upsert({
        id: pat.id,
        name: pat.name,
        age: pat.age,
        phone: pat.phone,
        email: pat.email,
        blood_group: pat.bloodGroup,
        allergies: pat.allergies,
        chronic_conditions: pat.chronicConditions,
        active_medications: pat.activeMedications,
        emergency_contact: pat.emergencyContact,
        vitals: pat.vitals
      }).then(({ error }) => {
        if (error) console.error('Supabase vitals update failed:', error);
      });

      realtimeBroker.publish('patients-update');
      realtimeBroker.publish(`patient-${patientId}`);
      return true;
    }
    return false;
  }

  // ----------------------------------------------------
  // Clinical Visits
  // ----------------------------------------------------
  static getVisits(patientId?: string): ClinicalVisit[] {
    this.init();
    let visits: ClinicalVisit[] = JSON.parse(localStorage.getItem('sj_visits') || '[]');
    visits = visits.filter(v => v !== null && v !== undefined);
    if (patientId) {
      return visits.filter(v => v.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
    }
    return visits.sort((a,b) => b.date.localeCompare(a.date));
  }

  static addVisit(patientId: string, doctorId: string, reason: string, vitals: PatientVitals, diagnosis: string, notes: string, drugs: Drug[], instructions?: string): ClinicalVisit | null {
    this.init();
    const doctor = JSON.parse(localStorage.getItem('sj_doctor') || 'null') as DoctorProfile;
    const patient = this.getPatientById(patientId);
    
    if (!patient) return null;

    const docName = doctor ? doctor.name : 'Dr. Aarav Mehta';
    const visitId = `visit_${Date.now()}`;
    const visitDate = new Date().toISOString().split('T')[0];

    const hasDrugs = drugs && drugs.length > 0;
    const prescription: Prescription | undefined = hasDrugs ? {
      id: `pres_${Date.now()}`,
      visitId,
      date: visitDate,
      doctorName: docName,
      drugs,
      instructions,
      aiSafetyVerified: true
    } : undefined;

    const newVisit: ClinicalVisit = {
      id: visitId,
      patientId,
      doctorId: doctorId || 'doc_1',
      doctorName: docName,
      date: visitDate,
      reasonForVisit: reason,
      vitals,
      diagnosis,
      notes,
      prescriptions: prescription
    };

    const visits = this.getVisits();
    visits.push(newVisit);
    localStorage.setItem('sj_visits', JSON.stringify(visits));

    const patients = this.getPatients();
    const pIndex = patients.findIndex(p => p.id === patientId);
    if (pIndex !== -1) {
      patients[pIndex].vitals = vitals;
      if (hasDrugs) {
        const currentMeds = [...patients[pIndex].activeMedications];
        drugs.forEach(newD => {
          const exists = currentMeds.findIndex(m => m.name.toLowerCase() === newD.name.toLowerCase());
          if (exists !== -1) {
            currentMeds[exists] = newD;
          } else {
            currentMeds.push(newD);
          }
        });
        patients[pIndex].activeMedications = currentMeds;
      }
      localStorage.setItem('sj_patients', JSON.stringify(patients));
    }

    const alerts = this.getAlerts(patientId);
    const visitAlertId = `alert_${Date.now()}`;
    const newAlert: HealthAlert = {
      id: visitAlertId,
      patientId,
      date: visitDate,
      type: 'visit',
      title: 'New Clinical Visit Summary Available',
      message: `Dr. ${docName} has updated your health records with a clinical diagnosis of "${diagnosis}".`,
      relatedId: visitId,
      redirectUrl: `patient/visit/${visitId}`,
      read: false
    };

    let presAlert: HealthAlert | undefined;
    if (hasDrugs && prescription) {
      presAlert = {
        id: `alert_pres_${Date.now()}`,
        patientId,
        date: visitDate,
        type: 'prescription',
        title: 'Prescription Updated',
        message: `Dr. ${docName} prescribed ${drugs.length} medication(s). Review your updated prescription now.`,
        relatedId: prescription.id,
        redirectUrl: `patient/visit/${visitId}`,
        read: false
      };
      alerts.unshift(presAlert);
    }
    alerts.unshift(newAlert);
    localStorage.setItem('sj_alerts', JSON.stringify(alerts));

    // Supabase inserts
    supabase.from('visits').insert({
      id: visitId,
      patient_id: patientId,
      doctor_id: doctorId || 'doc_1',
      doctor_name: docName,
      date: visitDate,
      reason_for_visit: reason,
      vitals: vitals,
      diagnosis: diagnosis,
      notes: notes,
      prescriptions: prescription
    }).then(({ error }) => {
      if (error) console.error('Supabase visit insert failed:', error);
    });

    if (pIndex !== -1) {
      const pat = patients[pIndex];
      supabase.from('patients').upsert({
        id: pat.id,
        name: pat.name,
        age: pat.age,
        phone: pat.phone,
        email: pat.email,
        blood_group: pat.bloodGroup,
        allergies: pat.allergies,
        chronic_conditions: pat.chronicConditions,
        active_medications: pat.activeMedications,
        emergency_contact: pat.emergencyContact,
        vitals: pat.vitals
      }).then(({ error }) => {
        if (error) console.error('Supabase active medications sync failed:', error);
      });
    }

    const alertsToInsert = [
      {
        id: visitAlertId,
        patient_id: patientId,
        date: visitDate,
        type: 'visit',
        title: newAlert.title,
        message: newAlert.message,
        related_id: visitId,
        redirect_url: newAlert.redirectUrl,
        read: false
      }
    ];

    if (presAlert) {
      alertsToInsert.push({
        id: presAlert.id,
        patient_id: patientId,
        date: visitDate,
        type: 'prescription',
        title: presAlert.title,
        message: presAlert.message,
        related_id: prescription!.id,
        redirect_url: presAlert.redirectUrl,
        read: false
      });
    }

    supabase.from('alerts').insert(alertsToInsert).then(({ error }) => {
      if (error) console.error('Supabase visit alerts sync failed:', error);
    });

    realtimeBroker.publish('patients-update');
    realtimeBroker.publish('visits-update');
    realtimeBroker.publish(`patient-${patientId}`);
    realtimeBroker.publish(`alerts-${patientId}`);

    return newVisit;
  }

  // ----------------------------------------------------
  // Lab Reports
  // ----------------------------------------------------
  static getReports(patientId?: string): UploadedReport[] {
    this.init();
    let reports: UploadedReport[] = JSON.parse(localStorage.getItem('sj_reports') || '[]');
    reports = reports.filter(r => r !== null && r !== undefined);
    if (patientId) {
      return reports.filter(r => r.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
    }
    return reports.sort((a,b) => b.date.localeCompare(a.date));
  }

  static uploadReport(patientId: string, title: string, category: UploadedReport['category'], parsedSummary: string, notes?: string): UploadedReport {
    this.init();
    const reportDate = new Date().toISOString().split('T')[0];
    const newReport: UploadedReport = {
      id: `rep_${Date.now()}`,
      patientId,
      title,
      date: reportDate,
      category,
      fileUrl: '#',
      parsedSummary,
      notes,
      uploaderName: 'Sanjeevani Smart AI Scanning'
    };

    const reports = this.getReports();
    reports.push(newReport);
    localStorage.setItem('sj_reports', JSON.stringify(reports));

    const alerts = this.getAlerts(patientId);
    const newAlert: HealthAlert = {
      id: `alert_rep_${Date.now()}`,
      patientId,
      date: reportDate,
      type: 'report',
      title: 'New Lab Report Analyzed by AI',
      message: `AI has processed your new lab report "${title}". Critical findings and risk analysis are ready.`,
      relatedId: newReport.id,
      redirectUrl: `patient/report/${newReport.id}`,
      read: false
    };
    alerts.unshift(newAlert);
    localStorage.setItem('sj_alerts', JSON.stringify(alerts));

    // Supabase inserts
    supabase.from('reports').insert({
      id: newReport.id,
      patient_id: patientId,
      title: title,
      date: reportDate,
      category: category,
      file_url: '#',
      parsed_summary: parsedSummary,
      notes: notes,
      uploader_name: newReport.uploaderName
    }).then(({ error }) => {
      if (error) console.error('Supabase report upload failed:', error);
    });

    supabase.from('alerts').insert({
      id: newAlert.id,
      patient_id: patientId,
      date: reportDate,
      type: 'report',
      title: newAlert.title,
      message: newAlert.message,
      related_id: newReport.id,
      redirect_url: newAlert.redirectUrl,
      read: false
    }).then(({ error }) => {
      if (error) console.error('Supabase report alert failed:', error);
    });

    realtimeBroker.publish('reports-update');
    realtimeBroker.publish(`patient-${patientId}`);
    realtimeBroker.publish(`alerts-${patientId}`);

    return newReport;
  }

  // ----------------------------------------------------
  // Notifications & Health Alerts
  // ----------------------------------------------------
  static getAlerts(patientId?: string): HealthAlert[] {
    this.init();
    return JSON.parse(localStorage.getItem('sj_alerts') || '[]');
  }

  static markAlertsAsRead(patientId: string) {
    const alerts = this.getAlerts();
    alerts.forEach(a => {
      if (a.patientId === patientId) {
        a.read = true;
      }
    });
    localStorage.setItem('sj_alerts', JSON.stringify(alerts));

    // Supabase update alerts as read
    supabase.from('alerts').update({ read: true }).eq('patient_id', patientId).then(({ error }) => {
      if (error) console.error('Supabase markAlertsAsRead failed:', error);
    });

    realtimeBroker.publish(`alerts-${patientId}`);
  }

  static markAlertAsRead(alertId: string) {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      const patientId = alerts[idx].patientId;
      alerts[idx].read = true;
      localStorage.setItem('sj_alerts', JSON.stringify(alerts));

      // Supabase update alert as read
      supabase.from('alerts').update({ read: true }).eq('id', alertId).then(({ error }) => {
        if (error) console.error('Supabase markAlertAsRead failed:', error);
      });

      realtimeBroker.publish(`alerts-${patientId}`);
    }
  }

  static addEmergencyAlert(patientId: string, message: string) {
    this.init();
    const date = new Date().toISOString().split('T')[0];
    const alerts = this.getAlerts(patientId);
    const newAlert: HealthAlert = {
      id: `alert_emergency_${Date.now()}`,
      patientId,
      date,
      type: 'emergency',
      title: '🚨 Emergency Health Alert',
      message,
      redirectUrl: 'patient/qr',
      read: false
    };
    alerts.unshift(newAlert);
    localStorage.setItem('sj_alerts', JSON.stringify(alerts));

    // Supabase insert alert
    supabase.from('alerts').insert({
      id: newAlert.id,
      patient_id: patientId,
      date: date,
      type: 'emergency',
      title: newAlert.title,
      message: newAlert.message,
      redirect_url: newAlert.redirectUrl,
      read: false
    }).then(({ error }) => {
      if (error) console.error('Supabase emergency alert failed:', error);
    });

    realtimeBroker.publish(`alerts-${patientId}`);
    realtimeBroker.publish(`emergency-${patientId}`);
    return newAlert;
  }

  // ----------------------------------------------------
  // Post-Prescription Medication Feedback Actions
  // ----------------------------------------------------
  static getFeedbacks(patientId?: string): MedicationFeedback[] {
    this.init();
    const feedbacks: MedicationFeedback[] = JSON.parse(localStorage.getItem('sj_feedbacks') || '[]');
    if (patientId) {
      return feedbacks.filter(f => f.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
    }
    return feedbacks.sort((a,b) => b.date.localeCompare(a.date));
  }

  static submitFeedback(params: {
    patientId: string;
    patientName: string;
    prescriptionId: string;
    drugName: string;
    feeling: MedicationFeedback['feeling'];
    symptoms: string[];
    notes?: string;
  }): MedicationFeedback {
    this.init();
    const analysis = AISafetyEngine.analyzeFeedback(params.drugName, params.feeling, params.symptoms);
    
    const newFeedback: MedicationFeedback = {
      id: `fb_${Date.now()}`,
      patientId: params.patientId,
      patientName: params.patientName,
      prescriptionId: params.prescriptionId,
      drugName: params.drugName,
      date: new Date().toISOString().split('T')[0],
      feeling: params.feeling,
      symptoms: params.symptoms,
      notes: params.notes,
      aiSeverity: analysis.aiSeverity,
      aiAnalysis: analysis.aiAnalysis,
      readByDoctor: false
    };

    const feedbacks = this.getFeedbacks();
    feedbacks.unshift(newFeedback);
    localStorage.setItem('sj_feedbacks', JSON.stringify(feedbacks));

    const alertId = `alert_feedback_${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const alertMsg = `${params.patientName} reported ${analysis.aiSeverity} side effects (${params.symptoms.join(', ')}) after taking ${params.drugName}.`;

    if (analysis.aiSeverity === 'critical' || analysis.aiSeverity === 'elevated') {
      const docAlert: HealthAlert = {
        id: alertId,
        patientId: params.patientId,
        date,
        type: 'ai_alert',
        title: `🚨 Side Effect Alert: ${params.drugName}`,
        message: alertMsg,
        redirectUrl: `doctor/patient/${params.patientId}`,
        read: false
      };

      const alerts = this.getAlerts();
      alerts.unshift(docAlert);
      localStorage.setItem('sj_alerts', JSON.stringify(alerts));
    }

    // Supabase inserts
    supabase.from('feedbacks').insert({
      id: newFeedback.id,
      patient_id: params.patientId,
      patient_name: params.patientName,
      prescription_id: params.prescriptionId,
      drug_name: params.drugName,
      date: newFeedback.date,
      feeling: params.feeling,
      symptoms: params.symptoms,
      notes: params.notes,
      ai_severity: analysis.aiSeverity,
      ai_analysis: analysis.aiAnalysis,
      read_by_doctor: false
    }).then(({ error }) => {
      if (error) console.error('Supabase feedback submission failed:', error);
    });

    if (analysis.aiSeverity === 'critical' || analysis.aiSeverity === 'elevated') {
      supabase.from('alerts').insert({
        id: alertId,
        patient_id: params.patientId,
        date,
        type: 'ai_alert',
        title: `🚨 Side Effect Alert: ${params.drugName}`,
        message: alertMsg,
        redirect_url: `doctor/patient/${params.patientId}`,
        read: false
      }).then(({ error }) => {
        if (error) console.error('Supabase feedback alert failed:', error);
      });
    }

    realtimeBroker.publish('patients-update');
    realtimeBroker.publish('feedbacks-update');
    realtimeBroker.publish(`patient-${params.patientId}`);
    realtimeBroker.publish(`alerts-${params.patientId}`);

    try {
      this.recalculatePredictions(params.patientId);
    } catch (e) {
      console.error(e);
    }

    return newFeedback;
  }

  static markFeedbackAsRead(feedbackId: string) {
    const feedbacks = this.getFeedbacks();
    const idx = feedbacks.findIndex(f => f.id === feedbackId);
    if (idx !== -1) {
      const patientId = feedbacks[idx].patientId;
      feedbacks[idx].readByDoctor = true;
      localStorage.setItem('sj_feedbacks', JSON.stringify(feedbacks));

      // Supabase feedback read sync
      supabase.from('feedbacks').update({ read_by_doctor: true }).eq('id', feedbackId).then(({ error }) => {
        if (error) console.error('Supabase markFeedbackAsRead failed:', error);
      });
      
      realtimeBroker.publish('feedbacks-update');
      realtimeBroker.publish(`patient-${patientId}`);
    }
  }

  // ----------------------------------------------------
  // AI Health Risk Prediction Actions
  // ----------------------------------------------------
  static getPredictions(patientId?: string): HealthRiskPrediction[] {
    this.init();
    const predictions: HealthRiskPrediction[] = JSON.parse(localStorage.getItem('sj_predictions') || '[]');
    if (patientId) {
      return predictions.filter(p => p.patientId === patientId).sort((a,b) => b.generatedAt.localeCompare(a.generatedAt));
    }
    return predictions.sort((a,b) => b.generatedAt.localeCompare(a.generatedAt));
  }

  static recalculatePredictions(patientId: string): HealthRiskPrediction {
    this.init();
    const patient = this.getPatientById(patientId);
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`);
    }

    const feedbacks = this.getFeedbacks(patientId);
    const visits = this.getVisits(patientId);

    const result = AISafetyEngine.predictHealthRisk(patient, feedbacks, visits);

    const newPrediction: HealthRiskPrediction = {
      predictionId: `pred_${Date.now()}`,
      patientId,
      aiScore: result.score,
      predictedRisk: result.predictedRisk,
      severity: result.severity,
      predictionNotes: result.notes || '',
      generatedAt: new Date().toISOString().split('T')[0]
    };

    const predictions = this.getPredictions();
    predictions.unshift(newPrediction);
    localStorage.setItem('sj_predictions', JSON.stringify(predictions));

    const alertId = `alert_pred_${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const alertMsg = `AI Health Risk Intelligence has detected ${result.severity.toUpperCase()} risk of "${result.predictedRisk}". ${result.notes || ''}`;

    if (result.severity === 'high' || result.severity === 'critical') {
      const newAlert: HealthAlert = {
        id: alertId,
        patientId,
        date,
        type: 'ai_alert',
        title: `⚠️ AI Health Prediction: ${result.severity.toUpperCase()} Risk`,
        message: alertMsg,
        redirectUrl: `patient/dashboard`,
        read: false
      };

      const alerts = this.getAlerts();
      alerts.unshift(newAlert);
      localStorage.setItem('sj_alerts', JSON.stringify(alerts));
    }

    // Supabase inserts
    supabase.from('predictions').insert({
      prediction_id: newPrediction.predictionId,
      patient_id: patientId,
      ai_score: result.score,
      predicted_risk: result.predictedRisk,
      severity: result.severity,
      prediction_notes: result.notes,
      generated_at: newPrediction.generatedAt
    }).then(({ error }) => {
      if (error) console.error('Supabase prediction save failed:', error);
    });

    if (result.severity === 'high' || result.severity === 'critical') {
      supabase.from('alerts').insert({
        id: alertId,
        patient_id: patientId,
        date,
        type: 'ai_alert',
        title: `⚠️ AI Health Prediction: ${result.severity.toUpperCase()} Risk`,
        message: alertMsg,
        redirect_url: `patient/dashboard`,
        read: false
      }).then(({ error }) => {
        if (error) console.error('Supabase prediction alert failed:', error);
      });
    }

    realtimeBroker.publish('patients-update');
    realtimeBroker.publish('predictions-update');
    realtimeBroker.publish(`patient-${patientId}`);
    realtimeBroker.publish(`alerts-${patientId}`);

    return newPrediction;
  }

  // ----------------------------------------------------
  // Smart Medication Log Actions
  // ----------------------------------------------------
  static getMedicationLogs(patientId?: string): MedicationLog[] {
    this.init();
    const logs: MedicationLog[] = JSON.parse(localStorage.getItem('sj_medication_logs') || '[]');
    if (patientId) {
      return logs.filter(l => l.patientId === patientId).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
    }
    return logs.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
  }

  static getAdherenceScore(patientId: string): number {
    const logs = this.getMedicationLogs(patientId);
    if (logs.length === 0) return 100;

    const taken = logs.filter(l => l.status === 'taken').length;
    const total = logs.length;

    if (total === 0) return 100;
    return (taken / total) * 100;
  }

  static logMedication(
    patientId: string,
    prescriptionId: string,
    medicineName: string,
    date: string,
    timeSlot: MedicationLog['timeSlot'],
    status: MedicationLog['status']
  ): MedicationLog {
    this.init();
    const logs = this.getMedicationLogs();
    
    const existingIndex = logs.findIndex(
      l => l.patientId === patientId &&
           l.prescriptionId === prescriptionId &&
           l.medicineName.toLowerCase() === medicineName.toLowerCase() &&
           l.date === date &&
           l.timeSlot === timeSlot
    );

    let newLog: MedicationLog;
    if (existingIndex !== -1) {
      logs[existingIndex].status = status;
      logs[existingIndex].loggedAt = new Date().toISOString();
      newLog = logs[existingIndex];
    } else {
      newLog = {
        id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        patientId,
        prescriptionId,
        medicineName,
        date,
        timeSlot,
        status,
        loggedAt: new Date().toISOString()
      };
      logs.unshift(newLog);
    }

    localStorage.setItem('sj_medication_logs', JSON.stringify(logs));

    const score = this.getAdherenceScore(patientId);

    const alertId = `alert_adherence_${Date.now()}`;
    const alertDate = new Date().toISOString().split('T')[0];
    const alertMsg = `Clinical Adherence Watchlist: Patient's medication adherence has dropped to ${score.toFixed(0)}% (critical threshold < 80%).`;

    const alerts = this.getAlerts();
    const duplicateExists = alerts.some(
      a => a.patientId === patientId && a.type === 'ai_alert' && a.title.includes('Adherence Alert') && a.date === alertDate
    );

    if (score < 80 && !duplicateExists) {
      const complianceAlert: HealthAlert = {
        id: alertId,
        patientId,
        date: alertDate,
        type: 'ai_alert',
        title: `🚨 Adherence Alert: Critical Drop (${score.toFixed(0)}%)`,
        message: alertMsg,
        redirectUrl: `doctor/patient/${patientId}`,
        read: false
      };
      alerts.unshift(complianceAlert);
      localStorage.setItem('sj_alerts', JSON.stringify(alerts));
    }

    // Supabase upsert medication log
    supabase.from('medication_logs').upsert({
      id: newLog.id,
      patient_id: patientId,
      prescription_id: prescriptionId,
      medicine_name: medicineName,
      date: date,
      time_slot: timeSlot,
      status: status,
      logged_at: newLog.loggedAt
    }).then(({ error }) => {
      if (error) console.error('Supabase medication log failed:', error);
    });

    if (score < 80 && !duplicateExists) {
      supabase.from('alerts').insert({
        id: alertId,
        patient_id: patientId,
        date: alertDate,
        type: 'ai_alert',
        title: `🚨 Adherence Alert: Critical Drop (${score.toFixed(0)}%)`,
        message: alertMsg,
        redirect_url: `doctor/patient/${patientId}`,
        read: false
      }).then(({ error }) => {
        if (error) console.error('Supabase adherence alert failed:', error);
      });
    }

    realtimeBroker.publish('patients-update');
    realtimeBroker.publish('medication-logs-update');
    realtimeBroker.publish(`patient-${patientId}`);
    realtimeBroker.publish(`alerts-${patientId}`);

    return newLog;
  }
}
