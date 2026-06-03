// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { DatabaseService, HealthAlert, realtimeBroker } from '../services/db';
import { NotificationDrawer } from './NotificationDrawer';
import { EmergencyAlertPopup } from './EmergencyAlertPopup';
import { useTheme } from '../context/ThemeContext';
import { 
  Stethoscope, 
  Activity, 
  Search, 
  Pill, 
  Upload, 
  TrendingUp, 
  QrCode, 
  History, 
  Bell, 
  LogOut, 
  ShieldAlert, 
  User,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  Building,
  Users,
  Calendar
} from 'lucide-react';

interface LayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { role, user } = DatabaseService.getActiveSession();
  const { theme, toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<HealthAlert | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const updateUnread = () => {
      const alerts = DatabaseService.getAlerts(user.id);
      setUnreadCount(alerts.filter(a => !a.read).length);
    };

    updateUnread();

    const unsubscribe = realtimeBroker.subscribe(`alerts-${user.id}`, () => {
      updateUnread();
    });

    // Subscribe to emergency channel for this patient
    const unsubEmergency = realtimeBroker.subscribe(`emergency-${user.id}`, () => {
      const allAlerts = DatabaseService.getAlerts(user.id);
      const latestEmergency = allAlerts.find(a => a.type === 'emergency' && !a.read);
      if (latestEmergency) {
        setActiveEmergency(latestEmergency);
      }
    });

    return () => {
      unsubscribe();
      unsubEmergency();
    };
  }, [user]);

  const handleLogout = () => {
    DatabaseService.logout();
    onNavigate('welcome');
  };

  const doctorNavItems = [
    { id: 'doctor/dashboard', label: 'Dashboard', icon: <Activity className="h-5 w-5" /> },
    { id: 'doctor/alerts', label: 'AI Safety Alerts', icon: <ShieldAlert className="h-5 w-5" /> },
    { id: 'doctor/search', label: 'Search Patients', icon: <Search className="h-5 w-5" /> },
    { id: 'doctor/prescription', label: 'Prescribe & Safety Check', icon: <Pill className="h-5 w-5" /> },
    { id: 'doctor/upload-report', label: 'Upload Medical Report', icon: <Upload className="h-5 w-5" /> },
    { id: 'analytics/healthcare', label: 'Clinical Analytics', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const patientNavItems = [
    { id: 'patient/dashboard', label: 'My Dashboard', icon: <Activity className="h-5 w-5" /> },
    { id: 'patient/appointments', label: 'My Appointments', icon: <Calendar className="h-5 w-5" /> },
    { id: 'patient/history', label: 'Clinical History', icon: <History className="h-5 w-5" /> },
    { id: 'patient/qr', label: 'Emergency QR ID', icon: <QrCode className="h-5 w-5" /> },
    { id: 'analytics/risk', label: 'Health Risk Index', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const adminNavItems = [
    { id: 'admin/dashboard', label: 'Admin Dashboard', icon: <Building className="h-5 w-5" /> },
    { id: 'admin/appointments', label: 'Manage Appointments', icon: <History className="h-5 w-5" /> },
    { id: 'admin/doctors', label: 'Manage Doctors', icon: <Stethoscope className="h-5 w-5" /> },
    { id: 'admin/patients', label: 'Manage Patients', icon: <Users className="h-5 w-5" /> },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'doctor' ? doctorNavItems : patientNavItems;

  const defaultRoute = role === 'admin' ? 'admin/dashboard' : role === 'doctor' ? 'doctor/dashboard' : 'patient/dashboard';

  // Determine title for Android Header
  const getHeaderTitle = () => {
    if (currentView.startsWith('doctor/patient/')) return 'Patient Record';
    if (currentView.includes('profile')) return 'My Profile';
    if (currentView.includes('prescription')) return 'AI Prescription';
    if (currentView.includes('upload-report')) return 'Upload Report';
    if (currentView.includes('appointments')) return 'Appointments';
    if (currentView.includes('history')) return 'Clinical History';
    if (currentView.includes('alerts')) return 'Safety Alerts';
    if (currentView.includes('qr')) return 'Emergency pass';
    return 'Sanjeevani AI';
  };

  // Determine back navigation destination
  const hasBackNavigation = 
    currentView.includes('/profile') || 
    currentView.startsWith('doctor/patient/') || 
    currentView.includes('prescription') || 
    currentView.includes('upload-report') || 
    currentView.includes('appointments') || 
    currentView.includes('history') || 
    currentView.includes('alerts') || 
    currentView.includes('qr');

  const handleBackPress = () => {
    onNavigate(defaultRoute);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* 📱 Android Style Top App Bar */}
      <header className="glass-nav sticky top-0 z-40 w-full px-4 py-3.5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          {/* Back button where applicable */}
          {hasBackNavigation ? (
            <button 
              onClick={handleBackPress}
              className="p-2 rounded-xl text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(defaultRoute)}>
              <img
                src="/logo.png"
                alt="Sanjeevani AI"
                className="h-8.5 w-auto object-contain"
              />
            </div>
          )}
          
          <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
            {getHeaderTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Premium Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            id="theme-toggle-btn"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-700 transition-all duration-300" />
            ) : (
              <Sun className="h-5 w-5 text-teal-400 transition-all duration-300" />
            )}
          </button>

          {/* Realtime Notification Bell */}
          {user && role === 'patient' && (
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4.5 w-4.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex relative pb-16 lg:pb-0">
        
        {/* Navigation Sidebar for Desktop / Large displays */}
        <aside className="hidden lg:block w-64 glass-card border-t-0 border-l-0 border-b-0 min-h-screen p-6 space-y-8 sticky top-20 h-[calc(100vh-80px)]">
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-3">Main Navigation</span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentView === item.id || currentView.startsWith(item.id.split('/:')[0]);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-premium' 
                        : 'text-slate-600 hover:text-primary hover:bg-teal-50/50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-8 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-500/10 text-center">
              <img src="/logo.png" alt="Sanjeevani AI" className="h-14 w-auto object-contain mx-auto mb-2" />
              <span className="text-[10px] text-slate-400 block leading-normal font-semibold">Protecting patient safety and drug interaction risks in real-time.</span>
            </div>
          </div>
        </aside>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 lg:p-10 max-w-7xl mx-auto w-full overflow-hidden">
          {children}
        </main>

      </div>

      {/* 📱 Modern Android-style Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/80 shadow-premium flex justify-around items-center py-2 px-1">
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentView === item.id || currentView.startsWith(item.id.split('/:')[0]);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all cursor-pointer relative"
            >
              {/* Active Indicator Backdrop */}
              <div className={`h-8 w-14 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-primary scale-105' 
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-extrabold uppercase mt-1 tracking-wide transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {item.label.split(' ').pop()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slide-over Notification Drawer for Patient */}
      {user && role === 'patient' && (
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          patientId={user.id}
          onNavigate={onNavigate}
        />
      )}

      {/* Emergency Alert Full-Screen Popup */}
      {activeEmergency && (
        <EmergencyAlertPopup
          alert={activeEmergency}
          onNavigate={onNavigate}
          onDismiss={() => setActiveEmergency(null)}
        />
      )}

    </div>
  );
};
