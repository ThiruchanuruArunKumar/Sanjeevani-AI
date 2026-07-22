import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [fadeClass, setFadeClass] = useState('opacity-0 scale-95');
  const [statusText, setStatusText] = useState('Initializing Healthcare Core…');

  useEffect(() => {
    // Entry transition
    const entryTimeout = setTimeout(() => {
      setFadeClass('opacity-100 scale-100');
    }, 100);

    const textTimeout = setTimeout(() => {
      setStatusText('Syncing Clinical Intelligence…');
    }, 1200);

    // Complete transition after 2.2 seconds
    const completeTimeout = setTimeout(() => {
      setFadeClass('opacity-0 scale-105');
      const exitTimeout = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(exitTimeout);
    }, 2200);

    return () => {
      clearTimeout(entryTimeout);
      clearTimeout(textTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-all duration-500 ease-out p-6 overflow-hidden">
      
      {/* Glow Backdrop */}
      <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className={`flex flex-col items-center space-y-6 transition-all duration-700 transform ${fadeClass} relative z-10`}>
        
        {/* Logo Container with Pulsing Rings */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 blur-xl opacity-20 animate-pulse" />
          
          <div className="relative h-28 w-28 rounded-3xl bg-teal-50/80 dark:bg-slate-900/90 border border-teal-200/80 dark:border-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl p-4">
            <img 
              src="/logo.png" 
              alt="Sanjeevani AI Logo" 
              className="h-full w-full object-contain filter drop-shadow-md"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-teal-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Sanjeevani <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-teal-600 dark:text-teal-400 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Activity className="h-3.5 w-3.5 animate-bounce text-teal-600 dark:text-teal-400" />
            Realtime Drug Safety & Intelligence
          </p>
        </div>
      </div>

      {/* Bottom loading bar */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-2 z-10">
        <div className="h-1.5 w-32 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-slate-200 dark:border-transparent">
          <div className="h-full w-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-pulse" />
        </div>
        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {statusText}
        </span>
      </div>

    </div>
  );
};

