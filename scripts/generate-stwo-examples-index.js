'use strict';

const fs = require('fs');
const path = require('path');

function listExampleFiles(examplesDir) {
  const entries = fs.readdirSync(examplesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.rs'))
    .map((e) => path.join(examplesDir, e.name))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function buildIndexContent(rootDir) {
  const header = `---\n` +
    `title: "Stwo Examples"\n` +
    `---\n\n` +
    `# Stwo Examples\n\n` +
    `This page embeds the local example sources used throughout the AIR Development section.\n\n` +
    `- Repo location: \`learn/S-two-book/stwo-examples/\`\n` +
    `- Rust examples are under \`examples/\`\n\n` +
    `Below is an index of all example files:\n\n`;

  const examplesDir = path.join(rootDir, 'examples');
  const files = listExampleFiles(examplesDir);
  const toc = files.map((f) => `- [${path.basename(f)}](#${path.basename(f).replace(/\./g, '')})`).join('\n') + '\n\n';

  let body = '';
  for (const file of files) {
    const name = path.basename(file);
    const anchor = name.replace(/\./g, '');
    const code = readUtf8(file);
    body += `## ${name}\n\n`;
    body += `<a id="${anchor}"></a>\n\n`;
    body += `<details>\n`;
    body += `<summary>View ${name}</summary>\n\n`;
    body += '```rust\n' + code.replace(/```/g, '``\`') + '\n```\n\n';
    body += `</details>\n\n`;
  }

  return header + toc + body;
}

function main() {
  const root = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book', 'stwo-examples');
  const outPath = path.join(root, 'index.mdx');
  const content = buildIndexContent(root);
  fs.writeFileSync(outPath, content, 'utf8');
  process.stdout.write(`Wrote ${outPath}\n`);
}

main();
