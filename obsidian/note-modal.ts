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
    private dropdownMode: 'file' | 'header' = 'file';
    private headerItems: { text: string; subpath: string; level: number }[] = [];
    private headerSourceFile: TFile | null = null;
    private activeFileMatches: TFile[] = [];

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

    private async getMarkdownHeaders(file: TFile): Promise<{ text: string; subpath: string; level: number }[]> {
        const cache = this.app.metadataCache.getFileCache(file);
        const headings = cache?.headings ?? [];
        return headings
            .map((h) => ({
                text: h.heading,
                subpath: `#${h.heading}`,
                level: h.level,
            }))
            .filter((h) => h.text.trim().length > 0);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        // contentEl.createEl('h2', { text: '节点备注与资源' });

        const createSectionTitle = (text: string) => {
            const title = contentEl.createEl('div', { text });
            title.style.margin = '14px 0 8px';
            title.style.fontSize = '12px';
            title.style.fontWeight = '600';
            title.style.letterSpacing = '0.08em';
            title.style.textTransform = 'uppercase';
            title.style.color = 'var(--text-muted)';
            return title;
        };

        // =================== 关联资源 / Obsidian 笔记 ===================
        createSectionTitle('关联资源');
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

        const normalizeWikiInput = (val: string) => {
            return val
                .replace(/【/g, '[')
                .replace(/】/g, ']')
                .replace(/\[\[/g, '[[')
                .replace(/\]\]/g, ']]');
        };

        const getHeaderQuery = (query: string) => {
            if (!query.includes('#')) {
                return '';
            }
            return query.split('#').slice(1).join('#').trim();
        };

        const updateSelection = () => {
            this.dropdownItems.forEach((item, idx) => {
                item.style.background = idx === this.selectedIndex ? 'var(--background-modifier-hover)' : '';
            });
            if (this.selectedIndex >= 0 && this.dropdownItems[this.selectedIndex]) {
                this.dropdownItems[this.selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        };

        const resetDropdownState = () => {
            this.selectedIndex = -1;
            this.dropdownItems = [];
            this.dropdownFileMap.clear();
            this.dropdownMode = 'file';
            this.headerItems = [];
            this.headerSourceFile = null;
            this.activeFileMatches = [];
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
            resetDropdownState();
            this.doSave();
        };

        const selectHeaderByIndex = (index: number) => {
            if (this.dropdownMode !== 'header') return;
            const file = this.headerSourceFile;
            const h = this.headerItems[index];
            if (!file || !h) return;

            const name = `${file.basename}#${h.text}`;
            const path = `${file.path}#${h.text}`;
            this.resources.push({ name, path });
            renderResources();
            input.value = '';
            dropdown.style.display = 'none';
            resetDropdownState();
            this.doSave();
        };

        const showHeaderDropdown = (file: TFile, headers: { text: string; subpath: string; level: number }[], headerQuery: string) => {
            const normalizedQuery = headerQuery.toLowerCase();
            const filteredHeaders = normalizedQuery
                ? headers.filter((h) => h.text.toLowerCase().includes(normalizedQuery))
                : headers;

            dropdown.empty();
            this.dropdownMode = 'header';
            this.headerSourceFile = file;
            this.dropdownItems = [];
            this.headerItems = filteredHeaders;

            if (filteredHeaders.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            filteredHeaders.slice(0, 100).forEach((h, i) => {
                const item = dropdown.createDiv();
                item.style.padding = '6px 10px';
                item.style.cursor = 'pointer';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.gap = '12px';

                const titleEl = item.createDiv({ text: h.text });
                titleEl.style.flex = '1';
                titleEl.style.paddingLeft = `${Math.max(0, h.level - 1) * 12}px`;

                const levelEl = item.createDiv({ text: `H${h.level}` });
                levelEl.style.opacity = '0.7';
                levelEl.style.flexShrink = '0';

                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = i;
                    updateSelection();
                });
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    selectHeaderByIndex(i);
                });
                this.dropdownItems.push(item);
            });

            this.selectedIndex = 0;
            updateSelection();
            dropdown.style.display = 'block';
        };

        const showFileDropdown = (query: string) => {
            dropdown.empty();
            resetDropdownState();

            const fileQuery = query.split('#')[0].trim();
            const matches = allFiles.filter((f) => f.path.toLowerCase().includes(fileQuery.toLowerCase()));
            this.activeFileMatches = matches;
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

        const showHeaderDropdownForFile = async (file: TFile, headerQuery: string) => {
            if (!file) return;
            if (file.extension !== 'md') return;

            const headers = await this.getMarkdownHeaders(file);
            if (headers.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            showHeaderDropdown(file, headers, headerQuery);
        };

        const refreshDropdown = async () => {
            const normalizedValue = normalizeWikiInput(input.value);
            if (normalizedValue !== input.value) {
                const cursor = normalizedValue.length;
                input.value = normalizedValue;
                input.setSelectionRange(cursor, cursor);
            }

            const val = input.value;
            if (val.includes('[[')) {
                const query = getQuery(val);
                if (query.includes('#')) {
                    const fileQuery = query.split('#')[0].trim();
                    const headerQuery = getHeaderQuery(query);
                    const file = allFiles.find((f) => f.path.toLowerCase() === fileQuery.toLowerCase())
                        || allFiles.find((f) => f.basename.toLowerCase() === fileQuery.toLowerCase())
                        || this.activeFileMatches[0];

                    if (file) {
                        await showHeaderDropdownForFile(file, headerQuery);
                    } else {
                        dropdown.style.display = 'none';
                        resetDropdownState();
                    }
                } else if (query || val.endsWith('[[')) {
                    showFileDropdown(query);
                } else {
                    dropdown.style.display = 'none';
                    resetDropdownState();
                }
            } else if (val.trim()) {
                showFileDropdown(val.trim());
            } else {
                dropdown.style.display = 'none';
                resetDropdownState();
            }
        };

        input.addEventListener('input', () => {
            void refreshDropdown();
        });

        input.addEventListener('keydown', async (e) => {
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
            } else if (e.key === '#') {
                if (dropdown.style.display !== 'none' && this.dropdownMode === 'file' && this.selectedIndex >= 0) {
                    const file = this.dropdownFileMap.get(this.selectedIndex);
                    if (file) {
                        const query = getQuery(input.value);
                        const headerQuery = getHeaderQuery(`${query}#`);
                        setTimeout(() => {
                            void showHeaderDropdownForFile(file, headerQuery);
                        }, 0);
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.selectedIndex >= 0 && dropdown.style.display !== 'none') {
                    if (this.dropdownMode === 'file') {
                        selectFileByIndex(this.selectedIndex);
                    } else {
                        selectHeaderByIndex(this.selectedIndex);
                    }
                }
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
                resetDropdownState();
            }
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
                resetDropdownState();
            }, 150);
        });

        // =================== Markdown 备注（上下单列布局） ===================
        createSectionTitle('简单备注');

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
