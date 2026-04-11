// src/screens/questionnaire/QuestionnaireFormScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme }    from '../../context/ThemeContext';
import { useLang }     from '../../context/LangContext';
import { patientApi }  from '../../services/api';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// ── Re-use buildQuestionnaires from the shared helper ─────────────────────────
// (copy the same function here, or import from a shared file)
function buildQuestionnaires(t) {
  const RARELY = [
    { label: t.ansNotAtAll,     value: 0 },
    { label: t.ansSomeDays,     value: 1 },
    { label: t.ansMoreThanHalf, value: 2 },
    { label: t.ansNearlyEvery,  value: 3 },
  ];

  return {
    gad7: {
      title:    t.gad7Title,
      subtitle: t.gad7Subtitle,
      color:    '#7C3AED',
      scoreKey: 'latestGad7',
      maxScore: 21,
      interpret: s => s <= 4 ? t.gad7I1 : s <= 9 ? t.gad7I2 : s <= 14 ? t.gad7I3 : t.gad7I4,
      questions: [t.gad7Q1,t.gad7Q2,t.gad7Q3,t.gad7Q4,t.gad7Q5,t.gad7Q6,t.gad7Q7],
      options: RARELY,
    },
    phq9: {
      title:    t.phq9Title,
      subtitle: t.phq9Subtitle,
      color:    '#DC2626',
      scoreKey: 'latestPhq9',
      maxScore: 27,
      interpret: s => s <= 4 ? t.phq9I1 : s <= 9 ? t.phq9I2 : s <= 14 ? t.phq9I3 : s <= 19 ? t.phq9I4 : t.phq9I5,
      questions: [t.phq9Q1,t.phq9Q2,t.phq9Q3,t.phq9Q4,t.phq9Q5,t.phq9Q6,t.phq9Q7,t.phq9Q8,t.phq9Q9],
      options: RARELY,
    },
    audit: {
      title:    t.auditTitle,
      subtitle: t.auditSubtitle,
      color:    '#D97706',
      scoreKey: 'latestAudit',
      maxScore: 40,
      interpret: s => s <= 7 ? t.auditI1 : s <= 15 ? t.auditI2 : s <= 19 ? t.auditI3 : t.auditI4,
      questions: [t.auditQ1,t.auditQ2,t.auditQ3,t.auditQ4,t.auditQ5,t.auditQ6,t.auditQ7,t.auditQ8,t.auditQ9,t.auditQ10],
      options: [
        [{ label: t.ansNever,value:0 },{ label: t.ansMonthlyOrLess,value:1 },{ label: t.ans2to4Monthly,value:2 },{ label: t.ans2to3Weekly,value:3 },{ label: t.ans4PlusWeekly,value:4 }],
        [{ label: t.ans1to2,value:0 },{ label: t.ans3to4,value:1 },{ label: t.ans5to6,value:2 },{ label: t.ans7to9,value:3 },{ label: t.ans10plus,value:4 }],
        [{ label: t.ansNever,value:0 },{ label: t.ansLessThanMonthly,value:1 },{ label: t.ansMonthly,value:2 },{ label: t.ansWeekly,value:3 },{ label: t.ansDailyAlmost,value:4 }],
        null, null, null, null, null,
        [{ label: t.ansNo,value:0 },{ label: t.ansNoNotLastYear,value:2 },{ label: t.ansYesLastYear,value:4 }],
        [{ label: t.ansNo,value:0 },{ label: t.ansNoNotLastYear,value:2 },{ label: t.ansYesLastYear,value:4 }],
      ],
      defaultOptions: [
        { label: t.ansNever,value:0 },{ label: t.ansLessThanMonthly,value:1 },
        { label: t.ansMonthly,value:2 },{ label: t.ansWeekly,value:3 },{ label: t.ansDailyAlmost,value:4 },
      ],
    },
    dast10: {
      title:    t.dast10Title,
      subtitle: t.dast10Subtitle,
      color:    '#059669',
      scoreKey: 'latestDast10',
      maxScore: 10,
      interpret: s => s === 0 ? t.dast10I1 : s <= 2 ? t.dast10I2 : s <= 5 ? t.dast10I3 : s <= 8 ? t.dast10I4 : t.dast10I5,
      yesNo: true,
      questions: [t.dast10Q1,t.dast10Q2,t.dast10Q3,t.dast10Q4,t.dast10Q5,t.dast10Q6,t.dast10Q7,t.dast10Q8,t.dast10Q9,t.dast10Q10],
      reverse: [2],
    },
    cage: {
      title:    t.cageTitle,
      subtitle: t.cageSubtitle,
      color:    '#0284C7',
      scoreKey: 'latestCage',
      maxScore: 4,
      interpret: s => s <= 1 ? t.cageI1 : s <= 2 ? t.cageI2 : t.cageI3,
      yesNo: true,
      questions: [t.cageQ1,t.cageQ2,t.cageQ3,t.cageQ4],
    },
    readiness: {
      title:    t.readinessTitle,
      subtitle: t.readinessSubtitle,
      color:    '#0891B2',
      scoreKey: 'latestReadiness',
      maxScore: 30,
      interpret: s => s <= 10 ? t.readinessI1 : s <= 20 ? t.readinessI2 : t.readinessI3,
      questions: [t.readinessQ1,t.readinessQ2,t.readinessQ3,t.readinessQ4,t.readinessQ5,t.readinessQ6],
      options: [
        { label: t.ansStronglyDisagree, value: 1 },
        { label: t.ansDisagree,         value: 2 },
        { label: t.ansNeutral,          value: 3 },
        { label: t.ansAgree,            value: 4 },
        { label: t.ansStronglyAgree,    value: 5 },
      ],
    },
  };
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function QuestionnaireFormScreen({ route, navigation }) {
  const { id } = route.params;
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();

  const QUESTIONNAIRES = buildQuestionnaires(t);
  const config         = QUESTIONNAIRES[id];

  const [answers, setAnswers] = useState({});
  const [saving,  setSaving]  = useState(false);

  if (!config) return null;

  const { color } = config;
  const allAnswered = config.questions.every((_, i) => answers[i] != null);
  const total       = Object.values(answers).reduce((a, b) => a + b, 0);

  const getOptions = (i) => {
    if (config.yesNo) return [{ label: t.ansYes, value: 1 }, { label: t.ansNo, value: 0 }];
    if (config.options && Array.isArray(config.options[i])) return config.options[i];
    if (config.defaultOptions) return config.defaultOptions;
    return config.options;
  };

  const getValue = (i, raw) => {
    if (config.reverse?.includes(i)) return raw === 1 ? 0 : 1;
    return raw;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientApi.updateQuestionnaire(config.scoreKey, answers);
      navigation.goBack();
      navigation.goBack(); // back past intro too
    } catch (e) {
      Alert.alert(t.error ?? 'Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['bottom']}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: color, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>{config.title}</Text>
          <Text style={s.headerSub}>{config.subtitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Live score bar */}
      {Object.keys(answers).length > 0 && (
        <View style={[s.scoreBar, { backgroundColor: color + '18' }]}>
          <Text style={[s.scoreText, { color }]}>
            {total} / {config.maxScore} — {config.interpret(total)}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {config.questions.map((q, i) => {
          const opts   = getOptions(i);
          return (
            <View key={i} style={[s.qBlock, { borderBottomColor: theme.border }]}>
              <Text style={[s.qNum,  { color }]}>{i + 1}.</Text>
              <Text style={[s.qText, { color: theme.text }]}>{q}</Text>
              <View style={s.optRow}>
                {opts.map(opt => {
                  const stored = getValue(i, opt.value);
                  const active = answers[i] === stored;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setAnswers(prev => ({ ...prev, [i]: stored }))}
                      style={[s.optBtn, {
                        borderColor:     active ? color : theme.border,
                        backgroundColor: active ? color + '18' : theme.surface,
                      }]}
                    >
                      <Text style={[s.optText,
                        { color: active ? color : theme.textSecondary },
                        active && { fontWeight: '700' },
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        {!allAnswered && (
          <Text style={[s.footerHint, { color: theme.textMuted }]}>
            {config.questions.length - Object.keys(answers).length} {t.questionsRemaining}
          </Text>
        )}
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: allAnswered ? color : theme.border }]}
          disabled={!allAnswered || saving}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnText}>{t.saveScore}</Text>
          }
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
  backBtn:     { width: 40 },
  backArrow:   { color: '#fff', fontSize: 30, lineHeight: 36 },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
  headerSub:   { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 2 },
  scoreBar:    { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  scoreText:   { fontSize: FontSize.sm, fontWeight: '700' },
  qBlock:      { marginBottom: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 1 },
  qNum:        { fontSize: FontSize.sm, fontWeight: '800', marginBottom: 4 },
  qText:       { fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.md },
  optRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optBtn:      { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5 },
  optText:     { fontSize: FontSize.sm },
  footer:      { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1 },
  footerHint:  { fontSize: FontSize.xs, marginBottom: Spacing.sm, textAlign: 'center' },
  saveBtn:     { height: 50, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
