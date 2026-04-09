// src/context/LangContext.js
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { getTranslations } from '../translations';

const LangContext = createContext(null);
const FALLBACK = getTranslations('en');

export function LangProvider({ children }) {
  const { user } = useAuth();

  // Override only used pre-login (register screen language picker)
  const [override, setOverride] = useState(null);

  // Once user logs in, clear the override so user.language takes over
  useEffect(() => {
    if (user?.language) {
      setOverride(null);
      AsyncStorage.removeItem('lang_override').catch(() => {});
    }
  }, [user?.language]);

  // Load any saved override on mount (for pre-login screens)
  useEffect(() => {
    if (!user) {
      AsyncStorage.getItem('lang_override').then(v => {
        if (v) setOverride(v);
      }).catch(() => {});
    }
  }, []);

  // Priority: logged-in user language > pre-login override > default 'en'
  const lang = user?.language ?? override ?? 'en';
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
