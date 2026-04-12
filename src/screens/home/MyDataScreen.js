// src/screens/home/MyDataScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, {
  Polyline,
  Line,
  Circle,
  Rect,
  Text as SvgText,
  Path,
} from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useLogs } from "../../context/PatientContext";
import { FontSize, Spacing, Radius } from "../../constants/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - Spacing.lg * 2 - 32; // card padding
const CHART_H = 160;
const PAD_L = 28;
const PAD_B = 24;
const PAD_T = 12;
const PAD_R = 8;

const SC = {
  alcohol: "#7986cb",
  cannabis: "#66bb6a",
  cocaine: "#ef5350",
  opioids: "#ab47bc",
  amphetamines: "#ff7043",
  benzodiazepines: "#26a69a",
  tobacco: "#8d6e63",
  prescription: "#42a5f5",
  other: "#bdbdbd",
};
const sc = (s) => SC[s] ?? "#bdbdbd";

function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtShort(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}

// ── Simple SVG line chart ─────────────────────────────────────────────────────
function LineChartSVG({ data, color, yMax = 5, yMin = 0, label }) {
  if (!data.length) return null;
  const W = CHART_W - PAD_L - PAD_R;
  const H = CHART_H - PAD_T - PAD_B;

  const toX = (i) => PAD_L + (i / (data.length - 1)) * W;
  const toY = (v) => PAD_T + H - ((v - yMin) / (yMax - yMin)) * H;

  const pts = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const yTicks = [yMin, Math.round((yMax + yMin) / 2), yMax];
  const xStep = Math.ceil(data.length / 5);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid lines */}
      {yTicks.map((y) => (
        <Line
          key={y}
          x1={PAD_L}
          y1={toY(y)}
          x2={CHART_W - PAD_R}
          y2={toY(y)}
          stroke="#e8eef5"
          strokeWidth="1"
        />
      ))}
      {/* Y labels */}
      {yTicks.map((y) => (
        <SvgText
          key={y}
          x={PAD_L - 5}
          y={toY(y) + 4}
          fontSize="9"
          fill="#7a9ab8"
          textAnchor="end"
        >
          {y}
        </SvgText>
      ))}
      {/* X labels */}
      {data
        .filter((_, i) => i % xStep === 0 || i === data.length - 1)
        .map((d, _, arr, i2 = data.indexOf(d)) => (
          <SvgText
            key={i2}
            x={toX(i2)}
            y={CHART_H - 4}
            fontSize="8"
            fill="#7a9ab8"
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        ))}
      {/* Line */}
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {data.map((d, i) => (
        <Circle key={i} cx={toX(i)} cy={toY(d.value)} r="3.5" fill={color} />
      ))}
    </Svg>
  );
}

// ── Simple SVG bar chart ──────────────────────────────────────────────────────
function BarChartSVG({ data, colors }) {
  if (!data.length) return null;
  const W = CHART_W - PAD_L - PAD_R;
  const H = CHART_H - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const barW = Math.min(28, W / data.length - 4);
  const step = W / data.length;
  const subs = Object.keys(colors);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid */}
      {[0, Math.ceil(maxVal / 2), maxVal].map((y) => (
        <Line
          key={y}
          x1={PAD_L}
          y1={PAD_T + H - (y / maxVal) * H}
          x2={CHART_W - PAD_R}
          y2={PAD_T + H - (y / maxVal) * H}
          stroke="#e8eef5"
          strokeWidth="1"
        />
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const x = PAD_L + i * step + (step - barW) / 2;
        let stackY = PAD_T + H;
        return (
          <React.Fragment key={i}>
            {subs.map((s) => {
              const val = d[s] ?? 0;
              if (!val) return null;
              const bh = (val / maxVal) * H;
              stackY -= bh;
              return (
                <Rect
                  key={s}
                  x={x}
                  y={stackY}
                  width={barW}
                  height={bh}
                  fill={colors[s]}
                  rx="2"
                />
              );
            })}
            <SvgText
              x={x + barW / 2}
              y={CHART_H - 4}
              fontSize="8"
              fill="#7a9ab8"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          </React.Fragment>
        );
      })}
      {/* Y labels */}
      {[0, Math.ceil(maxVal / 2), maxVal].map((y) => (
        <SvgText
          key={y}
          x={PAD_L - 5}
          y={PAD_T + H - (y / maxVal) * H + 4}
          fontSize="9"
          fill="#7a9ab8"
          textAnchor="end"
        >
          {y}
        </SvgText>
      ))}
    </Svg>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, theme, children }) {
  return (
    <View
      style={[
        card.wrap,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={card.header}>
        <Text style={[card.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[card.sub, { color: theme.textMuted }]}>{subtitle}</Text>
        )}
      </View>
      {children}
    </View>
  );
}
const card = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { marginBottom: 10 },
  title: { fontSize: FontSize.md, fontWeight: "700" },
  sub: { fontSize: FontSize.xs, marginTop: 2 },
});

// ── Questionnaire score bar ───────────────────────────────────────────────────
function QScoreBar({ label, score, max, color, interp }) {
  const pct = score != null ? Math.min(100, (score / max) * 100) : 0;
  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Text
          style={{ fontSize: FontSize.sm, fontWeight: "600", color: "#1a2c3d" }}
        >
          {label}
        </Text>
        {score != null ? (
          <Text style={{ fontSize: FontSize.xs, color, fontWeight: "700" }}>
            {score}/{max} — {interp}
          </Text>
        ) : (
          <Text style={{ fontSize: FontSize.xs, color: "#7a9ab8" }}>—</Text>
        )}
      </View>
      <View
        style={{
          height: 6,
          backgroundColor: "#e8eef5",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

// ── Range pill ────────────────────────────────────────────────────────────────
function RangePill({ label, active, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? theme.accent : theme.surface,
        borderColor: active ? theme.accent : theme.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 5,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: FontSize.xs,
          fontWeight: "600",
          color: active ? "#fff" : theme.textMuted,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyDataScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const { logs, patient } = useLogs();

  const [range, setRange] = useState(30);

  const records = useMemo(() => {
    if (!logs?.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return [...logs]
      .filter((r) => new Date(r.date ?? r.createdAt) >= cutoff)
      .sort((a, b) =>
        (a.date ?? a.createdAt).localeCompare(b.date ?? b.createdAt),
      );
  }, [logs, range]);

  // Mood / cravings / wellbeing series
  const moodSeries = useMemo(
    () =>
      records
        .filter((r) => r.mood != null)
        .map((r) => ({
          label: fmtShort(r.date ?? r.createdAt),
          value: r.mood,
        })),
    [records],
  );
  const cravSeries = useMemo(
    () =>
      records
        .filter((r) => r.cravings != null)
        .map((r) => ({
          label: fmtShort(r.date ?? r.createdAt),
          value: r.cravings,
        })),
    [records],
  );
  const wellSeries = useMemo(
    () =>
      records
        .filter((r) => r.wellbeing != null)
        .map((r) => ({
          label: fmtShort(r.date ?? r.createdAt),
          value: r.wellbeing,
        })),
    [records],
  );

  // Weight series
  const weightSeries = useMemo(
    () =>
      records
        .filter((r) => r.weight != null)
        .map((r) => ({
          label: fmtShort(r.date ?? r.createdAt),
          value: r.weight,
        })),
    [records],
  );
  const wMin = weightSeries.length
    ? Math.floor(Math.min(...weightSeries.map((d) => d.value)) - 2)
    : 0;
  const wMax = weightSeries.length
    ? Math.ceil(Math.max(...weightSeries.map((d) => d.value)) + 2)
    : 10;

  // Substance bars — group by week
  const { barData, subColors } = useMemo(() => {
    const weeks = {};
    const seen = new Set();
    records.forEach((r) => {
      const d = new Date(r.date ?? r.createdAt);
      const day = d.getDay();
      const diff = d.getDate() - (day === 0 ? 6 : day - 1);
      const mon = new Date(d);
      mon.setDate(diff);
      const key = fmtShort(mon);
      if (!weeks[key]) weeks[key] = { label: key, total: 0 };
      (r.substances ?? []).forEach((s) => {
        weeks[key][s] = (weeks[key][s] ?? 0) + 1;
        weeks[key].total += 1;
        seen.add(s);
      });
    });
    const colors = {};
    seen.forEach((s) => {
      colors[s] = sc(s);
    });
    return { barData: Object.values(weeks), subColors: colors };
  }, [records]);

  // Q scores
  const QC = [
    {
      key: "latestGad7",
      label: "GAD-7",
      max: 21,
      color: "#7C3AED",
      fn: (s) =>
        s <= 4 ? "Minimal" : s <= 9 ? "Mild" : s <= 14 ? "Moderate" : "Severe",
    },
    {
      key: "latestPhq9",
      label: "PHQ-9",
      max: 27,
      color: "#DC2626",
      fn: (s) =>
        s <= 4
          ? "Minimal"
          : s <= 9
            ? "Mild"
            : s <= 14
              ? "Moderate"
              : s <= 19
                ? "Mod-severe"
                : "Severe",
    },
    {
      key: "latestAudit",
      label: "AUDIT",
      max: 40,
      color: "#D97706",
      fn: (s) =>
        s <= 7
          ? "Low risk"
          : s <= 15
            ? "Hazardous"
            : s <= 19
              ? "Harmful"
              : "Likely dep.",
    },
    {
      key: "latestDast10",
      label: "DAST-10",
      max: 10,
      color: "#059669",
      fn: (s) =>
        s === 0
          ? "None"
          : s <= 2
            ? "Low"
            : s <= 5
              ? "Moderate"
              : s <= 8
                ? "Substantial"
                : "Severe",
    },
    {
      key: "latestCage",
      label: "CAGE",
      max: 4,
      color: "#0284C7",
      fn: (s) => (s <= 1 ? "Unlikely" : s <= 2 ? "Possible" : "Likely dep."),
    },
    {
      key: "latestReadiness",
      label: "Readiness",
      max: 30,
      color: "#0891B2",
      fn: (s) => (s <= 10 ? "Not ready" : s <= 20 ? "Considering" : "Ready"),
    },
  ];

  const qScores = useMemo(() => {
    if (!patient) return [];
    return QC.map((q) => {
      const raw = patient[q.key];
      if (!raw) return { ...q, score: null };
      const score = Object.values(raw).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      );
      return { ...q, score };
    });
  }, [patient]);

  const s = makeStyles(theme, insets);

  const noData = records.length === 0;

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
        <Text style={s.headerTitle}>{t.myData ?? "My Data"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}
      >
        {/* Range selector */}
        <View style={{ flexDirection: "row", marginBottom: Spacing.lg }}>
          {[
            { label: t.days7 ?? "7d", val: 7 },
            { label: t.days30 ?? "30d", val: 30 },
            { label: t.days90 ?? "90d", val: 90 },
            { label: t.allTime ?? "All", val: 3650 },
          ].map((r) => (
            <RangePill
              key={r.val}
              label={r.label}
              active={range === r.val}
              onPress={() => setRange(r.val)}
              theme={theme}
            />
          ))}
        </View>

        {noData && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📭</Text>
            <Text style={[s.emptyText, { color: theme.textMuted }]}>
              {t.noDataInRange ?? "No entries in this time range"}
            </Text>
          </View>
        )}

        {/* ── Mood chart ── */}
        {moodSeries.length > 1 && (
          <ChartCard
            title={t.moodOverTime ?? "Mood over time"}
            subtitle={t.scaleOneToFive ?? "Scale 1–5"}
            theme={theme}
          >
            <LineChartSVG
              data={moodSeries}
              color={theme.accent}
              yMin={1}
              yMax={5}
            />
          </ChartCard>
        )}

        {/* ── Cravings chart ── */}
        {cravSeries.length > 1 && (
          <ChartCard
            title={t.cravingsOverTime ?? "Cravings over time"}
            subtitle={t.scaleOneToFive ?? "Scale 1–5"}
            theme={theme}
          >
            <LineChartSVG data={cravSeries} color="#f4a07a" yMin={1} yMax={5} />
          </ChartCard>
        )}

        {/* ── Wellbeing chart ── */}
        {wellSeries.length > 1 && (
          <ChartCard
            title={t.wellbeingOverTime ?? "Wellbeing over time"}
            subtitle={t.scaleOneToFive ?? "Scale 1–5"}
            theme={theme}
          >
            <LineChartSVG data={wellSeries} color="#9c27b0" yMin={1} yMax={5} />
          </ChartCard>
        )}

        {/* ── Substance use chart ── */}
        {barData.length > 0 && Object.keys(subColors).length > 0 && (
          <ChartCard
            title={t.substanceUse ?? "Substance use"}
            subtitle={t.daysPerWeek ?? "Days logged per week"}
            theme={theme}
          >
            <BarChartSVG data={barData} colors={subColors} />
            {/* Legend */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 10,
              }}
            >
              {Object.entries(subColors).map(([s, c]) => (
                <View
                  key={s}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: c,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: FontSize.xs,
                      color: theme.textMuted,
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          </ChartCard>
        )}

        {/* ── Weight trend ── */}
        {weightSeries.length > 1 && (
          <ChartCard
            title={t.weightTrend ?? "Weight trend"}
            subtitle="kg"
            theme={theme}
          >
            <LineChartSVG
              data={weightSeries}
              color="#2d4a6e"
              yMin={wMin}
              yMax={wMax}
            />
          </ChartCard>
        )}

        {/* ── Questionnaire scores ── */}
        {qScores.length > 0 && (
          <ChartCard
            title={t.questionnaireScores ?? "Questionnaire scores"}
            subtitle={t.latestCompleted ?? "Latest completed"}
            theme={theme}
          >
            {qScores.map((q) => (
              <QScoreBar
                key={q.key}
                label={q.label}
                score={q.score}
                max={q.max}
                color={q.color}
                interp={q.score != null ? q.fn(q.score) : null}
              />
            ))}
          </ChartCard>
        )}
      </ScrollView>
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
    empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
    emptyEmoji: { fontSize: 40 },
    emptyText: { fontSize: FontSize.sm, textAlign: "center" },
  });
