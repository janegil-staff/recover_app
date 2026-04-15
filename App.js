// App.js
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { LangProvider } from "./src/context/LangContext";
import { LogsProvider } from "./src/context/PatientContext";
import { AdviceProvider } from "./src/context/AdviceContext";
import { restoreReminderOnLaunch } from "./src/hooks/useReminder";

export default function App() {
  useEffect(() => {
    restoreReminderOnLaunch("Recover", "Time to log your daily entry 📋");
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LangProvider>
            <LogsProvider>
              <AdviceProvider>
                <AppNavigator />
              </AdviceProvider>
            </LogsProvider>
          </LangProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
