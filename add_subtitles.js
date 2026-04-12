// Run: node add_subtitles.js path/to/src/translations/index.js
// Adds missing subtitle keys to all non-English languages

import { readFileSync, writeFileSync } from 'fs';

const SUBTITLES = {
  de: {
    substancesSubtitle:  'Wähle alle heute verwendeten Substanzen',
    frequencySubtitle:   'Wie oft hast du heute konsumiert?',
    amountSubtitle:      '0 = keine   10 = sehr hoch',
    cravingsSubtitle:    '0 = kein Verlangen   5 = überwältigend',
    moodSubtitle:        '1 = sehr schlecht   5 = sehr gut',
    sideEffectsSubtitle: 'Irgendwelche Nebenwirkungen heute?',
    weightSubtitle:      'Optional — Gewicht heute eintragen',
  },
  da: {
    substancesSubtitle:  'Vælg alle stoffer brugt i dag',
    frequencySubtitle:   'Hvor ofte brugte du i dag?',
    amountSubtitle:      '0 = ingen   10 = meget høj',
    cravingsSubtitle:    '0 = ingen trang   5 = overvældende',
    moodSubtitle:        '1 = meget dårlig   5 = meget god',
    sideEffectsSubtitle: 'Nogen bivirkninger i dag?',
    weightSubtitle:      'Valgfrit — log din vægt i dag',
  },
  sv: {
    substancesSubtitle:  'Välj alla substanser du använt idag',
    frequencySubtitle:   'Hur ofta använde du idag?',
    amountSubtitle:      '0 = inget   10 = väldigt högt',
    cravingsSubtitle:    '0 = inga sug   5 = överväldigande',
    moodSubtitle:        '1 = väldigt dålig   5 = väldigt bra',
    sideEffectsSubtitle: 'Några biverkningar idag?',
    weightSubtitle:      'Valfritt — logga din vikt idag',
  },
  fi: {
    substancesSubtitle:  'Valitse kaikki tänään käyttämäsi aineet',
    frequencySubtitle:   'Kuinka usein käytit tänään?',
    amountSubtitle:      '0 = ei mitään   10 = erittäin korkea',
    cravingsSubtitle:    '0 = ei himoa   5 = ylivoimainen',
    moodSubtitle:        '1 = erittäin huono   5 = erittäin hyvä',
    sideEffectsSubtitle: 'Mitään sivuvaikutuksia tänään?',
    weightSubtitle:      'Valinnainen — kirjaa painosi tänään',
  },
  fr: {
    substancesSubtitle:  "Sélectionnez toutes les substances utilisées aujourd'hui",
    frequencySubtitle:   "À quelle fréquence avez-vous consommé aujourd'hui ?",
    amountSubtitle:      '0 = aucun   10 = très élevé',
    cravingsSubtitle:    '0 = pas de manque   5 = accablant',
    moodSubtitle:        '1 = très mauvais   5 = très bon',
    sideEffectsSubtitle: "Des effets secondaires aujourd'hui ?",
    weightSubtitle:      "Facultatif — enregistrez votre poids aujourd'hui",
  },
  es: {
    substancesSubtitle:  'Selecciona todas las sustancias usadas hoy',
    frequencySubtitle:   '¿Con qué frecuencia consumiste hoy?',
    amountSubtitle:      '0 = nada   10 = muy alto',
    cravingsSubtitle:    '0 = sin antojos   5 = abrumador',
    moodSubtitle:        '1 = muy malo   5 = muy bueno',
    sideEffectsSubtitle: '¿Algún efecto secundario hoy?',
    weightSubtitle:      'Opcional — registra tu peso hoy',
  },
  it: {
    substancesSubtitle:  'Seleziona tutte le sostanze usate oggi',
    frequencySubtitle:   'Con quale frequenza hai consumato oggi?',
    amountSubtitle:      '0 = nessuna   10 = molto alta',
    cravingsSubtitle:    '0 = nessuna voglia   5 = travolgente',
    moodSubtitle:        '1 = molto cattivo   5 = molto buono',
    sideEffectsSubtitle: 'Effetti collaterali oggi?',
    weightSubtitle:      'Facoltativo — registra il tuo peso oggi',
  },
  nl: {
    substancesSubtitle:  'Selecteer alle vandaag gebruikte stoffen',
    frequencySubtitle:   'Hoe vaak heb je vandaag gebruikt?',
    amountSubtitle:      '0 = niets   10 = zeer hoog',
    cravingsSubtitle:    '0 = geen cravings   5 = overweldigend',
    moodSubtitle:        '1 = zeer slecht   5 = zeer goed',
    sideEffectsSubtitle: 'Bijwerkingen vandaag?',
    weightSubtitle:      'Optioneel — log je gewicht vandaag',
  },
  pl: {
    substancesSubtitle:  'Wybierz wszystkie substancje użyte dzisiaj',
    frequencySubtitle:   'Jak często używałeś dzisiaj?',
    amountSubtitle:      '0 = brak   10 = bardzo wysoki',
    cravingsSubtitle:    '0 = brak głodu   5 = przytłaczający',
    moodSubtitle:        '1 = bardzo zły   5 = bardzo dobry',
    sideEffectsSubtitle: 'Jakieś skutki uboczne dzisiaj?',
    weightSubtitle:      'Opcjonalnie — zapisz swoją wagę dzisiaj',
  },
  pt: {
    substancesSubtitle:  'Selecione todas as substâncias usadas hoje',
    frequencySubtitle:   'Com que frequência consumiu hoje?',
    amountSubtitle:      '0 = nenhum   10 = muito alto',
    cravingsSubtitle:    '0 = sem fissura   5 = avassalador',
    moodSubtitle:        '1 = muito mau   5 = muito bom',
    sideEffectsSubtitle: 'Algum efeito colateral hoje?',
    weightSubtitle:      'Opcional — registe o seu peso hoje',
  },
};

const path = process.argv[2];
if (!path) { console.error('Usage: node add_subtitles.js <path>'); process.exit(1); }

let src = readFileSync(path, 'utf8');

for (const [lang, keys] of Object.entries(SUBTITLES)) {
  for (const [key, val] of Object.entries(keys)) {
    // Only add if key is missing in this language block
    const langStart = src.indexOf(`const ${lang} = {`);
    const langEnd   = src.indexOf('\nconst ', langStart + 1);
    const block     = src.slice(langStart, langEnd);
    if (block.includes(`  ${key}:`)) continue;

    // Insert after the first key in the block (after the opening {)
    const insertAfter = `const ${lang} = {\n`;
    const insertIdx   = src.indexOf(insertAfter) + insertAfter.length;
    src = src.slice(0, insertIdx) + `  ${key}: '${val}',\n` + src.slice(insertIdx);
    console.log(`Added ${lang}.${key}`);
  }
}

writeFileSync(path, src);
console.log('Done');
