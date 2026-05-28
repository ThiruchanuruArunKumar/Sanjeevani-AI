// src/App.tsx
import React, { useState, useEffect } from 'react';
import { DatabaseService } from './services/db';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Welcome } from './routes/Public/Welcome';
import { DoctorAuth } from './routes/Public/DoctorAuth';
import { PatientAuth } from './routes/Public/PatientAuth';
import { DoctorDashboard } from './routes/Doctor/DoctorDashboard';
import { SearchPatients } from './routes/Doctor/SearchPatients';
import { PatientProfile } from './routes/Doctor/PatientProfile';
import { NewConsultation } from './routes/Doctor/NewConsultation';
import { PrescriptionCreator } from './routes/Doctor/PrescriptionCreator';
import { UploadReport } from './routes/Doctor/UploadReport';
import { PatientDashboard } from './routes/Patient/PatientDashboard';
import { PatientHistory } from './routes/Patient/PatientHistory';
import { PatientReportDetail } from './routes/Patient/PatientReportDetail';
import { PatientVisitDetail } from './routes/Patient/PatientVisitDetail';
import { EmergencyQR } from './routes/Patient/EmergencyQR';
import { EmergencyPortal } from './routes/Emergency/EmergencyPortal';
import { AnalyticsDashboard } from './routes/Analytics/AnalyticsDashboard';
import { Profile } from './routes/Shared/Profile';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('welcome');
  const [, setTick] = useState(0); // force re-render on session change

  useEffect(() => {
    setTick(t => t + 1);
  }, [currentView]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const renderViewContent = () => {
    const { role } = DatabaseService.getActiveSession();

    // ── 1. PUBLIC ──────────────────────────────────────────
    if (currentView === 'welcome')       return <Welcome onNavigate={handleNavigate} />;
    if (currentView === 'doctor/login')  return <DoctorAuth onNavigate={handleNavigate} />;
    if (currentView === 'patient/login') return <PatientAuth onNavigate={handleNavigate} />;

    // ── 2. EMERGENCY BYPASS (no auth) ──────────────────────
    if (currentView.startsWith('emergency/')) {
      const pid = currentView.includes('?id=')
        ? currentView.split('?id=')[1] ?? ''
        : '';
      return <EmergencyPortal patientIdQuery={pid} onNavigate={handleNavigate} />;
    }

    // ── 3. DOCTOR ROUTES ───────────────────────────────────
    if (role === 'doctor') {
      if (currentView === 'doctor/dashboard')  return <DoctorDashboard onNavigate={handleNavigate} />;
      if (currentView === 'doctor/search')     return <SearchPatients onNavigate={handleNavigate} />;

      if (currentView.startsWith('doctor/patient/')) {
        // doctor/patient/:id/consult  → New Consultation
        if (currentView.endsWith('/consult')) {
          const pid = currentView.split('doctor/patient/')[1].replace('/consult', '');
          return <NewConsultation patientId={pid} onNavigate={handleNavigate} />;
        }
        const pid = currentView.split('doctor/patient/')[1] ?? '';
        return <PatientProfile patientId={pid} onNavigate={handleNavigate} />;
      }

      if (currentView.startsWith('doctor/prescription')) {
        const pid = currentView.includes('?patientId=')
          ? currentView.split('?patientId=')[1] ?? ''
          : '';
        return <PrescriptionCreator initialPatientId={pid} onNavigate={handleNavigate} />;
      }

      if (currentView.startsWith('doctor/upload-report')) {
        const pid = currentView.includes('?patientId=')
          ? currentView.split('?patientId=')[1] ?? ''
          : '';
        return <UploadReport initialPatientId={pid} onNavigate={handleNavigate} />;
      }

      // Any unrecognised doctor/* path → dashboard
      if (currentView.startsWith('doctor/')) {
        return <DoctorDashboard onNavigate={handleNavigate} />;
      }
    }

    // ── 4. PATIENT ROUTES ──────────────────────────────────
    if (role === 'patient') {
      if (currentView === 'patient/dashboard') return <PatientDashboard onNavigate={handleNavigate} />;
      if (currentView === 'patient/history')   return <PatientHistory onNavigate={handleNavigate} />;
      if (currentView === 'patient/qr')        return <EmergencyQR onNavigate={handleNavigate} />;

      // patient/report/:reportId — Lab Report Detail
      if (currentView.startsWith('patient/report/')) {
        const reportId = currentView.split('patient/report/')[1] ?? '';
        return <PatientReportDetail reportId={reportId} onNavigate={handleNavigate} />;
      }

      // patient/visit/:visitId — Visit Detail
      if (currentView.startsWith('patient/visit/')) {
        const visitId = currentView.split('patient/visit/')[1] ?? '';
        return <PatientVisitDetail visitId={visitId} onNavigate={handleNavigate} />;
      }

      // Any unrecognised patient/* path → dashboard
      if (currentView.startsWith('patient/')) {
        return <PatientDashboard onNavigate={handleNavigate} />;
      }
    }

    // ── 5. SHARED AUTHENTICATED ────────────────────────────
    if (role) {
      if (currentView === 'profile') return <Profile onNavigate={handleNavigate} />;
      if (currentView === 'analytics/healthcare' || currentView === 'analytics/risk') {
        return <AnalyticsDashboard />;
      }

      // Any other path while authenticated → role home
      return role === 'doctor'
        ? <DoctorDashboard onNavigate={handleNavigate} />
        : <PatientDashboard onNavigate={handleNavigate} />;
    }

    // ── 6. UNAUTHENTICATED GUARD ───────────────────────────
    if (currentView.startsWith('doctor/'))  return <DoctorAuth onNavigate={handleNavigate} />;
    if (currentView.startsWith('patient/')) return <PatientAuth onNavigate={handleNavigate} />;
    return <Welcome onNavigate={handleNavigate} />;
  };

  const isPublicFrame =
    currentView === 'welcome' ||
    currentView === 'doctor/login' ||
    currentView === 'patient/login' ||
    currentView.startsWith('emergency/');

  return (
    <ThemeProvider>
      <div className="App selection:bg-teal-500 selection:text-white">
        {isPublicFrame ? (
          renderViewContent()
        ) : (
          <Layout currentView={currentView} onNavigate={handleNavigate}>
            {renderViewContent()}
          </Layout>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
