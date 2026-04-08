// src/screens/questionnaire/QuestionnaireScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLogs }  from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// ── Questionnaire definitions ─────────────────────────────────────────────────

const RARELY = [
  { label: 'Ikke i det hele tatt', value: 0 },
  { label: 'Noen dager',            value: 1 },
  { label: 'Mer enn halvparten',    value: 2 },
  { label: 'Nesten hver dag',       value: 3 },
];

const QUESTIONNAIRES = {
  gad7: {
    title: 'GAD-7',
    subtitle: 'Angst-screening (siste 2 uker)',
    color: '#7C3AED',
    scoreKey: 'latestGad7',
    maxScore: 21,
    interpret: s => s <= 4 ? 'Minimal angst' : s <= 9 ? 'Mild angst' : s <= 14 ? 'Moderat angst' : 'Alvorlig angst',
    questions: [
      'Følt deg nervøs, engstelig eller på vakt?',
      'Klart å stoppe eller kontrollere bekymringer?',
      'Bekymret deg for mye om forskjellige ting?',
      'Hatt problemer med å slappe av?',
      'Vært så rastløs at det er vanskelig å sitte stille?',
      'Blitt lett irritabel eller oppfarende?',
      'Følt deg redd for at noe forferdelig kan skje?',
    ],
    options: RARELY,
  },
  phq9: {
    title: 'PHQ-9',
    subtitle: 'Depresjon-screening (siste 2 uker)',
    color: '#DC2626',
    scoreKey: 'latestPhq9',
    maxScore: 27,
    interpret: s => s <= 4 ? 'Minimal depresjon' : s <= 9 ? 'Mild depresjon' : s <= 14 ? 'Moderat depresjon' : s <= 19 ? 'Moderat-alvorlig' : 'Alvorlig depresjon',
    questions: [
      'Lite interesse eller glede i å gjøre ting?',
      'Følt deg nedfor, deprimert eller håpløs?',
      'Problemer med å sovne, sove for mye?',
      'Følt deg sliten eller hatt lite energi?',
      'Dårlig matlyst eller overspisning?',
      'Følt deg mislykket eller skuffet over deg selv?',
      'Vansker med å konsentrere deg om ting?',
      'Beveget deg saktere enn normalt, eller vært rastløs?',
      'Tanker om å skade deg selv eller at det hadde vært bedre å være død?',
    ],
    options: RARELY,
  },
  audit: {
    title: 'AUDIT',
    subtitle: 'Alkohol-screening',
    color: '#D97706',
    scoreKey: 'latestAudit',
    maxScore: 40,
    interpret: s => s <= 7 ? 'Lavrisiko' : s <= 15 ? 'Risikofylt forbruk' : s <= 19 ? 'Skadelig forbruk' : 'Sannsynlig avhengighet',
    questions: [
      'Hvor ofte drikker du alkohol?',
      'Hvor mange enheter drikker du en typisk dag du drikker?',
      'Hvor ofte drikker du 6 eller flere enheter ved én anledning?',
      'Hvor ofte siste år klarte du ikke å stoppe når du hadde begynt?',
      'Hvor ofte siste år unnlot du å gjøre noe forventet pga. drikking?',
      'Hvor ofte siste år trengte du en drink om morgenen?',
      'Hvor ofte siste år hadde du skyldfølelse etter å ha drukket?',
      'Hvor ofte siste år klarte du ikke å huske hva som skjedde?',
      'Har du eller noen andre blitt skadet pga. din drikking?',
      'Har lege, sykepleier el. anbefalt at du drikker mindre?',
    ],
    options: [
      [
        { label: 'Aldri', value: 0 },
        { label: 'Månedlig eller sjeldnere', value: 1 },
        { label: '2–4 ganger/mnd', value: 2 },
        { label: '2–3 ganger/uke', value: 3 },
        { label: '4+ ganger/uke', value: 4 },
      ],
      [
        { label: '1–2', value: 0 }, { label: '3–4', value: 1 },
        { label: '5–6', value: 2 }, { label: '7–9', value: 3 }, { label: '10+', value: 4 },
      ],
      [
        { label: 'Aldri', value: 0 }, { label: 'Sjeldnere enn månedlig', value: 1 },
        { label: 'Månedlig', value: 2 }, { label: 'Ukentlig', value: 3 }, { label: 'Daglig/nesten', value: 4 },
      ],
      null, null, null, null, null,
      [
        { label: 'Nei', value: 0 }, { label: 'Ja, men ikke siste år', value: 2 }, { label: 'Ja, siste år', value: 4 },
      ],
      [
        { label: 'Nei', value: 0 }, { label: 'Ja, men ikke siste år', value: 2 }, { label: 'Ja, siste år', value: 4 },
      ],
    ],
    defaultOptions: [
      { label: 'Aldri', value: 0 }, { label: 'Sjeldnere enn månedlig', value: 1 },
      { label: 'Månedlig', value: 2 }, { label: 'Ukentlig', value: 3 }, { label: 'Daglig/nesten', value: 4 },
    ],
  },
  dast10: {
    title: 'DAST-10',
    subtitle: 'Rusbruk-screening (siste 12 mnd)',
    color: '#059669',
    scoreKey: 'latestDast10',
    maxScore: 10,
    interpret: s => s === 0 ? 'Intet problem' : s <= 2 ? 'Lavt nivå' : s <= 5 ? 'Moderat' : s <= 8 ? 'Alvorlig' : 'Svært alvorlig',
    yesNo: true,
    questions: [
      'Har du brukt andre rusmidler enn de som er foreskrevet deg?',
      'Misbruker du mer enn ett rusmiddel om gangen?',
      'Er du alltid i stand til å slutte med rusmidler når du vil?',
      'Har du hatt blackouts eller flashbacks som følge av rusbruk?',
      'Har du noen gang følt deg dårlig eller skyldig over rusbruken din?',
      'Klager ektefelle/partner eller foreldre over rusbruken din?',
      'Har du forsømt familien pga. rusbruk?',
      'Har du bedrevet ulovlige aktiviteter for å skaffe deg rusmidler?',
      'Har du opplevd abstinenssymptomer når du sluttet med rusmidler?',
      'Har du hatt helseproblemer som følge av rusbruk?',
    ],
    reverse: [2], // Q3 is reversed (Yes=0, No=1)
  },
  cage: {
    title: 'CAGE',
    subtitle: 'Rask alkohol-screening',
    color: '#0284C7',
    scoreKey: 'latestCage',
    maxScore: 4,
    interpret: s => s <= 1 ? 'Sannsynligvis ikke avhengig' : s <= 2 ? 'Mulig alkoholproblem' : 'Sannsynlig alkoholavhengighet',
    yesNo: true,
    questions: [
      'Har du noen gang følt at du burde kutte ned på drikkingen? (Cut down)',
      'Har folk irritert deg ved å kritisere drikkingen din? (Annoyed)',
      'Har du noen gang følt deg dårlig eller skyldig over drikkingen? (Guilty)',
      'Har du noen gang drukket alkohol første ting om morgenen for å roe nervene eller bli kvitt bakrus? (Eye-opener)',
    ],
  },
  readiness: {
    title: 'Endringsvilje',
    subtitle: 'Motivasjon for bedring',
    color: '#0891B2',
    scoreKey: 'latestReadiness',
    maxScore: 30,
    interpret: s => s <= 10 ? 'Ikke klar' : s <= 20 ? 'Vurderer endring' : 'Klar for endring',
    questions: [
      'Jeg har et problem med mitt rusmiddelbruk',
      'Det er tid for meg å gjøre noe med rusbruken min',
      'Jeg vil gjerne endre rusbruken min',
      'Jeg er motivert til å slutte',
      'Jeg tror jeg kan klare å endre rusbruken min',
      'Jeg er klar til å starte endringsprosessen',
    ],
    options: [
      { label: 'Sterkt uenig',  value: 1 },
      { label: 'Uenig',         value: 2 },
      { label: 'Nøytral',       value: 3 },
      { label: 'Enig',          value: 4 },
      { label: 'Sterkt enig',   value: 5 },
    ],
  },
};

// ── Score card on list ────────────────────────────────────────────────────────
function QCard({ id, config, latestScore, onPress, theme }) {
  const total = latestScore != null
    ? Object.values(latestScore).reduce((a, b) => typeof b === 'number' ? a + b : a, 0)
    : null;
  const interp = total != null ? config.interpret(total) : null;

  return (
    <TouchableOpacity style={[s.qCard, { borderLeftColor: config.color, borderLeftWidth: 4 }]}
      onPress={onPress} activeOpacity={0.8}>
      <View style={{ flex: 1 }}>
        <Text style={[s.qTitle, { color: theme.text }]}>{config.title}</Text>
        <Text style={[s.qSubtitle, { color: theme.textMuted }]}>{config.subtitle}</Text>
        {interp && (
          <View style={[s.qBadge, { backgroundColor: config.color + '20' }]}>
            <Text style={[s.qBadgeText, { color: config.color }]}>
              {total} / {config.maxScore} — {interp}
            </Text>
          </View>
        )}
      </View>
      <Text style={[s.qArrow, { color: theme.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

// ── Individual questionnaire form ─────────────────────────────────────────────
function QuestionForm({ id, config, onBack, onSave, theme }) {
  const isYesNo    = config.yesNo;
  const isReadiness = Array.isArray(config.options) && !config.questions[0]?.includes?.('?') === false;
  const [answers, setAnswers] = useState({});
  const [saving,  setSaving]  = useState(false);

  const allAnswered = config.questions.every((_, i) => answers[i] != null);

  const total = Object.values(answers).reduce((a, b) => a + b, 0);

  const getOptions = (i) => {
    if (isYesNo) return [{ label: 'Ja', value: 1 }, { label: 'Nei', value: 0 }];
    if (config.options && Array.isArray(config.options[i])) return config.options[i];
    if (config.defaultOptions) return config.defaultOptions;
    if (Array.isArray(config.options)) return config.options;
    return RARELY;
  };

  const getValue = (i, raw) => {
    if (config.reverse?.includes(i)) return raw === 1 ? 0 : 1;
    return raw;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={[sf.header, { backgroundColor: config.color, paddingTop: 16 }]}>
        <TouchableOpacity onPress={onBack} style={sf.backBtn}>
          <Text style={sf.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={sf.headerTitle}>{config.title}</Text>
          <Text style={sf.headerSub}>{config.subtitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Score bar */}
      {Object.keys(answers).length > 0 && (
        <View style={[sf.scoreBar, { backgroundColor: config.color + '18' }]}>
          <Text style={[sf.scoreText, { color: config.color }]}>
            Skår: {total} / {config.maxScore} — {config.interpret(total)}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {config.questions.map((q, i) => {
          const opts    = getOptions(i);
          const current = answers[i];
          return (
            <View key={i} style={[sf.qBlock, { borderBottomColor: theme.border }]}>
              <Text style={[sf.qNum, { color: config.color }]}>{i + 1}.</Text>
              <Text style={[sf.qText, { color: theme.text }]}>{q}</Text>
              <View style={sf.optRow}>
                {opts.map(opt => {
                  const stored = getValue(i, opt.value);
                  const active = answers[i] === stored;
                  return (
                    <TouchableOpacity key={opt.value}
                      onPress={() => setAnswers(prev => ({ ...prev, [i]: stored }))}
                      style={[sf.optBtn,
                        { borderColor: active ? config.color : theme.border,
                          backgroundColor: active ? config.color + '18' : theme.surface }]}>
                      <Text style={[sf.optText,
                        { color: active ? config.color : theme.textSecondary },
                        active && { fontWeight: '700' }]}>
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

      {/* Save */}
      <View style={[sf.footer, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
        {!allAnswered && (
          <Text style={[sf.footerHint, { color: theme.textMuted }]}>
            {config.questions.length - Object.keys(answers).length} spørsmål gjenstår
          </Text>
        )}
        <TouchableOpacity
          style={[sf.saveBtn, { backgroundColor: allAnswered ? config.color : theme.border }]}
          disabled={!allAnswered || saving}
          onPress={async () => { setSaving(true); await onSave(id, answers); setSaving(false); }}
          activeOpacity={0.85}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={sf.saveBtnText}>Lagre skår</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sf = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  backBtn:     { width: 40 },
  backArrow:   { color: '#fff', fontSize: 28, lineHeight: 34 },
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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function QuestionnaireScreen({ navigation }) {
  const { theme }   = useTheme();
  const { patient, saveQuestionnaire } = usePatientCtx();
  const insets      = useSafeAreaInsets();
  const [active, setActive] = useState(null); // which questionnaire is open

  const handleSave = async (id, answers) => {
    try {
      const key = QUESTIONNAIRES[id].scoreKey;
      await saveQuestionnaire(key, answers);
      setActive(null);
    } catch (e) {
      Alert.alert('Feil', e.message);
    }
  };

  if (active) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgSecondary ?? '#F0F4F8' }} edges={['bottom']}>
        <QuestionForm
          id={active}
          config={QUESTIONNAIRES[active]}
          onBack={() => setActive(null)}
          onSave={handleSave}
          theme={theme}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgSecondary ?? '#F0F4F8' }} edges={['bottom']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.accent, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Spørreskjemaer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}>
        <Text style={[s.intro, { color: theme.textMuted }]}>
          Disse skjemaene hjelper deg og behandleren din å følge din psykiske helse og rusbruk over tid.
        </Text>
        {Object.entries(QUESTIONNAIRES).map(([id, config]) => (
          <QCard key={id} id={id} config={config}
            latestScore={patient?.['latestQuestionnaires']?.[config.scoreKey]}
            onPress={() => setActive(id)}
            theme={theme} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Hook alias — PatientContext exposes useLogs but we need saveQuestionnaire
function usePatientCtx() {
  const ctx = require('../../context/PatientContext');
  const { logs } = ctx.useLogs();
  return {
    patient: null,
    saveQuestionnaire: async (key, answers) => {
      const api = require('../../services/api').patientApi;
      await api.updateQuestionnaire(key, answers);
    },
  };
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  backBtn:     { width: 40 },
  backArrow:   { color: '#fff', fontSize: 30 },
  headerTitle: { flex: 1, color: '#fff', fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
  intro:       { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.lg },
  qCard: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  qTitle:     { fontSize: FontSize.lg, fontWeight: '700' },
  qSubtitle:  { fontSize: FontSize.sm, marginTop: 2, marginBottom: Spacing.sm },
  qBadge:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  qBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  qArrow:     { fontSize: 24, marginLeft: Spacing.sm },
});
