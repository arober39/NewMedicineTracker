// IndexedDB database manager

const DB_NAME = 'medicineTracker';
const DB_VERSION = 1;

export class DatabaseManager {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('ailments')) {
          const ailmentsStore = db.createObjectStore('ailments', { keyPath: 'id' });
          ailmentsStore.createIndex('dateCreated', 'dateCreated');
        }

        if (!db.objectStoreNames.contains('symptoms')) {
          const symptomsStore = db.createObjectStore('symptoms', { keyPath: 'id' });
          symptomsStore.createIndex('ailmentId', 'ailmentId');
          symptomsStore.createIndex('dateLogged', 'dateLogged');
        }

        if (!db.objectStoreNames.contains('medications')) {
          const medicationsStore = db.createObjectStore('medications', { keyPath: 'id' });
          medicationsStore.createIndex('ailmentId', 'ailmentId');
          medicationsStore.createIndex('startDate', 'startDate');
        }

        if (!db.objectStoreNames.contains('dosageEntries')) {
          const dosageStore = db.createObjectStore('dosageEntries', { keyPath: 'id' });
          dosageStore.createIndex('medicationId', 'medicationId');
          dosageStore.createIndex('date', 'date');
        }

        if (!db.objectStoreNames.contains('symptomMedications')) {
          const symptomMedStore = db.createObjectStore('symptomMedications', { keyPath: ['symptomId', 'medicationId'] });
          symptomMedStore.createIndex('symptomId', 'symptomId');
          symptomMedStore.createIndex('medicationId', 'medicationId');
        }
      };
    });
  }

  async ensureDb() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Ailments
  async getAllAilments() {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ailments'], 'readonly');
      const store = transaction.objectStore('ailments');
      const index = store.index('dateCreated');
      const request = index.getAll();
      
      request.onsuccess = () => {
        const results = request.result;
        // Sort by dateCreated descending
        results.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createAilment(ailment) {
    const db = await this.ensureDb();
    const id = this.generateId();
    const newAilment = { id, ...ailment };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ailments'], 'readwrite');
      const store = transaction.objectStore('ailments');
      const request = store.add(newAilment);
      
      request.onsuccess = () => resolve(newAilment);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAilment(id, updates) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ailments'], 'readwrite');
      const store = transaction.objectStore('ailments');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const ailment = getRequest.result;
        if (!ailment) {
          reject(new Error('Ailment not found'));
          return;
        }
        const updated = { ...ailment, ...updates };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteAilment(id) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ailments'], 'readwrite');
      const store = transaction.objectStore('ailments');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Symptoms
  async getSymptomsByAilment(ailmentId) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptoms'], 'readonly');
      const store = transaction.objectStore('symptoms');
      const index = store.index('ailmentId');
      const request = index.getAll(ailmentId);
      
      request.onsuccess = () => {
        const results = request.result;
        results.sort((a, b) => new Date(b.dateLogged) - new Date(a.dateLogged));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createSymptom(symptom) {
    const db = await this.ensureDb();
    const id = this.generateId();
    const newSymptom = { id, ...symptom };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptoms'], 'readwrite');
      const store = transaction.objectStore('symptoms');
      const request = store.add(newSymptom);
      
      request.onsuccess = () => resolve(newSymptom);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSymptom(id, updates) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptoms'], 'readwrite');
      const store = transaction.objectStore('symptoms');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const symptom = getRequest.result;
        if (!symptom) {
          reject(new Error('Symptom not found'));
          return;
        }
        const updated = { ...symptom, ...updates };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteSymptom(id) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptoms'], 'readwrite');
      const store = transaction.objectStore('symptoms');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Medications
  async getMedicationsByAilment(ailmentId) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['medications'], 'readonly');
      const store = transaction.objectStore('medications');
      const index = store.index('ailmentId');
      const request = index.getAll(ailmentId);
      
      request.onsuccess = () => {
        const results = request.result;
        results.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllMedications() {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['medications'], 'readonly');
      const store = transaction.objectStore('medications');
      const index = store.index('startDate');
      const request = index.getAll();
      
      request.onsuccess = () => {
        const results = request.result;
        results.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createMedication(medication) {
    const db = await this.ensureDb();
    const id = this.generateId();
    const newMedication = { id, ...medication };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['medications'], 'readwrite');
      const store = transaction.objectStore('medications');
      const request = store.add(newMedication);
      
      request.onsuccess = () => resolve(newMedication);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMedication(id) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['medications'], 'readwrite');
      const store = transaction.objectStore('medications');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Dosage Entries
  async getDosageEntriesByMedication(medicationId) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dosageEntries'], 'readonly');
      const store = transaction.objectStore('dosageEntries');
      const index = store.index('medicationId');
      const request = index.getAll(medicationId);
      
      request.onsuccess = () => {
        const results = request.result;
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createDosageEntry(entry) {
    const db = await this.ensureDb();
    const id = this.generateId();
    const newEntry = { id, ...entry };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dosageEntries'], 'readwrite');
      const store = transaction.objectStore('dosageEntries');
      const request = store.add(newEntry);
      
      request.onsuccess = () => resolve(newEntry);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDosageEntry(id) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dosageEntries'], 'readwrite');
      const store = transaction.objectStore('dosageEntries');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Symptom-Medication relationships
  async linkSymptomToMedication(symptomId, medicationId) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptomMedications'], 'readwrite');
      const store = transaction.objectStore('symptomMedications');
      const link = { symptomId, medicationId };
      const request = store.put(link);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async unlinkSymptomFromMedication(symptomId, medicationId) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptomMedications'], 'readwrite');
      const store = transaction.objectStore('symptomMedications');
      const request = store.delete([symptomId, medicationId]);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMedicationsBySymptom(symptomId) {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptomMedications', 'medications'], 'readonly');
      const linkStore = transaction.objectStore('symptomMedications');
      const symptomIndex = linkStore.index('symptomId');
      const request = symptomIndex.getAll(symptomId);
      
      request.onsuccess = () => {
        const links = request.result;
        const medicationIds = links.map(link => link.medicationId);
        
        if (medicationIds.length === 0) {
          resolve([]);
          return;
        }

        const medStore = transaction.objectStore('medications');
        const medications = [];
        let completed = 0;

        medicationIds.forEach(medId => {
          const getRequest = medStore.get(medId);
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              medications.push(getRequest.result);
            }
            completed++;
            if (completed === medicationIds.length) {
              medications.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
              resolve(medications);
            }
          };
          getRequest.onerror = () => {
            completed++;
            if (completed === medicationIds.length) {
              resolve(medications);
            }
          };
        });
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new DatabaseManager();

