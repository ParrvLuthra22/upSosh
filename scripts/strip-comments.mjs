#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = [
  path.join(ROOT, 'frontend'),
  path.join(ROOT, 'backend'),
];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);

// Regexes
// Remove block comments: /* ... */ (non-greedy)
const BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//g;
// Remove JSX comments: {/* ... */}
const JSX_COMMENTS = /\{\/\*[\s\S]*?\*\/\}/g;
// Remove single-line comments not part of a URL protocol (avoid http://, https://)
// Negative lookbehind for : to avoid removing ://, also avoid data://, etc.
const SINGLE_LINE = /(?<!:)\/\/.*$/gm;

/**
 * Process file content by stripping comments.
 * CSS: only block comments.
 * TS/JS/TSX/JSX: block + jsx + single-line.
 */
function stripComments(content, ext) {
  let result = content;
  if (ext === '.css') {
    result = result.replace(BLOCK_COMMENTS, '');
  } else {
    result = result.replace(JSX_COMMENTS, '');
    result = result.replace(BLOCK_COMMENTS, '');
    result = result.replace(SINGLE_LINE, (m) => {
      // Keep shebangs (#! /usr/bin/env node)
      return m.trimStart().startsWith('//#!') ? m : '';
    });
  }

  // Collapse multiple blank lines introduced by removals
  result = result.replace(/\n{3,}/g, '\n\n');
  return result;
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.next')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        yield full;
      }
    }
  }
}

function run() {
  let filesProcessed = 0;
  let filesChanged = 0;
  for (const base of TARGET_DIRS) {
    if (!fs.existsSync(base)) continue;
    for (const file of walk(base)) {
      filesProcessed++;
      const ext = path.extname(file);
      const original = fs.readFileSync(file, 'utf8');
      const stripped = stripComments(original, ext);
      if (stripped !== original) {
        fs.writeFileSync(file, stripped, 'utf8');
        filesChanged++;
        console.log(`Cleaned: ${path.relative(ROOT, file)}`);
      }
    }
  }
  console.log(`\nDone. Processed ${filesProcessed} files. Updated ${filesChanged} files.`);
}

run();
