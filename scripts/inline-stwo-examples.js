'use strict';

const fs = require('fs');
const path = require('path');

const INCLUDE_RE = /\{\{#include\s+([^}:\s]+)(?::([^}\s]+))?\}\}/g; // {{#include path[:anchor]}}

function readFileSyncUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractAnchor(content, anchor) {
  // Anchor markers: // ANCHOR: name  ... // ANCHOR_END: name
  const lines = content.split(/\r?\n/);
  const startIdx = lines.findIndex((l) => l.includes(`ANCHOR: ${anchor}`));
  if (startIdx !== -1) {
    const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(`ANCHOR_END: ${anchor}`));
    if (endIdx === -1) return null;
    return lines.slice(startIdx + 1, endIdx).join('\n');
  }
  // Graceful fallback: if a start marker doesn't exist but an end marker does, inline nothing.
  const endOnly = lines.findIndex((l) => l.includes(`ANCHOR_END: ${anchor}`));
  if (endOnly !== -1) return '';
  return null;
}

function resolveInclude(baseFileDir, includePathRaw, anchor, projectRoot) {
  // includePathRaw may include .. segments; resolve relative to the MDX file directory first
  const resolved = path.resolve(baseFileDir, includePathRaw);
  let content;
  try {
    content = readFileSyncUtf8(resolved);
  } catch (e) {
    // Try resolving relative to provided projectRoot (useful if includes were absolute to repo root)
    try {
      const alt = path.resolve(projectRoot, includePathRaw);
      content = readFileSyncUtf8(alt);
    } catch (e2) {
      // As a final fallback, if the include path targets stwo-examples, find nearest ancestor with that folder
      if (includePathRaw.includes('stwo-examples')) {
        const marker = 'stwo-examples/';
        const idx = includePathRaw.indexOf(marker);
        const tail = includePathRaw.slice(idx + marker.length); // path after "stwo-examples/"
        // climb up from the MDX file directory until we find a directory that contains 'stwo-examples'
        let dir = baseFileDir;
        let found = null;
        while (true) {
          if (fs.existsSync(path.join(dir, 'stwo-examples')) && fs.statSync(path.join(dir, 'stwo-examples')).isDirectory()) {
            found = path.join(dir, 'stwo-examples', tail);
            break;
          }
          const parent = path.dirname(dir);
          if (parent === dir) break;
          dir = parent;
        }
        if (!found) {
          throw new Error(`Could not resolve include path: ${includePathRaw} from ${baseFileDir}`);
        }
        content = readFileSyncUtf8(found);
      } else {
        throw e2;
      }
    }
  }
  if (anchor) {
    const sliced = extractAnchor(content, anchor);
    if (sliced == null) {
      throw new Error(`Anchor not found: ${anchor} in ${includePathRaw}`);
    }
    return sliced.trimEnd();
  }
  return content.trimEnd();
}

function processFile(filePath, projectRoot) {
  const original = readFileSyncUtf8(filePath);
  const dir = path.dirname(filePath);
  let replacedAny = false;
  const rewritten = original.replace(INCLUDE_RE, (match, includePath, anchor) => {
    const code = resolveInclude(dir, includePath, anchor, projectRoot);
    replacedAny = true;
    return code;
  });
  if (replacedAny) {
    fs.writeFileSync(filePath, rewritten, 'utf8');
    process.stdout.write(`Inlined includes: ${filePath}\n`);
  }
}

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

function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const projectRoot = process.argv[3] || process.cwd();
  const files = walk(targetDir).filter((p) => p.endsWith('.mdx'));
  for (const f of files) {
    processFile(f, projectRoot);
  }
  process.stdout.write('Done inlining includes.\n');
}

main();
