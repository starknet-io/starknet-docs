'use strict';

const fs = require('fs');
const path = require('path');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fixFile(p) {
  if (!p.endsWith('.mdx')) return false;
  const original = fs.readFileSync(p, 'utf8');
  const lines = original.split(/\r?\n/);
  let i = 0;
  if (lines[i] !== '---') return false; // need frontmatter to compare
  i += 1;
  let title = '';
  while (i < lines.length && lines[i] !== '---') {
    const m = lines[i].match(/^title:\s*"?(.+?)"?\s*$/);
    if (m) title = m[1];
    i += 1;
  }
  if (i >= lines.length) return false; // malformed
  const fmEnd = i; // index of '---'
  // Find first non-empty, non-comment line after frontmatter
  let j = fmEnd + 1;
  while (j < lines.length && lines[j].trim() === '') j += 1;
  if (j >= lines.length) return false;
  const h1 = lines[j].match(/^#\s+(.+?)\s*$/);
  if (!h1) return false;
  const titleNorm = normalize(title);
  const h1Norm = normalize(h1[1]);
  if (!titleNorm || titleNorm !== h1Norm) return false;
  // Remove this H1 and following single blank line
  const newLines = lines.slice(0, j).concat(lines.slice(j + 1));
  if (newLines[j] && newLines[j].trim() === '') {
    newLines.splice(j, 1);
  }
  fs.writeFileSync(p, newLines.join('\n'), 'utf8');
  process.stdout.write(`Removed duplicate title: ${p}\n`);
  return true;
}

function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'S-two-book');
  const files = walk(root);
  for (const f of files) fixFile(f);
  process.stdout.write('Done fixing duplicate titles.\n');
}

main();
