import React, { useState } from 'react';
import { DatabaseService } from '../../services/db';
import { AISafetyEngine } from '../../services/ai';
import { useTheme } from '../../context/ThemeContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar 
} from 'recharts';
import { Activity, ShieldAlert, Heart, TrendingUp, Filter, Calendar } from 'lucide-react';

// Pre-configured historical mock data for charting
const BP_HISTORY_DATA = [
  { day: 'May 20', systolic: 135, diastolic: 85, pulse: 72 },
  { day: 'May 21', systolic: 140, diastolic: 88, pulse: 74 },
  { day: 'May 22', systolic: 146, diastolic: 92, pulse: 78 },
  { day: 'May 23', systolic: 138, diastolic: 86, pulse: 75 },
  { day: 'May 24', systolic: 142, diastolic: 91, pulse: 78 },
  { day: 'May 25', systolic: 148, diastolic: 94, pulse: 82 },
  { day: 'May 26', systolic: 142, diastolic: 90, pulse: 78 }
];

const O2_HISTORY_DATA = [
  { day: 'May 20', oxygen: 98 },
  { day: 'May 21', oxygen: 97 },
  { day: 'May 22', oxygen: 96 },
  { day: 'May 23', oxygen: 98 },
  { day: 'May 24', oxygen: 96 },
  { day: 'May 25', oxygen: 95 },
  { day: 'May 26', oxygen: 96 }
];

const DRUG_CONFLICT_STATS = [
  { group: 'Penicillin class', cases: 14, alertLevel: 'Critical' },
  { group: 'NSAIDs + Anticoagulants', cases: 28, alertLevel: 'Critical' },
  { group: 'Beta blockers + Asthma', cases: 8, alertLevel: 'Critical' },
  { group: 'Renal + Metformin', cases: 19, alertLevel: 'Elevated' }
];

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#475569' : '#94a3b8';
  const tooltipBg = isDark ? '#0f172a' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? 'rgba(14, 138, 138, 0.3)' : 'rgba(14, 138, 138, 0.1)';
  const tooltipTextColor = isDark ? '#f8fafc' : '#0F172A';

  const [filterDayRange, setFilterDayRange] = useState('7');

  const feedbacks = DatabaseService.getFeedbacks();

  // Aggregate symptoms counts
  const symptomsCount: Record<string, number> = {
    'Headache': 0,
    'Dizziness': 0,
    'Vomiting': 0,
    'Skin Allergy': 0,
    'Chest Pain': 0,
    'Breathing Issue': 0,
    'Weakness': 0
  };

  feedbacks.forEach(f => {
    f.symptoms.forEach(s => {
      let key = s;
      if (s === 'allergy') key = 'Skin Allergy';
      else key = s.charAt(0).toUpperCase() + s.slice(1);
      
      if (symptomsCount[key] !== undefined) {
        symptomsCount[key]++;
      }
    });
  });

  const SYMPTOMS_DATA = Object.keys(symptomsCount).map(key => ({
    symptom: key,
    reports: symptomsCount[key]
  }));

  // Aggregate feelings counts
  const feelingsCount: Record<string, number> = {
    'Better': 0,
    'Same': 0,
    'Worse': 0,
    'Severe Side Effects': 0
  };

  feedbacks.forEach(f => {
    if (feelingsCount[f.feeling] !== undefined) {
      feelingsCount[f.feeling]++;
    }
  });

  const RECOVERY_DATA = Object.keys(feelingsCount).map(key => ({
    feeling: key,
    count: feelingsCount[key]
  }));

  // Dynamic risk profiles for analytics calculation
  const patients = DatabaseService.getPatients();
  const patientPredictions = patients.map(p => {
    const pFeedbacks = feedbacks.filter(f => f.patientId === p.id);
    return AISafetyEngine.predictHealthRisk(p, pFeedbacks, []);
  });

  // 1. Population Risk Distribution counts
  const riskCounts: Record<string, number> = {
    'Stable': 0,
    'Moderate': 0,
    'High': 0,
    'Critical': 0
  };

  patientPredictions.forEach(pred => {
    const key = pred.severity.charAt(0).toUpperCase() + pred.severity.slice(1);
    if (riskCounts[key] !== undefined) {
      riskCounts[key]++;
    }
  });

  const POPULATION_RISK_DATA = Object.keys(riskCounts).map(key => ({
    severity: key,
    patients: riskCounts[key]
  }));

  // 2. Emergency Cases Prediction timeline
  const predictedEmergencyCount = patientPredictions.filter(p => p.severity === 'critical' || p.severity === 'high').length;
  
  const PREDICTED_EMERGENCY_DATA = [
    { day: 'May 24', predicted: 0, actual: 1 },
    { day: 'May 25', predicted: 1, actual: 2 },
    { day: 'May 26', predicted: Math.max(1, predictedEmergencyCount), actual: 1 },
    { day: 'May 27', predicted: Math.max(2, predictedEmergencyCount + 1), actual: 2 },
    { day: 'May 28', predicted: Math.max(1, predictedEmergencyCount), actual: 1 }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Clinical Health Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Interactive telemetry timelines, blood pressure trends, and drug-conflict statistics.</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4.5 w-4.5 text-primary" />
          <select 
            value={filterDayRange}
            onChange={(e) => setFilterDayRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Grid: 2 Columns for vitals charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Blood Pressure Trend curve */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hypertension & Blood Pressure Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tracking systolic vs diastolic changes across clinical visits.</p>
            </div>
            <span className="badge-critical bg-rose-50 text-rose-700 text-[10px]">BP Alert Curve Active</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BP_HISTORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis domain={[70, 160]} stroke={axisColor} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#0E8A8A" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heart Telemetry area chart */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 animate-pulse" />
            Heart Telemetry (BPM)
          </h3>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BP_HISTORY_DATA}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis domain={[50, 100]} stroke={axisColor} fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Area type="monotone" dataKey="pulse" name="Pulse Rate" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPulse)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: 2 Columns for O2 & Drug statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Oxygen level line */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Oxygen Saturation Stability Curve (%)
          </h3>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={O2_HISTORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis domain={[90, 100]} stroke={axisColor} fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Line type="monotone" dataKey="oxygen" name="O₂ Sat" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drug Conflict Bar Chart */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Sanjeevani AI Prevented Interaction Cases
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Total Sync Data</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DRUG_CONFLICT_STATS}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="group" stroke={axisColor} fontSize={9} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Bar dataKey="cases" name="Cases Intercepted" fill="#0E8A8A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Dynamic AI Post-Prescription Drug Safety Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Symptoms telemetry chart */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Aggregated Patient Side-Effects & Symptoms Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time dynamic breakdown of reported symptoms after medication starts.</p>
            </div>
            <span className="badge-critical bg-rose-50 text-rose-700 text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border border-rose-200">AI Telemetry Active</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SYMPTOMS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="symptom" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Bar dataKey="reports" name="Reported Symptoms" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery logs distribution chart */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Patient Recovery Feelings Index
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Patient status counts.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RECOVERY_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" stroke={axisColor} fontSize={9} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="feeling" type="category" stroke={axisColor} fontSize={9} tickLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Bar dataKey="count" name="Patient Status Count" fill="#0E8A8A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Dynamic AI Predictive Telemetry & Risk Index Forecasts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Population Risk Distribution */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              AI Population Health Risk Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Risk Forecasts Active</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={POPULATION_RISK_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="severity" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Bar dataKey="patients" name="Patients Graded" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Cases Predictions */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500 animate-pulse" />
              48-Hour Predicted Emergency Cases Forecast
            </h3>
            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-extrabold">Preventative AI Mode</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PREDICTED_EMERGENCY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}` }}
                  labelStyle={{ fontWeight: 'bold', color: tooltipTextColor }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="predicted" name="AI Predicted Emergencies" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="actual" name="Actual Clinical Crises" stroke="#64748b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
