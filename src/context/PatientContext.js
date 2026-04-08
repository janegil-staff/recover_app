// src/context/PatientContext.js
// Named "LogsContext" shape to match FocusApp pattern — useLogs() hook
import React, { createContext, useContext, useState, useCallback } from 'react';
import { patientApi } from '../services/api';

const LogsContext = createContext(null);

export function LogsProvider({ children }) {
  const [logs,    setLogs]    = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientApi.get();
      // Sort descending (newest first)
      const records = (data?.records ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));
      setLogs(records);
      // Build summary from records
      const count = records.length;
      if (count > 0) {
        const avgCravings  = records.reduce((s, r) => s + (r.cravings  ?? 0), 0) / count;
        const avgMood      = records.reduce((s, r) => s + (r.mood      ?? 0), 0) / count;
        const avgWellbeing = records.reduce((s, r) => s + (r.wellbeing ?? 0), 0) / count;
        setSummary({ count, averages: { cravings: avgCravings, mood: avgMood, wellbeing: avgWellbeing } });
      } else {
        setSummary({ count: 0, averages: {} });
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  // alias for FocusApp compatibility
  const fetchSummary = useCallback(async () => { await fetchLogs(); }, [fetchLogs]);

  const saveLog = async (log) => {
    const saved = await patientApi.addRecord(log);
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === log.date);
      const updated = saved ?? log;
      if (idx >= 0) {
        const next = [...prev]; next[idx] = updated; return next;
      }
      return [updated, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
    return saved;
  };

  const deleteLog = async (date) => {
    await patientApi.deleteRecord(date);
    setLogs((prev) => prev.filter((l) => l.date !== date));
  };

  const getLogForDate = (date) => logs.find((l) => l.date === date) ?? null;

  // Sobriety streak — consecutive days with substances=[] or frequency='none'
  const sobrietyStreak = (() => {
    if (!logs.length) return 0;
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    let prev   = null;
    for (const log of sorted) {
      const clean = (!log.substances || log.substances.length === 0) && log.frequency === 'none';
      if (!clean) break;
      if (prev) {
        const d1 = new Date(prev);
        const d2 = new Date(log.date);
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
        if (diff > 1) break;
      }
      streak++;
      prev = log.date;
    }
    return streak;
  })();

  const saveQuestionnaire = async (key, answers) => {
    await patientApi.updateQuestionnaire(key, answers);
    await fetchLogs();
  };

  return (
    <LogsContext.Provider value={{
      logs, summary, loading,
      fetchLogs, fetchSummary,
      saveLog, deleteLog, getLogForDate,
      sobrietyStreak, saveQuestionnaire,
    }}>
      {children}
    </LogsContext.Provider>
  );
}

export const useLogs = () => useContext(LogsContext);

// keep old name working too
export { LogsProvider as PatientProvider };
