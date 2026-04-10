// src/screens/onboarding/OnboardingScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView, StatusBar, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslations } from '../../translations';

const { width } = Dimensions.get('window');

function getSlides(t) {
  return [
    {
      image:      require('../../../assets/images/onboarding_8.jpg'),
      imageStyle: { width: 180, height: 180, borderRadius: 90 },
      bg: '#ffffff', accent: '#4A7AB5', dark: false,
      title:    t.onboarding1Title,
      subtitle: t.onboarding1Subtitle,
    },
    {
      image:    require('../../../assets/images/onboarding_1.jpg'),
      bg: '#ffffff', accent: '#4A7AB5', dark: false,
      title:    t.onboarding2Title,
      subtitle: t.onboarding2Subtitle,
    },
    {
      image:    require('../../../assets/images/onboarding_2.jpg'),
      bg: '#ffffff', accent: '#f4a261', dark: false,
      title:    t.onboarding3Title,
      subtitle: t.onboarding3Subtitle,
    },
    {
      image:    require('../../../assets/images/onboarding_3.jpg'),
      bg: '#ffffff', accent: '#7C3AED', dark: false,
      title:    t.onboarding4Title,
      subtitle: t.onboarding4Subtitle,
    },
    {
      image:    require('../../../assets/images/onboarding_4.jpg'),
      bg: '#ffffff', accent: '#4A7AB5', dark: false,
      title:    t.onboarding5Title,
      subtitle: t.onboarding5Subtitle,
    },
  ];
}

export default function OnboardingScreen({ onDone }) {
  const [lang, setLang] = useState('en');
  useEffect(() => {
    AsyncStorage.getItem('lang_override').then(v => { if (v) setLang(v); }).catch(() => {});
  }, []);
  const t      = getTranslations(lang);
  const SLIDES = getSlides(t);
  const [index, setIndex] = useState(0);
  const scrollRef         = useRef(null);
  const insets            = useSafeAreaInsets();
  const slide             = SLIDES[index];
  const isLast            = index === SLIDES.length - 1;

  const goTo = (i) => {
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const handleNext = async () => {
    if (isLast) {
      await AsyncStorage.setItem('onboarding_done', '1');
      onDone();
    } else {
      goTo(index + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    onDone();
  };

  return (
    <View style={[s.root, { backgroundColor: slide.bg }]}>
      <StatusBar
        barStyle={slide.dark ? 'light-content' : 'dark-content'}
        backgroundColor={slide.bg}
      />

      {!isLast && (
        <TouchableOpacity style={[s.skip, { top: insets.top + 12 }]} onPress={handleSkip}>
          <Text style={[s.skipText, { color: slide.accent }]}>{t.skip ?? 'Skip'}</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((sl, i) => (
          <View key={i} style={[s.slide, { width, paddingTop: insets.top + 60, backgroundColor: sl.bg }]}>
            <View style={s.imageWrap}>
              <Image source={sl.image} style={[s.image, sl.imageStyle]} resizeMode="contain" />
            </View>
            <Text style={[s.title, { color: sl.dark ? '#fff' : '#1a2c3d' }]}>{sl.title}</Text>
            <Text style={[s.subtitle, { color: sl.dark ? 'rgba(255,255,255,0.8)' : '#3a5272' }]}>{sl.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[s.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[
                s.dot,
                { backgroundColor: slide.accent },
                i !== index && { opacity: 0.25, width: 8 },
                i === index && { width: 24 },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: slide.accent }]}
          onPress={handleNext} activeOpacity={0.85}>
          <Text style={s.btnText}>
            {isLast ? (t.getStarted ?? 'GET STARTED') : (t.next ?? 'NEXT')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1 },
  skip:      { position: 'absolute', right: 20, zIndex: 10, paddingVertical: 6, paddingHorizontal: 12 },
  skipText:  { fontSize: 15, fontWeight: '600' },
  slide:     { alignItems: 'center', paddingHorizontal: 36 },
  imageWrap: { marginBottom: 36, alignItems: 'center', justifyContent: 'center' },
  image:     { width: 260, height: 260 },
  title:     { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 16, letterSpacing: -0.3 },
  subtitle:  { fontSize: 16, textAlign: 'center', lineHeight: 26 },
  bottom:    { paddingHorizontal: 24, paddingTop: 16, alignItems: 'center', gap: 20 },
  dots:      { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot:       { height: 8, width: 8, borderRadius: 4 },
  btn: {
    width: width - 48, height: 54, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
});
