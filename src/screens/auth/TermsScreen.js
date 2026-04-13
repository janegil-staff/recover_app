// src/screens/auth/TermsScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

function Section({ title, children, theme }) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Text style={{ color: theme.accent, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.sm }}>
        {title}
      </Text>
      <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, lineHeight: 22 }}>
        {children}
      </Text>
    </View>
  );
}

export default function TermsScreen({ navigation }) {
  const { theme } = useTheme();
  const { t }     = useLang();
  const s = makeStyles(theme);

  return (
    <View style={s.bg}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.termsLink ?? 'Terms & Conditions'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        <Text style={s.intro}>
          {t.termsIntro ?? 'Please read these Terms and Conditions carefully before using the Recover app.'}
        </Text>

        <Section title="1. About the App" theme={theme}>
          Recover is a personal health tracking application developed by KBB Medic AS. The app is intended to support individuals in monitoring their substance use, mood, and wellbeing for the purpose of harm reduction and recovery support.
        </Section>

        <Section title="2. Health Data" theme={theme}>
          By using Recover, you consent to the collection and storage of health-related data including substance use logs, mood scores, and questionnaire responses. This data is stored securely and used solely to provide you with insights and support within the app.
        </Section>

        <Section title="3. Privacy Policy" theme={theme}>
          KBB Medic AS processes your personal data in accordance with the General Data Protection Regulation (GDPR). Your data is never sold to third parties. You may request deletion of your data at any time by contacting us at privacy@kbbmedic.no.
        </Section>

        <Section title="4. Medical Disclaimer" theme={theme}>
          Recover is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns. The app is intended as a supplementary tool only.
        </Section>

        <Section title="5. Data Sharing" theme={theme}>
          You may choose to share your anonymised data with a healthcare provider through the Share feature. This is always opt-in and can be revoked at any time.
        </Section>

        <Section title="6. Account Security" theme={theme}>
          You are responsible for keeping your PIN secure. KBB Medic AS is not liable for unauthorised access resulting from disclosure of your PIN to third parties.
        </Section>

        <Section title="7. Changes to Terms" theme={theme}>
          KBB Medic AS reserves the right to update these Terms at any time. Continued use of the app after changes constitutes acceptance of the updated Terms.
        </Section>

        <Section title="8. Contact" theme={theme}>
          KBB Medic AS{'\n'}
          Email: support@kbbmedic.no{'\n'}
          Website: www.kbbmedic.no
        </Section>

        <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={s.btnText}>{t.back ?? '← Back'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  bg:     { flex: 1, backgroundColor: t.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: t.border,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow:   { fontSize: 28, color: t.text, fontWeight: '300', marginTop: -2 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: t.text },
  scroll: { paddingHorizontal: 24, paddingTop: Spacing.xl, paddingBottom: 40 },
  intro:  { color: t.textSecondary, fontSize: FontSize.sm, lineHeight: 22, marginBottom: Spacing.xl },
  btn: {
    width: '100%', height: 52, backgroundColor: t.surface,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: t.border,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg,
  },
  btnText: { color: t.text, fontSize: FontSize.md, fontWeight: '700' },
});
