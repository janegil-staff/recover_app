// src/screens/log/LogEntryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme }   from '../../context/ThemeContext';
import { useLang }    from '../../context/LangContext';
import { usePatient } from '../../context/PatientContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const SUBSTANCES = [
  'alcohol','cannabis','cocaine','opioids',
  'amphetamines','benzodiazepines','tobacco','prescription','other',
];

const FREQUENCIES = ['none','once','few_times','daily','multiple_daily'];

const SIDE_EFFECTS = [
  'nausea','insomnia','anxiety','paranoia','headache',
  'fatigue','appetite_loss','memory_issues','irritability','depression',
];

function SectionLabel({ text, theme }) {
  return (
    <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, fontWeight: '700',
      letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.lg }}>
      {text}
    </Text>
  );
}

function ChipRow({ options, selected, onToggle, labelFn, activeColor, theme }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        const color  = activeColor ?? theme.accent;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onToggle(opt)}
            style={{
              paddingHorizontal: 14, paddingVertical: 8,
              borderRadius: Radius.full, borderWidth: 1.5,
              borderColor: active ? color : theme.border,
              backgroundColor: active ? color + '18' : theme.surface,
            }}
          >
            <Text style={{ fontSize: FontSize.sm, fontWeight: '600',
              color: active ? color : theme.textSecondary }}>
              {labelFn ? labelFn(opt) : opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ScaleRow({ max, value, onChange, colors, theme }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const active = value === n;
        const col = colors?.[i] ?? theme.accent;
        return (
          <TouchableOpacity
            key={n}
            onPress={() => onChange(n)}
            style={{
              flex: 1, height: 44, borderRadius: Radius.md,
              borderWidth: active ? 1.5 : 1,
              borderColor: active ? col : theme.border,
              backgroundColor: active ? col + '22' : theme.surface,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: FontSize.lg, fontWeight: '700',
              color: active ? col : theme.textSecondary }}>{n}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function LogEntryScreen({ navigation, route }) {
  const { theme }      = useTheme();
  const { t }          = useLang();
  const { saveRecord, getRecordForDate } = usePatient();

  const today    = getToday();
  const existing = getRecordForDate(today);

  const [substances,  setSubstances]  = useState(existing?.substances  ?? []);
  const [frequency,   setFrequency]   = useState(existing?.frequency   ?? 'none');
  const [amount,      setAmount]      = useState(existing?.amount      ?? 0);
  const [cravings,    setCravings]    = useState(existing?.cravings    ?? 0);
  const [mood,        setMood]        = useState(existing?.mood        ?? 3);
  const [wellbeing,   setWellbeing]   = useState(existing?.wellbeing   ?? 3);
  const [sideEffects, setSideEffects] = useState(existing?.sideEffects ?? []);
  const [note,        setNote]        = useState(existing?.note        ?? '');
  const [weight,      setWeight]      = useState(existing?.weight?.toString() ?? '');
  const [saving,      setSaving]      = useState(false);

  const toggleList = (setter, val) =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const moodColors    = [theme.scoreLow, theme.scoreLow, theme.scoreMid, theme.scoreHigh, theme.scoreHigh];
  const cravingColors = ['#a8d5a2','#c5e5a0','#f5e27a','#f5c97a','#f4a07a','#e87070'];

  const save = async () => {
    setSaving(true);
    try {
      await saveRecord({
        date:        today,
        substances,
        frequency,
        amount,
        cravings,
        mood,
        wellbeing,
        sideEffects,
        note,
        ...(weight ? { weight: parseFloat(weight) } : {}),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert(t.error ?? 'Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.dailyLog ?? 'Daily Log'} — {today}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <SectionLabel text={t.substancesUsed ?? 'Substances used'} theme={theme} />
          <ChipRow
            options={SUBSTANCES} selected={substances}
            onToggle={v => toggleList(setSubstances, v)}
            labelFn={v => t[v] ?? v}
            theme={theme}
          />

          <SectionLabel text={t.frequency ?? 'Frequency today'} theme={theme} />
          <ChipRow
            options={FREQUENCIES} selected={[frequency]}
            onToggle={v => setFrequency(v)}
            labelFn={v => t[v] ?? v}
            theme={theme}
          />

          <SectionLabel text={`${t.amount ?? 'Amount'} — ${amount}/10`} theme={theme} />
          <View style={s.sliderRow}>
            <Text style={s.sliderLabel}>0</Text>
            <View style={s.sliderDots}>
              {Array.from({ length: 11 }, (_, i) => (
                <TouchableOpacity key={i} onPress={() => setAmount(i)}
                  style={[s.dot, i <= amount && { backgroundColor: theme.accent }]} />
              ))}
            </View>
            <Text style={s.sliderLabel}>10</Text>
          </View>

          <SectionLabel text={`${t.cravings ?? 'Cravings'} — ${cravings}/5`} theme={theme} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0,1,2,3,4,5].map(n => {
              const active = cravings === n;
              const col = cravingColors[n];
              return (
                <TouchableOpacity key={n} onPress={() => setCravings(n)}
                  style={{ flex: 1, height: 44, borderRadius: Radius.md, borderWidth: active ? 1.5 : 1,
                    borderColor: active ? col : theme.border,
                    backgroundColor: active ? col + '33' : theme.surface,
                    justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: active ? col : theme.textSecondary }}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SectionLabel text={`${t.mood ?? 'Mood'} — ${mood}/5`} theme={theme} />
          <ScaleRow max={5} value={mood} onChange={setMood} colors={moodColors} theme={theme} />

          <SectionLabel text={`${t.wellbeing ?? 'Wellbeing'} — ${wellbeing}/5`} theme={theme} />
          <ScaleRow max={5} value={wellbeing} onChange={setWellbeing} colors={moodColors} theme={theme} />

          <SectionLabel text={t.sideEffects ?? 'Side effects'} theme={theme} />
          <ChipRow
            options={SIDE_EFFECTS} selected={sideEffects}
            onToggle={v => toggleList(setSideEffects, v)}
            labelFn={v => t[v] ?? v}
            theme={theme}
          />

          <SectionLabel text={t.note ?? 'Note'} theme={theme} />
          <TextInput
            style={[s.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            value={note}
            onChangeText={setNote}
            placeholder={t.notePlaceholder ?? 'How was your day?'}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
          />

          <SectionLabel text={t.weight ?? 'Weight (kg)'} theme={theme} />
          <TextInput
            style={[s.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
          />

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: theme.accent }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>
            {saving ? (t.saving ?? 'Saving…') : (t.save ?? 'Save')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t) => StyleSheet.create({
  safe:       { flex: 1, backgroundColor: t.bg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
                backgroundColor: t.accent },
  backBtn:    { width: 40, justifyContent: 'center' },
  backArrow:  { color: '#fff', fontSize: 34, lineHeight: 40 },
  headerTitle:{ color: '#fff', fontSize: FontSize.md, fontWeight: '700', flex: 1, textAlign: 'center' },
  scroll:     { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  sliderRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderLabel:{ color: t.textMuted, fontSize: FontSize.sm, width: 16, textAlign: 'center' },
  sliderDots: { flex: 1, flexDirection: 'row', gap: 4 },
  dot:        { flex: 1, height: 10, borderRadius: 5, backgroundColor: t.border },
  textArea:   { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md,
                fontSize: FontSize.md, minHeight: 80, textAlignVertical: 'top' },
  input:      { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md,
                fontSize: FontSize.md, height: 48 },
  footer:     { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  saveBtn:    { height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:{ color: '#fff', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
