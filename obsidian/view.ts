import { TextFileView } from 'obsidian';
import { KityMinderNoteModal } from './note-modal';

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
        const wrapper = this.contentEl.createDiv({ cls: 'kityminder-container' });
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'hidden';
        wrapper.style.position = 'relative';

        this.minderContainer = wrapper.createDiv({ cls: 'km-editor' });
        this.minderContainer.style.width = '100%';
        this.minderContainer.style.height = '100%';
    }

    renderEditor() {
        if (!window.kityminder || !window.kityminder.Editor || !this.minderContainer || this.isRendering) {
            return;
        }
        this.isRendering = true;

        this.minderContainer.empty();

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

        // 监听备注编辑请求（点击 note 图标）
        minder.on('editnoterequest', () => {
            this.openNoteModal();
        });

        // 监听节点点击：按 Ctrl 或 Cmd 点击资源区域/节点空白处也可以打开备注
        minder.on('mouseup', (e: any) => {
            const origin = e.originEvent || e;
            if (origin.ctrlKey || origin.metaKey) {
                this.openNoteModal();
            }
        });

        this.isRendering = false;
    }

    openNoteModal() {
        if (!this.editor || !this.editor.minder) return;
        const minder = this.editor.minder;
        const node = minder.getSelectedNode();
        if (!node) return;

        const note = node.getData('note') || '';
        let resources = [];
        try {
            resources = node.getData('resources') ? JSON.parse(node.getData('resources')) : [];
        } catch (e) {
            resources = [];
        }

        console.log('[KityMinder] openNoteModal node data:', { note, resources, rawData: node.getData() });

        const modal = new KityMinderNoteModal(this.app, { note, resources }, (meta) => {
            console.log('[KityMinder] modal save:', meta);
            node.setData('note', meta.note || null);
            node.setData('resources', meta.resources && meta.resources.length ? JSON.stringify(meta.resources) : null);
            node.render();
            node.getMinder().layout(300);
            this.saveFromMinder();
        });
        modal.open();
    }

    saveFromMinder() {
        if (!this.editor || !this.editor.minder) return;
        try {
            this.data = JSON.stringify(this.editor.minder.exportJson(), null, 2);
            this.requestSave();
            console.log('[KityMinder] saved data length:', this.data.length);
        } catch (e) {
            console.error('Failed to export mindmap', e);
        }
    }

    onClose() {
        this.clear();
    }
}
