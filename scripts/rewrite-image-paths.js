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

function absolutize(srcPath, fileDir, rootDir) {
  // only handle relative src (./ or ../ or bare filename). Skip absolute http(s) and starting with /
  if (/^(https?:)?\/\//i.test(srcPath)) return srcPath;
  const parentSeg = path.basename(path.dirname(rootDir)); // 'learn'
  const rootSeg = path.basename(rootDir); // 'New S-two book'
  const baseWeb = '/' + encodeURIComponent(parentSeg) + '/' + encodeURIComponent(rootSeg);
  if (srcPath.startsWith('/')) {
    // Site-root absolute: prefix with this section's base
    return baseWeb + srcPath;
  }
  const abs = path.resolve(fileDir, srcPath);
  const relToRoot = path.relative(rootDir, abs);
  const web = baseWeb + '/' + relToRoot.split(path.sep).map(encodeURIComponent).join('/');
  return web;
}

function rewriteFile(filePath, rootDir) {
  const original = fs.readFileSync(filePath, 'utf8');
  const fileDir = path.dirname(filePath);
  let updated = original;

  // Rewrite markdown image syntax ![alt](src)
  updated = updated.replace(/(!\[[^\]]*\]\()([^\)]+)(\))/g, (m, p1, p2, p3) => {
    const newSrc = absolutize(p2.trim(), fileDir, rootDir);
    return p1 + newSrc + p3;
  });

  // Rewrite HTML <img src="..."> for relative and site-root paths
  updated = updated.replace(/(<img\s+[^>]*src=\")(?!https?:)([^\"]+)(\")/gi, (m, p1, p2, p3) => {
    const newSrc = absolutize(p2.trim(), fileDir, rootDir);
    return p1 + newSrc + p3;
  });

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    process.stdout.write(`Rewrote images: ${filePath}\n`);
  }
}

function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(targetDir).filter((p) => p.endsWith('.mdx'));
  for (const f of files) rewriteFile(f, targetDir);
  process.stdout.write('Done rewriting image paths.\n');
}

main();


