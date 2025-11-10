import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../database/database';
import { format } from 'date-fns';
import './ScreenStyles.css';

function SeverityIndicator({ severity }) {
  const getColor = () => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="severity-container">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="severity-dot"
          style={{
            backgroundColor: i < severity ? getColor() : '#444',
          }}
        />
      ))}
      <span className="severity-text">{severity}/10</span>
    </div>
  );
}

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

export default function AilmentDetailScreen() {
  const navigate = useNavigate();
  const { ailmentId } = useParams();
  const [ailment, setAilment] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    loadData();
  }, [ailmentId]);

  const loadData = async () => {
    try {
      const ailments = await db.getAllAilments();
      const foundAilment = ailments.find(a => a.id === ailmentId);
      setAilment(foundAilment || null);

      const [loadedSymptoms, loadedMedications] = await Promise.all([
        db.getSymptomsByAilment(ailmentId),
        db.getMedicationsByAilment(ailmentId)
      ]);
      setSymptoms(loadedSymptoms);
      setMedications(loadedMedications);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDeleteSymptom = async (id) => {
    if (window.confirm('Are you sure you want to delete this symptom?')) {
      try {
        await db.deleteSymptom(id);
        loadData();
      } catch (error) {
        console.error('Error deleting symptom:', error);
      }
    }
  };

  const handleDeleteMedication = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await db.deleteMedication(id);
        loadData();
      } catch (error) {
        console.error('Error deleting medication:', error);
      }
    }
  };

  if (!ailment) {
    return (
      <div className="container">
        <div className="header">
          <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
          <h1>Ailment Details</h1>
          <div></div>
        </div>
        <div className="empty-container">
          <p className="empty-text">Ailment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Ailment Details</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        {/* Ailment Info */}
        <div className="card">
          <h2 className="card-title">{ailment.name}</h2>
          <p className="date-text">
            Created: {format(new Date(ailment.dateCreated), 'MMM dd, yyyy')}
          </p>
          {ailment.notes && (
            <p className="notes">{ailment.notes}</p>
          )}
        </div>

        {/* Symptoms Section */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Symptoms</h3>
            <button
              className="button button-outlined"
              onClick={() => navigate(`/ailment/${ailmentId}/add-symptom`)}
            >
              Add
            </button>
          </div>

          {symptoms.length === 0 ? (
            <p className="empty-text">No symptoms logged yet</p>
          ) : (
            symptoms.map((symptom, index) => (
              <div key={symptom.id}>
                {index > 0 && <div className="divider" />}
                <div className="item-container">
                  <div className="item-header">
                    <h4 className="item-title">{symptom.name}</h4>
                    <button
                      className="button button-text button-danger"
                      onClick={() => handleDeleteSymptom(symptom.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <SeverityIndicator severity={symptom.severity} />

                  <p className="date-text">
                    {format(new Date(symptom.dateLogged), 'MMM dd, yyyy - h:mm a')}
                  </p>

                  {symptom.notes && (
                    <p className="notes">{symptom.notes}</p>
                  )}

                  <button
                    className="button button-text"
                    onClick={() => navigate(`/symptom/${symptom.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Medications Section */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Medications & Supplements</h3>
            <button
              className="button button-outlined"
              onClick={() => navigate(`/ailment/${ailmentId}/add-medication`)}
            >
              Add
            </button>
          </div>

          {medications.length === 0 ? (
            <p className="empty-text">No medications added yet</p>
          ) : (
            medications.map((medication, index) => (
              <div key={medication.id}>
                {index > 0 && <div className="divider" />}
                <div className="item-container">
                  <div className="item-header">
                    <div className="medication-header">
                      <h4 className="item-title">{medication.name}</h4>
                      <TypeBadge type={medication.type} />
                    </div>
                    <button
                      className="button button-text button-danger"
                      onClick={() => handleDeleteMedication(medication.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="medication-info">
                    {medication.dosage && (
                      <p className="medication-detail">Dosage: {medication.dosage}</p>
                    )}
                    {medication.frequency && (
                      <p className="medication-detail">Frequency: {medication.frequency}</p>
                    )}
                    <p className="date-text">
                      Started: {format(new Date(medication.startDate), 'MMM dd, yyyy')}
                    </p>
                    {medication.endDate ? (
                      <p className="date-text">
                        Ended: {format(new Date(medication.endDate), 'MMM dd, yyyy')}
                      </p>
                    ) : (
                      <p className="date-text" style={{ color: '#4caf50' }}>Active</p>
                    )}
                  </div>

                  {medication.notes && (
                    <p className="notes">{medication.notes}</p>
                  )}

                  <div className="medication-buttons">
                    <button
                      className="button button-outlined log-dosage-button"
                      onClick={() => navigate(`/medication/${medication.id}/add-dosage`)}
                    >
                      Log Dosage
                    </button>
                    <button
                      className="button button-text"
                      onClick={() => navigate(`/medication/${medication.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

