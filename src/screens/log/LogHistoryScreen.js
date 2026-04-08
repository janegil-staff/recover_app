import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
export default function LogHistoryScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.text }}>📅 History</Text>
        <Text style={{ color: theme.textMuted, marginTop: 8 }}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
