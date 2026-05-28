// AI Safety Engine - Drug Safety & Clinical Risk Analytics
// Under c:\Arun\SIMATS\PDD Sanjeevani Ai\src\services\ai.ts

export interface Drug {
  name: string;
  dosage: string;
  frequency: string;
  morning?: boolean;
  afternoon?: boolean;
  night?: boolean;
  foodInstruction?: 'Before Food' | 'After Food' | 'With Food' | 'No instruction';
  exactTime?: string;
  specialInstruction?: string;
  durationDays?: number;
}

export interface PatientAllergy {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
}

export interface PatientVitals {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number; // in Fahrenheit
  oxygenSat: number;  // Percentage
  bloodGlucose?: number; // mg/dL
  weight?: number;    // kg
  pulseRate?: number; // BPM
}

export interface SafetyAlert {
  id: string;
  type: 'interaction' | 'allergy' | 'condition' | 'dosage';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  suggestedAlternative?: string;
}

// Pre-defined medical database of drug-drug interactions
const DRUG_INTERACTIONS: Record<string, { interactsWith: string; severity: 'warning' | 'critical'; reaction: string; alternative: string }[]> = {
  'warfarin': [
    { interactsWith: 'aspirin', severity: 'critical', reaction: 'Highly increased risk of gastrointestinal bleeding and hemorrhage.', alternative: 'Apixaban (requires dose review) or Acetaminophen for mild pain' },
    { interactsWith: 'ibuprofen', severity: 'critical', reaction: 'Increased bleeding risk due to NSAID antiplatelet effects.', alternative: 'Acetaminophen (Tylenol)' },
    { interactsWith: 'amoxicillin', severity: 'warning', reaction: 'May increase the anticoagulant effect of Warfarin (increases INR ratio).', alternative: 'Alternative antibiotic under close INR monitoring' }
  ],
  'aspirin': [
    { interactsWith: 'warfarin', severity: 'critical', reaction: 'Highly increased risk of bleeding and hemorrhagic complications.', alternative: 'Acetaminophen' },
    { interactsWith: 'ibuprofen', severity: 'warning', reaction: 'Ibuprofen may decrease the cardioprotective effect of low-dose Aspirin.', alternative: 'Spaced dosing (Ibuprofen 8 hours after Aspirin)' }
  ],
  'lisinopril': [
    { interactsWith: 'spironolactone', severity: 'critical', reaction: 'Severe risk of Hyperkalemia (critically high blood potassium levels) causing cardiac arrhythmias.', alternative: 'Calcium Channel Blocker (Amlodipine) or alternative diuretic' },
    { interactsWith: 'ibuprofen', severity: 'warning', reaction: 'NSAIDs may decrease the antihypertensive effect of Lisinopril and increase acute kidney injury risk.', alternative: 'Acetaminophen for pain management' }
  ],
  'metformin': [
    { interactsWith: 'contrast dye', severity: 'critical', reaction: 'Risk of lactic acidosis. Metformin must be held for 48 hours following contrast administration.', alternative: 'Temporary insulin coverage if required' }
  ],
  'sildenafil': [
    { interactsWith: 'nitroglycerin', severity: 'critical', reaction: 'Severe, life-threatening hypotension (dangerously low blood pressure drop) which can lead to cardiovascular collapse.', alternative: 'Consult cardiologist for non-nitrate angina therapies' }
  ],
  'amiodarone': [
    { interactsWith: 'digoxin', severity: 'critical', reaction: 'Doubles digoxin concentration, increasing risk of severe cardiotoxicity and bradycardia.', alternative: 'Reduce digoxin dose by 50% or monitor serum levels closely' }
  ]
};

// Drug-allergen groups (e.g. Amoxicillin belongs to Penicillin group)
const DRUG_ALLERGEN_GROUPS: Record<string, string[]> = {
  'penicillin': ['amoxicillin', 'ampicillin', 'penicillin v', 'penicillin g', 'piperacillin', 'clavulanate'],
  'sulfa': ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'],
  'nsaid': ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac', 'celecoxib'],
  'aspirin': ['aspirin', 'excedrin']
};

export class AISafetyEngine {
  /**
   * Check for drug-drug interactions among proposed medications and existing medications
   */
  static checkInteractions(proposedDrugs: Drug[], activeDrugs: Drug[] = []): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];
    const allDrugs = [...proposedDrugs, ...activeDrugs].map(d => d.name.toLowerCase().trim());
    
    // Track pairs checked to avoid duplicate alerts
    const checkedPairs = new Set<string>();

    for (let i = 0; i < allDrugs.length; i++) {
      const drugA = allDrugs[i];
      const interactions = DRUG_INTERACTIONS[drugA];
      if (!interactions) continue;

      for (let j = 0; j < allDrugs.length; j++) {
        if (i === j) continue;
        const drugB = allDrugs[j];
        
        const pairKey = [drugA, drugB].sort().join('-');
        if (checkedPairs.has(pairKey)) continue;

        const match = interactions.find(item => item.interactsWith === drugB);
        if (match) {
          alerts.push({
            id: `interaction-${drugA}-${drugB}`,
            type: 'interaction',
            severity: match.severity,
            title: `Drug Interaction Detected: ${this.capitalize(drugA)} + ${this.capitalize(drugB)}`,
            message: match.reaction,
            suggestedAlternative: match.alternative
          });
          checkedPairs.add(pairKey);
        }
      }
    }

    return alerts;
  }

  /**
   * Cross-match proposed drugs against a patient's documented allergies
   */
  static checkAllergies(proposedDrugs: Drug[], patientAllergies: PatientAllergy[]): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];

    for (const drug of proposedDrugs) {
      const dName = drug.name.toLowerCase().trim();
      
      for (const allergy of patientAllergies) {
        const allergen = allergy.allergen.toLowerCase().trim();
        
        // Exact match or matches group
        let isMatch = dName === allergen;

        if (!isMatch && DRUG_ALLERGEN_GROUPS[allergen]) {
          isMatch = DRUG_ALLERGEN_GROUPS[allergen].some(item => dName.includes(item) || item.includes(dName));
        }

        if (isMatch) {
          const isSevere = allergy.severity === 'Severe';
          alerts.push({
            id: `allergy-${dName}`,
            type: 'allergy',
            severity: isSevere ? 'critical' : 'warning',
            title: `Allergy Flag: ${this.capitalize(drug.name)}`,
            message: `Patient has a documented ${allergy.severity.toUpperCase()} allergy to ${this.capitalize(allergy.allergen)}. Reaction: ${allergy.reaction}.`,
            suggestedAlternative: `Use a drug from a non-related chemical class. Verify with clinical protocols.`
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Check for conditions or vitals that make a drug high-risk (Contraindications)
   */
  static checkConditionContraindications(proposedDrugs: Drug[], chronicConditions: string[], vitals?: PatientVitals): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];
    const conditions = chronicConditions.map(c => c.toLowerCase());

    for (const drug of proposedDrugs) {
      const dName = drug.name.toLowerCase().trim();

      // Chronic kidney disease and metformin
      if (dName.includes('metformin') && (conditions.includes('chronic kidney disease') || conditions.includes('ckd') || conditions.includes('kidney failure'))) {
        alerts.push({
          id: `contra-metformin-kidney`,
          type: 'condition',
          severity: 'critical',
          title: `Contraindication: Metformin in Renal Impairment`,
          message: `Metformin is contraindicated or requires major dose reduction in patients with moderate-to-severe Chronic Kidney Disease due to elevated risk of lactic acidosis.`,
          suggestedAlternative: `Consider SGLT2 inhibitors or Insulin therapy under close nephrology review.`
        });
      }

      // Asthma and beta-blockers (e.g. Propranolol, Metoprolol)
      if ((dName.includes('propranolol') || dName.includes('metoprolol') || dName.includes('atenolol')) && conditions.includes('asthma')) {
        alerts.push({
          id: `contra-betablocker-asthma`,
          type: 'condition',
          severity: 'critical',
          title: `Contraindication: Beta-Blockers in Asthma`,
          message: `Beta-blockers can cause severe bronchoconstriction and trigger life-threatening asthma attacks.`,
          suggestedAlternative: `Consider Calcium Channel Blockers (Amlodipine) or ARBs (Losartan).`
        });
      }

      // High BP vitals & NSAIDs (Ibuprofen raises BP)
      if (dName.includes('ibuprofen') && vitals && vitals.systolicBP > 150) {
        alerts.push({
          id: `contra-nsaid-bp`,
          type: 'condition',
          severity: 'warning',
          title: `Dosage Alert: NSAID in High Hypertension`,
          message: `Patient's systolic blood pressure is critically high (${vitals.systolicBP} mmHg). Ibuprofen causes renal sodium retention and can further elevate blood pressure.`,
          suggestedAlternative: `Consider Acetaminophen for analgesia.`
        });
      }
    }

    return alerts;
  }

  /**
   * Run a comprehensive AI check returning all alerts
   */
  static runCompleteSafetyAudit(
    proposedDrugs: Drug[],
    patientAllergies: PatientAllergy[],
    chronicConditions: string[],
    activeDrugs: Drug[] = [],
    vitals?: PatientVitals
  ): { alerts: SafetyAlert[]; riskLevel: 'stable' | 'elevated' | 'critical'; riskScore: number } {
    
    const ddiAlerts = this.checkInteractions(proposedDrugs, activeDrugs);
    const allergyAlerts = this.checkAllergies(proposedDrugs, patientAllergies);
    const condAlerts = this.checkConditionContraindications(proposedDrugs, chronicConditions, vitals);
    
    const alerts = [...ddiAlerts, ...allergyAlerts, ...condAlerts];

    // Compute Risk Score (0 - 100)
    let riskScore = 10; // baseline

    if (vitals) {
      // Vital sign deviancies raise risk
      if (vitals.systolicBP > 160 || vitals.systolicBP < 85) riskScore += 25;
      else if (vitals.systolicBP > 140 || vitals.systolicBP < 95) riskScore += 10;

      if (vitals.oxygenSat < 90) riskScore += 35;
      else if (vitals.oxygenSat < 94) riskScore += 15;

      if (vitals.heartRate > 115 || vitals.heartRate < 45) riskScore += 20;
    }

    // Alerts raise risk
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const warningAlerts = alerts.filter(a => a.severity === 'warning');

    riskScore += criticalAlerts.length * 30;
    riskScore += warningAlerts.length * 15;

    // Cap at 100
    riskScore = Math.min(100, riskScore);

    let riskLevel: 'stable' | 'elevated' | 'critical' = 'stable';
    if (riskScore >= 60 || criticalAlerts.length > 0) {
      riskLevel = 'critical';
    } else if (riskScore >= 30 || warningAlerts.length > 0) {
      riskLevel = 'elevated';
    }

    return {
      alerts,
      riskLevel,
      riskScore
    };
  }

  /**
   * Analyze patient post-prescription feedback
   */
  static analyzeFeedback(
    drugName: string,
    feeling: 'Better' | 'Same' | 'Worse' | 'Severe Side Effects',
    symptoms: string[]
  ): { aiSeverity: 'stable' | 'elevated' | 'critical'; aiAnalysis: string } {
    const dName = drugName.toLowerCase().trim();
    const flags: string[] = [];
    let severity: 'stable' | 'elevated' | 'critical' = 'stable';

    // Core Medical Rule: Severe side effects or breathing/chest pain symptoms are always critical
    if (feeling === 'Severe Side Effects' || symptoms.includes('chest pain') || symptoms.includes('breathing issue')) {
      severity = 'critical';
      if (symptoms.includes('chest pain')) flags.push('CRITICAL: Chest pain reported, requires immediate emergency evaluation.');
      if (symptoms.includes('breathing issue')) flags.push('CRITICAL: Dyspnea (breathing issue) reported. Possible bronchospasm or pulmonary complication.');
    } else if (feeling === 'Worse' || symptoms.length >= 2) {
      severity = 'elevated';
    }

    // Specific Drug Mappings
    if (dName.includes('metformin')) {
      if (symptoms.includes('vomiting') || symptoms.includes('weakness')) {
        flags.push('Gastrointestinal intolerance or potential early signs of lactic acidosis. Monitor renal function.');
        if (severity !== 'critical') severity = 'elevated';
      }
      if (symptoms.includes('dizziness')) {
        flags.push('Possible hypoglycemia or volume depletion. Check blood glucose.');
      }
    } else if (dName.includes('warfarin') || dName.includes('aspirin')) {
      if (symptoms.includes('weakness') || symptoms.includes('dizziness')) {
        flags.push('WARNING: Dizziness or weakness post-anticoagulant may indicate occult internal bleeding.');
        if (severity !== 'critical') severity = 'elevated';
      }
      if (symptoms.includes('allergy')) {
        flags.push('Suspected drug allergy. Monitor for cutaneous reactions or hives.');
      }
    } else if (dName.includes('lisinopril') || dName.includes('metoprolol') || dName.includes('propranolol')) {
      if (symptoms.includes('dizziness') || symptoms.includes('weakness')) {
        flags.push('Postural hypotension or bradycardia risk. Verify pulse rate and blood pressure.');
        if (severity !== 'critical') severity = 'elevated';
      }
    } else if (dName.includes('albuterol')) {
      if (symptoms.includes('weakness') || symptoms.includes('allergy')) {
        flags.push('Possible adrenergic overstimulation or paradoxical bronchospasm.');
      }
    }

    // General symptom checks
    if (symptoms.includes('vomiting') && symptoms.includes('dizziness')) {
      flags.push('Combined dizziness and emesis (vomiting) indicates systemic intolerability or CNS side effects.');
      if (severity !== 'critical') severity = 'elevated';
    }

    // Formulate a beautiful summary
    let analysisMsg = '';
    if (severity === 'critical') {
      analysisMsg = `⚠️ CRITICAL DRUG SAFETY ALERT: Patient reported dangerous symptoms following taking ${this.capitalize(drugName)}. ${flags.join(' ')} Action: Advise patient to withhold drug and contact emergency care immediately.`;
    } else if (severity === 'elevated') {
      analysisMsg = `⚡ ELEVATED RISK: Adverse reactions or worsening state detected for ${this.capitalize(drugName)}. ${flags.length > 0 ? flags.join(' ') : 'Patient is not improving as expected. Clinical follow-up recommended.'}`;
    } else {
      analysisMsg = `✅ STABLE: Patient reports ${feeling.toLowerCase()} status after taking ${this.capitalize(drugName)}. No severe side effects or clinical flags detected. Continue standard schedule.`;
    }

    return {
      aiSeverity: severity,
      aiAnalysis: analysisMsg
    };
  }

  /**
   * AI Predictive Health Risk Intelligence Engine
   */
  static predictHealthRisk(
    patient: any,
    feedbacks: any[],
    visits: any[] = []
  ): { score: number; severity: 'stable' | 'moderate' | 'high' | 'critical'; predictedRisk: string; notes: string } {
    let score = 15; // Baseline healthy score
    const flags: string[] = [];
    const v = patient.vitals;
    
    // 1. Vitals Penalties
    if (v) {
      if (v.systolicBP > 160) {
        score += 25;
        flags.push(`Systolic BP is critically high (${v.systolicBP} mmHg).`);
      } else if (v.systolicBP > 140) {
        score += 12;
        flags.push(`Systolic BP is elevated (${v.systolicBP} mmHg).`);
      } else if (v.systolicBP < 90) {
        score += 15;
        flags.push(`Systolic BP is critically low (${v.systolicBP} mmHg).`);
      }

      if (v.oxygenSat < 90) {
        score += 35;
        flags.push(`Oxygen Saturation is dangerously low (${v.oxygenSat}%).`);
      } else if (v.oxygenSat < 95) {
        score += 15;
        flags.push(`Oxygen Saturation is mildly depressed (${v.oxygenSat}%).`);
      }

      if (v.heartRate > 100 || v.heartRate < 50) {
        score += 15;
        flags.push(`Heart Rate is abnormal (${v.heartRate} BPM).`);
      }

      if (v.bloodGlucose && v.bloodGlucose > 180) {
        score += 12;
        flags.push(`Blood Glucose is hyperglycemic (${v.bloodGlucose} mg/dL).`);
      } else if (v.bloodGlucose && v.bloodGlucose < 70) {
        score += 15;
        flags.push(`Blood Glucose indicates hypoglycemia (${v.bloodGlucose} mg/dL).`);
      }
    }

    // 2. Feedback History (Symptom frequency & repeated complaints)
    const dizzinessFeedbacks = feedbacks.filter(f => f.symptoms.includes('dizziness'));
    const chestPainFeedbacks = feedbacks.filter(f => f.symptoms.includes('chest pain'));
    const breathingFeedbacks = feedbacks.filter(f => f.symptoms.includes('breathing issue'));
    const worseFeedbacks = feedbacks.filter(f => f.feeling === 'Worse' || f.feeling === 'Severe Side Effects');

    if (chestPainFeedbacks.length > 0) {
      score += 35;
      flags.push('CRITICAL: Chest pain reported in patient feedback logs.');
    }
    if (breathingFeedbacks.length > 0) {
      score += 30;
      flags.push('CRITICAL: Respiratory distress / breathing issues reported in feedbacks.');
    }
    if (dizzinessFeedbacks.length >= 2) {
      score += 25;
      flags.push(`Persistent side effect: patient reported dizziness in ${dizzinessFeedbacks.length} separate feedback logs.`);
    } else if (dizzinessFeedbacks.length === 1) {
      score += 10;
      flags.push('Patient reported post-medication dizziness.');
    }

    if (worseFeedbacks.length >= 2) {
      score += 20;
      flags.push('Worsening clinical trajectory: multiple consecutive negative logs filed.');
    } else if (worseFeedbacks.length === 1) {
      score += 10;
    }

    // 3. Chronic & Active Drug Contraindications
    const conditions = patient.chronicConditions.map((c: string) => c.toLowerCase());
    const drugs = patient.activeMedications.map((d: any) => d.name.toLowerCase());

    if (drugs.some((d: string) => d.includes('metformin')) && (conditions.includes('chronic kidney disease') || conditions.includes('ckd'))) {
      score += 15;
      flags.push('High-risk combination: Metformin therapy in active Chronic Kidney Disease.');
    }
    if (drugs.some((d: string) => d.includes('metoprolol') || d.includes('propranolol')) && conditions.includes('asthma')) {
      score += 20;
      flags.push('High-risk combination: Beta-blocker administration in active asthma patients.');
    }

    // Cap score
    score = Math.min(100, score);

    // 4. Severity Mapping
    let severity: 'stable' | 'moderate' | 'high' | 'critical' = 'stable';
    if (score >= 85) severity = 'critical';
    else if (score >= 60) severity = 'high';
    else if (score >= 35) severity = 'moderate';

    // 5. Predicted Emergency Risks
    let predictedRisk = 'Stable Clinical Outlook';
    if (severity === 'critical') {
      if (breathingFeedbacks.length > 0 || (v && v.oxygenSat < 92)) {
        predictedRisk = 'Critical Respiratory Instability Predicted';
      } else if (chestPainFeedbacks.length > 0 || (v && v.systolicBP > 160)) {
        predictedRisk = 'Severe Cardiac / Hypertensive Crisis Predicted';
      } else {
        predictedRisk = 'Severe Medication Toxic Reaction Predicted';
      }
    } else if (severity === 'high') {
      if (dizzinessFeedbacks.length >= 2 || (v && v.systolicBP < 95)) {
        predictedRisk = 'Potential Severe Hypotension & Syncope Predicted';
      } else if (worseFeedbacks.length >= 1) {
        predictedRisk = 'Drug Safety Complication / Severe Medication Intolerance';
      } else {
        predictedRisk = 'Elevated Chronic Complication Risk';
      }
    } else if (severity === 'moderate') {
      if (v && v.bloodGlucose && v.bloodGlucose > 170) {
        predictedRisk = 'Moderate Metabolic / Diabetes Risk';
      } else {
        predictedRisk = 'Moderate Drug Safety Reaction Risk';
      }
    }

    // 6. Formulate Diagnostic Notes
    let notes = '';
    if (flags.length > 0) {
      notes = `Predictive AI model flagged following risk factors: ${flags.join(' ')}`;
    } else {
      notes = 'Clinical telemetry and patient feedback logs are fully optimal. Patient is recovering stably under current prescription.';
    }

    return {
      score,
      severity,
      predictedRisk,
      notes
    };
  }

  /**
   * AI-Powered Clinical Guidance for active medications
   */
  static getMedicationGuidance(drugName: string): string[] {
    const dName = drugName.toLowerCase().trim();
    const tips: string[] = [];

    if (dName.includes('metformin')) {
      tips.push('Take after food to reduce gastrointestinal side effects.');
      tips.push('Ensure consistent daily water intake (2.5L+) to support renal function.');
      tips.push('Avoid heavy alcohol use to mitigate lactic acidosis risks.');
    } else if (dName.includes('warfarin')) {
      tips.push('Take at the exact same time every evening.');
      tips.push('Maintain consistent intake of leafy greens (Vitamin K) and avoid starting NSAIDs.');
      tips.push('Report any dark urine, easy bruising, or bleeding immediately.');
    } else if (dName.includes('aspirin')) {
      tips.push('Take after food to protect stomach lining.');
      tips.push('Avoid concurrent ibuprofen usage nearby without spaced timing.');
      tips.push('Discontinue if you develop hives or asthma wheezing.');
    } else if (dName.includes('lisinopril')) {
      tips.push('Take with a full glass of water.');
      tips.push('Avoid sudden changes in posture to prevent orthostatic dizziness.');
      tips.push('Monitor for persistent dry cough or swelling.');
    } else if (dName.includes('albuterol')) {
      tips.push('Use exactly as directed by your clinical advisor.');
      tips.push('Do not lie down immediately after taking — sit upright to maximize airways.');
      tips.push('Rinse mouth with water after usage to avoid thrush or dry mouth.');
    } else {
      tips.push('Take exactly as directed by your clinician.');
      tips.push('Drink ample water and do not double the next dose if missed.');
    }

    return tips;
  }

  private static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
