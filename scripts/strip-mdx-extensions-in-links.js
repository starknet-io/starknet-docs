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

function processFile(p) {
  if (!p.endsWith('.mdx')) return;
  const original = fs.readFileSync(p, 'utf8');
  let updated = original;
  // Replace markdown links [text](path.mdx) -> [text](path)
  updated = updated.replace(/(\]\([^\)]+)\.mdx(\))/g, (m, pre, post) => pre + post);
  // Replace autolinks <path.mdx> -> <path>
  updated = updated.replace(/(<[^>\s]+)\.mdx(>)/g, (m, pre, post) => pre + post);
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Stripped .mdx in links: ${p}\n`);
  }
}

function main() {
  const rootDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(rootDir);
  for (const f of files) processFile(f);
  process.stdout.write('Done stripping .mdx extensions in links.\n');
}

main();


