// src/App.tsx
import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { DatabaseService, supabase } from './services/db';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Welcome } from './routes/Public/Welcome';
import { Splash } from './routes/Public/Splash';
import { Onboarding } from './routes/Public/Onboarding';
import { RoleSelection } from './routes/Public/RoleSelection';
import { DoctorAuth } from './routes/Public/DoctorAuth';
import { PatientAuth } from './routes/Public/PatientAuth';
import { AdminAuth } from './routes/Public/AdminAuth';
import { DoctorDashboard } from './routes/Doctor/DoctorDashboard';
import { SearchPatients } from './routes/Doctor/SearchPatients';
import { PatientProfile } from './routes/Doctor/PatientProfile';
import { NewConsultation } from './routes/Doctor/NewConsultation';
import { PrescriptionCreator } from './routes/Doctor/PrescriptionCreator';
import { UploadReport } from './routes/Doctor/UploadReport';
import { AIAlerts } from './routes/Doctor/AIAlerts';
import { ConsultationHistory } from './routes/Doctor/ConsultationHistory';
import { PatientDashboard } from './routes/Patient/PatientDashboard';
import { PatientAppointments } from './routes/Patient/PatientAppointments';
import { PatientHistory } from './routes/Patient/PatientHistory';
import { PatientReportDetail } from './routes/Patient/PatientReportDetail';
import { PatientVisitDetail } from './routes/Patient/PatientVisitDetail';
import { EmergencyQR } from './routes/Patient/EmergencyQR';
import { EmergencyPortal } from './routes/Emergency/EmergencyPortal';
import { AnalyticsDashboard } from './routes/Analytics/AnalyticsDashboard';
import { Profile } from './routes/Shared/Profile';
import { AdminDashboard } from './routes/Admin/AdminDashboard';
import { ManageDoctors } from './routes/Admin/ManageDoctors';
import { ManageAppointments } from './routes/Admin/ManageAppointments';
import { ManagePatients } from './routes/Admin/ManagePatients';
import { AllPatients } from './routes/Admin/AllPatients';
import { ConsultationNotes } from './routes/Admin/ConsultationNotes';
import { DoctorRouteWrapper } from './routes/Doctor/DoctorRouteWrapper';
import { useIsMobile, isCapacitorAndroid } from './services/platform';

export const App: React.FC = () => {

  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return window.innerWidth < 768 || isCapacitorAndroid();
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const getCleanPath = () => {
    let path = window.location.pathname.substring(1);
    if (path.startsWith('Sanjeevani-AI/')) {
      path = path.replace('Sanjeevani-AI/', '');
    } else if (path === 'Sanjeevani-AI') {
      path = '';
    }
    if (path === 'index.html' || path.endsWith('/index.html')) {
      path = '';
    }
    return path;
  };

  const [currentView, setCurrentView] = useState<string>(() => {
    const path = getCleanPath();
    if (path) return path;
    const initialMobile = window.innerWidth < 768 || isCapacitorAndroid();
    return initialMobile ? 'role-selection' : 'welcome';
  });
  const [, setTick] = useState(0); // force re-render on session change

  useEffect(() => {
    setTick(t => t + 1);
  }, [currentView]);

  useEffect(() => {
    const handlePopState = () => {
      const path = getCleanPath();
      const currentMobile = window.innerWidth < 768 || isCapacitorAndroid();
      const defaultView = currentMobile ? 'role-selection' : 'welcome';
      setCurrentView(path || defaultView);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial load
    handlePopState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
      SplashScreen.hide().catch(() => {});

      const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        const rootViews = ['welcome', 'role-selection', 'doctor/login', 'patient/login', 'admin/login', 'doctor/dashboard', 'patient/dashboard', 'admin/dashboard'];
        if (canGoBack && !rootViews.includes(currentView)) {
          window.history.back();
        } else {
          CapacitorApp.minimizeApp().catch(() => {
            CapacitorApp.exitApp();
          });
        }
      });

      return () => {
        backListener.then(l => l.remove()).catch(() => {});
      };
    }
  }, [currentView]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const resolved = await DatabaseService.handlePatientOAuthResolution(session);
        if (resolved) {
          handleNavigate('patient/dashboard');
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const handleNavigate = (view: string) => {
    setCurrentView(view);
    const defaultView = isMobile ? 'role-selection' : 'welcome';
    const basePath = window.location.pathname.includes('Sanjeevani-AI') ? '/Sanjeevani-AI' : '';
    const urlPath = view === defaultView ? `${basePath}/` : `${basePath}/${view}`;
    if (window.location.pathname !== urlPath && !window.location.protocol.startsWith('file')) {
      try {
        window.history.pushState({}, '', urlPath);
      } catch (e) {
        // Fallback for strict webviews
      }
    }
    window.scrollTo(0, 0);
  };

  const renderViewContent = () => {
    const { role } = DatabaseService.getActiveSession();

    // ── 1. PUBLIC ──────────────────────────────────────────
    if (currentView === 'welcome')        return <Welcome onNavigate={handleNavigate} />;
    if (currentView === 'role-selection') return <RoleSelection onNavigate={handleNavigate} />;
    if (currentView === 'doctor/login')   return <DoctorAuth onNavigate={handleNavigate} />;
    if (currentView === 'patient/login')  return <PatientAuth onNavigate={handleNavigate} />;
    if (currentView === 'admin/login')    return <AdminAuth onNavigate={handleNavigate} />;

    // ── 2. EMERGENCY BYPASS (no auth) ──────────────────────
    if (currentView.startsWith('emergency/')) {
      const pid = currentView.includes('?id=')
        ? currentView.split('?id=')[1] ?? ''
        : '';
      return <EmergencyPortal patientIdQuery={pid} onNavigate={handleNavigate} />;
    }

    // ── 2.5 SHARED ROUTES (Run before catch-alls) ──────────
    if (role && (currentView === 'profile' || currentView === `${role}/profile`)) {
      return <Profile onNavigate={handleNavigate} />;
    }
    if (role && (currentView === 'analytics/healthcare' || currentView === 'analytics/risk')) {
      return <AnalyticsDashboard />;
    }

    // ── 3. DOCTOR ROUTES ───────────────────────────────────
    if (role === 'doctor') {
      const renderDoctorRoute = () => {
        if (currentView === 'doctor/dashboard')     return <DoctorDashboard onNavigate={handleNavigate} />;
        if (currentView === 'doctor/appointments')  return <DoctorDashboard onNavigate={handleNavigate} />;
        if (currentView === 'doctor/patients')      return <SearchPatients onNavigate={handleNavigate} />;
        if (currentView === 'doctor/history')       return <ConsultationHistory onNavigate={handleNavigate} />;
        if (currentView === 'doctor/alerts')        return <AIAlerts onNavigate={handleNavigate} />;
        if (currentView === 'doctor/search')        return <SearchPatients onNavigate={handleNavigate} />;

        if (currentView.startsWith('doctor/patient/')) {
          // doctor/patient/:id/consult  → New Consultation
          if (currentView.endsWith('/consult')) {
            const pid = currentView.split('doctor/patient/')[1].replace('/consult', '');
            return <NewConsultation patientId={pid} onNavigate={handleNavigate} />;
          }
          const pid = currentView.split('doctor/patient/')[1] ?? '';
          return <PatientProfile patientId={pid} onNavigate={handleNavigate} />;
        }

        // Any unrecognised doctor/* path → dashboard
        return <DoctorDashboard onNavigate={handleNavigate} />;
      };

      return (
        <DoctorRouteWrapper onNavigate={handleNavigate}>
          {renderDoctorRoute()}
        </DoctorRouteWrapper>
      );
    }

    // ── 4. PATIENT ROUTES ──────────────────────────────────
    if (role === 'patient') {
      if (currentView === 'patient/dashboard')    return <PatientDashboard onNavigate={handleNavigate} />;
      if (currentView === 'patient/history')       return <PatientHistory onNavigate={handleNavigate} />;
      if (currentView === 'patient/appointments')  return <PatientAppointments onNavigate={handleNavigate} />;
      if (currentView === 'patient/qr')            return <EmergencyQR onNavigate={handleNavigate} />;

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

    // ── 4.5 ADMIN ROUTES ───────────────────────────────────
    if (role === 'admin') {
      if (currentView === 'admin/dashboard')            return <AdminDashboard onNavigate={handleNavigate} />;
      if (currentView === 'admin/doctors')              return <ManageDoctors onNavigate={handleNavigate} />;
      if (currentView === 'admin/appointments')         return <ManageAppointments onNavigate={handleNavigate} />;
      if (currentView === 'admin/patient-registration') return <ManagePatients onNavigate={handleNavigate} />;
      if (currentView === 'admin/all-patients')         return <AllPatients onNavigate={handleNavigate} />;
      if (currentView === 'admin/patients')             return <ManagePatients onNavigate={handleNavigate} />;
      if (currentView === 'admin/consultations')        return <ConsultationNotes onNavigate={handleNavigate} />;
      if (currentView === 'admin/consultation-notes')   return <ConsultationNotes onNavigate={handleNavigate} />;
      if (currentView === 'admin/reports')             return <UploadReport onNavigate={handleNavigate} />;
      if (currentView === 'admin/alerts')              return <AIAlerts onNavigate={handleNavigate} />;
      if (currentView === 'admin/profile')             return <Profile onNavigate={handleNavigate} />;
      
      if (currentView.startsWith('admin/')) {
        return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    // ── 5. FALLBACK ROUTING ────────────────────────────────
    if (role) {
      // Any other path while authenticated → role home
      if (role === 'admin') return <AdminDashboard onNavigate={handleNavigate} />;
      return (role as any) === 'doctor'
        ? <DoctorDashboard onNavigate={handleNavigate} />
        : <PatientDashboard onNavigate={handleNavigate} />;
    }

    // ── 6. UNAUTHENTICATED GUARD ───────────────────────────
    if (currentView.startsWith('admin/'))   return <AdminAuth onNavigate={handleNavigate} />;
    if (currentView.startsWith('doctor/'))  return <DoctorAuth onNavigate={handleNavigate} />;
    if (currentView.startsWith('patient/')) return <PatientAuth onNavigate={handleNavigate} />;
    return isMobile ? (
      <RoleSelection onNavigate={handleNavigate} />
    ) : (
      <Welcome onNavigate={handleNavigate} />
    );
  };

  const { role: activeRole } = DatabaseService.getActiveSession();
  const isPublicFrame =
    !activeRole ||
    currentView === 'welcome' ||
    currentView === 'role-selection' ||
    currentView === 'doctor/login' ||
    currentView === 'patient/login' ||
    currentView === 'admin/login' ||
    currentView.startsWith('emergency/');

  if (isMobile && showSplash) {
    return (
      <Splash 
        onComplete={() => {
          setShowSplash(false);
          setShowOnboarding(true);
        }} 
      />
    );
  }

  if (isMobile && showOnboarding) {
    return (
      <Onboarding 
        onComplete={() => {
          setShowOnboarding(false);
          if (!currentView || currentView === 'welcome') {
            setCurrentView('role-selection');
          }
        }} 
      />
    );
  }

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
