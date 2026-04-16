import { App, Modal, Setting, TFile, MarkdownRenderer, Component } from 'obsidian';

export interface NodeResource {
    name: string;
    path: string;
}

export interface NodeMeta {
    note: string;
    resources: NodeResource[];
}

export class KityMinderNoteModal extends Modal {
    private noteText: string;
    private resources: NodeResource[];
    private onSave: (meta: NodeMeta) => void;
    private previewEl: HTMLElement;
    private component: Component;
    private selectedIndex: number = -1;
    private dropdownItems: HTMLElement[] = [];
    private dropdownFileMap: Map<number, TFile> = new Map();

    constructor(app: App, meta: NodeMeta, onSave: (meta: NodeMeta) => void) {
        super(app);
        this.noteText = meta.note || '';
        this.resources = meta.resources ? [...meta.resources] : [];
        this.onSave = onSave;
        this.component = new Component();
    }

    private doSave() {
        this.onSave({ note: this.noteText, resources: [...this.resources] });
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: '节点备注与资源' });

        // =================== 关联资源 / Obsidian 笔记 ===================
        contentEl.createEl('h3', { text: '关联资源 / Obsidian 笔记' });
        const resourceList = contentEl.createDiv({ cls: 'kityminder-resource-list' });
        resourceList.style.marginBottom = '12px';

        const renderResources = () => {
            resourceList.empty();
            if (this.resources.length === 0) {
                resourceList.createEl('div', { text: '暂无关联资源', cls: 'setting-item-description' });
                return;
            }
            this.resources.forEach((res, index) => {
                const row = resourceList.createDiv({ cls: 'kityminder-resource-row' });
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.gap = '8px';
                row.style.marginBottom = '6px';

                const link = row.createEl('a', { text: res.name, href: '#' });
                link.style.flex = '1';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();

                    const [filePath, subpath] = res.path.split('#');
                    const file = this.app.vault.getAbstractFileByPath(filePath);
                    if (file instanceof TFile) {
                        const existingLeaf = this.app.workspace.getLeavesOfType('markdown').find((leaf) => leaf.view.file?.path === filePath);
                        if (existingLeaf) {
                            this.app.workspace.setActiveLeaf(existingLeaf, { focus: true });
                            // 如果带有子标题锚点，尝试滚动到对应位置（Obsidian 自动处理 eState）
                            if (subpath && (existingLeaf.view as any).setEphemeralState) {
                                (existingLeaf.view as any).setEphemeralState({ subpath });
                            }
                        } else {
                            const leaf = this.app.workspace.getLeaf('tab');
                            leaf.openFile(file, { eState: subpath ? { subpath } : undefined });
                        }
                    }
                });

                const delBtn = row.createEl('button', { text: '删除' });
                delBtn.addEventListener('click', () => {
                    this.resources.splice(index, 1);
                    renderResources();
                    this.doSave();
                });
            });
        };

        renderResources();

        // 自动补全资源输入
        const autoCompleteContainer = contentEl.createDiv();
        autoCompleteContainer.style.position = 'relative';
        autoCompleteContainer.style.marginBottom = '12px';

        const input = autoCompleteContainer.createEl('input', {
            type: 'text',
            placeholder: '输入 [[ 开始搜索 Obsidian 笔记，支持 [[文件名#标题]]',
        });
        input.style.width = '100%';

        const dropdown = autoCompleteContainer.createDiv();
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.right = '0';
        dropdown.style.maxHeight = '200px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.background = 'var(--background-primary)';
        dropdown.style.border = '1px solid var(--background-modifier-border)';
        dropdown.style.borderRadius = '4px';
        dropdown.style.zIndex = '1000';

        const allFiles = this.app.vault.getFiles().sort((a, b) => a.path.localeCompare(b.path));

        const getQuery = (val: string) => {
            const idx = val.lastIndexOf('[[');
            if (idx !== -1) {
                return val.slice(idx + 2);
            }
            return val.trim();
        };

        const updateSelection = () => {
            this.dropdownItems.forEach((item, idx) => {
                item.style.background = idx === this.selectedIndex ? 'var(--background-modifier-hover)' : '';
            });
            if (this.selectedIndex >= 0 && this.dropdownItems[this.selectedIndex]) {
                this.dropdownItems[this.selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        };

        const selectFileByIndex = (index: number) => {
            const file = this.dropdownFileMap.get(index);
            if (!file) return;
            const rawQuery = getQuery(input.value);
            const hashPart = rawQuery.includes('#') ? rawQuery.split('#').slice(1).join('#') : '';
            const name = hashPart ? `${file.basename}#${hashPart}` : file.basename;
            const path = hashPart ? `${file.path}#${hashPart}` : file.path;
            this.resources.push({ name, path });
            renderResources();
            input.value = '';
            dropdown.style.display = 'none';
            this.selectedIndex = -1;
            this.dropdownItems = [];
            this.dropdownFileMap.clear();
            this.doSave();
        };

        const showDropdown = (query: string) => {
            dropdown.empty();
            this.selectedIndex = -1;
            this.dropdownItems = [];
            this.dropdownFileMap.clear();

            const fileQuery = query.split('#')[0].trim();
            const matches = allFiles.filter((f) => f.path.toLowerCase().includes(fileQuery.toLowerCase()));
            if (matches.length === 0) {
                dropdown.style.display = 'none';
                return;
            }
            matches.slice(0, 50).forEach((file, i) => {
                const item = dropdown.createDiv({ text: file.path });
                item.style.padding = '6px 10px';
                item.style.cursor = 'pointer';
                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = i;
                    updateSelection();
                });
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    selectFileByIndex(i);
                });
                this.dropdownItems.push(item);
                this.dropdownFileMap.set(i, file);
            });
            dropdown.style.display = 'block';
        };

        input.addEventListener('input', () => {
            const val = input.value;
            if (val.includes('[[')) {
                const query = getQuery(val);
                if (query || val.endsWith('[[')) {
                    showDropdown(query);
                } else {
                    dropdown.style.display = 'none';
                }
            } else if (val.trim()) {
                showDropdown(val.trim());
            } else {
                dropdown.style.display = 'none';
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.dropdownItems.length && dropdown.style.display !== 'none') {
                    this.selectedIndex = (this.selectedIndex + 1) % this.dropdownItems.length;
                    updateSelection();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.dropdownItems.length && dropdown.style.display !== 'none') {
                    this.selectedIndex = (this.selectedIndex - 1 + this.dropdownItems.length) % this.dropdownItems.length;
                    updateSelection();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.selectedIndex >= 0 && dropdown.style.display !== 'none') {
                    selectFileByIndex(this.selectedIndex);
                } else if (input.value.trim()) {
                    const val = input.value.trim();
                    this.resources.push({ name: val, path: val });
                    renderResources();
                    input.value = '';
                    dropdown.style.display = 'none';
                    this.doSave();
                }
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
                this.selectedIndex = -1;
            }
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
                this.selectedIndex = -1;
            }, 150);
        });

        // =================== Markdown 备注（上下单列布局） ===================
        new Setting(contentEl)
            .setName('Markdown 备注')
            .setDesc('直接输入 Markdown，下方会实时预览');

        const textarea = contentEl.createEl('textarea', {
            cls: 'kityminder-note-textarea',
        });
        textarea.value = this.noteText;
        textarea.style.width = '100%';
        textarea.style.minHeight = '120px';
        textarea.style.fontFamily = 'monospace';
        textarea.style.marginBottom = '8px';

        this.previewEl = contentEl.createDiv({ cls: 'kityminder-note-preview' });
        this.previewEl.style.minHeight = '120px';
        this.previewEl.style.border = '1px solid var(--background-modifier-border)';
        this.previewEl.style.borderRadius = '4px';
        this.previewEl.style.padding = '8px';
        this.previewEl.style.overflow = 'auto';

        const updatePreview = async () => {
            this.previewEl.empty();
            await MarkdownRenderer.render(this.app, textarea.value, this.previewEl, '', this.component);
        };

        textarea.addEventListener('input', () => {
            this.noteText = textarea.value;
            updatePreview();
        });

        updatePreview();

        // =================== 底部按钮 ===================
        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('保存')
                    .setCta()
                    .onClick(() => {
                        this.doSave();
                        this.close();
                    })
            )
            .addButton((btn) =>
                btn.setButtonText('取消').onClick(() => {
                    this.close();
                })
            );
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.component.unload();
    }
}
