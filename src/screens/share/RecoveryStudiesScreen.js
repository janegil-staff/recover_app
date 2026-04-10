// src/screens/share/RecoveryStudiesScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing } from '../../constants/theme';
import { styles, smCard } from './shareStyles';
import { IconCode, IconQuestionnaire, IconStudies } from './shareComponents';

const STUDIES = [
  {
    title:    'Medication-Assisted Treatment for Opioid Use Disorder',
    journal:  'New England Journal of Medicine',
    year:     '2023',
    summary:  'Comprehensive review of buprenorphine and methadone outcomes, showing 50–60% reduction in opioid use and mortality when combined with psychosocial support.',
    tag:      'MAT',
    tagColor: '#4A7AB5',
    url:      'https://www.nejm.org',
  },
  {
    title:    'Long-acting Injectable Buprenorphine in Addiction Treatment',
    journal:  'JAMA Psychiatry',
    year:     '2023',
    summary:  'Monthly depot injections (Buvidal, Sublocade) show equivalent efficacy to daily sublingual buprenorphine with significantly improved adherence rates.',
    tag:      'Injectable',
    tagColor: '#4a7ab5',
    url:      'https://jamanetwork.com/journals/jamapsychiatry',
  },
  {
    title:    'Sleep Disturbance in Substance Use Disorder Recovery',
    journal:  'Sleep Medicine Reviews',
    year:     '2022',
    summary:  'Meta-analysis of 52 studies showing that sleep disorders significantly increase relapse risk — early intervention improves long-term outcomes.',
    tag:      'Sleep',
    tagColor: '#7AABDB',
    url:      'https://www.sciencedirect.com/journal/sleep-medicine-reviews',
  },
  {
    title:    'Digital Self-Monitoring in Substance Use Recovery',
    journal:  'Journal of Substance Abuse Treatment',
    year:     '2024',
    summary:  'Daily tracking apps for mood, cravings and substance use improve treatment adherence and give clinicians actionable data between appointments.',
    tag:      'Digital Health',
    tagColor: '#FBBF24',
    url:      'https://www.sciencedirect.com/journal/journal-of-substance-abuse-treatment',
  },
  {
    title:    'Craving Patterns and Relapse Prediction',
    journal:  'Drug and Alcohol Dependence',
    year:     '2023',
    summary:  'Ecological momentary assessment studies show craving intensity logged daily predicts relapse up to 72 hours in advance with 78% sensitivity.',
    tag:      'Cravings',
    tagColor: '#FB923C',
    url:      'https://www.sciencedirect.com/journal/drug-and-alcohol-dependence',
  },
  {
    title:    'Naltrexone for Alcohol and Opioid Use Disorder',
    journal:  'Cochrane Database of Systematic Reviews',
    year:     '2022',
    summary:  'Systematic review of 40 RCTs confirming naltrexone (oral and injectable) significantly reduces heavy drinking days and opioid relapse compared to placebo.',
    tag:      'Treatment',
    tagColor: '#A78BFA',
    url:      'https://www.cochranelibrary.com',
  },
];

export default function RecoveryStudiesScreen({ navigation }) {
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();
  const PRIMARY   = theme?.accent ?? '#4A7AB5';
  const NAVY      = '#1a2c3d';
  const MUTED     = '#7a9ab8';

  const tabs = [
    { key: 'code',          label: t.shareTabCode          ?? 'Code',          Icon: IconCode          },
    { key: 'questionnaire', label: t.shareTabQuestionnaire ?? 'Questionnaire', Icon: IconQuestionnaire },
    { key: 'studies',       label: t.shareTabStudies       ?? 'Studies',       Icon: IconStudies       },
  ];

  const handleTab = (key) => {
    if (key === 'code')          navigation.navigate('Share');
    if (key === 'questionnaire') navigation.navigate('Questionnaire');
  };

  const s = {
    introCard:   { ...smCard },
    introTitle:  { fontSize: 15, fontWeight: '700', marginBottom: 4, color: NAVY },
    introSub:    { fontSize: 13, lineHeight: 18, color: MUTED },
    card:        { ...smCard },
    cardTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    tag:         { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
    tagText:     { fontSize: 11, fontWeight: '700' },
    year:        { fontSize: 11, color: MUTED },
    cardTitle:   { fontSize: 14, fontWeight: '700', marginBottom: 4, color: NAVY },
    cardJournal: { fontSize: 12, fontWeight: '500', marginBottom: 8, color: PRIMARY },
    cardSummary: { color: '#555', fontSize: 13, lineHeight: 19 },
    readMore:    { marginTop: 10, alignItems: 'flex-end' },
    readMoreText:{ fontSize: 12, fontWeight: '600', color: PRIMARY },
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bgSecondary ?? '#F0F4F8' }]}>

      {/* Header */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#0f5a4a']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.shareData ?? 'Share Data'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}>

        <View style={s.introCard}>
          <Text style={s.introTitle}>{t.studiesTitle ?? 'Research & Studies'}</Text>
          <Text style={s.introSub}>
            {t.studiesSubtitle ?? 'Recent peer-reviewed research relevant to substance use recovery and treatment.'}
          </Text>
        </View>

        {STUDIES.map((study, i) => (
          <TouchableOpacity key={i} style={s.card} activeOpacity={0.75}
            onPress={() => study.url && Linking.openURL(study.url)}>
            <View style={s.cardTop}>
              <View style={[s.tag, { backgroundColor: study.tagColor + '22' }]}>
                <Text style={[s.tagText, { color: study.tagColor }]}>{study.tag}</Text>
              </View>
              <Text style={s.year}>{study.year}</Text>
            </View>
            <Text style={s.cardTitle}>{study.title}</Text>
            <Text style={s.cardJournal}>{study.journal}</Text>
            <Text style={s.cardSummary}>{study.summary}</Text>
            <View style={s.readMore}>
              <Text style={s.readMoreText}>{t.readMore ?? 'Read more'} →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={styles.tabBarWrapper}>
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
          {tabs.map(({ key, label, Icon }) => {
            const active = key === 'studies';
            return (
              <TouchableOpacity key={key} style={styles.tabBtn}
                onPress={() => handleTab(key)} activeOpacity={0.7}>
                <Icon color={active ? PRIMARY : '#a0b8d0'} size={24} />
                <Text style={[styles.tabLabel, {
                  color:      active ? PRIMARY : '#a0b8d0',
                  fontWeight: active ? '700'   : '500',
                }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

    </View>
  );
}
