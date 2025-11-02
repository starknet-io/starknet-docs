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

function replaceWebinclude(content) {
  // Matches lines like: {{#webinclude URL start:end}}
  const re = /\{\{#webinclude\s+([^\s]+)\s+(\d+):(\d+)\}\}/g;
  return content.replace(re, (m, url, start, end) => {
    const human = `${url}#L${start}-L${end}`;
    return '```rust\n' + `// Source: ${human}\n// (External snippet not embedded)\n` + '```';
  });
}

function processFile(p) {
  if (!p.endsWith('.mdx')) return;
  const original = fs.readFileSync(p, 'utf8');
  const updated = replaceWebinclude(original);
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Replaced webinclude with placeholders: ${p}\n`);
  }
}

function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(root);
  for (const f of files) processFile(f);
  process.stdout.write('Done replacing webincludes.\n');
}

main();


