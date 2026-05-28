# Implementation Plan: AI-Powered Post-Prescription Patient Monitoring & Drug Safety Feedback System

## Background

To increase clinical safety and monitor recovery after a doctor issues a prescription, we are implementing a real-time, interactive **Post-Prescription Patient Monitoring & Drug Safety Feedback System**.

This system will close the loop between doctors and patients:
1. **Prescription Placement**: Active medication details and a structured follow-up monitoring tracker are pushed to the **Patient Dashboard**.
2. **Interactive Patient Feedback**: Patients can submit clinical tracking reports ("Better", "Same", "Worse", "Severe Side Effects") and check off active symptoms (headache, dizziness, vomiting, allergy, chest pain, breathing issues, weakness).
3. **AI Post-Medication Safety Assessment**: The Sanjeevani AI engine analyzes incoming reports, maps symptoms against known drug side effects, checks for critical complications, and grades the risk level (`stable`, `elevated`, or `critical`).
4. **Live Doctor Alerts**: High-risk responses instantly trigger notifications and appear on the **Doctor Dashboard**'s priority watchlists.
5. **Telemetry & Statistical Analytics**: Vitals and drug-safety compliance feed into the **Clinical Analytics Dashboard** live via local events.

---

## User Review Required

> [!IMPORTANT]
> **Real-Time Simulation Triggering**  
> We will add a simulated interval-based event or manual buttons to simulate the passage of time or prompt generation (e.g. *"Generate Daily Follow-up Prompt"* in the Patient Dashboard) so that users can easily test and see the notifications appear without waiting 24 hours.

> [!WARNING]  
> To maintain strict UI consistency, all modifications will use vanilla styling and CSS tokens. No external layout libraries or Tailwind CSS upgrades will be introduced.

---

## Proposed Changes

### Component 1 — Database & State Store (`db.ts`)

#### [MODIFY] [db.ts](file:///c:/Arun/SIMATS/PDD%20Sanjeevani%20Ai/src/services/db.ts)

1. **Add `MedicationFeedback` interface**:
```typescript
export interface MedicationFeedback {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  drugName: string;
  date: string;
  feeling: 'Better' | 'Same' | 'Worse' | 'Severe Side Effects';
  symptoms: string[];
  notes?: string;
  aiSeverity: 'stable' | 'elevated' | 'critical';
  aiAnalysis: string;
  readByDoctor: boolean;
}
```

2. **Extend `PatientProfile`** to store medication feedback records.
3. **Add Database Methods**:
   - `submitFeedback(feedback: Omit<MedicationFeedback, 'id' | 'date' | 'aiSeverity' | 'aiAnalysis' | 'readByDoctor'>)`: Runs AI safety audit on the feedback, generates safety alerts, logs to local storage, and publishes updates on the broker.
   - `getFeedbacks(patientId?: string)`: Retrieves feedbacks.
   - `markFeedbackAsRead(feedbackId: string)`: Marks feedback read.
   - `getDoctorAlerts()`: Aggregates patient feedback warnings.

---

### Component 2 — AI Feedback Safety Audit (`ai.ts`)

#### [MODIFY] [ai.ts](file:///c:/Arun/SIMATS/PDD%20Sanjeevani%20Ai/src/services/ai.ts)

Add clinical side-effect and symptom mapping to the **AISafetyEngine**:
1. Define common side effects per drug class (e.g., Metformin → nausea/vomiting/kidney risk; Warfarin → severe bleeding/weakness; Beta Blockers → dizziness/asthma-breathing issues; Albuterol → palpitations/dizziness).
2. Create `analyzeFeedback(drugName: string, feeling: string, symptoms: string[])`:
   - Returns a structured assessment: `{ severity: 'stable' | 'elevated' | 'critical', flags: string[], notes: string }`.
   - Flags dangerous symptom combinations (e.g., chest pain/breathing issue → critical, dizziness + antihypertensive → severe).

---

### Component 3 — Patient Dashboard (`PatientDashboard.tsx`)

#### [MODIFY] [PatientDashboard.tsx](file:///c:/Arun/SIMATS/PDD%20Sanjeevani%20Ai/src/routes/Patient/PatientDashboard.tsx)

1. **Medication Monitoring Card**: Displays active prescription schedules and tracking progress.
2. **Interactive Monitoring Questionnaire**: Prompts patient daily or via simulated trigger: *"How are you feeling after taking [Medicine]?"*
3. **Side Effect Reporting Form**: A premium slider/sheet popup for checking off symptoms and uploading the log.
4. **AI Safety Status Card**: Real-time feedback from the AI showing risk assessment (e.g., *"Sanjeevani AI Status: Stable Recovery"*).

---

### Component 4 — Doctor Dashboard (`DoctorDashboard.tsx`)

#### [MODIFY] [DoctorDashboard.tsx](file:///c:/Arun/SIMATS/PDD%20Sanjeevani%20Ai/src/routes/Doctor/DoctorDashboard.tsx)

Extend doctor controls with 4 new panels:
1. **Active Patient Monitoring Panel**: Live stream of patients taking medications and their reported statuses.
2. **Drug Safety Alerts Panel**: High-priority alert banner for critical symptom reactions.
3. **High-Risk Patients Tab**: Focus list filtering out patients in critical condition.
4. **Follow-Up Reports**: Expanding view of historical symptom trajectories.

---

### Component 5 — Telemetry Charts (`AnalyticsDashboard.tsx`)

#### [MODIFY] [AnalyticsDashboard.tsx](file:///c:/Arun/SIMATS/PDD%20Sanjeevani%20Ai/src/routes/Analytics/AnalyticsDashboard.tsx)

1. **Side Effect Telemetry Chart**: Adds a live-updating bar chart showcasing aggregated reported symptoms (Dizziness, Headache, Vomiting, Allergy, etc.).
2. **Medication Recovery Progress**: Pie chart or trend line showing the breakdown of patient feelings (Better, Same, Worse, Severe).

---

## Verification Plan

### Automated & Manual Verification
1. **Prescribe Medication**: Log in as Dr. Aarav Mehta, prescribe Metformin/Warfarin to Rohan Sharma.
2. **Submit Patient Feedback**: Log in as Rohan, find the daily monitoring tracker on the patient dashboard. Submit a feedback report indicating "Severe Side Effects" and selecting "Dizziness" and "Breathing issue".
3. **Check Doctor Dashboard**: Log back in as doctor or observe the dashboard update instantly. A critical red alert card should appear: *"SJV-PAT-000001 reported severe side effects (Breathing issue, Dizziness) for Metformin."*
4. **Check Analytics**: Open Clinical Analytics Dashboard and verify that side effects counts and recovery trends update in real-time.
5. **Check Typescript**: Verify compilation and no typescript check errors.
