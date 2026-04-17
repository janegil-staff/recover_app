import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, 'src/translations/index.js');

const LANGS = ['en','no','de','da','sv','fi','fr','es','it','nl','pl','pt'];

let src = readFileSync(FILE, 'utf8');

for (const lang of LANGS) {
  const blockStart = src.indexOf(`const ${lang} = {`);
  if (blockStart === -1) { console.warn(`[${lang}] Block not found, skipping.`); continue; }

  // Check if already present
  const blockEnd = src.indexOf('\n};', blockStart);
  const block = src.slice(blockStart, blockEnd);
  if (/\bacid\b\s*:/.test(block)) { console.log(`[${lang}] acid already present, skipping.`); continue; }

  // Insert after ghb: line
  const ghbIdx = src.indexOf("ghb:", blockStart);
  if (ghbIdx === -1) { console.warn(`[${lang}] ghb: not found, skipping.`); continue; }

  const lineEnd = src.indexOf('\n', ghbIdx);
  const lineStart = src.lastIndexOf('\n', ghbIdx) + 1;
  const indent = src.slice(lineStart, ghbIdx).match(/^(\s*)/)[1];

  src = src.slice(0, lineEnd) + `\n${indent}acid:${'          '.slice(0, Math.max(1, 14 - 4))}'Acid',` + src.slice(lineEnd);
  console.log(`[${lang}] Inserted acid: 'Acid'`);
}

writeFileSync(FILE, src, 'utf8');
console.log('\nDone!');
