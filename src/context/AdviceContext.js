// src/context/AdviceContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { patientApi } from '../services/api';

const TOTAL_ADVICE = 18;
const AdviceContext = createContext(null);

export function AdviceProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const profile = await patientApi.get();
      const viewed   = (profile?.viewedAdvice   ?? []).length;
      const relevant = (profile?.relevantAdvice ?? []).length;
      // unread = not yet opened (neither viewed nor relevant)
      const seen = new Set([
        ...(profile?.viewedAdvice   ?? []),
        ...(profile?.relevantAdvice ?? []),
      ]);
      setUnreadCount(Math.max(0, TOTAL_ADVICE - seen.size));
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => { refresh(); }, []);

  return (
    <AdviceContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </AdviceContext.Provider>
  );
}

export function useAdvice() {
  const ctx = useContext(AdviceContext);
  if (!ctx) return { unreadCount: 0, refresh: () => {} };
  return ctx;
}