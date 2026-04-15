#!/usr/bin/env node
/**
 * patch_mydata_translations.cjs
 * Adds missing MyDataScreen translation keys to all language objects
 * in src/translations/index.js
 *
 * Usage: node patch_mydata_translations.cjs
 * Run from the project root (where src/ lives).
 */

const fs   = require('fs');
const path = require('path');

const TARGET = path.resolve('src/translations/index.js');

// ── Keys to inject per language ───────────────────────────────────────────────
const patches = {
  en: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'All',
    noDataInRange:       'No entries in this time range',
    moodOverTime:        'Mood over time',
    cravingsOverTime:    'Cravings over time',
    wellbeingOverTime:   'Wellbeing over time',
    scaleOneToFive:      'Scale 1–5',
    substanceUse:        'Substance use',
    daysPerWeek:         'Days logged per week',
    weightTrend:         'Weight trend',
    questionnaireScores: 'Questionnaire scores',
    latestCompleted:     'Latest completed',
  },
  no: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Alle',
    noDataInRange:       'Ingen registreringer i dette tidsrommet',
    moodOverTime:        'Humør over tid',
    cravingsOverTime:    'Sug over tid',
    wellbeingOverTime:   'Velvære over tid',
    scaleOneToFive:      'Skala 1–5',
    substanceUse:        'Rusbruk',
    daysPerWeek:         'Dager logget per uke',
    weightTrend:         'Vektutvikling',
    questionnaireScores: 'Spørreskjemaskårer',
    latestCompleted:     'Siste gjennomført',
  },
  da: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Alle',
    noDataInRange:       'Ingen registreringer i dette tidsrum',
    moodOverTime:        'Humør over tid',
    cravingsOverTime:    'Trang over tid',
    wellbeingOverTime:   'Velvære over tid',
    scaleOneToFive:      'Skala 1–5',
    substanceUse:        'Stofbrug',
    daysPerWeek:         'Dage logget per uge',
    weightTrend:         'Vægtudvikling',
    questionnaireScores: 'Spørgeskemaresultater',
    latestCompleted:     'Senest udfyldt',
  },
  de: {
    days7:               '7T',
    days30:              '30T',
    days90:              '90T',
    allTime:             'Alle',
    noDataInRange:       'Keine Einträge in diesem Zeitraum',
    moodOverTime:        'Stimmung über Zeit',
    cravingsOverTime:    'Verlangen über Zeit',
    wellbeingOverTime:   'Wohlbefinden über Zeit',
    scaleOneToFive:      'Skala 1–5',
    substanceUse:        'Substanzkonsum',
    daysPerWeek:         'Protokollierte Tage pro Woche',
    weightTrend:         'Gewichtsentwicklung',
    questionnaireScores: 'Fragebogen-Ergebnisse',
    latestCompleted:     'Zuletzt ausgefüllt',
  },
  sv: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Alla',
    noDataInRange:       'Inga poster i detta tidsintervall',
    moodOverTime:        'Humör över tid',
    cravingsOverTime:    'Sug över tid',
    wellbeingOverTime:   'Välmående över tid',
    scaleOneToFive:      'Skala 1–5',
    substanceUse:        'Substansbruk',
    daysPerWeek:         'Loggade dagar per vecka',
    weightTrend:         'Viktutveckling',
    questionnaireScores: 'Formulärresultat',
    latestCompleted:     'Senast ifyllt',
  },
  fi: {
    days7:               '7pv',
    days30:              '30pv',
    days90:              '90pv',
    allTime:             'Kaikki',
    noDataInRange:       'Ei kirjauksia tällä aikavälillä',
    moodOverTime:        'Mieliala ajan myötä',
    cravingsOverTime:    'Himo ajan myötä',
    wellbeingOverTime:   'Hyvinvointi ajan myötä',
    scaleOneToFive:      'Asteikko 1–5',
    substanceUse:        'Aineiden käyttö',
    daysPerWeek:         'Kirjattuja päiviä viikossa',
    weightTrend:         'Painon kehitys',
    questionnaireScores: 'Kyselytulokset',
    latestCompleted:     'Viimeksi täytetty',
  },
  fr: {
    days7:               '7j',
    days30:              '30j',
    days90:              '90j',
    allTime:             'Tout',
    noDataInRange:       'Aucune entrée dans cette période',
    moodOverTime:        'Humeur dans le temps',
    cravingsOverTime:    'Envies dans le temps',
    wellbeingOverTime:   'Bien-être dans le temps',
    scaleOneToFive:      'Échelle 1–5',
    substanceUse:        'Consommation de substances',
    daysPerWeek:         'Jours enregistrés par semaine',
    weightTrend:         'Évolution du poids',
    questionnaireScores: 'Résultats des questionnaires',
    latestCompleted:     'Dernier complété',
  },
  es: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Todo',
    noDataInRange:       'No hay entradas en este período',
    moodOverTime:        'Ánimo a lo largo del tiempo',
    cravingsOverTime:    'Antojos a lo largo del tiempo',
    wellbeingOverTime:   'Bienestar a lo largo del tiempo',
    scaleOneToFive:      'Escala 1–5',
    substanceUse:        'Uso de sustancias',
    daysPerWeek:         'Días registrados por semana',
    weightTrend:         'Tendencia de peso',
    questionnaireScores: 'Resultados de cuestionarios',
    latestCompleted:     'Último completado',
  },
  it: {
    days7:               '7g',
    days30:              '30g',
    days90:              '90g',
    allTime:             'Tutto',
    noDataInRange:       'Nessuna voce in questo intervallo',
    moodOverTime:        'Umore nel tempo',
    cravingsOverTime:    'Voglie nel tempo',
    wellbeingOverTime:   'Benessere nel tempo',
    scaleOneToFive:      'Scala 1–5',
    substanceUse:        'Uso di sostanze',
    daysPerWeek:         'Giorni registrati per settimana',
    weightTrend:         'Andamento del peso',
    questionnaireScores: 'Risultati questionari',
    latestCompleted:     'Ultimo completato',
  },
  nl: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Alles',
    noDataInRange:       'Geen invoer in dit tijdsbereik',
    moodOverTime:        'Stemming in de tijd',
    cravingsOverTime:    'Cravings in de tijd',
    wellbeingOverTime:   'Welzijn in de tijd',
    scaleOneToFive:      'Schaal 1–5',
    substanceUse:        'Middelengebruik',
    daysPerWeek:         'Gelogde dagen per week',
    weightTrend:         'Gewichtstrend',
    questionnaireScores: 'Vragenlijstresultaten',
    latestCompleted:     'Laatst ingevuld',
  },
  pl: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Wszystko',
    noDataInRange:       'Brak wpisów w tym przedziale czasu',
    moodOverTime:        'Nastrój w czasie',
    cravingsOverTime:    'Głód w czasie',
    wellbeingOverTime:   'Samopoczucie w czasie',
    scaleOneToFive:      'Skala 1–5',
    substanceUse:        'Używanie substancji',
    daysPerWeek:         'Zapisane dni w tygodniu',
    weightTrend:         'Trend wagi',
    questionnaireScores: 'Wyniki kwestionariuszy',
    latestCompleted:     'Ostatnio ukończone',
  },
  pt: {
    days7:               '7d',
    days30:              '30d',
    days90:              '90d',
    allTime:             'Tudo',
    noDataInRange:       'Sem entradas neste período',
    moodOverTime:        'Humor ao longo do tempo',
    cravingsOverTime:    'Fissuras ao longo do tempo',
    wellbeingOverTime:   'Bem-estar ao longo do tempo',
    scaleOneToFive:      'Escala 1–5',
    substanceUse:        'Uso de substâncias',
    daysPerWeek:         'Dias registrados por semana',
    weightTrend:         'Tendência de peso',
    questionnaireScores: 'Resultados dos questionários',
    latestCompleted:     'Último concluído',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeStr(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildLines(keys) {
  return Object.entries(keys)
    .map(([k, v]) => `  ${k}:${' '.repeat(Math.max(1, 22 - k.length))}'${escapeStr(v)}',`)
    .join('\n');
}

function patchLanguage(src, lang, keys) {
  const blockStart = src.indexOf(`\nconst ${lang} = {`);
  if (blockStart === -1) {
    console.warn(`  ⚠️  Could not find block for language "${lang}" — skipping.`);
    return src;
  }

  const nextBlock = src.indexOf('\nconst ', blockStart + 1);
  const blockEnd  = nextBlock === -1 ? src.length : nextBlock;
  const block     = src.slice(blockStart, blockEnd);

  const firstKey = Object.keys(keys)[0];
  if (block.includes(`  ${firstKey}:`)) {
    console.log(`  ✓  "${lang}" already has "${firstKey}" — skipping.`);
    return src;
  }

  // Insert before `  skip:` as anchor
  const anchorRel = block.indexOf('\n  skip:');
  if (anchorRel === -1) {
    console.warn(`  ⚠️  Could not find anchor "skip:" in "${lang}" block — skipping.`);
    return src;
  }

  const insertAt  = blockStart + anchorRel;
  const injection = '\n' + buildLines(keys);
  return src.slice(0, insertAt) + injection + src.slice(insertAt);
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!fs.existsSync(TARGET)) {
  console.error(`❌  File not found: ${TARGET}`);
  console.error('    Run this script from your project root.');
  process.exit(1);
}

const backup = TARGET + '.bak';
fs.copyFileSync(TARGET, backup);
console.log(`📦  Backup saved to ${path.basename(backup)}\n`);

let src = fs.readFileSync(TARGET, 'utf8');

for (const [lang, keys] of Object.entries(patches)) {
  console.log(`🌍  Patching "${lang}"…`);
  src = patchLanguage(src, lang, keys);
}

fs.writeFileSync(TARGET, src, 'utf8');
console.log(`\n✅  Done! ${TARGET} updated.`);
console.log(`    Restore with: cp ${path.basename(backup)} index.js`);
