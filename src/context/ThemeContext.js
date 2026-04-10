// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const lightTheme = {
  mode:          'light',
  bg:            '#FFFFFF',
  bgSecondary:   '#F0F4F8',
  surface:       '#FFFFFF',
  card:          '#E8F0FA',
  border:        '#C5D8EE',
  text:          '#111111',
  textSecondary: 'rgba(0,0,0,0.55)',
  textMuted:     'rgba(0,0,0,0.35)',
  accent:        '#4A7AB5',
  accentDark:    '#2d4a6e',
  accentLight:   '#dde8f4',
  accentBg:      '#dde8f4',
  accentBorder:  '#a8d5cc',
  highlight:     '#f4a261',
  highlightBg:   '#fdf0e6',
  inputBg:       '#FFFFFF',
  inputLine:     '#BDBDBD',
  scoreHigh:     '#16A34A',
  scoreMid:      '#D97706',
  scoreLow:      '#DC2626',
  none:          '#a8d5a2',
  low:           '#f5c97a',
  moderate:      '#f4a07a',
  high:          '#e87070',
};

export const darkTheme = {
  mode:          'dark',
  bg:            '#0A0F1E',
  bgSecondary:   '#111827',
  surface:       '#111827',
  card:          '#1C2A40',
  border:        '#1A3A6E',
  text:          '#F0EEF8',
  textSecondary: '#A8B4CC',
  textMuted:     '#5A6A82',
  accent:        '#4A7AB5',
  accentDark:    '#2d4a6e',
  accentLight:   '#0d2e28',
  accentBg:      '#0d2e28',
  accentBorder:  '#1a4a40',
  highlight:     '#f4a261',
  highlightBg:   '#2A1E00',
  inputBg:       '#111827',
  inputLine:     '#2E3347',
  scoreHigh:     '#22C55E',
  scoreMid:      '#FBBF24',
  scoreLow:      '#EF4444',
  none:          '#a8d5a2',
  low:           '#f5c97a',
  moderate:      '#f4a07a',
  high:          '#e87070',
};

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('themeOverride').then((val) => {
      if (val === 'light' || val === 'dark') setOverride(val);
    });
  }, []);

  const scheme = override ?? systemScheme ?? 'light';
  const theme  = scheme === 'dark' ? darkTheme : lightTheme;

  const setTheme = async (val) => {
    if (val === 'system') {
      setOverride(null);
      await AsyncStorage.removeItem('themeOverride');
    } else {
      setOverride(val);
      await AsyncStorage.setItem('themeOverride', val);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, scheme, setTheme, override }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be within ThemeProvider');
  return ctx;
}
