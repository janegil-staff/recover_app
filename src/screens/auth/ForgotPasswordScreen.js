// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { authApi }  from '../../services/api';
import { FontSize, Spacing, Radius } from '../../constants/theme';

function Field({ label, value, onChangeText, keyboardType, theme }) {
  return (
    <View style={{ width: '100%', marginBottom: Spacing.lg }}>
      <Text style={{ color: theme.textSecondary, fontSize: FontSize.md, fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        style={{ color: theme.text, fontSize: FontSize.md, fontWeight: '500', paddingBottom: 8 }}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.accent}
      />
      <View style={{ height: 2, backgroundColor: theme.inputLine, width: '100%' }} />
    </View>
  );
}

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const { t }     = useLang();

  const [step,     setStep]     = useState('email'); // 'email' | 'code' | 'pin'
  const [email,    setEmail]    = useState('');
  const [code,     setCode]     = useState('');
  const [pin,      setPin]      = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const s = makeStyles(theme);

  // ── Step 1: request reset code ────────────────────────────────────────────
  const requestCode = async () => {
    setError('');
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.trim())) { setError(t.emailInvalid ?? 'Invalid email'); return; }
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email.trim().toLowerCase());
      setStep('code');
    } catch (e) {
      setError(e?.message ?? 'Could not send reset code');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify code ───────────────────────────────────────────────────
  const verifyCode = async () => {
    setError('');
    if (code.length < 4) { setError(t.codeRequired ?? 'Enter the code from your email'); return; }
    setLoading(true);
    try {
      await authApi.verifyResetCode(email.trim().toLowerCase(), code.trim());
      setStep('pin');
    } catch (e) {
      setError(e?.message ?? 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: set new PIN ───────────────────────────────────────────────────
  const resetPin = async () => {
    setError('');
    if (pin.length !== 4)    { setError(t.pinRequired ?? 'PIN must be 4 digits'); return; }
    if (pin !== pinConfirm)  { setError(t.pinNoMatch  ?? 'PINs do not match');    return; }
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim().toLowerCase(), code.trim(), pin);
      Alert.alert(
        t.saved ?? 'Done',
        t.pinUpdated ?? 'Your PIN has been updated. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      setError(e?.message ?? 'Could not reset PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity onPress={() => step === 'email' ? navigation.goBack() : setStep(step === 'pin' ? 'code' : 'email')} style={s.backBtn}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>

          <Text style={s.title}>
            {step === 'email' ? (t.forgotPin   ?? 'Forgot PIN?')      :
             step === 'code'  ? (t.enterCode   ?? 'Enter code')        :
                                (t.choosePin   ?? 'Choose new PIN')}
          </Text>
          <Text style={s.subtitle}>
            {step === 'email' ? (t.forgotPinSub  ?? 'Enter your email and we\'ll send you a reset code.') :
             step === 'code'  ? (t.enterCodeSub  ?? `Code sent to ${email}`) :
                                (t.choosePinSub  ?? 'Enter a new 4-digit PIN')}
          </Text>

          <View style={{ height: Spacing.xl }} />

          {!!error && <Text style={s.error}>{error}</Text>}

          {/* ── STEP 1: email ── */}
          {step === 'email' && (
            <>
              <Field
                label={`${t.email}*`}
                value={email}
                onChangeText={v => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                theme={theme}
              />
              <View style={{ height: Spacing.xl }} />
              <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={requestCode} disabled={loading} activeOpacity={0.85}>
                <Text style={s.btnText}>{loading ? '...' : (t.sendCode ?? 'SEND CODE').toUpperCase()}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 2: verify code ── */}
          {step === 'code' && (
            <>
              <Field
                label={t.resetCode ?? 'Reset code'}
                value={code}
                onChangeText={v => { setCode(v.replace(/\s/g, '')); setError(''); }}
                keyboardType="default"
                theme={theme}
              />
              <TouchableOpacity onPress={requestCode} style={{ marginBottom: Spacing.xl }}>
                <Text style={{ color: theme.accent, fontSize: FontSize.sm, fontWeight: '600' }}>
                  {t.resendCode ?? 'Resend code'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={verifyCode} disabled={loading} activeOpacity={0.85}>
                <Text style={s.btnText}>{loading ? '...' : (t.verifyCode ?? 'VERIFY CODE').toUpperCase()}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── STEP 3: new PIN ── */}
          {step === 'pin' && (
            <>
              <Field
                label={`${t.pinCode}*`}
                value={pin}
                onChangeText={v => { setPin(v.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                keyboardType="number-pad"
                theme={theme}
              />
              <Field
                label={t.confirmPin ?? 'Confirm PIN'}
                value={pinConfirm}
                onChangeText={v => { setPinConfirm(v.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                keyboardType="number-pad"
                theme={theme}
              />
              <View style={{ height: Spacing.xl }} />
              <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={resetPin} disabled={loading} activeOpacity={0.85}>
                <Text style={s.btnText}>{loading ? '...' : (t.save ?? 'SAVE').toUpperCase()}</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: Spacing.xl }} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.linkMuted}>{t.backToLogin ?? 'Back to login'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  bg:       { flex: 1, backgroundColor: t.bg },
  scroll:   { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 50 },
  backBtn:  { marginBottom: Spacing.xl },
  backArrow:{ color: t.text, fontSize: 32, fontWeight: '300', lineHeight: 36 },
  title:    { color: t.text, fontSize: 26, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm },
  subtitle: { color: t.textMuted, fontSize: FontSize.sm, lineHeight: 20 },
  error:    { color: t.error, fontSize: FontSize.sm, marginBottom: Spacing.md, width: '100%' },
  btn: {
    width: '100%', height: 56, backgroundColor: t.accent, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: t.accent, shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnDisabled: { opacity: 0.5 },
  btnText:  { color: '#fff', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
  linkMuted:{ color: t.textSecondary, fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
});
