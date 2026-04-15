// src/screens/settings/PersonalSettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { patientApi, authApi } from "../../services/api";
import { FontSize, Spacing } from "../../constants/theme";
import {
  enableReminder,
  disableReminder,
  getSavedReminderTime,
  getSavedReminderEnabled,
} from "../../hooks/useReminder";

function ToggleRow({ label, subtitle, value, onValueChange, theme, last, extra }) {
  return (
    <View style={{
      paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border,
      flexDirection: "row", alignItems: "flex-start",
      justifyContent: "space-between", gap: Spacing.md,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: FontSize.md, fontWeight: "500", marginBottom: subtitle ? 3 : 0 }}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, lineHeight: 18 }}>
            {subtitle}
          </Text>
        ) : null}
        {extra ? <View style={{ marginTop: 6 }}>{extra}</View> : null}
      </View>
      <Switch
        value={value} onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#22C55E" }}
        thumbColor="#fff" ios_backgroundColor="#D1D5DB"
        style={{ marginTop: 2 }}
      />
    </View>
  );
}

function LinkRow({ label, value, onPress, theme, last }) {
  return (
    <TouchableOpacity onPress={onPress} style={{
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: Spacing.lg, paddingVertical: 16,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border,
    }}>
      <Text style={{ color: theme.text, fontSize: FontSize.md, fontWeight: "500" }}>{label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: FontSize.md }}>{value} ›</Text>
    </TouchableOpacity>
  );
}

export default function PersonalSettingsScreen({ navigation }) {
  const { user, updateUser, logout } = useAuth();
  const { theme, override, setTheme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime]       = useState(new Date());
  const [showTimePicker, setShowTimePicker]   = useState(false);

  const [darkMode,        setDarkMode]        = useState(override === "dark");
  const [requirePin,      setRequirePin]      = useState(user?.settings?.requirePin ?? true);
  const [trackSubstances, setTrackSubstances] = useState(user?.settings?.trackSubstances ?? true);
  const [trackCravings,   setTrackCravings]   = useState(user?.settings?.trackCravings ?? true);
  const [trackMood,       setTrackMood]       = useState(user?.settings?.trackMood ?? true);
  const [trackMedication, setTrackMedication] = useState(user?.settings?.trackMedication ?? true);
  const [trackWeight,     setTrackWeight]     = useState(user?.settings?.trackWeight ?? true);
  const [shareWithDoctor, setShareWithDoctor] = useState(user?.settings?.shareWithDoctor ?? false);
  const [weeklyReport,    setWeeklyReport]    = useState(user?.settings?.weeklyReport ?? false);

  // Load saved reminder state from AsyncStorage on mount
  useEffect(() => {
    getSavedReminderTime().then(({ hour, minute }) => {
      const d = new Date();
      d.setHours(hour, minute, 0, 0);
      setReminderTime(d);
    });
    getSavedReminderEnabled().then(setReminderEnabled);
  }, []);

  const handleDarkMode = (val) => { setDarkMode(val); setTheme(val ? "dark" : "light"); };
  const save = (key, val) => { patientApi.updateProfile({ settings: { [key]: val } }).catch(() => {}); };
  const toggle = (setter, key) => (val) => { setter(val); save(key, val); };

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleReminderToggle = async (val) => {
    setReminderEnabled(val);
    save("reminderEnabled", val);
    try {
      if (val) {
        await enableReminder(
          reminderTime.getHours(),
          reminderTime.getMinutes(),
          t.reminderTitle ?? "Recover",
          t.reminderBody  ?? "Time to log your daily entry 📋",
        );
      } else {
        await disableReminder();
      }
    } catch (e) {
      Alert.alert(t.error ?? "Error", e?.message ?? "Could not set reminder.");
      setReminderEnabled(!val); // revert on failure
    }
  };

  const handleTimeChange = async (event, selectedDate) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (!selectedDate) return;
    setReminderTime(selectedDate);
    if (reminderEnabled) {
      try {
        await enableReminder(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
          t.reminderTitle ?? "Recover",
          t.reminderBody  ?? "Time to log your daily entry 📋",
        );
      } catch (e) {
        Alert.alert(t.error ?? "Error", e?.message ?? "Could not update reminder.");
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t.deleteAccount ?? "Delete account",
      t.deleteAccountConfirm ?? "Are you sure? This cannot be undone. All your data will be permanently deleted.",
      [
        { text: t.cancel ?? "Cancel", style: "cancel" },
        {
          text: t.deleteAccount ?? "Delete account",
          style: "destructive",
          onPress: async () => {
            try {
              await authApi.deleteAccount();
              await logout();
            } catch (e) {
              Alert.alert(t.error ?? "Error", e?.message ?? "Could not delete account. Please try again.");
            }
          },
        },
      ],
    );
  };

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>
      <View style={[s.header, { backgroundColor: theme.accent, paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.personalSettings}</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── App behaviour ── */}
        <View style={s.section}>
          <ToggleRow
            label={t.activateReminder ?? "Daily reminder"}
            subtitle={t.activateReminderSubtitle ?? "Get a daily reminder to log"}
            value={reminderEnabled}
            onValueChange={handleReminderToggle}
            theme={theme}
            extra={
              reminderEnabled ? (
                <TouchableOpacity
                  onPress={() => setShowTimePicker(v => !v)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    backgroundColor: theme.accent + "18",
                    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>🕐</Text>
                  <Text style={{ fontSize: FontSize.sm, fontWeight: "700", color: theme.accent }}>
                    {formatTime(reminderTime)}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs ?? 11, color: theme.textMuted }}>
                    {t.tapToChange ?? "tap to change"}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />

          {/* Time picker */}
          {showTimePicker && reminderEnabled && (
            <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm }}>
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={{ alignSelf: "flex-end", paddingTop: 4 }}
                >
                  <Text style={{ color: theme.accent, fontWeight: "700", fontSize: FontSize.sm }}>
                    {t.done ?? "Done"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ToggleRow
            label={t.darkMode}
            subtitle="Activate dark mode if you are sensitive to light."
            value={darkMode}
            onValueChange={handleDarkMode}
            theme={theme}
          />
          <ToggleRow
            label={t.requirePin}
            value={requirePin}
            onValueChange={toggle(setRequirePin, "requirePin")}
            theme={theme}
            last
          />
        </View>

        <View style={s.divider} />

        {/* ── Tracking fields ── */}
        <View style={s.section}>
          <ToggleRow label={t.trackSubstances} subtitle="Log which substances were used each day."    value={trackSubstances} onValueChange={toggle(setTrackSubstances, "trackSubstances")} theme={theme} />
          <ToggleRow label={t.trackCravings}   subtitle="Track craving intensity from 0 to 5."        value={trackCravings}   onValueChange={toggle(setTrackCravings,   "trackCravings")}   theme={theme} />
          <ToggleRow label={t.trackMood}        subtitle="Log mood and wellbeing each day."            value={trackMood}       onValueChange={toggle(setTrackMood,        "trackMood")}       theme={theme} />
          <ToggleRow label={t.trackMedication}  subtitle="Log whether you took your medication."      value={trackMedication} onValueChange={toggle(setTrackMedication,  "trackMedication")} theme={theme} />
          <ToggleRow label={t.trackWeight}      subtitle="Log your weight as part of your recovery."  value={trackWeight}     onValueChange={toggle(setTrackWeight,      "trackWeight")}     theme={theme} last />
        </View>

        <View style={s.divider} />

        {/* ── Sharing ── */}
        <View style={s.section}>
          <ToggleRow label={t.weeklyReport} subtitle="Receive a weekly overview of your recovery trends." value={weeklyReport}    onValueChange={toggle(setWeeklyReport,    "weeklyReport")}    theme={theme} />
          <ToggleRow label={t.shareData}    subtitle="Allow your clinician to view your logs and trends."  value={shareWithDoctor} onValueChange={toggle(setShareWithDoctor, "shareWithDoctor")} theme={theme} last />
        </View>

        <View style={s.divider} />

        {/* ── Delete account ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.deleteRow} onPress={handleDeleteAccount}>
            <Text style={s.deleteText}>{t.deleteAccount ?? "Delete account"}</Text>
            <Text style={s.deleteChevron}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (t, insets) =>
  StyleSheet.create({
    root:          { flex: 1, backgroundColor: t.bgSecondary ?? "#F0F4F8" },
    header:        { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    headerBtn:     { width: 40 },
    headerBack:    { color: "#fff", fontSize: 28, lineHeight: 34 },
    headerTitle:   { flex: 1, color: "#fff", fontSize: FontSize.lg, fontWeight: "600", textAlign: "center" },
    divider:       { height: Spacing.md, backgroundColor: t.bgSecondary ?? "#F0F4F8" },
    section:       { backgroundColor: t.bg ?? "#fff" },
    deleteRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: 16 },
    deleteText:    { color: "#E53935", fontSize: FontSize.md, fontWeight: "500" },
    deleteChevron: { color: "#E53935", fontSize: FontSize.lg },
  });