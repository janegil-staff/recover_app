// src/screens/share/RecoveryStudiesScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { styles, smCard } from './shareStyles';
import { IconCode, IconQuestionnaire, IconStudies } from './shareComponents';

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

        <View style={{ ...smCard }}>
          <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 4, color: NAVY }}>
            {t.studiesTitle ?? 'Research & Studies'}
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 18, color: MUTED }}>
            {t.studiesSubtitle ?? 'Recent peer-reviewed research relevant to substance use recovery and treatment.'}
          </Text>
        </View>

        {/* Empty state */}
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>📭</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: NAVY, marginBottom: 8 }}>
            {t.studiesEmpty ?? 'No active studies'}
          </Text>
          <Text style={{ fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 }}>
            {t.studiesEmptySubtitle ?? 'There are no active research studies at the moment. Check back later.'}
          </Text>
        </View>

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