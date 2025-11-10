import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../database/database';
import './ScreenStyles.css';

export default function AddAilmentScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await db.createAilment({
        name: name.trim(),
        notes: notes.trim() || undefined,
        dateCreated: new Date().toISOString(),
      });

      navigate(-1);
    } catch (error) {
      console.error('Error creating ailment:', error);
      alert('Failed to save ailment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Add New Ailment</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        <div className="card">
          <div className="form-group">
            <label className="input-label">Ailment Name *</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Crohn's Disease, Migraines, etc."
            />
          </div>

          <div className="form-group">
            <label className="input-label">Notes (Optional)</label>
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information about this condition..."
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

