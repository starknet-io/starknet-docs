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

function toRelativeFromEncodedSitePath(encodedPath, fileDir, rootDir) {
  // encodedPath starts with /learn/S-two-book/
  const parts = encodedPath.split('/').filter(Boolean);
  if (parts.length < 3) return encodedPath; // not expected
  const rest = parts.slice(2); // after 'learn', 'New%20S-two%20book'
  const decoded = rest.map((seg) => decodeURIComponent(seg));
  const absTarget = path.join(rootDir, ...decoded);
  const rel = path.relative(fileDir, absTarget).split(path.sep).join('/');
  return (rel.startsWith('.') ? rel : './' + rel);
}

function rewriteFile(filePath, rootDir) {
  const original = fs.readFileSync(filePath, 'utf8');
  const fileDir = path.dirname(filePath);
  const basePrefix = '/learn/' + encodeURIComponent(path.basename(path.dirname(rootDir))) + '/' + encodeURIComponent(path.basename(rootDir));
  // But path.basename(path.dirname(rootDir)) is 'New S-two book' parent is 'New S-two book'?? Actually for rootDir = .../learn/New S-two book
  // We want '/learn/New%20S-two%20book'
  const base = '/learn/' + encodeURIComponent(path.basename(rootDir));

  let updated = original;

  // HTML img
  updated = updated.replace(/(<img\s+[^>]*src=\")(\/learn\/[^\"]+)(\")/gi, (m, p1, p2, p3) => {
    if (!p2.startsWith(base)) return m;
    const rel = toRelativeFromEncodedSitePath(p2, fileDir, rootDir);
    return p1 + rel + p3;
  });

  // Markdown images
  updated = updated.replace(/(!\[[^\]]*\]\()(\/learn\/[^\)]+)(\))/gi, (m, p1, p2, p3) => {
    if (!p2.startsWith(base)) return m;
    const rel = toRelativeFromEncodedSitePath(p2, fileDir, rootDir);
    return p1 + rel + p3;
  });

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    process.stdout.write(`Normalized images: ${filePath}\n`);
  }
}

function main() {
  const rootDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(rootDir).filter((p) => p.endsWith('.mdx'));
  for (const f of files) rewriteFile(f, rootDir);
  process.stdout.write('Done normalizing image paths.\n');
}

main();

