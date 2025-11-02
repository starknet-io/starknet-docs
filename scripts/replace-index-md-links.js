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

function fixFile(p) {
  if (!p.endsWith('.mdx')) return;
  const original = fs.readFileSync(p, 'utf8');
  const updated = original.replace(/\(([^\)]*\/index\.md)\)/g, (m, inner) => `(${inner.replace(/index\.md$/, 'index.mdx')})`);
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Fixed index.md links: ${p}\n`);
  }
}

function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(targetDir);
  for (const f of files) fixFile(f);
  process.stdout.write('Done fixing index.md links.\n');
}

main();



