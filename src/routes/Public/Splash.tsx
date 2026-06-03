import React, { useEffect, useState } from 'react';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [fadeClass, setFadeClass] = useState('opacity-0 scale-95');

  useEffect(() => {
    // Smooth entry transition
    const entryTimeout = setTimeout(() => {
      setFadeClass('opacity-100 scale-100');
    }, 100);

    // Trigger complete navigation after 2.5 seconds
    const completeTimeout = setTimeout(() => {
      setFadeClass('opacity-0 scale-105');
      const exitTimeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(exitTimeout);
    }, 2500);

    return () => {
      clearTimeout(entryTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-all duration-500 ease-out">
      <div className={`flex flex-col items-center space-y-6 transition-all duration-700 transform ${fadeClass}`}>
        {/* Logo Container */}
        <div className="h-28 w-28 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl p-4 border border-white/10">
          <img 
            src="/logo.png" 
            alt="Sanjeevani AI Logo" 
            className="h-full w-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Text Details */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Sanjeevani <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-teal-400/80 text-xs font-bold uppercase tracking-widest mt-2">
            Realtime Drug Safety & Intelligence
          </p>
        </div>
      </div>

      {/* Bottom loading hint */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-2">
        <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-teal-400 rounded-full animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Securing Prescriptions</span>
      </div>
    </div>
  );
};
