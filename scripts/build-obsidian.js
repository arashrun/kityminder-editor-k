const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const obsidianDir = path.join(__dirname, '..', 'obsidian');

const corePath = path.join(distDir, 'kityminder-core.js');
const viewerPath = path.join(distDir, 'kityminder-viewer.js');
const cssPath = path.join(distDir, 'kityminder-core.css');

for (const p of [corePath, viewerPath, cssPath]) {
    if (!fs.existsSync(p)) {
        console.error(`${path.basename(p)} not found in dist/. Please run "npm run build" first.`);
        process.exit(1);
    }
}

const coreJs = fs.readFileSync(corePath, 'utf-8');
const viewerJs = fs.readFileSync(viewerPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');

// 合并 core chunk + viewer entry，确保 kityminder 被初始化并挂载到 window
const combinedJs = `${coreJs}\n${viewerJs}`;

const output = `export const KITYMINDER_CORE_JS = ${JSON.stringify(combinedJs)};
export const KITYMINDER_CORE_CSS = ${JSON.stringify(css)};
`;

fs.mkdirSync(obsidianDir, { recursive: true });
fs.writeFileSync(path.join(obsidianDir, 'assets.ts'), output);
console.log('obsidian/assets.ts generated successfully');
