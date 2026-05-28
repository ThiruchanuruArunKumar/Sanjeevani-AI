// src/components/EmergencyAlertPopup.tsx
import React, { useEffect, useState } from 'react';
import { ShieldAlert, X, ExternalLink, Phone } from 'lucide-react';
import { HealthAlert } from '../services/db';

interface EmergencyAlertPopupProps {
  alert: HealthAlert;
  onNavigate: (view: string) => void;
  onDismiss: () => void;
}

export const EmergencyAlertPopup: React.FC<EmergencyAlertPopupProps> = ({
  alert,
  onNavigate,
  onDismiss,
}) => {
  const [countdown, setCountdown] = useState(30);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDismiss]);

  const handleOpenSummary = () => {
    onDismiss();
    onNavigate(alert.redirectUrl ?? 'patient/qr');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Pulsing red overlay */}
      <div className="absolute inset-0 bg-rose-900/80 backdrop-blur-sm animate-pulse" style={{ animationDuration: '1.5s' }} />

      {/* Popup Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Top danger stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-500 animate-pulse" />

        {/* Header */}
        <div className="px-8 pt-8 pb-5 bg-gradient-to-b from-rose-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center">
                  <ShieldAlert className="h-7 w-7 text-rose-600" />
                </div>
                {/* Ping rings */}
                <span className="absolute inset-0 rounded-full bg-rose-400 opacity-30 animate-ping" />
              </div>
              <div>
                <h2 className="text-xl font-black text-rose-800 leading-tight">Emergency Alert</h2>
                <p className="text-xs text-rose-500 font-semibold mt-0.5">From Your Medical Team</p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 rounded-xl text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 space-y-5">
          <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl">
            <h3 className="text-sm font-black text-rose-800 mb-2">{alert.title}</h3>
            <p className="text-sm text-rose-700 leading-relaxed font-medium">{alert.message}</p>
          </div>

          {/* Emergency contact note */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Phone className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-semibold leading-relaxed">
              Please contact your doctor or emergency services immediately if you are experiencing acute symptoms.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleOpenSummary}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-sm transition-all active:scale-95 shadow-lg shadow-rose-200"
            >
              <ExternalLink className="h-4 w-4" />
              Open Emergency Health Summary
            </button>
            <button
              onClick={onDismiss}
              className="w-full px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50 transition-all"
            >
              Dismiss ({countdown}s)
            </button>
          </div>

          {/* Countdown bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-500" />
      </div>
    </div>
  );
};
