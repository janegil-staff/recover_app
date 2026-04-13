// src/screens/advice/AdviceScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useAdvice } from "../../context/AdviceContext";
import { patientApi } from "../../services/api";
import { FontSize, Spacing, Radius } from "../../constants/theme";

const CATEGORIES = [
  "all",
  "cravings",
  "mood",
  "sleep",
  "medication",
  "wellbeing",
  "relationships",
];
const CAT_ICONS = {
  all: "🌟",
  cravings: "🔥",
  mood: "😊",
  sleep: "😴",
  medication: "💊",
  wellbeing: "💙",
  relationships: "🤝",
};
const STATUS_COLORS = {
  new: "#22C55E",
  viewed: "#9CA3AF",
  relevant: "#F97316",
};

const ADVICE_KEYS = [
  { id: "c1", category: "cravings" },
  { id: "c2", category: "cravings" },
  { id: "c3", category: "cravings" },
  { id: "m1", category: "mood" },
  { id: "m2", category: "mood" },
  { id: "m3", category: "mood" },
  { id: "s1", category: "sleep" },
  { id: "s2", category: "sleep" },
  { id: "s3", category: "sleep" },
  { id: "med1", category: "medication" },
  { id: "med2", category: "medication" },
  { id: "med3", category: "medication" },
  { id: "w1", category: "wellbeing" },
  { id: "w2", category: "wellbeing" },
  { id: "w3", category: "wellbeing" },
  { id: "r1", category: "relationships" },
  { id: "r2", category: "relationships" },
  { id: "r3", category: "relationships" },
];

function buildAdvice(t) {
  return ADVICE_KEYS.map(({ id, category }) => ({
    id,
    category,
    title: t[`advice_${id}_title`] ?? id,
    body: t[`advice_${id}_body`] ?? "",
  }));
}

export default function AdviceScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { refresh } = useAdvice();

  const ADVICE = buildAdvice(t);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [viewed, setViewed] = useState(new Set()); // ids opened
  const [relevant, setRelevant] = useState(new Set()); // ids marked relevant
  const [modal, setModal] = useState(null);

  // ── Load state from backend ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await patientApi.get();
        // relevantAdvice stored on patient
        const rel = new Set(profile?.relevantAdvice ?? []);
        // viewedAdvice stored on patient
        const view = new Set(profile?.viewedAdvice ?? []);
        setRelevant(rel);
        setViewed(view);
      } catch (e) {
        console.log("AdviceScreen load error:", e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Mark as viewed (save to backend) ────────────────────────────────────────
  const markViewed = useCallback(
    async (id) => {
      setViewed((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        // fire and forget
        patientApi.updateViewedAdvice([...next]).catch(() => {});
        refresh();
        return next;
      });
    },
    [refresh],
  );

  // ── Toggle relevant (save to backend) ───────────────────────────────────────
  const toggleRelevant = useCallback(
    async (id) => {
      setRelevant((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        patientApi.updateRelevantAdvice([...next]).catch(() => {});
        refresh();
        return next;
      });
    },
    [refresh],
  );

  const openAdvice = (item) => {
    setModal(item);
    markViewed(item.id);
  };

  const getStatus = (id) => {
    if (relevant.has(id)) return "relevant";
    if (viewed.has(id)) return "viewed";
    return "new";
  };

  const catLabel = (c) =>
    t[`adviceCat_${c}`] ?? c.charAt(0).toUpperCase() + c.slice(1);

  const visible = ADVICE.filter((a) => {
    if (filter === "relevant" && !relevant.has(a.id)) return false;

    return true;
  });

  const grouped = {};
  visible.forEach((a) => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  const s = makeStyles(theme, insets);

  if (loading)
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.bg }}
        edges={["bottom"]}
      >
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
          >
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t.advice ?? "Advice"}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.bg }}
      edges={["bottom"]}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.advice ?? "Advice"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* All / Relevant toggle */}
      <View style={s.toggleRow}>
        {["all", "relevant"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              s.toggleBtn,
              filter === f && { backgroundColor: theme.accent },
            ]}
          >
            <Text style={[s.toggleText, filter === f && { color: "#fff" }]}>
              {f === "all"
                ? (t.adviceAll ?? "ALL")
                : (t.adviceRelevant ?? "RELEVANT FOR ME")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Advice list */}
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(grouped).length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>💡</Text>
            <Text style={[s.emptyText, { color: theme.textMuted }]}>
              {t.adviceEmpty ?? "No advice here yet."}
            </Text>
          </View>
        )}
        {Object.entries(grouped).map(([cat, items]) => (
          <View key={cat}>
            <Text style={[s.catHeader, { color: theme.accent }]}>
              {CAT_ICONS[cat]} {catLabel(cat)}
            </Text>
            {items.map((item) => {
              const status = getStatus(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => openAdvice(item)}
                  activeOpacity={0.8}
                  style={[
                    s.card,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      s.badge,
                      { backgroundColor: STATUS_COLORS[status] },
                    ]}
                  >
                    <Text style={s.badgeText}>
                      {status === "new"
                        ? (t.adviceNew ?? "New")
                        : status === "relevant"
                          ? (t.adviceRelevant2 ?? "Relevant")
                          : (t.adviceViewed ?? "Viewed")}
                    </Text>
                  </View>
                  <Text style={[s.cardTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[s.cardRead, { color: theme.accent }]}>
                    {t.readMore ?? "Read more"} →
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Detail modal */}
      {modal && (
        <Modal visible animationType="slide" transparent>
          <View style={s.overlay}>
            <View style={[s.sheet, { backgroundColor: theme.bg }]}>
              <View
                style={[s.sheetHeader, { borderBottomColor: theme.border }]}
              >
                <Text style={[s.sheetTitle, { color: theme.text }]}>
                  {modal.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setModal(null)}
                  style={{ padding: 4 }}
                >
                  <Text style={{ color: theme.textMuted, fontSize: 22 }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: Spacing.lg }}>
                <Text style={[s.sheetBody, { color: theme.text }]}>
                  {modal.body}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleRelevant(modal.id)}
                  style={[
                    s.relevantBtn,
                    {
                      backgroundColor: relevant.has(modal.id)
                        ? STATUS_COLORS.relevant
                        : theme.surface,
                      borderColor: STATUS_COLORS.relevant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.relevantBtnText,
                      {
                        color: relevant.has(modal.id)
                          ? "#fff"
                          : STATUS_COLORS.relevant,
                      },
                    ]}
                  >
                    {relevant.has(modal.id)
                      ? `✓ ${t.adviceMarkedRelevant ?? "Marked as relevant"}`
                      : `☆ ${t.adviceMarkRelevant ?? "Mark as relevant for me"}`}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t, insets) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
      backgroundColor: t.accent,
    },
    backBtn: { width: 40 },
    backArrow: { color: "#fff", fontSize: 30, lineHeight: 36 },
    headerTitle: {
      flex: 1,
      color: "#fff",
      fontSize: FontSize.md,
      fontWeight: "700",
      textAlign: "center",
    },
    toggleRow: {
      flexDirection: "row",
      margin: Spacing.md,
      backgroundColor: t.surface,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: Radius.full,
    },
    toggleText: {
      fontSize: FontSize.xs,
      fontWeight: "700",
      letterSpacing: 1,
      color: t.textMuted,
    },
    catRow: {
      paddingHorizontal: Spacing.md,
      gap: 8,
      paddingBottom: 8,
      alignItems: "center",
    },
    catPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
    },
    catText: { fontSize: FontSize.xs, fontWeight: "600", color: t.textMuted },
    catHeader: {
      fontSize: FontSize.lg,
      fontWeight: "800",
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
      letterSpacing: 0.3,
    },
    card: {
      borderRadius: Radius.lg,
      borderWidth: 1,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      position: "relative",
      overflow: "hidden",
    },
    badge: {
      position: "absolute",
      top: 0,
      right: 0,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderBottomLeftRadius: Radius.md,
    },
    badgeText: { color: "#fff", fontSize: FontSize.xs, fontWeight: "700" },
    cardTitle: {
      fontSize: FontSize.md,
      fontWeight: "600",
      marginTop: 4,
      paddingRight: 70,
      lineHeight: 22,
    },
    cardRead: {
      fontSize: FontSize.sm,
      fontWeight: "600",
      marginTop: Spacing.sm,
    },
    empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyEmoji: { fontSize: 44 },
    emptyText: { fontSize: FontSize.sm, textAlign: "center" },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "80%",
      paddingBottom: 40,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: Spacing.lg,
      borderBottomWidth: 1,
      gap: Spacing.md,
    },
    sheetTitle: {
      flex: 1,
      fontSize: FontSize.lg,
      fontWeight: "700",
      lineHeight: 26,
    },
    sheetBody: {
      fontSize: FontSize.md,
      lineHeight: 26,
      marginBottom: Spacing.xl,
    },
    relevantBtn: {
      borderRadius: Radius.md,
      borderWidth: 2,
      padding: Spacing.md,
      alignItems: "center",
      marginTop: Spacing.sm,
    },
    relevantBtnText: { fontSize: FontSize.md, fontWeight: "700" },
  });
