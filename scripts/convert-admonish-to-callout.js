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

function mapType(t) {
  const key = (t || '').toLowerCase();
  switch (key) {
    case 'warning':
    case 'caution':
    case 'important':
      return 'warning';
    case 'tip':
    case 'success':
      return 'success';
    case 'danger':
    case 'error':
      return 'danger';
    case 'info':
    case 'note':
    case 'question':
    default:
      return 'info';
  }
}

function convertAdmonish(content) {
  // Replace fenced blocks like ```admonish [type]\n...\n```
  const re = /```admonish(?:\s+(\w+))?\n([\s\S]*?)\n```/g;
  return content.replace(re, (m, type, body) => {
    const mapped = mapType(type);
    // Trim one leading/trailing blank line
    const trimmed = body.replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, '');
    return `<Callout type="${mapped}">\n${trimmed}\n</Callout>`;
  });
}

function processFile(p) {
  const original = fs.readFileSync(p, 'utf8');
  const updated = convertAdmonish(original);
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Converted admonish: ${p}\n`);
  }
}

function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(targetDir).filter((f) => f.endsWith('.mdx'));
  for (const f of files) processFile(f);
  process.stdout.write('Done converting admonish blocks.\n');
}

main();



