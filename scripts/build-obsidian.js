const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const prefixer = require('postcss-prefix-selector');

const distDir = path.join(__dirname, '..', 'dist');
const obsidianDir = path.join(__dirname, '..', 'obsidian');

const editorPath = path.join(distDir, 'obsidian-editor.js');
const coreCssPath = path.join(distDir, 'kityminder-core.css');
const editorCssPath = path.join(distDir, 'kityminder-editor.css');

for (const p of [editorPath, coreCssPath, editorCssPath]) {
    if (!fs.existsSync(p)) {
        console.error(`${path.basename(p)} not found in dist/. Please run "npm run build" first.`);
        process.exit(1);
    }
}

const js = fs.readFileSync(editorPath, 'utf-8');
const coreCss = fs.readFileSync(coreCssPath, 'utf-8');
const editorCss = fs.readFileSync(editorCssPath, 'utf-8');

const rawCss = `${coreCss}\n${editorCss}`;

// Scope all CSS selectors to .kityminder-container so they don't leak into Obsidian UI
const scopedResult = postcss([
    prefixer({
        prefix: '.kityminder-container',
        exclude: ['.kityminder-container', '.kityminder-container *'],
    })
]).process(rawCss, { from: undefined });

// Remap html/body selectors to the container itself
let scopedCss = scopedResult.css;
scopedCss = scopedCss.replace(/\.kityminder-container\s+html\b/g, '.kityminder-container');
scopedCss = scopedCss.replace(/\.kityminder-container\s+body\b/g, '.kityminder-container');

const output = `export const KITYMINDER_CORE_JS = ${JSON.stringify(js)};
export const KITYMINDER_CORE_CSS = ${JSON.stringify(scopedCss)};
`;

fs.mkdirSync(obsidianDir, { recursive: true });
fs.writeFileSync(path.join(obsidianDir, 'assets.ts'), output);
console.log('obsidian/assets.ts generated successfully');
