// src/constants/theme.js
export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const FontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, xxxl: 32,
};

export const Radius = {
  sm: 6, md: 12, lg: 18, xl: 24, full: 999,
};

// Light theme — matches FocusApp key names
export const LightTheme = {
  // backgrounds
  bg:          '#f0f4f8',
  surface:     '#ffffff',
  surfaceAlt:  '#e8eef5',

  // text
  text:           '#1a2c3d',
  textSecondary:  '#3a5272',
  textMuted:      '#7a9ab8',

  // brand — FocusApp blue
  accent:         '#4A7AB5',
  accentDark:     '#2d4a6e',
  accentLight:    '#dde8f4',
  accentBorder:   '#b8ccec',

  // ui
  border:         '#ccdaec',
  inputLine:      '#ccdaec',
  error:          '#d32f2f',
  success:        '#388e3c',
  warning:        '#f9a825',

  // substance severity
  none:           '#a8d5a2',
  low:            '#f5c97a',
  moderate:       '#f4a07a',
  high:           '#e87070',

  // substance colours
  alcohol:         '#7986cb',
  cannabis:        '#66bb6a',
  cocaine:         '#ef5350',
  opioids:         '#ab47bc',
  amphetamines:    '#ff7043',
  benzodiazepines: '#26a69a',
  tobacco:         '#8d6e63',
  prescription:    '#42a5f5',
  other:           '#bdbdbd',
};

// Craving/mood helpers
export function cravingColor(n) {
  const map = ['#a8d5a2','#c5e5a0','#f5e27a','#f5c97a','#f4a07a','#e87070'];
  return map[Math.max(0, Math.min(5, n))] ?? '#ccc';
}

export function moodColor(n) {
  const map = ['#e87070','#f4a07a','#f5c97a','#c5e5a0','#a8d5a2'];
  return map[Math.max(1, Math.min(5, n)) - 1] ?? '#ccc';
}

export function substanceColor(key) {
  return LightTheme[key] ?? LightTheme.other;
}