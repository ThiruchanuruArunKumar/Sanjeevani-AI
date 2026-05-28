// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\components\Layout.tsx
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
  Moon
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
    { id: 'doctor/search', label: 'Search Patients', icon: <Search className="h-5 w-5" /> },
    { id: 'doctor/prescription', label: 'Prescribe & Safety Check', icon: <Pill className="h-5 w-5" /> },
    { id: 'doctor/upload-report', label: 'Upload Medical Report', icon: <Upload className="h-5 w-5" /> },
    { id: 'analytics/healthcare', label: 'Clinical Analytics', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const patientNavItems = [
    { id: 'patient/dashboard', label: 'My Dashboard', icon: <Activity className="h-5 w-5" /> },
    { id: 'patient/history', label: 'Clinical History', icon: <History className="h-5 w-5" /> },
    { id: 'patient/qr', label: 'Emergency QR ID', icon: <QrCode className="h-5 w-5" /> },
    { id: 'analytics/risk', label: 'Health Risk Index', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  const navItems = role === 'doctor' ? doctorNavItems : patientNavItems;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Header */}
      <header className="glass-nav sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(role === 'doctor' ? 'doctor/dashboard' : 'patient/dashboard')}>
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
                <span className="text-sm font-bold text-slate-800 block">{user.name}</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  {role === 'doctor' ? user.specialty : `Patient ID: ${user.id}`}
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
                      setIsMobileMenuOpen(false);
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
              <span className="text-[10px] text-slate-400 block leading-normal">Protecting patient safety and drug interaction risks in real-time.</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative w-64 max-w-xs bg-white h-full p-6 flex flex-col gap-6 shadow-2xl animate-slide-right">
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
