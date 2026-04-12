// Run: node fix_apostrophes.js path/to/src/translations/index.js
// Fixes single-quoted strings containing apostrophes in French (and other langs)

import { readFileSync, writeFileSync } from 'fs';

const path = process.argv[2];
if (!path) { console.error('Usage: node fix_apostrophes.js <path>'); process.exit(1); }

let src = readFileSync(path, 'utf8');

// Find all lines like:   key: 'value with it's an apostrophe',
// and replace the outer single quotes with double quotes
// Strategy: find lines where a single-quoted value contains an unescaped apostrophe

const lines = src.split('\n');
let fixed = 0;

const result = lines.map(line => {
  // Match:  someKey: 'some value',
  const m = line.match(/^(\s+\w+:\s+)'(.*)'(,?\s*)$/);
  if (!m) return line;
  const value = m[2];
  // Check if value contains unescaped single quote (apostrophe)
  if (!value.includes("'")) return line;
  // Replace outer quotes with double quotes, escaping any existing double quotes in value
  const escaped = value.replace(/"/g, '\\"');
  fixed++;
  return `${m[1]}"${escaped}"${m[3]}`;
});

src = result.join('\n');
writeFileSync(path, src);
console.log(`Fixed ${fixed} lines with apostrophes.`);
