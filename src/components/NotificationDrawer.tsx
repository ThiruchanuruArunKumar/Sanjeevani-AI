// src/components/NotificationDrawer.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { DatabaseService, HealthAlert, realtimeBroker } from '../services/db';
import {
  X,
  FileText,
  Pill,
  Stethoscope,
  ShieldAlert,
  Check,
  AlertTriangle,
  ChevronRight,
  Bell,
  Zap,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onNavigate: (view: string) => void;
}

// ── Relative time formatter ──────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

// ── Type → icon + colours ────────────────────────────────────────────────────
type AlertTypeConfig = {
  icon: React.ReactNode;
  iconBg: string;
  unreadBg: string;
  unreadBorder: string;
  readBg: string;
  badge: string;
  badgeBg: string;
  cta: string;
};

function getTypeConfig(type: HealthAlert['type'], read: boolean): AlertTypeConfig {
  const configs: Record<HealthAlert['type'], AlertTypeConfig> = {
    report: {
      icon: <FileText className="h-5 w-5 text-indigo-600" />,
      iconBg: read ? 'bg-indigo-50' : 'bg-indigo-100',
      unreadBg: 'bg-indigo-50/40',
      unreadBorder: 'border-indigo-200/60',
      readBg: 'bg-slate-50/60',
      badge: 'Lab Report',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      cta: 'View Full Report',
    },
    visit: {
      icon: <Stethoscope className="h-5 w-5 text-emerald-600" />,
      iconBg: read ? 'bg-emerald-50' : 'bg-emerald-100',
      unreadBg: 'bg-emerald-50/40',
      unreadBorder: 'border-emerald-200/60',
      readBg: 'bg-slate-50/60',
      badge: 'Clinical Visit',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cta: 'Open Visit Summary',
    },
    prescription: {
      icon: <Pill className="h-5 w-5 text-teal-600" />,
      iconBg: read ? 'bg-teal-50' : 'bg-teal-100',
      unreadBg: 'bg-teal-50/40',
      unreadBorder: 'border-teal-200/60',
      readBg: 'bg-slate-50/60',
      badge: 'Prescription',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      cta: 'View Prescription',
    },
    emergency: {
      icon: <ShieldAlert className="h-5 w-5 text-rose-600" />,
      iconBg: read ? 'bg-rose-50' : 'bg-rose-100',
      unreadBg: 'bg-rose-50/50',
      unreadBorder: 'border-rose-300',
      readBg: 'bg-slate-50/60',
      badge: 'Emergency',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      cta: 'Open Emergency Summary',
    },
    vitals: {
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      iconBg: read ? 'bg-amber-50' : 'bg-amber-100',
      unreadBg: 'bg-amber-50/40',
      unreadBorder: 'border-amber-200/60',
      readBg: 'bg-slate-50/60',
      badge: 'Vitals Update',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      cta: 'View Dashboard',
    },
    ai_alert: {
      icon: <AlertTriangle className="h-5 w-5 text-purple-600" />,
      iconBg: read ? 'bg-purple-50' : 'bg-purple-100',
      unreadBg: 'bg-purple-50/40',
      unreadBorder: 'border-purple-200/60',
      readBg: 'bg-slate-50/60',
      badge: 'AI Alert',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      cta: 'View AI Analysis',
    },
  };
  return configs[type] ?? configs['ai_alert'];
}

// ── Fallback redirect resolver ───────────────────────────────────────────────
function resolveRedirect(alert: HealthAlert): string {
  if (alert.redirectUrl) return alert.redirectUrl;
  switch (alert.type) {
    case 'report':       return 'patient/history';
    case 'visit':        return 'patient/history';
    case 'prescription': return 'patient/history';
    case 'emergency':    return 'patient/qr';
    case 'vitals':       return 'patient/dashboard';
    default:             return 'patient/dashboard';
  }
}

// ── Main Component ───────────────────────────────────────────────────────────
export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  patientId,
  onNavigate,
}) => {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);

  const loadAlerts = useCallback(() => {
    setAlerts(DatabaseService.getAlerts(patientId));
  }, [patientId]);

  useEffect(() => {
    loadAlerts();
    const unsubscribe = realtimeBroker.subscribe(`alerts-${patientId}`, loadAlerts);
    return () => unsubscribe();
  }, [patientId, loadAlerts]);

  const handleMarkAllRead = () => {
    DatabaseService.markAlertsAsRead(patientId);
  };

  const handleAlertClick = (alert: HealthAlert) => {
    // Mark this specific alert as read
    DatabaseService.markAlertAsRead(alert.id);
    // Close the drawer
    onClose();
    // Navigate to the linked page
    const destination = resolveRedirect(alert);
    onNavigate(destination);
  };

  if (!isOpen) return null;

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="notification-drawer-title">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out">
            <div className="flex h-full flex-col bg-white/97 backdrop-blur-md shadow-2xl border-l border-teal-500/10">

              {/* ── Header ── */}
              <div className="px-6 py-5 bg-gradient-to-r from-teal-50/60 to-emerald-50/20 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 id="notification-drawer-title" className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Health Notifications
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unreadCount > 0
                      ? `${unreadCount} unread — click any card to open`
                      : 'All caught up · Health record fully synchronized'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ── Mark All Read ── */}
              {unreadCount > 0 && (
                <div className="px-6 py-2.5 bg-teal-50/40 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-teal-800 font-semibold">
                    {unreadCount} new medical update{unreadCount > 1 ? 's' : ''} received
                  </span>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-primary hover:text-primary/80 hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                </div>
              )}

              {/* ── Alert List ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                      <Check className="h-7 w-7 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">All caught up!</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                      No alerts yet. When your doctor uploads reports, adds a visit, or updates your prescription, live notifications appear here instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => {
                      const cfg = getTypeConfig(alert.type, alert.read);
                      return (
                        <button
                          key={alert.id}
                          onClick={() => handleAlertClick(alert)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                            alert.read
                              ? `${cfg.readBg} border-slate-100/80 hover:border-slate-200 hover:shadow-sm`
                              : `${cfg.unreadBg} ${cfg.unreadBorder} shadow-sm hover:shadow-md hover:-translate-y-0.5`
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <div className="flex gap-3 items-start">
                            {/* Icon */}
                            <div className={`p-2.5 rounded-xl shrink-0 transition-all ${cfg.iconBg} group-hover:scale-110`}>
                              {cfg.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className={`text-sm font-bold leading-snug ${alert.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                  {alert.title}
                                </h4>
                                {/* Unread dot */}
                                {!alert.read && (
                                  <span className="relative flex shrink-0 mt-1">
                                    <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping absolute" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-primary relative" />
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
                                {alert.message}
                              </p>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cfg.badgeBg}`}>
                                    {cfg.badge}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {relativeTime(alert.date)}
                                  </span>
                                </div>

                                {/* CTA Arrow */}
                                <span className={`flex items-center gap-1 text-[10px] font-bold transition-all ${
                                  alert.read ? 'text-slate-400' : 'text-primary'
                                } group-hover:gap-2`}>
                                  {!alert.read && <span className="hidden group-hover:inline">{cfg.cta}</span>}
                                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Real-Time Connection</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Broker Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Notifications update instantly when your doctor uploads reports or visits without any page refresh.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
