#!/usr/bin/env node
/**
 * Escape { and } inside <pre><code ...>...</code></pre> in corelib3 MDX files
 * using HTML entities (&#123; &#125;) so MDX/acorn do not parse them as JS.
 */
const fs = require('fs');
const path = require('path');

const corelib3Dir = path.join(__dirname, '..', 'build', 'corelib3');
const files = fs.readdirSync(corelib3Dir).filter((f) => f.endsWith('.mdx'));

const codeBlockRegex = /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g;

function escapeBracesInCodeBlocks(content) {
  return content.replace(codeBlockRegex, (_, attrs, code) => {
    const escaped = code.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
    return `<pre><code${attrs}>${escaped}</code></pre>`;
  });
}

let total = 0;
for (const file of files) {
  const filePath = path.join(corelib3Dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = escapeBracesInCodeBlocks(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    total++;
  }
}
console.log(`Updated ${total} files in build/corelib3`);
