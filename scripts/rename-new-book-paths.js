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

function replaceInFile(p, replacements) {
  const original = fs.readFileSync(p, 'utf8');
  let updated = original;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
  }
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Updated: ${p}\n`);
  }
}

function main() {
  const root = process.argv[2] || process.cwd();
  const replacements = [
    ['learn/S-two-book/', 'learn/S-two-book/'],
    ['/learn/S-two-book/', '/learn/S-two-book/'],
    ['`learn/S-two-book/stwo-examples/`', '`learn/S-two-book/stwo-examples/`'],
  ];

  // Update docs.json
  const docsJson = path.join(root, 'docs.json');
  if (fs.existsSync(docsJson)) replaceInFile(docsJson, replacements);

  // Update all md/mdx and scripts
  const targets = [root];
  for (const base of targets) {
    const files = walk(base).filter((p) => /\.(md|mdx|js|ts|json)$/.test(p));
    for (const f of files) replaceInFile(f, replacements);
  }

  process.stdout.write('Done updating New S-two book paths.\n');
}

main();


