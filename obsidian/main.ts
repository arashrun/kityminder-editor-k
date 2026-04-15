import { Plugin, TFile } from 'obsidian';
import { KityMinderView, VIEW_TYPE_KITYMINDER } from './view';
import { KITYMINDER_CORE_JS, KITYMINDER_CORE_CSS } from './assets';

export default class KityMinderPlugin extends Plugin {
    async onload() {
        await this.injectKityMinderCore();

        this.registerView(VIEW_TYPE_KITYMINDER, (leaf) => new KityMinderView(leaf));
        this.registerExtensions(['km'], VIEW_TYPE_KITYMINDER);

        // 新建脑图文件的命令
        this.addCommand({
            id: 'create-kityminder',
            name: 'Create new mind map',
            callback: async () => {
                const fileName = `MindMap-${Date.now()}.km`;
                const defaultData = JSON.stringify({ root: { data: { text: '中心主题' } } }, null, 2);
                const file = await this.app.vault.create(fileName, defaultData);
                await this.app.workspace.getLeaf().openFile(file);
            }
        });
    }

    async injectKityMinderCore() {
        if (window.kityminder && window.kityminder.Editor) return;

        // Inject CSS
        const styleId = 'kityminder-core-css';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = KITYMINDER_CORE_CSS;
            document.head.appendChild(style);
        }

        // Inject JS
        const scriptId = 'kityminder-core-js';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.textContent = KITYMINDER_CORE_JS;
            document.head.appendChild(script);
        }

        // 等待 kityminder 挂载到 window
        await new Promise<void>((resolve, reject) => {
            let attempts = 0;
            const timer = setInterval(() => {
                if (window.kityminder) {
                    clearInterval(timer);
                    resolve();
                }
                attempts++;
                if (attempts > 50) {
                    clearInterval(timer);
                    reject(new Error('kityminder-core failed to load'));
                }
            }, 50);
        });
    }

    onunload() {
        // 插件卸载时不移除全局注入的 CSS/JS，避免其他叶子还在使用
    }
}
