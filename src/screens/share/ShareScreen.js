// src/screens/share/ShareScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Switch,
  ActivityIndicator, Alert, ScrollView, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { patientApi } from '../../services/api';
import { styles, TOTAL_SECONDS, SHARE_DOMAIN } from './shareStyles';
import { ArcTimer, IconCode, IconQuestionnaire, IconStudies } from './shareComponents';

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab({ theme, t }) {
  const PRIMARY = theme?.accent ?? '#4A7AB5';
  const [code,         setCode]         = useState(null);
  const [secondsLeft,  setSecondsLeft]  = useState(TOTAL_SECONDS);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [loading,      setLoading]      = useState(false);
  const timerRef = useRef(null);
  const expired  = secondsLeft === 0;

  const startTimer = useCallback((expiry) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const remaining = Math.max(0, Math.round((new Date(expiry) - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(timerRef.current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  const generateCode = useCallback(async (notes = includeNotes) => {
    setLoading(true);
    try {
      const data = await patientApi.generateShareCode({ includeNotes: notes });
      setCode(data.code);
      startTimer(data.expiresAt);
    } catch {
      Alert.alert('Error', t.errorGenCode ?? 'Could not generate share code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [includeNotes, startTimer]);

  useEffect(() => {
    generateCode();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const copyCode = () => {
    if (code) Share.share({
      message: `${t.shareCodeMsg ?? 'Your Recover share code'}: ${code}\n\n${SHARE_DOMAIN}`,
    });
  };

  return (
    <ScrollView style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, alignItems: 'center', paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Code card */}
      <TouchableOpacity style={styles.codeCard} onPress={copyCode} activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color={PRIMARY} size="large" />
        ) : (
          <>
            <Text style={[styles.codeText, { color: expired ? '#ccc' : PRIMARY }]}>
              {code ? code.split('').join(' ') : '— — — — — —'}
            </Text>
            <View style={styles.brandRow}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path d="M12 2 C7 2 3 6 3 12 C3 15 4.5 17.5 6.5 19 L6.5 22 L9.5 20 C10.3 20.3 11.1 20.5 12 20.5 C17 20.5 21 16.5 21 11.5 C21 6.5 17 2.5 12 2 Z"
                  fill="none" stroke={PRIMARY} strokeWidth="1.5" />
                <Circle cx="9" cy="12" r="1.2" fill={PRIMARY} />
                <Circle cx="12" cy="12" r="1.2" fill={PRIMARY} />
                <Circle cx="15" cy="12" r="1.2" fill={PRIMARY} />
              </Svg>
              <Text style={styles.brandText}>
                <Text style={{ fontWeight: '700', color: PRIMARY }}>RECOVER</Text>
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Text style={styles.description}>
          {t.shareDescription ?? 'Secure access to your recovery report on this website:'}
        </Text>
        {code && (
          <TouchableOpacity onPress={copyCode}>
            <Text style={[styles.shareUrl, { color: PRIMARY }]}>
              {SHARE_DOMAIN}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Include notes toggle */}
      <View style={styles.toggleRow}>
        <Switch
          value={includeNotes}
          onValueChange={val => { setIncludeNotes(val); generateCode(val); }}
          trackColor={{ false: '#D1D5DB', true: PRIMARY }}
          thumbColor="#fff" ios_backgroundColor="#D1D5DB"
        />
        <Text style={[styles.toggleLabel, { color: PRIMARY }]}>
          {t.sharePersonalNotes ?? 'Include personal notes'}
        </Text>
      </View>

      {/* Timer card */}
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Svg width="18" height="18" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" fill="none" stroke={expired ? '#ccc' : PRIMARY} strokeWidth="1.5" />
            <Path d="M12 7 L12 12 L15 14" stroke={expired ? '#ccc' : PRIMARY} strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
          <Text style={[styles.timerLabel, { color: expired ? '#ccc' : PRIMARY }]}>
            {expired
              ? (t.codeExpired   ?? 'Code has expired')
              : (t.codeValidFor  ?? 'The code is valid for 10 minutes')}
          </Text>
        </View>
        <ArcTimer secondsLeft={secondsLeft} color={expired ? '#D1D5DB' : PRIMARY} />
        <View style={styles.divider} />
        <TouchableOpacity onPress={() => generateCode()} disabled={loading} style={styles.generateBtn}>
          {loading
            ? <ActivityIndicator color={PRIMARY} />
            : <Text style={[styles.generateText, { color: PRIMARY }]}>
                {t.generateNewCode ?? 'GENERATE NEW CODE'}
              </Text>
          }
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ShareScreen({ navigation }) {
  const { theme } = useTheme();
  const { t }     = useLang();
  const insets    = useSafeAreaInsets();
  const PRIMARY   = theme?.accent ?? '#4A7AB5';

  const tabs = [
    { key: 'code',          label: t.shareTabCode          ?? 'Code',          Icon: IconCode          },
    { key: 'questionnaire', label: t.shareTabQuestionnaire ?? 'Questionnaire', Icon: IconQuestionnaire },
    { key: 'studies',       label: t.shareTabStudies       ?? 'Studies',       Icon: IconStudies       },
  ];

  const handleTab = (key) => {
    if (key === 'questionnaire') navigation.navigate('Questionnaire');
    if (key === 'studies')       navigation.navigate('RecoveryStudies');
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

      {/* Code tab content */}
      <View style={{ flex: 1 }}>
        <CodeTab theme={theme} t={t} />
      </View>

      {/* Bottom tab bar */}
      <View style={styles.tabBarWrapper}>
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
          {tabs.map(({ key, label, Icon }) => {
            const active = key === 'code';
            return (
              <TouchableOpacity key={key} style={styles.tabBtn}
                onPress={() => handleTab(key)} activeOpacity={0.7}>
                <Icon color={active ? PRIMARY : '#a0b8d0'} size={24} />
                <Text style={[styles.tabLabel, {
                  color: active ? PRIMARY : '#a0b8d0',
                  fontWeight: active ? '700' : '500',
                }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

    </View>
  );
}
