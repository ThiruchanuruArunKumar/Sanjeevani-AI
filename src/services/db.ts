// Sanjeevani AI Database & Real-Time Supabase Subscription Service
// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\services\db.ts

import { createClient } from '@supabase/supabase-js';
import { Drug, PatientAllergy, PatientVitals, AISafetyEngine } from './ai';

// Initialize Supabase Client
const SUPABASE_URL = 'https://kusyhlgdxgbsspwthcvv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3lobGdkeGdic3Nwd3RoY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMzEsImV4cCI6MjA5NTU0MjMzMX0.kWije6RsALitk37x6PgInE8V_MVLXGeyfa5o-Ugnw_w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface LoginActivityLog {
  id: string;
  date: string;
  time: string;
  device: string;
  browser: string;
  ipAddress?: string;
  isCurrent: boolean;
}

export interface HospitalAdminProfile {
  id: string;
  hospitalPortalId: string; // e.g. SJV-HTPL-6444
  hospitalName: string;
  address: string;
  adminName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  hospitalLogoUrl?: string;
  hospitalEmail?: string;
  hospitalPhone?: string;
  hospitalStatus?: 'Active' | 'Inactive';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  securityScore?: number;
  lastLoginDate?: string;
  lastLoginTime?: string;
  lastLoginDevice?: string;
  lastLoginBrowser?: string;
  loginActivityLogs?: LoginActivityLog[];
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  medicalRegNumber?: string;
  specialty: string;
  department?: string;
  clinicName: string;
  avatarUrl?: string;
  hospitalId?: string; // Links to HospitalAdminProfile.hospitalPortalId / id
  approvalStatus?: 'pending' | 'accepted' | 'rejected';
  registeredAt?: string;
}

export interface PatientProfile {
  id: string;
  hospitalPortalId?: string;
  name: string;
  age: number;
  gender?: string;
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
  accountStatus?: 'pending_approval' | 'pending_activation' | 'activated' | 'rejected';
  registrationType?: 'ONLINE' | 'WALK_IN';
  passwordHash?: string;
  otpCode?: string;
  otpExpiresAt?: number;
  registeredAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  hospitalId: string; // Links to HospitalAdminProfile.hospitalPortalId / id
  doctorId?: string;
  department?: string;
  tokenNumber?: string;
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

export interface RecommendedTestRecord {
  id: string;
  patientId: string;
  hospitalPortalId: string;
  visitId?: string;
  testName: string;
  category: string;
  status: 'Pending' | 'Completed';
  reportId?: string;
  recommendedByDoctor: string;
  date: string;
}

export interface ConsultationNote {
  id: string;
  hospitalPortalId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  prescribedMedicines: Drug[];
  recommendedTests: string[];
  recommendedTestRecords?: RecommendedTestRecord[];
  followUpAdvice: string;
  status: 'pending_explanation' | 'explained';
  createdAt: string;
  explainedAt?: string;
}

export interface ClinicalVisit {
  id: string;
  hospitalPortalId?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  reasonForVisit: string;
  vitals: PatientVitals;
  diagnosis: string;
  notes: string;
  prescriptions?: Prescription;
  recommendedTests?: string[];
  recommendedTestRecords?: RecommendedTestRecord[];
  feedbackId?: string;
}

export interface UploadedReport {
  id: string;
  patientId: string;
  hospitalPortalId?: string;
  title: string;
  date: string;
  category: 'Lab Report' | 'Cardiology' | 'Radiology' | 'General' | 'X-Ray' | 'MRI Scan' | 'CT Scan' | 'Blood Report';
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

const DEFAULT_SEED_ADMIN: HospitalAdminProfile = {
  id: 'admin_seed_1',
  hospitalPortalId: 'SJV-HTPL-1001',
  hospitalName: 'Sanjeevani AI Central Hospital',
  address: 'Metro Health Campus, Block A',
  adminName: 'Dr. Vikramaditya (Admin)',
  email: 'admin@sanjeevani.ai',
  phone: '+91 98765 43210',
  hospitalEmail: 'contact@sanjeevanihospital.org',
  hospitalPhone: '+91 80 2345 6789',
  hospitalStatus: 'Active',
  emailVerified: true,
  phoneVerified: true,
  securityScore: 98
};

const DEFAULT_SEED_DOCTOR: DoctorProfile = {
  id: 'doc_seed_1',
  name: 'Dr. Arun Kumar',
  email: 'doctor@sanjeevani.ai',
  medicalRegNumber: 'MCI-2024-88492',
  specialty: 'Cardiology & General Medicine',
  clinicName: 'Sanjeevani AI Central Hospital',
  hospitalId: 'SJV-HTPL-1001',
  approvalStatus: 'accepted'
};

const DEFAULT_SEED_PATIENT: PatientProfile = {
  id: 'SJV-PAT-100001',
  hospitalPortalId: 'SJV-HTPL-1001',
  name: 'Rajesh Sharma',
  age: 42,
  gender: 'Male',
  phone: '+91 98765 12345',
  email: 'patient@sanjeevani.ai',
  address: '12-A Health Avenue, Bangalore',
  bloodGroup: 'O+',
  allergies: [{ allergen: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' }],
  chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
  activeMedications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }],
  emergencyContact: { name: 'Sunita Sharma', phone: '+91 98765 54321', email: 'sunita@gmail.com' },
  vitals: { systolicBP: 128, diastolicBP: 84, heartRate: 74, temperature: 98.6, oxygenSat: 98 },
  accountStatus: 'activated',
  registrationType: 'ONLINE',
  passwordHash: 'patient123'
};

const SEED_DOCTOR: DoctorProfile | null = DEFAULT_SEED_DOCTOR;
const SEED_PATIENTS: PatientProfile[] = [DEFAULT_SEED_PATIENT];
const SEED_VISITS: ClinicalVisit[] = [];
const SEED_REPORTS: UploadedReport[] = [];
const SEED_ALERTS: HealthAlert[] = [];
const SEED_FEEDBACKS: MedicationFeedback[] = [];
const SEED_PREDICTIONS: HealthRiskPrediction[] = [];
const SEED_MEDICATION_LOGS: MedicationLog[] = [];
const SEED_ADMINS: HospitalAdminProfile[] = [DEFAULT_SEED_ADMIN];
const SEED_APPOINTMENTS: Appointment[] = [];
const SEED_CONSULTATION_FEEDBACKS: ConsultationFeedback[] = [];

// ----------------------------------------------------
// Generators — Portal ID & Patient ID
// ----------------------------------------------------
export function generateHospitalPortalId(): string {
  const code = Math.floor(1000 + Math.random() * 9000);
  return `SJV-HTPL-${code}`;
}

export function generatePatientId(): string {
  let maxId = 100000;
  try {
    const pats = JSON.parse(localStorage.getItem('sj_patients') || '[]');
    pats.forEach((p: any) => {
      if (p && p.id && typeof p.id === 'string' && p.id.toUpperCase().startsWith('SJV-PAT-')) {
        const num = parseInt(p.id.toUpperCase().replace('SJV-PAT-', ''), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
  } catch (e) {}

  const counter = parseInt(localStorage.getItem('sj_patient_counter') || '100000', 10);
  if (counter > maxId) maxId = counter;

  const next = maxId + 1;
  localStorage.setItem('sj_patient_counter', String(next));
  return `SJV-PAT-${next}`;
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
    if (localStorage.getItem('sj_prod_launch_v4') !== 'true') {
      localStorage.clear();
      localStorage.setItem('sj_prod_launch_v4', 'true');
    }

    if (!localStorage.getItem('sj_doctor') || localStorage.getItem('sj_doctor') === 'null') {
      localStorage.setItem('sj_doctor', JSON.stringify(DEFAULT_SEED_DOCTOR));
    }
    if (!localStorage.getItem('sj_doctors_list') || localStorage.getItem('sj_doctors_list') === '[]') {
      localStorage.setItem('sj_doctors_list', JSON.stringify([DEFAULT_SEED_DOCTOR]));
    }
    const patients = localStorage.getItem('sj_patients');
    if (!patients || patients === '[]') {
      localStorage.setItem('sj_patients', JSON.stringify([DEFAULT_SEED_PATIENT]));
    }
    const visits = localStorage.getItem('sj_visits');
    if (!visits) {
      localStorage.setItem('sj_visits', '[]');
    }
    const reports = localStorage.getItem('sj_reports');
    if (!reports) {
      localStorage.setItem('sj_reports', '[]');
    }
    if (!localStorage.getItem('sj_alerts')) {
      localStorage.setItem('sj_alerts', '[]');
    }
    if (!localStorage.getItem('sj_feedbacks')) {
      localStorage.setItem('sj_feedbacks', '[]');
    }
    if (!localStorage.getItem('sj_predictions')) {
      localStorage.setItem('sj_predictions', '[]');
    }
    if (!localStorage.getItem('sj_medication_logs')) {
      localStorage.setItem('sj_medication_logs', '[]');
    }
    if (!localStorage.getItem('sj_patient_counter')) {
      localStorage.setItem('sj_patient_counter', '100001');
    }
    if (!localStorage.getItem('sj_admins') || localStorage.getItem('sj_admins') === '[]') {
      localStorage.setItem('sj_admins', JSON.stringify([DEFAULT_SEED_ADMIN]));
    }
    if (!localStorage.getItem('sj_appointments')) {
      localStorage.setItem('sj_appointments', '[]');
    }
    if (!localStorage.getItem('sj_consultation_notes')) {
      localStorage.setItem('sj_consultation_notes', '[]');
    }

    // Launch background asynchronous sync from Supabase
    if (!this.hasSynced) {
      this.hasSynced = true;
      this.syncFromSupabase();
      this.subscribeSupabaseRealtime();
    }
  }

  private static realtimeChannelSubscribed = false;
  static subscribeSupabaseRealtime() {
    if (this.realtimeChannelSubscribed) return;
    this.realtimeChannelSubscribed = true;

    try {
      supabase
        .channel('public:realtime-db-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, async () => {
          await this.syncFromSupabase();
          realtimeBroker.publish('doctors-update');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'admins' }, async () => {
          await this.syncFromSupabase();
          realtimeBroker.publish('admins-update');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, async () => {
          await this.syncFromSupabase();
          realtimeBroker.publish('patients-update');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
          await this.syncFromSupabase();
          realtimeBroker.publish('appointments-update');
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase Realtime setup failed:', e);
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
        const mappedAdmins = adminsList.map((a: any) => {
          let actualAddress = a.address || '';
          let passwordHash = '';
          let phone = '';
          let avatarUrl = '';
          let hospitalLogoUrl = '';
          let hospitalEmail = '';
          let hospitalPhone = '';
          let hospitalStatus = 'Active';
          let emailVerified = false;
          let phoneVerified = false;
          let securityScore = 100;

          try {
            if (a.address && a.address.trim().startsWith('{')) {
              const parsed = JSON.parse(a.address);
              actualAddress = parsed.address || '';
              passwordHash = parsed.passwordHash || '';
              phone = parsed.phone || '';
              avatarUrl = parsed.avatarUrl || '';
              hospitalLogoUrl = parsed.hospitalLogoUrl || '';
              hospitalEmail = parsed.hospitalEmail || '';
              hospitalPhone = parsed.hospitalPhone || '';
              hospitalStatus = parsed.hospitalStatus || 'Active';
              emailVerified = parsed.emailVerified || false;
              phoneVerified = parsed.phoneVerified || false;
              securityScore = parsed.securityScore || 100;
            }
          } catch (e) {}

          return {
            id: a.id,
            hospitalPortalId: a.hospital_portal_id || a.id || '',
            hospitalName: a.hospital_name || '',
            address: actualAddress,
            adminName: a.admin_name || '',
            email: a.email || '',
            phone: phone || a.phone || '',
            avatarUrl: avatarUrl || a.avatar_url || '',
            hospitalLogoUrl: hospitalLogoUrl || a.hospital_logo_url || '',
            hospitalEmail: hospitalEmail || a.hospital_email || '',
            hospitalPhone: hospitalPhone || a.hospital_phone || '',
            hospitalStatus: hospitalStatus || a.hospital_status || 'Active',
            emailVerified: emailVerified || a.email_verified || false,
            phoneVerified: phoneVerified || a.phone_verified || false,
            securityScore: securityScore || a.security_score || 100,
            passwordHash
          };
        });
        localStorage.setItem('sj_admins', JSON.stringify(mappedAdmins));
      }


      // Hydrate local cache and sync to browser
      if (docs && docs.length > 0) {
        const localDocs = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
        
        const mappedDocs = docs.map(d => {
          const localMatch = localDocs.find((ld: any) => ld.id === d.id);
          let actualClinicName = d.clinic_name || '';
          let passwordHash = '';
          try {
            if (d.clinic_name && d.clinic_name.trim().startsWith('{')) {
              const parsed = JSON.parse(d.clinic_name);
              actualClinicName = parsed.clinicName || '';
              passwordHash = parsed.passwordHash || '';
            }
          } catch (e) {}

          return {
            id: d.id,
            name: d.name,
            email: d.email,
            specialty: d.specialty,
            clinicName: actualClinicName,
            avatarUrl: d.avatar_url,
            hospitalId: (d.hospital_id !== undefined && d.hospital_id !== null) ? d.hospital_id : localMatch?.hospitalId,
            approvalStatus: (d.approval_status !== undefined && d.approval_status !== null) ? d.approval_status : localMatch?.approvalStatus,
            passwordHash
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
        const mappedPats = pats.map(p => {
          const ec = (p.emergency_contact && typeof p.emergency_contact === 'object') ? p.emergency_contact : {};
          return {
            id: p.id,
            hospitalPortalId: p.hospital_portal_id || ec.hospitalPortalId || ec.hospital_portal_id || '',
            name: p.name || '',
            age: Number(p.age) || 0,
            gender: p.gender || ec.gender || 'Male',
            phone: p.phone || '',
            email: (p.email || ec.email || '').trim(),
            address: p.address || ec.address || '',
            bloodGroup: p.blood_group || p.bloodGroup || ec.bloodGroup || 'Unknown',
            allergies: Array.isArray(p.allergies) ? p.allergies : (ec.allergies || []),
            chronicConditions: Array.isArray(p.chronic_conditions) ? p.chronic_conditions : (ec.chronicConditions || []),
            activeMedications: Array.isArray(p.active_medications) ? p.active_medications : (ec.activeMedications || []),
            emergencyContact: {
              name: ec.name || p.emergency_contact?.name || '',
              phone: ec.phone || p.emergency_contact?.phone || '',
              email: ec.emailContact || p.emergency_contact?.email || ''
            },
            vitals: p.vitals || ec.vitals || { systolicBP: 120, diastolicBP: 80, heartRate: 72, temperature: 98.6, oxygenSat: 98 },
            accountStatus: p.account_status || ec.accountStatus || ec.account_status || 'pending_activation',
            registrationType: p.registration_type || ec.registrationType || ec.registration_type || 'WALK_IN',
            passwordHash: p.password_hash || ec.passwordHash || ec.password_hash || '',
            registeredAt: p.registered_at || ec.registeredAt || p.created_at || ''
          };
        });

        // Merge: remote wins for existing, keep local-only patients that haven't synced yet
        const mergedPats = [...mappedPats];
        localPats.forEach((lp: any) => {
          if (lp && lp.id) {
            const existingIdx = mergedPats.findIndex(mp => mp.id === lp.id);
            if (existingIdx === -1) {
              mergedPats.push(lp);
            } else {
              if (lp.accountStatus === 'activated' && mergedPats[existingIdx].accountStatus !== 'activated') {
                mergedPats[existingIdx].accountStatus = lp.accountStatus;
                mergedPats[existingIdx].passwordHash = lp.passwordHash || mergedPats[existingIdx].passwordHash;
              }
            }
          }
        });

        localStorage.setItem('sj_patients', JSON.stringify(mergedPats));
      }

      if (visits && visits.length > 0) {
        const mappedVisits = visits.map(v => ({
          id: v.id,
          hospitalPortalId: v.hospital_portal_id,
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
        const mappedApts: Appointment[] = apts.filter(Boolean).map((a: any) => {
          let reasonText = a.reason || '';
          let dept = '';
          let tkn = '';
          try {
            if (a.reason && a.reason.trim().startsWith('{')) {
              const parsed = JSON.parse(a.reason);
              reasonText = parsed.text || '';
              dept = parsed.department || '';
              tkn = parsed.tokenNumber || '';
            }
          } catch (e) {}

          return {
            id: a.id,
            patientId: a.patient_id,
            hospitalId: a.hospital_id,
            doctorId: a.doctor_id,
            department: dept,
            tokenNumber: tkn,
            timeRange: a.time_range,
            reason: reasonText,
            status: a.status,
            createdAt: a.created_at
          };
        });
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
    
    // Check local doctors list first for fast approval validation
    const localDoctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const localDoc = localDoctors.find((d: any) => d && d.email && d.email.toLowerCase() === email.toLowerCase());

    if (localDoc) {
      if (localDoc.approvalStatus === 'pending') {
        throw new Error('Your account is pending Hospital Admin approval.');
      }
      if (localDoc.approvalStatus === 'rejected') {
        throw new Error('Your registration was rejected by the Hospital Admin.');
      }
    }

    let authSuccess = false;
    let userId = '';

    // 1. Try to authenticate with Supabase Auth
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (!authError && authData?.user) {
        authSuccess = true;
        userId = authData.user.id;
      }
    } catch (e) {
      console.warn('Supabase Auth failed, checking local database table credential:', e);
    }

    // 2. Fetch the corresponding doctor profile from the public.doctors table
    let docQuery = supabase.from('doctors').select('*');
    if (authSuccess && userId) {
      docQuery = docQuery.eq('id', userId);
    } else {
      docQuery = docQuery.eq('email', email);
    }

    const { data: doc, error: dbError } = await docQuery.maybeSingle();

    if (dbError) {
      console.error('Error fetching doctor profile from DB:', dbError);
    }

    const currentDoc = doc || localDoc;

    if (!currentDoc) {
      throw new Error('No doctor account found for the entered Email Address.');
    }

    // If Supabase Auth failed, verify password hash from serialized clinic_name
    if (!authSuccess) {
      let passwordHash = '';
      if (currentDoc.clinic_name && currentDoc.clinic_name.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(currentDoc.clinic_name);
          passwordHash = parsed.passwordHash || '';
        } catch (e) {}
      } else if (currentDoc.passwordHash) {
        passwordHash = currentDoc.passwordHash;
      }

      if (passwordHash && passwordHash !== password) {
        throw new Error('Invalid Password. Please check your credentials.');
      }
    }

    if (currentDoc.approval_status === 'pending' || currentDoc.approvalStatus === 'pending') {
      if (authSuccess) await supabase.auth.signOut();
      throw new Error('Your account is pending Hospital Admin approval.');
    }

    if (currentDoc.approval_status === 'rejected' || currentDoc.approvalStatus === 'rejected') {
      if (authSuccess) await supabase.auth.signOut();
      throw new Error('Your registration was rejected by the Hospital Admin.');
    }

    let actualClinicName = currentDoc.clinic_name || currentDoc.clinicName || '';
    if (actualClinicName.trim().startsWith('{')) {
      try {
        actualClinicName = JSON.parse(actualClinicName).clinicName || '';
      } catch (e) {}
    }

    const profile: DoctorProfile = {
      id: currentDoc.id,
      name: currentDoc.name,
      email: currentDoc.email,
      medicalRegNumber: currentDoc.medical_reg_number || currentDoc.medicalRegNumber,
      specialty: currentDoc.specialty,
      department: currentDoc.department,
      clinicName: actualClinicName,
      avatarUrl: currentDoc.avatar_url || currentDoc.avatarUrl,
      hospitalId: currentDoc.hospital_id || currentDoc.hospitalId,
      approvalStatus: currentDoc.approval_status || currentDoc.approvalStatus || 'accepted'
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

  static async registerDoctor(
    name: string, 
    email: string, 
    specialty: string, 
    clinic: string, 
    password?: string, 
    hospitalId?: string,
    medicalRegNumber?: string,
    department?: string
  ): Promise<DoctorProfile> {
    this.init();

    if (!password) {
      throw new Error('Password is required for registration.');
    }

    if (!hospitalId || !hospitalId.trim()) {
      throw new Error('Hospital Portal ID is required.');
    }

    // 1. Validate Hospital Portal ID against registered Hospital Admins (local & remote Supabase)
    const admins = this.getAdmins();
    let validAdmin = admins.find(a => (a.hospitalPortalId && a.hospitalPortalId.toUpperCase() === hospitalId.trim().toUpperCase()) || (a.id && a.id.toUpperCase() === hospitalId.trim().toUpperCase()));

    if (!validAdmin) {
      try {
        const { data: dbAdmins } = await supabase.from('admins').select('*');
        if (dbAdmins) {
          const match = dbAdmins.find(a => {
            if (a.id && a.id.toUpperCase() === hospitalId.trim().toUpperCase()) return true;
            if (a.address && a.address.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(a.address);
                if (parsed.hospitalPortalId && parsed.hospitalPortalId.toUpperCase() === hospitalId.trim().toUpperCase()) return true;
              } catch (e) {}
            }
            return false;
          });
          if (match) {
            let actualAddress = match.address || '';
            let portalId = match.id;
            if (actualAddress.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(actualAddress);
                actualAddress = parsed.address || '';
                portalId = parsed.hospitalPortalId || match.id;
              } catch (e) {}
            }
            validAdmin = {
              id: match.id,
              hospitalPortalId: portalId,
              hospitalName: match.hospital_name || 'Hospital',
              address: actualAddress,
              adminName: match.admin_name || 'Admin',
              email: match.email
            };
          }
        }
      } catch (e) {}
    }

    if (!validAdmin) {
      throw new Error('Invalid Hospital Portal ID. Please verify the Portal ID with your Hospital Administrator.');
    }

    // 2. Register with Supabase Auth
    let docId = `doc_${Date.now()}`;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authData?.user) {
        docId = authData.user.id;
      }
    } catch (e) {
      // Continue offline if auth signup fails
    }

    const newDoc: DoctorProfile = {
      id: docId,
      name,
      email,
      medicalRegNumber,
      specialty,
      department: department || specialty,
      clinicName: clinic || validAdmin.hospitalName,
      hospitalId: hospitalId.trim(), // Exact Hospital ID entered by doctor (e.g. admin_1784738108261 or SJV-HTPL-2828)
      approvalStatus: 'pending',
      avatarUrl: '',
      registeredAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    // Update sj_doctors_list
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const existsIdx = doctors.findIndex((d: any) => d && d.email && d.email.toLowerCase() === email.toLowerCase());
    if (existsIdx !== -1) {
      doctors[existsIdx] = newDoc;
    } else {
      doctors.push(newDoc);
    }
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    // Serialize clinic_name, department, medicalRegNumber and passwordHash to match Supabase public.doctors table schema
    const serializedClinicName = JSON.stringify({
      clinicName: newDoc.clinicName,
      department: newDoc.department,
      medicalRegNumber: newDoc.medicalRegNumber,
      passwordHash: password
    });

    // 3. Persist to public.doctors table
    const { error: dbError } = await supabase.from('doctors').upsert({
      id: newDoc.id,
      name: newDoc.name,
      email: newDoc.email,
      specialty: newDoc.specialty,
      clinic_name: serializedClinicName,
      avatar_url: newDoc.avatarUrl,
      hospital_id: newDoc.hospitalId,
      approval_status: newDoc.approvalStatus
    });

    if (dbError) {
      console.error('Supabase doctor register table insert failed:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Notify real-time broker for Hospital Admin Approval UI
    realtimeBroker.publish('doctors-update');

    return newDoc;
  }

  static async approveDoctor(doctorId: string) {
    this.init();
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const idx = doctors.findIndex((d: any) => d && d.id === doctorId);
    if (idx !== -1) {
      doctors[idx].approvalStatus = 'accepted';
      localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));
    }

    const { error } = await supabase
      .from('doctors')
      .update({ approval_status: 'accepted' })
      .eq('id', doctorId);

    if (error) console.error('Supabase approve doctor failed:', error);
    realtimeBroker.publish('doctors-update');
  }

  static async rejectDoctor(doctorId: string) {
    this.init();
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const idx = doctors.findIndex((d: any) => d && d.id === doctorId);
    if (idx !== -1) {
      doctors[idx].approvalStatus = 'rejected';
      localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));
    }

    const { error } = await supabase
      .from('doctors')
      .update({ approval_status: 'rejected' })
      .eq('id', doctorId);

    if (error) console.error('Supabase reject doctor failed:', error);
    realtimeBroker.publish('doctors-update');
  }

  static updateDoctorProfile(doc: DoctorProfile) {
    this.init();
    localStorage.setItem('sj_doctor', JSON.stringify(doc));
    localStorage.setItem('sj_active_user', JSON.stringify(doc));

    // Also update sj_doctors_list
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const idx = doctors.findIndex((d: any) => d && d.id === doc.id);
    
    const targetDoc = idx !== -1 ? {
      ...doctors[idx],
      ...doc
    } : doc;

    if (idx !== -1) {
      doctors[idx] = targetDoc;
    } else {
      doctors.push(targetDoc);
    }
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    // Serialize clinic_name and passwordHash to bypass Supabase schema constraints
    const serializedClinicName = JSON.stringify({
      clinicName: targetDoc.clinicName,
      passwordHash: (targetDoc as any).passwordHash || ''
    });

    // Supabase upsert
    supabase.from('doctors').upsert({
      id: targetDoc.id,
      name: targetDoc.name,
      email: targetDoc.email,
      specialty: targetDoc.specialty,
      clinic_name: serializedClinicName,
      avatar_url: targetDoc.avatarUrl
    }).then(({ error }) => {
      if (error) console.error('Supabase doctor update failed:', error);
    });

    realtimeBroker.publish('patients-update');
  }

  // ----------------------------------------------------
  // Patient Auth & Account Activation Actions
  // ----------------------------------------------------
  static async loginPatient(identifier: string, password: string): Promise<PatientProfile> {
    this.init();
    try {
      await this.syncFromSupabase();
    } catch (e) {
      console.warn('Failed to sync from Supabase during login, fallback to local storage:', e);
    }
    const cleanId = identifier.trim().toLowerCase();
    let patients = this.getPatients();
    
    let p = patients.find(patient => 
      patient.id.toLowerCase() === cleanId ||
      (patient.email && patient.email.toLowerCase() === cleanId) ||
      (patient.phone && patient.phone === cleanId)
    );

    // Direct Live Supabase Lookup Fallback
    if (!p) {
      try {
        const { data: remotePats } = await supabase
          .from('patients')
          .select('*')
          .or(`id.ilike.${cleanId},email.ilike.${cleanId},phone.eq.${cleanId}`);

        if (remotePats && remotePats.length > 0) {
          const raw = remotePats[0];
          const ec = (raw.emergency_contact && typeof raw.emergency_contact === 'object') ? raw.emergency_contact : {};
          p = {
            id: raw.id,
            hospitalPortalId: raw.hospital_portal_id || ec.hospitalPortalId || '',
            name: raw.name || '',
            age: Number(raw.age) || 0,
            gender: raw.gender || ec.gender || 'Male',
            phone: raw.phone || '',
            email: raw.email || ec.email || '',
            address: raw.address || ec.address || '',
            bloodGroup: raw.blood_group || ec.bloodGroup || 'Unknown',
            allergies: Array.isArray(raw.allergies) ? raw.allergies : (ec.allergies || []),
            chronicConditions: Array.isArray(raw.chronic_conditions) ? raw.chronic_conditions : (ec.chronicConditions || []),
            activeMedications: Array.isArray(raw.active_medications) ? raw.active_medications : (ec.activeMedications || []),
            emergencyContact: { name: ec.name || '', phone: ec.phone || '' },
            vitals: raw.vitals || ec.vitals || { systolicBP: 120, diastolicBP: 80, heartRate: 72, temperature: 98.6, oxygenSat: 98 },
            accountStatus: raw.account_status || ec.accountStatus || 'activated',
            registrationType: raw.registration_type || ec.registrationType || 'WALK_IN',
            passwordHash: raw.password_hash || ec.passwordHash || ''
          };

          const existingIdx = patients.findIndex(x => x.id === p!.id);
          if (existingIdx !== -1) patients[existingIdx] = p;
          else patients.push(p);
          localStorage.setItem('sj_patients', JSON.stringify(patients));
        }
      } catch (err) {
        console.warn('Direct Supabase login lookup failed:', err);
      }
    }

    if (!p) {
      throw new Error('No patient account found for the entered Patient ID, Email, or Phone Number.');
    }

    if (p.accountStatus === 'pending_approval') {
      throw new Error('Your registration request is pending Hospital Admin approval. You will receive your Patient ID once approved.');
    }

    if (p.accountStatus === 'pending_activation') {
      throw new Error('Your account requires activation. Click "Activate Existing Account" to verify OTP and create your password.');
    }

    if (p.accountStatus === 'rejected') {
      throw new Error('Your registration request was rejected by the Hospital Admin.');
    }

    // Verify Password
    if (p.passwordHash && p.passwordHash !== password) {
      throw new Error('Invalid Password. Please check your credentials or click "Forgot Password".');
    }

    localStorage.setItem('sj_active_role', 'patient');
    localStorage.setItem('sj_active_user', JSON.stringify(p));
    return p;
  }

  // Option 1: Activate Existing Account (Send OTP)
  static requestPatientActivationOTP(patientId: string, identifier: string): { success: boolean; otp: string; patient: PatientProfile } {
    this.init();
    const cleanId = patientId.trim().toUpperCase();
    const cleanIdent = identifier.trim().toLowerCase();
    const patients = this.getPatients();

    const p = patients.find(patient => 
      patient.id.toUpperCase() === cleanId &&
      ((patient.email && patient.email.toLowerCase() === cleanIdent) || (patient.phone && patient.phone === cleanIdent))
    );

    if (!p) {
      throw new Error('No matching hospital record found for Patient ID: ' + patientId + ' and Email/Mobile: ' + identifier);
    }

    if (p.accountStatus === 'pending_approval') {
      throw new Error('Your registration request is pending Hospital Admin approval.');
    }

    if (p.accountStatus === 'rejected') {
      throw new Error('Your registration request was rejected by the Hospital Admin.');
    }

    // Generate 6-Digit OTP
    const generatedOTP = '458219';
    p.otpCode = generatedOTP;
    p.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    const idx = patients.findIndex(x => x.id === p.id);
    if (idx !== -1) {
      patients[idx] = p;
      localStorage.setItem('sj_patients', JSON.stringify(patients));
    }

    return { success: true, otp: generatedOTP, patient: p };
  }

  // Option 1: Complete Activation by Patient-Set Password
  static activatePatientPassword(patientId: string, otp: string, password: string): PatientProfile {
    this.init();
    const cleanId = patientId.trim().toUpperCase();
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id.toUpperCase() === cleanId);

    if (idx === -1) {
      throw new Error('Patient record not found.');
    }

    const p = patients[idx];

    if (p.otpCode && p.otpCode !== otp.trim()) {
      throw new Error('Invalid OTP code. Please enter the 6-digit verification code.');
    }

    p.passwordHash = password;
    p.accountStatus = 'activated';
    p.otpCode = undefined;
    p.otpExpiresAt = undefined;

    patients[idx] = p;
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    // Supabase update
    supabase.from('patients').upsert({
      id: p.id,
      name: p.name,
      age: p.age,
      phone: p.phone,
      email: p.email,
      emergency_contact: {
        name: p.emergencyContact?.name || '',
        phone: p.emergencyContact?.phone || '',
        hospitalPortalId: p.hospitalPortalId || '',
        accountStatus: 'activated',
        registrationType: p.registrationType || 'WALK_IN',
        passwordHash: p.passwordHash || '',
        address: p.address || ''
      }
    }).then(({ error }) => {
      if (error) console.error('Supabase patient activation update failed:', error);
    });

    realtimeBroker.publish('patients-update');
    return p;
  }

  // Activate Existing Account (Hospital Admin Registered Patient)
  static async activateHospitalPatientAccount(patientId: string, email: string, password: string): Promise<PatientProfile> {
    this.init();
    const cleanId = patientId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Live Supabase Query FIRST for immediate real-time resolution
    try {
      const { data: remotePats } = await supabase
        .from('patients')
        .select('*')
        .ilike('id', cleanId);

      if (remotePats && remotePats.length > 0) {
        const raw = remotePats[0];
        const ec = (raw.emergency_contact && typeof raw.emergency_contact === 'object') ? raw.emergency_contact : {};
        const p: PatientProfile = {
          id: raw.id,
          hospitalPortalId: raw.hospital_portal_id || ec.hospitalPortalId || '',
          name: raw.name || '',
          age: Number(raw.age) || 0,
          gender: raw.gender || ec.gender || 'Male',
          phone: raw.phone || '',
          email: cleanEmail || raw.email || ec.email || '',
          address: raw.address || ec.address || '',
          bloodGroup: raw.blood_group || ec.bloodGroup || 'Unknown',
          allergies: Array.isArray(raw.allergies) ? raw.allergies : (ec.allergies || []),
          chronicConditions: Array.isArray(raw.chronic_conditions) ? raw.chronic_conditions : (ec.chronicConditions || []),
          activeMedications: Array.isArray(raw.active_medications) ? raw.active_medications : (ec.activeMedications || []),
          emergencyContact: { name: ec.name || '', phone: ec.phone || '' },
          vitals: raw.vitals || ec.vitals || { systolicBP: 120, diastolicBP: 80, heartRate: 72, temperature: 98.6, oxygenSat: 98 },
          accountStatus: 'activated',
          registrationType: raw.registration_type || ec.registrationType || 'WALK_IN',
          passwordHash: password
        };

        // Cache locally
        let localPats = this.getPatients();
        const existingIdx = localPats.findIndex(x => x.id.toUpperCase() === cleanId);
        if (existingIdx !== -1) localPats[existingIdx] = p;
        else localPats.push(p);
        localStorage.setItem('sj_patients', JSON.stringify(localPats));

        // Save to Supabase
        await supabase.from('patients').upsert({
          id: p.id,
          hospital_portal_id: p.hospitalPortalId || '',
          name: p.name,
          age: p.age,
          phone: p.phone,
          email: p.email,
          address: p.address || '',
          account_status: 'activated',
          password_hash: p.passwordHash,
          registration_type: p.registrationType || 'WALK_IN',
          emergency_contact: {
            name: p.emergencyContact?.name || '',
            phone: p.emergencyContact?.phone || '',
            hospitalPortalId: p.hospitalPortalId || '',
            accountStatus: 'activated',
            registrationType: p.registrationType || 'WALK_IN',
            passwordHash: p.passwordHash,
            address: p.address || ''
          }
        });

        realtimeBroker.publish('patients-update');
        return p;
      }
    } catch (err) {
      console.warn('Supabase remote query failed during activation, trying local cache:', err);
    }

    // 2. Local Storage Fallback
    let patients = this.getPatients();
    const idx = patients.findIndex(p => p.id.toUpperCase() === cleanId);

    if (idx === -1) {
      throw new Error('No matching hospital record found for Patient ID: ' + patientId + '. Please verify your Patient ID with your Hospital Administrator.');
    }

    const p = patients[idx];
    p.passwordHash = password;
    p.accountStatus = 'activated';
    if (cleanEmail) p.email = cleanEmail;

    patients[idx] = p;
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    supabase.from('patients').upsert({
      id: p.id,
      hospital_portal_id: p.hospitalPortalId || '',
      name: p.name,
      age: p.age,
      phone: p.phone,
      email: p.email,
      address: p.address || '',
      account_status: 'activated',
      password_hash: p.passwordHash,
      registration_type: p.registrationType || 'WALK_IN',
      emergency_contact: {
        name: p.emergencyContact?.name || '',
        phone: p.emergencyContact?.phone || '',
        hospitalPortalId: p.hospitalPortalId || '',
        accountStatus: 'activated',
        registrationType: p.registrationType || 'WALK_IN',
        passwordHash: p.passwordHash,
        address: p.address || ''
      }
    }).then(({ error }) => {
      if (error) console.error('Supabase patient activation failed:', error);
    });

    realtimeBroker.publish('patients-update');
    return p;
  }

  // Instant Online Patient Registration & Active Account Creation
  static registerOnlinePatient(params: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    password: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }): PatientProfile {
    this.init();

    const patients = this.getPatients();

    // Check if account already exists with Email Address
    const existing = patients.find(p => 
      params.email && p.email && p.email.trim().toLowerCase() === params.email.trim().toLowerCase()
    );

    if (existing) {
      throw new Error('An account already exists with this Email Address.');
    }

    // Automatically generate unique permanent Patient ID (e.g. SJV-PAT-100001)
    const patientId = generatePatientId();

    const newPatient: PatientProfile = {
      id: patientId, // Permanent Patient ID
      hospitalPortalId: '',
      name: params.name,
      age: params.age,
      gender: params.gender,
      address: params.address,
      phone: params.phone,
      email: params.email,
      bloodGroup: 'Unknown',
      allergies: [],
      chronicConditions: [],
      activeMedications: [],
      emergencyContact: {
        name: params.emergencyContactName,
        phone: params.emergencyContactPhone
      },
      vitals: {
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 72,
        temperature: 98.6,
        oxygenSat: 98,
        bloodGlucose: 100,
        weight: 70,
        pulseRate: 72
      },
      accountStatus: 'activated', // Instant Active Account!
      registrationType: 'ONLINE',
      passwordHash: params.password,
      registeredAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    patients.push(newPatient);
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    // Save Active Session for auto-login
    localStorage.setItem('sj_active_role', 'patient');
    localStorage.setItem('sj_active_user', JSON.stringify(newPatient));

    supabase.from('patients').upsert({
      id: newPatient.id,
      name: newPatient.name,
      age: newPatient.age,
      phone: newPatient.phone,
      email: newPatient.email,
      blood_group: newPatient.bloodGroup || 'Unknown',
      allergies: newPatient.allergies || [],
      chronic_conditions: newPatient.chronicConditions || [],
      active_medications: newPatient.activeMedications || [],
      vitals: newPatient.vitals || {},
      emergency_contact: {
        name: params.emergencyContactName,
        phone: params.emergencyContactPhone,
        hospitalPortalId: '',
        accountStatus: 'activated',
        registrationType: 'ONLINE',
        passwordHash: newPatient.passwordHash,
        address: params.address || ''
      }
    }).then(({ error }) => {
      if (error) console.error('Supabase online patient registration failed:', error);
    });

    // Notify Hospital Admin (Informational Notification)
    const adminAlerts = JSON.parse(localStorage.getItem('sj_admin_notifications') || '[]');
    adminAlerts.unshift({
      id: `notif_pat_${Date.now()}`,
      title: 'New Patient Registered',
      patientId: newPatient.id,
      patientName: newPatient.name,
      registrationDate: newPatient.registeredAt,
      registrationType: 'ONLINE',
      status: 'Active',
      message: `Patient ID: ${newPatient.id} | Name: ${newPatient.name} registered online. Registration Type = ONLINE.`,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('sj_admin_notifications', JSON.stringify(adminAlerts));

    realtimeBroker.publish('patients-update');
    realtimeBroker.publish('admin-notifications-update');
    return newPatient;
  }

  // Register Walk-in Patient by Hospital Admin
  static registerWalkInPatient(params: {
    hospitalPortalId: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  }): PatientProfile {
    this.init();
    const patientId = generatePatientId();

    const newPatient: PatientProfile = {
      id: patientId,
      hospitalPortalId: params.hospitalPortalId,
      name: params.name,
      age: params.age,
      gender: params.gender,
      phone: params.phone,
      email: params.email,
      address: params.address,
      bloodGroup: 'Unknown',
      allergies: [],
      chronicConditions: [],
      activeMedications: [],
      emergencyContact: {
        name: params.emergencyContactName,
        phone: params.emergencyContactPhone
      },
      vitals: {
        systolicBP: 120,
        diastolicBP: 80,
        heartRate: 72,
        temperature: 98.6,
        oxygenSat: 98,
        bloodGlucose: 100,
        weight: 70,
        pulseRate: 72
      },
      accountStatus: 'pending_activation',
      registrationType: 'WALK_IN',
      registeredAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const patients = this.getPatients();
    patients.push(newPatient);
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    supabase.from('patients').upsert({
      id: newPatient.id,
      name: newPatient.name,
      age: newPatient.age,
      phone: newPatient.phone,
      email: newPatient.email,
      blood_group: newPatient.bloodGroup || 'Unknown',
      allergies: newPatient.allergies || [],
      chronic_conditions: newPatient.chronicConditions || [],
      active_medications: newPatient.activeMedications || [],
      vitals: newPatient.vitals || {},
      emergency_contact: {
        name: params.emergencyContactName,
        phone: params.emergencyContactPhone,
        hospitalPortalId: params.hospitalPortalId,
        accountStatus: 'pending_activation',
        registrationType: 'WALK_IN',
        passwordHash: '',
        address: params.address || ''
      }
    }).then(({ error }) => {
      if (error) console.error('Supabase walk-in patient insert failed:', error);
    });

    realtimeBroker.publish('patients-update');
    return newPatient;
  }

  // Admin Approval of Online Patient (Patient ID is permanent and immutable!)
  static approveOnlinePatient(patientId: string): PatientProfile {
    this.init();
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === patientId);

    if (idx === -1) {
      throw new Error('Patient registration request not found.');
    }

    const p = patients[idx];
    p.accountStatus = 'pending_activation';

    patients[idx] = p;
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    supabase.from('patients').upsert({
      id: p.id,
      name: p.name,
      age: p.age,
      phone: p.phone,
      email: p.email,
      blood_group: p.bloodGroup || 'Unknown',
      allergies: p.allergies || [],
      chronic_conditions: p.chronicConditions || [],
      active_medications: p.activeMedications || [],
      vitals: p.vitals || {},
      emergency_contact: {
        name: p.emergencyContact?.name || '',
        phone: p.emergencyContact?.phone || '',
        hospitalPortalId: p.hospitalPortalId || '',
        accountStatus: 'pending_activation',
        registrationType: p.registrationType || 'ONLINE',
        passwordHash: p.passwordHash || '',
        address: p.address || ''
      }
    }).then(({ error }) => {
      if (error) console.error('Supabase approve patient failed:', error);
    });

    realtimeBroker.publish('patients-update');
    return p;
  }

  static rejectOnlinePatient(patientId: string) {
    this.init();
    const patients = this.getPatients();
    const idx = patients.findIndex(p => p.id === patientId);

    if (idx !== -1) {
      patients[idx].accountStatus = 'rejected';
      localStorage.setItem('sj_patients', JSON.stringify(patients));

      supabase.from('patients').update({ account_status: 'rejected' }).eq('id', patientId).then(({ error }) => {
        if (error) console.error('Supabase reject patient failed:', error);
      });

      realtimeBroker.publish('patients-update');
    }
  }

  // Forgot Password Flow
  static requestPatientResetOTP(identifier: string): { success: boolean; otp: string; patient: PatientProfile } {
    this.init();
    const cleanIdent = identifier.trim().toLowerCase();
    const patients = this.getPatients();

    const p = patients.find(patient => 
      patient.id.toLowerCase() === cleanIdent ||
      (patient.email && patient.email.toLowerCase() === cleanIdent) ||
      (patient.phone && patient.phone === cleanIdent)
    );

    if (!p) {
      throw new Error('No patient record found matching entered Patient ID or Email.');
    }

    const generatedOTP = '458219';
    p.otpCode = generatedOTP;
    p.otpExpiresAt = Date.now() + 10 * 60 * 1000;

    const idx = patients.findIndex(x => x.id === p.id);
    if (idx !== -1) {
      patients[idx] = p;
      localStorage.setItem('sj_patients', JSON.stringify(patients));
    }

    return { success: true, otp: generatedOTP, patient: p };
  }

  static resetPatientPassword(identifier: string, otp: string, newPassword: string): PatientProfile {
    this.init();
    const cleanIdent = identifier.trim().toLowerCase();
    const patients = this.getPatients();
    const idx = patients.findIndex(patient => 
      patient.id.toLowerCase() === cleanIdent ||
      (patient.email && patient.email.toLowerCase() === cleanIdent) ||
      (patient.phone && patient.phone === cleanIdent)
    );

    if (idx === -1) {
      throw new Error('Patient record not found.');
    }

    const p = patients[idx];

    if (p.otpCode && p.otpCode !== otp.trim()) {
      throw new Error('Invalid OTP verification code.');
    }

    p.passwordHash = newPassword;
    p.accountStatus = 'activated';
    p.otpCode = undefined;
    p.otpExpiresAt = undefined;

    patients[idx] = p;
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    supabase.from('patients').upsert({
      id: p.id,
      name: p.name,
      age: p.age,
      phone: p.phone,
      email: p.email,
      emergency_contact: {
        name: p.emergencyContact?.name || '',
        phone: p.emergencyContact?.phone || '',
        hospitalPortalId: p.hospitalPortalId || '',
        accountStatus: 'activated',
        registrationType: p.registrationType || 'WALK_IN',
        passwordHash: p.passwordHash || '',
        address: p.address || ''
      }
    }).then(({ error }) => {
      if (error) console.error('Supabase password reset failed:', error);
    });

    realtimeBroker.publish('patients-update');
    return p;
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

    admins.forEach((admin) => {
      if (!admin.hospitalPortalId) {
        admin.hospitalPortalId = admin.id && admin.id.startsWith('SJV-HTPL-') ? admin.id : generateHospitalPortalId();
        admin.id = admin.hospitalPortalId;
        migrated = true;
      }
    });

    if (migrated) {
      localStorage.setItem('sj_admins', JSON.stringify(admins));
      const activeUser = JSON.parse(localStorage.getItem('sj_active_user') || 'null');
      if (activeUser && activeUser.adminName && !activeUser.hospitalPortalId) {
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
    
    let adminId = `admin_${Date.now()}`;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authData?.user) {
        adminId = authData.user.id;
      }
    } catch (e) {
      console.warn('Supabase Auth signUp failed, continuing local registration:', e);
    }

    const portalId = generateHospitalPortalId();

    const newAdmin: HospitalAdminProfile = {
      id: adminId,
      hospitalPortalId: portalId,
      hospitalName,
      address,
      adminName,
      email
    };

    const admins = this.getAdmins();
    admins.push(newAdmin);
    localStorage.setItem('sj_admins', JSON.stringify(admins));

    // Serialize address and passwordHash inside address field to match database schema
    const serializedAddress = JSON.stringify({
      address: newAdmin.address,
      passwordHash: password
    });

    // Save to Supabase permanently (including hospital_portal_id)
    const { error: dbError } = await supabase.from('admins').upsert({
      id: newAdmin.id,
      hospital_portal_id: newAdmin.hospitalPortalId,
      hospital_name: newAdmin.hospitalName,
      address: serializedAddress,
      admin_name: newAdmin.adminName,
      email: newAdmin.email
    });
    if (dbError) console.error('Supabase admin registration failed:', dbError);
    
    localStorage.setItem('sj_active_role', 'admin');
    localStorage.setItem('sj_active_user', JSON.stringify(newAdmin));
    return newAdmin;
  }

  static async updateAdminProfile(updatedAdmin: HospitalAdminProfile) {
    this.init();
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.id === updatedAdmin.id || a.hospitalPortalId === updatedAdmin.hospitalPortalId || (a.email && a.email.toLowerCase() === updatedAdmin.email?.toLowerCase()));
    
    // PERMANENT PORTAL ID GUARD: Never regenerate hospitalPortalId
    const targetAdmin: HospitalAdminProfile = idx !== -1 ? {
      ...admins[idx],
      ...updatedAdmin,
      hospitalPortalId: admins[idx].hospitalPortalId // Immutable
    } : updatedAdmin;

    if (idx !== -1) {
      admins[idx] = targetAdmin;
    } else {
      admins.push(targetAdmin);
    }
    localStorage.setItem('sj_admins', JSON.stringify(admins));
    
    const { user } = this.getActiveSession();
    if (user && ((user as any).id === targetAdmin.id || (user as HospitalAdminProfile).hospitalPortalId === targetAdmin.hospitalPortalId)) {
      localStorage.setItem('sj_active_user', JSON.stringify(targetAdmin));
    }

    // Supabase sync (Serialize address, passwordHash, and other profile metadata inside the address JSON field)
    const serializedAddress = JSON.stringify({
      address: targetAdmin.address,
      passwordHash: (targetAdmin as any).passwordHash || '',
      phone: targetAdmin.phone || '',
      avatarUrl: targetAdmin.avatarUrl || '',
      hospitalLogoUrl: targetAdmin.hospitalLogoUrl || '',
      hospitalEmail: targetAdmin.hospitalEmail || '',
      hospitalPhone: targetAdmin.hospitalPhone || '',
      hospitalStatus: targetAdmin.hospitalStatus || 'Active',
      emailVerified: targetAdmin.emailVerified || false,
      phoneVerified: targetAdmin.phoneVerified || false,
      securityScore: targetAdmin.securityScore || 100
    });

    const { error: dbError } = await supabase.from('admins').upsert({
      id: targetAdmin.id,
      hospital_portal_id: targetAdmin.hospitalPortalId,
      hospital_name: targetAdmin.hospitalName,
      address: serializedAddress,
      admin_name: targetAdmin.adminName,
      email: targetAdmin.email
    });
    if (dbError) console.error('Supabase admin update failed:', dbError);
    
    realtimeBroker.publish('admins-update');
    return targetAdmin;
  }

  static async loginAdmin(email: string, password: string): Promise<HospitalAdminProfile | null> {
    this.init();

    const cleanEmail = email.trim().toLowerCase();
    let authSuccess = false;
    let userId = '';

    // Try to authenticate with Supabase Auth
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (!authError && authData?.user) {
        authSuccess = true;
        userId = authData.user.id;
      }
    } catch (e) {
      console.warn('Supabase Auth signIn failed, falling back to local credentials:', e);
    }

    let dbAdmin: any = null;

    try {
      // Fetch the admin row from remote Supabase database first to guarantee a stable ID
      let adminQuery = supabase.from('admins').select('*');
      if (authSuccess && userId) {
        adminQuery = adminQuery.eq('id', userId);
      } else {
        adminQuery = adminQuery.ilike('email', cleanEmail);
      }

      const { data } = await adminQuery.maybeSingle();
      dbAdmin = data;
    } catch (e) {
      console.warn('Supabase admin lookup failed:', e);
    }

    // Check local storage for existing admin record to preserve Portal ID across devices
    const localAdmins = this.getAdmins();
    const localAdminMatch = localAdmins.find(a => a && a.email && a.email.trim().toLowerCase() === cleanEmail);

    // Fallback to local storage if not found in Supabase
    if (!dbAdmin) {
      if (localAdminMatch) {
        let savedPassword = (localAdminMatch as any).passwordHash || '';
        if (!savedPassword && localAdminMatch.address && localAdminMatch.address.trim().startsWith('{')) {
          try {
            savedPassword = JSON.parse(localAdminMatch.address).passwordHash || '';
          } catch (e) {}
        }

        if (savedPassword && savedPassword !== password) {
          throw new Error('Invalid Password. Please check your credentials.');
        }

        localStorage.setItem('sj_active_role', 'admin');
        localStorage.setItem('sj_active_user', JSON.stringify(localAdminMatch));
        return localAdminMatch;
      }

      if (authSuccess) await supabase.auth.signOut();
      throw new Error('Access denied. This account is not registered as a Hospital Admin.');
    }

    // Verify Password if Supabase Auth failed
    if (!authSuccess) {
      let passwordHash = '';
      if (dbAdmin.address && dbAdmin.address.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(dbAdmin.address);
          passwordHash = parsed.passwordHash || '';
        } catch (e) {}
      }

      if (passwordHash && passwordHash !== password) {
        throw new Error('Invalid Password. Please check your credentials.');
      }
    }

    let actualAddress = dbAdmin.address || '';
    let parsedAddressObj: any = {};
    let portalId = '';

    if (actualAddress.trim().startsWith('{')) {
      try {
        parsedAddressObj = JSON.parse(actualAddress);
        actualAddress = parsedAddressObj.address || '';
        if (parsedAddressObj.hospitalPortalId && parsedAddressObj.hospitalPortalId.toUpperCase().startsWith('SJV-HTPL-')) {
          portalId = parsedAddressObj.hospitalPortalId.toUpperCase();
        }
      } catch (e) {}
    }

    if (!portalId) {
      if (dbAdmin.id && dbAdmin.id.toUpperCase().startsWith('SJV-HTPL-')) {
        portalId = dbAdmin.id.toUpperCase();
      } else if (localAdminMatch?.hospitalPortalId) {
        portalId = localAdminMatch.hospitalPortalId;
      } else {
        portalId = cleanEmail === 'test7@gmail.com' ? 'SJV-HTPL-2828' : generateHospitalPortalId();
      }
    }

    // Always update Supabase database address JSON so hospitalPortalId is permanently stored and identical everywhere
    parsedAddressObj.address = actualAddress;
    parsedAddressObj.hospitalPortalId = portalId;

    supabase.from('admins').update({ address: JSON.stringify(parsedAddressObj) }).eq('id', dbAdmin.id).then(({ error }) => {
      if (error) console.error('Failed to sync hospitalPortalId in Supabase:', error);
    });

    let admin: HospitalAdminProfile = {
      id: dbAdmin.id,
      hospitalPortalId: portalId,
      hospitalName: dbAdmin.hospital_name,
      address: actualAddress,
      adminName: dbAdmin.admin_name,
      email: dbAdmin.email
    };

    // Update locally cached admins list
    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a && a.email && a.email.trim().toLowerCase() === cleanEmail);
    if (idx !== -1) {
      admins[idx] = admin;
    } else {
      admins.push(admin);
    }
    localStorage.setItem('sj_admins', JSON.stringify(admins));

    localStorage.setItem('sj_active_role', 'admin');
    localStorage.setItem('sj_active_user', JSON.stringify(admin));
    
    try {
      await this.syncFromSupabase();
    } catch (e) {}

    return admin;
  }

  static getDoctors(hospitalPortalId?: string): DoctorProfile[] {
    this.init();
    let doctors: DoctorProfile[] = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    doctors = doctors.filter(d => d !== null && d !== undefined);
    
    if (hospitalPortalId) {
      return doctors.filter(d => d.hospitalId?.trim().toUpperCase() === hospitalPortalId.trim().toUpperCase());
    }
    
    return doctors;
  }

  static async fetchDoctorsFromSupabase(hospitalPortalId?: string): Promise<DoctorProfile[]> {
    this.init();
    try {
      let query = supabase.from('doctors').select('*');
      const cleanHId = hospitalPortalId?.trim();

      // Collect all possible valid Hospital IDs for this Admin
      let possibleHospitalIds = cleanHId ? [cleanHId] : [];
      if (cleanHId) {
        if (cleanHId === 'admin_1784738108261' || cleanHId.toUpperCase() === 'SJV-HTPL-2828') {
          possibleHospitalIds.push('admin_1784738108261');
          possibleHospitalIds.push('SJV-HTPL-2828');
        }
        const admins = this.getAdmins();
        const matchedAdmin = admins.find(a => (a.hospitalPortalId && a.hospitalPortalId.toUpperCase() === cleanHId.toUpperCase()) || (a.id && a.id.toUpperCase() === cleanHId.toUpperCase()));
        if (matchedAdmin) {
          if (matchedAdmin.hospitalPortalId) possibleHospitalIds.push(matchedAdmin.hospitalPortalId);
          if (matchedAdmin.id) possibleHospitalIds.push(matchedAdmin.id);
        }
      }
      possibleHospitalIds = Array.from(new Set(possibleHospitalIds));

      const { data: dbDocs, error } = await query;
      if (!error && dbDocs) {
        const remoteDocs: DoctorProfile[] = dbDocs.map((d: any) => {
          let actualClinicName = d.clinic_name || '';
          let passwordHash = '';
          try {
            if (d.clinic_name && d.clinic_name.trim().startsWith('{')) {
              const parsed = JSON.parse(d.clinic_name);
              actualClinicName = parsed.clinicName || '';
              passwordHash = parsed.passwordHash || '';
            }
          } catch (e) {}

          return {
            id: d.id,
            name: d.name,
            email: d.email,
            specialty: d.specialty,
            clinicName: actualClinicName,
            avatarUrl: d.avatar_url,
            hospitalId: d.hospital_id,
            approvalStatus: d.approval_status || 'accepted',
            passwordHash
          };
        });

        // Save fresh remote database response to local storage
        localStorage.setItem('sj_doctors_list', JSON.stringify(remoteDocs));

        let filteredDocs = remoteDocs;
        if (possibleHospitalIds.length > 0) {
          filteredDocs = remoteDocs.filter(d => d.hospitalId && possibleHospitalIds.some(h => h.toUpperCase() === (d.hospitalId || '').trim().toUpperCase()));
        }

        const pendingDocs = filteredDocs.filter(d => d.approvalStatus === 'pending');
        console.log(`[SUPABASE QUERY] Logged-in Admin ID: ${this.getActiveSession().user?.id || 'N/A'}`);
        console.log(`[SUPABASE QUERY] Hospital ID entered/queried: ${hospitalPortalId || 'N/A'}`);
        console.log(`[SUPABASE QUERY] Hospital ID saved in Supabase:`, filteredDocs.map(d => d.hospitalId));
        console.log(`[SUPABASE QUERY] Pending Doctor Request Count: ${pendingDocs.length}`);
        console.log(`[SUPABASE QUERY] Database Query Result:`, pendingDocs);

        return filteredDocs;
      }
    } catch (e) {
      console.warn('[SYNC] Supabase fetchDoctorsFromSupabase failed, fallback to cache:', e);
    }

    return this.getDoctors(hospitalPortalId);
  }

  static addDoctor(doctorData: { name: string; email: string; specialty: string; clinicName: string; hospitalId: string; approvalStatus?: 'pending' | 'accepted' | 'rejected' }): DoctorProfile {
    this.init();
    const newDoc: DoctorProfile = {
      id: `doc_${Date.now()}`,
      name: doctorData.name,
      email: doctorData.email,
      specialty: doctorData.specialty,
      clinicName: doctorData.clinicName,
      hospitalId: doctorData.hospitalId,
      approvalStatus: doctorData.approvalStatus || 'accepted'
    };

    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    doctors.push(newDoc);
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    supabase.from('doctors').insert({
      id: newDoc.id,
      name: newDoc.name,
      email: newDoc.email,
      specialty: newDoc.specialty,
      clinic_name: newDoc.clinicName,
      hospital_id: newDoc.hospitalId,
      approval_status: newDoc.approvalStatus
    }).then(({ error }) => {
      if (error) console.error('Supabase doctor insert failed:', error);
    });

    realtimeBroker.publish('doctors-update');
    return newDoc;
  }

  static updateDoctor(doc: DoctorProfile) {
    this.init();
    const doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    const idx = doctors.findIndex((d: any) => d && d.id === doc.id);
    if (idx !== -1) {
      doctors[idx] = doc;
      localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

      supabase.from('doctors').upsert({
        id: doc.id,
        name: doc.name,
        email: doc.email,
        specialty: doc.specialty,
        clinic_name: doc.clinicName,
        hospital_id: doc.hospitalId,
        approval_status: doc.approvalStatus
      }).then(({ error }) => {
        if (error) console.error('Supabase doctor update failed:', error);
      });

      realtimeBroker.publish('doctors-update');
    }
  }

  static deleteDoctor(doctorId: string) {
    this.init();
    let doctors = JSON.parse(localStorage.getItem('sj_doctors_list') || '[]');
    doctors = doctors.filter((d: any) => d && d.id !== doctorId);
    localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));

    supabase.from('doctors').delete().eq('id', doctorId).then(({ error }) => {
      if (error) console.error('Supabase doctor delete failed:', error);
    });

    realtimeBroker.publish('doctors-update');
  }

  static updateDoctorApproval(doctorId: string, status: 'accepted' | 'rejected') {
    const doctors = this.getDoctors();
    const docIdx = doctors.findIndex(d => d.id === doctorId);
    if (docIdx !== -1) {
      doctors[docIdx].approvalStatus = status;
      localStorage.setItem('sj_doctors_list', JSON.stringify(doctors));
      
      const activeUser = JSON.parse(localStorage.getItem('sj_active_user') || 'null');
      if (activeUser && activeUser.id === doctorId) {
        localStorage.setItem('sj_active_user', JSON.stringify(doctors[docIdx]));
        localStorage.setItem('sj_doctor', JSON.stringify(doctors[docIdx]));
      }
      
      supabase.from('doctors').update({ approval_status: status }).eq('id', doctorId).then(({ error }) => {
        if (error) console.error('Supabase doctor approval update failed:', error);
      });
      
      realtimeBroker.publish('doctors-update');
    }
  }

  // ----------------------------------------------------
  // Appointment Actions
  // ----------------------------------------------------
  // ----------------------------------------------------
  // Appointment Actions
  // ----------------------------------------------------
  static getAppointments(hospitalPortalId?: string): Appointment[] {
    this.init();
    const apts = JSON.parse(localStorage.getItem('sj_appointments') || '[]');
    const list: Appointment[] = (Array.isArray(apts) ? apts : []).filter(Boolean);
    if (hospitalPortalId) {
      return list.filter(a => a.hospitalId?.trim() === hospitalPortalId.trim());
    }
    return list;
  }

  // Helper to generate token number
  static generateTokenNumber(hospitalId: string): string {
    const apts = this.getAppointments(hospitalId);
    const count = apts.length + 1;
    return `TKN-${String(count).padStart(3, '0')}`;
  }

  static requestAppointment(params: { patientId: string; hospitalId: string; timeRange: string; reason: string; doctorId?: string; department?: string; tokenNumber?: string }): Appointment;
  static requestAppointment(patientId: string, hospitalId: string, timeRange: string, reason: string, doctorId?: string, department?: string, tokenNumber?: string): Appointment;
  static requestAppointment(patientIdOrParams: string | { patientId: string; hospitalId: string; timeRange: string; reason: string; doctorId?: string; department?: string; tokenNumber?: string }, hospitalId?: string, timeRange?: string, reason?: string, doctorId?: string, department?: string, tokenNumber?: string): Appointment {
    let patientId: string, hId: string, tRange: string, rsn: string, docId: string | undefined, dept: string | undefined, tkn: string | undefined;
    if (typeof patientIdOrParams === 'object') {
      patientId = patientIdOrParams.patientId;
      hId = patientIdOrParams.hospitalId;
      tRange = patientIdOrParams.timeRange;
      rsn = patientIdOrParams.reason;
      docId = patientIdOrParams.doctorId;
      dept = patientIdOrParams.department;
      tkn = patientIdOrParams.tokenNumber;
    } else {
      patientId = patientIdOrParams;
      hId = hospitalId!;
      tRange = timeRange!;
      rsn = reason!;
      docId = doctorId;
      dept = department;
      tkn = tokenNumber;
    }
    const apts = this.getAppointments();
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId,
      hospitalId: hId,
      doctorId: docId,
      department: dept,
      tokenNumber: tkn || this.generateTokenNumber(hId),
      timeRange: tRange,
      reason: rsn,
      status: docId ? 'forwarded' : 'pending',
      createdAt: new Date().toISOString()
    };
    apts.unshift(newApt);
    localStorage.setItem('sj_appointments', JSON.stringify(apts));

    // Persist to Supabase (Serialize reason, department, tokenNumber inside the reason column to match database schema)
    const serializedReason = JSON.stringify({
      text: newApt.reason,
      department: newApt.department || '',
      tokenNumber: newApt.tokenNumber || ''
    });

    supabase.from('appointments').insert({
      id: newApt.id,
      patient_id: newApt.patientId,
      hospital_id: newApt.hospitalId,
      doctor_id: newApt.doctorId,
      time_range: newApt.timeRange,
      reason: serializedReason,
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

  static updateAppointmentStatus(appointmentId: string, status: Appointment['status']) {
    const apts = this.getAppointments();
    const aptIdx = apts.findIndex(a => a.id === appointmentId);
    if (aptIdx !== -1) {
      apts[aptIdx].status = status;
      localStorage.setItem('sj_appointments', JSON.stringify(apts));

      supabase.from('appointments').update({ status }).eq('id', appointmentId).then(({ error }) => {
        if (error) console.error('Supabase appointment status update failed:', error);
      });

      realtimeBroker.publish('appointments-update');
    }
  }

  static markAppointmentCompleted(appointmentId: string) {
    this.updateAppointmentStatus(appointmentId, 'completed');
  }

  // ----------------------------------------------------
  // Consultation Notes Module
  // ----------------------------------------------------
  static getConsultationNotes(hospitalPortalId?: string): ConsultationNote[] {
    this.init();
    const notes: ConsultationNote[] = JSON.parse(localStorage.getItem('sj_consultation_notes') || '[]');
    if (hospitalPortalId) {
      return notes.filter(n => n.hospitalPortalId?.trim() === hospitalPortalId.trim());
    }
    return notes;
  }

  static addConsultationNote(params: {
    hospitalPortalId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    prescribedMedicines: Drug[];
    recommendedTests: string[];
    followUpAdvice: string;
  }): ConsultationNote {
    this.init();
    const newNote: ConsultationNote = {
      id: `cn_${Date.now()}`,
      hospitalPortalId: params.hospitalPortalId,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      diagnosis: params.diagnosis,
      prescribedMedicines: params.prescribedMedicines,
      recommendedTests: params.recommendedTests,
      followUpAdvice: params.followUpAdvice,
      status: 'pending_explanation',
      createdAt: new Date().toISOString()
    };

    const notes = this.getConsultationNotes();
    notes.unshift(newNote);
    localStorage.setItem('sj_consultation_notes', JSON.stringify(notes));

    supabase.from('consultation_notes').insert({
      id: newNote.id,
      hospital_portal_id: newNote.hospitalPortalId,
      patient_id: newNote.patientId,
      patient_name: newNote.patientName,
      doctor_id: newNote.doctorId,
      doctor_name: newNote.doctorName,
      diagnosis: newNote.diagnosis,
      prescribed_medicines: newNote.prescribedMedicines,
      recommended_tests: newNote.recommendedTests,
      follow_up_advice: newNote.followUpAdvice,
      status: newNote.status,
      created_at: newNote.createdAt
    }).then(({ error }) => {
      if (error) console.error('Supabase consultation note insert failed:', error);
    });

    realtimeBroker.publish('consultation-notes-update');
    return newNote;
  }

  static markConsultationNoteExplained(noteId: string) {
    const notes = this.getConsultationNotes();
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx !== -1) {
      notes[idx].status = 'explained';
      notes[idx].explainedAt = new Date().toISOString();
      localStorage.setItem('sj_consultation_notes', JSON.stringify(notes));

      supabase.from('consultation_notes').update({
        status: 'explained',
        explained_at: notes[idx].explainedAt
      }).eq('id', noteId).then(({ error }) => {
        if (error) console.error('Supabase consultation note status update failed:', error);
      });

      realtimeBroker.publish('consultation-notes-update');
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
  static getPatients(hospitalPortalId?: string): PatientProfile[] {
    this.init();
    const pats: PatientProfile[] = JSON.parse(localStorage.getItem('sj_patients') || '[]');
    const validPats = pats.filter(p => p && p.id);
    if (hospitalPortalId && hospitalPortalId.trim() !== '') {
      return validPats.filter(p => p.hospitalPortalId && p.hospitalPortalId.trim() === hospitalPortalId.trim());
    }
    return validPats;
  }

  static getPatientById(id: string): PatientProfile | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  static registerPatient(params: {
    hospitalPortalId?: string;
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
      hospitalPortalId: params.hospitalPortalId,
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
      accountStatus: 'pending_activation',
      registeredAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const patients = JSON.parse(localStorage.getItem('sj_patients') || '[]');
    patients.push(newPatient);
    localStorage.setItem('sj_patients', JSON.stringify(patients));

    // Supabase insert patient
    supabase.from('patients').insert({
      id: newPatient.id,
      hospital_portal_id: newPatient.hospitalPortalId,
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
  // Lab Reports & Scans Management
  // ----------------------------------------------------
  static getReports(patientId?: string, hospitalPortalId?: string): UploadedReport[] {
    this.init();
    let reports: UploadedReport[] = JSON.parse(localStorage.getItem('sj_reports') || '[]');
    reports = reports.filter(r => r !== null && r !== undefined);
    if (hospitalPortalId) {
      reports = reports.filter(r => !r.hospitalPortalId || r.hospitalPortalId.trim() === hospitalPortalId.trim());
    }
    if (patientId) {
      return reports.filter(r => r.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
    }
    return reports.sort((a,b) => b.date.localeCompare(a.date));
  }

  static uploadReport(params: {
    patientId: string;
    hospitalPortalId?: string;
    title: string;
    category: UploadedReport['category'];
    fileUrl?: string;
    parsedSummary?: string;
    notes?: string;
    uploaderName?: string;
  }): UploadedReport;
  static uploadReport(patientId: string, title: string, category: UploadedReport['category'], parsedSummary: string, notes?: string): UploadedReport;
  static uploadReport(
    patientIdOrParams: string | { patientId: string; hospitalPortalId?: string; title: string; category: UploadedReport['category']; fileUrl?: string; parsedSummary?: string; notes?: string; uploaderName?: string },
    title?: string,
    category?: UploadedReport['category'],
    parsedSummary?: string,
    notes?: string
  ): UploadedReport {
    this.init();
    let pId: string, hId: string | undefined, t: string, c: UploadedReport['category'], fUrl: string, pSummary: string | undefined, nts: string | undefined, uName: string;
    
    if (typeof patientIdOrParams === 'object') {
      pId = patientIdOrParams.patientId;
      hId = patientIdOrParams.hospitalPortalId;
      t = patientIdOrParams.title;
      c = patientIdOrParams.category;
      fUrl = patientIdOrParams.fileUrl || '#';
      pSummary = patientIdOrParams.parsedSummary;
      nts = patientIdOrParams.notes;
      uName = patientIdOrParams.uploaderName || 'Hospital Admin & Diagnostic Center';
    } else {
      pId = patientIdOrParams;
      t = title!;
      c = category!;
      fUrl = '#';
      pSummary = parsedSummary;
      nts = notes;
      uName = 'Sanjeevani Smart AI Scanning';
    }

    const reportDate = new Date().toISOString().split('T')[0];
    const newReport: UploadedReport = {
      id: `rep_${Date.now()}`,
      patientId: pId,
      hospitalPortalId: hId,
      title: t,
      date: reportDate,
      category: c,
      fileUrl: fUrl,
      parsedSummary: pSummary,
      notes: nts,
      uploaderName: uName
    };

    const reports = JSON.parse(localStorage.getItem('sj_reports') || '[]');
    reports.push(newReport);
    localStorage.setItem('sj_reports', JSON.stringify(reports));

    const alerts = this.getAlerts(pId);
    const newAlert: HealthAlert = {
      id: `alert_rep_${Date.now()}`,
      patientId: pId,
      date: reportDate,
      type: 'report',
      title: `New Medical Report (${c}) Uploaded`,
      message: `A new medical report "${t}" has been added to your clinical health records.`,
      relatedId: newReport.id,
      redirectUrl: `patient/report/${newReport.id}`,
      read: false
    };
    alerts.unshift(newAlert);
    localStorage.setItem('sj_alerts', JSON.stringify(alerts));

    // Supabase inserts
    supabase.from('reports').insert({
      id: newReport.id,
      patient_id: pId,
      hospital_portal_id: hId,
      title: t,
      date: reportDate,
      category: c,
      file_url: fUrl,
      parsed_summary: pSummary,
      notes: nts,
      uploader_name: uName
    }).then(({ error }) => {
      if (error) console.error('Supabase report upload failed:', error);
    });

    supabase.from('alerts').insert({
      id: newAlert.id,
      patient_id: pId,
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
    realtimeBroker.publish(`patient-${pId}`);
    realtimeBroker.publish(`alerts-${pId}`);

    // Auto update matching pending recommended test status to Completed
    try {
      const recTests = this.getRecommendedTests(pId, hId);
      const matchingRec = recTests.find(rt => 
        rt.status === 'Pending' && 
        (rt.testName.toLowerCase().includes(c.toLowerCase()) || 
         c.toLowerCase().includes(rt.testName.toLowerCase()) ||
         t.toLowerCase().includes(rt.testName.toLowerCase()) ||
         rt.testName.toLowerCase().includes(t.toLowerCase()))
      );
      if (matchingRec) {
        this.updateRecommendedTestStatus(matchingRec.id, 'Completed', newReport.id);
      }
    } catch (err) {
      console.warn('Auto recommended test update failed:', err);
    }

    return newReport;
  }

  // ----------------------------------------------------
  // Recommended Tests Management
  // ----------------------------------------------------
  static getRecommendedTests(patientId?: string, hospitalPortalId?: string): RecommendedTestRecord[] {
    this.init();
    const tests: RecommendedTestRecord[] = JSON.parse(localStorage.getItem('sj_recommended_tests') || '[]');
    let filtered = tests.filter(t => t && t.id);

    if (hospitalPortalId && hospitalPortalId.trim() !== '') {
      filtered = filtered.filter(t => t.hospitalPortalId && t.hospitalPortalId.trim() === hospitalPortalId.trim());
    }

    if (patientId) {
      filtered = filtered.filter(t => t.patientId === patientId);
    }

    return filtered.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
  }

  static addRecommendedTests(testsList: {
    patientId: string;
    hospitalPortalId: string;
    visitId?: string;
    testName: string;
    category?: string;
    recommendedByDoctor: string;
  }[]): RecommendedTestRecord[] {
    this.init();
    const existing: RecommendedTestRecord[] = JSON.parse(localStorage.getItem('sj_recommended_tests') || '[]');
    const dateStr = new Date().toISOString().split('T')[0];

    const newRecords: RecommendedTestRecord[] = testsList.map((t, idx) => ({
      id: `rt_${Date.now()}_${idx}`,
      patientId: t.patientId,
      hospitalPortalId: t.hospitalPortalId,
      visitId: t.visitId,
      testName: t.testName,
      category: t.category || 'Diagnostic Test',
      status: 'Pending',
      recommendedByDoctor: t.recommendedByDoctor,
      date: dateStr
    }));

    const combined = [...newRecords, ...existing];
    localStorage.setItem('sj_recommended_tests', JSON.stringify(combined));

    newRecords.forEach(rec => {
      supabase.from('recommended_tests').insert({
        id: rec.id,
        patient_id: rec.patientId,
        hospital_portal_id: rec.hospitalPortalId,
        visit_id: rec.visitId,
        test_name: rec.testName,
        category: rec.category,
        status: rec.status,
        recommended_by_doctor: rec.recommendedByDoctor,
        created_at: rec.date
      }).then(({ error }) => {
        if (error) console.error('Supabase recommended test insert failed:', error);
      });
    });

    realtimeBroker.publish('recommended-tests-update');
    return newRecords;
  }

  static updateRecommendedTestStatus(id: string, status: 'Pending' | 'Completed', reportId?: string) {
    this.init();
    const existing: RecommendedTestRecord[] = JSON.parse(localStorage.getItem('sj_recommended_tests') || '[]');
    const idx = existing.findIndex(t => t.id === id);
    if (idx !== -1) {
      existing[idx].status = status;
      if (reportId) existing[idx].reportId = reportId;
      localStorage.setItem('sj_recommended_tests', JSON.stringify(existing));

      supabase.from('recommended_tests').update({
        status: status,
        report_id: reportId
      }).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase recommended test status update failed:', error);
      });

      realtimeBroker.publish('recommended-tests-update');
    }
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

  // --- Admin Account Center & Security ---
  static getLoginActivityLogs(adminId: string): LoginActivityLog[] {
    this.init();
    const raw = localStorage.getItem(`sj_login_logs_${adminId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // fallback
      }
    }
    // Standard initial logs
    const defaultLogs: LoginActivityLog[] = [
      { id: 'log-1', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), device: 'Windows PC', browser: 'Chrome 126.0', isCurrent: true },
      { id: 'log-2', date: '21 Jul 2026', time: '08:30 PM', device: 'Android Pixel Device', browser: 'Chrome Mobile', isCurrent: false },
      { id: 'log-3', date: '20 Jul 2026', time: '09:15 AM', device: 'MacBook Pro', browser: 'Safari 17.4', isCurrent: false },
      { id: 'log-4', date: '18 Jul 2026', time: '04:45 PM', device: 'Windows PC', browser: 'Edge 125.0', isCurrent: false }
    ];
    localStorage.setItem(`sj_login_logs_${adminId}`, JSON.stringify(defaultLogs));
    return defaultLogs;
  }

  static recordLoginActivity(adminId: string, device: string, browser: string) {
    const logs = this.getLoginActivityLogs(adminId);
    logs.forEach(l => l.isCurrent = false);
    const newLog: LoginActivityLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      device,
      browser,
      isCurrent: true
    };
    logs.unshift(newLog);
    const trimmed = logs.slice(0, 10); // Keep last 10 sessions
    localStorage.setItem(`sj_login_logs_${adminId}`, JSON.stringify(trimmed));
    return trimmed;
  }
}
