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

async function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex to match the placeholder blocks we inserted earlier:
  // ```rust,no_run,noplayground\n```rust\n// Source: URL#Lstart-Lend\n...```\n```
  const re = /```[\w,\-]*\n```rust\n\/\/ Source: ([^\n#]+)#L(\d+)-L(\d+)[\s\S]*?```\n```/g;

  const matches = [...content.matchAll(re)];
  if (matches.length === 0) return false;

  // Fetch each unique URL once
  const urlCache = new Map();
  for (const m of matches) {
    const url = m[1];
    if (!urlCache.has(url)) {
      try {
        const text = await fetchText(url);
        urlCache.set(url, text);
      } catch (e) {
        urlCache.set(url, null);
      }
    }
  }

  content = content.replace(re, (full, url, s, e) => {
    const start = parseInt(s, 10);
    const end = parseInt(e, 10);
    const text = urlCache.get(url);
    if (!text) return full; // keep placeholder if fetch failed
    const lines = text.split(/\r?\n/);
    const slice = lines.slice(start - 1, end).join('\n');
    changed = true;
    return '```rust\n' + slice.replace(/```/g, '``\`') + '\n```';
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    process.stdout.write(`Inlined placeholders: ${filePath}\n`);
  }
  return changed;
}

async function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book', 'how-it-works');
  const files = walk(root).filter((p) => p.endsWith('.mdx'));
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    await processFile(f);
  }
  process.stdout.write('Done inlining placeholders.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


