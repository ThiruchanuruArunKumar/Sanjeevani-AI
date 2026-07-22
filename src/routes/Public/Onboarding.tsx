import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, Stethoscope, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: 'AI-Powered Drug Safety',
    subtitle: 'Real-time Cross-Reactivity & Allergy Defense',
    description: 'Sanjeevani AI analyzes patient vitals, active prescriptions, and medical history to prevent adverse drug interactions instantly.',
    icon: ShieldCheck,
    color: 'from-teal-500 to-emerald-600',
    badge: 'Clinical Intelligence',
    stats: ['99.8% Accuracy', 'Zero Lag Alerts', 'FDA Compliant']
  },
  {
    id: 2,
    title: 'Emergency Trauma QR',
    subtitle: 'Life-Saving Health Passport',
    description: 'First responders can instantly scan emergency QR codes to view critical blood group, emergency contacts, and active conditions in seconds.',
    icon: HeartPulse,
    color: 'from-rose-500 to-pink-600',
    badge: 'Instant Trauma Access',
    stats: ['1-Tap Bypass', 'Encrypted Record', '24/7 Availability']
  },
  {
    id: 3,
    title: 'Unified Hospital Ecosystem',
    subtitle: 'Seamless Patient, Doctor & Admin Portals',
    description: 'Experience real-time synchronization between patient appointments, digital prescriptions, lab reports, and administrative management.',
    icon: Stethoscope,
    color: 'from-indigo-500 to-cyan-600',
    badge: 'Complete Care Network',
    stats: ['Multi-Role Sync', 'Live Vitals Monitoring', 'Digital Prescriptions']
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-6 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />


      {/* Top Header */}
      <div className="flex justify-between items-center z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-xl bg-teal-50 dark:bg-white/10 backdrop-blur-md flex items-center justify-center p-1.5 border border-teal-200 dark:border-white/15">
            <img src="/logo.png" alt="Sanjeevani AI" className="h-full w-full object-contain" />
          </div>
          <span className="text-sm font-black tracking-tight uppercase text-slate-900 dark:text-white">
            Sanjeevani <span className="text-teal-600 dark:text-teal-400">AI</span>
          </span>
        </div>
        
        <button
          onClick={onComplete}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-all active:scale-95 shadow-xs"
        >
          Skip Intro
        </button>
      </div>

      {/* Main Slide Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 z-10">
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6 animate-fade-in">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400 text-[11px] font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
            {slide.badge}
          </div>

          {/* Animated Icon Badge */}
          <div className="relative group">
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${slide.color} blur-xl opacity-30 group-hover:opacity-60 transition-opacity`} />
            <div className={`relative h-28 w-28 rounded-3xl bg-gradient-to-br ${slide.color} p-0.5 shadow-xl flex items-center justify-center`}>
              <div className="h-full w-full bg-white dark:bg-slate-900/90 rounded-[22px] flex items-center justify-center">
                <IconComponent className="h-12 w-12 text-teal-600 dark:text-teal-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Titles & Descriptions */}
          <div className="space-y-2 px-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {slide.title}
            </h2>
            <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
              {slide.subtitle}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-2 font-medium">
              {slide.description}
            </p>
          </div>

          {/* Key Feature Stats Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {slide.stats.map((stat, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg shadow-xs"
              >
                <CheckCircle className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                {stat}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Footer Controls & Slide Navigation */}
      <div className="z-10 space-y-6 pb-2">
        {/* Slide Indicators */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-teal-600 dark:bg-teal-400' : 'w-2 bg-slate-200 dark:bg-white/20'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-sm tracking-wide shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          {currentSlide === slides.length - 1 ? (
            <>
              Get Started with Sanjeevani AI
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>


    </div>
  );
};
