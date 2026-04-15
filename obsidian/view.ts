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
    private minder: any;
    private isRendering: boolean = false;

    getViewData(): string {
        return this.data;
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data || JSON.stringify({ root: { data: { text: '中心主题' } } }, null, 2);
        if (clear) {
            this.clear();
        }
        this.renderMinder();
    }

    clear(): void {
        if (this.minder) {
            this.minderContainer.empty();
            this.minder = null;
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
    }

    renderMinder() {
        if (!window.kityminder || !this.minderContainer || this.isRendering) {
            return;
        }
        this.isRendering = true;

        this.minderContainer.empty();

        const Minder = window.kityminder.Minder;
        this.minder = new Minder({
            renderTo: this.minderContainer,
            theme: 'fresh'
        });

        try {
            const json = JSON.parse(this.data);
            this.minder.importJson(json);
        } catch (e) {
            console.error('Invalid mindmap data', e);
            this.minder.importJson({ root: { data: { text: '无效的数据' } } });
        }

        // 监听内容变化，同步到 this.data 以触发 Obsidian 保存
        this.minder.on('contentchange', () => {
            try {
                this.data = JSON.stringify(this.minder.exportJson(), null, 2);
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
