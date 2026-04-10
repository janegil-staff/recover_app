// src/screens/profile/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useAuth }    from '../../context/AuthContext';
import { useTheme }   from '../../context/ThemeContext';
import { useLang }    from '../../context/LangContext';
import { patientApi } from '../../services/api';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// ── Gender SVG icons ──────────────────────────────────────────────────────────
function FemaleSvg({ color, size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="14" r="8" stroke={color} strokeWidth="2" />
      <Path d="M16 14 Q16 6 24 6 Q32 6 32 14" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M10 38 C10 28 38 28 38 38" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M17 26 L14 38 M31 26 L34 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
function MaleSvg({ color, size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Circle cx="24" cy="14" r="8" stroke={color} strokeWidth="2" />
      <Path d="M10 38 C10 28 38 28 38 38" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M20 26 L24 30 L28 26" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
function UndefinedSvg({ color, size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M20 18 C20 14 28 14 28 19 C28 22 24 23 24 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Circle cx="24" cy="31" r="1.5" fill={color} />
    </Svg>
  );
}
function LogoutIcon({ color = '#fff', size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17l5-5-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

const GENDERS = [
  { value: 'female',    labelKey: 'female',    Svg: FemaleSvg    },
  { value: 'male',      labelKey: 'male',      Svg: MaleSvg      },
  { value: 'undefined', labelKey: 'undefined', Svg: UndefinedSvg },
];

function Row({ label, value, onPress, theme, last }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 15, paddingHorizontal: Spacing.lg,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border,
    }}>
      <Text style={{ color: theme.text,     fontSize: FontSize.md }}>{label}</Text>
      <Text style={{ color: theme.textMuted,fontSize: FontSize.md }}>{value} ›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, logoutAndClearPin, updateUser, savePin } = useAuth();
  const { theme, override, setTheme } = useTheme();
  const { t }      = useLang();
  const insets     = useSafeAreaInsets();

  const [gender,    setGender]    = useState(user?.gender ?? 'undefined');
  const [ageVal,    setAgeVal]    = useState(String(user?.age ?? ''));
  const [heightVal, setHeightVal] = useState(String(user?.height ?? ''));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientApi.get().then(data => {
      if (data) {
        setGender(data.gender ?? 'undefined');
        setAgeVal(String(data.age ?? ''));
        setHeightVal(String(data.height ?? ''));
      }
    }).catch(() => {});
  }, []);

  // Receive PIN back from PinSetup
  useEffect(() => {
    const newPin = navigation.getState?.()?.routes?.slice(-1)[0]?.params?.pin;
    if (newPin) {
      savePin(newPin).then(() => Alert.alert(t.saved, t.pinUpdated ?? 'PIN updated.'));
    }
  }, []);

  const originalAge    = String(user?.age ?? '');
  const originalGender = user?.gender ?? 'undefined';
  const isDirty        = ageVal !== originalAge || gender !== originalGender;

  const ALL_LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'no', label: 'Norsk',   flag: '🇳🇴' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'da', label: 'Dansk',   flag: '🇩🇰' },
    { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
    { code: 'fi', label: 'Suomi',   flag: '🇫🇮' },
    { code: 'fr', label: 'Français',flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'it', label: 'Italiano',flag: '🇮🇹' },
    { code: 'nl', label: 'Nederlands',flag:'🇳🇱' },
    { code: 'pl', label: 'Polski',  flag: '🇵🇱' },
    { code: 'pt', label: 'Português',flag:'🇵🇹' },
  ];
  const currentLang = ALL_LANGUAGES.find(l => l.code === (user?.language ?? 'en')) ?? ALL_LANGUAGES[0];

  const saveChanges = async () => {
    setSaving(true);
    try {
      await patientApi.updateProfile({
        ...(ageVal    ? { age:    parseInt(ageVal,    10) } : {}),
        ...(heightVal ? { height: parseInt(heightVal, 10) } : {}),
        gender,
      });
      updateUser({ age: parseInt(ageVal, 10), height: parseInt(heightVal, 10), gender });
      Alert.alert(t.saved, t.profileUpdated);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(t.saveChanges, t.unsavedChanges, [
        { text: t.cancel,  style: 'cancel' },
        { text: t.discard, style: 'destructive', onPress: () => navigation.goBack() },
        { text: t.save,    style: 'default',     onPress: async () => { await saveChanges(); navigation.goBack(); } },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const themeLabel = override === 'dark' ? '🌙 Dark' : override === 'light' ? '☀️ Light' : '⚙️ System';
  const cycleTheme = () => {
    if (!override || override === 'system') setTheme('light');
    else if (override === 'light')          setTheme('dark');
    else                                    setTheme('system');
  };

  const handleLogout = () => Alert.alert(t.signOut, t.signOutMsg, [
    { text: t.cancel,  style: 'cancel' },
    { text: t.signOut, style: 'destructive', onPress: logout },
  ]);

  const handleClearPin = () => Alert.alert(t.signOutClearPin, t.clearPinMsg, [
    { text: t.cancel,          style: 'cancel' },
    { text: t.signOutClearPin, style: 'destructive', onPress: logoutAndClearPin },
  ]);

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.accent, paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={handleBack} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.settings}</Text>
        <TouchableOpacity style={s.headerBtnRight} onPress={handleLogout}>
          <LogoutIcon color="#fff" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}>

        {/* Gender */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.chooseGender}</Text>
          <View style={s.genderRow}>
            {GENDERS.map(({ value, labelKey, Svg: GenderSvg }) => {
              const active     = gender === value;
              const iconColor  = active ? '#fff' : theme.accent;
              return (
                <TouchableOpacity key={value} style={s.genderItem} onPress={() => setGender(value)}>
                  <View style={[s.genderCircle, active && { backgroundColor: theme.accent }]}>
                    <GenderSvg color={iconColor} size={44} />
                  </View>
                  <Text style={[s.genderLabel, active && { color: theme.accent, fontWeight: '700' }]}>
                    {t[labelKey]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.divider} />

        {/* Age + Email */}
        <View style={s.section}>
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>{t.age}</Text>
            <TextInput
              style={s.fieldInput}
              value={ageVal}
              onChangeText={v => setAgeVal(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={theme.textMuted}
              selectionColor={theme.accent}
            />
          </View>
          <View style={s.fieldLine} />
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>{t.heightCm ?? 'Height (cm)'}</Text>
            <TextInput
              style={s.fieldInput}
              value={heightVal}
              onChangeText={v => setHeightVal(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={theme.textMuted}
              selectionColor={theme.accent}
            />
          </View>
          <View style={s.fieldLine} />

          <View style={s.fieldRowWrap}>
            <View>
              <Text style={s.fieldLabel}>{t.email}</Text>
              <Text style={s.fieldValue}>{user?.email ?? '—'}</Text>
            </View>
          </View>
          <View style={s.fieldLine} />
        </View>

        {isDirty && (
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: theme.accent }]}
            onPress={saveChanges} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? '...' : t.save}</Text>
          </TouchableOpacity>
        )}

        <View style={s.divider} />

        {/* Settings rows */}
        <View style={s.section}>
          <Row label={t.personalSettings} value={t.change}
            onPress={() => navigation.navigate('PersonalSettings')} theme={theme} />
          <Row label={t.appearance}       value={themeLabel}
            onPress={cycleTheme} theme={theme} />
          <Row label={t.language}         value={`${currentLang.flag} ${currentLang.label}`}
            onPress={() => navigation.navigate('Language')} theme={theme} />
          <Row label={t.pin}              value={t.change}
            onPress={() => navigation.navigate('PinSetup', { returnTo: 'Profile' })} theme={theme} />
          <Row label={t.termsConditions}  value={t.view}
            onPress={() => {}} theme={theme} />
          <Row label={t.about}            value={t.readMore}
            onPress={() => {}} theme={theme} last />
        </View>

        <View style={s.divider} />

        {/* Sign out */}
        <View style={s.section}>
          <TouchableOpacity style={s.signOutRow} onPress={handleLogout}>
            <Text style={s.signOutText}>{t.signOut}</Text>
          </TouchableOpacity>
          <View style={s.fieldLine} />
          <TouchableOpacity style={s.signOutRow} onPress={handleClearPin}>
            <Text style={[s.signOutText, { color: '#EF4444' }]}>{t.signOutClearPin}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root:       { flex: 1, backgroundColor: t.bgSecondary ?? '#F0F4F8' },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerBtn:  { width: 40 },
  headerBtnRight: { width: 40, alignItems: 'flex-end' },
  headerBack: { color: '#fff', fontSize: 28, lineHeight: 34 },
  headerTitle:{ flex: 1, color: '#fff', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },
  divider:    { height: Spacing.md, backgroundColor: t.bgSecondary ?? '#F0F4F8' },
  section:    { backgroundColor: t.bg ?? '#fff' },
  sectionTitle: { color: t.text, fontSize: FontSize.md, fontWeight: '500',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  genderRow:       { flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  genderItem:      { alignItems: 'center', gap: 8 },
  genderCircle:    { width: 80, height: 80, borderRadius: 40,
    backgroundColor: t.accentBg ?? '#e6f4f1', justifyContent: 'center', alignItems: 'center' },
  genderLabel:     { color: t.textSecondary, fontSize: FontSize.md },
  fieldWrap:       { paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 0 },
  fieldLabel:      { color: t.textMuted, fontSize: FontSize.sm, marginBottom: 2 },
  fieldInput:      { color: t.text, fontSize: FontSize.lg, fontWeight: '500', paddingBottom: 10 },
  fieldRowWrap:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 10 },
  fieldValue:      { color: t.text, fontSize: FontSize.lg, fontWeight: '500' },
  fieldLine:       { height: 1, backgroundColor: t.border, marginHorizontal: Spacing.lg },
  saveBtn:         { marginHorizontal: Spacing.lg, marginTop: Spacing.md, height: 46,
    borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:     { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  signOutRow:      { paddingVertical: 15, paddingHorizontal: Spacing.lg },
  signOutText:     { color: t.accent, fontSize: FontSize.md, fontWeight: '500' },
});