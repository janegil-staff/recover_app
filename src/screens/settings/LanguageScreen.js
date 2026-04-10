// src/screens/settings/LanguageScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { patientApi } from '../../services/api';
import { FontSize, Spacing, Radius } from '../../constants/theme';

const LANGUAGES = [
  { code: 'en', label: 'English',     nativeLabel: 'English',     flag: '🇬🇧' },
  { code: 'no', label: 'Norwegian',   nativeLabel: 'Norsk',       flag: '🇳🇴' },
  { code: 'de', label: 'German',      nativeLabel: 'Deutsch',     flag: '🇩🇪' },
  { code: 'da', label: 'Danish',      nativeLabel: 'Dansk',       flag: '🇩🇰' },
  { code: 'sv', label: 'Swedish',     nativeLabel: 'Svenska',     flag: '🇸🇪' },
  { code: 'fi', label: 'Finnish',     nativeLabel: 'Suomi',       flag: '🇫🇮' },
  { code: 'fr', label: 'French',      nativeLabel: 'Français',    flag: '🇫🇷' },
  { code: 'es', label: 'Spanish',     nativeLabel: 'Español',     flag: '🇪🇸' },
  { code: 'it', label: 'Italian',     nativeLabel: 'Italiano',    flag: '🇮🇹' },
  { code: 'nl', label: 'Dutch',       nativeLabel: 'Nederlands',  flag: '🇳🇱' },
  { code: 'pl', label: 'Polish',      nativeLabel: 'Polski',      flag: '🇵🇱' },
  { code: 'pt', label: 'Portuguese',  nativeLabel: 'Português',   flag: '🇵🇹' },
];

export default function LanguageScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const { theme }            = useTheme();
  const { t, setLang }       = useLang();
  const insets               = useSafeAreaInsets();

  const [selected, setSelected] = useState(user?.language ?? 'en');
  const [saving,   setSaving]   = useState(false);

  const handleSelect = async (code) => {
    if (code === selected) return;
    setSelected(code);
    setLang(code); // immediately switch UI language
    setSaving(true);
    try {
      // Save to backend via auth profile update
      await patientApi.updateProfile({ language: code });
      updateUser({ ...user, language: code });
    } catch {
      Alert.alert('Error', 'Could not save language.');
      setSelected(user?.language ?? 'en');
      setLang(user?.language ?? 'en');
    } finally {
      setSaving(false);
    }
  };

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>
      <View style={[s.header, { backgroundColor: theme.accent, paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.languageTitle}</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((lang, index) => {
          const isSelected = lang.code === selected;
          const isLast     = index === LANGUAGES.length - 1;
          return (
            <TouchableOpacity key={lang.code}
              style={[s.row, isLast && s.rowLast]}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.7} disabled={saving}>
              <View style={[s.radio, isSelected && { borderColor: theme.accent }]}>
                {isSelected && <View style={[s.radioDot, { backgroundColor: theme.accent }]} />}
              </View>
              <Text style={s.flag}>{lang.flag}</Text>
              <View style={s.labelWrap}>
                <Text style={[s.langLabel, { color: theme.text }]}>{lang.nativeLabel}</Text>
                {lang.nativeLabel !== lang.label && (
                  <Text style={[s.langSub, { color: theme.textMuted }]}>{lang.label}</Text>
                )}
              </View>
              {isSelected && saving && (
                <Text style={{ color: theme.textMuted, fontSize: FontSize.sm }}>...</Text>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root:      { flex: 1, backgroundColor: t.bgSecondary ?? '#F0F4F8' },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerBtn: { width: 40 },
  headerBack:{ color: '#fff', fontSize: 28, lineHeight: 34 },
  headerTitle:{ flex: 1, color: '#fff', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },
  list:      { backgroundColor: t.bg ?? '#fff', marginTop: Spacing.lg },
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl, backgroundColor: t.bg ?? '#fff',
    borderBottomWidth: 1, borderBottomColor: t.border },
  rowLast:   { borderBottomWidth: 0 },
  radio:     { width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: t.border, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  radioDot:  { width: 11, height: 11, borderRadius: 6 },
  flag:      { fontSize: 26, marginRight: Spacing.md },
  labelWrap: { flex: 1 },
  langLabel: { fontSize: FontSize.md, fontWeight: '500' },
  langSub:   { fontSize: FontSize.sm, marginTop: 1 },
});
