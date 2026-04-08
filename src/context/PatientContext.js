// src/context/PatientContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { patientApi } from '../services/api';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchPatient = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientApi.get();
      setPatient(data ?? null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRecord = async (record) => {
    const saved = await patientApi.addRecord(record);
    await fetchPatient(); // refresh
    return saved;
  };

  const saveQuestionnaire = async (key, data) => {
    await patientApi.updateQuestionnaire(key, data);
    await fetchPatient();
  };

  const updateProfile = async (data) => {
    await patientApi.updateProfile(data);
    await fetchPatient();
  };

  const getRecordForDate = (date) =>
    (patient?.records ?? []).find((r) => r.date === date) ?? null;

  const lastRecord = patient?.records?.slice(-1)[0] ?? null;

  return (
    <PatientContext.Provider value={{
      patient, loading, error,
      fetchPatient, saveRecord, saveQuestionnaire, updateProfile,
      getRecordForDate, lastRecord,
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be within PatientProvider');
  return ctx;
}
