import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/database';
import './ScreenStyles.css';

export default function AddSymptomScreen() {
  const navigate = useNavigate();
  const { ailmentId } = useParams();
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [dateLogged, setDateLogged] = useState(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Symptom name is required');
      return;
    }

    setIsLoading(true);
    try {
      await db.createSymptom({
        ailmentId,
        name: name.trim(),
        severity,
        dateLogged,
        notes: notes.trim() || undefined,
      });

      navigate(-1);
    } catch (error) {
      console.error('Error creating symptom:', error);
      alert('Failed to save symptom. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = () => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  const getSeverityLabel = () => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  const handleDateChange = (e) => {
    setDateLogged(new Date(e.target.value).toISOString());
  };

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Add New Symptom</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        <div className="card">
          <div className="form-group">
            <label className="input-label">Symptom Name *</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Abdominal Pain, Headache, etc."
            />
          </div>

          <div className="form-group">
            <label className="input-label">
              Severity: {severity}/10 - {getSeverityLabel()}
            </label>
            <div className="severity-buttons">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                <button
                  key={value}
                  className={`button severity-button ${severity === value ? 'active' : ''}`}
                  onClick={() => setSeverity(value)}
                  style={{
                    backgroundColor: severity === value ? getSeverityColor() : 'transparent',
                    borderColor: getSeverityColor(),
                    color: severity === value ? 'white' : getSeverityColor(),
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="severity-scale">
              <span className="scale-text">1 - Mild</span>
              <span className="scale-text">10 - Severe</span>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Date & Time</label>
            <input
              type="datetime-local"
              className="input"
              value={new Date(dateLogged).toISOString().slice(0, 16)}
              onChange={handleDateChange}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Notes (Optional)</label>
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this symptom..."
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

