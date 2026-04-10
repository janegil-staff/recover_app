// src/screens/home/HomeScreen.js
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { useAuth }    from '../../context/AuthContext';
import { useLogs }    from '../../context/PatientContext';
import { useTheme }   from '../../context/ThemeContext';
import { useLang }    from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';
import AdviceBulbButton from '../../components/AdviceBulbButton';

const { width } = Dimensions.get('window');

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// ── Stat icons ────────────────────────────────────────────────────────────────
function IconCalendarCheck({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x="3" y="6" width="26" height="23" rx="3" stroke={color} strokeWidth="2" />
      <Line x1="3" y1="13" x2="29" y2="13" stroke={color} strokeWidth="2" />
      <Line x1="10" y1="3" x2="10" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="3" x2="22" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10 21 L14 25 L22 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCraving({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M16 4 C16 4 8 10 8 18 C8 22.4 11.6 26 16 26 C20.4 26 24 22.4 24 18 C24 10 16 4 16 4 Z"
        stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <Path d="M13 20 Q16 23 19 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconMood({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2" />
      <Circle cx="11" cy="13" r="1.5" fill={color} />
      <Circle cx="21" cy="13" r="1.5" fill={color} />
      <Path d="M10 19 Q16 25 22 19" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function IconWellbeing({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M16 27 C16 27 5 19 5 12 C5 8.1 8.1 5 12 5 C14 5 15.8 5.9 17 7.3 C18.2 5.9 20 5 22 5 C25.9 5 29 8.1 29 12 C29 19 16 27 16 27 Z"
        stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

function IconSubstance({ color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x="8" y="14" width="16" height="8" rx="4" stroke={color} strokeWidth="2"
        transform="rotate(-35 16 18)" />
      <Line x1="11" y1="21" x2="18" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}

// ── Grid icons ────────────────────────────────────────────────────────────────
function IconMyData({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Line x1="6" y1="42" x2="44" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="6" y1="42" x2="6"  y2="8"  stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Polyline points="6,36 16,28 26,32 36,18 44,12" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="16" cy="28" r="2.5" fill={color} />
      <Circle cx="26" cy="32" r="2.5" fill={color} />
      <Circle cx="36" cy="18" r="2.5" fill={color} />
      <Polyline points="39,8 44,12 40,16" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function IconMyDiary({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="10" y="6" width="28" height="36" rx="3" stroke={color} strokeWidth="2.2" />
      <Line x1="10" y1="14" x2="38" y2="14" stroke={color} strokeWidth="1.5" />
      <Line x1="15" y1="22" x2="33" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="15" y1="28" x2="33" y2="28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="15" y1="34" x2="26" y2="34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <Line x1="32" y1="36" x2="40" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M40 28 L43 25 L41 23 L38 26 Z" fill={color} />
      <Line x1="32" y1="36" x2="31" y2="39" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconShareData({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="18" cy="14" r="6" stroke={color} strokeWidth="2.2" />
      <Path d="M6 38 C6 30 30 30 30 38" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <Line x1="38" y1="28" x2="38" y2="14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Polyline points="33,19 38,14 43,19" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="33" y1="30" x2="43" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function IconMedications({ color, size = 46 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="18" width="24" height="12" rx="6" stroke={color} strokeWidth="2.2" transform="rotate(-35 18 24)" />
      <Line x1="10" y1="29" x2="20" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <Circle cx="36" cy="32" r="10" stroke={color} strokeWidth="2" />
      <Line x1="36" y1="26" x2="36" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="36" y1="32" x2="40" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function WaveBackground({ color }) {
  return (
    <Svg width={width} height={300} viewBox={`0 0 ${width} 300`} style={StyleSheet.absoluteFill}>
      <Path d={`M0 80 Q${width*0.25} 20 ${width*0.5} 80 Q${width*0.75} 140 ${width} 80 L${width} 300 L0 300 Z`}
        fill={color} opacity="0.07" />
      <Path d={`M0 120 Q${width*0.3} 60 ${width*0.6} 120 Q${width*0.85} 160 ${width} 100 L${width} 300 L0 300 Z`}
        fill={color} opacity="0.05" />
      <Path d={`M0 160 Q${width*0.4} 100 ${width*0.7} 150 Q${width*0.9} 180 ${width} 130 L${width} 300 L0 300 Z`}
        fill={color} opacity="0.04" />
    </Svg>
  );
}

const STAT_ICONS = [IconCalendarCheck, IconCraving, IconMood, IconWellbeing, IconSubstance];
const GRID_ICONS = [IconMyData, IconMyDiary, IconShareData, IconMedications];

export default function HomeScreen({ navigation }) {
  const { user }    = useAuth();
  const insets      = useSafeAreaInsets();
  const { theme }   = useTheme();
  const { t }       = useLang();
  const { logs, fetchLogs, getLogForDate } = useLogs();

  const today    = getToday();
  const todayLog = getLogForDate(today);
  const records  = logs ?? [];
  const count    = records.length;

  const avg = (key) => count
    ? (records.reduce((a, r) => a + (r[key] ?? 0), 0) / count).toFixed(1)
    : '–';

  const topSubstance = (() => {
    const counts = {};
    records.forEach(r => (r.substances ?? []).forEach(s => { counts[s] = (counts[s] ?? 0) + 1; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return top ? (t[top] ?? top) : '–';
  })();

  useEffect(() => { fetchLogs(); }, []);

  const s = makeStyles(theme, insets);

  const statRows = [
    { labelKey: 'daysLogged',  value: count,       iconIdx: 0 },
    { labelKey: 'avgCravings', value: avg('cravings'), iconIdx: 1 },
    { labelKey: 'avgMood',     value: avg('mood'),     iconIdx: 2 },
    { labelKey: 'avgWellbeing',value: avg('wellbeing'),iconIdx: 3 },
    { labelKey: 'topSubstance',value: topSubstance,    iconIdx: 4 },
  ];

  const menuItems = [
    { labelKey: 'myData',        screen: 'History' },
    { labelKey: 'myDiary',       screen: 'LogEntry' },
    { labelKey: 'shareData',     screen: 'Profile' },
    { labelKey: 'myMedications', screen: 'Medications' },
  ];

  return (
    <View style={s.safe}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.headerBtn}>
          <Text style={s.headerIcon}>⚙️</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.appName}>{t.appName}</Text>
          <Text style={s.tagline}>{t.tagline}</Text>
        </View>
        <AdviceBulbButton onPress={() => {}} color="#fff" />
      </View>

      {/* ── Scrollable content ──────────────────────────────────── */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={s.sectionTitle}>{t.last30days}</Text>

        <View style={s.statsList}>
          {statRows.map((row) => {
            const Icon = STAT_ICONS[row.iconIdx];
            return (
              <View key={row.labelKey} style={s.statRow}>
                <Icon color={theme.accent} size={32} />
                <Text style={s.statLabel}>{t[row.labelKey]}</Text>
                <Text style={s.statValue}>{row.value}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.gridWrap}>
          <WaveBackground color={theme.accent} />
          <View style={s.grid}>
            {menuItems.map((item, i) => {
              const Icon = GRID_ICONS[i];
              return (
                <TouchableOpacity
                  key={item.labelKey}
                  style={s.gridCard}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.75}
                >
                  <Icon color={theme.accent} size={46} />
                  <Text style={s.gridLabel}>{t[item.labelKey]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Log Today — pinned bottom ────────────────────────────── */}
      <View style={[s.bottomWrap, { paddingBottom: (insets.bottom || 16) + Spacing.md }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Log')}
          activeOpacity={0.88}
          style={s.logBtnWrap}
        >
          <View style={[s.logBtnInner, { backgroundColor: theme.accent }]}>
            <Text style={s.logBtnText}>
              {todayLog
                ? `✏️  ${t.editToday}`
                : `📋  ${t.logToday}`
              }
            </Text>
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const makeStyles = (t, insets = { top: 44 }) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg, flexDirection: 'column' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: t.accent,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerBtn:    { width: 40, alignItems: 'center' },
  headerIcon:   { fontSize: 22 },
  headerCenter: { alignItems: 'center', flex: 1 },
  appName:      { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '700', letterSpacing: 0.5 },
  tagline:      { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs, letterSpacing: 0.8, marginTop: 3 },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: Spacing.xl },

  sectionTitle: {
    color: t.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  statsList: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  statRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  statLabel: { flex: 1, color: t.text, fontSize: FontSize.md, marginLeft: Spacing.md },
  statValue: { color: t.accent, fontSize: FontSize.lg, fontWeight: '700' },

  gridWrap: {
    position: 'relative',
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.md,
    marginTop: -Spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  gridCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: t.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.accentBorder,
    shadowColor: t.accent,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gridLabel: {
    color: t.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },

  bottomWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: t.bg,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  logBtnWrap: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.accentBorder,
    overflow: 'hidden',
  },
  logBtnInner: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
