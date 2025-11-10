import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/database';
import './ScreenStyles.css';

const medicationTypes = [
  { value: 'Medication', label: 'Medication' },
  { value: 'Supplement', label: 'Supplement' },
  { value: 'Vitamin', label: 'Vitamin' },
  { value: 'Herbal', label: 'Herbal' },
  { value: 'Other', label: 'Other' },
];

export default function AddMedicationScreen() {
  const navigate = useNavigate();
  const { ailmentId } = useParams();
  const [name, setName] = useState('');
  const [type, setType] = useState('Medication');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await db.createMedication({
        ailmentId,
        name: name.trim(),
        type,
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: hasEndDate ? new Date(endDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
      });

      navigate(-1);
    } catch (error) {
      console.error('Error creating medication:', error);
      alert('Failed to save medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Add New {type}</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        <div className="card">
          <div className="form-group">
            <label className="input-label">Name *</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mesalamine, Vitamin D3, etc."
            />
          </div>

          <div className="form-group">
            <label className="input-label">Type</label>
            <div className="segmented-buttons">
              {medicationTypes.map((mt) => (
                <button
                  key={mt.value}
                  className={`segmented-button ${type === mt.value ? 'active' : ''}`}
                  onClick={() => setType(mt.value)}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Dosage</label>
            <input
              type="text"
              className="input"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 500mg, 2 tablets, 1 capsule"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Frequency</label>
            <input
              type="text"
              className="input"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g., twice daily, once a week, as needed"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Schedule</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <div className="switch-container">
              <span className="switch-label">Has End Date</span>
              <div
                className={`switch ${hasEndDate ? 'active' : ''}`}
                onClick={() => setHasEndDate(!hasEndDate)}
              >
                <div className="switch-thumb"></div>
              </div>
            </div>

            {hasEndDate && (
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            )}
          </div>

          <div className="form-group">
            <label className="input-label">Notes (Optional)</label>
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information, side effects, etc."
              rows={4}
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
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? <span className="loading"></span> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

