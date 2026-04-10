#!/usr/bin/env node
/**
 * swap_colors.js
 * Replaces all teal/green brand colors with FocusApp blue across src/
 *
 * Usage: node swap_colors.js
 */

const fs   = require('fs');
const path = require('path');

// Teal → Blue mapping (longest/most-specific first to avoid partial matches)
const REPLACEMENTS = [
  // backgrounds / surfaces
  ['#f7faf9', '#f0f4f8'],
  ['#f0f6f5', '#e8eef5'],
  ['#e6f4f1', '#dde8f4'],

  // text
  ['#1a2928', '#1a2c3d'],
  ['#4a6a68', '#3a5272'],
  ['#8aaba8', '#7a9ab8'],
  ['#7aaba8', '#7a9ab8'],

  // brand accent — dark first to avoid partial replacement
  ['#115c4f', '#2d4a6e'],
  ['#1a7f6e', '#4A7AB5'],
  ['#268E86', '#4A7AB5'],  // kolskalendar teal variant
  ['#2b8a8a', '#4A7AB5'],  // another teal variant
  ['#2a7d6f', '#4A7AB5'],

  // borders
  ['#dde8e6', '#ccdaec'],
  ['#c8d8d6', '#ccdaec'],

  // Tailwind arbitrary class variants (with brackets)
  ['[#f7faf9]', '[#f0f4f8]'],
  ['[#f0f6f5]', '[#e8eef5]'],
  ['[#e6f4f1]', '[#dde8f4]'],
  ['[#1a2928]', '[#1a2c3d]'],
  ['[#4a6a68]', '[#3a5272]'],
  ['[#8aaba8]', '[#7a9ab8]'],
  ['[#115c4f]', '[#2d4a6e]'],
  ['[#1a7f6e]', '[#4A7AB5]'],
  ['[#268E86]', '[#4A7AB5]'],
  ['[#2b8a8a]', '[#4A7AB5]'],
  ['[#2a7d6f]', '[#4A7AB5]'],
  ['[#dde8e6]', '[#ccdaec]'],
];

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json'];
const SKIP_DIRS  = ['node_modules', '.next', '.git', 'dist', 'build'];

let filesChanged = 0;
let replacementsTotal = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }
    if (!EXTENSIONS.includes(path.extname(entry.name))) continue;

    const filePath = path.join(dir, entry.name);
    let src = fs.readFileSync(filePath, 'utf8');
    let changed = 0;

    for (const [from, to] of REPLACEMENTS) {
      // Case-insensitive replacement for hex values
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const next  = src.replace(regex, to);
      if (next !== src) {
        changed += (src.match(regex) || []).length;
        src = next;
      }
    }

    if (changed > 0) {
      fs.writeFileSync(filePath, src, 'utf8');
      console.log(`  [${changed}] ${filePath.replace(process.cwd() + '/', '')}`);
      filesChanged++;
      replacementsTotal += changed;
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) {
  console.error('No src/ directory found. Run from project root.');
  process.exit(1);
}

console.log('Swapping teal → blue in src/...\n');
walk(srcDir);
console.log(`\nDone. ${replacementsTotal} replacement(s) in ${filesChanged} file(s).`);
