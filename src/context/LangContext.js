// src/context/LangContext.js
import React, { createContext, useContext, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { getTranslations } from '../translations';

const LangContext = createContext(null);

const FALLBACK = getTranslations('en');

export function LangProvider({ children }) {
  const { user } = useAuth();

  // Manual override — used before login (e.g. on register screen)
  const [override, setOverride] = useState(null);

  // Priority: manual override > logged-in user language > default 'no'
  const lang = override ?? user?.language ?? 'en';
  const t    = useMemo(() => getTranslations(lang), [lang]);

  const setLang = async (code) => {
    setOverride(code);
    await AsyncStorage.setItem('lang_override', code).catch(() => {});
  };

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) return { lang: 'en', t: FALLBACK, setLang: () => {} };
  return ctx;
}
