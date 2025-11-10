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

export default function SymptomDetailScreen() {
  const navigate = useNavigate();
  const { symptomId } = useParams();
  const [symptom, setSymptom] = useState(null);
  const [linkedMedications, setLinkedMedications] = useState([]);
  const [availableMedications, setAvailableMedications] = useState([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  useEffect(() => {
    loadData();
  }, [symptomId]);

  const loadData = async () => {
    try {
      const allAilments = await db.getAllAilments();
      let foundSymptom = null;

      for (const ailment of allAilments) {
        const symptoms = await db.getSymptomsByAilment(ailment.id);
        const symptomMatch = symptoms.find(s => s.id === symptomId);
        if (symptomMatch) {
          foundSymptom = symptomMatch;
          break;
        }
      }

      setSymptom(foundSymptom);

      if (foundSymptom) {
        setDescriptionText(foundSymptom.notes || '');
        
        const [linked, allMeds] = await Promise.all([
          db.getMedicationsBySymptom(foundSymptom.id),
          db.getMedicationsByAilment(foundSymptom.ailmentId)
        ]);
        setLinkedMedications(linked);

        const available = allMeds.filter(
          med => !linked.some(linked => linked.id === med.id)
        );
        setAvailableMedications(available);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLinkMedication = async (medicationId) => {
    if (symptom) {
      try {
        await db.linkSymptomToMedication(symptom.id, medicationId);
        loadData();
      } catch (error) {
        console.error('Error linking medication:', error);
      }
    }
  };

  const handleUnlinkMedication = async (medicationId) => {
    if (symptom) {
      try {
        await db.unlinkSymptomFromMedication(symptom.id, medicationId);
        loadData();
      } catch (error) {
        console.error('Error unlinking medication:', error);
      }
    }
  };

  const handleSaveDescription = async () => {
    if (symptom) {
      try {
        await db.updateSymptom(symptom.id, { notes: descriptionText });
        setIsEditingDescription(false);
        loadData();
      } catch (error) {
        console.error('Error updating symptom:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setDescriptionText(symptom?.notes || '');
    setIsEditingDescription(false);
  };

  if (!symptom) {
    return (
      <div className="container">
        <div className="header">
          <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
          <h1>Symptom Details</h1>
          <div></div>
        </div>
        <div className="empty-container">
          <p className="empty-text">Symptom not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <button className="button-text" onClick={() => navigate(-1)}>← Back</button>
        <h1>Symptom Details</h1>
        <div></div>
      </div>

      <div className="scroll-container">
        {/* Symptom Info */}
        <div className="card">
          <h2 className="card-title">{symptom.name}</h2>

          <div style={{ marginBottom: '16px' }}>
            <p className="input-label">Severity Level:</p>
            <SeverityIndicator severity={symptom.severity} />
          </div>

          <p className="date-text">
            Logged: {format(new Date(symptom.dateLogged), 'MMM dd, yyyy - h:mm a')}
          </p>

          {symptom.notes && (
            <p className="notes">{symptom.notes}</p>
          )}
        </div>

        {/* Description Card */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Description</h3>
            {!isEditingDescription && (
              <button
                className="icon-button"
                onClick={() => setIsEditingDescription(true)}
              >
                ✏️
              </button>
            )}
          </div>
          
          {isEditingDescription ? (
            <div>
              <textarea
                className="textarea"
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Add a description for this symptom..."
                rows={4}
              />
              <div className="button-container">
                <button
                  className="button button-text"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  className="button button-contained"
                  onClick={handleSaveDescription}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="notes">
              {symptom.notes ? symptom.notes : 'No additional description provided for this symptom.'}
            </p>
          )}
        </div>

        {/* Linked Medications */}
        <div className="card">
          <h3 className="section-title">Associated Medications</h3>

          {linkedMedications.length === 0 ? (
            <p className="empty-text">No medications linked to this symptom</p>
          ) : (
            linkedMedications.map((medication, index) => (
              <div key={medication.id}>
                {index > 0 && <div className="divider" />}
                <div className="item-container">
                  <div className="item-header">
                    <div>
                      <h4 className="item-title">{medication.name}</h4>
                      <p className="medication-detail">
                        {medication.type} • {medication.dosage || 'No dosage specified'}
                      </p>
                      {medication.frequency && (
                        <p className="medication-detail">{medication.frequency}</p>
                      )}
                    </div>
                    <div className="flex gap-8">
                      <button
                        className="button button-text"
                        onClick={() => navigate(`/medication/${medication.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="button button-text button-danger"
                        onClick={() => handleUnlinkMedication(medication.id)}
                      >
                        Unlink
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Available Medications to Link */}
        {availableMedications.length > 0 && (
          <div className="card">
            <h3 className="section-title">Link Additional Medications</h3>
            <p className="empty-text" style={{ fontStyle: 'italic', textAlign: 'left' }}>
              Other medications for this condition that could be linked to this symptom:
            </p>

            {availableMedications.map((medication, index) => (
              <div key={medication.id}>
                {index > 0 && <div className="divider" />}
                <div className="item-container">
                  <div className="item-header">
                    <div>
                      <h4 className="item-title">{medication.name}</h4>
                      <p className="medication-detail">
                        {medication.type} • {medication.dosage || 'No dosage specified'}
                      </p>
                      {medication.frequency && (
                        <p className="medication-detail">{medication.frequency}</p>
                      )}
                    </div>
                    <button
                      className="button button-outlined"
                      onClick={() => handleLinkMedication(medication.id)}
                    >
                      Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

