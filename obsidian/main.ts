import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { KityMinderView, VIEW_TYPE_KITYMINDER } from './view';
import { KITYMINDER_CORE_JS, KITYMINDER_CORE_CSS } from './assets';

export interface KityMinderSettings {
    defaultPath: string;
}

export const DEFAULT_SETTINGS: KityMinderSettings = {
    defaultPath: '',
};

class KityMinderSettingTab extends PluginSettingTab {
    plugin: KityMinderPlugin;

    constructor(app: App, plugin: KityMinderPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'KityMinder Editor K 设置' });

        new Setting(containerEl)
            .setName('默认脑图存放路径')
            .setDesc('新建脑图文件时默认存放的文件夹路径（相对于 Vault 根目录，留空则存放到根目录）')
            .addText((text) =>
                text
                    .setPlaceholder('例如: MindMaps')
                    .setValue(this.plugin.settings.defaultPath)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultPath = value.trim();
                        await this.plugin.saveSettings();
                    })
            );
    }
}

export default class KityMinderPlugin extends Plugin {
    settings: KityMinderSettings;

    async onload() {
        await this.loadSettings();
        await this.injectKityMinderCore();

        this.registerView(VIEW_TYPE_KITYMINDER, (leaf) => new KityMinderView(leaf));
        this.registerExtensions(['km'], VIEW_TYPE_KITYMINDER);

        // 左侧 Ribbon 图标：新建脑图
        this.addRibbonIcon('git-branch', '新建 KityMinder 脑图', async () => {
            await this.createNewMindMap();
        });

        // 设置页
        this.addSettingTab(new KityMinderSettingTab(this.app, this));

        // 新建脑图文件的命令
        this.addCommand({
            id: 'create-kityminder',
            name: 'Create new mind map',
            callback: async () => {
                await this.createNewMindMap();
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async createNewMindMap() {
        const folderPath = this.settings.defaultPath || '';
        if (folderPath) {
            const folder = this.app.vault.getAbstractFileByPath(folderPath);
            if (!folder) {
                try {
                    await this.app.vault.createFolder(folderPath);
                } catch (e) {
                    console.error('[KityMinder] Failed to create folder', e);
                }
            }
        }
        const fileName = `MindMap-${Date.now()}.km`;
        const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
        const defaultData = JSON.stringify({ root: { data: { text: '中心主题' } } }, null, 2);
        const file = await this.app.vault.create(fullPath, defaultData);
        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.openFile(file);
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
