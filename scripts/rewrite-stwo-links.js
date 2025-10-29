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

function rewriteLinksInFile(filePath, targetDir) {
  const original = fs.readFileSync(filePath, 'utf8');
  const absTarget = path.resolve(targetDir);
  const absExamples = path.join(absTarget, 'stwo-examples');
  const relBase = path.relative(path.dirname(filePath), absExamples).split(path.sep).join('/');

  let updated = original;
  // Replace GitHub links to local relative base
  updated = updated.replace(/https:\/\/github\.com\/zksecurity\/stwo-book\/(blob|tree)\/main\/stwo-examples/g, relBase);
  // Replace absolute site links (encoded or not) to local relative base
  updated = updated.replace(/\/learn\/New%20S-two%20book\/stwo-examples/g, relBase);
  updated = updated.replace(/\/learn\/New S-two book\/stwo-examples/g, relBase);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    process.stdout.write(`Rewrote links: ${filePath}\n`);
  }
}

function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(targetDir).filter((p) => p.endsWith('.mdx'));
  for (const f of files) rewriteLinksInFile(f, targetDir);
  process.stdout.write('Done rewriting stwo-examples links.\n');
}

main();


