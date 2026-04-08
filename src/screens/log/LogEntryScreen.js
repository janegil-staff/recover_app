// src/screens/log/LogEntryScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogs }  from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// 0=none(green) → 5=severe(red)
const CRAVING_COLORS = {
  0: '#22C55E', 1: '#7AABDB', 2: '#FBBF24',
  3: '#FB923C', 4: '#EF4444', 5: '#991B1B',
};
// 1=worst(red) → 5=best(green)
const MOOD_COLORS = {
  1: '#EF4444', 2: '#FB923C', 3: '#FBBF24', 4: '#7AABDB', 5: '#22C55E',
};

const SUBSTANCES  = ['alcohol','cannabis','cocaine','opioids','amphetamines','benzodiazepines','tobacco','prescription','other'];
const FREQUENCIES = ['none','once','few_times','daily','multiple_daily'];
const SIDE_EFFECTS = ['nausea','insomnia','anxiety','paranoia','headache','fatigue','appetite_loss','memory_issues','irritability','depression'];

function SectionHeader({ title, theme }) {
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm, backgroundColor: theme.bgSecondary ?? '#F0F4F8' }}>
      <Text style={{ color: theme.textMuted, fontSize: FontSize.sm,
          fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {title}
      </Text>
    </View>
  );
}

function ChipRow({ options, selected, onToggle, labelFn, theme }) {
  return (
    <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: theme.bg }}>
      {options.map(opt => {
        const active = Array.isArray(selected) ? selected.includes(opt) : selected === opt;
        return (
          <TouchableOpacity key={opt} onPress={() => onToggle(opt)} style={{
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
            borderWidth: 1.5,
            borderColor: active ? theme.accent : theme.border,
            backgroundColor: active ? theme.accent + '18' : theme.surface,
          }}>
            <Text style={{ fontSize: FontSize.sm, fontWeight: '600',
              color: active ? theme.accent : theme.textSecondary }}>
              {labelFn ? labelFn(opt) : opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ScaleRow({ label, subtitle, values, value, onChange, colors, theme }) {
  return (
    <View style={[sr.wrap, { borderBottomColor: theme.border }]}>
      <View style={sr.top}>
        <Text style={[sr.label, { color: theme.text }]}>{label}</Text>
        {value != null && (
          <View style={[sr.badge, { backgroundColor: colors?.[value] ?? theme.accent }]}>
            <Text style={sr.badgeText}>{value}</Text>
          </View>
        )}
      </View>
      {subtitle ? <Text style={[sr.sub, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      <View style={sr.dots}>
        {values.map(n => (
          <TouchableOpacity key={n} onPress={() => onChange(value === n ? null : n)}
            style={[sr.dot, {
              backgroundColor: value === n ? (colors?.[n] ?? theme.accent) : (theme.bgSecondary ?? '#F0F4F8'),
              borderColor:     value === n ? (colors?.[n] ?? theme.accent) : theme.border,
            }]}>
            <Text style={[sr.dotNum, { color: value === n ? '#FFF' : theme.textMuted }]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const sr = StyleSheet.create({
  wrap:      { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  top:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  label:     { fontSize: FontSize.md, fontWeight: '500', flex: 1 },
  badge:     { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, overflow: 'hidden' },
  badgeText: { color: '#FFF', fontSize: FontSize.xs, fontWeight: '700' },
  sub:       { fontSize: FontSize.xs, marginBottom: Spacing.sm },
  dots:      { flexDirection: 'row', gap: 6, marginTop: Spacing.sm, flexWrap: 'wrap' },
  dot:       { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dotNum:    { fontSize: FontSize.sm, fontWeight: '600' },
});

export default function LogEntryScreen({ navigation, route }) {
  const { date, log: existingLog } = route?.params ?? {};
  const { theme }  = useTheme();
  const { t }      = useLang();
  const { saveLog, deleteLog } = useLogs();
  const insets     = useSafeAreaInsets();
  const isEdit     = !!existingLog;
  const today      = date ?? new Date().toISOString().slice(0, 10);

  const [substances,  setSubstances]  = useState(existingLog?.substances  ?? []);
  const [frequency,   setFrequency]   = useState(existingLog?.frequency   ?? 'none');
  const [amount,      setAmount]      = useState(existingLog?.amount      ?? null);
  const [cravings,    setCravings]    = useState(existingLog?.cravings    ?? null);
  const [mood,        setMood]        = useState(existingLog?.mood        ?? null);
  const [wellbeing,   setWellbeing]   = useState(existingLog?.wellbeing   ?? null);
  const [sideEffects, setSideEffects] = useState(existingLog?.sideEffects ?? []);
  const [note,        setNote]        = useState(existingLog?.note        ?? '');
  const [weight,      setWeight]      = useState(existingLog?.weight ? String(existingLog.weight) : '');
  const [saving,      setSaving]      = useState(false);

  const toggle = (setter, val) =>
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const displayDate = new Date(today).toLocaleDateString(undefined,
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLog({
        date: today, substances, frequency,
        ...(amount   != null ? { amount }   : {}),
        ...(cravings != null ? { cravings } : {}),
        ...(mood     != null ? { mood }     : {}),
        ...(wellbeing!= null ? { wellbeing }: {}),
        sideEffects, note: note.trim(),
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
    Alert.alert(t.deleteLog ?? 'Slett logg', t.deleteLogConfirm ?? 'Er du sikker?', [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete ?? 'Slett', style: 'destructive', onPress: async () => {
        try { await deleteLog(today); navigation.goBack(); }
        catch { Alert.alert(t.error, 'Kunne ikke slette.'); }
      }},
    ]);
  };

  const s = makeStyles(theme, insets);

  const amountColors = Object.fromEntries(
    Array.from({length: 11}, (_, n) => [n, `hsl(${120 - n * 12},65%,45%)`])
  );

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>

      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{isEdit ? t.editLog ?? t.dailyLog : t.dailyLog}</Text>
          <Text style={s.headerDate}>{displayDate}</Text>
        </View>
        {isEdit
          ? <TouchableOpacity onPress={handleDelete} style={s.headerBtn}>
              <Text style={s.headerDelete}>🗑</Text>
            </TouchableOpacity>
          : <View style={s.headerBtn} />
        }
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <SectionHeader title={t.substancesUsed} theme={theme} />
        <ChipRow options={SUBSTANCES} selected={substances}
          onToggle={v => toggle(setSubstances, v)} labelFn={v => t[v] ?? v} theme={theme} />

        <SectionHeader title={t.frequency} theme={theme} />
        <ChipRow options={FREQUENCIES} selected={[frequency]}
          onToggle={v => setFrequency(v)} labelFn={v => t[v] ?? v} theme={theme} />

        <SectionHeader title={t.amount} theme={theme} />
        <View style={{ backgroundColor: theme.bg }}>
          <ScaleRow label={t.amount} subtitle="0 – 10"
            values={[0,1,2,3,4,5,6,7,8,9,10]} value={amount} onChange={setAmount}
            colors={amountColors} theme={theme} />
        </View>

        <SectionHeader title={t.cravings} theme={theme} />
        <View style={{ backgroundColor: theme.bg }}>
          <ScaleRow label={t.cravings} subtitle="0 = ingen, 5 = kraftig sug"
            values={[0,1,2,3,4,5]} value={cravings} onChange={setCravings}
            colors={CRAVING_COLORS} theme={theme} />
        </View>

        <SectionHeader title={`${t.mood} & ${t.wellbeing}`} theme={theme} />
        <View style={{ backgroundColor: theme.bg }}>
          <ScaleRow label={t.mood} subtitle="1 = veldig dårlig, 5 = veldig bra"
            values={[1,2,3,4,5]} value={mood} onChange={setMood}
            colors={MOOD_COLORS} theme={theme} />
          <ScaleRow label={t.wellbeing} subtitle="1 = veldig dårlig, 5 = veldig bra"
            values={[1,2,3,4,5]} value={wellbeing} onChange={setWellbeing}
            colors={MOOD_COLORS} theme={theme} />
        </View>

        <SectionHeader title={t.sideEffects} theme={theme} />
        <ChipRow options={SIDE_EFFECTS} selected={sideEffects}
          onToggle={v => toggle(setSideEffects, v)} labelFn={v => t[v] ?? v} theme={theme} />

        <SectionHeader title={t.note} theme={theme} />
        <View style={[s.section, { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }]}>
          <TextInput style={[s.noteInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
            value={note} onChangeText={setNote} placeholder={t.notePlaceholder}
            placeholderTextColor={theme.textMuted} multiline numberOfLines={4}
            textAlignVertical="top" selectionColor={theme.accent} />
        </View>

        <SectionHeader title={t.weight} theme={theme} />
        <View style={[s.section, { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }]}>
          <TextInput style={[s.noteInput, { color: theme.text, borderColor: theme.border,
              backgroundColor: theme.bg, minHeight: 48 }]}
            value={weight} onChangeText={setWeight} placeholder="70"
            placeholderTextColor={theme.textMuted} keyboardType="decimal-pad" />
        </View>

      </ScrollView>

      <View style={[s.bottomWrap, { paddingBottom: (insets.bottom || 16) + Spacing.md }]}>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.88} style={s.saveBtn} disabled={saving}>
          <View style={[s.saveBtnInner, { backgroundColor: theme.accent }]}>
            {saving
              ? <ActivityIndicator color="#FFF" />
              : <Text style={s.saveBtnText}>{t.save}</Text>
            }
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root:         { flex: 1, backgroundColor: t.bgSecondary ?? '#F0F4F8' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
                  paddingBottom: Spacing.lg, backgroundColor: t.accent },
  headerBtn:    { width: 40 },
  headerBack:   { color: '#FFF', fontSize: 28, lineHeight: 34 },
  headerDelete: { fontSize: 20, textAlign: 'right' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { color: '#FFF', fontSize: FontSize.lg, fontWeight: '600' },
  headerDate:   { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs, marginTop: 2 },
  section:      { backgroundColor: t.bg ?? '#FFFFFF' },
  noteInput:    { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md,
                  fontSize: FontSize.md, minHeight: 80, lineHeight: 22 },
  bottomWrap:   { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
                  backgroundColor: t.bg ?? '#FFFFFF', borderTopWidth: 1, borderTopColor: t.border },
  saveBtn:      { width: '100%', height: 46, borderRadius: 8, borderWidth: 1,
                  borderColor: t.accentBorder ?? t.accent, overflow: 'hidden' },
  saveBtnInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:  { color: '#FFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1.5 },
});
