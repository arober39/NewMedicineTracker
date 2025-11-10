import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/database';
import './ScreenStyles.css';

export default function AddDosageEntryScreen() {
  const navigate = useNavigate();
  const { medicationId } = useParams();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [taken, setTaken] = useState(true);
  const [dosageAmount, setDosageAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medication, setMedication] = useState(null);

  useEffect(() => {
    const loadMedication = async () => {
      try {
        const medications = await db.getAllMedications();
        const found = medications.find(m => m.id === medicationId);
        setMedication(found);
        if (found?.dosage) {
          setDosageAmount(found.dosage);
        }
      } catch (error) {
        console.error('Error loading medication:', error);
      }
    };
    loadMedication();
  }, [medicationId]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await db.createDosageEntry({
        medicationId,
        date: new Date(date).toISOString(),
        taken,
        dosageAmount: dosageAmount.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      navigate(-1);
    } catch (error) {
      console.error('Error creating dosage entry:', error);
      alert('Failed to save dosage entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Log Dosage</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        <div className="card">
          {medication && (
            <div className="info-card">
              <h3 className="medication-name">{medication.name}</h3>
              {medication.dosage && (
                <p className="medication-info-text">Default Dosage: {medication.dosage}</p>
              )}
              {medication.frequency && (
                <p className="medication-info-text">Frequency: {medication.frequency}</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Date & Time</label>
            <input
              type="datetime-local"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="switch-container">
            <span className="switch-label">Medication Taken</span>
            <div
              className={`switch ${taken ? 'active' : ''}`}
              onClick={() => setTaken(!taken)}
            >
              <div className="switch-thumb"></div>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Dosage Amount (Optional)</label>
            <input
              type="text"
              className="input"
              value={dosageAmount}
              onChange={(e) => setDosageAmount(e.target.value)}
              placeholder={medication?.dosage || "Enter dosage amount"}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Notes (Optional)</label>
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this dosage..."
              rows={3}
            />
          </div>

          <div className="button-container">
            <button
              className="button button-outlined"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              className="button button-contained"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading"></span> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

