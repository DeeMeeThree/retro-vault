#!/usr/bin/env node
/*
 * set-loan.js — mark a game as lent out in database_archive.csv.
 *
 * Writes ONLY the 13th CSV column ("Prêté à"). Everything before the last comma
 * on the target line is left byte-identical: the quoted Description column
 * contains commas and quotes, so rewriting the line via split(',')/join(',')
 * would corrupt it. Column 13 is the last column and never contains a comma,
 * so "everything after the last comma" is exactly the field we own.
 *
 * Usage:
 *   node set-loan.js --game "Heavenly Sword" --to "JD"
 *   node set-loan.js --game "Heavenly Sword" --to "Jean Dupont" --derive
 *   node set-loan.js --game "Heavenly Sword" --clear
 *   node set-loan.js --list
 *   add --dry-run to any of the above to preview without writing
 *
 * Exit codes: 0 ok, 1 error, 2 ambiguous / not found (candidates printed).
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(__dirname, '../../../../database_archive.csv');
const COL = 12; // 0-based index of the 13th column
const HEADER = 'Prêté à';

// --- arg parsing -----------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i !== -1 && i + 1 < argv.length ? argv[i + 1] : null;
};

const dryRun = flag('--dry-run');
const list = flag('--list');
const clear = flag('--clear');
const derive = flag('--derive');
const game = opt('--game');
const to = opt('--to');

// --- csv helpers (parseCSV mirrors script/software.js) ---------------------
function parseCSV(str) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let val = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { row.push(val); val = ''; }
    else if (c === '\n' && !inQuotes) {
      row.push(val.replace(/\r$/, ''));
      if (row.length) rows.push(row);
      row = [];
      val = '';
    } else val += c;
  }
  if (inQuotes) { row.push(val); if (row.length) rows.push(row); }
  else if (val || row.length) { row.push(val); rows.push(row); }
  return rows.filter(r => r.length);
}

/** Lowercase, strip diacritics and punctuation, collapse spaces. */
function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`\-_.:,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/** "Jean-Pierre Martin" -> "JPM"; "Jean Dupont" -> "JD"; "JD" -> "JD" */
function deriveInitials(fullName) {
  const tokens = (fullName || '')
    .replace(/['’`]/g, ' ')
    .split(/[\s\-_.]+/)
    .filter(Boolean);
  if (!tokens.length) throw new Error('cannot derive initials from an empty name');
  return tokens.map(t => [...t][0]).join('').toUpperCase().slice(0, 5);
}

// --- read + validate the csv ----------------------------------------------
const raw = fs.readFileSync(CSV_PATH, 'utf8');
const hasBOM = raw.charCodeAt(0) === 0xfeff;
const body = hasBOM ? raw.slice(1) : raw;
const eol = body.includes('\r\n') ? '\r\n' : '\n';
const lines = body.split(/\r\n|\n/);
const trailingEOL = lines[lines.length - 1] === '';
if (trailingEOL) lines.pop();

const unbalanced = lines.filter(l => (l.match(/"/g) || []).length % 2 !== 0);
if (unbalanced.length) {
  console.error(`ABORT: ${unbalanced.length} line(s) have unbalanced quotes. Refusing to touch the file.`);
  process.exit(1);
}

const rows = parseCSV(body);
if (rows.length !== lines.length) {
  console.error(`ABORT: ${rows.length} parsed records vs ${lines.length} physical lines — a field spans lines. Refusing to edit.`);
  process.exit(1);
}
if (rows[0][COL] !== HEADER) {
  console.error(`ABORT: column 13 is "${rows[0][COL]}", expected "${HEADER}". This CSV predates the loan column.`);
  process.exit(1);
}

// --- --list ----------------------------------------------------------------
if (list) {
  const loaned = rows.slice(1)
    .map((r, i) => ({ line: i + 2, title: r[0], console: (r[4] || '').trim(), to: (r[COL] || '').trim() }))
    .filter(x => x.to);
  if (!loaned.length) {
    console.log('No games currently marked as lent out.');
  } else {
    console.log(`${loaned.length} game(s) currently lent out:`);
    loaned.forEach(g => console.log(`  line ${String(g.line).padStart(3)}  ${g.console.padEnd(4)}  ${g.title}  ->  ${g.to}`));
  }
  process.exit(0);
}

// --- validate args ---------------------------------------------------------
if (!game) {
  console.error('ABORT: --game is required.');
  process.exit(1);
}

let value = '';
if (!clear) {
  if (!to) {
    console.error('ABORT: --to is required (use --clear to mark the game as returned).');
    process.exit(1);
  }
  value = (derive ? deriveInitials(to) : to).trim();
  if (!value) {
    console.error('ABORT: resolved loan value is empty.');
    process.exit(1);
  }
  if (value.includes(',') || value.includes('"') || /[\r\n]/.test(value)) {
    console.error(`ABORT: loan value "${value}" contains a comma, quote or newline — it cannot live in a single CSV field.`);
    process.exit(1);
  }
}

// --- locate the row --------------------------------------------------------
const needle = normalize(game);
const data = rows.slice(1).map((r, i) => ({ line: i + 2, idx: i + 1, title: r[0], row: r }));
const exact = data.filter(d => normalize(d.title) === needle);
let targets = exact;

if (!targets.length) {
  const scored = data
    .map(d => {
      const t = normalize(d.title);
      const score = t.includes(needle) || needle.includes(t) ? 0 : levenshtein(needle, t);
      return { ...d, score };
    })
    .sort((a, b) => a.score - b.score);
  const best = scored[0];
  if (best && best.score <= Math.max(3, Math.floor(needle.length / 3))) {
    console.error(`ABORT: no game titled exactly "${game}". Closest matches — re-run with the exact title:`);
    scored.slice(0, 8).forEach(d => console.error(`  line ${String(d.line).padStart(3)}  ${d.title}  (distance ${d.score})`));
    process.exit(2);
  }
  console.error(`ABORT: no game matches "${game}". Run \`node set-loan.js --list\` or check the title spelling.`);
  process.exit(2);
}

if (targets.length > 1) {
  console.error(`ABORT: "${game}" matches ${targets.length} rows. Disambiguate with the exact title:`);
  targets.forEach(d => console.error(`  line ${d.line}  ${d.title}  [${(d.row[4] || '').trim()}]`));
  process.exit(2);
}

const target = targets[0];
const current = (target.row[COL] || '').trim();
const next = value;

// --- rewrite only the tail of the physical line ---------------------------
const physLine = lines[target.idx];
const lastComma = physLine.lastIndexOf(',');
if (lastComma === -1) throw new Error(`line ${target.idx + 1} has no comma — refusing to edit`);
const rewritten = physLine.slice(0, lastComma + 1) + next;

console.log(`line ${target.line}  ${target.title}  [${(target.row[4] || '').trim()}]`);
console.log(`  "${current}" -> "${next}"`);
console.log(`  prefix preserved: ${rewritten.slice(0, lastComma + 1) === physLine.slice(0, lastComma + 1)}`);

if (dryRun) {
  console.log('  (dry run — nothing written)');
  process.exit(0);
}

const updated = lines.slice();
updated[target.idx] = rewritten;
fs.writeFileSync(CSV_PATH, (hasBOM ? '\uFEFF' : '') + updated.join(eol) + (trailingEOL ? eol : ''), 'utf8');

// --- post-write verification ----------------------------------------------
const after = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'));
const afterRow = after.find(r => r[0] === target.title);
const problems = [];
if (after.length !== rows.length) problems.push(`record count changed: ${rows.length} -> ${after.length}`);
if (afterRow.length !== 13) problems.push(`row now has ${afterRow.length} fields, expected 13`);
if ((afterRow[COL] || '') !== next) problems.push(`column 13 is "${afterRow[COL]}", expected "${next}"`);
for (let i = 0; i < 12; i++) {
  if (afterRow[i] !== target.row[i]) problems.push(`column ${i} was modified unexpectedly`);
}
const afterRaw = fs.readFileSync(CSV_PATH, 'utf8');
if ((afterRaw.match(/\r\n/g) || []).length !== (body.match(/\r\n/g) || []).length) problems.push('line endings changed');

if (problems.length) {
  console.error('POST-WRITE CHECK FAILED:');
  problems.forEach(p => console.error('  - ' + p));
  process.exit(1);
}
console.log('  verified: 13 fields, columns 1-12 untouched, line endings preserved');