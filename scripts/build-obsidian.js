const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const obsidianDir = path.join(__dirname, '..', 'obsidian');

const editorPath = path.join(distDir, 'obsidian-editor.js');
const cssPath = path.join(distDir, 'kityminder-core.css');

for (const p of [editorPath, cssPath]) {
    if (!fs.existsSync(p)) {
        console.error(`${path.basename(p)} not found in dist/. Please run "npm run build" first.`);
        process.exit(1);
    }
}

const js = fs.readFileSync(editorPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');

const output = `export const KITYMINDER_CORE_JS = ${JSON.stringify(js)};
export const KITYMINDER_CORE_CSS = ${JSON.stringify(css)};
`;

fs.mkdirSync(obsidianDir, { recursive: true });
fs.writeFileSync(path.join(obsidianDir, 'assets.ts'), output);
console.log('obsidian/assets.ts generated successfully');
