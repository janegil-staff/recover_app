// src/screens/questionnaire/QuestionnaireScreen.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { useLogs } from '../../context/PatientContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

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
    },
    dast10: {
      title:    t.dast10Title,
      subtitle: t.dast10Subtitle,
      color:    '#059669',
      scoreKey: 'latestDast10',
      maxScore: 10,
      interpret: s => s === 0 ? t.dast10I1 : s <= 2 ? t.dast10I2 : s <= 5 ? t.dast10I3 : s <= 8 ? t.dast10I4 : t.dast10I5,
    },
    cage: {
      title:    t.cageTitle,
      subtitle: t.cageSubtitle,
      color:    '#0284C7',
      scoreKey: 'latestCage',
      maxScore: 4,
      interpret: s => s <= 1 ? t.cageI1 : s <= 2 ? t.cageI2 : t.cageI3,
    },
    readiness: {
      title:    t.readinessTitle,
      subtitle: t.readinessSubtitle,
      color:    '#0891B2',
      scoreKey: 'latestReadiness',
      maxScore: 30,
      interpret: s => s <= 10 ? t.readinessI1 : s <= 20 ? t.readinessI2 : t.readinessI3,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeTotal(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return Object.entries(raw).reduce(
    (sum, [k, v]) => (k !== 'completedAt' && typeof v === 'number' ? sum + v : sum),
    0,
  );
}

function formatCompletion(completedAt, t) {
  if (!completedAt) return null;
  const completed = new Date(completedAt);
  if (isNaN(completed.getTime())) return null;

  const now = new Date();
  const diffMs = now - completed;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { text: t.completedToday ?? 'Completed today', stale: false };
  }
  if (diffDays === 1) {
    return { text: t.completedYesterday ?? 'Completed yesterday', stale: false };
  }
  if (diffDays < 7) {
    return {
      text: `${t.completed ?? 'Completed'} ${diffDays} ${t.daysAgo ?? 'days ago'}`,
      stale: false,
    };
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return {
      text: `${t.completed ?? 'Completed'} ${weeks} ${weeks === 1 ? (t.weekAgo ?? 'week ago') : (t.weeksAgo ?? 'weeks ago')}`,
      stale: false,
    };
  }
  // Older than 30 days — show date and mark stale if 90+
  const months = t.months ?? [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const dateStr = `${completed.getDate()} ${months[completed.getMonth()]} ${completed.getFullYear()}`;
  return {
    text: `${t.completed ?? 'Completed'} ${dateStr}`,
    stale: diffDays >= 90,
  };
}

// ── Card ──────────────────────────────────────────────────────────────────────
function QCard({ config, latestScore, onPress, theme, t }) {
  const total = computeTotal(latestScore);
  const interp = total != null ? config.interpret(total) : null;
  const completion = formatCompletion(latestScore?.completedAt, t);

  const CARD_BG = theme?.card ?? '#fff';
  const BORDER = theme?.border ?? '#e8eef5';
  const TEXT = theme?.text ?? '#1a2c3d';
  const TEXT_MUTED = theme?.textMuted ?? '#7a9ab8';
  const STALE_COLOR = theme?.highlight ?? '#f4a261';
  const SUCCESS_COLOR = '#22C55E';

  const isCompleted = total != null;

  return (
    <TouchableOpacity
      style={[
        s.qCard,
        {
          borderLeftColor: config.color,
          borderLeftWidth: 4,
          backgroundColor: CARD_BG,
          borderColor: BORDER,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.qTitle, { color: TEXT }]}>{config.title}</Text>
        <Text style={[s.qSubtitle, { color: TEXT_MUTED }]}>
          {config.subtitle}
        </Text>

        {isCompleted ? (
          <>
            <View
              style={[
                s.qBadge,
                { backgroundColor: config.color + '20' },
              ]}
            >
              <Text style={[s.qBadgeText, { color: config.color }]}>
                {total} / {config.maxScore} — {interp}
              </Text>
            </View>
            {completion && (
              <View style={s.completionRow}>
                {completion.stale ? (
                  <Text style={{ fontSize: 11 }}>⚠</Text>
                ) : (
                  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12l5 5L20 7"
                      stroke={SUCCESS_COLOR}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
                <Text
                  style={[
                    s.completionText,
                    {
                      color: completion.stale ? STALE_COLOR : TEXT_MUTED,
                      fontWeight: completion.stale ? '600' : '500',
                    },
                  ]}
                >
                  {completion.text}
                  {completion.stale &&
                    ` — ${t.considerRetaking ?? 'consider retaking'}`}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={s.notCompletedRow}>
            <View
              style={[
                s.notCompletedDot,
                { borderColor: TEXT_MUTED },
              ]}
            />
            <Text style={[s.notCompletedText, { color: TEXT_MUTED }]}>
              {t.notCompletedYet ?? 'Not completed yet'}
            </Text>
          </View>
        )}
      </View>
      <Text style={[s.qArrow, { color: TEXT_MUTED }]}>›</Text>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function QuestionnaireScreen({ navigation }) {
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();
  const { patient } = useLogs();

  const QUESTIONNAIRES = useMemo(() => buildQuestionnaires(t), [t]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgSecondary ?? theme.bg }}>
      {/* Header — gradient matches other Share tabs */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#2d4a6e']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[s.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.getParent()?.goBack() ?? navigation.goBack()}
          style={s.backBtn}
        >
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.questionnaires}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.intro, { color: theme.textMuted }]}>
          {t.questionnairesIntro}
        </Text>
        {Object.entries(QUESTIONNAIRES).map(([id, config]) => (
          <QCard
            key={id}
            config={config}
            latestScore={patient?.[config.scoreKey] ?? null}
            theme={theme}
            t={t}
            onPress={() => navigation.navigate('QuestionnaireIntro', { id })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn:   { width: 40 },
  backArrow: { color: '#fff', fontSize: 30 },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  intro: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  qCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  qTitle:    { fontSize: FontSize.lg, fontWeight: '700' },
  qSubtitle: { fontSize: FontSize.sm, marginTop: 2, marginBottom: Spacing.sm },
  qBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 6,
  },
  qBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  qArrow:     { fontSize: 24, marginLeft: Spacing.sm },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  completionText: {
    fontSize: FontSize.xs,
  },
  notCompletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  notCompletedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  notCompletedText: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
  },
});