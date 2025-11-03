'use strict';

const fs = require('fs');
const path = require('path');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function makeLink(label, slug) {
  // Ensure leading slash
  const href = slug.startsWith('/') ? slug : '/' + slug;
  return `- [${label}](${href})`;
}

function toTitle(segment) {
  return segment
    .split('/').pop()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildList(pages) {
  const lines = [];
  for (const item of pages) {
    if (typeof item === 'string') {
      lines.push(makeLink(toTitle(item), item));
    } else if (item.group && item.pages) {
      lines.push(`\n### ${item.group}`);
      lines.push(...buildList(item.pages));
    }
  }
  return lines;
}

function main() {
  const root = process.argv[2] || process.cwd();
  const docsPath = path.join(root, 'docs.json');
  const docs = loadJson(docsPath);
  const tabs = docs.navigation.tabs;
  // Find S-two book group under Learn tab
  const learn = tabs.find((t) => t.tab === 'Learn');
  const group = learn.groups.find((g) => g.group === 'S-two book');
  if (!group) {
    console.error('S-two book group not found');
    process.exit(1);
  }
  const sections = group.pages;
  const lines = ['---', 'title: "Summary"', '---', '', '# Summary', ''];
  lines.push(...buildList(sections));
  const outPath = path.join(root, 'learn', 'S-two-book', 'SUMMARY.mdx');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log('Wrote', outPath);
}

main();


