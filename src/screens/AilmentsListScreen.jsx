import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../database/database';
import { format } from 'date-fns';
import './ScreenStyles.css';

function AilmentCard({ item, onDelete, onNavigate }) {
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [s, m] = await Promise.all([
        db.getSymptomsByAilment(item.id),
        db.getMedicationsByAilment(item.id)
      ]);
      setSymptoms(s);
      setMedications(m);
    };
    loadData();
  }, [item.id]);

  return (
    <div
      className="card"
      onClick={onNavigate}
    >
      <div className="card-header">
        <div className="card-title-container">
          <h2 className="card-title">{item.name}</h2>
          <p className="date-text">
            Created: {format(new Date(item.dateCreated), 'MMM dd, yyyy')}
          </p>
        </div>
        <button
          className="icon-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          🗑️
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-number">{symptoms.length}</span>
          <span className="stat-label">Symptoms</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{medications.length}</span>
          <span className="stat-label">Medications</span>
        </div>
      </div>

      {item.notes && (
        <p className="notes" style={{ marginTop: '8px' }}>
          {item.notes.length > 100 ? `${item.notes.substring(0, 100)}...` : item.notes}
        </p>
      )}
    </div>
  );
}

export default function AilmentsListScreen() {
  const navigate = useNavigate();
  const [ailments, setAilments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAilments();
  }, []);

  const loadAilments = async () => {
    try {
      const loadedAilments = await db.getAllAilments();
      setAilments(loadedAilments);
    } catch (error) {
      console.error('Error loading ailments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAilment = async (id) => {
    if (window.confirm('Are you sure you want to delete this ailment?')) {
      try {
        await db.deleteAilment(id);
        loadAilments();
      } catch (error) {
        console.error('Error deleting ailment:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-container">
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Health Tracker</h1>
      </div>

      {ailments.length === 0 ? (
        <div className="empty-container">
          <p className="empty-text">No ailments tracked yet</p>
          <p className="empty-subtext">
            Click the + button to add your first health condition
          </p>
        </div>
      ) : (
        <div className="list-container">
          {ailments.map((item) => (
            <AilmentCard
              key={item.id}
              item={item}
              onDelete={handleDeleteAilment}
              onNavigate={() => navigate(`/ailment/${item.id}`)}
            />
          ))}
        </div>
      )}

      <button
        className="fab"
        onClick={() => navigate('/add-ailment')}
        title="Add Ailment"
      >
        +
      </button>
    </div>
  );
}

