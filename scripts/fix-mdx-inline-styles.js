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

function parseCssToJsx(styleStr) {
  // Very small mapper for patterns we expect
  const map = {};
  const entries = styleStr.split(';').map((s) => s.trim()).filter(Boolean);
  for (const entry of entries) {
    const [kRaw, vRaw] = entry.split(':').map((s) => s.trim());
    if (!kRaw || !vRaw) continue;
    const key = kRaw.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    map[key] = vRaw;
  }
  const parts = Object.entries(map).map(([k, v]) => `${k}: '${v}'`);
  if (parts.length === 0) return null;
  return `{${parts.join(', ')}}`;
}

function fixFile(p) {
  if (!p.endsWith('.mdx')) return false;
  const original = fs.readFileSync(p, 'utf8');
  let updated = original;
  // Replace style="..." with style={{ ... }} for JSX in MDX
  updated = updated.replace(/style=\"([^\"]+)\"/g, (m, css) => {
    const jsx = parseCssToJsx(css);
    return jsx ? `style={{ ${jsx.slice(1, -1)} }}` : m;
  });
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Fixed inline styles: ${p}\n`);
    return true;
  }
  return false;
}

function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(root);
  for (const f of files) fixFile(f);
  process.stdout.write('Done fixing inline styles.\n');
}

main();


