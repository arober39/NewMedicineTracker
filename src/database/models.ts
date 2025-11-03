export interface Ailment {
  id: string;
  name: string;
  notes?: string;
  dateCreated: string;
}

export interface Symptom {
  id: string;
  ailmentId: string;
  name: string;
  severity: number; // 1-10 scale
  dateLogged: string;
  notes?: string;
}

export interface Medication {
  id: string;
  ailmentId: string;
  name: string;
  type: 'Medication' | 'Supplement' | 'Vitamin' | 'Herbal' | 'Other';
  dosage?: string;
  frequency?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface DosageEntry {
  id: string;
  medicationId: string;
  date: string;
  taken: boolean;
  dosageAmount?: string;
  notes?: string;
}

export interface SymptomMedication {
  symptomId: string;
  medicationId: string;
}