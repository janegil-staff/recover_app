// src/screens/medications/MedicationsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { FontSize, Spacing } from '../../constants/theme';

export default function MedicationsScreen({ navigation }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 34, color: theme.accent, lineHeight: 40 }}>‹</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>💊 Medications</Text>
        <Text style={{ color: theme.textMuted, marginTop: 8 }}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
