// src/navigation/AppNavigator.js
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import PinSetupScreen from "../screens/auth/PinSetupScreen";
import PinConfirmScreen from "../screens/auth/PinConfirmScreen";
import PinVerifyScreen from "../screens/auth/PinVerifyScreen";
import HomeScreen from "../screens/home/HomeScreen";
import LogEntryScreen from "../screens/log/LogEntryScreen";
import LogHistoryScreen from "../screens/log/LogHistoryScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import QuestionnaireScreen from "../screens/questionnaire/QuestionnaireScreen";
import QuestionnaireIntroScreen from "../screens/questionnaire/QuestionnaireIntroScreen";
import QuestionnaireFormScreen from "../screens/questionnaire/QuestionnaireFormScreen";
import ShareScreen from "../screens/share/ShareScreen";
import RecoveryStudiesScreen from "../screens/share/RecoveryStudiesScreen";
import PersonalSettingsScreen from "../screens/settings/PersonalSettingsScreen";
import LanguageScreen from "../screens/settings/LanguageScreen";
import MedicationsScreen from "../screens/medications/MedicationsScreen";
import MyDataScreen from "../screens/home/MyDataScreen";
import AdviceScreen from "../screens/advice/AdviceScreen";
import TermsScreen from "../screens/auth/TermsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading, pinVerified, isNewUser, setIsNewUser } = useAuth();
  const [onboardingDone, setOnboardingDone] = React.useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem("onboarding_done").then((v) => setOnboardingDone(!!v));
  }, []);

  const { theme } = useTheme();

  if (loading || onboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingDone || isNewUser ? (
          <Stack.Screen name="Onboarding" children={() => (
            <OnboardingScreen onDone={() => { setOnboardingDone(true); setIsNewUser(false); }} />
          )} />
        ) : !user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="PinSetup" component={PinSetupScreen} />
            <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
          </>
        ) : !pinVerified ? (
          <>
            <Stack.Screen name="PinVerify" component={PinVerifyScreen} />
            <Stack.Screen name="PinSetup" component={PinSetupScreen} />
            <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="MyData" component={MyDataScreen} />
            <Stack.Screen name="Advice" component={AdviceScreen} />
            <Stack.Screen name="Log" component={LogEntryScreen} />
            <Stack.Screen name="LogEntry" component={LogEntryScreen} />
            <Stack.Screen name="History" component={LogHistoryScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
            <Stack.Screen name="QuestionnaireIntro" component={QuestionnaireIntroScreen} />
            <Stack.Screen name="QuestionnaireForm" component={QuestionnaireFormScreen} />
            <Stack.Screen name="Medications" component={MedicationsScreen} />
            <Stack.Screen name="Share" component={ShareScreen} />
            <Stack.Screen name="RecoveryStudies" component={RecoveryStudiesScreen} />
            <Stack.Screen name="PersonalSettings" component={PersonalSettingsScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}