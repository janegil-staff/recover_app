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
  Polygon,
  G,
} from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useLogs } from "../../context/PatientContext";
import { FontSize, Spacing, Radius } from "../../constants/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - Spacing.lg * 2 - 32;
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
  mdma: "#ec407a",
  ecstasy: "#ec407a",
  ghb: "#00acc1",
  acid: "#9c27b0",
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

// ── SVG Spider / Radar Chart ──────────────────────────────────────────────────
function SpiderChart({ data, color = "#4a7ab5", fillColor, size = 180 }) {
  if (!data || data.length < 3) return null;

  const PAD = 36; // extra space for axis labels
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.32; // smaller radius to leave room for labels
  const n = data.length;
  const levels = 5;

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = R * ((l + 1) / levels);
    return Array.from(
      { length: n },
      (_, i) => `${pt(i, r).x},${pt(i, r).y}`,
    ).join(" ");
  });

  const spokes = Array.from({ length: n }, (_, i) => ({
    x1: cx,
    y1: cy,
    x2: pt(i, R).x,
    y2: pt(i, R).y,
  }));

  const dataPoints = data.map((d, i) => {
    const r = R * Math.min(1, Math.max(0, d.value / d.max));
    return pt(i, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const fill = fillColor ?? color + "30";
  const vbSize = size + PAD * 2;

  return (
    <Svg
      width={size + PAD * 2}
      height={size + PAD * 2}
      viewBox={`${-PAD} ${-PAD} ${vbSize} ${vbSize}`}
    >
      {gridPolygons.map((pts, l) => (
        <Polygon
          key={l}
          points={pts}
          fill="none"
          stroke="#d0dcea"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: levels }, (_, l) => {
        const r = R * ((l + 1) / levels);
        return (
          <SvgText
            key={l}
            x={cx + 4}
            y={cy - r - 2}
            fontSize="8"
            fill="#aabdd0"
            textAnchor="start"
          >
            {l + 1}
          </SvgText>
        );
      })}
      {spokes.map((s, i) => (
        <Line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="#d0dcea"
          strokeWidth="1"
        />
      ))}
      <Polygon
        points={dataPolygon}
        fill={fill}
        stroke={color}
        strokeWidth="2"
      />
      {dataPoints.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill={color}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}
      {data.map((d, i) => {
        const lp = pt(i, R + 22);
        const anchor =
          lp.x < cx - 5 ? "end" : lp.x > cx + 5 ? "start" : "middle";
        return (
          <SvgText
            key={i}
            x={lp.x}
            y={lp.y + 4}
            fontSize="9"
            fill="#7a9ab8"
            fontWeight="600"
            textAnchor={anchor}
          >
            {d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ── Spider chart card with two overlapping series ─────────────────────────────
function DualSpiderChart({ data1, color1, data2, color2, size = 180 }) {
  if (!data1 || data1.length < 3) return null;
  const PAD = 36;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.32;
  const n = data1.length;
  const levels = 5;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });
  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = R * ((l + 1) / levels);
    return Array.from(
      { length: n },
      (_, i) => `${pt(i, r).x},${pt(i, r).y}`,
    ).join(" ");
  });
  const spokes = Array.from({ length: n }, (_, i) => ({
    x1: cx,
    y1: cy,
    x2: pt(i, R).x,
    y2: pt(i, R).y,
  }));

  const polyPts = (data) =>
    data.map((d, i) => {
      const r = R * Math.min(1, Math.max(0, d.value / d.max));
      return pt(i, r);
    });

  const pts1 = polyPts(data1);
  const pts2 = data2 ? polyPts(data2) : null;
  const vbSize = size + PAD * 2;

  return (
    <Svg
      width={size + PAD * 2}
      height={size + PAD * 2}
      viewBox={`${-PAD} ${-PAD} ${vbSize} ${vbSize}`}
    >
      {gridPolygons.map((pts, l) => (
        <Polygon
          key={l}
          points={pts}
          fill="none"
          stroke="#d0dcea"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: levels }, (_, l) => {
        const r = R * ((l + 1) / levels);
        return (
          <SvgText
            key={l}
            x={cx + 4}
            y={cy - r - 2}
            fontSize="8"
            fill="#aabdd0"
            textAnchor="start"
          >
            {l + 1}
          </SvgText>
        );
      })}
      {spokes.map((s, i) => (
        <Line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="#d0dcea"
          strokeWidth="1"
        />
      ))}
      {pts2 && (
        <Polygon
          points={pts2.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={color2 + "25"}
          stroke={color2}
          strokeWidth="1.5"
        />
      )}
      <Polygon
        points={pts1.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={color1 + "30"}
        stroke={color1}
        strokeWidth="2"
      />
      {pts1.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={color1}
          stroke="#fff"
          strokeWidth="1.5"
        />
      ))}
      {data1.map((d, i) => {
        const lp = pt(i, R + 22);
        const anchor =
          lp.x < cx - 5 ? "end" : lp.x > cx + 5 ? "start" : "middle";
        return (
          <SvgText
            key={i}
            x={lp.x}
            y={lp.y + 4}
            fontSize="9"
            fill="#7a9ab8"
            fontWeight="600"
            textAnchor={anchor}
          >
            {d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ── Line chart ────────────────────────────────────────────────────────────────
function LineChartSVG({ data, color, yMax = 5, yMin = 0 }) {
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
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <Circle key={i} cx={toX(i)} cy={toY(d.value)} r="3.5" fill={color} />
      ))}
    </Svg>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
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
function ChartCard({ title, subtitle, theme, children, center }) {
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
      <View style={center ? { alignItems: "center" } : undefined}>
        {children}
      </View>
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

// ── Q Score bar ───────────────────────────────────────────────────────────────
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

  // QC — labels are fixed short codes (GAD-7 etc.) so they stay as-is;
  // interpretation fn uses translation keys so the text in the score bar
  // changes with language.
  const QC = useMemo(
    () => [
      {
        key: "latestGad7",
        label: "GAD-7",
        max: 21,
        color: "#7C3AED",
        fn: (s) =>
          s <= 4
            ? (t.qcMinimal ?? "Minimal")
            : s <= 9
              ? (t.qcMild ?? "Mild")
              : s <= 14
                ? (t.qcModerate ?? "Moderate")
                : (t.qcSevere ?? "Severe"),
      },
      {
        key: "latestPhq9",
        label: "PHQ-9",
        max: 27,
        color: "#DC2626",
        fn: (s) =>
          s <= 4
            ? (t.qcMinimal ?? "Minimal")
            : s <= 9
              ? (t.qcMild ?? "Mild")
              : s <= 14
                ? (t.qcModerate ?? "Moderate")
                : s <= 19
                  ? (t.qcModSevere ?? "Mod-severe")
                  : (t.qcSevere ?? "Severe"),
      },
      {
        key: "latestAudit",
        label: "AUDIT",
        max: 40,
        color: "#D97706",
        fn: (s) =>
          s <= 7
            ? (t.qcLowRisk ?? "Low risk")
            : s <= 15
              ? (t.qcHazardous ?? "Hazardous")
              : s <= 19
                ? (t.qcHarmful ?? "Harmful")
                : (t.qcLikelyDep ?? "Likely dep."),
      },
      {
        key: "latestDast10",
        label: "DAST-10",
        max: 10,
        color: "#059669",
        fn: (s) =>
          s === 0
            ? (t.qcNone ?? "None")
            : s <= 2
              ? (t.qcLow ?? "Low")
              : s <= 5
                ? (t.qcModerate ?? "Moderate")
                : s <= 8
                  ? (t.qcSubstantial ?? "Substantial")
                  : (t.qcSevere ?? "Severe"),
      },
      {
        key: "latestCage",
        label: "CAGE",
        max: 4,
        color: "#0284C7",
        fn: (s) =>
          s <= 1
            ? (t.qcUnlikely ?? "Unlikely")
            : s <= 2
              ? (t.qcPossible ?? "Possible")
              : (t.qcLikelyDep ?? "Likely dep."),
      },
      {
        key: "latestReadiness",
        label: "Readiness",
        max: 30,
        color: "#0891B2",
        fn: (s) =>
          s <= 10
            ? (t.qcNotReady ?? "Not ready")
            : s <= 20
              ? (t.qcConsidering ?? "Considering")
              : (t.qcReady ?? "Ready"),
      },
    ],
    [t],
  );

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
  }, [patient, QC]);

  // ── Spider data ───────────────────────────────────────────────────────────

  // 1. Recovery Profile
  const recoverySpider = useMemo(() => {
    if (!records.length) return null;
    const avg = (key) => {
      const v = records.map((r) => r[key]).filter((x) => x != null);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const avgMood = avg("mood");
    const avgWellbeing = avg("wellbeing");
    const avgCravings = avg("cravings");
    const avgAmount = avg("amount");
    const soberDays = records.filter((r) => !r.substances?.length).length;
    const soberPct = (soberDays / records.length) * 5;
    return [
      { label: t.axisMood ?? "Mood", value: avgMood ?? 0, max: 5 },
      {
        label: t.axisWellbeing ?? "Wellbeing",
        value: avgWellbeing ?? 0,
        max: 5,
      },
      {
        label: t.axisLowCraving ?? "Low craving",
        value: avgCravings != null ? Math.max(0, 5 - avgCravings) : 5,
        max: 5,
      },
      {
        label: t.axisLowAmount ?? "Low amount",
        value: avgAmount != null ? Math.max(0, 5 - (avgAmount / 10) * 5) : 5,
        max: 5,
      },
      {
        label: `${t.axisSober ?? "Sober"} (${soberDays}d)`,
        value: soberPct,
        max: 5,
      },
    ];
  }, [records, t]);

  // 2. Substance Profile — days used per substance
  // Keep the raw substance key alongside the translated label so the second
  // series can match by key rather than by translated string.
  const substanceSpider = useMemo(() => {
    const map = {};
    records.forEach((r) =>
      (r.substances ?? []).forEach((s) => {
        if (!map[s]) map[s] = { count: 0, totalAmt: 0 };
        map[s].count++;
        map[s].totalAmt += r.amount ?? 0;
      }),
    );
    const entries = Object.entries(map);
    if (entries.length < 3) return null;
    const maxCount = Math.max(...entries.map(([, v]) => v.count));
    return entries.map(([s, v]) => ({
      key: s,
      label: t[s] ?? s.charAt(0).toUpperCase() + s.slice(1),
      value: v.count,
      max: maxCount,
    }));
  }, [records, t]);

  // Substance Profile second layer — avg amount
  const substanceSpider2 = useMemo(() => {
    if (!substanceSpider) return null;
    const map = {};
    records.forEach((r) =>
      (r.substances ?? []).forEach((s) => {
        if (!map[s]) map[s] = { count: 0, totalAmt: 0 };
        map[s].count++;
        map[s].totalAmt += r.amount ?? 0;
      }),
    );
    const avgs = Object.fromEntries(
      Object.entries(map).map(([k, v]) => [
        k,
        v.count ? v.totalAmt / v.count : 0,
      ]),
    );
    const maxAmt = Math.max(...Object.values(avgs), 1);
    return substanceSpider.map((d) => ({
      ...d,
      value: avgs[d.key] ?? 0,
      max: maxAmt,
    }));
  }, [substanceSpider, records]);

  // 3. Questionnaire radar
  const qSpider = useMemo(() => {
    const filled = qScores.filter((q) => q.score != null);
    if (filled.length < 3) return null;
    return filled.map((q) => ({ label: q.label, value: q.score, max: q.max }));
  }, [qScores]);

  const s = makeStyles(theme, insets);
  const noData = records.length === 0;
  const SPIDER_SIZE = Math.min(CHART_W, 220);

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

        {/* ── Recovery Profile spider ── */}
        {recoverySpider && (
          <ChartCard
            title={t.recoveryProfileTitle ?? "Recovery Profile"}
            subtitle={t.recoveryProfileSub ?? "Higher = better on all axes"}
            theme={theme}
            center
          >
            <SpiderChart
              data={recoverySpider}
              color="#66bb6a"
              size={SPIDER_SIZE}
            />
          </ChartCard>
        )}

        {/* ── Substance Profile spider ── */}
        {substanceSpider && (
          <ChartCard
            title={t.substanceProfileTitle ?? "Substance Profile"}
            subtitle={
              t.substanceProfileSub ?? "Days used (blue) · Avg amount (pink)"
            }
            theme={theme}
            center
          >
            <DualSpiderChart
              data1={substanceSpider}
              color1="#4a7ab5"
              data2={substanceSpider2}
              color2="#ec407a"
              size={SPIDER_SIZE}
            />
            {/* Legend */}
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                marginTop: 10,
                justifyContent: "center",
              }}
            >
              {[
                ["#4a7ab5", t.legendDaysUsed ?? "Days used"],
                ["#ec407a", t.legendAvgAmount ?? "Avg amount"],
              ].map(([c, l]) => (
                <View
                  key={l}
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: c,
                    }}
                  />
                  <Text
                    style={{ fontSize: FontSize.xs, color: theme.textMuted }}
                  >
                    {l}
                  </Text>
                </View>
              ))}
            </View>
          </ChartCard>
        )}

        {/* ── Questionnaire spider ── */}
        {qSpider && (
          <ChartCard
            title={t.questionnaireRadarTitle ?? "Questionnaire Radar"}
            subtitle={
              t.questionnaireRadarSub ?? "% of maximum score per assessment"
            }
            theme={theme}
            center
          >
            <SpiderChart data={qSpider} color="#7C3AED" size={SPIDER_SIZE} />
          </ChartCard>
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
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 10,
              }}
            >
              {Object.entries(subColors).map(([name, c]) => (
                <View
                  key={name}
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
                    style={{ fontSize: FontSize.xs, color: theme.textMuted }}
                  >
                    {t[name] ?? name.charAt(0).toUpperCase() + name.slice(1)}
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
