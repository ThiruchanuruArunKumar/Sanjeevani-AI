import React from 'react';
import { DatabaseService } from '../../services/db';
import { Clock, Lock, ShieldAlert } from 'lucide-react';

interface DoctorRouteWrapperProps {
  children: React.ReactNode;
  onNavigate: (view: string) => void;
}

export const DoctorRouteWrapper: React.FC<DoctorRouteWrapperProps> = ({ children, onNavigate }) => {
  const { user } = DatabaseService.getActiveSession();

  if (user?.approvalStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 animate-fade-in">
        <div className="h-24 w-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-2 shadow-sm border border-amber-100">
          <Clock className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Registration Pending</h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed font-semibold">
          Your profile is currently under review by the hospital administrator. You will gain access to clinical features and patient data once approved.
        </p>
        <button onClick={() => onNavigate('welcome')} className="btn-medical-secondary mt-4 font-bold text-xs py-2.5 px-6">
          <Lock className="h-4 w-4 mr-2" /> Return Home
        </button>
      </div>
    );
  }

  if (user?.approvalStatus === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 animate-fade-in">
        <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2 shadow-sm border border-rose-100">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Registration Rejected</h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed font-semibold">
          Your hospital registration was not approved. Please contact the administration for details.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
