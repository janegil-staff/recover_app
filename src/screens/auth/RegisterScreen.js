// src/screens/auth/RegisterScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// ── Languages ─────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'no', flag: '🇳🇴', label: 'Norsk' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'da', flag: '🇩🇰', label: 'Dansk' },
  { code: 'sv', flag: '🇸🇪', label: 'Svenska' },
  { code: 'fi', flag: '🇫🇮', label: 'Suomi' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'pt', flag: '🇵🇹', label: 'Português' },
];

// ── Gender SVG icons ──────────────────────────────────────────────────────────
function GenderIcon({ type, active, color, size = 44 }) {
  if (type === 'female') return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Circle cx="22" cy="11" r="7" stroke={color} strokeWidth="2.2"
        fill={active ? 'rgba(255,255,255,0.25)' : 'none'} />
      <Path d="M15 10 Q14 5 18 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M29 10 Q30 5 26 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M10 38 Q10 26 22 26 Q34 26 34 38" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" fill={active ? 'rgba(255,255,255,0.15)' : 'none'} />
      <Path d="M16 26 Q14 32 12 38 M28 26 Q30 32 32 38"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
  if (type === 'male') return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Circle cx="22" cy="11" r="7" stroke={color} strokeWidth="2.2"
        fill={active ? 'rgba(255,255,255,0.25)' : 'none'} />
      <Path d="M10 38 Q10 26 22 26 Q34 26 34 38" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" fill={active ? 'rgba(255,255,255,0.15)' : 'none'} />
      <Path d="M19 26 L22 30 L25 26" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
  // undefined
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Circle cx="22" cy="11" r="7" stroke={color} strokeWidth="2.2"
        fill={active ? 'rgba(255,255,255,0.25)' : 'none'} />
      <Path d="M19 8 Q19 6 22 6 Q25 6 25 9 Q25 11 22 12 L22 14"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="22" cy="16.5" r="1" fill={color} />
      <Path d="M10 38 Q10 26 22 26 Q34 26 34 38" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" fill={active ? 'rgba(255,255,255,0.15)' : 'none'} />
    </Svg>
  );
}

// ── Underline text field ──────────────────────────────────────────────────────
function Field({ label, value, onChangeText, keyboardType, secureTextEntry, theme }) {
  return (
    <View style={{ width: '100%', marginBottom: Spacing.lg }}>
      <Text style={{ color: theme.textSecondary, fontSize: FontSize.md,
          fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        style={{ color: theme.text, fontSize: FontSize.md, fontWeight: '500', paddingBottom: 8 }}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.accent}
      />
      <View style={{ height: 2, backgroundColor: theme.inputLine, width: '100%' }} />
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation, route }) {
  const { register }  = useAuth();
  const { theme }     = useTheme();
  const { t, setLang } = useLang();

  const [gender,       setGender]       = useState('female');
  const [language,     setLanguage]     = useState('en');
  const [age,          setAge]          = useState('');
  const [email,        setEmail]        = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [pin,          setPin]          = useState('');
  const [tncAccepted,  setTncAccepted]  = useState(false);
  const [infoAccepted, setInfoAccepted] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [langOpen,     setLangOpen]     = useState(false);
  const [error,        setError]        = useState('');

  // Restore state when returning from PIN setup
  useEffect(() => {
    const p = route?.params ?? {};
    if (p.pin)          setPin(p.pin);
    if (p.age)          setAge(p.age);
    if (p.email)        setEmail(p.email);
    if (p.emailConfirm) setEmailConfirm(p.emailConfirm);
    if (p.gender)       setGender(p.gender);
    if (p.language)     setLanguage(p.language);
    if (p.tncAccepted  !== undefined) setTncAccepted(Boolean(p.tncAccepted));
    if (p.infoAccepted !== undefined) setInfoAccepted(Boolean(p.infoAccepted));
  }, [route?.params]);

  const pinSet    = pin.length === 4;
  const canSubmit = tncAccepted && infoAccepted && pinSet;

  const goToPinSetup = () => {
    navigation.navigate('PinSetup', {
      returnTo:     'Register',
      returnParams: { age, email, emailConfirm, gender, language, tncAccepted, infoAccepted },
    });
  };

  const submit = async () => {
    if (!age.trim())   { setError(`${t.age} er påkrevd`); return; }
    if (!email.trim()) { setError(`${t.email} er påkrevd`); return; }
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError('E-postadressene stemmer ikke'); return;
    }
    if (!pinSet)                       { setError(`${t.pinCode} er påkrevd`); return; }
    if (!tncAccepted || !infoAccepted) { setError('Vennligst godta vilkårene'); return; }

    setLoading(true); setError('');
    try {
      await register({
        name:     email?.split('@')[0] ?? '',
        email:    email.trim().toLowerCase(),
        password: pin,
        language,
        age:      parseInt(age, 10) || undefined,
        gender,
      });
    } catch (e) {
      setError(e?.message ?? 'Registrering feilet');
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(theme);

  return (
    <View style={s.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* ── Gender ──────────────────────────────────────────────── */}
          <Text style={s.sectionLabel}>{t.gender}</Text>
          <View style={s.genderRow}>
            {[
              { key: 'female',    label: t.female,          icon: 'female'  },
              { key: 'male',      label: t.male,            icon: 'male'    },
              { key: 'undefined', label: t.genderUndefined, icon: 'unknown' },
            ].map(({ key, label, icon }) => {
              const active = gender === key;
              return (
                <TouchableOpacity key={key} style={s.genderItem}
                  onPress={() => setGender(key)} activeOpacity={0.7}>
                  <View style={[s.genderCircle,
                    active
                      ? { backgroundColor: theme.accent }
                      : { backgroundColor: theme.accentLight ?? '#e6f4f1' }
                  ]}>
                    <GenderIcon type={icon} active={active}
                      color={active ? '#fff' : theme.accent} size={44} />
                  </View>
                  <Text style={[s.genderText, active && { color: theme.accent, fontWeight: '700' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Fields ──────────────────────────────────────────────── */}
          <View style={s.fields}>
            {!!error && <Text style={s.error}>{error}</Text>}

            <Field label={`${t.age}*`}         value={age}
              onChangeText={v => setAge(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad" theme={theme} />
            <Field label={`${t.email}*`}        value={email}
              onChangeText={setEmail} keyboardType="email-address" theme={theme} />
            <Field label={`${t.confirmEmail}*`} value={emailConfirm}
              onChangeText={setEmailConfirm} keyboardType="email-address" theme={theme} />

            {/* PIN row */}
            <TouchableOpacity style={s.pinRow} onPress={goToPinSetup}>
              <Text style={s.pinLabel}>{`${t.pinCode}*`}</Text>
              <View style={s.pinRight}>
                <Text style={[s.pinAction, pinSet && s.pinDone]}>
                  {pinSet ? t.pinCreated : t.createPin}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Language ────────────────────────────────────────────── */}
          <Text style={s.sectionLabel}>{t.language}</Text>
          <View style={{ marginBottom: Spacing.lg }}>
            <TouchableOpacity
              style={[s.dropdown, langOpen && { borderColor: theme.accent }]}
              onPress={() => setLangOpen(o => !o)}
              activeOpacity={0.8}
            >
              <Text style={s.dropdownFlag}>
                {LANGUAGES.find(l => l.code === language)?.flag ?? '🌐'}
              </Text>
              <Text style={[s.dropdownValue, { color: theme.text }]}>
                {LANGUAGES.find(l => l.code === language)?.label ?? language}
              </Text>
              <Text style={[s.dropdownArrow, { color: theme.textMuted }]}>
                {langOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {langOpen && (
              <View style={[s.dropdownList, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                {LANGUAGES.map(({ code, flag, label }) => {
                  const active = language === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[s.dropdownItem,
                        active && { backgroundColor: theme.accent + '14' },
                        { borderBottomColor: theme.border }
                      ]}
                      onPress={() => { setLanguage(code); setLang(code); setLangOpen(false); }}
                      activeOpacity={0.7}
                    >
                      <Text style={s.dropdownFlag}>{flag}</Text>
                      <Text style={[s.dropdownItemLabel,
                        { color: active ? theme.accent : theme.text },
                        active && { fontWeight: '700' }
                      ]}>
                        {label}
                      </Text>
                      {active && (
                        <Text style={{ color: theme.accent, fontSize: 16 }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={{ height: Spacing.lg }} />

          {/* ── Terms ───────────────────────────────────────────────── */}
          <TouchableOpacity style={s.checkRow} onPress={() => setTncAccepted(!tncAccepted)}>
            <View style={[s.checkbox, tncAccepted && s.checkboxChecked]}>
              {tncAccepted && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkText}>
              {t.acceptTerms} <Text style={s.checkLink}>{t.termsLink}</Text>
              {'\n'}{t.includingPrivacy}
            </Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.md }} />

          <TouchableOpacity style={s.checkRow} onPress={() => setInfoAccepted(!infoAccepted)}>
            <View style={[s.checkbox, infoAccepted && s.checkboxChecked]}>
              {infoAccepted && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkText}>{t.consentText}</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />

          {/* ── Submit ──────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[s.btn, !canSubmit && s.btnDisabled]}
            onPress={canSubmit ? submit : undefined}
            activeOpacity={canSubmit ? 0.85 : 1}
          >
            <Text style={s.btnText}>{loading ? '...' : t.createAccount}</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.alreadyText}>{t.alreadyAccount}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  bg:     { flex: 1, backgroundColor: t.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 50 },

  sectionLabel: {
    color: t.textSecondary, fontSize: FontSize.md, fontWeight: '700',
    marginBottom: Spacing.md, marginTop: Spacing.sm, letterSpacing: 0.3,
  },

  // Gender
  genderRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  genderItem:   { alignItems: 'center', flex: 1 },
  genderCircle: { width: 80, height: 80, borderRadius: 40,
                  justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  genderText:   { fontSize: FontSize.sm, color: t.textSecondary, fontWeight: '500' },

  // Fields
  fields: { width: '100%' },
  error:  { color: '#C62828', fontSize: FontSize.sm, marginBottom: Spacing.md },

  pinRow:   { width: '100%', flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: Spacing.lg,
              paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: t.inputLine },
  pinLabel: { color: t.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  pinRight: { flexDirection: 'row', alignItems: 'center' },
  pinAction:{ color: t.accent, fontSize: FontSize.md, fontWeight: '700' },
  pinDone:  { color: '#2E7D32' },

  // Language dropdown
  dropdown: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 14, borderWidth: 1.5, borderColor: t.inputLine,
    borderRadius: Radius.md, backgroundColor: t.surface, gap: 10,
  },
  dropdownFlag:      { fontSize: 20 },
  dropdownValue:     { flex: 1, fontSize: FontSize.md, fontWeight: '600' },
  dropdownArrow:     { fontSize: 11 },
  dropdownList: {
    borderWidth: 1.5, borderTopWidth: 0,
    borderBottomLeftRadius: Radius.md, borderBottomRightRadius: Radius.md,
    overflow: 'hidden', marginTop: -2,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: 12, borderBottomWidth: 1, gap: 10,
  },
  langFlag:          { fontSize: 20 },
  dropdownItemLabel: { flex: 1, fontSize: FontSize.md },

  // Terms
  checkRow:        { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox:        { width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                     borderColor: t.border, justifyContent: 'center', alignItems: 'center',
                     marginTop: 2, flexShrink: 0 },
  checkboxChecked: { backgroundColor: t.accent, borderColor: t.accent },
  checkmark:       { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  checkText:       { color: t.text, fontSize: FontSize.sm, lineHeight: 20, flex: 1 },
  checkLink:       { color: t.text, fontWeight: '700', textDecorationLine: 'underline' },

  // Button
  btn: {
    width: '100%', height: 56, backgroundColor: t.accent, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: t.accent, shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnDisabled:  { opacity: 0.4 },
  btnText:      { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
  alreadyText:  { color: t.textSecondary, fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
});
