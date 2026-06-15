// src/screens/log/LogHistoryScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle, Path } from "react-native-svg";
import { useLogs } from "../../context/PatientContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { FontSize, Spacing, Radius } from "../../constants/theme";

// Score colors stay hardcoded — they're semantic (green=good, red=severe).
const SCORE_COLORS = {
  0: "#22C55E",
  1: "#7AABDB",
  2: "#FBBF24",
  3: "#FB923C",
  4: "#EF4444",
  5: "#991B1B",
};

const FREQ_SCORE = {
  none: 0,
  once: 1,
  few_times: 2,
  daily: 3,
  multiple_daily: 4,
};

function avgScore(log) {
  if (!log) return null;
  const vals = [];
  if (log.cravings != null) vals.push(log.cravings);
  if (log.mood != null) vals.push(6 - log.mood);
  if (log.wellbeing != null) vals.push(6 - log.wellbeing);
  if (log.amount != null) vals.push(Math.min(5, (log.amount / 10) * 5));
  if (log.frequency != null && FREQ_SCORE[log.frequency] != null)
    vals.push(FREQ_SCORE[log.frequency]);
  if (!vals.length) return null;
  return Math.min(5, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
}

function scoreColor(s) {
  return SCORE_COLORS[s] ?? "#b3cde8";
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function firstWeekday(y, m) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatLongDate(dateStr, t) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = t.months ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Action Sheet ──────────────────────────────────────────────────────────────
function ActionSheet({ visible, onEdit, onPreview, onClose, theme, t }) {
  const TEXT = theme?.text ?? "#1a2c3d";
  const TEXT_MUTED = theme?.textMuted ?? "#7a9ab8";
  const CARD_BG = theme?.card ?? "#fff";
  const ACCENT = theme?.accent ?? "#4A7AB5";
  const BORDER = theme?.border ?? "#e8eef5";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={sheet.backdrop} onPress={onClose}>
        <Pressable
          style={[sheet.sheet, { backgroundColor: CARD_BG }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[sheet.handle, { backgroundColor: BORDER }]} />

          <Text style={[sheet.title, { color: TEXT }]}>
            {t.entryActionsTitle ?? "What would you like to do?"}
          </Text>

          <TouchableOpacity
            style={[sheet.btn, { backgroundColor: ACCENT }]}
            onPress={onEdit}
            activeOpacity={0.85}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={sheet.btnTextPrimary}>{t.editEntry ?? "Edit"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              sheet.btn,
              {
                backgroundColor: "transparent",
                borderColor: ACCENT,
                borderWidth: 1.5,
              },
            ]}
            onPress={onPreview}
            activeOpacity={0.85}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx="12"
                cy="12"
                r="3"
                fill="none"
                stroke={ACCENT}
                strokeWidth="2"
              />
            </Svg>
            <Text style={[sheet.btnTextSecondary, { color: ACCENT }]}>
              {t.previewEntry ?? "Preview"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={sheet.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[sheet.cancelText, { color: TEXT_MUTED }]}>
              {t.cancel ?? "Cancel"}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sheet = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  btnTextPrimary: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnTextSecondary: {
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ visible, log, onClose, theme, t }) {
  if (!log) return null;
  const TEXT = theme?.text ?? "#1a2c3d";
  const TEXT_MUTED = theme?.textMuted ?? "#7a9ab8";
  const SUBTLE = theme?.textSubtle ?? "#444";
  const CARD_BG = theme?.card ?? "#fff";
  const ACCENT = theme?.accent ?? "#4A7AB5";
  const BORDER = theme?.border ?? "#e8eef5";
  const BG = theme?.bgSecondary ?? theme?.bg ?? "#F0F4F8";

  const score = avgScore(log);
  const dotColor = score != null ? scoreColor(score) : "#b3cde8";

  const Row = ({ label, value }) => {
    if (
      value == null ||
      value === "" ||
      (Array.isArray(value) && !value.length)
    )
      return null;
    return (
      <View style={preview.row}>
        <Text style={[preview.rowLabel, { color: TEXT_MUTED }]}>{label}</Text>
        <Text style={[preview.rowValue, { color: TEXT }]}>{value}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={preview.backdrop} onPress={onClose}>
        <Pressable
          style={[preview.modal, { backgroundColor: BG }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header strip */}
          <View
            style={[
              preview.header,
              { backgroundColor: dotColor, borderColor: dotColor },
            ]}
          >
            <Text style={preview.headerDate}>
              {formatLongDate(log.date, t)}
            </Text>
            {!!log.note?.trim() && (
              <View style={preview.noteBadge}>
                <Svg width="14" height="14" viewBox="0 0 24 24">
                  <Path
                    d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z"
                    fill="#fff"
                  />
                </Svg>
              </View>
            )}
          </View>

          {/* Body */}
          <ScrollView
            style={preview.body}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Row
              label={t.substancesUsed ?? "Substances"}
              value={
                log.substances?.length
                  ? log.substances.map((s) => t[s] ?? s).join(", ")
                  : null
              }
            />
            <Row
              label={t.cravings ?? "Cravings"}
              value={log.cravings != null ? `${log.cravings}/5` : null}
            />
            <Row
              label={t.mood ?? "Mood"}
              value={log.mood != null ? `${log.mood}/5` : null}
            />
            <Row
              label={t.wellbeing ?? "Wellbeing"}
              value={log.wellbeing != null ? `${log.wellbeing}/5` : null}
            />
            <Row
              label={t.amount ?? "Amount"}
              value={log.amount != null ? `${log.amount}/10` : null}
            />
            <Row
              label={t.frequency ?? "Frequency"}
              value={
                log.frequency && log.frequency !== "none"
                  ? (t[log.frequency] ?? log.frequency)
                  : null
              }
            />
            <Row
              label={t.myMedications ?? "Medications"}
              value={
                log.medicationsTaken?.length
                  ? log.medicationsTaken
                      .map((m) => (m.dosage ? `${m.name} ${m.dosage}` : m.name))
                      .join(", ")
                  : null
              }
            />
            {log.note?.trim() && (
              <View style={preview.noteSection}>
                <Text
                  style={[
                    preview.rowLabel,
                    { color: TEXT_MUTED, marginBottom: 6 },
                  ]}
                >
                  {t.note ?? "Note"}
                </Text>
                <View
                  style={[
                    preview.noteBox,
                    { backgroundColor: CARD_BG, borderColor: BORDER },
                  ]}
                >
                  <Text style={{ color: SUBTLE, fontSize: 14, lineHeight: 20 }}>
                    {log.note}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Close button */}
          <View
            style={[
              preview.footer,
              { borderColor: BORDER, backgroundColor: CARD_BG },
            ]}
          >
            <TouchableOpacity
              style={[preview.closeBtn, { backgroundColor: ACCENT }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={preview.closeText}>{t.close ?? "Close"}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const preview = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modal: {
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "85%",
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerDate: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  noteBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flexGrow: 0,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(127,127,127,0.2)",
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  noteSection: {
    marginTop: 14,
  },
  noteBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  closeBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});

// ── Calendar tab ──────────────────────────────────────────────────────────────
function CalendarTab({ logs, loading, onCellPress, t, theme }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const PRIMARY = theme?.accent ?? "#4A7AB5";
  const TEXT = theme?.text ?? "#1a2c3d";
  const TEXT_MUTED = theme?.textMuted ?? "#7a9ab8";
  const CARD_BG = theme?.card ?? theme?.bg ?? "#fff";
  const DIVIDER = theme?.border ?? "#e8eef5";
  const EMPTY_BORDER = theme?.cardBorder ?? "#a0b8d0";

  const scoreMap = {};
  logs.forEach((log) => {
    const s = avgScore(log);
    if (s != null) scoreMap[log.date] = s;
  });

  const goBack = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const goForward = () => {
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const totalDays = daysInMonth(year, month);
  const startOffset = firstWeekday(year, month);
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLogs = logs.filter((l) => {
    if (!l.date) return false;
    const [ly, lm] = l.date.split("-").map(Number);
    return ly === year && lm === month + 1;
  });
  const totalLogged = monthLogs.length;
  const avgAll = totalLogged
    ? Math.round(
        monthLogs.reduce((s, l) => s + (avgScore(l) ?? 0), 0) / totalLogged,
      )
    : null;

  const today = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const months = t.months ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const weekdays = t.weekdays ?? [
    "Man",
    "Tir",
    "Ons",
    "Tor",
    "Fre",
    "Lør",
    "Søn",
  ];

  const scoreLabels = [
    t.scoreNone ?? "Ingen sug",
    t.scoreLow ?? "Lavt",
    t.scoreModerate ?? "Moderat",
    t.scoreHigh ?? "Høyt",
    t.scoreVeryHigh ?? "Veldig høyt",
    t.scoreSevere ?? "Kraftig sug",
  ];

  const countByScore = [0, 1, 2, 3, 4, 5].map((s) => ({
    score: s,
    count: monthLogs.filter((l) => avgScore(l) === s).length,
    label: scoreLabels[s],
    color: scoreColor(s),
  }));

  return (
    <View style={{ flex: 1 }}>
      <View style={cal.monthNav}>
        <TouchableOpacity onPress={goBack} style={cal.navBtn}>
          <Text style={[cal.navArrow, { color: TEXT }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[cal.monthTitle, { color: TEXT }]}>
          {(months[month] ?? "").toUpperCase()}
          {"  "}
          {year}
        </Text>
        <TouchableOpacity
          onPress={goForward}
          style={[cal.navBtn, isCurrentMonth && { opacity: 0.3 }]}
          disabled={isCurrentMonth}
        >
          <Text
            style={[
              cal.navArrow,
              { color: isCurrentMonth ? TEXT_MUTED : TEXT },
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[cal.card, { backgroundColor: CARD_BG }]}>
        <View style={cal.weekdayRow}>
          {weekdays.map((d, i) => (
            <Text key={i} style={[cal.weekdayLabel, { color: TEXT_MUTED }]}>
              {d}
            </Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginVertical: 24 }} />
        ) : (
          <View>
            {Array.from({ length: Math.ceil(cells.length / 7) }).map(
              (_, weekIdx) => (
                <View key={`week-${weekIdx}`} style={cal.weekRow}>
                  {cells.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, i) => {
                    if (!day) return <View key={`e-${i}`} style={cal.cell} />;
                    const dateStr = toDateStr(year, month, day);
                    const score = scoreMap[dateStr];
                    const isToday = dateStr === today;
                    const isFuture = dateStr > today;
                    const existing =
                      logs.find((l) => l.date === dateStr) ?? null;
                    const bg = score != null ? scoreColor(score) : undefined;
                    const highCravings = existing?.cravings >= 4;
                    const subs = (existing?.substances ?? []).filter(
                      (s) => s !== "sober",
                    );
                    const isSober =
                      existing != null &&
                      (existing.substances?.includes("sober") ||
                        (subs.length === 0 &&
                          Array.isArray(existing.substances)) ||
                        existing.amount === 0);
                    return (
                      <TouchableOpacity
                        key={dateStr}
                        style={cal.cell}
                        activeOpacity={isFuture ? 1 : 0.7}
                        onPress={() => {
                          if (isFuture) return;
                          onCellPress(dateStr, existing);
                        }}
                      >
                        <View
                          style={[
                            cal.cellInner,
                            { borderColor: TEXT_MUTED },
                            isFuture && { borderWidth: 0 },
                            !isFuture &&
                              score == null && {
                                borderColor: EMPTY_BORDER,
                                borderWidth: 2,
                              },
                            bg && { backgroundColor: bg, borderWidth: 0 },
                            isToday &&
                              score == null && {
                                borderColor: PRIMARY,
                                borderWidth: 2,
                              },
                          ]}
                        >
                          <Text
                            style={[
                              cal.cellText,
                              { color: score != null ? "#fff" : TEXT },
                              isToday &&
                                score == null && {
                                  color: PRIMARY,
                                  fontWeight: "800",
                                },
                            ]}
                          >
                            {day}
                          </Text>

                          {/* ★ top-left — sober/edru star */}
                          {isSober && (
                            <Svg
                              width={13}
                              height={13}
                              viewBox="0 0 14 14"
                              style={{
                                position: "absolute",
                                top: -4,
                                left: -4,
                              }}
                            >
                              <Path
                                d="M 7 0 L 8.5 5.5 L 14 7 L 8.5 8.5 L 7 14 L 5.5 8.5 L 0 7 L 5.5 5.5 Z"
                                fill="#d4a017"
                                stroke="#8a6a0e"
                                strokeWidth="0.6"
                              />
                            </Svg>
                          )}

                          {!!existing?.note?.trim() && (
                            <View style={cal.noteIcon}>
                              <Svg width="18" height="18" viewBox="0 0 24 24">
                                <Circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  fill="none"
                                  stroke={PRIMARY}
                                  strokeWidth="2.5"
                                />
                                <Path
                                  d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z"
                                  fill={PRIMARY}
                                />
                              </Svg>
                            </View>
                          )}
                          {!!existing?.medicationsTaken?.length && (
                            <View style={cal.medIcon}>
                              <Image
                                source={require("../../../assets/images/ico_medicine.png")}
                                style={{ width: 16, height: 16 }}
                                resizeMode="contain"
                              />
                            </View>
                          )}
                          {highCravings && (
                            <Text style={cal.cravingsIcon}>🔥</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ),
            )}
          </View>
        )}
      </View>

      {/* Legend */}
      <View
        style={[cal.card, { backgroundColor: CARD_BG, paddingVertical: 10 }]}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: scoreColor(s),
                }}
              />
              <Text style={{ fontSize: 10, color: TEXT_MUTED }}>
                {scoreLabels[s]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[cal.card, { backgroundColor: CARD_BG }]}>
        <Text style={[cal.sectionTitle, { color: TEXT }]}>
          {t.monthSummary ?? "Månedsoversikt"}
        </Text>
        <View style={cal.summaryRow}>
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: PRIMARY }]}>
              {totalLogged}
            </Text>
            <Text style={[cal.summarySubLabel, { color: TEXT_MUTED }]}>
              {t.daysLogged ?? "Dager logget"}
            </Text>
          </View>
          <View style={[cal.divider, { backgroundColor: DIVIDER }]} />
          <View style={cal.summaryItem}>
            <Text
              style={[
                cal.summaryValue,
                { color: avgAll != null ? scoreColor(avgAll) : TEXT_MUTED },
              ]}
            >
              {avgAll != null ? scoreLabels[avgAll] : "—"}
            </Text>
            <Text style={[cal.summarySubLabel, { color: TEXT_MUTED }]}>
              {t.avgScore ?? "Avg. score"}
            </Text>
          </View>
          <View style={[cal.divider, { backgroundColor: DIVIDER }]} />
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: PRIMARY }]}>
              {totalDays - totalLogged}
            </Text>
            <Text style={[cal.summarySubLabel, { color: TEXT_MUTED }]}>
              {t.missing ?? "Mangler"}
            </Text>
          </View>
        </View>
      </View>

      <View style={[cal.card, { backgroundColor: CARD_BG, marginBottom: 40 }]}>
        <Text style={[cal.sectionTitle, { color: TEXT }]}>
          {t.cravingBreakdown ?? "Score-oversikt"}
        </Text>
        {countByScore.map(({ score, count, label, color }) => (
          <View key={score} style={cal.breakdownRow}>
            <View style={[cal.breakdownDot, { backgroundColor: color }]} />
            <Text style={[cal.breakdownLabel, { color: TEXT }]}>{label}</Text>
            <View style={[cal.breakdownBarBg, { backgroundColor: DIVIDER }]}>
              <View
                style={[
                  cal.breakdownBar,
                  {
                    backgroundColor: color,
                    width: totalLogged
                      ? `${Math.round((count / totalLogged) * 100)}%`
                      : "0%",
                  },
                ]}
              />
            </View>
            <Text style={[cal.breakdownCount, { color: TEXT_MUTED }]}>
              {count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, fontWeight: "300" },
  monthTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  weekdayRow: { flexDirection: "row", marginBottom: 6 },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  weekRow: { flexDirection: "row" },
  cellInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "visible",
  },
  cellText: { fontSize: 13, fontWeight: "600" },
  noteIcon: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 18,
    height: 18,
  },
  medIcon: { position: "absolute", top: -6, right: -6, width: 16, height: 16 },
  cravingsIcon: { position: "absolute", bottom: -6, left: -6, fontSize: 13 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryValue: { fontSize: 20, fontWeight: "800" },
  summarySubLabel: { fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 40 },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: 12, fontWeight: "500", width: 90 },
  breakdownBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  breakdownBar: { height: "100%", borderRadius: 4 },
  breakdownCount: {
    fontSize: 12,
    fontWeight: "600",
    width: 24,
    textAlign: "right",
  },
});

// ── Month Summary View ─────────────────────────────────────────────────────────
function MonthSummaryView({ logs, t, theme }) {
  const PRIMARY = theme?.accent ?? "#4A7AB5";
  const CARD_BG = theme?.card ?? theme?.bg ?? "#fff";
  const TEXT = theme?.text ?? "#1a2c3d";
  const TEXT_MUTED = theme?.textMuted ?? "#7a9ab8";

  const months = t.months ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const grouped = {};
  logs.forEach((log) => {
    if (!log.date) return;
    const key = log.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const sections = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      const ml = grouped[key];
      const scores = ml.map((l) => avgScore(l)).filter((s) => s != null);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
      const allSubstances = [...new Set(ml.flatMap((l) => l.substances ?? []))];
      return {
        key,
        year: y,
        month: m - 1,
        logs: ml,
        avg,
        substances: allSubstances,
      };
    });

  if (!sections.length)
    return (
      <View style={{ alignItems: "center", paddingTop: 60 }}>
        <Text style={{ color: TEXT_MUTED, fontSize: FontSize.md }}>
          {t.noRecords}
        </Text>
      </View>
    );

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const color = item.avg != null ? scoreColor(item.avg) : "#94a3b8";
        return (
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 12,
              marginBottom: 12,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: color,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: TEXT,
                  fontSize: FontSize.md,
                  fontWeight: "700",
                }}
              >
                {(months[item.month] ?? "").toUpperCase()} {item.year}
              </Text>
              <View
                style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
              >
                <Text style={{ color: TEXT_MUTED, fontSize: FontSize.sm }}>
                  {item.logs.length} {t.registrations ?? "entries"}
                </Text>
                {item.avg != null && (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: color + "22",
                      borderWidth: 1.5,
                      borderColor: color,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color, fontSize: 13, fontWeight: "700" }}>
                      {item.avg}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {item.substances.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                {item.substances.map((s) => (
                  <View
                    key={s}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 20,
                      backgroundColor: PRIMARY + "18",
                      borderWidth: 1,
                      borderColor: PRIMARY + "44",
                    }}
                  >
                    <Text
                      style={{
                        color: PRIMARY,
                        fontSize: FontSize.xs,
                        fontWeight: "500",
                      }}
                    >
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

// ── Diary View ─────────────────────────────────────────────────────────────────
function DiaryView({ logs, navigation, t, theme }) {
  const PRIMARY = theme?.accent ?? "#4A7AB5";
  const CARD_BG = theme?.card ?? theme?.bg ?? "#fff";
  const TEXT = theme?.text ?? "#1a2c3d";
  const TEXT_MUTED = theme?.textMuted ?? "#7a9ab8";
  const isDark = theme?.mode === "dark";
  const SUBTLE = theme?.textSubtle ?? (isDark ? "#cbd5e1" : "#444");

  const months = t.months ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const [collapsed, setCollapsed] = useState({});
  const toggle = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const grouped = {};
  logs.forEach((log) => {
    const key = log.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const sections = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      const ml = grouped[key];
      const scores = ml.map((l) => avgScore(l)).filter((s) => s != null);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
      return { key, year: y, month: m - 1, logs: ml, avg };
    });

  const scoreLabels = [
    t.scoreNone ?? "Ingen sug",
    t.scoreLow ?? "Lavt",
    t.scoreModerate ?? "Moderat",
    t.scoreHigh ?? "Høyt",
    t.scoreVeryHigh ?? "Veldig høyt",
    t.scoreSevere ?? "Kraftig sug",
  ];

  const shortDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${(months[d.getMonth()] ?? "").slice(0, 3)}'${String(d.getFullYear()).slice(2)}`;
  };

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <Text style={{ color: TEXT_MUTED, fontSize: FontSize.md }}>
            {t.noRecords}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const pillBg =
          item.avg != null
            ? scoreColor(item.avg) + "33"
            : (theme?.cardElevated ?? "#e8eef5");
        const pillText = item.avg != null ? scoreColor(item.avg) : TEXT;
        const isOpen = collapsed[item.key] !== false;
        return (
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={{
                backgroundColor: pillBg,
                borderRadius: 30,
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: "center",
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={() => toggle(item.key)}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{ color: pillText, fontSize: 20, fontWeight: "800" }}
                >
                  {months[item.month]} {item.year}
                </Text>
                <Text
                  style={{
                    color: pillText,
                    fontSize: 13,
                    marginTop: 2,
                    opacity: 0.8,
                  }}
                >
                  {t.avgScore ?? "Avg. score"}:{" "}
                  {item.avg != null ? scoreLabels[item.avg] : "—"}
                </Text>
              </View>
              <Text
                style={{
                  color: pillText,
                  fontSize: 20,
                  opacity: 0.7,
                  marginLeft: 8,
                }}
              >
                {isOpen ? "›" : "‹"}
              </Text>
            </TouchableOpacity>

            {!isOpen &&
              item.logs.map((log) => {
                const score = avgScore(log);
                const dotColor = score != null ? scoreColor(score) : "#b3cde8";
                const highCravings = log.cravings >= 4;
                return (
                  <TouchableOpacity
                    key={log.date}
                    style={{
                      backgroundColor: CARD_BG,
                      borderRadius: 16,
                      marginBottom: 10,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 12,
                      shadowColor: "#000",
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 2,
                    }}
                    onPress={() => onEntryPress(log.date, log)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        backgroundColor: dotColor,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: "800",
                        }}
                      >
                        {new Date(log.date).getDate()}
                      </Text>
                      {!!log.note?.trim() && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                          }}
                        >
                          <Svg width="18" height="18" viewBox="0 0 24 24">
                            <Circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="none"
                              stroke={PRIMARY}
                              strokeWidth="2.5"
                            />
                            <Path
                              d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z"
                              fill={PRIMARY}
                            />
                          </Svg>
                        </View>
                      )}
                      {!!log.medicationsTaken?.length && (
                        <Image
                          source={require("../../../assets/images/ico_medicine.png")}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                          }}
                          resizeMode="contain"
                        />
                      )}
                      {highCravings && (
                        <Text
                          style={{
                            position: "absolute",
                            bottom: -6,
                            left: -6,
                            fontSize: 13,
                          }}
                        >
                          🔥
                        </Text>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      {log.substances?.length > 0 && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.substancesUsed ?? "Substances"}:{" "}
                          </Text>
                          {log.substances.map((s) => t[s] ?? s).join(", ")}
                        </Text>
                      )}
                      {log.cravings != null && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.cravings ?? "Cravings"}:{" "}
                          </Text>
                          {log.cravings}/5
                        </Text>
                      )}
                      {log.mood != null && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.mood ?? "Mood"}:{" "}
                          </Text>
                          {log.mood}/5
                        </Text>
                      )}
                      {log.wellbeing != null && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.wellbeing ?? "Wellbeing"}:{" "}
                          </Text>
                          {log.wellbeing}/5
                        </Text>
                      )}
                      {log.amount != null && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.amount ?? "Amount"}:{" "}
                          </Text>
                          {log.amount}/10
                        </Text>
                      )}
                      {log.frequency && log.frequency !== "none" && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.frequency ?? "Frequency"}:{" "}
                          </Text>
                          {t[log.frequency] ?? log.frequency}
                        </Text>
                      )}
                      {log.medicationsTaken?.length > 0 && (
                        <Text
                          style={{
                            color: SUBTLE,
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.myMedications ?? "Medications"}:{" "}
                          </Text>
                          {log.medicationsTaken
                            .map((m) =>
                              m.dosage ? `${m.name} ${m.dosage}` : m.name,
                            )
                            .join(", ")}
                        </Text>
                      )}
                      {log.note?.trim() && (
                        <Text
                          style={{ color: SUBTLE, fontSize: 13 }}
                          numberOfLines={2}
                        >
                          <Text style={{ fontWeight: "700", color: TEXT }}>
                            {t.note ?? "Note"}:{" "}
                          </Text>
                          {log.note}
                        </Text>
                      )}
                    </View>

                    <View
                      style={{
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        minHeight: 52,
                      }}
                    >
                      <Text
                        style={{
                          color: TEXT_MUTED,
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        {shortDate(log.date)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        );
      }}
    />
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function LogHistoryScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(
    route?.params?.initialTab ?? "calendar",
  );
  const [diaryView, setDiaryView] = useState("day");
  const { logs, loading, fetchLogs } = useLogs();
  const { theme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const PRIMARY = theme?.accent ?? "#4A7AB5";

  // Modal state
  const [actionSheet, setActionSheet] = useState({
    visible: false,
    date: null,
    log: null,
  });
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    log: null,
  });

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs]),
  );

  const s = makeStyles(theme, insets);

  const TOGGLE_BG = theme?.cardElevated ?? "#dde8f0";
  const TOGGLE_ACTIVE_BG = theme?.card ?? "#fff";
  const TOGGLE_INACTIVE_TEXT = theme?.textMuted ?? "#6b8aaa";
  const TOGGLE_ACTIVE_TEXT = theme?.text ?? "#4a6a8a";

  // Unified handler for both calendar and diary entry taps
  const handleEntryPress = (date, log) => {
    if (!log) {
      // No existing log on that day → straight to creating a new entry
      navigation.navigate("LogEntry", { date, log: null });
      return;
    }
    setActionSheet({ visible: true, date, log });
  };

  const handleEdit = () => {
    const { date, log } = actionSheet;
    setActionSheet({ visible: false, date: null, log: null });
    setTimeout(() => {
      navigation.navigate("LogEntry", { date, log });
    }, 100);
  };

  const handlePreview = () => {
    const { log } = actionSheet;
    setActionSheet({ visible: false, date: null, log: null });
    setTimeout(() => {
      setPreviewModal({ visible: true, log });
    }, 200);
  };

  const closeActionSheet = () =>
    setActionSheet({ visible: false, date: null, log: null });
  const closePreview = () => setPreviewModal({ visible: false, log: null });

  return (
    <View
      style={[
        s.root,
        { backgroundColor: theme?.bgSecondary ?? theme?.bg ?? "#F0F4F8" },
      ]}
    >
      <View
        style={[
          s.header,
          { backgroundColor: PRIMARY, paddingTop: insets.top + 10 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.myDiary ?? "My Diary"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabBar}>
        {["calendar", "diary"].map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "calendar"
              ? (t.calendar ?? "Calendar")
              : (t.diary ?? "Diary");
          return (
            <TouchableOpacity
              key={tab}
              style={[
                s.tab,
                isActive && {
                  borderColor: PRIMARY,
                  overflow: "hidden",
                  paddingVertical: 0,
                },
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              {isActive ? (
                <View style={[s.tabGradient, { backgroundColor: PRIMARY }]}>
                  <Text style={s.tabTextActive}>{label}</Text>
                </View>
              ) : (
                <Text style={s.tabText}>{label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === "calendar" && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <CalendarTab
              logs={logs}
              loading={loading}
              onCellPress={handleEntryPress}
              t={t}
              theme={theme}
            />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "diary" && (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 4,
              paddingVertical: 4,
              backgroundColor: TOGGLE_BG,
              borderRadius: 10,
              marginHorizontal: 16,
              marginVertical: 10,
            }}
          >
            {["day", "month"].map((v) => {
              const active = diaryView === v;
              const label =
                v === "day"
                  ? (t.dailyView ?? "Daily")
                  : (t.monthlyView ?? "Monthly");
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => setDiaryView(v)}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: "center",
                    backgroundColor: active ? TOGGLE_ACTIVE_BG : TOGGLE_BG,
                    ...(active
                      ? {
                          shadowColor: "#000",
                          shadowOpacity: 0.08,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 1 },
                          elevation: 2,
                        }
                      : {}),
                  }}
                >
                  <Text
                    style={{
                      fontSize: FontSize.sm,
                      fontWeight: active ? "600" : "500",
                      color: active ? TOGGLE_ACTIVE_TEXT : TOGGLE_INACTIVE_TEXT,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {diaryView === "day" ? (
            <DiaryView
              logs={logs}
              onEntryPress={handleEntryPress}
              t={t}
              theme={theme}
            />
          ) : (
            <MonthSummaryView logs={logs} t={t} theme={theme} />
          )}
        </View>
      )}

      <ActionSheet
        visible={actionSheet.visible}
        onEdit={handleEdit}
        onPreview={handlePreview}
        onClose={closeActionSheet}
        theme={theme}
        t={t}
      />

      <PreviewModal
        visible={previewModal.visible}
        log={previewModal.log}
        onClose={closePreview}
        theme={theme}
        t={t}
      />
    </View>
  );
}

const makeStyles = (t, insets) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    backBtn: { width: 40 },
    back: { color: "#fff", fontSize: 30 },
    headerTitle: {
      flex: 1,
      color: "#fff",
      fontSize: FontSize.md,
      fontWeight: "600",
      textAlign: "center",
    },
    tabBar: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: t?.card ?? "#fff",
      borderBottomWidth: 1,
      borderBottomColor: t?.border ?? "#e8eef5",
    },
    tab: {
      flex: 1,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t?.card ?? "#fff",
      borderWidth: 1,
      borderColor: t?.border ?? "#dde5ee",
      paddingVertical: 16,
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 8,
    },
    tabGradient: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    tabText: {
      color: t?.textMuted ?? "#8fa8c8",
      fontSize: FontSize.sm,
      fontWeight: "600",
    },
    tabTextActive: { color: "#fff", fontWeight: "700" },
  });
