import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AilmentsListScreen from './screens/AilmentsListScreen';
import AilmentDetailScreen from './screens/AilmentDetailScreen';
import AddAilmentScreen from './screens/AddAilmentScreen';
import AddSymptomScreen from './screens/AddSymptomScreen';
import AddMedicationScreen from './screens/AddMedicationScreen';
import SymptomDetailScreen from './screens/SymptomDetailScreen';
import MedicationDetailScreen from './screens/MedicationDetailScreen';
import AddDosageEntryScreen from './screens/AddDosageEntryScreen';

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<AilmentsListScreen />} />
          <Route path="/ailment/:ailmentId" element={<AilmentDetailScreen />} />
          <Route path="/add-ailment" element={<AddAilmentScreen />} />
          <Route path="/ailment/:ailmentId/add-symptom" element={<AddSymptomScreen />} />
          <Route path="/ailment/:ailmentId/add-medication" element={<AddMedicationScreen />} />
          <Route path="/symptom/:symptomId" element={<SymptomDetailScreen />} />
          <Route path="/medication/:medicationId" element={<MedicationDetailScreen />} />
          <Route path="/medication/:medicationId/add-dosage" element={<AddDosageEntryScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

