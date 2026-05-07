// src/screens/share/RecoveryStudiesScreen.js
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { makeStyles } from './shareStyles';

export default function RecoveryStudiesScreen({ navigation }) {
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();
  const styles    = useMemo(() => makeStyles(theme), [theme]);

  const TEXT       = theme?.text       ?? '#1a2c3d';
  const TEXT_MUTED = theme?.textMuted  ?? '#7a9ab8';
  const CARD_BG    = theme?.card       ?? '#fff';
  const BORDER     = theme?.border     ?? '#e8eef5';

  return (
    <View style={[styles.root, { backgroundColor: theme.bgSecondary ?? theme.bg ?? '#F0F4F8' }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#2d4a6e']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.getParent()?.goBack()}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.shareData ?? 'Share Data'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 16,
            padding: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', marginBottom: 4, color: TEXT }}>
            {t.studiesTitle ?? 'Research & Studies'}
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 18, color: TEXT_MUTED }}>
            {t.studiesSubtitle ??
              'Recent peer-reviewed research relevant to substance use recovery and treatment.'}
          </Text>
        </View>

        {/* Empty state */}
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>📭</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: TEXT,
              marginBottom: 8,
            }}
          >
            {t.studiesEmpty ?? 'No active studies'}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: TEXT_MUTED,
              textAlign: 'center',
              lineHeight: 20,
              paddingHorizontal: 20,
            }}
          >
            {t.studiesEmptySubtitle ??
              'There are no active research studies at the moment. Check back later.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}