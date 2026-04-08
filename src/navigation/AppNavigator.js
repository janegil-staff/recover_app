// src/navigation/AppNavigator.js
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen         from '../screens/auth/LoginScreen';
import RegisterScreen      from '../screens/auth/RegisterScreen';
import PinSetupScreen      from '../screens/auth/PinSetupScreen';
import PinConfirmScreen    from '../screens/auth/PinConfirmScreen';
import PinVerifyScreen     from '../screens/auth/PinVerifyScreen';
import HomeScreen          from '../screens/home/HomeScreen';
import LogEntryScreen      from '../screens/log/LogEntryScreen';
import LogHistoryScreen    from '../screens/log/LogHistoryScreen';
import ProfileScreen       from '../screens/profile/ProfileScreen';
import QuestionnaireScreen from '../screens/questionnaire/QuestionnaireScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading, pinVerified } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // ── Auth ─────────────────────────────────────────────────────
          <>
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Register"   component={RegisterScreen} />
            <Stack.Screen name="PinSetup"   component={PinSetupScreen} />
            <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
          </>
        ) : !pinVerified ? (
          // ── PIN verify ────────────────────────────────────────────────
          <>
            <Stack.Screen name="PinVerify"  component={PinVerifyScreen} />
            <Stack.Screen name="PinSetup"   component={PinSetupScreen} />
            <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
          </>
        ) : (
          // ── Main app — flat stack, no tabs ────────────────────────────
          <>
            <Stack.Screen name="Home"          component={HomeScreen} />
            <Stack.Screen name="Log"           component={LogEntryScreen} />
            <Stack.Screen name="History"       component={LogHistoryScreen} />
            <Stack.Screen name="Profile"       component={ProfileScreen} />
            <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}