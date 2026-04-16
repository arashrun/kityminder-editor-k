const fs = require('fs');
require('./build-obsidian.js');

const ts = fs.readFileSync('obsidian/assets.ts', 'utf-8');
const start = ts.indexOf('KITYMINDER_CORE_CSS = ');
const quoteStart = ts.indexOf('"', start);
const quoteEnd = ts.lastIndexOf('";\n');
const scoped = JSON.parse(ts.slice(quoteStart, quoteEnd + 1));

// Extract top-level selectors (before {)
const selectors = [];
let depth = 0;
let current = '';
for (const char of scoped) {
  if (char === '{') {
    if (depth === 0) {
      const sel = current.trim();
      if (sel) selectors.push(sel);
    }
    depth++;
    current = '';
  } else if (char === '}') {
    depth--;
    current = '';
  } else if (char === '\n' && depth === 0) {
    current = '';
  } else {
    current += char;
  }
}

const unscoped = selectors.filter(s => {
  if (s.startsWith('.kityminder-container')) return false;
  if (s.startsWith('@')) return false;
  return true;
});

console.log('Total selectors:', selectors.length);
console.log('Unscoped selectors:', unscoped.length);
unscoped.slice(0, 30).forEach(s => console.log(s));
