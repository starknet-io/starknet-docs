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

function replaceInFile(p, find, replace) {
  const original = fs.readFileSync(p, 'utf8');
  const updated = original.split(find).join(replace);
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Updated paths: ${p}\n`);
  }
}

function main() {
  const root = process.argv[2] || process.cwd();
  // Update docs.json
  const docsJson = path.join(root, 'docs.json');
  if (fs.existsSync(docsJson)) {
    // No-op now that old-s-two has been removed; keep script inert
  }
  // Update links in all MD/MDX files under learn and root
  const targets = [path.join(root, 'learn'), root];
  for (const dir of targets) {
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir).filter((p) => /\.(md|mdx)$/.test(p));
    for (const f of files) {
      // No-op: legacy rename disabled
    }
  }
  process.stdout.write('Done updating s-two paths to old-s-two.\n');
}

main();


