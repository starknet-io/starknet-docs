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

function replaceLineOutsideCode(line, inFence) {
  if (inFence) return line; // don't touch code blocks
  // Replace visible branding "Stwo" -> "S-two"
  // Avoid touching URLs: do simple split around markdown links and autolinks
  // Split by () that likely contain URLs; apply replacement only outside parentheses following ](
  let result = '';
  let i = 0;
  while (i < line.length) {
    const linkStart = line.indexOf('](', i);
    const autoStart = line.indexOf('<http', i);
    let next = -1;
    let kind = '';
    if (linkStart !== -1 && (autoStart === -1 || linkStart < autoStart)) {
      next = linkStart;
      kind = 'md';
    } else if (autoStart !== -1) {
      next = autoStart;
      kind = 'auto';
    }
    if (next === -1) {
      result += line.slice(i).replace(/\bStwo\b/g, 'S-two');
      break;
    }
    result += line.slice(i, next).replace(/\bStwo\b/g, 'S-two');
    if (kind === 'md') {
      const close = line.indexOf(')', next + 2);
      if (close === -1) {
        result += line.slice(next); // malformed, just append
        break;
      }
      result += line.slice(next, close + 1); // keep URL segment intact
      i = close + 1;
    } else {
      const close = line.indexOf('>', next + 1);
      if (close === -1) {
        result += line.slice(next);
        break;
      }
      result += line.slice(next, close + 1);
      i = close + 1;
    }
  }
  return result;
}

function processFile(p) {
  if (!p.endsWith('.mdx')) return false;
  const original = fs.readFileSync(p, 'utf8');
  const lines = original.split(/\r?\n/);
  let inFence = false;
  const out = lines.map((l) => {
    const fence = l.match(/^```/);
    if (fence) {
      inFence = !inFence;
      return l; // keep fence lines as-is
    }
    return replaceLineOutsideCode(l, inFence);
  });
  const updated = out.join('\n');
  if (updated !== original) {
    fs.writeFileSync(p, updated, 'utf8');
    process.stdout.write(`Rebranded: ${p}\n`);
    return true;
  }
  return false;
}

function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'S-two-book');
  const files = walk(root);
  for (const f of files) processFile(f);
  process.stdout.write('Done replacing Stwo -> S-two.\n');
}

main();
