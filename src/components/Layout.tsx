// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { DatabaseService, HealthAlert, realtimeBroker } from '../services/db';
import { NotificationDrawer } from './NotificationDrawer';
import { EmergencyAlertPopup } from './EmergencyAlertPopup';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../services/platform';
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
  UserPlus,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  Building,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

interface LayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const { role, user } = DatabaseService.getActiveSession();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
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
    { id: 'doctor/appointments', label: "Today's Appointments", icon: <Calendar className="h-5 w-5" /> },
    { id: 'doctor/patients', label: 'My Patients', icon: <Users className="h-5 w-5" /> },
    { id: 'doctor/history', label: 'Consultation History', icon: <History className="h-5 w-5" /> },
    { id: 'doctor/alerts', label: 'Notifications', icon: <ShieldAlert className="h-5 w-5" /> },
    { id: 'doctor/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  const patientNavItems = [
    { id: 'patient/dashboard', label: 'My Dashboard', icon: <Activity className="h-5 w-5" /> },
    { id: 'patient/appointments', label: 'My Appointments', icon: <Calendar className="h-5 w-5" /> },
    { id: 'patient/history', label: 'Clinical History', icon: <History className="h-5 w-5" /> },
    { id: 'patient/qr', label: 'Emergency QR ID', icon: <QrCode className="h-5 w-5" /> },
    { id: 'analytics/risk', label: 'Health Risk Index', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const adminNavItems = [
    { id: 'admin/dashboard', label: 'Dashboard', icon: <Building className="h-5 w-5" /> },
    { id: 'admin/doctors', label: 'Doctor Approval Requests', icon: <Stethoscope className="h-5 w-5" /> },
    { id: 'admin/patient-registration', label: 'Patient Registration', icon: <UserPlus className="h-5 w-5" /> },
    { id: 'admin/all-patients', label: 'All Patients', icon: <Users className="h-5 w-5" /> },
    { id: 'admin/appointments', label: 'Appointment Requests', icon: <Calendar className="h-5 w-5" /> },
    { id: 'admin/consultations', label: 'Consultation Notes', icon: <FileText className="h-5 w-5" /> },
    { id: 'admin/reports', label: 'Upload Reports', icon: <Upload className="h-5 w-5" /> },
    { id: 'admin/alerts', label: 'Notifications', icon: <ShieldAlert className="h-5 w-5" /> },
    { id: 'admin/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'doctor' ? doctorNavItems : patientNavItems;

  const doctorBottomItems = [
    { id: 'doctor/dashboard', label: 'Home', icon: <Activity className="h-5 w-5" /> },
    { id: 'doctor/appointments', label: 'Schedule', icon: <Calendar className="h-5 w-5" /> },
    { id: 'doctor/patients', label: 'Patients', icon: <Users className="h-5 w-5" /> },
    { id: 'doctor/alerts', label: 'Alerts', icon: <ShieldAlert className="h-5 w-5" /> },
    { id: 'doctor/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  const patientBottomItems = [
    { id: 'patient/dashboard', label: 'Home', icon: <Activity className="h-5 w-5" /> },
    { id: 'patient/appointments', label: 'Bookings', icon: <Calendar className="h-5 w-5" /> },
    { id: 'patient/history', label: 'History', icon: <History className="h-5 w-5" /> },
    { id: 'patient/qr', label: 'Pass ID', icon: <QrCode className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  const adminBottomItems = [
    { id: 'admin/dashboard', label: 'Home', icon: <Building className="h-5 w-5" /> },
    { id: 'admin/doctors', label: 'Doctors', icon: <Stethoscope className="h-5 w-5" /> },
    { id: 'admin/appointments', label: 'Requests', icon: <Calendar className="h-5 w-5" /> },
    { id: 'admin/all-patients', label: 'Patients', icon: <Users className="h-5 w-5" /> },
    { id: 'admin/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
  ];

  const bottomNavItems = role === 'admin' ? adminBottomItems : role === 'doctor' ? doctorBottomItems : patientBottomItems;

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      {isMobile ? (
        <div className="max-w-md mx-auto w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative shadow-2xl overflow-x-hidden border-x border-slate-200/60 dark:border-slate-800/80">
          {/* 📱 MNC Native App Fixed Top Header Bar */}
          <header className="glass-nav sticky top-0 z-40 w-full h-14 px-3 safe-top-padding flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="h-9 w-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-200/60 dark:border-slate-800 shrink-0"
                title="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Back button where applicable */}
              {hasBackNavigation && (
                <button 
                  onClick={handleBackPress}
                  className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-800 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div className="flex items-center gap-2 cursor-pointer truncate" onClick={() => onNavigate(defaultRoute)}>
                <div className="h-8.5 w-8.5 rounded-xl bg-teal-500/10 dark:bg-teal-400/20 border border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400 font-black text-xs shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="text-left truncate">
                  <span className="text-xs font-black text-slate-900 dark:text-white block tracking-tight leading-none truncate">
                    {user?.name || getHeaderTitle()}
                  </span>
                  <span className="text-[9px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider block mt-0.5 truncate">
                    {role === 'patient' ? `ID: ${user?.id || ''}` : role === 'doctor' ? 'Doctor Portal' : 'Admin Portal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Emergency Quick SOS Button */}
              <button 
                onClick={() => onNavigate('emergency/scan')} 
                className="h-8 px-2.5 bg-rose-500 text-white rounded-xl text-[11px] font-black shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
                <span>SOS</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="h-8 w-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-200/50 dark:border-slate-800 shrink-0"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-slate-700" />
                ) : (
                  <Sun className="h-4 w-4 text-teal-400" />
                )}
              </button>

              {/* Notification Bell */}
              {user && role === 'patient' && (
                <button 
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative h-8 w-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-200/50 dark:border-slate-800 shrink-0"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:bg-rose-950/30 rounded-xl transition-all active:scale-95 border border-slate-200/50 dark:border-slate-800 shrink-0"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="relative w-72 max-w-xs bg-white dark:bg-slate-900 h-full p-6 flex flex-col gap-6 shadow-2xl animate-slide-right text-left border-r border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Sanjeevani AI" className="h-7 w-auto object-contain" />
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Navigation</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 flex-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const isActive = currentView === item.id || currentView.startsWith(item.id.split('/:')[0]);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-primary text-white shadow-premium' 
                            : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-teal-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Workspace Body */}
          <div className="flex-1 flex relative">
            <main className="flex-1 p-3.5 sm:p-5 max-w-7xl mx-auto w-full overflow-x-hidden pb-24">
              {children}
            </main>
          </div>

          {/* 📱 MNC Native App Fixed Bottom Navigation Tab Bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 safe-bottom-padding flex items-center justify-around shadow-2xl">
            {bottomNavItems.map((item) => {
              const isActive = currentView === item.id || (item.id === 'profile' && currentView.includes('profile')) || currentView.startsWith(item.id.split('/:')[0]);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${
                    isActive 
                      ? 'text-teal-600 dark:text-teal-400 font-extrabold bg-teal-50/80 dark:bg-teal-950/40' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      ) : (

        <>
          {/* Top Header */}
          <header className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(defaultRoute)}>
                <img
                  src="/logo.png"
                  alt="Sanjeevani AI"
                  className="h-10 w-auto object-contain"
                />
              </div>

              {/* Sync Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 ml-6 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Realtime Synced
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Active Profile Info */}
              {user && (
                <div 
                  onClick={() => onNavigate('profile')}
                  className="hidden md:flex items-center gap-3 border-r border-slate-200 pr-4 cursor-pointer hover:opacity-85 transition-all"
                  title="View Profile Settings"
                >
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800 block">{role === 'admin' ? user.adminName : user.name}</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mt-1">
                      {role === 'doctor' ? user.specialty : role === 'admin' ? user.hospitalName : `Patient ID: ${user.id}`}
                    </span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200 shadow-sm text-teal-800 font-bold text-sm overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Scan shortcut */}
              <button 
                onClick={() => onNavigate('emergency/scan')} 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <ShieldAlert className="h-4 w-4 text-rose-500 animate-bounce" />
                Emergency Access
              </button>

              {/* Premium Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center border border-transparent dark:border-slate-800/40"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                id="theme-toggle-btn"
              >
                {theme === 'light' ? (
                  <Moon className="h-5.5 w-5.5 text-slate-755 text-slate-700 transition-all duration-300" />
                ) : (
                  <Sun className="h-5.5 w-5.5 text-teal-400 transition-all duration-300" />
                )}
              </button>

              {/* Realtime Notification Bell */}
              {user && role === 'patient' && (
                <button 
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 text-slate-600 hover:text-primary hover:bg-teal-50 rounded-xl transition-all"
                >
                  <Bell className="h-5.5 w-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Main Workspace Body */}
          <div className="flex-1 flex relative">
            {/* Navigation Sidebar for Desktop */}
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

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="relative w-64 max-w-xs bg-white h-full p-6 flex flex-col gap-6 shadow-2xl animate-slide-right text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Navigation</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>

                  <nav className="space-y-1 flex-1">
                    {navItems.map((item) => {
                      const isActive = currentView === item.id || currentView.startsWith(item.id.split('/:')[0]);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            isActive 
                              ? 'bg-primary text-white shadow-premium' 
                              : 'text-slate-600 hover:text-primary hover:bg-teal-50'
                          }`}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}

            {/* Dynamic Page Container */}
            <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-hidden">
              {children}
            </main>
          </div>
        </>
      )}

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
