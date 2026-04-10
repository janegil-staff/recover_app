import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';
import { TOTAL_SECONDS } from './shareStyles';

export function useTabColors(theme) {
  return {
    PRIMARY: theme?.accent ?? '#4A7AB5',
    NAVY:    '#1a2c3d',
    MUTED:   '#7a9ab8',
  };
}

// ── Arc timer ──────────────────────────────────────────────────────────────────
export function ArcTimer({ secondsLeft, total = TOTAL_SECONDS, color }) {
  const SIZE = 200, STROKE = 10;
  const R = (SIZE - STROKE) / 2, CX = SIZE / 2, CY = SIZE / 2;
  const START_DEG = 160, SPAN = 220;
  const arcDeg = Math.max(0, secondsLeft / total) * SPAN;

  function polarToXY(deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  }
  function arcPath(fromDeg, toDeg) {
    const from = polarToXY(fromDeg), to = polarToXY(toDeg);
    const span = (toDeg - fromDeg + 360) % 360;
    return `M ${from.x} ${from.y} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${to.x} ${to.y}`;
  }

  const bgPath = arcPath(START_DEG, START_DEG + SPAN);
  const fgPath = arcDeg > 1 ? arcPath(START_DEG, START_DEG + arcDeg) : null;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE}>
        <Path d={bgPath} stroke="#e8eef5" strokeWidth={STROKE} fill="none" strokeLinecap="round" />
        {fgPath && <Path d={fgPath} stroke={color} strokeWidth={STROKE} fill="none" strokeLinecap="round" />}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: '800', color, letterSpacing: 2 }}>
          {mins}:{secs}
        </Text>
      </View>
    </View>
  );
}

// ── Tab icons ──────────────────────────────────────────────────────────────────
export function IconCode({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" />
      <Line x1="7" y1="13" x2="10" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="7" y1="16" x2="14" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconQuestionnaire({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8" />
      <Line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="8" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="19" cy="19" r="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <Line x1="19" y1="17" x2="19" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="19" cy="20.5" r="0.6" fill={color} />
    </Svg>
  );
}

export function IconStudies({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3 L22 8 L12 13 L2 8 Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <Path d="M6 10.5 L6 16 C6 16 9 19 12 19 C15 19 18 16 18 16 L18 10.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Line x1="22" y1="8" x2="22" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
