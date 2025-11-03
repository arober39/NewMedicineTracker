import * as SQLite from 'expo-sqlite';
import { Ailment, Symptom, Medication, DosageEntry, SymptomMedication } from './models';

export class DatabaseManager {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('medicineTracker.db');
    this.init();
  }

  private init() {
    // Create tables
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS ailments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        notes TEXT,
        dateCreated TEXT NOT NULL
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS symptoms (
        id TEXT PRIMARY KEY,
        ailmentId TEXT NOT NULL,
        name TEXT NOT NULL,
        severity INTEGER NOT NULL,
        dateLogged TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (ailmentId) REFERENCES ailments (id) ON DELETE CASCADE
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY,
        ailmentId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT,
        notes TEXT,
        FOREIGN KEY (ailmentId) REFERENCES ailments (id) ON DELETE CASCADE
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS dosageEntries (
        id TEXT PRIMARY KEY,
        medicationId TEXT NOT NULL,
        date TEXT NOT NULL,
        taken INTEGER NOT NULL,
        dosageAmount TEXT,
        notes TEXT,
        FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE
      );
    `);

    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS symptomMedications (
        symptomId TEXT NOT NULL,
        medicationId TEXT NOT NULL,
        PRIMARY KEY (symptomId, medicationId),
        FOREIGN KEY (symptomId) REFERENCES symptoms (id) ON DELETE CASCADE,
        FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE
      );
    `);
  }

  // Ailments
  getAllAilments(): Ailment[] {
    return this.db.getAllSync('SELECT * FROM ailments ORDER BY dateCreated DESC') as Ailment[];
  }

  createAilment(ailment: Omit<Ailment, 'id'>): Ailment {
    const id = this.generateId();
    const newAilment = { id, ...ailment };

    this.db.runSync(
      'INSERT INTO ailments (id, name, notes, dateCreated) VALUES (?, ?, ?, ?)',
      [id, ailment.name, ailment.notes || null, ailment.dateCreated]
    );

    return newAilment;
  }

  updateAilment(id: string, updates: Partial<Ailment>): void {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    this.db.runSync(
      `UPDATE ailments SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  deleteAilment(id: string): void {
    this.db.runSync('DELETE FROM ailments WHERE id = ?', [id]);
  }

  // Symptoms
  getSymptomsByAilment(ailmentId: string): Symptom[] {
    return this.db.getAllSync(
      'SELECT * FROM symptoms WHERE ailmentId = ? ORDER BY dateLogged DESC',
      [ailmentId]
    ) as Symptom[];
  }

  createSymptom(symptom: Omit<Symptom, 'id'>): Symptom {
    const id = this.generateId();
    const newSymptom = { id, ...symptom };

    this.db.runSync(
      'INSERT INTO symptoms (id, ailmentId, name, severity, dateLogged, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [id, symptom.ailmentId, symptom.name, symptom.severity, symptom.dateLogged, symptom.notes || null]
    );

    return newSymptom;
  }

  updateSymptom(id: string, updates: Partial<Symptom>): void {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    this.db.runSync(
      `UPDATE symptoms SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  deleteSymptom(id: string): void {
    this.db.runSync('DELETE FROM symptoms WHERE id = ?', [id]);
  }

  // Medications
  getMedicationsByAilment(ailmentId: string): Medication[] {
    return this.db.getAllSync(
      'SELECT * FROM medications WHERE ailmentId = ? ORDER BY startDate DESC',
      [ailmentId]
    ) as Medication[];
  }

  getAllMedications(): Medication[] {
    return this.db.getAllSync('SELECT * FROM medications ORDER BY startDate DESC') as Medication[];
  }

  createMedication(medication: Omit<Medication, 'id'>): Medication {
    const id = this.generateId();
    const newMedication = { id, ...medication };

    this.db.runSync(
      'INSERT INTO medications (id, ailmentId, name, type, dosage, frequency, startDate, endDate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, medication.ailmentId, medication.name, medication.type,
        medication.dosage || null, medication.frequency || null,
        medication.startDate, medication.endDate || null, medication.notes || null
      ]
    );

    return newMedication;
  }

  deleteMedication(id: string): void {
    this.db.runSync('DELETE FROM medications WHERE id = ?', [id]);
  }

  // Dosage Entries
  getDosageEntriesByMedication(medicationId: string): DosageEntry[] {
    return this.db.getAllSync(
      'SELECT * FROM dosageEntries WHERE medicationId = ? ORDER BY date DESC',
      [medicationId]
    ) as DosageEntry[];
  }

  createDosageEntry(entry: Omit<DosageEntry, 'id'>): DosageEntry {
    const id = this.generateId();
    const newEntry = { id, ...entry };

    this.db.runSync(
      'INSERT INTO dosageEntries (id, medicationId, date, taken, dosageAmount, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [id, entry.medicationId, entry.date, entry.taken ? 1 : 0, entry.dosageAmount || null, entry.notes || null]
    );

    return newEntry;
  }

  deleteDosageEntry(id: string): void {
    this.db.runSync('DELETE FROM dosageEntries WHERE id = ?', [id]);
  }

  // Symptom-Medication relationships
  linkSymptomToMedication(symptomId: string, medicationId: string): void {
    this.db.runSync(
      'INSERT OR IGNORE INTO symptomMedications (symptomId, medicationId) VALUES (?, ?)',
      [symptomId, medicationId]
    );
  }

  unlinkSymptomFromMedication(symptomId: string, medicationId: string): void {
    this.db.runSync(
      'DELETE FROM symptomMedications WHERE symptomId = ? AND medicationId = ?',
      [symptomId, medicationId]
    );
  }

  getMedicationsBySymptom(symptomId: string): Medication[] {
    return this.db.getAllSync(`
      SELECT m.* FROM medications m
      JOIN symptomMedications sm ON m.id = sm.medicationId
      WHERE sm.symptomId = ?
      ORDER BY m.startDate DESC
    `, [symptomId]) as Medication[];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const db = new DatabaseManager();