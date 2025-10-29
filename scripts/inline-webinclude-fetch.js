'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

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

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

const WEBINCLUDE_RE = /\{\{#webinclude\s+([^\s]+)\s+(\d+):(\d+)\}\}/g;

async function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(WEBINCLUDE_RE)];
  if (matches.length === 0) return false;

  // Fetch each unique URL once
  const cache = new Map();
  for (const m of matches) {
    const url = m[1];
    if (!cache.has(url)) {
      try {
        const text = await fetchText(url);
        cache.set(url, text);
      } catch (e) {
        cache.set(url, `// Failed to fetch ${url}: ${e.message}\n`);
      }
    }
  }

  // Build replacements
  const replacements = [];
  for (const m of matches) {
    const full = m[0];
    const url = m[1];
    const start = parseInt(m[2], 10);
    const end = parseInt(m[3], 10);
    const text = cache.get(url) || '';
    const lines = text.split(/\r?\n/);
    // Lines are 1-based inclusive
    const slice = lines.slice(start - 1, end).join('\n');
    const fenced = '```rust\n' + slice.replace(/```/g, '``\`') + '\n```';
    replacements.push({ full, replacement: fenced });
  }

  // Apply replacements
  for (const { full, replacement } of replacements) {
    content = content.split(full).join(replacement);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  process.stdout.write(`Inlined webinclude: ${filePath}\n`);
  return true;
}

async function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book', 'how-it-works');
  const files = walk(root).filter((p) => p.endsWith('.mdx'));
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    await processFile(f);
  }
  process.stdout.write('Done inlining webincludes.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


