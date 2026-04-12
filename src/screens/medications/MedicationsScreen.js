// src/screens/medications/MedicationsScreen.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { patientApi } from '../../services/api';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// ── Common recovery medications ───────────────────────────────────────────────
const PRESET_MEDICATIONS = [
  { id: 'methadone',       name: 'Metadon',         brand: 'Metadone' },
  { id: 'buprenorphine',   name: 'Buprenorfin',      brand: 'Subutex, Suboxone' },
  { id: 'naltrexone',      name: 'Naltrexon',        brand: 'Revia, Vivitrol' },
  { id: 'naloxone',        name: 'Nalokson',         brand: 'Narcan, Nyxoid' },
  { id: 'acamprosate',     name: 'Akamprosat',       brand: 'Campral' },
  { id: 'disulfiram',      name: 'Disulfiram',       brand: 'Antabus' },
  { id: 'gabapentin',      name: 'Gabapentin',       brand: 'Neurontin' },
  { id: 'pregabalin',      name: 'Pregabalin',       brand: 'Lyrica' },
  { id: 'baclofen',        name: 'Baklofen',         brand: 'Lioresal' },
  { id: 'clonidine',       name: 'Klonidin',         brand: 'Catapres' },
  { id: 'diazepam',        name: 'Diazepam',         brand: 'Valium, Stesolid' },
  { id: 'antidepressant',  name: 'Antidepressiva',   brand: 'SSRI/SNRI' },
  { id: 'antipsychotic',   name: 'Antipsykotika',    brand: '' },
  { id: 'vivitrol',         name: 'Vivitrol',         brand: 'Naltrexon injeksjon (månedlig)' },
  { id: 'buvidal_weekly',   name: 'Buvidal Ukentlig',  brand: 'Buprenorfin depot' },
  { id: 'buvidal_monthly',  name: 'Buvidal Månedlig',  brand: 'Buprenorfin depot' },
  { id: 'sublocade',        name: 'Sublocade',          brand: 'Buprenorfin injeksjon (månedlig)' },
  { id: 'other',            name: 'Annet',              brand: '' },
];

function getFrequencies(t) {
  return [
    { id: 'daily',             label: t.freqDaily            ?? 'Once daily' },
    { id: 'twice_daily',       label: t.freqTwiceDaily       ?? 'Twice daily' },
    { id: 'three_times_daily', label: t.freqThreeTimesDaily  ?? '3× daily' },
    { id: 'weekly',            label: t.freqWeekly           ?? 'Weekly' },
    { id: 'biweekly',          label: t.freqBiweekly         ?? 'Every 2 weeks' },
    { id: 'monthly_injection', label: t.freqMonthlyInjection ?? 'Monthly injection' },
    { id: 'as_needed',         label: t.freqAsNeeded         ?? 'As needed' },
  ];
}

const EMPTY_FORM = {
  name: '', dosage: '', frequency: 'daily',
  startDate: new Date().toISOString().slice(0, 10),
  prescribedBy: '', notes: '',
};

export default function MedicationsScreen({ navigation }) {
  const { theme }  = useTheme();
  const { t }      = useLang();

  const [selected,   setSelected]   = useState(new Set());
  const [custom,     setCustom]     = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  const load = async () => {
    try {
      const [meds, profileRes] = await Promise.all([
        patientApi.getMedications(),
        patientApi.get(),
      ]);
      setCustom(meds ?? []);
      const savedIds = (profileRes?.medicines ?? [])
        .map(m => m.id ?? m.name)
        .filter(Boolean);
      if (savedIds.length > 0) setSelected(new Set(savedIds));
    } catch (e) {
      console.log('Load medications error:', e?.message);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

  const FREQUENCIES = getFrequencies(t);
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PRESET_MEDICATIONS;
    return PRESET_MEDICATIONS.filter(
      m => m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
    );
  }, [search]);

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const save = async () => {
    setSaving(true);
    try {
      await patientApi.saveMedBulk([...selected]);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Feil', e?.message ?? 'Kunne ikke lagre medisiner.');
    } finally {
      setSaving(false);
    }
  };

  const submitCustom = async () => {
    if (!form.name.trim())   return Alert.alert('Påkrevd', 'Skriv inn medikamentnavn.');
    if (!form.dosage.trim()) return Alert.alert('Påkrevd', 'Skriv inn dosering.');
    setSubmitting(true);
    try {
      const saved = await patientApi.addMedication({
        name:         form.name.trim(),
        dosage:       form.dosage.trim(),
        frequency:    form.frequency,
        startDate:    form.startDate,
        prescribedBy: form.prescribedBy.trim(),
        notes:        form.notes.trim(),
      });
      setCustom(prev => [saved, ...prev]);
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch (e) {
      Alert.alert('Feil', e?.message ?? 'Kunne ikke legge til medisin.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCustom = (id, name) => {
    Alert.alert('Fjern medisin', `Fjerne "${name}"?`, [
      { text: t.cancel, style: 'cancel' },
      { text: 'Fjern', style: 'destructive', onPress: async () => {
        try {
          await patientApi.deleteMedication(id);
          setCustom(prev => prev.filter(m => m._id !== id));
        } catch {
          Alert.alert('Feil', 'Kunne ikke fjerne medisin.');
        }
      }},
    ]);
  };

  const s = makeStyles(theme);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>‹</Text>
          </TouchableOpacity>
          <Text style={s.title}>Medisiner</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>Medisiner</Text>
        <TouchableOpacity onPress={save} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={theme.accent} />
            : <Text style={s.saveBtn}>Lagre</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── My custom medications ─────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Mine medisiner</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={s.addBtnText}>Legg til</Text>
            </TouchableOpacity>
          </View>

          {custom.length === 0 ? (
            <View style={s.emptyBox}>
              <Ionicons name="medkit-outline" size={28} color={theme.textMuted} />
              <Text style={s.emptyText}>Ingen medisiner lagt til ennå</Text>
            </View>
          ) : (
            custom.map(med => (
              <View key={med._id} style={s.customRow}>
                <View style={s.customIcon}>
                  <Ionicons name="medkit" size={16} color={theme.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.customName}>{med.name}</Text>
                  <Text style={s.customMeta}>
                    {med.dosage}
                    {med.frequency
                      ? ` · ${FREQUENCIES.find(f => f.id === med.frequency)?.label ?? med.frequency}`
                      : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteCustom(med._id, med.name)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ── Preset medications ────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Vanlige medisiner ved rusmiddelbehandling</Text>
          <Text style={s.subtitle}>Velg alle medisiner du bruker for øyeblikket</Text>

          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Søk medisiner..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {selected.size > 0 && (
            <Text style={s.selectedCount}>{selected.size} valgt</Text>
          )}

          {filtered.map(item => {
            const active = selected.has(item.id);
            return (
              <TouchableOpacity key={item.id}
                style={[s.row, active && { borderColor: theme.accent, backgroundColor: theme.accentBg ?? theme.accent + '14' }]}
                onPress={() => toggle(item.id)} activeOpacity={0.7}>
                <View style={s.rowText}>
                  <Text style={[s.medName, active && { color: theme.accent, fontWeight: '600' }]}>
                    {item.name}
                  </Text>
                  {item.brand ? <Text style={s.medBrand}>{item.brand}</Text> : null}
                </View>
                <View style={[s.check,
                  active && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                  {active && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* ── Add custom medication modal ───────────────────────── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet, { backgroundColor: theme.bg }]}>
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: theme.text }]}>Legg til medisin</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <FieldLabel label="Medikamentnavn *" theme={theme} />
              <FieldInput placeholder="f.eks. Suboxone" value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))} theme={theme} />

              <FieldLabel label="Dosering *" theme={theme} />
              <FieldInput placeholder="f.eks. 8mg" value={form.dosage}
                onChangeText={v => setForm(f => ({ ...f, dosage: v }))} theme={theme} />

              <FieldLabel label="Frekvens" theme={theme} />
              <View style={s.freqRow}>
                {FREQUENCIES.map(f => (
                  <TouchableOpacity key={f.id}
                    style={[s.freqChip,
                      form.frequency === f.id && { backgroundColor: theme.accent, borderColor: theme.accent }]}
                    onPress={() => setForm(prev => ({ ...prev, frequency: f.id }))}>
                    <Text style={[s.freqText,
                      form.frequency === f.id && { color: '#fff', fontWeight: '600' }]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FieldLabel label="Startdato" theme={theme} />
              <FieldInput placeholder="ÅÅÅÅ-MM-DD" value={form.startDate}
                onChangeText={v => setForm(f => ({ ...f, startDate: v }))} theme={theme} />

              <FieldLabel label="Foreskrevet av" theme={theme} />
              <FieldInput placeholder="Legens navn (valgfritt)" value={form.prescribedBy}
                onChangeText={v => setForm(f => ({ ...f, prescribedBy: v }))} theme={theme} />

              <FieldLabel label="Notater" theme={theme} />
              <FieldInput placeholder="Eventuelle notater..." value={form.notes}
                onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                multiline style={{ height: 80, textAlignVertical: 'top' }} theme={theme} />

              <TouchableOpacity style={[s.submitBtn, { backgroundColor: theme.accent }]}
                onPress={submitCustom} disabled={submitting}>
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.submitText}>Lagre medisin</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

function FieldLabel({ label, theme }) {
  return (
    <Text style={{ color: theme.textMuted, fontSize: FontSize.sm, fontWeight: '600',
      marginBottom: 6, marginTop: Spacing.sm }}>
      {label}
    </Text>
  );
}

function FieldInput({ placeholder, value, onChangeText, multiline, style, theme }) {
  return (
    <TextInput
      style={[{
        backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
        borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        color: theme.text, fontSize: FontSize.md,
      }, style]}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      selectionColor={theme.accent}
    />
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    safe:    { flex: 1, backgroundColor: t.bg },
    centered:{ flex: 1, justifyContent: 'center', alignItems: 'center' },
    header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
               paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: t.border },
    back:    { color: t.accent, fontSize: 30, marginRight: 8 },
    title:   { color: t.text, fontSize: FontSize.lg, fontWeight: '600', flex: 1 },
    saveBtn: { color: t.accent, fontSize: FontSize.md, fontWeight: '700' },

    section:       { marginHorizontal: Spacing.lg, marginTop: Spacing.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'center',
                     justifyContent: 'space-between', marginBottom: Spacing.sm },
    sectionTitle:  { color: t.text, fontSize: FontSize.md, fontWeight: '700' },
    subtitle:      { color: t.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.sm },

    addBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: t.accent,
                  borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
    addBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },

    emptyBox:  { alignItems: 'center', paddingVertical: Spacing.lg, gap: 8 },
    emptyText: { color: t.textMuted, fontSize: FontSize.sm },

    customRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface,
                 borderRadius: Radius.md, borderWidth: 1, borderColor: t.border,
                 padding: Spacing.md, marginBottom: Spacing.xs, gap: Spacing.sm },
    customIcon:{ width: 32, height: 32, borderRadius: 16,
                 backgroundColor: t.accentBg ?? t.accent + '18',
                 alignItems: 'center', justifyContent: 'center' },
    customName:{ color: t.text, fontSize: FontSize.md, fontWeight: '600' },
    customMeta:{ color: t.textMuted, fontSize: FontSize.sm, marginTop: 2 },

    searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: t.surface,
                  borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
                  borderWidth: 1, borderColor: t.border, marginBottom: Spacing.sm },
    searchInput:{ flex: 1, color: t.text, fontSize: FontSize.md, padding: 0 },
    selectedCount: { color: t.accent, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },

    row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
                paddingHorizontal: Spacing.md, marginBottom: Spacing.xs,
                borderRadius: Radius.md, backgroundColor: t.surface,
                borderWidth: 1, borderColor: t.border },
    rowText:  { flex: 1 },
    medName:  { color: t.text, fontSize: FontSize.md, fontWeight: '500' },
    medBrand: { color: t.textMuted, fontSize: FontSize.sm, marginTop: 2 },
    check:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                borderColor: t.border, alignItems: 'center', justifyContent: 'center' },

    overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet:      { borderTopLeftRadius: 20, borderTopRightRadius: 20,
                  padding: Spacing.lg, maxHeight: '90%', paddingBottom: 40 },
    sheetHeader:{ flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: Spacing.lg },
    sheetTitle: { fontSize: FontSize.lg, fontWeight: '700' },

    freqRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.xs },
    freqChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                borderWidth: 1, borderColor: t.border, backgroundColor: t.surface },
    freqText: { color: t.textMuted, fontSize: FontSize.sm },

    submitBtn:  { borderRadius: Radius.md, padding: Spacing.md,
                  alignItems: 'center', marginTop: Spacing.lg },
    submitText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  });
}
