// src/screens/log/LogEntryScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Dimensions, Animated, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Ellipse, Line, G, Polyline } from 'react-native-svg';
import { useLogs }  from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { patientApi } from '../../services/api';
import { FontSize, Spacing, Radius } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ACCENT        = '#1a7f6e';
const BG            = '#ffffff';
const BG_SECONDARY  = '#f0f4f8';
const TEXT          = '#1a2928';
const TEXT_MUTED    = '#8aaba8';
const BORDER        = '#d1dde8';

const CRAVING_COLORS = { 0:'#22C55E',1:'#7AABDB',2:'#FBBF24',3:'#FB923C',4:'#EF4444',5:'#991B1B' };
const MOOD_COLORS    = { 1:'#EF4444',2:'#FB923C',3:'#FBBF24',4:'#7AABDB',5:'#22C55E' };

const SUBSTANCES   = ['alcohol','cannabis','cocaine','opioids','amphetamines','benzodiazepines','tobacco','prescription','other'];
const FREQUENCIES  = ['none','once','few_times','daily','multiple_daily'];
const SIDE_EFFECTS = ['nausea','insomnia','anxiety','paranoia','headache','fatigue','appetite_loss','memory_issues','irritability','depression'];

// ── Illustrations ─────────────────────────────────────────────────────────────

function IllustrationSubstances() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Rect x="55" y="20" width="90" height="110" rx="10" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2.5" />
      <Rect x="75" y="12" width="50" height="18" rx="7" fill={ACCENT} />
      <Circle cx="100" cy="20" r="4" fill="#fff" opacity="0.6" />
      {[45,63,81,99].map((y, i) => (
        <G key={i}>
          <Rect x="67" y={y} width="10" height="10" rx="2.5"
            fill={i < 2 ? ACCENT : '#e8f5f2'} stroke={ACCENT} strokeWidth="1.5" />
          {i < 2 && <Path d={`M${69} ${y+5} L${72} ${y+8} L${75} ${y+2}`}
            stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
          <Rect x="82" y={y+2} width={i < 2 ? 45 : 35} height="6" rx="3" fill={ACCENT} opacity={i < 2 ? 0.25 : 0.1} />
        </G>
      ))}
      <Rect x="30" y="100" width="20" height="35" rx="5" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2" />
      <Rect x="30" y="100" width="20" height="12" rx="4" fill={ACCENT} opacity="0.6" />
      <Rect x="145" y="95" width="18" height="38" rx="5" fill="#fff0e8" stroke="#f4a261" strokeWidth="2" />
      <Rect x="145" y="95" width="18" height="11" rx="4" fill="#f4a261" opacity="0.8" />
    </Svg>
  );
}

function IllustrationFrequency() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Rect x="40" y="30" width="120" height="110" rx="12" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2.5" />
      <Rect x="40" y="30" width="120" height="35" rx="12" fill={ACCENT} />
      <Rect x="62" y="22" width="8" height="18" rx="4" fill={ACCENT} />
      <Rect x="130" y="22" width="8" height="18" rx="4" fill={ACCENT} />
      {[
        [60,82,true],[85,82,true],[110,82,false],[135,82,true],
        [60,107,true],[85,107,false],[110,107,true],[135,107,true],
      ].map(([x, y, active], i) => (
        <G key={i}>
          <Circle cx={x} cy={y} r="12" fill={active ? ACCENT : '#d1e8e4'} />
          {active && <Path d={`M${x-4} ${y} L${x-1} ${y+3} L${x+5} ${y-4}`}
            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
        </G>
      ))}
    </Svg>
  );
}

function IllustrationAmount() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Circle cx="100" cy="100" r="65" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2" opacity="0.5" />
      <Circle cx="100" cy="100" r="50" fill="#fff" />
      {[
        ['#22C55E','M60 100 A40 40 0 0 1 68 72'],
        ['#7AABDB','M68 72 A40 40 0 0 1 100 60'],
        ['#FBBF24','M100 60 A40 40 0 0 1 132 72'],
        ['#FB923C','M132 72 A40 40 0 0 1 140 100'],
        ['#EF4444','M140 100 A40 40 0 0 1 125 130'],
      ].map(([color, d], i) => (
        <Path key={i} d={d} stroke={color} strokeWidth="12" strokeLinecap="round" fill="none" />
      ))}
      <Line x1="100" y1="100" x2="128" y2="74" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="100" cy="100" r="8" fill={ACCENT} />
    </Svg>
  );
}

function IllustrationCravings() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Ellipse cx="100" cy="75" rx="50" ry="42" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2.5" />
      <Path d="M70 65 Q80 55 90 65 Q100 75 110 65 Q120 55 130 65" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      <Path d="M75 80 Q85 70 95 80 Q105 90 115 80 Q125 70 130 80" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      <Path d="M65 70 Q60 80 65 90" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      <Path d="M135 70 Q140 80 135 90" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      <Path d="M30 135 Q45 120 60 135 Q75 150 90 135 Q105 120 120 135 Q135 150 150 135 Q165 120 170 128"
        stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      {['#22C55E','#7AABDB','#FBBF24','#FB923C','#EF4444','#991B1B'].map((c, i) => (
        <Circle key={i} cx={35 + i*26} cy="165" r="9" fill={c} />
      ))}
    </Svg>
  );
}

function IllustrationMood() {
  return (
    <Svg width={200} height={160} viewBox="0 0 210 180" fill="none">
      {[
        { cx:22,  color:'#EF4444', mouth:'M14 84 Q22 79 30 84' },
        { cx:57,  color:'#FB923C', mouth:'M49 84 Q57 80 65 84' },
        { cx:100, color:'#FBBF24', mouth:'M92 83 L108 83' },
        { cx:143, color:'#7AABDB', mouth:'M135 84 Q143 88 151 84' },
        { cx:178, color:'#22C55E', mouth:'M170 84 Q178 91 186 84' },
      ].map(({ cx, color, mouth }, i) => (
        <G key={i}>
          <Circle cx={cx} cy="80" r={i===2?28:22} fill={color} opacity={i===2?1:0.8} />
          <Circle cx={cx-7} cy="74" r="3" fill="white" />
          <Circle cx={cx+7} cy="74" r="3" fill="white" />
          <Circle cx={cx-6} cy="74" r="1.5" fill="#333" />
          <Circle cx={cx+8} cy="74" r="1.5" fill="#333" />
          <Path d={mouth} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </G>
      ))}
    </Svg>
  );
}

function IllustrationSideEffects() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Ellipse cx="100" cy="55" rx="28" ry="30" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2" />
      <Path d="M72 85 Q65 100 68 130 L100 135 L132 130 Q135 100 128 85 Q114 75 100 78 Q86 75 72 85 Z"
        fill="#e8f5f2" stroke={ACCENT} strokeWidth="2" />
      {[[20,60],[155,60],[20,110],[155,110],[85,150]].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x+15} cy={y+12} r="18" fill={['#fef3c7','#dbeafe','#fce7f3','#dcfce7','#ffedd5'][i]} stroke={['#D97706','#3B82F6','#EC4899','#22C55E','#F97316'][i]} strokeWidth="1.5" />
        </G>
      ))}
      <Line x1="75" y1="80" x2="50" y2="75" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <Line x1="125" y1="80" x2="158" y2="75" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <Line x1="80" y1="110" x2="52" y2="122" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <Line x1="120" y1="110" x2="158" y2="122" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
    </Svg>
  );
}


function IllustrationMedication() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      {/* Pill */}
      <Rect x="30" y="75" width="80" height="36" rx="18"
        fill="#e8f5f2" stroke={ACCENT} strokeWidth="2.5" />
      <Line x1="70" y1="75" x2="70" y2="111" stroke={ACCENT} strokeWidth="2" opacity="0.4" />
      <Rect x="30" y="75" width="40" height="36" rx="18" fill={ACCENT} opacity="0.25" />
      {/* Capsule */}
      <Rect x="120" y="60" width="30" height="60" rx="15"
        fill="#fff0e8" stroke="#f4a261" strokeWidth="2.5" />
      <Rect x="120" y="60" width="30" height="30" rx="15" fill="#f4a261" opacity="0.5" />
      {/* Bottle */}
      <Rect x="68" y="125" width="28" height="40" rx="4"
        fill="#e8f5f2" stroke={ACCENT} strokeWidth="2" />
      <Rect x="65" y="118" width="34" height="12" rx="4" fill={ACCENT} opacity="0.5" />
      <Circle cx="82" cy="142" r="5" fill={ACCENT} opacity="0.4" />
      {/* Checkmarks */}
      <Circle cx="165" cy="80" r="14" fill="#dcfce7" stroke="#22C55E" strokeWidth="2" />
      <Path d="M159 80 L163 84 L171 76" stroke="#22C55E" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="165" cy="115" r="14" fill="#dcfce7" stroke="#22C55E" strokeWidth="2" />
      <Path d="M159 115 L163 119 L171 111" stroke="#22C55E" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Dashes */}
      <Line x1="112" y1="80" x2="150" y2="80" stroke={ACCENT} strokeWidth="1.5"
        strokeDasharray="4 3" opacity="0.4" />
      <Line x1="112" y1="115" x2="150" y2="115" stroke={ACCENT} strokeWidth="1.5"
        strokeDasharray="4 3" opacity="0.4" />
    </Svg>
  );
}

function IllustrationNote() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Rect x="35" y="30" width="130" height="120" rx="10" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2.5" />
      <Line x1="100" y1="30" x2="100" y2="150" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.3" />
      {[55,70,85,100,115,130].map((y, i) => (
        <Rect key={i} x={i%2===0?45:108} y={y} width={i%2===0?45:42} height="5" rx="2.5"
          fill={ACCENT} opacity={0.15 + (5-i)*0.05} />
      ))}
      <Rect x="140" y="95" width="8" height="50" rx="4" fill="#f4a261" transform="rotate(-30 140 95)" />
      <Path d="M133 143 L137 150 L143 145 Z" fill="#f4a261" />
    </Svg>
  );
}

function IllustrationWeight() {
  return (
    <Svg width={180} height={160} viewBox="0 0 200 180" fill="none">
      <Ellipse cx="100" cy="145" rx="60" ry="16" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2" />
      <Rect x="90" y="100" width="20" height="45" rx="4" fill="#e8f5f2" stroke={ACCENT} strokeWidth="1.5" />
      <Ellipse cx="100" cy="98" rx="50" ry="28" fill="#e8f5f2" stroke={ACCENT} strokeWidth="2.5" />
      <Rect x="80" y="87" width="40" height="20" rx="5" fill="#fff" stroke={ACCENT} strokeWidth="1.5" />
      <Rect x="84" y="91" width="32" height="12" rx="3" fill={ACCENT} opacity="0.2" />
      <Polyline points="40,75 60,60 80,65 100,45 120,50 140,30 160,35"
        stroke={ACCENT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M152 23 L162 33 L168 23" stroke={ACCENT} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Chip selector ─────────────────────────────────────────────────────────────
function Chips({ options, selected, onToggle, labelFn }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => onToggle(opt)} style={{
            paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.full,
            backgroundColor: active ? ACCENT : BG_SECONDARY,
            borderWidth: 1.5, borderColor: active ? ACCENT : BORDER,
          }}>
            <Text style={{ fontSize: FontSize.sm, fontWeight: active ? '700' : '500',
              color: active ? '#fff' : TEXT }}>
              {labelFn ? labelFn(opt) : opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Scale dots ────────────────────────────────────────────────────────────────
function ScaleDots({ values, value, onChange, colors }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      {values.map(n => {
        const active = value === n;
        const color  = colors?.[n] ?? ACCENT;
        return (
          <TouchableOpacity key={n} onPress={() => onChange(value === n ? null : n)} style={{
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: active ? color : BG_SECONDARY,
            borderWidth: 2, borderColor: active ? color : BORDER,
            justifyContent: 'center', alignItems: 'center',
            shadowColor: active ? color : 'transparent',
            shadowOpacity: 0.4, shadowRadius: 6, elevation: active ? 4 : 0,
          }}>
            <Text style={{ fontSize: FontSize.lg, fontWeight: '800',
              color: active ? '#fff' : TEXT_MUTED }}>{n}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LogEntryScreen({ navigation, route }) {
  const { date, log: existingLog } = route?.params ?? {};
  const { t }      = useLang();
  const { saveLog, deleteLog } = useLogs();
  const insets     = useSafeAreaInsets();
  const isEdit     = !!existingLog;
  const today      = date ?? new Date().toISOString().slice(0, 10);

  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const slideAnim           = useRef(new Animated.Value(0)).current;

  const [substances,  setSubstances]  = useState(existingLog?.substances  ?? []);
  const [frequency,   setFrequency]   = useState(existingLog?.frequency   ?? 'none');
  const [amount,      setAmount]      = useState(existingLog?.amount      ?? null);
  const [cravings,    setCravings]    = useState(existingLog?.cravings    ?? null);
  const [mood,        setMood]        = useState(existingLog?.mood        ?? null);
  const [wellbeing,   setWellbeing]   = useState(existingLog?.wellbeing   ?? null);
  const [sideEffects, setSideEffects] = useState(existingLog?.sideEffects ?? []);
  const [note,        setNote]        = useState(existingLog?.note        ?? '');
  const [weight,      setWeight]      = useState(existingLog?.weight ? String(existingLog.weight) : '');
  const [medsTaken,   setMedsTaken]   = useState(existingLog?.medicationsTaken ?? []);
  const [savedMeds,   setSavedMeds]   = useState([]);

  // Load user's saved medications (custom + preset selections)
  useEffect(() => {
    const PRESET_MEDS = [
      { id: 'methadone',      name: 'Metadon',       brand: 'Metadone' },
      { id: 'buprenorphine',  name: 'Buprenorfin',   brand: 'Subutex, Suboxone' },
      { id: 'naltrexone',     name: 'Naltrexon',     brand: 'Revia, Vivitrol' },
      { id: 'naloxone',       name: 'Nalokson',      brand: 'Narcan, Nyxoid' },
      { id: 'acamprosate',    name: 'Akamprosat',    brand: 'Campral' },
      { id: 'disulfiram',     name: 'Disulfiram',    brand: 'Antabus' },
      { id: 'gabapentin',     name: 'Gabapentin',    brand: 'Neurontin' },
      { id: 'pregabalin',     name: 'Pregabalin',    brand: 'Lyrica' },
      { id: 'baclofen',       name: 'Baklofen',      brand: 'Lioresal' },
      { id: 'clonidine',      name: 'Klonidin',      brand: 'Catapres' },
      { id: 'diazepam',       name: 'Diazepam',      brand: 'Valium' },
      { id: 'antidepressant', name: 'Antidepressiva',brand: 'SSRI/SNRI' },
      { id: 'antipsychotic',  name: 'Antipsykotika', brand: '' },
      { id: 'other',          name: 'Annet',         brand: '' },
    ];
    const load = async () => {
      try {
        const [customMeds, profile] = await Promise.all([
          patientApi.getMedications(),
          patientApi.get(),
        ]);
        // Custom meds from DB
        const custom = (customMeds ?? []).map(m => ({
          _id: m._id, name: m.name, dosage: m.dosage, isCustom: true,
        }));
        // Preset meds the user selected in MedicationsScreen
        const selectedIds = profile?.medicines?.map(m => m.id) ?? [];
        const preset = PRESET_MEDS
          .filter(m => selectedIds.includes(m.id))
          .map(m => ({ _id: m.id, name: m.name, dosage: m.brand || '', isCustom: false }));
        setSavedMeds([...custom, ...preset]);
      } catch (e) {
        console.log('Load meds error:', e?.message);
      }
    };
    load();
  }, []);

  const toggleMed = (med) => {
    setMedsTaken(prev => {
      const exists = prev.find(m => m.id === med._id);
      if (exists) return prev.filter(m => m.id !== med._id);
      return [...prev, { id: med._id, name: med.name, dosage: med.dosage ?? '' }];
    });
  };

  const updateDosage = (id, dosage) => {
    setMedsTaken(prev => prev.map(m => m.id === id ? { ...m, dosage } : m));
  };

  const toggle = (setter, val) =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const amountColors = Object.fromEntries(
    Array.from({ length: 11 }, (_, n) => [n, `hsl(${120 - n * 12},65%,45%)`])
  );

  const STEPS = [
    {
      key:           'substances',
      title:         t.substancesUsed,
      subtitle:      t.substancesSubtitle  ?? 'Select all substances used today',
      illustration:  <IllustrationSubstances />,
      content: (
        <Chips options={SUBSTANCES} selected={substances}
          onToggle={v => toggle(setSubstances, v)} labelFn={v => t[v] ?? v} />
      ),
    },
    {
      key:           'frequency',
      title:         t.frequency,
      subtitle:      t.frequencySubtitle   ?? 'How often did you use today?',
      illustration:  <IllustrationFrequency />,
      content: (
        <Chips options={FREQUENCIES} selected={[frequency]}
          onToggle={v => setFrequency(v)} labelFn={v => t[v] ?? v} />
      ),
    },
    {
      key:           'amount',
      title:         t.amount,
      subtitle:      t.amountSubtitle      ?? '0 = none   10 = very high',
      illustration:  <IllustrationAmount />,
      content: (
        <ScaleDots values={[0,1,2,3,4,5,6,7,8,9,10]}
          value={amount} onChange={setAmount} colors={amountColors} />
      ),
    },
    {
      key:           'cravings',
      title:         t.cravings,
      subtitle:      t.cravingsSubtitle    ?? '0 = no cravings   5 = overwhelming',
      illustration:  <IllustrationCravings />,
      content: (
        <ScaleDots values={[0,1,2,3,4,5]}
          value={cravings} onChange={setCravings} colors={CRAVING_COLORS} />
      ),
    },
    {
      key:           'mood',
      title:         `${t.mood} & ${t.wellbeing}`,
      subtitle:      t.moodSubtitle        ?? '1 = very bad   5 = very good',
      illustration:  <IllustrationMood />,
      content: (
        <View style={{ gap: 28 }}>
          <View>
            <Text style={s.scaleLabel}>
              {t.mood}{mood != null ? `  —  ${mood}/5` : ''}
            </Text>
            <ScaleDots values={[1,2,3,4,5]} value={mood}
              onChange={setMood} colors={MOOD_COLORS} />
          </View>
          <View>
            <Text style={s.scaleLabel}>
              {t.wellbeing}{wellbeing != null ? `  —  ${wellbeing}/5` : ''}
            </Text>
            <ScaleDots values={[1,2,3,4,5]} value={wellbeing}
              onChange={setWellbeing} colors={MOOD_COLORS} />
          </View>
        </View>
      ),
    },
    {
      key:           'sideEffects',
      title:         t.sideEffects,
      subtitle:      t.sideEffectsSubtitle ?? 'Any side effects today?',
      illustration:  <IllustrationSideEffects />,
      content: (
        <Chips options={SIDE_EFFECTS} selected={sideEffects}
          onToggle={v => toggle(setSideEffects, v)} labelFn={v => t[v] ?? v} />
      ),
    },
    {
      key:           'medications',
      title:         t.myMedications,
      subtitle:      t.medicationsSubtitle ?? 'Which medications did you take today?',
      illustration:  <IllustrationMedication />,
      content: (
        <View style={{ gap: 10 }}>
          {savedMeds.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ color: TEXT_MUTED, fontSize: FontSize.sm, textAlign: 'center' }}>
                {t.noMedsSaved ?? 'No medications saved yet. Add them in the Medications screen.'}
              </Text>
            </View>
          ) : (
            savedMeds.map(med => {
              const taken  = medsTaken.find(m => m.id === med._id);
              const active = !!taken;
              return (
                <View key={med._id} style={{
                  borderRadius: Radius.md, borderWidth: 1.5,
                  borderColor: active ? ACCENT : BORDER,
                  backgroundColor: active ? ACCENT + '10' : BG_SECONDARY,
                  overflow: 'hidden',
                }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center',
                      padding: Spacing.md, gap: 12 }}
                    onPress={() => toggleMed(med)}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 24, height: 24, borderRadius: 12, borderWidth: 2,
                      borderColor: active ? ACCENT : BORDER,
                      backgroundColor: active ? ACCENT : 'transparent',
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      {active && <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: TEXT, fontSize: FontSize.md,
                        fontWeight: active ? '700' : '500' }}>
                        {med.name}
                      </Text>
                      {med.dosage ? (
                        <Text style={{ color: TEXT_MUTED, fontSize: FontSize.sm }}>
                          {med.dosage}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                  {active && (
                    <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
                      <TextInput
                        style={{
                          backgroundColor: BG, borderRadius: Radius.sm,
                          borderWidth: 1, borderColor: BORDER,
                          paddingHorizontal: 12, paddingVertical: 8,
                          color: TEXT, fontSize: FontSize.sm,
                        }}
                        value={taken.dosage}
                        onChangeText={v => updateDosage(med._id, v)}
                        placeholder={t.dosageTaken ?? 'Dosage taken today (e.g. 8mg)'}
                        placeholderTextColor={TEXT_MUTED}
                        selectionColor={ACCENT}
                      />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      ),
    },
    {
      key:           'note',
      title:         t.note,
      subtitle:      t.notePlaceholder,
      illustration:  <IllustrationNote />,
      content: (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TextInput style={s.noteInput} value={note} onChangeText={setNote}
            placeholder={t.notePlaceholder} placeholderTextColor={TEXT_MUTED}
            multiline numberOfLines={5} textAlignVertical="top" selectionColor={ACCENT} />
        </KeyboardAvoidingView>
      ),
    },
    {
      key:           'weight',
      title:         t.weight,
      subtitle:      t.weightSubtitle      ?? 'Optional — log your weight today',
      illustration:  <IllustrationWeight />,
      content: (
        <View style={{ alignItems: 'center' }}>
          <TextInput style={s.weightInput} value={weight} onChangeText={setWeight}
            placeholder="70" placeholderTextColor={TEXT_MUTED}
            keyboardType="decimal-pad" selectionColor={ACCENT} />
          <Text style={s.weightUnit}>kg</Text>
        </View>
      ),
    },
  ];

  const totalSteps  = STEPS.length;
  const currentStep = STEPS[step];

  const animateSlide = (dir) => {
    slideAnim.setValue(dir * width);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 100, friction: 15,
    }).start();
  };

  const goNext = async () => {
    if (step < totalSteps - 1) {
      animateSlide(1);
      setStep(s => s + 1);
    } else {
      await handleSave();
    }
  };

  const goBack = () => {
    if (step > 0) { animateSlide(-1); setStep(s => s - 1); }
    else navigation.goBack();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLog({
        date: today, substances, frequency,
        ...(amount    != null ? { amount }    : {}),
        ...(cravings  != null ? { cravings }  : {}),
        ...(mood      != null ? { mood }      : {}),
        ...(wellbeing != null ? { wellbeing } : {}),
        sideEffects, medicationsTaken: medsTaken, note: note.trim(),
        ...(weight ? { weight: parseFloat(weight) } : {}),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert(t.error, e?.message ?? t.errorSave);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t.deleteLog, t.deleteLogConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        try { await deleteLog(today); navigation.goBack(); }
        catch { Alert.alert(t.error, t.errorSave); }
      }},
    ]);
  };

  const displayDate = new Date(today).toLocaleDateString(undefined,
    { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={s.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Top bar */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={goBack} style={s.topBtn}>
            <Text style={s.topBtnText}>{step === 0 ? '✕' : '‹'}</Text>
          </TouchableOpacity>

          <View style={s.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[s.dot,
                i === step && { width: 20, backgroundColor: ACCENT },
                i <  step  && { backgroundColor: ACCENT, opacity: 0.35 },
                i >  step  && { backgroundColor: BORDER },
              ]} />
            ))}
          </View>

          {isEdit
            ? <TouchableOpacity onPress={handleDelete} style={s.topBtn}>
                <Text style={s.topBtnText}>🗑</Text>
              </TouchableOpacity>
            : <View style={s.topBtn} />
          }
        </View>

        <Text style={s.dateText}>{displayDate}</Text>

        {/* Slide */}
        <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: slideAnim }] }]}>
          <View style={s.illustrationWrap}>
            {currentStep.illustration}
          </View>
          <Text style={s.stepTitle}>{currentStep.title}</Text>
          <Text style={s.stepSubtitle}>{currentStep.subtitle}</Text>
          <ScrollView contentContainerStyle={s.contentArea}
            showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {currentStep.content}
          </ScrollView>
        </Animated.View>

        {/* Bottom bar */}
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={s.stepCounter}>{step + 1} / {totalSteps}</Text>
          <TouchableOpacity style={s.nextBtn} onPress={goNext}
            disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.nextBtnText}>
                  {step === totalSteps - 1 ? t.save : `${t.next} →`}
                </Text>
            }
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: BG },
  topBar:           { flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  topBtn:           { width: 40, alignItems: 'center' },
  topBtnText:       { color: ACCENT, fontSize: 24, fontWeight: '600' },
  dots:             { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  dot:              { height: 7, width: 7, borderRadius: 3.5 },
  dateText:         { color: TEXT_MUTED, fontSize: FontSize.sm, textAlign: 'center', marginBottom: 4 },
  illustrationWrap: { alignItems: 'center', paddingVertical: Spacing.sm },
  stepTitle:        { fontSize: FontSize.xl, fontWeight: '800', color: TEXT,
                      textAlign: 'center', marginBottom: 6 },
  stepSubtitle:     { fontSize: FontSize.sm, color: TEXT_MUTED,
                      textAlign: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  contentArea:      { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  scaleLabel:       { color: TEXT, fontSize: FontSize.sm, fontWeight: '600',
                      textAlign: 'center', marginBottom: 12 },
  noteInput:        { backgroundColor: BG_SECONDARY, borderRadius: Radius.lg,
                      padding: Spacing.md, color: TEXT, fontSize: FontSize.md,
                      minHeight: 120, borderWidth: 1.5, borderColor: BORDER, lineHeight: 22 },
  weightInput:      { backgroundColor: BG_SECONDARY, borderRadius: Radius.xl,
                      width: 140, height: 140, textAlign: 'center',
                      color: TEXT, fontSize: 48, fontWeight: '800',
                      borderWidth: 2, borderColor: BORDER },
  weightUnit:       { color: TEXT_MUTED, fontSize: FontSize.lg, marginTop: Spacing.sm, fontWeight: '600' },
  bottomBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
                      borderTopWidth: 1, borderTopColor: BORDER },
  stepCounter:      { color: TEXT_MUTED, fontSize: FontSize.sm, fontWeight: '600' },
  nextBtn:          { backgroundColor: ACCENT, paddingHorizontal: 28, paddingVertical: 14,
                      borderRadius: 30, minWidth: 120, alignItems: 'center',
                      shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 10,
                      shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  nextBtnText:      { fontSize: FontSize.md, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
