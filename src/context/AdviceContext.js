// src/context/AdviceContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { patientApi } from '../services/api';

const TOTAL_ADVICE = 18; // 3 per category × 6 categories

const AdviceContext = createContext(null);

export function AdviceProvider({ children }) {
  const [viewed,      setViewed]      = useState(new Set());
  const [userRelevant,setUserRelevant]= useState(new Set());
  const [loaded,      setLoaded]      = useState(false);

  // Load viewed/relevant from patient profile
  useEffect(() => {
    patientApi.get()
      .then(profile => {
        setViewed(new Set(profile?.viewedAdvice   ?? []));
        setUserRelevant(new Set(profile?.relevantAdvice ?? []));
      })
      .catch(() => {
        // New user / not logged in yet — treat all as unread
        setViewed(new Set());
      })
      .finally(() => setLoaded(true));
  }, []);

  const markViewed = useCallback((id) => {
    setViewed(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      patientApi.updateViewedAdvice([...next]).catch(() => {});
      return next;
    });
  }, []);

  const toggleRelevant = useCallback((id) => {
    setUserRelevant(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      patientApi.updateRelevantAdvice([...next]).catch(() => {});
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    patientApi.get()
      .then(profile => {
        setViewed(new Set(profile?.viewedAdvice   ?? []));
        setUserRelevant(new Set(profile?.relevantAdvice ?? []));
      })
      .catch(() => {});
  }, []);

  // Show badge for all advice not yet viewed
  // For new users (viewed is empty Set), this equals TOTAL_ADVICE
  const unreadCount = loaded ? Math.max(0, TOTAL_ADVICE - viewed.size) : 0;

  return (
    <AdviceContext.Provider value={{
      viewed, userRelevant,
      markViewed, toggleRelevant, refresh,
      unreadCount,
    }}>
      {children}
    </AdviceContext.Provider>
  );
}

export function useAdvice() {
  const ctx = useContext(AdviceContext);
  if (!ctx) throw new Error('useAdvice must be used inside AdviceProvider');
  return ctx;
}