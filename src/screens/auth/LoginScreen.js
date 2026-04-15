// src/screens/auth/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Linking,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { FontSize, Spacing } from "../../constants/theme";

const APP_VERSION = "1.0.0";
const COMPANY     = "Qup DA";
const EMAIL       = "post@quprecover.com";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [pin, setPin]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const s = makeStyles(theme);

  const submit = async () => {
    if (!email.trim() || !pin) {
      setError(t.errorSave);
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be 4 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email.trim().toLowerCase(), pin);
    } catch (e) {
      setError(e?.message ?? "Invalid email or PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={s.logoWrap}>
            <Image
              source={require("../../../assets/images/focus_logo.png")}
              style={s.logo}
              resizeMode="cover"
            />
          </View>

          {/* Title */}
          <Text style={s.title}>{t.appName ?? "Recover"}</Text>
          {!!t.tagline && <Text style={s.tagline}>{t.tagline}</Text>}

          <View style={{ height: 36 }} />

          {/* Error */}
          {!!error && <Text style={s.error}>{error}</Text>}

          {/* Fields */}
          <UnderlineField
            placeholder={t.email ?? "Epost"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            theme={theme}
          />
          <UnderlineField
            placeholder={t.pinCode ?? "PIN"}
            value={pin}
            onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            theme={theme}
          />

          <View style={{ height: 28 }} />

          {/* Login button */}
          <TouchableOpacity style={s.btn} onPress={submit} activeOpacity={0.85}>
            <Text style={s.btnText}>
              {loading ? "..." : (t.login ?? "Logg inn").toUpperCase()}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />

          {/* Links */}
          <Text style={s.linkMuted}>
            {t.noAccount ?? "Har du ikke konto ?"}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 6 }}
          >
            <Text style={s.linkPrimary}>
              {(t.signUp ?? "Opprett konto").toUpperCase()}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={s.linkPrimary}>
              {(t.forgotPin ?? "Glemt PIN-kode?").toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>{COMPANY}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${EMAIL}`)}>
              <Text style={s.footerLink}>{EMAIL}</Text>
            </TouchableOpacity>
            <Text style={s.footerText}>v{APP_VERSION}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function UnderlineField({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  theme,
}) {
  return (
    <View style={{ width: "100%", marginBottom: 24 }}>
      <TextInput
        style={{
          color: theme.text,
          fontSize: FontSize.md,
          fontWeight: "500",
          paddingVertical: 8,
          paddingHorizontal: 0,
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        selectionColor={theme.accent}
      />
      <View style={{ height: 1.5, backgroundColor: theme.inputLine ?? "#ccc", width: "100%" }} />
    </View>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    bg: {
      flex: 1,
      backgroundColor: t.bg,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 32,
      paddingTop: 72,
      paddingBottom: 40,
      alignItems: "center",
    },
    logoWrap: {
      width: 120,
      height: 120,
      borderRadius: 22,
      overflow: "hidden",
      marginBottom: 16,
    },
    logo: {
      width: 120,
      height: 120,
    },
    title: {
      color: t.text,
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: 0.3,
    },
    tagline: {
      color: t.textMuted,
      fontSize: FontSize.xs,
      textAlign: "center",
      marginTop: 4,
      letterSpacing: 1,
    },
    error: {
      color: t.error,
      fontSize: FontSize.sm,
      marginBottom: 16,
      width: "100%",
    },
    btn: {
      width: "100%",
      height: 54,
      backgroundColor: t.accent,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: t.accent,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    btnText: {
      color: "#fff",
      fontSize: FontSize.md,
      fontWeight: "800",
      letterSpacing: 2,
    },
    linkMuted: {
      color: t.textSecondary,
      fontSize: FontSize.sm,
      fontWeight: "500",
      textAlign: "center",
    },
    linkPrimary: {
      color: t.accent,
      fontSize: FontSize.sm,
      fontWeight: "700",
      letterSpacing: 1.5,
      textAlign: "center",
    },
    footer: {
      marginTop: 48,
      alignItems: "center",
      gap: 4,
    },
    footerText: {
      color: t.textMuted,
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
    },
    footerLink: {
      color: t.accent,
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
    },
  });