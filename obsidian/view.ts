import { TextFileView } from 'obsidian';

export const VIEW_TYPE_KITYMINDER = 'kityminder-view';

declare global {
    interface Window {
        kity: any;
        kityminder: any;
    }
}

export class KityMinderView extends TextFileView {
    private minderContainer: HTMLElement;
    private editor: any;
    private isRendering: boolean = false;

    getViewData(): string {
        return this.data;
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data || JSON.stringify({ root: { data: { text: '中心主题' } } }, null, 2);
        if (clear) {
            this.clear();
        }
        this.renderEditor();
    }

    clear(): void {
        if (this.editor) {
            this.minderContainer.empty();
            this.editor = null;
        }
    }

    getViewType(): string {
        return VIEW_TYPE_KITYMINDER;
    }

    async onOpen() {
        this.minderContainer = this.contentEl.createDiv({ cls: 'kityminder-container' });
        this.minderContainer.style.width = '100%';
        this.minderContainer.style.height = '100%';
        this.minderContainer.style.overflow = 'hidden';
        this.minderContainer.style.position = 'relative';
    }

    renderEditor() {
        if (!window.kityminder || !window.kityminder.Editor || !this.minderContainer || this.isRendering) {
            return;
        }
        this.isRendering = true;

        this.minderContainer.empty();

        // KMEditor 需要容器有明确的定位，否则内部绝对定位会失效
        this.minderContainer.style.position = 'relative';

        // 使用 KMEditor（含完整 runtime：键盘、热盒、输入、剪贴板、历史、拖拽等）
        this.editor = new window.kityminder.Editor(this.minderContainer);
        const minder = this.editor.minder;

        // 导入数据
        try {
            const json = JSON.parse(this.data);
            minder.importJson(json);
        } catch (e) {
            console.error('Invalid mindmap data', e);
            minder.importJson({ root: { data: { text: '无效的数据' } } });
        }

        // 内容变化时自动保存
        minder.on('contentchange', () => {
            try {
                this.data = JSON.stringify(minder.exportJson(), null, 2);
                this.requestSave();
            } catch (e) {
                console.error('Failed to export mindmap', e);
            }
        });

        this.isRendering = false;
    }

    onClose() {
        this.clear();
    }
}
