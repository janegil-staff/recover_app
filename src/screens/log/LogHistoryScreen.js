// src/screens/log/LogHistoryScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useLogs }  from '../../context/PatientContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang }  from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../constants/theme';

// Cravings 0=best(green) → 5=worst(red) — used as avg score
const SCORE_COLORS = {
  0: '#22C55E', 1: '#7AABDB', 2: '#FBBF24',
  3: '#FB923C', 4: '#EF4444', 5: '#991B1B',
};

function avgScore(log) {
  // Use cravings as the primary "how bad was today" score
  // Invert mood/wellbeing (5=best → mapped to 0, 1=worst → mapped to 5)
  if (log.cravings != null) return Math.min(5, Math.round(log.cravings));
  if (log.mood != null) return Math.max(0, 6 - log.mood);
  return null;
}

function scoreColor(s) { return SCORE_COLORS[s] ?? '#b3cde8'; }

function daysInMonth(y, m)   { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y, m)  { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function toDateStr(y, m, d)  { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

// ── Calendar tab ──────────────────────────────────────────────────────────────
function CalendarTab({ logs, loading, navigation, t, theme }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const PRIMARY = theme?.accent ?? '#1a7f6e';
  const NAVY    = '#1a2928';
  const MUTED   = '#8aaba8';

  const scoreMap = {};
  logs.forEach(log => { const s = avgScore(log); if (s != null) scoreMap[log.date] = s; });

  const goBack    = () => { if (month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); };
  const goForward = () => {
    if (year===now.getFullYear()&&month===now.getMonth()) return;
    if (month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);
  };
  const isCurrentMonth = year===now.getFullYear()&&month===now.getMonth();

  const totalDays   = daysInMonth(year, month);
  const startOffset = firstWeekday(year, month);
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const monthLogs   = logs.filter(l => { const [ly,lm]=l.date.split('-').map(Number); return ly===year&&lm===month+1; });
  const totalLogged = monthLogs.length;
  const avgAll      = totalLogged ? Math.round(monthLogs.reduce((s,l)=>s+(avgScore(l)??0),0)/totalLogged) : null;

  const today    = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const months   = t.months   ?? ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Des'];
  const weekdays = t.weekdays ?? ['Man','Tir','Ons','Tor','Fre','Lør','Søn'];

  const scoreLabels = [
    t.scoreNone     ?? 'Ingen sug',
    t.scoreLow      ?? 'Lavt',
    t.scoreModerate ?? 'Moderat',
    t.scoreHigh     ?? 'Høyt',
    t.scoreVeryHigh ?? 'Veldig høyt',
    t.scoreSevere   ?? 'Kraftig sug',
  ];

  const countByScore = [0,1,2,3,4,5].map(s => ({
    score: s, count: monthLogs.filter(l => avgScore(l)===s).length,
    label: scoreLabels[s], color: scoreColor(s),
  }));

  return (
    <View style={{ flex: 1 }}>
      {/* Month nav */}
      <View style={cal.monthNav}>
        <TouchableOpacity onPress={goBack} style={cal.navBtn}>
          <Text style={[cal.navArrow, { color: NAVY }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[cal.monthTitle, { color: NAVY }]}>
          {(months[month] ?? '').toUpperCase()}{'  '}{year}
        </Text>
        <TouchableOpacity onPress={goForward} style={[cal.navBtn, isCurrentMonth&&{opacity:0.3}]} disabled={isCurrentMonth}>
          <Text style={[cal.navArrow, { color: isCurrentMonth?'#ccc':NAVY }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar grid */}
      <View style={[cal.card, { backgroundColor: '#fff' }]}>
        <View style={cal.weekdayRow}>
          {weekdays.map((d,i) => <Text key={i} style={[cal.weekdayLabel,{color:MUTED}]}>{d}</Text>)}
        </View>
        {loading
          ? <ActivityIndicator color={PRIMARY} style={{ marginVertical: 24 }} />
          : <View style={cal.grid}>
              {cells.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={cal.cell} />;
                const dateStr    = toDateStr(year, month, day);
                const score      = scoreMap[dateStr];
                const isToday    = dateStr === today;
                const isFuture   = dateStr > today;
                const existing   = logs.find(l => l.date === dateStr) ?? null;
                const bg         = score != null ? scoreColor(score) : undefined;
                return (
                  <TouchableOpacity key={dateStr} style={cal.cell} activeOpacity={isFuture?1:0.7}
                    onPress={() => !isFuture && navigation.navigate('LogEntry', { date: dateStr, log: existing })}>
                    <View style={[
                      cal.cellInner,
                      isFuture && { borderWidth: 0 },
                      !isFuture && !score && { borderColor: '#a0b8d0', borderWidth: 2 },
                      bg && { backgroundColor: bg, borderColor: bg },
                      isToday && !score && { borderColor: PRIMARY, borderWidth: 2 },
                    ]}>
                      <Text style={[cal.cellText,{color:score?'#fff':NAVY},
                        isToday&&!score&&{color:PRIMARY,fontWeight:'800'}]}>
                        {day}
                      </Text>
                      {!!(existing?.note?.trim()) && (
                        <View style={cal.noteIcon}>
                          <Svg width="18" height="18" viewBox="0 0 24 24">
                            <Circle cx="12" cy="12" r="10" fill="none" stroke="#1a7f6e" strokeWidth="2.5" />
                            <Path d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z" fill="#1a7f6e" />
                          </Svg>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
        }
      </View>

      {/* Month summary */}
      <View style={[cal.card, { backgroundColor: '#fff' }]}>
        <Text style={[cal.sectionTitle,{color:NAVY}]}>{t.monthSummary ?? 'Månedsoversikt'}</Text>
        <View style={cal.summaryRow}>
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue,{color:PRIMARY}]}>{totalLogged}</Text>
            <Text style={[cal.summarySubLabel,{color:MUTED}]}>{t.daysLogged}</Text>
          </View>
          <View style={[cal.divider,{backgroundColor:'#e8eef5'}]} />
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue,{color:avgAll!=null?scoreColor(avgAll):MUTED}]}>
              {avgAll != null ? scoreLabels[avgAll] : '—'}
            </Text>
            <Text style={[cal.summarySubLabel,{color:MUTED}]}>{t.avgCravings}</Text>
          </View>
          <View style={[cal.divider,{backgroundColor:'#e8eef5'}]} />
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue,{color:PRIMARY}]}>{totalDays - totalLogged}</Text>
            <Text style={[cal.summarySubLabel,{color:MUTED}]}>{t.missing ?? 'Mangler'}</Text>
          </View>
        </View>
      </View>

      {/* Score breakdown */}
      <View style={[cal.card, { backgroundColor: '#fff', marginBottom: 40 }]}>
        <Text style={[cal.sectionTitle,{color:NAVY}]}>{t.cravingBreakdown ?? 'Sug-oversikt'}</Text>
        {countByScore.map(({ score, count, label, color }) => (
          <View key={score} style={cal.breakdownRow}>
            <View style={[cal.breakdownDot,{backgroundColor:color}]} />
            <Text style={[cal.breakdownLabel,{color:NAVY}]}>{label}</Text>
            <View style={[cal.breakdownBarBg,{backgroundColor:'#e8eef5'}]}>
              <View style={[cal.breakdownBar,{backgroundColor:color,
                width: totalLogged ? `${Math.round((count/totalLogged)*100)}%` : '0%'}]} />
            </View>
            <Text style={[cal.breakdownCount,{color:MUTED}]}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  monthNav:         { flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:8 },
  navBtn:           { padding: 8 },
  navArrow:         { fontSize: 28, fontWeight: '300' },
  monthTitle:       { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  card:             { borderRadius:14,padding:16,marginHorizontal:16,marginBottom:12,
                      shadowColor:'#000',shadowOpacity:0.06,shadowRadius:8,shadowOffset:{width:0,height:2},elevation:2 },
  sectionTitle:     { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  weekdayRow:       { flexDirection: 'row', marginBottom: 6 },
  weekdayLabel:     { flex:1,textAlign:'center',fontSize:11,fontWeight:'700' },
  grid:             { flexDirection:'row',flexWrap:'wrap' },
  cell:             { width:`${100/7}%`,aspectRatio:1,paddingHorizontal:7,paddingVertical:5 },
  cellInner:        { flex:1,width:'100%',alignItems:'center',justifyContent:'center',
                      borderRadius:12,borderWidth:1.5,borderColor:'#2d4a6e',overflow:'visible' },
  cellText:         { fontSize: 13, fontWeight: '600' },
  noteIcon:         { position:'absolute',bottom:-6,right:-6,width:18,height:18 },
  summaryRow:       { flexDirection:'row',justifyContent:'space-around',alignItems:'center' },
  summaryItem:      { alignItems:'center',flex:1 },
  summaryValue:     { fontSize: 20, fontWeight: '800' },
  summarySubLabel:  { fontSize: 11, marginTop: 2 },
  divider:          { width:1,height:40 },
  breakdownRow:     { flexDirection:'row',alignItems:'center',marginBottom:10,gap:8 },
  breakdownDot:     { width:10,height:10,borderRadius:5 },
  breakdownLabel:   { fontSize:12,fontWeight:'500',width:90 },
  breakdownBarBg:   { flex:1,height:8,borderRadius:4,overflow:'hidden' },
  breakdownBar:     { height:'100%',borderRadius:4 },
  breakdownCount:   { fontSize:12,fontWeight:'600',width:24,textAlign:'right' },
});

// ── Diary month view ──────────────────────────────────────────────────────────
function DiaryView({ logs, navigation, t, theme }) {
  const PRIMARY = theme?.accent ?? '#1a7f6e';
  const NAVY    = '#1a2928';
  const MUTED   = '#8aaba8';
  const months  = t.months ?? ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Des'];
  const [collapsed, setCollapsed] = useState({});
  const toggle = key => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const grouped = {};
  logs.forEach(log => {
    const key = log.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const sections = Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(key => {
    const [y, m] = key.split('-').map(Number);
    const ml     = grouped[key];
    const scores = ml.map(l => avgScore(l)).filter(s => s != null);
    const avg    = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
    return { key, year: y, month: m-1, logs: ml, avg };
  });

  const scoreLabels = [
    t.scoreNone??'Ingen sug', t.scoreLow??'Lavt', t.scoreModerate??'Moderat',
    t.scoreHigh??'Høyt', t.scoreVeryHigh??'Veldig høyt', t.scoreSevere??'Kraftig sug',
  ];

  const shortDate = dateStr => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${(months[d.getMonth()]??'').slice(0,3)}'${String(d.getFullYear()).slice(2)}`;
  };

  return (
    <FlatList
      data={sections}
      keyExtractor={item => item.key}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ color: theme.textMuted, fontSize: FontSize.md }}>{t.noRecords}</Text>
        </View>
      }
      renderItem={({ item }) => {
        const pillBg   = item.avg != null ? scoreColor(item.avg) + '33' : '#e8eef5';
        const pillText = item.avg != null ? scoreColor(item.avg) : NAVY;
        const isOpen   = collapsed[item.key] !== false;
        return (
          <View style={{ marginBottom: 20 }}>
            {/* Month pill header */}
            <TouchableOpacity
              style={{ backgroundColor: pillBg, borderRadius: 30, paddingVertical: 14,
                paddingHorizontal: 20, alignItems: 'center', marginBottom: 12,
                flexDirection: 'row', justifyContent: 'center' }}
              onPress={() => toggle(item.key)} activeOpacity={0.8}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: pillText, fontSize: 20, fontWeight: '800' }}>
                  {months[item.month]} {item.year}
                </Text>
                <Text style={{ color: pillText, fontSize: 13, marginTop: 2, opacity: 0.8 }}>
                  {t.avgCravings}: {item.avg != null ? scoreLabels[item.avg] : '—'}
                </Text>
              </View>
              <Text style={{ color: pillText, fontSize: 20, opacity: 0.7, marginLeft: 8 }}>
                {isOpen ? '›' : '‹'}
              </Text>
            </TouchableOpacity>

            {/* Log cards */}
            {!isOpen && item.logs.map(log => {
              const score    = avgScore(log);
              const dotColor = score != null ? scoreColor(score) : '#b3cde8';
              return (
                <TouchableOpacity key={log.date}
                  style={{ backgroundColor: '#fff', borderRadius: 16, marginBottom: 10,
                    padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
                  onPress={() => navigation.navigate('LogEntry', { date: log.date, log })}
                  activeOpacity={0.75}>

                  {/* Coloured date square */}
                  <View style={{ width: 52, height: 52, borderRadius: 14,
                      backgroundColor: dotColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
                      {new Date(log.date).getDate()}
                    </Text>
                    {!!(log.note?.trim()) && (
                      <View style={{ position:'absolute',bottom:-6,right:-6,width:18,height:18 }}>
                        <Svg width="18" height="18" viewBox="0 0 24 24">
                          <Circle cx="12" cy="12" r="10" fill="none" stroke="#1a7f6e" strokeWidth="2.5" />
                          <Path d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z" fill="#1a7f6e" />
                        </Svg>
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    {log.substances?.length > 0 && (
                      <Text style={{ color: '#444', fontSize: 13, marginBottom: 2 }}>
                        <Text style={{ fontWeight: '700' }}>{t.substancesUsed}: </Text>
                        {log.substances.map(s => t[s] ?? s).join(', ')}
                      </Text>
                    )}
                    {log.cravings != null && (
                      <Text style={{ color: '#444', fontSize: 13, marginBottom: 2 }}>
                        <Text style={{ fontWeight: '700' }}>{t.cravings}: </Text>
                        {log.cravings}/5
                      </Text>
                    )}
                    {log.mood != null && (
                      <Text style={{ color: '#444', fontSize: 13, marginBottom: 2 }}>
                        <Text style={{ fontWeight: '700' }}>{t.mood}: </Text>
                        {log.mood}/5
                      </Text>
                    )}
                    {log.wellbeing != null && (
                      <Text style={{ color: '#444', fontSize: 13, marginBottom: 2 }}>
                        <Text style={{ fontWeight: '700' }}>{t.wellbeing}: </Text>
                        {log.wellbeing}/5
                      </Text>
                    )}
                    {log.frequency && log.frequency !== 'none' && (
                      <Text style={{ color: '#444', fontSize: 13, marginBottom: 2 }}>
                        <Text style={{ fontWeight: '700' }}>{t.frequency}: </Text>
                        {t[log.frequency] ?? log.frequency}
                      </Text>
                    )}
                    {log.note?.trim() && (
                      <Text style={{ color: '#444', fontSize: 13 }} numberOfLines={2}>
                        <Text style={{ fontWeight: '700' }}>{t.note}: </Text>{log.note}
                      </Text>
                    )}
                  </View>

                  {/* Date + edit */}
                  <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 52 }}>
                    <Text style={{ color: MUTED, fontSize: 12, fontWeight: '500' }}>
                      {shortDate(log.date)}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('LogEntry',{date:log.date,log})}
                      style={{ marginTop: 8 }}>
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                          fill="none" stroke="#1a7f6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <Path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill="none" stroke="#1a7f6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </TouchableOpacity>
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


// ── Stats tab — weight chart + sobriety streak ────────────────────────────────
function StatsTab({ logs, sobrietyStreak, theme, t }) {
  const PRIMARY = theme?.accent ?? '#1a7f6e';
  const NAVY    = '#1a2928';
  const MUTED   = '#8aaba8';

  // Weight data — last 30 logs that have weight
  const weightData = logs
    .filter(l => l.weight != null && l.weight > 0)
    .slice(0, 30)
    .reverse();

  // Craving averages by week
  const avgCravings = logs.length
    ? (logs.reduce((s, l) => s + (l.cravings ?? 0), 0) / logs.length).toFixed(1)
    : '—';
  const avgMood = logs.length
    ? (logs.reduce((s, l) => s + (l.mood ?? 0), 0) / logs.length).toFixed(1)
    : '—';

  const maxWeight = weightData.length ? Math.max(...weightData.map(l => l.weight)) : 100;
  const minWeight = weightData.length ? Math.min(...weightData.map(l => l.weight)) : 0;
  const chartH    = 140;
  const chartW    = 280;

  const CRAVING_COLORS = ['#22C55E','#7AABDB','#FBBF24','#FB923C','#EF4444','#991B1B'];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

      {/* ── Sobriety streak ──────────────────────────────────────── */}
      <View style={[st.card, { backgroundColor: PRIMARY }]}>
        <Text style={[st.cardLabel, { color: 'rgba(255,255,255,0.8)' }]}>
          Rusfrie dager på rad
        </Text>
        <Text style={st.streakNumber}>{sobrietyStreak}</Text>
        <Text style={[st.cardLabel, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
          {sobrietyStreak === 0
            ? 'Logg en rusfri dag for å starte streaken'
            : sobrietyStreak === 1
              ? '🌱 Bra start!'
              : sobrietyStreak < 7
                ? '💪 Fortsett så!'
                : sobrietyStreak < 30
                  ? '🔥 Fantastisk fremgang!'
                  : '🏆 Utrolig bragd!'}
        </Text>
      </View>

      {/* ── Summary stats ────────────────────────────────────────── */}
      <View style={[st.card, { backgroundColor: '#fff' }]}>
        <Text style={[st.sectionTitle, { color: NAVY }]}>30-dagers oversikt</Text>
        <View style={st.statRow}>
          <View style={st.statItem}>
            <Text style={[st.statValue, { color: PRIMARY }]}>{logs.length}</Text>
            <Text style={[st.statLabel, { color: MUTED }]}>{t.daysLogged ?? 'Dager logget'}</Text>
          </View>
          <View style={[st.statDivider, { backgroundColor: '#e8eef5' }]} />
          <View style={st.statItem}>
            <Text style={[st.statValue, { color: CRAVING_COLORS[Math.round(parseFloat(avgCravings)) || 0] }]}>
              {avgCravings}
            </Text>
            <Text style={[st.statLabel, { color: MUTED }]}>{t.avgCravings ?? 'Gj.snitt sug'}</Text>
          </View>
          <View style={[st.statDivider, { backgroundColor: '#e8eef5' }]} />
          <View style={st.statItem}>
            <Text style={[st.statValue, { color: PRIMARY }]}>{avgMood}</Text>
            <Text style={[st.statLabel, { color: MUTED }]}>{t.avgMood ?? 'Gj.snitt humør'}</Text>
          </View>
        </View>
      </View>

      {/* ── Weight chart ─────────────────────────────────────────── */}
      <View style={[st.card, { backgroundColor: '#fff' }]}>
        <Text style={[st.sectionTitle, { color: NAVY }]}>Vektutvikling</Text>
        {weightData.length < 2 ? (
          <Text style={[st.emptyText, { color: MUTED }]}>
            Logg vekt i dagboken for å se grafen (trenger minst 2 målinger)
          </Text>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            {/* Simple SVG-free line chart using Views */}
            <View style={{ width: chartW, height: chartH, position: 'relative' }}>
              {/* Y axis labels */}
              {[maxWeight, (maxWeight + minWeight) / 2, minWeight].map((v, i) => (
                <Text key={i} style={{
                  position: 'absolute', left: 0, top: i * (chartH / 2) - 8,
                  fontSize: 10, color: MUTED, width: 36, textAlign: 'right',
                }}>
                  {v.toFixed(0)}
                </Text>
              ))}
              {/* Chart area */}
              <View style={{ position: 'absolute', left: 42, right: 0, top: 0, bottom: 0 }}>
                {/* Grid lines */}
                {[0, 0.5, 1].map((p, i) => (
                  <View key={i} style={{
                    position: 'absolute', left: 0, right: 0,
                    top: p * chartH, height: 1, backgroundColor: '#e8eef5',
                  }} />
                ))}
                {/* Data points + connecting lines */}
                {weightData.map((log, i) => {
                  const x = (i / (weightData.length - 1)) * (chartW - 42);
                  const y = chartH - ((log.weight - minWeight) / (maxWeight - minWeight + 0.01)) * chartH;
                  return (
                    <View key={log.date}>
                      <View style={{
                        position: 'absolute', left: x - 5, top: y - 5,
                        width: 10, height: 10, borderRadius: 5,
                        backgroundColor: PRIMARY, borderWidth: 2, borderColor: '#fff',
                      }} />
                      {i < weightData.length - 1 && (() => {
                        const nx = ((i + 1) / (weightData.length - 1)) * (chartW - 42);
                        const ny = chartH - ((weightData[i + 1].weight - minWeight) / (maxWeight - minWeight + 0.01)) * chartH;
                        const dx = nx - x;
                        const dy = ny - y;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                        return (
                          <View style={{
                            position: 'absolute',
                            left: x, top: y,
                            width: len, height: 2,
                            backgroundColor: PRIMARY + '80',
                            transformOrigin: '0 0',
                            transform: [{ rotate: `${angle}deg` }],
                          }} />
                        );
                      })()}
                    </View>
                  );
                })}
              </View>
            </View>
            {/* Latest weight */}
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 8 }}>
              Siste: {weightData[weightData.length - 1]?.weight} kg
              {weightData.length > 1 && (() => {
                const diff = weightData[weightData.length - 1].weight - weightData[0].weight;
                return ` (${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg)`;
              })()}
            </Text>
          </View>
        )}
      </View>

      {/* ── Substance frequency ───────────────────────────────────── */}
      <View style={[st.card, { backgroundColor: '#fff' }]}>
        <Text style={[st.sectionTitle, { color: NAVY }]}>Hyppigste stoffer</Text>
        {(() => {
          const counts = {};
          logs.forEach(l => (l.substances ?? []).forEach(s => { counts[s] = (counts[s] ?? 0) + 1; }));
          const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
          if (!sorted.length) return (
            <Text style={[st.emptyText, { color: MUTED }]}>Ingen stoffer registrert ennå</Text>
          );
          const max = sorted[0][1];
          return sorted.map(([sub, count]) => (
            <View key={sub} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: NAVY, fontSize: 13, fontWeight: '500' }}>
                  {t[sub] ?? sub}
                </Text>
                <Text style={{ color: MUTED, fontSize: 12 }}>{count}x</Text>
              </View>
              <View style={{ height: 8, backgroundColor: '#e8eef5', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{
                  height: '100%', borderRadius: 4, backgroundColor: PRIMARY,
                  width: `${(count / max) * 100}%`,
                }} />
              </View>
            </View>
          ));
        })()}
      </View>

    </ScrollView>
  );
}

const st = StyleSheet.create({
  card:        { borderRadius: 14, padding: 16, marginBottom: 12,
                 shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
                 shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sectionTitle:{ fontSize: 14, fontWeight: '700', marginBottom: 12 },
  cardLabel:   { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  streakNumber:{ fontSize: 72, fontWeight: '900', color: '#fff', textAlign: 'center', lineHeight: 80 },
  statRow:     { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem:    { alignItems: 'center', flex: 1 },
  statValue:   { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 11, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 40 },
  emptyText:   { fontSize: 13, textAlign: 'center', paddingVertical: 20 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LogHistoryScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab ?? 'calendar');
  const { logs, loading, fetchLogs, sobrietyStreak } = useLogs();
  const { theme }  = useTheme();
  const { t }      = useLang();
  const insets     = useSafeAreaInsets();
  const PRIMARY    = theme?.accent ?? '#1a7f6e';

  useFocusEffect(useCallback(() => { fetchLogs(); }, [fetchLogs]));

  const s = makeStyles(theme, insets);

  return (
    <View style={[s.root, { backgroundColor: theme.bgSecondary ?? '#F0F4F8' }]}>

      <View style={[s.header, { backgroundColor: PRIMARY, paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.myDiary}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab buttons */}
      <View style={s.tabBar}>
        {['calendar','diary','stats'].map(tab => {
          const isActive = activeTab === tab;
          const label    = tab === 'calendar' ? (t.calendar ?? 'Kalender') : tab === 'diary' ? (t.diary ?? 'Dagbok') : 'Stats';
          return (
            <TouchableOpacity key={tab}
              style={[s.tab, isActive && { borderColor: PRIMARY, overflow: 'hidden', paddingVertical: 0 }]}
              onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
              {isActive
                ? <View style={[s.tabGradient, { backgroundColor: PRIMARY }]}>
                    <Text style={s.tabTextActive}>{label}</Text>
                  </View>
                : <Text style={s.tabText}>{label}</Text>
              }
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'calendar' && (
        <FlatList data={[]} renderItem={null}
          ListHeaderComponent={
            <CalendarTab logs={logs} loading={loading} navigation={navigation} t={t} theme={theme} />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'diary' && (
        <DiaryView logs={logs} navigation={navigation} t={t} theme={theme} />
      )}
      {activeTab === 'stats' && (
        <StatsTab logs={logs} sobrietyStreak={sobrietyStreak} theme={theme} t={t} />
      )}
    </View>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingBottom:8 },
  backBtn:       { width: 40 },
  back:          { color:'#fff',fontSize:30 },
  headerTitle:   { flex:1,color:'#fff',fontSize:FontSize.md,fontWeight:'600',textAlign:'center' },
  tabBar:        { flexDirection:'row',paddingHorizontal:16,paddingVertical:12,gap:8,
                   backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:t.border??'#e8eef5' },
  tab:           { flex:1,borderRadius:6,alignItems:'center',justifyContent:'center',
                   backgroundColor:'#fff',borderWidth:1,borderColor:t.border??'#dde5ee',
                   paddingVertical:16,
                   shadowColor:'#000',shadowOpacity:0.22,shadowRadius:10,
                   shadowOffset:{width:0,height:5},elevation:8 },
  tabGradient:   { width:'100%',alignItems:'center',justifyContent:'center',paddingVertical:16 },
  tabText:       { color:t.textMuted??'#8fa8c8',fontSize:FontSize.sm,fontWeight:'600' },
  tabTextActive: { color:'#fff',fontWeight:'700' },
});
