'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Recursively walk a directory and return all file paths.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walkDirectory(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip typical folders that shouldn't be processed
      if (entry.name === 'node_modules' || entry.name === '.git') return [];
      return walkDirectory(fullPath);
    }
    return [fullPath];
  }));
  return files.flat();
}

/**
 * Extract the title from the first markdown heading, or fallback to filename.
 * @param {string} content
 * @param {string} filename
 */
function deriveTitle(content, filename) {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) return m[1].trim();
  }
  const base = path.basename(filename, path.extname(filename));
  const spaced = base.replace(/[-_]+/g, ' ');
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Add Mintlify YAML frontmatter if missing. Ensures at least a title.
 * @param {string} content
 * @param {string} title
 */
function ensureFrontmatter(content, title) {
  const hasFrontmatter = content.startsWith('---\n');
  if (hasFrontmatter) return content; // leave as-is
  const safeTitle = title.replace(/"/g, '\\"');
  const frontmatter = `---\n` +
    `title: "${safeTitle}"\n` +
    `---\n\n`;
  return frontmatter + content;
}

/**
 * Convert simple callout patterns to Mintlify <Callout> components.
 * Transforms paragraph blocks starting with Note:/Warning:/Tip:/Caution:/Important:
 * Skips replacements inside fenced code blocks.
 * @param {string} content
 */
function convertCallouts(content) {
  const typeMap = {
    'Note': 'info',
    'Warning': 'warning',
    'Tip': 'success',
    'Caution': 'warning',
    'Important': 'warning'
  };

  const lines = content.split(/\r?\n/);
  const out = [];
  let i = 0;
  let inFence = false;
  let fenceTick = '';

  while (i < lines.length) {
    const line = lines[i];

    // Track fenced code blocks: ``` or ~~~
    const fenceMatch = line.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceTick = fenceMatch[1];
      } else if (line.startsWith(fenceTick)) {
        inFence = false;
        fenceTick = '';
      }
      out.push(line);
      i += 1;
      continue;
    }

    if (!inFence) {
      const m = line.match(/^(Note|Warning|Tip|Caution|Important):\s*(.*)$/);
      if (m) {
        const label = m[1];
        const calloutType = typeMap[label] || 'info';
        const block = [line];
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== '') {
          block.push(lines[j]);
          j += 1;
        }
        out.push(`<Callout type="${calloutType}">`);
        out.push(...block);
        out.push(`</Callout>`);
        // Skip the block and the following blank line (if any)
        i = j;
        if (i < lines.length && lines[i].trim() === '') {
          out.push(lines[i]);
          i += 1;
        }
        continue;
      }
    }

    out.push(line);
    i += 1;
  }

  return out.join('\n');
}

async function convertFile(mdPath) {
  const original = await fs.promises.readFile(mdPath, 'utf8');
  const title = deriveTitle(original, mdPath);
  const withFrontmatter = ensureFrontmatter(original, title);
  const withCallouts = convertCallouts(withFrontmatter);

  const mdxPath = mdPath.replace(/\.md$/i, '.mdx');
  await fs.promises.writeFile(mdxPath, withCallouts, 'utf8');
  await fs.promises.unlink(mdPath);
  return { mdPath, mdxPath, title };
}

/**
 * Rewrite Markdown links that point to .md files into .mdx in non-code sections.
 * Examples: [text](path/file.md) -> [text](path/file.mdx)
 * Preserves URL fragments and queries.
 * @param {string} content
 */
function rewriteMdLinksToMdx(content) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let inFence = false;
  let fenceTick = '';

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    const fenceMatch = line.match(/^(```+|~~~+)/);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceTick = fenceMatch[1];
      } else if (line.startsWith(fenceTick)) {
        inFence = false;
        fenceTick = '';
      }
      out.push(line);
      continue;
    }
    if (!inFence) {
      // Replace occurrences of (something.md) possibly with anchors/queries
      line = line.replace(/\(([^)\s]+?)\.md(#[^)\s]*)?\)/g, (m, p1, frag) => {
        return `(${p1}.mdx${frag || ''})`;
      });
    }
    out.push(line);
  }
  return out.join('\n');
}

async function rewriteLinksInMdxFiles(targetDir) {
  const all = await walkDirectory(targetDir);
  const mdxFiles = all.filter((p) => p.toLowerCase().endsWith('.mdx'));
  for (const file of mdxFiles) {
    const content = await fs.promises.readFile(file, 'utf8');
    const rewritten = rewriteMdLinksToMdx(content);
    if (rewritten !== content) {
      await fs.promises.writeFile(file, rewritten, 'utf8');
      process.stdout.write(`Rewrote links: ${path.relative(targetDir, file)}\n`);
    }
  }
}

async function main() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'learn', 'New S-two book');
  const absoluteTarget = path.isAbsolute(targetDir) ? targetDir : path.resolve(targetDir);
  const allPaths = await walkDirectory(absoluteTarget);
  const mdFiles = allPaths.filter((p) => p.toLowerCase().endsWith('.md'));

  const results = [];
  for (const file of mdFiles) {
    const res = await convertFile(file);
    results.push(res);
    process.stdout.write(`Converted: ${path.relative(absoluteTarget, res.mdPath)} -> ${path.relative(absoluteTarget, res.mdxPath)}\n`);
  }

  await rewriteLinksInMdxFiles(absoluteTarget);

  process.stdout.write(`\nDone. Converted ${results.length} file(s) and updated links.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


