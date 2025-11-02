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

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function replaceFigures(content) {
  // Replace <figure> blocks containing <img> and optional <figcaption> with Markdown image + italic caption
  return content.replace(/<figure[\s\S]*?<\/figure>/gi, (block) => {
    const imgMatch = block.match(/<img[^>]*src=\"([^\"]+)\"[^>]*>/i);
    if (!imgMatch) return block;
    const src = imgMatch[1];
    const captionMatch = block.match(/<figcaption[\s\S]*?<\/figcaption>/i);
    let caption = '';
    if (captionMatch) {
      caption = stripHtml(captionMatch[0]);
    }
    const md = `![](${src})` + (caption ? `\n\n*${caption}*` : '');
    return md;
  });
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = replaceFigures(original);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    process.stdout.write(`Converted figures: ${filePath}\n`);
  }
}

function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const files = walk(targetDir).filter((p) => p.endsWith('.mdx'));
  for (const f of files) processFile(f);
  process.stdout.write('Done converting figures.\n');
}

main();



