// src/screens/settings/AboutScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { FontSize, Spacing, Radius } from "../../constants/theme";

function Section({ title, children, theme }) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Text
        style={{
          color: theme.accent,
          fontSize: FontSize.md,
          fontWeight: "700",
          marginBottom: Spacing.sm,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: FontSize.sm,
          lineHeight: 22,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
        >
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.about ?? "About"}</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginBottom: Spacing.xl }}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.sm }}>💊</Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: 0.5,
            }}
          >
            Recover
          </Text>
          <Text
            style={{
              color: theme.textMuted,
              fontSize: FontSize.sm,
              marginTop: 4,
            }}
          >
            by Qup DA
          </Text>
          <Text
            style={{
              color: theme.textMuted,
              fontSize: FontSize.xs,
              marginTop: 2,
            }}
          >
            Version 1.0.0
          </Text>
        </View>

        <Section title={t.aboutWhatTitle ?? "What is Recover?"} theme={theme}>
          {t.aboutWhatBody ??
            "Recover is a personal harm reduction and recovery support app developed by Qup DA."}
        </Section>

        <Section title={t.aboutWhoTitle ?? "Who is it for?"} theme={theme}>
          {t.aboutWhoBody ??
            "Recover is designed for individuals working through substance use challenges."}
        </Section>

        <Section title={t.aboutDataTitle ?? "Your data"} theme={theme}>
          {t.aboutDataBody ??
            "All data is stored securely and never sold to third parties."}
        </Section>

        <Section
          title={t.aboutDisclaimerTitle ?? "Medical disclaimer"}
          theme={theme}
        >
          {t.aboutDisclaimerBody ??
            "Recover is not a medical device. Always consult a qualified healthcare professional."}
        </Section>

        <Section title={t.aboutContactTitle ?? "Contact"} theme={theme}>
          {t.aboutContactBody ??
            "Qup DA\nEmail: support@qupda.com\nWebsite: www.qupda.com"}
        </Section>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (t, insets) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      backgroundColor: t.accent,
    },
    headerBtn: { width: 40 },
    headerBack: { color: "#fff", fontSize: 28, lineHeight: 34 },
    headerTitle: {
      flex: 1,
      color: "#fff",
      fontSize: FontSize.lg,
      fontWeight: "600",
      textAlign: "center",
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: Spacing.xl,
      paddingBottom: 50,
    },
  });
