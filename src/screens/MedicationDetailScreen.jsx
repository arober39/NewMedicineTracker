import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/database';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import './ScreenStyles.css';

function TypeBadge({ type }) {
  const getBadgeClass = () => {
    switch (type) {
      case 'Medication': return 'badge badge-medication';
      case 'Supplement': return 'badge badge-supplement';
      case 'Vitamin': return 'badge badge-vitamin';
      case 'Herbal': return 'badge badge-herbal';
      default: return 'badge badge-other';
    }
  };

  return <span className={getBadgeClass()}>{type}</span>;
}

function WeeklyChart({ dosageEntries }) {
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const entry = dosageEntries.find(entry =>
      isSameDay(new Date(entry.date), date)
    );

    return {
      date,
      taken: entry?.taken || false,
      dayLabel: format(date, 'EEE'),
    };
  });

  return (
    <div className="chart-card">
      <h3 className="chart-title">Weekly Progress</h3>
      <div className="chart-container">
        {weekData.map((day, index) => (
          <div key={index} className="day-column">
            <span className="day-label">{day.dayLabel}</span>
            <div
              className="day-indicator"
              style={{
                backgroundColor: day.taken ? '#4caf50' : '#f44336',
              }}
            >
              {day.taken ? '✓' : '✗'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MedicationDetailScreen() {
  const navigate = useNavigate();
  const { medicationId } = useParams();
  const [medication, setMedication] = useState(null);
  const [dosageEntries, setDosageEntries] = useState([]);

  useEffect(() => {
    loadData();
  }, [medicationId]);

  const loadData = async () => {
    try {
      const medications = await db.getAllMedications();
      const foundMedication = medications.find(m => m.id === medicationId);
      setMedication(foundMedication || null);

      const entries = await db.getDosageEntriesByMedication(medicationId);
      setDosageEntries(entries);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDeleteDosageEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this dosage entry?')) {
      try {
        await db.deleteDosageEntry(id);
        loadData();
      } catch (error) {
        console.error('Error deleting dosage entry:', error);
      }
    }
  };

  if (!medication) {
    return (
      <div className="container">
        <div className="header">
          <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
          <h1>Medication Details</h1>
          <div></div>
        </div>
        <div className="empty-container">
          <p className="empty-text">Medication not found</p>
        </div>
      </div>
    );
  }

  const recentEntries = dosageEntries.slice(0, 7);

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Medication Details</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        {/* Medication Info */}
        <div className="card">
          <div className="medication-header">
            <h2 className="card-title">{medication.name}</h2>
            <TypeBadge type={medication.type} />
          </div>

          {medication.dosage && (
            <div className="info-row">
              <span className="info-label">Dosage:</span>
              <span className="info-value">{medication.dosage}</span>
            </div>
          )}

          {medication.frequency && (
            <div className="info-row">
              <span className="info-label">Frequency:</span>
              <span className="info-value">{medication.frequency}</span>
            </div>
          )}

          <div className="info-row">
            <span className="info-label">Started:</span>
            <span className="info-value">
              {format(new Date(medication.startDate), 'MMM dd, yyyy')}
            </span>
          </div>

          {medication.endDate ? (
            <div className="info-row">
              <span className="info-label">Ended:</span>
              <span className="info-value">
                {format(new Date(medication.endDate), 'MMM dd, yyyy')}
              </span>
            </div>
          ) : (
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value" style={{ color: '#4caf50' }}>Active</span>
            </div>
          )}

          {medication.notes && (
            <p className="notes" style={{ marginTop: '12px' }}>{medication.notes}</p>
          )}
        </div>

        {/* Weekly Chart */}
        <WeeklyChart dosageEntries={dosageEntries} />

        {/* Recent Dosage Entries */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Recent Dosage Log</h3>
            <button
              className="button button-outlined"
              onClick={() => navigate(`/medication/${medicationId}/add-dosage`)}
            >
              Add Entry
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <p className="empty-text">No dosage entries logged yet</p>
          ) : (
            recentEntries.map((entry, index) => (
              <div key={entry.id}>
                {index > 0 && <div className="divider" />}
                <div className="entry-container">
                  <div className="entry-header">
                    <div className="entry-datetime">
                      <p className="entry-date">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </p>
                      <p className="entry-time">
                        {format(new Date(entry.date), 'h:mm a')}
                      </p>
                    </div>
                    <div className="entry-status">
                      <div
                        className="status-indicator"
                        style={{
                          backgroundColor: entry.taken ? '#4caf50' : '#f44336',
                        }}
                      >
                        {entry.taken ? '✓' : '✗'}
                      </div>
                      <span
                        className="status-label"
                        style={{
                          color: entry.taken ? '#4caf50' : '#f44336',
                        }}
                      >
                        {entry.taken ? 'Taken' : 'Missed'}
                      </span>
                    </div>
                    <button
                      className="button button-text button-danger"
                      onClick={() => handleDeleteDosageEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {entry.dosageAmount && (
                    <p className="dosage-amount">Amount: {entry.dosageAmount}</p>
                  )}

                  {entry.notes && (
                    <p className="entry-notes">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}

          {dosageEntries.length > 7 && (
            <button
              className="button button-text"
              style={{ marginTop: '12px' }}
            >
              View All Entries ({dosageEntries.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

