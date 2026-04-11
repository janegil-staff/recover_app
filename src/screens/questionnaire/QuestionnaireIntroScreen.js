// src/screens/questionnaire/QuestionnaireIntroScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// ── Images — add files to src/assets/questionnaires/ to activate ─────────────
// require() is resolved at build time so we can't make it truly dynamic.
// Set to null until you have the real assets, then swap in the require().
const IMAGES = {
  gad7:      require('../../../assets/questionnaires/gad7.png'),
  phq9:      require('../../../assets/questionnaires/phq9.png'),
  audit:     require('../../../assets/questionnaires/audit.png'),
  dast10:    require('../../../assets/questionnaires/dast10.png'),
  cage:      require('../../../assets/questionnaires/cage.png'),
  readiness: require('../../../assets/questionnaires/readiness.png'),
};

// ── Color per questionnaire (matches QCard colors) ────────────────────────────
const COLORS = {
  gad7:      '#7C3AED',
  phq9:      '#DC2626',
  audit:     '#D97706',
  dast10:    '#059669',
  cage:      '#0284C7',
  readiness: '#0891B2',
};

// ── Meta chip ─────────────────────────────────────────────────────────────────
function Chip({ icon, label, color }) {
  return (
    <View style={[chipS.wrap, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Text style={chipS.icon}>{icon}</Text>
      <Text style={[chipS.label, { color }]}>{label}</Text>
    </View>
  );
}
const chipS = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10,
           paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, marginRight: 8 },
  icon:  { fontSize: 13 },
  label: { fontSize: FontSize.xs, fontWeight: '700' },
});

// ── Info block ────────────────────────────────────────────────────────────────
function InfoBlock({ title, body, color, theme }) {
  return (
    <View style={[iS.wrap, { borderLeftColor: color, backgroundColor: color + '0c' }]}>
      <Text style={[iS.title, { color }]}>{title}</Text>
      <Text style={[iS.body,  { color: theme.textSecondary }]}>{body}</Text>
    </View>
  );
}
const iS = StyleSheet.create({
  wrap:  { borderLeftWidth: 3, borderRadius: Radius.sm, padding: Spacing.md,
           marginBottom: Spacing.md },
  title: { fontSize: FontSize.sm, fontWeight: '800', marginBottom: 4, letterSpacing: 0.2 },
  body:  { fontSize: FontSize.sm, lineHeight: 20 },
});

// ── Main component ────────────────────────────────────────────────────────────
export default function QuestionnaireIntroScreen({ route, navigation }) {
  const id      = route?.params?.id;
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();
  const color     = COLORS[id] ?? theme.accent;

  // ── Per-questionnaire intro content pulled from translations ────────────────
  const INTROS = {
    gad7: {
      title:       t.gad7Title,
      subtitle:    t.gad7Subtitle,
      whatTitle:   t.introWhatIsIt     ?? 'What is it?',
      whatBody:    t.gad7IntroWhat     ?? 'The GAD-7 is a 7-item questionnaire developed to screen for Generalised Anxiety Disorder and measure its severity.',
      whyTitle:    t.introWhyMatters   ?? 'Why does it matter?',
      whyBody:     t.gad7IntroWhy      ?? 'Anxiety often goes unrecognised. Regular tracking helps you and your clinician see patterns and measure whether treatment is working.',
      howTitle:    t.introHowWorks     ?? 'How does it work?',
      howBody:     t.gad7IntroHow      ?? 'Answer 7 questions about how often you have experienced anxiety symptoms over the last 2 weeks. Each answer is scored 0–3.',
      questions:   '7',
      time:        t.introAbout5Min    ?? '~5 min',
      validated:   t.introValidated    ?? 'Clinically validated',
    },
    phq9: {
      title:       t.phq9Title,
      subtitle:    t.phq9Subtitle,
      whatTitle:   t.introWhatIsIt     ?? 'What is it?',
      whatBody:    t.phq9IntroWhat     ?? 'The PHQ-9 is a 9-item questionnaire used to screen for depression and monitor its severity over time.',
      whyTitle:    t.introWhyMatters   ?? 'Why does it matter?',
      whyBody:     t.phq9IntroWhy      ?? 'Depression is one of the most common mental health conditions in recovery. Tracking your PHQ-9 score over time reveals whether things are improving.',
      howTitle:    t.introHowWorks     ?? 'How does it work?',
      howBody:     t.phq9IntroHow      ?? 'Answer 9 questions about symptoms experienced over the last 2 weeks. Scores range from 0 (none) to 27 (severe).',
      questions:   '9',
      time:        t.introAbout5Min    ?? '~5 min',
      validated:   t.introValidated    ?? 'Clinically validated',
    },
    audit: {
      title:       t.auditTitle,
      subtitle:    t.auditSubtitle,
      whatTitle:   t.introWhatIsIt     ?? 'What is it?',
      whatBody:    t.auditIntroWhat    ?? 'The AUDIT (Alcohol Use Disorders Identification Test) is a 10-item tool developed by the WHO to screen for hazardous and harmful alcohol use.',
      whyTitle:    t.introWhyMatters   ?? 'Why does it matter?',
      whyBody:     t.auditIntroWhy     ?? 'Understanding your relationship with alcohol is a key part of recovery. The AUDIT gives you and your clinician a clear, evidence-based picture.',
      howTitle:    t.introHowWorks     ?? 'How does it work?',
      howBody:     t.auditIntroHow     ?? 'Answer 10 questions about your drinking habits. The first 3 cover frequency and quantity; the remaining 7 cover dependence symptoms and consequences.',
      questions:   '10',
      time:        t.introAbout5Min    ?? '~5 min',
      validated:   t.introValidated    ?? 'Clinically validated',
    },
    dast10: {
      title:       t.dast10Title,
      subtitle:    t.dast10Subtitle,
      whatTitle:   t.introWhatIsIt     ?? 'What is it?',
      whatBody:    t.dast10IntroWhat   ?? 'The DAST-10 (Drug Abuse Screening Test) is a 10-item yes/no questionnaire that screens for problematic drug use over the past 12 months.',
      whyTitle:    t.introWhyMatters   ?? 'Why does it matter?',
      whyBody:     t.dast10IntroWhy    ?? 'Honest reflection on substance use patterns is a powerful step in recovery. The DAST-10 helps identify the level of support you may need.',
      howTitle:    t.introHowWorks     ?? 'How does it work?',
      howBody:     t.dast10IntroHow    ?? 'Answer 10 yes/no questions about your drug use in the last 12 months. One question is reverse-scored. Results range from 0 (no problem) to 10 (severe).',
      questions:   '10',
      time:        t.introAbout3Min    ?? '~3 min',
      validated:   t.introValidated    ?? 'Clinically validated',
    },
    cage: {
      title:       t.cageTitle,
      subtitle:    t.cageSubtitle,
      whatTitle:   t.introWhatIsIt     ?? 'What is it?',
      whatBody:    t.cageIntroWhat     ?? 'The CAGE is a brief 4-question screening tool for alcohol dependence. Each letter stands for a key sign: Cut down, Annoyed, Guilty, Eye-opener.',
      whyTitle:    t.introWhyMatters   ?? 'Why does it matter?',
      whyBody:     t.cageIntroWhy      ?? 'A score of 2 or more suggests a possible alcohol problem and is a prompt to discuss further with your clinician.',
      howTitle:    t.introHowWorks     ?? 'How does it work?',
      howBody:     t.cageIntroHow      ?? 'Answer 4 simple yes/no questions. Takes less than a minute. Quick to complete and easy to track over time.',
      questions:   '4',
      time:        t.introAbout1Min    ?? '~1 min',
      validated:   t.introValidated    ?? 'Clinically validated',
    },
    readiness: {
      title:       t.readinessTitle,
      subtitle:    t.readinessSubtitle,
      whatTitle:   t.introWhatIsIt     ?? 'What is it?',
      whatBody:    t.readinessIntroWhat ?? 'The Readiness to Change questionnaire measures your motivation and confidence to make changes to your substance use.',
      whyTitle:    t.introWhyMatters   ?? 'Why does it matter?',
      whyBody:     t.readinessIntroWhy  ?? 'Motivation is one of the strongest predictors of recovery success. Tracking your readiness over time shows your progress and helps your clinician tailor support.',
      howTitle:    t.introHowWorks     ?? 'How does it work?',
      howBody:     t.readinessIntroHow  ?? 'Rate your agreement with 6 statements on a scale from Strongly Disagree to Strongly Agree. No right or wrong answers — just honest reflection.',
      questions:   '6',
      time:        t.introAbout2Min    ?? '~2 min',
      validated:   t.introValidated    ?? 'Clinically validated',
    },
  };

  const intro = INTROS[id];
  if (!intro) return null;

  const imgSource = IMAGES[id] ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['bottom']}>

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: color, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{intro.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero image ── */}
        <View style={[s.imageWrap, { backgroundColor: color + '12' }]}>
          {imgSource ? (
            <Image
              source={imgSource}
              style={s.heroImage}
              resizeMode="contain"
            />
          ) : (
            // Placeholder until real assets are added
            <View style={[s.imagePlaceholder, { borderColor: color + '40' }]}>
              <Text style={[s.placeholderEmoji]}>
                { { gad7: '🧠', phq9: '💙', audit: '🍃',
                    dast10: '🔬', cage: '🔑', readiness: '🌱' }[id] ?? '📋' }
              </Text>
              <Text style={[s.placeholderText, { color: color }]}>
                {t.introImagePlaceholder ?? 'Illustration coming soon'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Title + subtitle ── */}
        <View style={s.titleBlock}>
          <Text style={[s.title, { color: theme.text }]}>{intro.title}</Text>
          <Text style={[s.subtitle, { color: theme.textSecondary }]}>{intro.subtitle}</Text>
        </View>

        {/* ── Meta chips ── */}
        <View style={s.chips}>
          <Chip icon="❓" label={`${intro.questions} ${t.introQuestions ?? 'questions'}`} color={color} />
          <Chip icon="⏱" label={intro.time}       color={color} />
          <Chip icon="✓"  label={intro.validated}  color={color} />
        </View>

        {/* ── Info blocks ── */}
        <InfoBlock title={intro.whatTitle} body={intro.whatBody} color={color} theme={theme} />
        <InfoBlock title={intro.whyTitle}  body={intro.whyBody}  color={color} theme={theme} />
        <InfoBlock title={intro.howTitle}  body={intro.howBody}  color={color} theme={theme} />

        {/* ── Disclaimer ── */}
        <Text style={[s.disclaimer, { color: theme.textMuted }]}>
          {t.introDisclaimer ?? 'This questionnaire is for informational purposes only and does not constitute a clinical diagnosis. Always discuss results with your healthcare provider.'}
        </Text>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* ── Sticky start button ── */}
      <View style={[s.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[s.startBtn, { backgroundColor: color }]}
          onPress={() => navigation.navigate('QuestionnaireForm', { id })}
          activeOpacity={0.85}
        >
          <Text style={s.startBtnText}>
            {t.introStartBtn ?? 'Start questionnaire'} →
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
  },
  backBtn:   { width: 40 },
  backArrow: { color: '#fff', fontSize: 30, lineHeight: 36 },
  headerTitle: {
    flex: 1, color: '#fff', fontSize: FontSize.md,
    fontWeight: '700', textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 20,
  },

  // Hero image
  imageWrap: {
    borderRadius: Radius.xl, overflow: 'hidden',
    marginBottom: Spacing.lg, alignItems: 'center',
    justifyContent: 'center', minHeight: 200,
  },
  heroImage: { width: '100%', height: 220 },
  imagePlaceholder: {
    width: '100%', height: 200, borderRadius: Radius.xl,
    borderWidth: 2, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  placeholderEmoji: { fontSize: 52 },
  placeholderText:  { fontSize: FontSize.sm, fontWeight: '600', opacity: 0.7 },

  // Title
  titleBlock: { marginBottom: Spacing.md },
  title:    { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: FontSize.md,  lineHeight: 22 },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },

  // Disclaimer
  disclaimer: {
    fontSize: FontSize.xs, lineHeight: 18,
    fontStyle: 'italic', marginTop: Spacing.sm,
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  startBtn: {
    height: 54, borderRadius: Radius.md,
    justifyContent: 'center', alignItems: 'center',
    shadowOpacity: 0.25, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  startBtnText: {
    color: '#fff', fontSize: FontSize.md,
    fontWeight: '800', letterSpacing: 1.5,
  },
});