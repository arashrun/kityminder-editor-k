"use strict";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// obsidian/main.ts
var main_exports = {};
__export(main_exports, {
  DEFAULT_SETTINGS: () => DEFAULT_SETTINGS,
  default: () => KityMinderPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// obsidian/view.ts
var import_obsidian2 = require("obsidian");

// obsidian/note-modal.ts
var import_obsidian = require("obsidian");
var KityMinderNoteModal = class extends import_obsidian.Modal {
  constructor(app, meta, onSave) {
    super(app);
    this.selectedIndex = -1;
    this.dropdownItems = [];
    this.dropdownFileMap = /* @__PURE__ */ new Map();
    this.dropdownMode = "file";
    this.headerItems = [];
    this.headerSourceFile = null;
    this.activeFileMatches = [];
    this.noteText = meta.note || "";
    this.resources = meta.resources ? [...meta.resources] : [];
    this.onSave = onSave;
    this.component = new import_obsidian.Component();
  }
  doSave() {
    this.onSave({ note: this.noteText, resources: [...this.resources] });
  }
  async getMarkdownHeaders(file) {
    var _a;
    const cache = this.app.metadataCache.getFileCache(file);
    const headings = (_a = cache == null ? void 0 : cache.headings) != null ? _a : [];
    return headings.map((h) => ({
      text: h.heading,
      subpath: `#${h.heading}`,
      level: h.level
    })).filter((h) => h.text.trim().length > 0);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const createSectionTitle = (text) => {
      const title = contentEl.createEl("div", { text });
      title.style.margin = "14px 0 8px";
      title.style.fontSize = "12px";
      title.style.fontWeight = "600";
      title.style.letterSpacing = "0.08em";
      title.style.textTransform = "uppercase";
      title.style.color = "var(--text-muted)";
      return title;
    };
    createSectionTitle("\u5173\u8054\u8D44\u6E90");
    const resourceList = contentEl.createDiv({ cls: "kityminder-resource-list" });
    resourceList.style.marginBottom = "12px";
    const renderResources = () => {
      resourceList.empty();
      if (this.resources.length === 0) {
        resourceList.createEl("div", { text: "\u6682\u65E0\u5173\u8054\u8D44\u6E90", cls: "setting-item-description" });
        return;
      }
      this.resources.forEach((res, index) => {
        const row = resourceList.createDiv({ cls: "kityminder-resource-row" });
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "8px";
        row.style.marginBottom = "6px";
        const link = row.createEl("a", { text: res.name, href: "#" });
        link.style.flex = "1";
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.close();
          const [filePath, subpath] = res.path.split("#");
          const file = this.app.vault.getAbstractFileByPath(filePath);
          if (file instanceof import_obsidian.TFile) {
            const existingLeaf = this.app.workspace.getLeavesOfType("markdown").find((leaf) => {
              var _a;
              return ((_a = leaf.view.file) == null ? void 0 : _a.path) === filePath;
            });
            if (existingLeaf) {
              this.app.workspace.setActiveLeaf(existingLeaf, { focus: true });
              if (subpath && existingLeaf.view.setEphemeralState) {
                existingLeaf.view.setEphemeralState({ subpath });
              }
            } else {
              const leaf = this.app.workspace.getLeaf("tab");
              leaf.openFile(file, { eState: subpath ? { subpath } : void 0 });
            }
          }
        });
        const delBtn = row.createEl("button", { text: "\u5220\u9664" });
        delBtn.addEventListener("click", () => {
          this.resources.splice(index, 1);
          renderResources();
          this.doSave();
        });
      });
    };
    renderResources();
    const autoCompleteContainer = contentEl.createDiv();
    autoCompleteContainer.style.position = "relative";
    autoCompleteContainer.style.marginBottom = "12px";
    const input = autoCompleteContainer.createEl("input", {
      type: "text",
      placeholder: "\u8F93\u5165 [[ \u5F00\u59CB\u641C\u7D22 Obsidian \u7B14\u8BB0\uFF0C\u652F\u6301 [[\u6587\u4EF6\u540D#\u6807\u9898]]"
    });
    input.style.width = "100%";
    const dropdown = autoCompleteContainer.createDiv();
    dropdown.style.display = "none";
    dropdown.style.position = "absolute";
    dropdown.style.top = "100%";
    dropdown.style.left = "0";
    dropdown.style.right = "0";
    dropdown.style.maxHeight = "200px";
    dropdown.style.overflowY = "auto";
    dropdown.style.background = "var(--background-primary)";
    dropdown.style.border = "1px solid var(--background-modifier-border)";
    dropdown.style.borderRadius = "4px";
    dropdown.style.zIndex = "1000";
    const allFiles = this.app.vault.getFiles().sort((a, b) => a.path.localeCompare(b.path));
    const getQuery = (val) => {
      const idx = val.lastIndexOf("[[");
      if (idx !== -1) {
        return val.slice(idx + 2);
      }
      return val.trim();
    };
    const normalizeWikiInput = (val) => {
      return val.replace(/【/g, "[").replace(/】/g, "]").replace(/\[\[/g, "[[").replace(/\]\]/g, "]]");
    };
    const getHeaderQuery = (query) => {
      if (!query.includes("#")) {
        return "";
      }
      return query.split("#").slice(1).join("#").trim();
    };
    const updateSelection = () => {
      this.dropdownItems.forEach((item, idx) => {
        item.style.background = idx === this.selectedIndex ? "var(--background-modifier-hover)" : "";
      });
      if (this.selectedIndex >= 0 && this.dropdownItems[this.selectedIndex]) {
        this.dropdownItems[this.selectedIndex].scrollIntoView({ block: "nearest" });
      }
    };
    const resetDropdownState = () => {
      this.selectedIndex = -1;
      this.dropdownItems = [];
      this.dropdownFileMap.clear();
      this.dropdownMode = "file";
      this.headerItems = [];
      this.headerSourceFile = null;
      this.activeFileMatches = [];
    };
    const selectFileByIndex = (index) => {
      const file = this.dropdownFileMap.get(index);
      if (!file) return;
      const rawQuery = getQuery(input.value);
      const hashPart = rawQuery.includes("#") ? rawQuery.split("#").slice(1).join("#") : "";
      const name = hashPart ? `${file.basename}#${hashPart}` : file.basename;
      const path = hashPart ? `${file.path}#${hashPart}` : file.path;
      this.resources.push({ name, path });
      renderResources();
      input.value = "";
      dropdown.style.display = "none";
      resetDropdownState();
      this.doSave();
    };
    const selectHeaderByIndex = (index) => {
      if (this.dropdownMode !== "header") return;
      const file = this.headerSourceFile;
      const h = this.headerItems[index];
      if (!file || !h) return;
      const name = `${file.basename}#${h.text}`;
      const path = `${file.path}#${h.text}`;
      this.resources.push({ name, path });
      renderResources();
      input.value = "";
      dropdown.style.display = "none";
      resetDropdownState();
      this.doSave();
    };
    const showHeaderDropdown = (file, headers, headerQuery) => {
      const normalizedQuery = headerQuery.toLowerCase();
      const filteredHeaders = normalizedQuery ? headers.filter((h) => h.text.toLowerCase().includes(normalizedQuery)) : headers;
      dropdown.empty();
      this.dropdownMode = "header";
      this.headerSourceFile = file;
      this.dropdownItems = [];
      this.headerItems = filteredHeaders;
      if (filteredHeaders.length === 0) {
        dropdown.style.display = "none";
        return;
      }
      filteredHeaders.slice(0, 100).forEach((h, i) => {
        const item = dropdown.createDiv();
        item.style.padding = "6px 10px";
        item.style.cursor = "pointer";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.gap = "12px";
        const titleEl = item.createDiv({ text: h.text });
        titleEl.style.flex = "1";
        titleEl.style.paddingLeft = `${Math.max(0, h.level - 1) * 12}px`;
        const levelEl = item.createDiv({ text: `H${h.level}` });
        levelEl.style.opacity = "0.7";
        levelEl.style.flexShrink = "0";
        item.addEventListener("mouseenter", () => {
          this.selectedIndex = i;
          updateSelection();
        });
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          selectHeaderByIndex(i);
        });
        this.dropdownItems.push(item);
      });
      this.selectedIndex = 0;
      updateSelection();
      dropdown.style.display = "block";
    };
    const showFileDropdown = (query) => {
      dropdown.empty();
      resetDropdownState();
      const fileQuery = query.split("#")[0].trim();
      const matches = allFiles.filter((f) => f.path.toLowerCase().includes(fileQuery.toLowerCase()));
      this.activeFileMatches = matches;
      if (matches.length === 0) {
        dropdown.style.display = "none";
        return;
      }
      matches.slice(0, 50).forEach((file, i) => {
        const item = dropdown.createDiv({ text: file.path });
        item.style.padding = "6px 10px";
        item.style.cursor = "pointer";
        item.addEventListener("mouseenter", () => {
          this.selectedIndex = i;
          updateSelection();
        });
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          selectFileByIndex(i);
        });
        this.dropdownItems.push(item);
        this.dropdownFileMap.set(i, file);
      });
      dropdown.style.display = "block";
    };
    const showHeaderDropdownForFile = async (file, headerQuery) => {
      if (!file) return;
      if (file.extension !== "md") return;
      const headers = await this.getMarkdownHeaders(file);
      if (headers.length === 0) {
        dropdown.style.display = "none";
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
      if (val.includes("[[")) {
        const query = getQuery(val);
        if (query.includes("#")) {
          const fileQuery = query.split("#")[0].trim();
          const headerQuery = getHeaderQuery(query);
          const file = allFiles.find((f) => f.path.toLowerCase() === fileQuery.toLowerCase()) || allFiles.find((f) => f.basename.toLowerCase() === fileQuery.toLowerCase()) || this.activeFileMatches[0];
          if (file) {
            await showHeaderDropdownForFile(file, headerQuery);
          } else {
            dropdown.style.display = "none";
            resetDropdownState();
          }
        } else if (query || val.endsWith("[[")) {
          showFileDropdown(query);
        } else {
          dropdown.style.display = "none";
          resetDropdownState();
        }
      } else if (val.trim()) {
        showFileDropdown(val.trim());
      } else {
        dropdown.style.display = "none";
        resetDropdownState();
      }
    };
    input.addEventListener("input", () => {
      void refreshDropdown();
    });
    input.addEventListener("keydown", async (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.dropdownItems.length && dropdown.style.display !== "none") {
          this.selectedIndex = (this.selectedIndex + 1) % this.dropdownItems.length;
          updateSelection();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.dropdownItems.length && dropdown.style.display !== "none") {
          this.selectedIndex = (this.selectedIndex - 1 + this.dropdownItems.length) % this.dropdownItems.length;
          updateSelection();
        }
      } else if (e.key === "#") {
        if (dropdown.style.display !== "none" && this.dropdownMode === "file" && this.selectedIndex >= 0) {
          const file = this.dropdownFileMap.get(this.selectedIndex);
          if (file) {
            const query = getQuery(input.value);
            const headerQuery = getHeaderQuery(`${query}#`);
            setTimeout(() => {
              void showHeaderDropdownForFile(file, headerQuery);
            }, 0);
          }
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (this.selectedIndex >= 0 && dropdown.style.display !== "none") {
          if (this.dropdownMode === "file") {
            selectFileByIndex(this.selectedIndex);
          } else {
            selectHeaderByIndex(this.selectedIndex);
          }
        }
      } else if (e.key === "Escape") {
        dropdown.style.display = "none";
        resetDropdownState();
      }
    });
    input.addEventListener("blur", () => {
      setTimeout(() => {
        dropdown.style.display = "none";
        resetDropdownState();
      }, 150);
    });
    createSectionTitle("\u7B80\u5355\u5907\u6CE8");
    const textarea = contentEl.createEl("textarea", {
      cls: "kityminder-note-textarea"
    });
    textarea.value = this.noteText;
    textarea.style.width = "100%";
    textarea.style.minHeight = "120px";
    textarea.style.fontFamily = "monospace";
    textarea.style.marginBottom = "8px";
    this.previewEl = contentEl.createDiv({ cls: "kityminder-note-preview" });
    this.previewEl.style.minHeight = "120px";
    this.previewEl.style.border = "1px solid var(--background-modifier-border)";
    this.previewEl.style.borderRadius = "4px";
    this.previewEl.style.padding = "8px";
    this.previewEl.style.overflow = "auto";
    const updatePreview = async () => {
      this.previewEl.empty();
      await import_obsidian.MarkdownRenderer.render(this.app, textarea.value, this.previewEl, "", this.component);
    };
    textarea.addEventListener("input", () => {
      this.noteText = textarea.value;
      updatePreview();
    });
    updatePreview();
    new import_obsidian.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("\u4FDD\u5B58").setCta().onClick(() => {
        this.doSave();
        this.close();
      })
    ).addButton(
      (btn) => btn.setButtonText("\u53D6\u6D88").onClick(() => {
        this.close();
      })
    );
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.component.unload();
  }
};

// obsidian/view.ts
var VIEW_TYPE_KITYMINDER = "kityminder-view";
var KityMinderView = class extends import_obsidian2.TextFileView {
  constructor() {
    super(...arguments);
    this.isRendering = false;
  }
  getViewData() {
    return this.data;
  }
  setViewData(data, clear) {
    this.data = data || JSON.stringify({ root: { data: { text: "\u4E2D\u5FC3\u4E3B\u9898" } } }, null, 2);
    if (clear) {
      this.clear();
    }
    this.renderEditor();
  }
  clear() {
    if (this.editor) {
      this.minderContainer.empty();
      this.editor = null;
    }
  }
  getViewType() {
    return VIEW_TYPE_KITYMINDER;
  }
  async onOpen() {
    const wrapper = this.contentEl.createDiv({ cls: "kityminder-container" });
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.overflow = "hidden";
    wrapper.style.position = "relative";
    this.minderContainer = wrapper.createDiv({ cls: "km-editor" });
    this.minderContainer.style.width = "100%";
    this.minderContainer.style.height = "100%";
  }
  renderEditor() {
    if (!window.kityminder || !window.kityminder.Editor || !this.minderContainer || this.isRendering) {
      return;
    }
    this.isRendering = true;
    this.minderContainer.empty();
    this.editor = new window.kityminder.Editor(this.minderContainer);
    const minder = this.editor.minder;
    try {
      const json = JSON.parse(this.data);
      minder.importJson(json);
    } catch (e) {
      console.error("Invalid mindmap data", e);
      minder.importJson({ root: { data: { text: "\u65E0\u6548\u7684\u6570\u636E" } } });
    }
    minder.on("contentchange", () => {
      try {
        this.data = JSON.stringify(minder.exportJson(), null, 2);
        this.requestSave();
      } catch (e) {
        console.error("Failed to export mindmap", e);
      }
    });
    minder.on("editnoterequest", () => {
      this.openNoteModal();
    });
    minder.on("mouseup", (e) => {
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
    const note = node.getData("note") || "";
    let resources = [];
    try {
      resources = node.getData("resources") ? JSON.parse(node.getData("resources")) : [];
    } catch (e) {
      resources = [];
    }
    console.log("[KityMinder] openNoteModal node data:", { note, resources, rawData: node.getData() });
    const modal = new KityMinderNoteModal(this.app, { note, resources }, (meta) => {
      console.log("[KityMinder] modal save:", meta);
      node.setData("note", meta.note || null);
      node.setData("resources", meta.resources && meta.resources.length ? JSON.stringify(meta.resources) : null);
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
      console.log("[KityMinder] saved data length:", this.data.length);
    } catch (e) {
      console.error("Failed to export mindmap", e);
    }
  }
  onClose() {
    this.clear();
  }
};

// obsidian/assets.ts
var KITYMINDER_CORE_JS = '(()=>{var __webpack_modules__={2116:()=>{!function(){var e={r:function(t){if(e[t].inited)return e[t].value;if("function"!=typeof e[t].value)return e[t].inited=!0,e[t].value;var n={exports:{}},r=e[t].value(null,n.exports,n);if(e[t].inited=!0,e[t].value=r,void 0!==r)return r;for(var i in n.exports)if(n.exports.hasOwnProperty(i))return e[t].inited=!0,e[t].value=n.exports,n.exports}};e[0]={value:function(t,n,r){r.exports=window.HotBox=e.r(1)}},e[1]={value:function(t,n,r){var i=e.r(2),o=e.r(3);function a(e){return document.createElement(e)}function s(e,t){e.classList.add(t)}function u(e,t){e.classList.remove(t)}function c(e,t){e.appendChild(t)}var l=d.STATE_IDLE="idle",h="div";function f(e,t){return"object"!=typeof t&&(t=[].slice.apply(arguments,1)),String(e).replace(/\\{(\\w+)\\}/g,(function(e,n){return t[n]||e}))}function d(e){if("string"==typeof e&&(e=document.querySelector(e)),!(e&&e instanceof HTMLElement))throw new Error("No container or not invalid container for hot box");var t=a(h);s(t,"hotbox"),c(e,t),this.$element=t,this.$container=e,this.isIME=!1,this.browser={sg:/se[\\s\\S]+metasr/.test(navigator.userAgent.toLowerCase())},this._parentFSM={},this.position={};var n,r={},u=null,f=l,d=[],g=this;function m(e,t){if(g.position=t,e==l)f!=l&&(d.shift().deactive(),d=[]),f=l;else if("back"==e)f!=l&&(f.deactive(),d.shift(),(f=d[0])?f.active():f="idle");else{f!=l&&f.deactive();var n=r[e];d.unshift(n),"function"==typeof g.position&&(t=g.position(t)),n.active(t),f=n}}this.control=function(e){if(!n)return(n=new(e=e||o)(g)).active(),t.onmousedown=function(e){e.stopPropagation(),e.preventDefault()},g;n.active()},this.state=function(e){if(!e)return f;if(e==l)throw new Error("Can not define or use the `idle` state.");return r[e]=r[e]||new p(this,e),"main"==e&&(u=r[e]),r[e]},this.active=m,this.dispatch=function(t){var n=t.type.toLowerCase();if(t.keyHash=i.hash(t),t.isKey=function(e){if(!e)return!1;for(var n=e.split(/\\s*\\|\\s*/);n.length;)if(t.keyHash==i.hash(n.shift()))return!0;return!1},t[n]=!0,!(t.keyup&&g.activeKey&&t.isKey(g.activeKey)&&f==l&&u)){var r=f==l?u:f;if(r){var o=r.handleKeyEvent(t);return"function"==typeof g.onkeyevent&&(t.handleResult=o,g.onkeyevent(t,o)),o}return null}m("main",{x:e.clientWidth/2,y:e.clientHeight/2})},this.setParentFSM=function(e){g._parentFSM=e},this.getParentFSM=function(){return g._parentFSM},this.activeKey="space",this.actionKey="space"}function p(e,t){var n="selected",r="pressed",i="active",o=a(h),d=a(h),p=a(h),g=a("div"),m=a(h),v=a(h);s(o,"state"),s(o,t),s(d,"center"),s(p,"ring"),s(g,"ring-shape"),s(m,"top"),s(v,"bottom"),c(e.$element,o),c(o,g),c(o,d),c(o,p),c(o,m),c(o,v),this.name=t;var y={center:null,ring:[],top:[],bottom:[],behind:[]},x=[],b=null,w=null,_=!1,k=!0;function C(){return!0}function S(e,t){return e(\'<span class="label">{label}</span><span class="key">{key}</span>\',{label:t.label,key:t.key&&t.key.split("|")[0]})}function T(e){w&&w.$button&&u(w.$button,r),(w=e)&&w.$button&&s(w.$button,r)}function A(e){b&&b.$button&&b.$button&&u(b.$button,n),(b=e)&&b.$button&&s(b.$button,n)}function E(t){t&&(t.enable&&!t.enable()||(t.action&&t.action(t),e.active(t.next||l,e.position)),T(null),A(null))}this.button=function(e){var t=function(e){var t=a(h);s(t,"button");var n=e.render||S;switch(t.innerHTML=n(f,e),e.position){case"center":c(d,t);break;case"ring":c(p,t);break;case"top":c(m,t);break;case"bottom":c(v,t)}return{action:e.action,enable:e.enable||C,beforeShow:e.beforeShow,key:e.key,next:e.next,label:e.label,data:e.data||null,$button:t}}(e);"center"==e.position?y.center=t:y[e.position]&&y[e.position].push(t),x.push(t),k=!0},this.active=function(t){var n,r;(t=t||{x:e.$container.clientWidth/2,y:e.$container.clientHeight/2})&&(o.style.left=t.x+"px",o.style.top=t.y+"px"),x.forEach((function(e){var t=e.$button;t&&t.classList[e.enable()?"add":"remove"]("enabled"),e.beforeShow&&e.beforeShow()})),s(o,i),k&&(function(e){var t,n,r,i,o=y.ring,a=2*Math.PI/o.length;y.center&&(y.center.indexedPosition=[0,0]),g.style.marginLeft=g.style.marginTop=-e+"px",g.style.width=g.style.height=e+e+"px";for(var s=0;s<o.length;s++)t=o[s].$button,n=a*s-Math.PI/2,r=e*Math.cos(n),i=e*Math.sin(n),o[s].indexedPosition=[r,i],t.style.left=r+"px",t.style.top=i+"px"}(r=15*y.ring.length),function(e){var t=-m.clientWidth/2,n=2*-e-m.clientHeight/2;m.style.marginLeft=t+"px",m.style.marginTop=n+"px",y.top.forEach((function(e){var r=e.$button;e.indexedPosition=[t+r.offsetLeft+r.clientWidth/2,n]}))}(r),function(e){var t=-v.clientWidth/2,n=2*e-v.clientHeight/2;v.style.marginLeft=t+"px",v.style.marginTop=n+"px",y.bottom.forEach((function(e){var r=e.$button;e.indexedPosition=[t+r.offsetLeft+r.clientWidth/2,n]}))}(r),(n=x.filter((function(e){return e.indexedPosition}))).forEach((function(e){var t,r,i,o,a,s,u={},c=0,l={},h=e.indexedPosition,f=Math.abs;n.forEach((function(n){if(e!=n)for(t=n.indexedPosition,a=[],r=t[0]-h[0],i=t[1]-h[1],o=Math.sqrt(r*r+i*i),f(r)>2&&(a.push(r>0?"right":"left"),a.push(o+f(i))),f(i)>2&&(a.push(i>0?"down":"up"),a.push(o+f(r)));a.length;)s=a.shift(),c=a.shift(),(!u[s]||c<l[s])&&(u[s]=n,l[s]=c)})),e.neighbor=u})),k=!1),b||A(y.center||y.ring[0]||y.top[0]||y.bottom[0]),_=!0},this.deactive=function(){u(o,i),A(null),_=!1},o.onmouseup=function(e){if(!e.button)for(var t=e.target;t&&t!=o;)t.classList.contains("button")&&x.forEach((function(e){e.$button==t&&E(e)})),t=t.parentNode},this.handleKeyEvent=function(n){var r=null;if(e.browser.sg&&n.isKey("esc"))return w?n.isKey(w.key)||T(null):e.active("back",e.position),"back";if(n.keydown||e.isIME&&n.keyup){if(x.forEach((function(i){if(i.enable()&&n.isKey(i.key)){if(_||e.hintDeactiveMainState){if(A(i),T(i),r="buttonpress",n.keyup)return E(i),r="execute"}else E(i),r="execute";n.preventDefault(),n.stopPropagation(),!_&&e.hintDeactiveMainState&&e.active(t,e.position)}})),_){if(n.isKey("esc"))return w?n.isKey(w.key)||T(null):e.active("back",e.position),"back";["up","down","left","right"].forEach((function(e){if(n.isKey(e))if(b){for(var t=b.neighbor[e];t&&!t.enable();)t=t.neighbor[e];t&&A(t),r="navigate"}else A(y.center||y.ring[0]||y.top[0]||y.bottom[0])})),n.isKey("space")&&n.keyup?(E(b),n.preventDefault(),n.stopPropagation(),r="execute"):n.isKey("space")&&b?(T(b),r="buttonpress"):w&&w!=b&&(T(null),r="selectcancel")}}else!n.keyup||!_&&e.hintDeactiveMainState||w&&(n.isKey("space")&&b==w||n.isKey(w.key))&&(E(w),n.preventDefault(),n.stopPropagation(),r="execute");return e.isIME=229==n.keyCode&&n.keydown,r}}r.exports=d}},e[2]={value:function(t,n,r){var i=e.r(4),o=4096,a=8192,s=16384;function u(e){return"string"==typeof e?(t=0,e.toLowerCase().split(/\\s*\\+\\s*/).forEach((function(e){switch(e){case"ctrl":case"cmd":t|=o;break;case"alt":t|=a;break;case"shift":t|=s;break;default:t|=i[e]}})),t):function(e){var t=0;(e.ctrlKey||e.metaKey)&&(t|=o);e.altKey&&(t|=a);e.shiftKey&&(t|=s);-1==[16,17,18,91].indexOf(e.keyCode)&&(t|=e.keyCode);return t}(e);var t}n.hash=u,n.is=function(e,t){return e&&t&&u(e)==u(t)}}},e[3]={value:function(t,n,r){e.r(2);var i="hotbox-focus";r.exports=function(e){var t,n=!0,r=!1,o=e.$container;function a(t){n&&e.dispatch(t)}function s(){t.select(),t.focus(),n=!0,o.classList.add(i)}function u(){t.blur(),n=!1,o.classList.remove(i)}(t=document.createElement("input")).classList.add("hotbox-key-receiver"),o.appendChild(t),r=!0,t.onkeyup=a,t.onkeypress=a,t.onkeydown=a,t.onfocus=s,t.onblur=u,r&&(t.oninput=function(e){t.value=null}),o.onmousedown=function(e){s(),e.preventDefault()},s(),this.handle=a,this.active=s,this.deactive=u}}},e[4]={value:function(e,t,n){var r={Shift:16,Control:17,Alt:18,CapsLock:20,BackSpace:8,Tab:9,Enter:13,Esc:27,Space:32,PageUp:33,PageDown:34,End:35,Home:36,Insert:45,Left:37,Up:38,Right:39,Down:40,Direction:{37:1,38:1,39:1,40:1},Delete:46,NumLock:144,Cmd:91,CmdFF:224,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,"`":192,"=":187,"-":189,"/":191,".":190};for(var i in r)r.hasOwnProperty(i)&&(r[i.toLowerCase()]=r[i]);var o="a".charCodeAt(0);"abcdefghijklmnopqrstuvwxyz".split("").forEach((function(e){r[e]=e.charCodeAt(0)-o+65}));var a=9;do{r[a.toString()]=a+48}while(a--);n.exports=r}};var t,n={expose:0};t="expose",e.r([n[t]])}()},4692:function(e,t){var n;!function(t,n){"use strict";"object"==typeof e.exports?e.exports=t.document?n(t,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return n(e)}:n(t)}("undefined"!=typeof window?window:this,(function(r,i){"use strict";var o=[],a=Object.getPrototypeOf,s=o.slice,u=o.flat?function(e){return o.flat.call(e)}:function(e){return o.concat.apply([],e)},c=o.push,l=o.indexOf,h={},f=h.toString,d=h.hasOwnProperty,p=d.toString,g=p.call(Object),m={},v=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType&&"function"!=typeof e.item},y=function(e){return null!=e&&e===e.window},x=r.document,b={type:!0,src:!0,nonce:!0,noModule:!0};function w(e,t,n){var r,i,o=(n=n||x).createElement("script");if(o.text=e,t)for(r in b)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function _(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?h[f.call(e)]||"object":typeof e}var k="3.7.1",C=/HTML$/i,S=function(e,t){return new S.fn.init(e,t)};function T(e){var t=!!e&&"length"in e&&e.length,n=_(e);return!v(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&t>0&&t-1 in e)}function A(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}S.fn=S.prototype={jquery:k,constructor:S,length:0,toArray:function(){return s.call(this)},get:function(e){return null==e?s.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=S.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return S.each(this,e)},map:function(e){return this.pushStack(S.map(this,(function(t,n){return e.call(t,n,t)})))},slice:function(){return this.pushStack(s.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(S.grep(this,(function(e,t){return(t+1)%2})))},odd:function(){return this.pushStack(S.grep(this,(function(e,t){return t%2})))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:c,sort:o.sort,splice:o.splice},S.extend=S.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,c=!1;for("boolean"==typeof a&&(c=a,a=arguments[s]||{},s++),"object"==typeof a||v(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(c&&r&&(S.isPlainObject(r)||(i=Array.isArray(r)))?(n=a[t],o=i&&!Array.isArray(n)?[]:i||S.isPlainObject(n)?n:{},i=!1,a[t]=S.extend(c,o,r)):void 0!==r&&(a[t]=r));return a},S.extend({expando:"jQuery"+(k+Math.random()).replace(/\\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==f.call(e))&&(!(t=a(e))||"function"==typeof(n=d.call(t,"constructor")&&t.constructor)&&p.call(n)===g)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){w(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,r=0;if(T(e))for(n=e.length;r<n&&!1!==t.call(e[r],r,e[r]);r++);else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},text:function(e){var t,n="",r=0,i=e.nodeType;if(!i)for(;t=e[r++];)n+=S.text(t);return 1===i||11===i?e.textContent:9===i?e.documentElement.textContent:3===i||4===i?e.nodeValue:n},makeArray:function(e,t){var n=t||[];return null!=e&&(T(Object(e))?S.merge(n,"string"==typeof e?[e]:e):c.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:l.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!C.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,a=!n;i<o;i++)!t(e[i],i)!==a&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,a=[];if(T(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&a.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&a.push(i);return u(a)},guid:1,support:m}),"function"==typeof Symbol&&(S.fn[Symbol.iterator]=o[Symbol.iterator]),S.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),(function(e,t){h["[object "+t+"]"]=t.toLowerCase()}));var E=o.pop,R=o.sort,N=o.splice,P="[\\\\x20\\\\t\\\\r\\\\n\\\\f]",M=new RegExp("^"+P+"+|((?:^|[^\\\\\\\\])(?:\\\\\\\\.)*)"+P+"+$","g");S.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||1!==n.nodeType||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var D=/([\\0-\\x1f\\x7f]|^-?\\d)|^-$|[^\\x80-\\uFFFF\\w-]/g;function L(e,t){return t?"\\0"===e?"\uFFFD":e.slice(0,-1)+"\\\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\\\"+e}S.escapeSelector=function(e){return(e+"").replace(D,L)};var O=x,I=c;!function(){var e,t,n,i,a,u,c,h,f,p,g=I,v=S.expando,y=0,x=0,b=ee(),w=ee(),_=ee(),k=ee(),C=function(e,t){return e===t&&(a=!0),0},T="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",D="(?:\\\\\\\\[\\\\da-fA-F]{1,6}"+P+"?|\\\\\\\\[^\\\\r\\\\n\\\\f]|[\\\\w-]|[^\\0-\\\\x7f])+",L="\\\\["+P+"*("+D+")(?:"+P+"*([*^$|!~]?=)"+P+"*(?:\'((?:\\\\\\\\.|[^\\\\\\\\\'])*)\'|\\"((?:\\\\\\\\.|[^\\\\\\\\\\"])*)\\"|("+D+"))|)"+P+"*\\\\]",B=":("+D+")(?:\\\\(((\'((?:\\\\\\\\.|[^\\\\\\\\\'])*)\'|\\"((?:\\\\\\\\.|[^\\\\\\\\\\"])*)\\")|((?:\\\\\\\\.|[^\\\\\\\\()[\\\\]]|"+L+")*)|.*)\\\\)|)",V=new RegExp(P+"+","g"),j=new RegExp("^"+P+"*,"+P+"*"),z=new RegExp("^"+P+"*([>+~]|"+P+")"+P+"*"),H=new RegExp(P+"|>"),F=new RegExp(B),q=new RegExp("^"+D+"$"),G={ID:new RegExp("^#("+D+")"),CLASS:new RegExp("^\\\\.("+D+")"),TAG:new RegExp("^("+D+"|[*])"),ATTR:new RegExp("^"+L),PSEUDO:new RegExp("^"+B),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\\\("+P+"*(even|odd|(([+-]|)(\\\\d*)n|)"+P+"*(?:([+-]|)"+P+"*(\\\\d+)|))"+P+"*\\\\)|)","i"),bool:new RegExp("^(?:"+T+")$","i"),needsContext:new RegExp("^"+P+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\\\("+P+"*((?:-\\\\d)?\\\\d*)"+P+"*\\\\)|)(?=[^-]|$)","i")},U=/^(?:input|select|textarea|button)$/i,$=/^h\\d$/i,W=/^(?:#([\\w-]+)|(\\w+)|\\.([\\w-]+))$/,Z=/[+~]/,X=new RegExp("\\\\\\\\[\\\\da-fA-F]{1,6}"+P+"?|\\\\\\\\([^\\\\r\\\\n\\\\f])","g"),Y=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},K=function(){ue()},J=fe((function(e){return!0===e.disabled&&A(e,"fieldset")}),{dir:"parentNode",next:"legend"});try{g.apply(o=s.call(O.childNodes),O.childNodes),o[O.childNodes.length].nodeType}catch(e){g={apply:function(e,t){I.apply(e,s.call(t))},call:function(e){I.apply(e,s.call(arguments,1))}}}function Q(e,t,n,r){var i,o,a,s,c,l,d,p=t&&t.ownerDocument,y=t?t.nodeType:9;if(n=n||[],"string"!=typeof e||!e||1!==y&&9!==y&&11!==y)return n;if(!r&&(ue(t),t=t||u,h)){if(11!==y&&(c=W.exec(e)))if(i=c[1]){if(9===y){if(!(a=t.getElementById(i)))return n;if(a.id===i)return g.call(n,a),n}else if(p&&(a=p.getElementById(i))&&Q.contains(t,a)&&a.id===i)return g.call(n,a),n}else{if(c[2])return g.apply(n,t.getElementsByTagName(e)),n;if((i=c[3])&&t.getElementsByClassName)return g.apply(n,t.getElementsByClassName(i)),n}if(!(k[e+" "]||f&&f.test(e))){if(d=e,p=t,1===y&&(H.test(e)||z.test(e))){for((p=Z.test(e)&&se(t.parentNode)||t)==t&&m.scope||((s=t.getAttribute("id"))?s=S.escapeSelector(s):t.setAttribute("id",s=v)),o=(l=le(e)).length;o--;)l[o]=(s?"#"+s:":scope")+" "+he(l[o]);d=l.join(",")}try{return g.apply(n,p.querySelectorAll(d)),n}catch(t){k(e,!0)}finally{s===v&&t.removeAttribute("id")}}}return ye(e.replace(M,"$1"),t,n,r)}function ee(){var e=[];return function n(r,i){return e.push(r+" ")>t.cacheLength&&delete n[e.shift()],n[r+" "]=i}}function te(e){return e[v]=!0,e}function ne(e){var t=u.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function re(e){return function(t){return A(t,"input")&&t.type===e}}function ie(e){return function(t){return(A(t,"input")||A(t,"button"))&&t.type===e}}function oe(e){return function(t){return"form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&J(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function ae(e){return te((function(t){return t=+t,te((function(n,r){for(var i,o=e([],n.length,t),a=o.length;a--;)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))}))}))}function se(e){return e&&void 0!==e.getElementsByTagName&&e}function ue(e){var n,r=e?e.ownerDocument||e:O;return r!=u&&9===r.nodeType&&r.documentElement?(c=(u=r).documentElement,h=!S.isXMLDoc(u),p=c.matches||c.webkitMatchesSelector||c.msMatchesSelector,c.msMatchesSelector&&O!=u&&(n=u.defaultView)&&n.top!==n&&n.addEventListener("unload",K),m.getById=ne((function(e){return c.appendChild(e).id=S.expando,!u.getElementsByName||!u.getElementsByName(S.expando).length})),m.disconnectedMatch=ne((function(e){return p.call(e,"*")})),m.scope=ne((function(){return u.querySelectorAll(":scope")})),m.cssHas=ne((function(){try{return u.querySelector(":has(*,:jqfake)"),!1}catch(e){return!0}})),m.getById?(t.filter.ID=function(e){var t=e.replace(X,Y);return function(e){return e.getAttribute("id")===t}},t.find.ID=function(e,t){if(void 0!==t.getElementById&&h){var n=t.getElementById(e);return n?[n]:[]}}):(t.filter.ID=function(e){var t=e.replace(X,Y);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},t.find.ID=function(e,t){if(void 0!==t.getElementById&&h){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];for(i=t.getElementsByName(e),r=0;o=i[r++];)if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),t.find.TAG=function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):t.querySelectorAll(e)},t.find.CLASS=function(e,t){if(void 0!==t.getElementsByClassName&&h)return t.getElementsByClassName(e)},f=[],ne((function(e){var t;c.appendChild(e).innerHTML="<a id=\'"+v+"\' href=\'\' disabled=\'disabled\'></a><select id=\'"+v+"-\\r\\\\\' disabled=\'disabled\'><option selected=\'\'></option></select>",e.querySelectorAll("[selected]").length||f.push("\\\\["+P+"*(?:value|"+T+")"),e.querySelectorAll("[id~="+v+"-]").length||f.push("~="),e.querySelectorAll("a#"+v+"+*").length||f.push(".#.+[+~]"),e.querySelectorAll(":checked").length||f.push(":checked"),(t=u.createElement("input")).setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),c.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&f.push(":enabled",":disabled"),(t=u.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name=\'\']").length||f.push("\\\\["+P+"*name"+P+"*="+P+"*(?:\'\'|\\"\\")")})),m.cssHas||f.push(":has"),f=f.length&&new RegExp(f.join("|")),C=function(e,t){if(e===t)return a=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n||(1&(n=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!m.sortDetached&&t.compareDocumentPosition(e)===n?e===u||e.ownerDocument==O&&Q.contains(O,e)?-1:t===u||t.ownerDocument==O&&Q.contains(O,t)?1:i?l.call(i,e)-l.call(i,t):0:4&n?-1:1)},u):u}for(e in Q.matches=function(e,t){return Q(e,null,null,t)},Q.matchesSelector=function(e,t){if(ue(e),h&&!k[t+" "]&&(!f||!f.test(t)))try{var n=p.call(e,t);if(n||m.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(e){k(t,!0)}return Q(t,u,null,[e]).length>0},Q.contains=function(e,t){return(e.ownerDocument||e)!=u&&ue(e),S.contains(e,t)},Q.attr=function(e,n){(e.ownerDocument||e)!=u&&ue(e);var r=t.attrHandle[n.toLowerCase()],i=r&&d.call(t.attrHandle,n.toLowerCase())?r(e,n,!h):void 0;return void 0!==i?i:e.getAttribute(n)},Q.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},S.uniqueSort=function(e){var t,n=[],r=0,o=0;if(a=!m.sortStable,i=!m.sortStable&&s.call(e,0),R.call(e,C),a){for(;t=e[o++];)t===e[o]&&(r=n.push(o));for(;r--;)N.call(e,n[r],1)}return i=null,e},S.fn.uniqueSort=function(){return this.pushStack(S.uniqueSort(s.apply(this)))},t=S.expr={cacheLength:50,createPseudo:te,match:G,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(X,Y),e[3]=(e[3]||e[4]||e[5]||"").replace(X,Y),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||Q.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&Q.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return G.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&F.test(n)&&(t=le(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(X,Y).toLowerCase();return"*"===e?function(){return!0}:function(e){return A(e,t)}},CLASS:function(e){var t=b[e+" "];return t||(t=new RegExp("(^|"+P+")"+e+"("+P+"|$)"))&&b(e,(function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")}))},ATTR:function(e,t,n){return function(r){var i=Q.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(V," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var c,l,h,f,d,p=o!==a?"nextSibling":"previousSibling",g=t.parentNode,m=s&&t.nodeName.toLowerCase(),x=!u&&!s,b=!1;if(g){if(o){for(;p;){for(h=t;h=h[p];)if(s?A(h,m):1===h.nodeType)return!1;d=p="only"===e&&!d&&"nextSibling"}return!0}if(d=[a?g.firstChild:g.lastChild],a&&x){for(b=(f=(c=(l=g[v]||(g[v]={}))[e]||[])[0]===y&&c[1])&&c[2],h=f&&g.childNodes[f];h=++f&&h&&h[p]||(b=f=0)||d.pop();)if(1===h.nodeType&&++b&&h===t){l[e]=[y,f,b];break}}else if(x&&(b=f=(c=(l=t[v]||(t[v]={}))[e]||[])[0]===y&&c[1]),!1===b)for(;(h=++f&&h&&h[p]||(b=f=0)||d.pop())&&(!(s?A(h,m):1===h.nodeType)||!++b||(x&&((l=h[v]||(h[v]={}))[e]=[y,b]),h!==t)););return(b-=i)===r||b%r==0&&b/r>=0}}},PSEUDO:function(e,n){var r,i=t.pseudos[e]||t.setFilters[e.toLowerCase()]||Q.error("unsupported pseudo: "+e);return i[v]?i(n):i.length>1?(r=[e,e,"",n],t.setFilters.hasOwnProperty(e.toLowerCase())?te((function(e,t){for(var r,o=i(e,n),a=o.length;a--;)e[r=l.call(e,o[a])]=!(t[r]=o[a])})):function(e){return i(e,0,r)}):i}},pseudos:{not:te((function(e){var t=[],n=[],r=ve(e.replace(M,"$1"));return r[v]?te((function(e,t,n,i){for(var o,a=r(e,null,i,[]),s=e.length;s--;)(o=a[s])&&(e[s]=!(t[s]=o))})):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}})),has:te((function(e){return function(t){return Q(e,t).length>0}})),contains:te((function(e){return e=e.replace(X,Y),function(t){return(t.textContent||S.text(t)).indexOf(e)>-1}})),lang:te((function(e){return q.test(e||"")||Q.error("unsupported lang: "+e),e=e.replace(X,Y).toLowerCase(),function(t){var n;do{if(n=h?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return(n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return!1}})),target:function(e){var t=r.location&&r.location.hash;return t&&t.slice(1)===e.id},root:function(e){return e===c},focus:function(e){return e===function(){try{return u.activeElement}catch(e){}}()&&u.hasFocus()&&!!(e.type||e.href||~e.tabIndex)},enabled:oe(!1),disabled:oe(!0),checked:function(e){return A(e,"input")&&!!e.checked||A(e,"option")&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!t.pseudos.empty(e)},header:function(e){return $.test(e.nodeName)},input:function(e){return U.test(e.nodeName)},button:function(e){return A(e,"input")&&"button"===e.type||A(e,"button")},text:function(e){var t;return A(e,"input")&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:ae((function(){return[0]})),last:ae((function(e,t){return[t-1]})),eq:ae((function(e,t,n){return[n<0?n+t:n]})),even:ae((function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e})),odd:ae((function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e})),lt:ae((function(e,t,n){var r;for(r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e})),gt:ae((function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e}))}},t.pseudos.nth=t.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})t.pseudos[e]=re(e);for(e in{submit:!0,reset:!0})t.pseudos[e]=ie(e);function ce(){}function le(e,n){var r,i,o,a,s,u,c,l=w[e+" "];if(l)return n?0:l.slice(0);for(s=e,u=[],c=t.preFilter;s;){for(a in r&&!(i=j.exec(s))||(i&&(s=s.slice(i[0].length)||s),u.push(o=[])),r=!1,(i=z.exec(s))&&(r=i.shift(),o.push({value:r,type:i[0].replace(M," ")}),s=s.slice(r.length)),t.filter)!(i=G[a].exec(s))||c[a]&&!(i=c[a](i))||(r=i.shift(),o.push({value:r,type:a,matches:i}),s=s.slice(r.length));if(!r)break}return n?s.length:s?Q.error(e):w(e,u).slice(0)}function he(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function fe(e,t,n){var r=t.dir,i=t.next,o=i||r,a=n&&"parentNode"===o,s=x++;return t.first?function(t,n,i){for(;t=t[r];)if(1===t.nodeType||a)return e(t,n,i);return!1}:function(t,n,u){var c,l,h=[y,s];if(u){for(;t=t[r];)if((1===t.nodeType||a)&&e(t,n,u))return!0}else for(;t=t[r];)if(1===t.nodeType||a)if(l=t[v]||(t[v]={}),i&&A(t,i))t=t[r]||t;else{if((c=l[o])&&c[0]===y&&c[1]===s)return h[2]=c[2];if(l[o]=h,h[2]=e(t,n,u))return!0}return!1}}function de(e){return e.length>1?function(t,n,r){for(var i=e.length;i--;)if(!e[i](t,n,r))return!1;return!0}:e[0]}function pe(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,c=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),c&&t.push(s)));return a}function ge(e,t,n,r,i,o){return r&&!r[v]&&(r=ge(r)),i&&!i[v]&&(i=ge(i,o)),te((function(o,a,s,u){var c,h,f,d,p=[],m=[],v=a.length,y=o||function(e,t,n){for(var r=0,i=t.length;r<i;r++)Q(e,t[r],n);return n}(t||"*",s.nodeType?[s]:s,[]),x=!e||!o&&t?y:pe(y,p,e,s,u);if(n?n(x,d=i||(o?e:v||r)?[]:a,s,u):d=x,r)for(c=pe(d,m),r(c,[],s,u),h=c.length;h--;)(f=c[h])&&(d[m[h]]=!(x[m[h]]=f));if(o){if(i||e){if(i){for(c=[],h=d.length;h--;)(f=d[h])&&c.push(x[h]=f);i(null,d=[],c,u)}for(h=d.length;h--;)(f=d[h])&&(c=i?l.call(o,f):p[h])>-1&&(o[c]=!(a[c]=f))}}else d=pe(d===a?d.splice(v,d.length):d),i?i(null,a,d,u):g.apply(a,d)}))}function me(e){for(var r,i,o,a=e.length,s=t.relative[e[0].type],u=s||t.relative[" "],c=s?1:0,h=fe((function(e){return e===r}),u,!0),f=fe((function(e){return l.call(r,e)>-1}),u,!0),d=[function(e,t,i){var o=!s&&(i||t!=n)||((r=t).nodeType?h(e,t,i):f(e,t,i));return r=null,o}];c<a;c++)if(i=t.relative[e[c].type])d=[fe(de(d),i)];else{if((i=t.filter[e[c].type].apply(null,e[c].matches))[v]){for(o=++c;o<a&&!t.relative[e[o].type];o++);return ge(c>1&&de(d),c>1&&he(e.slice(0,c-1).concat({value:" "===e[c-2].type?"*":""})).replace(M,"$1"),i,c<o&&me(e.slice(c,o)),o<a&&me(e=e.slice(o)),o<a&&he(e))}d.push(i)}return de(d)}function ve(e,r){var i,o=[],a=[],s=_[e+" "];if(!s){for(r||(r=le(e)),i=r.length;i--;)(s=me(r[i]))[v]?o.push(s):a.push(s);s=_(e,function(e,r){var i=r.length>0,o=e.length>0,a=function(a,s,c,l,f){var d,p,m,v=0,x="0",b=a&&[],w=[],_=n,k=a||o&&t.find.TAG("*",f),C=y+=null==_?1:Math.random()||.1,T=k.length;for(f&&(n=s==u||s||f);x!==T&&null!=(d=k[x]);x++){if(o&&d){for(p=0,s||d.ownerDocument==u||(ue(d),c=!h);m=e[p++];)if(m(d,s||u,c)){g.call(l,d);break}f&&(y=C)}i&&((d=!m&&d)&&v--,a&&b.push(d))}if(v+=x,i&&x!==v){for(p=0;m=r[p++];)m(b,w,s,c);if(a){if(v>0)for(;x--;)b[x]||w[x]||(w[x]=E.call(l));w=pe(w)}g.apply(l,w),f&&!a&&w.length>0&&v+r.length>1&&S.uniqueSort(l)}return f&&(y=C,n=_),b};return i?te(a):a}(a,o)),s.selector=e}return s}function ye(e,n,r,i){var o,a,s,u,c,l="function"==typeof e&&e,f=!i&&le(e=l.selector||e);if(r=r||[],1===f.length){if((a=f[0]=f[0].slice(0)).length>2&&"ID"===(s=a[0]).type&&9===n.nodeType&&h&&t.relative[a[1].type]){if(!(n=(t.find.ID(s.matches[0].replace(X,Y),n)||[])[0]))return r;l&&(n=n.parentNode),e=e.slice(a.shift().value.length)}for(o=G.needsContext.test(e)?0:a.length;o--&&(s=a[o],!t.relative[u=s.type]);)if((c=t.find[u])&&(i=c(s.matches[0].replace(X,Y),Z.test(a[0].type)&&se(n.parentNode)||n))){if(a.splice(o,1),!(e=i.length&&he(a)))return g.apply(r,i),r;break}}return(l||ve(e,f))(i,n,!h,r,!n||Z.test(e)&&se(n.parentNode)||n),r}ce.prototype=t.filters=t.pseudos,t.setFilters=new ce,m.sortStable=v.split("").sort(C).join("")===v,ue(),m.sortDetached=ne((function(e){return 1&e.compareDocumentPosition(u.createElement("fieldset"))})),S.find=Q,S.expr[":"]=S.expr.pseudos,S.unique=S.uniqueSort,Q.compile=ve,Q.select=ye,Q.setDocument=ue,Q.tokenize=le,Q.escape=S.escapeSelector,Q.getText=S.text,Q.isXML=S.isXMLDoc,Q.selectors=S.expr,Q.support=S.support,Q.uniqueSort=S.uniqueSort}();var B=function(e,t,n){for(var r=[],i=void 0!==n;(e=e[t])&&9!==e.nodeType;)if(1===e.nodeType){if(i&&S(e).is(n))break;r.push(e)}return r},V=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},j=S.expr.match.needsContext,z=/^<([a-z][^\\/\\0>:\\x20\\t\\r\\n\\f]*)[\\x20\\t\\r\\n\\f]*\\/?>(?:<\\/\\1>|)$/i;function H(e,t,n){return v(t)?S.grep(e,(function(e,r){return!!t.call(e,r,e)!==n})):t.nodeType?S.grep(e,(function(e){return e===t!==n})):"string"!=typeof t?S.grep(e,(function(e){return l.call(t,e)>-1!==n})):S.filter(t,e,n)}S.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?S.find.matchesSelector(r,e)?[r]:[]:S.find.matches(e,S.grep(t,(function(e){return 1===e.nodeType})))},S.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(S(e).filter((function(){for(t=0;t<r;t++)if(S.contains(i[t],this))return!0})));for(n=this.pushStack([]),t=0;t<r;t++)S.find(e,i[t],n);return r>1?S.uniqueSort(n):n},filter:function(e){return this.pushStack(H(this,e||[],!1))},not:function(e){return this.pushStack(H(this,e||[],!0))},is:function(e){return!!H(this,"string"==typeof e&&j.test(e)?S(e):e||[],!1).length}});var F,q=/^(?:\\s*(<[\\w\\W]+>)[^>]*|#([\\w-]+))$/;(S.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||F,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:q.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof S?t[0]:t,S.merge(this,S.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:x,!0)),z.test(r[1])&&S.isPlainObject(t))for(r in t)v(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=x.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):v(e)?void 0!==n.ready?n.ready(e):e(S):S.makeArray(e,this)}).prototype=S.fn,F=S(x);var G=/^(?:parents|prev(?:Until|All))/,U={children:!0,contents:!0,next:!0,prev:!0};function $(e,t){for(;(e=e[t])&&1!==e.nodeType;);return e}S.fn.extend({has:function(e){var t=S(e,this),n=t.length;return this.filter((function(){for(var e=0;e<n;e++)if(S.contains(this,t[e]))return!0}))},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&S(e);if(!j.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?a.index(n)>-1:1===n.nodeType&&S.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(o.length>1?S.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?l.call(S(e),this[0]):l.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(S.uniqueSort(S.merge(this.get(),S(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),S.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return B(e,"parentNode")},parentsUntil:function(e,t,n){return B(e,"parentNode",n)},next:function(e){return $(e,"nextSibling")},prev:function(e){return $(e,"previousSibling")},nextAll:function(e){return B(e,"nextSibling")},prevAll:function(e){return B(e,"previousSibling")},nextUntil:function(e,t,n){return B(e,"nextSibling",n)},prevUntil:function(e,t,n){return B(e,"previousSibling",n)},siblings:function(e){return V((e.parentNode||{}).firstChild,e)},children:function(e){return V(e.firstChild)},contents:function(e){return null!=e.contentDocument&&a(e.contentDocument)?e.contentDocument:(A(e,"template")&&(e=e.content||e),S.merge([],e.childNodes))}},(function(e,t){S.fn[e]=function(n,r){var i=S.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=S.filter(r,i)),this.length>1&&(U[e]||S.uniqueSort(i),G.test(e)&&i.reverse()),this.pushStack(i)}}));var W=/[^\\x20\\t\\r\\n\\f]+/g;function Z(e){return e}function X(e){throw e}function Y(e,t,n,r){var i;try{e&&v(i=e.promise)?i.call(e).done(t).fail(n):e&&v(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}S.Callbacks=function(e){e="string"==typeof e?function(e){var t={};return S.each(e.match(W)||[],(function(e,n){t[n]=!0})),t}(e):S.extend({},e);var t,n,r,i,o=[],a=[],s=-1,u=function(){for(i=i||e.once,r=t=!0;a.length;s=-1)for(n=a.shift();++s<o.length;)!1===o[s].apply(n[0],n[1])&&e.stopOnFalse&&(s=o.length,n=!1);e.memory||(n=!1),t=!1,i&&(o=n?[]:"")},c={add:function(){return o&&(n&&!t&&(s=o.length-1,a.push(n)),function t(n){S.each(n,(function(n,r){v(r)?e.unique&&c.has(r)||o.push(r):r&&r.length&&"string"!==_(r)&&t(r)}))}(arguments),n&&!t&&u()),this},remove:function(){return S.each(arguments,(function(e,t){for(var n;(n=S.inArray(t,o,n))>-1;)o.splice(n,1),n<=s&&s--})),this},has:function(e){return e?S.inArray(e,o)>-1:o.length>0},empty:function(){return o&&(o=[]),this},disable:function(){return i=a=[],o=n="",this},disabled:function(){return!o},lock:function(){return i=a=[],n||t||(o=n=""),this},locked:function(){return!!i},fireWith:function(e,n){return i||(n=[e,(n=n||[]).slice?n.slice():n],a.push(n),t||u()),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!r}};return c},S.extend({Deferred:function(e){var t=[["notify","progress",S.Callbacks("memory"),S.Callbacks("memory"),2],["resolve","done",S.Callbacks("once memory"),S.Callbacks("once memory"),0,"resolved"],["reject","fail",S.Callbacks("once memory"),S.Callbacks("once memory"),1,"rejected"]],n="pending",i={state:function(){return n},always:function(){return o.done(arguments).fail(arguments),this},catch:function(e){return i.then(null,e)},pipe:function(){var e=arguments;return S.Deferred((function(n){S.each(t,(function(t,r){var i=v(e[r[4]])&&e[r[4]];o[r[1]]((function(){var e=i&&i.apply(this,arguments);e&&v(e.promise)?e.promise().progress(n.notify).done(n.resolve).fail(n.reject):n[r[0]+"With"](this,i?[e]:arguments)}))})),e=null})).promise()},then:function(e,n,i){var o=0;function a(e,t,n,i){return function(){var s=this,u=arguments,c=function(){var r,c;if(!(e<o)){if((r=n.apply(s,u))===t.promise())throw new TypeError("Thenable self-resolution");c=r&&("object"==typeof r||"function"==typeof r)&&r.then,v(c)?i?c.call(r,a(o,t,Z,i),a(o,t,X,i)):(o++,c.call(r,a(o,t,Z,i),a(o,t,X,i),a(o,t,Z,t.notifyWith))):(n!==Z&&(s=void 0,u=[r]),(i||t.resolveWith)(s,u))}},l=i?c:function(){try{c()}catch(r){S.Deferred.exceptionHook&&S.Deferred.exceptionHook(r,l.error),e+1>=o&&(n!==X&&(s=void 0,u=[r]),t.rejectWith(s,u))}};e?l():(S.Deferred.getErrorHook?l.error=S.Deferred.getErrorHook():S.Deferred.getStackHook&&(l.error=S.Deferred.getStackHook()),r.setTimeout(l))}}return S.Deferred((function(r){t[0][3].add(a(0,r,v(i)?i:Z,r.notifyWith)),t[1][3].add(a(0,r,v(e)?e:Z)),t[2][3].add(a(0,r,v(n)?n:X))})).promise()},promise:function(e){return null!=e?S.extend(e,i):i}},o={};return S.each(t,(function(e,r){var a=r[2],s=r[5];i[r[1]]=a.add,s&&a.add((function(){n=s}),t[3-e][2].disable,t[3-e][3].disable,t[0][2].lock,t[0][3].lock),a.add(r[3].fire),o[r[0]]=function(){return o[r[0]+"With"](this===o?void 0:this,arguments),this},o[r[0]+"With"]=a.fireWith})),i.promise(o),e&&e.call(o,o),o},when:function(e){var t=arguments.length,n=t,r=Array(n),i=s.call(arguments),o=S.Deferred(),a=function(e){return function(n){r[e]=this,i[e]=arguments.length>1?s.call(arguments):n,--t||o.resolveWith(r,i)}};if(t<=1&&(Y(e,o.done(a(n)).resolve,o.reject,!t),"pending"===o.state()||v(i[n]&&i[n].then)))return o.then();for(;n--;)Y(i[n],a(n),o.reject);return o.promise()}});var K=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;S.Deferred.exceptionHook=function(e,t){r.console&&r.console.warn&&e&&K.test(e.name)&&r.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},S.readyException=function(e){r.setTimeout((function(){throw e}))};var J=S.Deferred();function Q(){x.removeEventListener("DOMContentLoaded",Q),r.removeEventListener("load",Q),S.ready()}S.fn.ready=function(e){return J.then(e).catch((function(e){S.readyException(e)})),this},S.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--S.readyWait:S.isReady)||(S.isReady=!0,!0!==e&&--S.readyWait>0||J.resolveWith(x,[S]))}}),S.ready.then=J.then,"complete"===x.readyState||"loading"!==x.readyState&&!x.documentElement.doScroll?r.setTimeout(S.ready):(x.addEventListener("DOMContentLoaded",Q),r.addEventListener("load",Q));var ee=function(e,t,n,r,i,o,a){var s=0,u=e.length,c=null==n;if("object"===_(n))for(s in i=!0,n)ee(e,t,s,n[s],!0,o,a);else if(void 0!==r&&(i=!0,v(r)||(a=!0),c&&(a?(t.call(e,r),t=null):(c=t,t=function(e,t,n){return c.call(S(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:c?t.call(e):u?t(e[0],n):o},te=/^-ms-/,ne=/-([a-z])/g;function re(e,t){return t.toUpperCase()}function ie(e){return e.replace(te,"ms-").replace(ne,re)}var oe=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function ae(){this.expando=S.expando+ae.uid++}ae.uid=1,ae.prototype={cache:function(e){var t=e[this.expando];return t||(t={},oe(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[ie(t)]=n;else for(r in t)i[ie(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][ie(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(ie):(t=ie(t))in r?[t]:t.match(W)||[]).length;for(;n--;)delete r[t[n]]}(void 0===t||S.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!S.isEmptyObject(t)}};var se=new ae,ue=new ae,ce=/^(?:\\{[\\w\\W]*\\}|\\[[\\w\\W]*\\])$/,le=/[A-Z]/g;function he(e,t,n){var r;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(le,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n=function(e){return"true"===e||"false"!==e&&("null"===e?null:e===+e+""?+e:ce.test(e)?JSON.parse(e):e)}(n)}catch(e){}ue.set(e,t,n)}else n=void 0;return n}S.extend({hasData:function(e){return ue.hasData(e)||se.hasData(e)},data:function(e,t,n){return ue.access(e,t,n)},removeData:function(e,t){ue.remove(e,t)},_data:function(e,t,n){return se.access(e,t,n)},_removeData:function(e,t){se.remove(e,t)}}),S.fn.extend({data:function(e,t){var n,r,i,o=this[0],a=o&&o.attributes;if(void 0===e){if(this.length&&(i=ue.get(o),1===o.nodeType&&!se.get(o,"hasDataAttrs"))){for(n=a.length;n--;)a[n]&&0===(r=a[n].name).indexOf("data-")&&(r=ie(r.slice(5)),he(o,r,i[r]));se.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof e?this.each((function(){ue.set(this,e)})):ee(this,(function(t){var n;if(o&&void 0===t)return void 0!==(n=ue.get(o,e))||void 0!==(n=he(o,e))?n:void 0;this.each((function(){ue.set(this,e,t)}))}),null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each((function(){ue.remove(this,e)}))}}),S.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=se.get(e,t),n&&(!r||Array.isArray(n)?r=se.access(e,t,S.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=S.queue(e,t),r=n.length,i=n.shift(),o=S._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,(function(){S.dequeue(e,t)}),o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return se.get(e,n)||se.access(e,n,{empty:S.Callbacks("once memory").add((function(){se.remove(e,[t+"queue",n])}))})}}),S.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),arguments.length<n?S.queue(this[0],e):void 0===t?this:this.each((function(){var n=S.queue(this,e,t);S._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&S.dequeue(this,e)}))},dequeue:function(e){return this.each((function(){S.dequeue(this,e)}))},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=S.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};for("string"!=typeof e&&(t=e,e=void 0),e=e||"fx";a--;)(n=se.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var fe=/[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)/.source,de=new RegExp("^(?:([+-])=|)("+fe+")([a-z%]*)$","i"),pe=["Top","Right","Bottom","Left"],ge=x.documentElement,me=function(e){return S.contains(e.ownerDocument,e)},ve={composed:!0};ge.getRootNode&&(me=function(e){return S.contains(e.ownerDocument,e)||e.getRootNode(ve)===e.ownerDocument});var ye=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&me(e)&&"none"===S.css(e,"display")};function xe(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return S.css(e,t,"")},u=s(),c=n&&n[3]||(S.cssNumber[t]?"":"px"),l=e.nodeType&&(S.cssNumber[t]||"px"!==c&&+u)&&de.exec(S.css(e,t));if(l&&l[3]!==c){for(u/=2,c=c||l[3],l=+u||1;a--;)S.style(e,t,l+c),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),l/=o;l*=2,S.style(e,t,l+c),n=n||[]}return n&&(l=+l||+u||0,i=n[1]?l+(n[1]+1)*n[2]:+n[2],r&&(r.unit=c,r.start=l,r.end=i)),i}var be={};function we(e){var t,n=e.ownerDocument,r=e.nodeName,i=be[r];return i||(t=n.body.appendChild(n.createElement(r)),i=S.css(t,"display"),t.parentNode.removeChild(t),"none"===i&&(i="block"),be[r]=i,i)}function _e(e,t){for(var n,r,i=[],o=0,a=e.length;o<a;o++)(r=e[o]).style&&(n=r.style.display,t?("none"===n&&(i[o]=se.get(r,"display")||null,i[o]||(r.style.display="")),""===r.style.display&&ye(r)&&(i[o]=we(r))):"none"!==n&&(i[o]="none",se.set(r,"display",n)));for(o=0;o<a;o++)null!=i[o]&&(e[o].style.display=i[o]);return e}S.fn.extend({show:function(){return _e(this,!0)},hide:function(){return _e(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each((function(){ye(this)?S(this).show():S(this).hide()}))}});var ke,Ce,Se=/^(?:checkbox|radio)$/i,Te=/<([a-z][^\\/\\0>\\x20\\t\\r\\n\\f]*)/i,Ae=/^$|^module$|\\/(?:java|ecma)script/i;ke=x.createDocumentFragment().appendChild(x.createElement("div")),(Ce=x.createElement("input")).setAttribute("type","radio"),Ce.setAttribute("checked","checked"),Ce.setAttribute("name","t"),ke.appendChild(Ce),m.checkClone=ke.cloneNode(!0).cloneNode(!0).lastChild.checked,ke.innerHTML="<textarea>x</textarea>",m.noCloneChecked=!!ke.cloneNode(!0).lastChild.defaultValue,ke.innerHTML="<option></option>",m.option=!!ke.lastChild;var Ee={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Re(e,t){var n;return n=void 0!==e.getElementsByTagName?e.getElementsByTagName(t||"*"):void 0!==e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&A(e,t)?S.merge([e],n):n}function Ne(e,t){for(var n=0,r=e.length;n<r;n++)se.set(e[n],"globalEval",!t||se.get(t[n],"globalEval"))}Ee.tbody=Ee.tfoot=Ee.colgroup=Ee.caption=Ee.thead,Ee.th=Ee.td,m.option||(Ee.optgroup=Ee.option=[1,"<select multiple=\'multiple\'>","</select>"]);var Pe=/<|&#?\\w+;/;function Me(e,t,n,r,i){for(var o,a,s,u,c,l,h=t.createDocumentFragment(),f=[],d=0,p=e.length;d<p;d++)if((o=e[d])||0===o)if("object"===_(o))S.merge(f,o.nodeType?[o]:o);else if(Pe.test(o)){for(a=a||h.appendChild(t.createElement("div")),s=(Te.exec(o)||["",""])[1].toLowerCase(),u=Ee[s]||Ee._default,a.innerHTML=u[1]+S.htmlPrefilter(o)+u[2],l=u[0];l--;)a=a.lastChild;S.merge(f,a.childNodes),(a=h.firstChild).textContent=""}else f.push(t.createTextNode(o));for(h.textContent="",d=0;o=f[d++];)if(r&&S.inArray(o,r)>-1)i&&i.push(o);else if(c=me(o),a=Re(h.appendChild(o),"script"),c&&Ne(a),n)for(l=0;o=a[l++];)Ae.test(o.type||"")&&n.push(o);return h}var De=/^([^.]*)(?:\\.(.+)|)/;function Le(){return!0}function Oe(){return!1}function Ie(e,t,n,r,i,o){var a,s;if("object"==typeof t){for(s in"string"!=typeof n&&(r=r||n,n=void 0),t)Ie(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=Oe;else if(!i)return e;return 1===o&&(a=i,i=function(e){return S().off(e),a.apply(this,arguments)},i.guid=a.guid||(a.guid=S.guid++)),e.each((function(){S.event.add(this,t,i,r,n)}))}function Be(e,t,n){n?(se.set(e,t,!1),S.event.add(e,t,{namespace:!1,handler:function(e){var n,r=se.get(this,t);if(1&e.isTrigger&&this[t]){if(r)(S.event.special[t]||{}).delegateType&&e.stopPropagation();else if(r=s.call(arguments),se.set(this,t,r),this[t](),n=se.get(this,t),se.set(this,t,!1),r!==n)return e.stopImmediatePropagation(),e.preventDefault(),n}else r&&(se.set(this,t,S.event.trigger(r[0],r.slice(1),this)),e.stopPropagation(),e.isImmediatePropagationStopped=Le)}})):void 0===se.get(e,t)&&S.event.add(e,t,Le)}S.event={global:{},add:function(e,t,n,r,i){var o,a,s,u,c,l,h,f,d,p,g,m=se.get(e);if(oe(e))for(n.handler&&(n=(o=n).handler,i=o.selector),i&&S.find.matchesSelector(ge,i),n.guid||(n.guid=S.guid++),(u=m.events)||(u=m.events=Object.create(null)),(a=m.handle)||(a=m.handle=function(t){return void 0!==S&&S.event.triggered!==t.type?S.event.dispatch.apply(e,arguments):void 0}),c=(t=(t||"").match(W)||[""]).length;c--;)d=g=(s=De.exec(t[c])||[])[1],p=(s[2]||"").split(".").sort(),d&&(h=S.event.special[d]||{},d=(i?h.delegateType:h.bindType)||d,h=S.event.special[d]||{},l=S.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&S.expr.match.needsContext.test(i),namespace:p.join(".")},o),(f=u[d])||((f=u[d]=[]).delegateCount=0,h.setup&&!1!==h.setup.call(e,r,p,a)||e.addEventListener&&e.addEventListener(d,a)),h.add&&(h.add.call(e,l),l.handler.guid||(l.handler.guid=n.guid)),i?f.splice(f.delegateCount++,0,l):f.push(l),S.event.global[d]=!0)},remove:function(e,t,n,r,i){var o,a,s,u,c,l,h,f,d,p,g,m=se.hasData(e)&&se.get(e);if(m&&(u=m.events)){for(c=(t=(t||"").match(W)||[""]).length;c--;)if(d=g=(s=De.exec(t[c])||[])[1],p=(s[2]||"").split(".").sort(),d){for(h=S.event.special[d]||{},f=u[d=(r?h.delegateType:h.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\\\.)"+p.join("\\\\.(?:.*\\\\.|)")+"(\\\\.|$)"),a=o=f.length;o--;)l=f[o],!i&&g!==l.origType||n&&n.guid!==l.guid||s&&!s.test(l.namespace)||r&&r!==l.selector&&("**"!==r||!l.selector)||(f.splice(o,1),l.selector&&f.delegateCount--,h.remove&&h.remove.call(e,l));a&&!f.length&&(h.teardown&&!1!==h.teardown.call(e,p,m.handle)||S.removeEvent(e,d,m.handle),delete u[d])}else for(d in u)S.event.remove(e,d+t[c],n,r,!0);S.isEmptyObject(u)&&se.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=new Array(arguments.length),u=S.event.fix(e),c=(se.get(this,"events")||Object.create(null))[u.type]||[],l=S.event.special[u.type]||{};for(s[0]=u,t=1;t<arguments.length;t++)s[t]=arguments[t];if(u.delegateTarget=this,!l.preDispatch||!1!==l.preDispatch.call(this,u)){for(a=S.event.handlers.call(this,u,c),t=0;(i=a[t++])&&!u.isPropagationStopped();)for(u.currentTarget=i.elem,n=0;(o=i.handlers[n++])&&!u.isImmediatePropagationStopped();)u.rnamespace&&!1!==o.namespace&&!u.rnamespace.test(o.namespace)||(u.handleObj=o,u.data=o.data,void 0!==(r=((S.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,s))&&!1===(u.result=r)&&(u.preventDefault(),u.stopPropagation()));return l.postDispatch&&l.postDispatch.call(this,u),u.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,c=e.target;if(u&&c.nodeType&&!("click"===e.type&&e.button>=1))for(;c!==this;c=c.parentNode||this)if(1===c.nodeType&&("click"!==e.type||!0!==c.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?S(i,this).index(c)>-1:S.find(i,this,null,[c]).length),a[i]&&o.push(r);o.length&&s.push({elem:c,handlers:o})}return c=this,u<t.length&&s.push({elem:c,handlers:t.slice(u)}),s},addProp:function(e,t){Object.defineProperty(S.Event.prototype,e,{enumerable:!0,configurable:!0,get:v(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(t){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:t})}})},fix:function(e){return e[S.expando]?e:new S.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return Se.test(t.type)&&t.click&&A(t,"input")&&Be(t,"click",!0),!1},trigger:function(e){var t=this||e;return Se.test(t.type)&&t.click&&A(t,"input")&&Be(t,"click"),!0},_default:function(e){var t=e.target;return Se.test(t.type)&&t.click&&A(t,"input")&&se.get(t,"click")||A(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},S.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},S.Event=function(e,t){if(!(this instanceof S.Event))return new S.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Le:Oe,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&S.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[S.expando]=!0},S.Event.prototype={constructor:S.Event,isDefaultPrevented:Oe,isPropagationStopped:Oe,isImmediatePropagationStopped:Oe,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Le,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Le,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Le,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},S.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},S.event.addProp),S.each({focus:"focusin",blur:"focusout"},(function(e,t){function n(e){if(x.documentMode){var n=se.get(this,"handle"),r=S.event.fix(e);r.type="focusin"===e.type?"focus":"blur",r.isSimulated=!0,n(e),r.target===r.currentTarget&&n(r)}else S.event.simulate(t,e.target,S.event.fix(e))}S.event.special[e]={setup:function(){var r;if(Be(this,e,!0),!x.documentMode)return!1;(r=se.get(this,t))||this.addEventListener(t,n),se.set(this,t,(r||0)+1)},trigger:function(){return Be(this,e),!0},teardown:function(){var e;if(!x.documentMode)return!1;(e=se.get(this,t)-1)?se.set(this,t,e):(this.removeEventListener(t,n),se.remove(this,t))},_default:function(t){return se.get(t.target,e)},delegateType:t},S.event.special[t]={setup:function(){var r=this.ownerDocument||this.document||this,i=x.documentMode?this:r,o=se.get(i,t);o||(x.documentMode?this.addEventListener(t,n):r.addEventListener(e,n,!0)),se.set(i,t,(o||0)+1)},teardown:function(){var r=this.ownerDocument||this.document||this,i=x.documentMode?this:r,o=se.get(i,t)-1;o?se.set(i,t,o):(x.documentMode?this.removeEventListener(t,n):r.removeEventListener(e,n,!0),se.remove(i,t))}}})),S.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},(function(e,t){S.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=e.relatedTarget,i=e.handleObj;return r&&(r===this||S.contains(this,r))||(e.type=i.origType,n=i.handler.apply(this,arguments),e.type=t),n}}})),S.fn.extend({on:function(e,t,n,r){return Ie(this,e,t,n,r)},one:function(e,t,n,r){return Ie(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,S(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=Oe),this.each((function(){S.event.remove(this,e,n,t)}))}});var Ve=/<script|<style|<link/i,je=/checked\\s*(?:[^=]|=\\s*.checked.)/i,ze=/^\\s*<!\\[CDATA\\[|\\]\\]>\\s*$/g;function He(e,t){return A(e,"table")&&A(11!==t.nodeType?t:t.firstChild,"tr")&&S(e).children("tbody")[0]||e}function Fe(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function qe(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Ge(e,t){var n,r,i,o,a,s;if(1===t.nodeType){if(se.hasData(e)&&(s=se.get(e).events))for(i in se.remove(t,"handle events"),s)for(n=0,r=s[i].length;n<r;n++)S.event.add(t,i,s[i][n]);ue.hasData(e)&&(o=ue.access(e),a=S.extend({},o),ue.set(t,a))}}function Ue(e,t){var n=t.nodeName.toLowerCase();"input"===n&&Se.test(e.type)?t.checked=e.checked:"input"!==n&&"textarea"!==n||(t.defaultValue=e.defaultValue)}function $e(e,t,n,r){t=u(t);var i,o,a,s,c,l,h=0,f=e.length,d=f-1,p=t[0],g=v(p);if(g||f>1&&"string"==typeof p&&!m.checkClone&&je.test(p))return e.each((function(i){var o=e.eq(i);g&&(t[0]=p.call(this,i,o.html())),$e(o,t,n,r)}));if(f&&(o=(i=Me(t,e[0].ownerDocument,!1,e,r)).firstChild,1===i.childNodes.length&&(i=o),o||r)){for(s=(a=S.map(Re(i,"script"),Fe)).length;h<f;h++)c=i,h!==d&&(c=S.clone(c,!0,!0),s&&S.merge(a,Re(c,"script"))),n.call(e[h],c,h);if(s)for(l=a[a.length-1].ownerDocument,S.map(a,qe),h=0;h<s;h++)c=a[h],Ae.test(c.type||"")&&!se.access(c,"globalEval")&&S.contains(l,c)&&(c.src&&"module"!==(c.type||"").toLowerCase()?S._evalUrl&&!c.noModule&&S._evalUrl(c.src,{nonce:c.nonce||c.getAttribute("nonce")},l):w(c.textContent.replace(ze,""),c,l))}return e}function We(e,t,n){for(var r,i=t?S.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||S.cleanData(Re(r)),r.parentNode&&(n&&me(r)&&Ne(Re(r,"script")),r.parentNode.removeChild(r));return e}S.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var r,i,o,a,s=e.cloneNode(!0),u=me(e);if(!(m.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||S.isXMLDoc(e)))for(a=Re(s),r=0,i=(o=Re(e)).length;r<i;r++)Ue(o[r],a[r]);if(t)if(n)for(o=o||Re(e),a=a||Re(s),r=0,i=o.length;r<i;r++)Ge(o[r],a[r]);else Ge(e,s);return(a=Re(s,"script")).length>0&&Ne(a,!u&&Re(e,"script")),s},cleanData:function(e){for(var t,n,r,i=S.event.special,o=0;void 0!==(n=e[o]);o++)if(oe(n)){if(t=n[se.expando]){if(t.events)for(r in t.events)i[r]?S.event.remove(n,r):S.removeEvent(n,r,t.handle);n[se.expando]=void 0}n[ue.expando]&&(n[ue.expando]=void 0)}}}),S.fn.extend({detach:function(e){return We(this,e,!0)},remove:function(e){return We(this,e)},text:function(e){return ee(this,(function(e){return void 0===e?S.text(this):this.empty().each((function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)}))}),null,e,arguments.length)},append:function(){return $e(this,arguments,(function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||He(this,e).appendChild(e)}))},prepend:function(){return $e(this,arguments,(function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=He(this,e);t.insertBefore(e,t.firstChild)}}))},before:function(){return $e(this,arguments,(function(e){this.parentNode&&this.parentNode.insertBefore(e,this)}))},after:function(){return $e(this,arguments,(function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)}))},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(S.cleanData(Re(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map((function(){return S.clone(this,e,t)}))},html:function(e){return ee(this,(function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Ve.test(e)&&!Ee[(Te.exec(e)||["",""])[1].toLowerCase()]){e=S.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(S.cleanData(Re(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)}),null,e,arguments.length)},replaceWith:function(){var e=[];return $e(this,arguments,(function(t){var n=this.parentNode;S.inArray(this,e)<0&&(S.cleanData(Re(this)),n&&n.replaceChild(t,this))}),e)}}),S.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},(function(e,t){S.fn[e]=function(e){for(var n,r=[],i=S(e),o=i.length-1,a=0;a<=o;a++)n=a===o?this:this.clone(!0),S(i[a])[t](n),c.apply(r,n.get());return this.pushStack(r)}}));var Ze=new RegExp("^("+fe+")(?!px)[a-z%]+$","i"),Xe=/^--/,Ye=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=r),t.getComputedStyle(e)},Ke=function(e,t,n){var r,i,o={};for(i in t)o[i]=e.style[i],e.style[i]=t[i];for(i in r=n.call(e),t)e.style[i]=o[i];return r},Je=new RegExp(pe.join("|"),"i");function Qe(e,t,n){var r,i,o,a,s=Xe.test(t),u=e.style;return(n=n||Ye(e))&&(a=n.getPropertyValue(t)||n[t],s&&a&&(a=a.replace(M,"$1")||void 0),""!==a||me(e)||(a=S.style(e,t)),!m.pixelBoxStyles()&&Ze.test(a)&&Je.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=n.width,u.width=r,u.minWidth=i,u.maxWidth=o)),void 0!==a?a+"":a}function et(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){c.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",ge.appendChild(c).appendChild(l);var e=r.getComputedStyle(l);n="1%"!==e.top,u=12===t(e.marginLeft),l.style.right="60%",a=36===t(e.right),i=36===t(e.width),l.style.position="absolute",o=12===t(l.offsetWidth/3),ge.removeChild(c),l=null}}function t(e){return Math.round(parseFloat(e))}var n,i,o,a,s,u,c=x.createElement("div"),l=x.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",m.clearCloneStyle="content-box"===l.style.backgroundClip,S.extend(m,{boxSizingReliable:function(){return e(),i},pixelBoxStyles:function(){return e(),a},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),u},scrollboxSize:function(){return e(),o},reliableTrDimensions:function(){var e,t,n,i;return null==s&&(e=x.createElement("table"),t=x.createElement("tr"),n=x.createElement("div"),e.style.cssText="position:absolute;left:-11111px;border-collapse:separate",t.style.cssText="box-sizing:content-box;border:1px solid",t.style.height="1px",n.style.height="9px",n.style.display="block",ge.appendChild(e).appendChild(t).appendChild(n),i=r.getComputedStyle(t),s=parseInt(i.height,10)+parseInt(i.borderTopWidth,10)+parseInt(i.borderBottomWidth,10)===t.offsetHeight,ge.removeChild(e)),s}}))}();var tt=["Webkit","Moz","ms"],nt=x.createElement("div").style,rt={};function it(e){var t=S.cssProps[e]||rt[e];return t||(e in nt?e:rt[e]=function(e){for(var t=e[0].toUpperCase()+e.slice(1),n=tt.length;n--;)if((e=tt[n]+t)in nt)return e}(e)||e)}var ot=/^(none|table(?!-c[ea]).+)/,at={position:"absolute",visibility:"hidden",display:"block"},st={letterSpacing:"0",fontWeight:"400"};function ut(e,t,n){var r=de.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function ct(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0,c=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(c+=S.css(e,n+pe[a],!0,i)),r?("content"===n&&(u-=S.css(e,"padding"+pe[a],!0,i)),"margin"!==n&&(u-=S.css(e,"border"+pe[a]+"Width",!0,i))):(u+=S.css(e,"padding"+pe[a],!0,i),"padding"!==n?u+=S.css(e,"border"+pe[a]+"Width",!0,i):s+=S.css(e,"border"+pe[a]+"Width",!0,i));return!r&&o>=0&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))||0),u+c}function lt(e,t,n){var r=Ye(e),i=(!m.boxSizingReliable()||n)&&"border-box"===S.css(e,"boxSizing",!1,r),o=i,a=Qe(e,t,r),s="offset"+t[0].toUpperCase()+t.slice(1);if(Ze.test(a)){if(!n)return a;a="auto"}return(!m.boxSizingReliable()&&i||!m.reliableTrDimensions()&&A(e,"tr")||"auto"===a||!parseFloat(a)&&"inline"===S.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===S.css(e,"boxSizing",!1,r),(o=s in e)&&(a=e[s])),(a=parseFloat(a)||0)+ct(e,t,n||(i?"border":"content"),o,r,a)+"px"}function ht(e,t,n,r,i){return new ht.prototype.init(e,t,n,r,i)}S.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Qe(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=ie(t),u=Xe.test(t),c=e.style;if(u||(t=it(s)),a=S.cssHooks[t]||S.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:c[t];"string"===(o=typeof n)&&(i=de.exec(n))&&i[1]&&(n=xe(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||u||(n+=i&&i[3]||(S.cssNumber[s]?"":"px")),m.clearCloneStyle||""!==n||0!==t.indexOf("background")||(c[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?c.setProperty(t,n):c[t]=n))}},css:function(e,t,n,r){var i,o,a,s=ie(t);return Xe.test(t)||(t=it(s)),(a=S.cssHooks[t]||S.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Qe(e,t,r)),"normal"===i&&t in st&&(i=st[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),S.each(["height","width"],(function(e,t){S.cssHooks[t]={get:function(e,n,r){if(n)return!ot.test(S.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?lt(e,t,r):Ke(e,at,(function(){return lt(e,t,r)}))},set:function(e,n,r){var i,o=Ye(e),a=!m.scrollboxSize()&&"absolute"===o.position,s=(a||r)&&"border-box"===S.css(e,"boxSizing",!1,o),u=r?ct(e,t,r,s,o):0;return s&&a&&(u-=Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(o[t])-ct(e,t,"border",!1,o)-.5)),u&&(i=de.exec(n))&&"px"!==(i[3]||"px")&&(e.style[t]=n,n=S.css(e,t)),ut(0,n,u)}}})),S.cssHooks.marginLeft=et(m.reliableMarginLeft,(function(e,t){if(t)return(parseFloat(Qe(e,"marginLeft"))||e.getBoundingClientRect().left-Ke(e,{marginLeft:0},(function(){return e.getBoundingClientRect().left})))+"px"})),S.each({margin:"",padding:"",border:"Width"},(function(e,t){S.cssHooks[e+t]={expand:function(n){for(var r=0,i={},o="string"==typeof n?n.split(" "):[n];r<4;r++)i[e+pe[r]+t]=o[r]||o[r-2]||o[0];return i}},"margin"!==e&&(S.cssHooks[e+t].set=ut)})),S.fn.extend({css:function(e,t){return ee(this,(function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=Ye(e),i=t.length;a<i;a++)o[t[a]]=S.css(e,t[a],!1,r);return o}return void 0!==n?S.style(e,t,n):S.css(e,t)}),e,t,arguments.length>1)}}),S.Tween=ht,ht.prototype={constructor:ht,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||S.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(S.cssNumber[n]?"":"px")},cur:function(){var e=ht.propHooks[this.prop];return e&&e.get?e.get(this):ht.propHooks._default.get(this)},run:function(e){var t,n=ht.propHooks[this.prop];return this.options.duration?this.pos=t=S.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):ht.propHooks._default.set(this),this}},ht.prototype.init.prototype=ht.prototype,ht.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=S.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){S.fx.step[e.prop]?S.fx.step[e.prop](e):1!==e.elem.nodeType||!S.cssHooks[e.prop]&&null==e.elem.style[it(e.prop)]?e.elem[e.prop]=e.now:S.style(e.elem,e.prop,e.now+e.unit)}}},ht.propHooks.scrollTop=ht.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},S.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},S.fx=ht.prototype.init,S.fx.step={};var ft,dt,pt=/^(?:toggle|show|hide)$/,gt=/queueHooks$/;function mt(){dt&&(!1===x.hidden&&r.requestAnimationFrame?r.requestAnimationFrame(mt):r.setTimeout(mt,S.fx.interval),S.fx.tick())}function vt(){return r.setTimeout((function(){ft=void 0})),ft=Date.now()}function yt(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=pe[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function xt(e,t,n){for(var r,i=(bt.tweeners[t]||[]).concat(bt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function bt(e,t,n){var r,i,o=0,a=bt.prefilters.length,s=S.Deferred().always((function(){delete u.elem})),u=function(){if(i)return!1;for(var t=ft||vt(),n=Math.max(0,c.startTime+c.duration-t),r=1-(n/c.duration||0),o=0,a=c.tweens.length;o<a;o++)c.tweens[o].run(r);return s.notifyWith(e,[c,r,n]),r<1&&a?n:(a||s.notifyWith(e,[c,1,0]),s.resolveWith(e,[c]),!1)},c=s.promise({elem:e,props:S.extend({},t),opts:S.extend(!0,{specialEasing:{},easing:S.easing._default},n),originalProperties:t,originalOptions:n,startTime:ft||vt(),duration:n.duration,tweens:[],createTween:function(t,n){var r=S.Tween(e,c.opts,t,n,c.opts.specialEasing[t]||c.opts.easing);return c.tweens.push(r),r},stop:function(t){var n=0,r=t?c.tweens.length:0;if(i)return this;for(i=!0;n<r;n++)c.tweens[n].run(1);return t?(s.notifyWith(e,[c,1,0]),s.resolveWith(e,[c,t])):s.rejectWith(e,[c,t]),this}}),l=c.props;for(!function(e,t){var n,r,i,o,a;for(n in e)if(i=t[r=ie(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=S.cssHooks[r])&&"expand"in a)for(n in o=a.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(l,c.opts.specialEasing);o<a;o++)if(r=bt.prefilters[o].call(c,e,l,c.opts))return v(r.stop)&&(S._queueHooks(c.elem,c.opts.queue).stop=r.stop.bind(r)),r;return S.map(l,xt,c),v(c.opts.start)&&c.opts.start.call(e,c),c.progress(c.opts.progress).done(c.opts.done,c.opts.complete).fail(c.opts.fail).always(c.opts.always),S.fx.timer(S.extend(u,{elem:e,anim:c,queue:c.opts.queue})),c}S.Animation=S.extend(bt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return xe(n.elem,e,de.exec(t),n),n}]},tweener:function(e,t){v(e)?(t=e,e=["*"]):e=e.match(W);for(var n,r=0,i=e.length;r<i;r++)n=e[r],bt.tweeners[n]=bt.tweeners[n]||[],bt.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,a,s,u,c,l,h="width"in t||"height"in t,f=this,d={},p=e.style,g=e.nodeType&&ye(e),m=se.get(e,"fxshow");for(r in n.queue||(null==(a=S._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,f.always((function(){f.always((function(){a.unqueued--,S.queue(e,"fx").length||a.empty.fire()}))}))),t)if(i=t[r],pt.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!m||void 0===m[r])continue;g=!0}d[r]=m&&m[r]||S.style(e,r)}if((u=!S.isEmptyObject(t))||!S.isEmptyObject(d))for(r in h&&1===e.nodeType&&(n.overflow=[p.overflow,p.overflowX,p.overflowY],null==(c=m&&m.display)&&(c=se.get(e,"display")),"none"===(l=S.css(e,"display"))&&(c?l=c:(_e([e],!0),c=e.style.display||c,l=S.css(e,"display"),_e([e]))),("inline"===l||"inline-block"===l&&null!=c)&&"none"===S.css(e,"float")&&(u||(f.done((function(){p.display=c})),null==c&&(l=p.display,c="none"===l?"":l)),p.display="inline-block")),n.overflow&&(p.overflow="hidden",f.always((function(){p.overflow=n.overflow[0],p.overflowX=n.overflow[1],p.overflowY=n.overflow[2]}))),u=!1,d)u||(m?"hidden"in m&&(g=m.hidden):m=se.access(e,"fxshow",{display:c}),o&&(m.hidden=!g),g&&_e([e],!0),f.done((function(){for(r in g||_e([e]),se.remove(e,"fxshow"),d)S.style(e,r,d[r])}))),u=xt(g?m[r]:0,r,f),r in m||(m[r]=u.start,g&&(u.end=u.start,u.start=0))}],prefilter:function(e,t){t?bt.prefilters.unshift(e):bt.prefilters.push(e)}}),S.speed=function(e,t,n){var r=e&&"object"==typeof e?S.extend({},e):{complete:n||!n&&t||v(e)&&e,duration:e,easing:n&&t||t&&!v(t)&&t};return S.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in S.fx.speeds?r.duration=S.fx.speeds[r.duration]:r.duration=S.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){v(r.old)&&r.old.call(this),r.queue&&S.dequeue(this,r.queue)},r},S.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ye).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=S.isEmptyObject(e),o=S.speed(t,n,r),a=function(){var t=bt(this,S.extend({},e),o);(i||se.get(this,"finish"))&&t.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=void 0),t&&this.queue(e||"fx",[]),this.each((function(){var t=!0,i=null!=e&&e+"queueHooks",o=S.timers,a=se.get(this);if(i)a[i]&&a[i].stop&&r(a[i]);else for(i in a)a[i]&&a[i].stop&&gt.test(i)&&r(a[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));!t&&n||S.dequeue(this,e)}))},finish:function(e){return!1!==e&&(e=e||"fx"),this.each((function(){var t,n=se.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=S.timers,a=r?r.length:0;for(n.finish=!0,S.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;t<a;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish}))}}),S.each(["toggle","show","hide"],(function(e,t){var n=S.fn[t];S.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(yt(t,!0),e,r,i)}})),S.each({slideDown:yt("show"),slideUp:yt("hide"),slideToggle:yt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},(function(e,t){S.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}})),S.timers=[],S.fx.tick=function(){var e,t=0,n=S.timers;for(ft=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||S.fx.stop(),ft=void 0},S.fx.timer=function(e){S.timers.push(e),S.fx.start()},S.fx.interval=13,S.fx.start=function(){dt||(dt=!0,mt())},S.fx.stop=function(){dt=null},S.fx.speeds={slow:600,fast:200,_default:400},S.fn.delay=function(e,t){return e=S.fx&&S.fx.speeds[e]||e,t=t||"fx",this.queue(t,(function(t,n){var i=r.setTimeout(t,e);n.stop=function(){r.clearTimeout(i)}}))},function(){var e=x.createElement("input"),t=x.createElement("select").appendChild(x.createElement("option"));e.type="checkbox",m.checkOn=""!==e.value,m.optSelected=t.selected,(e=x.createElement("input")).value="t",e.type="radio",m.radioValue="t"===e.value}();var wt,_t=S.expr.attrHandle;S.fn.extend({attr:function(e,t){return ee(this,S.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each((function(){S.removeAttr(this,e)}))}}),S.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return void 0===e.getAttribute?S.prop(e,t,n):(1===o&&S.isXMLDoc(e)||(i=S.attrHooks[t.toLowerCase()]||(S.expr.match.bool.test(t)?wt:void 0)),void 0!==n?null===n?void S.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=S.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!m.radioValue&&"radio"===t&&A(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(W);if(i&&1===e.nodeType)for(;n=i[r++];)e.removeAttribute(n)}}),wt={set:function(e,t,n){return!1===t?S.removeAttr(e,n):e.setAttribute(n,n),n}},S.each(S.expr.match.bool.source.match(/\\w+/g),(function(e,t){var n=_t[t]||S.find.attr;_t[t]=function(e,t,r){var i,o,a=t.toLowerCase();return r||(o=_t[a],_t[a]=i,i=null!=n(e,t,r)?a:null,_t[a]=o),i}}));var kt=/^(?:input|select|textarea|button)$/i,Ct=/^(?:a|area)$/i;function St(e){return(e.match(W)||[]).join(" ")}function Tt(e){return e.getAttribute&&e.getAttribute("class")||""}function At(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(W)||[]}S.fn.extend({prop:function(e,t){return ee(this,S.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each((function(){delete this[S.propFix[e]||e]}))}}),S.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&S.isXMLDoc(e)||(t=S.propFix[t]||t,i=S.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=S.find.attr(e,"tabindex");return t?parseInt(t,10):kt.test(e.nodeName)||Ct.test(e.nodeName)&&e.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),m.optSelected||(S.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),S.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],(function(){S.propFix[this.toLowerCase()]=this})),S.fn.extend({addClass:function(e){var t,n,r,i,o,a;return v(e)?this.each((function(t){S(this).addClass(e.call(this,t,Tt(this)))})):(t=At(e)).length?this.each((function(){if(r=Tt(this),n=1===this.nodeType&&" "+St(r)+" "){for(o=0;o<t.length;o++)i=t[o],n.indexOf(" "+i+" ")<0&&(n+=i+" ");a=St(n),r!==a&&this.setAttribute("class",a)}})):this},removeClass:function(e){var t,n,r,i,o,a;return v(e)?this.each((function(t){S(this).removeClass(e.call(this,t,Tt(this)))})):arguments.length?(t=At(e)).length?this.each((function(){if(r=Tt(this),n=1===this.nodeType&&" "+St(r)+" "){for(o=0;o<t.length;o++)for(i=t[o];n.indexOf(" "+i+" ")>-1;)n=n.replace(" "+i+" "," ");a=St(n),r!==a&&this.setAttribute("class",a)}})):this:this.attr("class","")},toggleClass:function(e,t){var n,r,i,o,a=typeof e,s="string"===a||Array.isArray(e);return v(e)?this.each((function(n){S(this).toggleClass(e.call(this,n,Tt(this),t),t)})):"boolean"==typeof t&&s?t?this.addClass(e):this.removeClass(e):(n=At(e),this.each((function(){if(s)for(o=S(this),i=0;i<n.length;i++)r=n[i],o.hasClass(r)?o.removeClass(r):o.addClass(r);else void 0!==e&&"boolean"!==a||((r=Tt(this))&&se.set(this,"__className__",r),this.setAttribute&&this.setAttribute("class",r||!1===e?"":se.get(this,"__className__")||""))})))},hasClass:function(e){var t,n,r=0;for(t=" "+e+" ";n=this[r++];)if(1===n.nodeType&&(" "+St(Tt(n))+" ").indexOf(t)>-1)return!0;return!1}});var Et=/\\r/g;S.fn.extend({val:function(e){var t,n,r,i=this[0];return arguments.length?(r=v(e),this.each((function(n){var i;1===this.nodeType&&(null==(i=r?e.call(this,n,S(this).val()):e)?i="":"number"==typeof i?i+="":Array.isArray(i)&&(i=S.map(i,(function(e){return null==e?"":e+""}))),(t=S.valHooks[this.type]||S.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&void 0!==t.set(this,i,"value")||(this.value=i))}))):i?(t=S.valHooks[i.type]||S.valHooks[i.nodeName.toLowerCase()])&&"get"in t&&void 0!==(n=t.get(i,"value"))?n:"string"==typeof(n=i.value)?n.replace(Et,""):null==n?"":n:void 0}}),S.extend({valHooks:{option:{get:function(e){var t=S.find.attr(e,"value");return null!=t?t:St(S.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!A(n.parentNode,"optgroup"))){if(t=S(n).val(),a)return t;s.push(t)}return s},set:function(e,t){for(var n,r,i=e.options,o=S.makeArray(t),a=i.length;a--;)((r=i[a]).selected=S.inArray(S.valHooks.option.get(r),o)>-1)&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),S.each(["radio","checkbox"],(function(){S.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=S.inArray(S(e).val(),t)>-1}},m.checkOn||(S.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})}));var Rt=r.location,Nt={guid:Date.now()},Pt=/\\?/;S.parseXML=function(e){var t,n;if(!e||"string"!=typeof e)return null;try{t=(new r.DOMParser).parseFromString(e,"text/xml")}catch(e){}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||S.error("Invalid XML: "+(n?S.map(n.childNodes,(function(e){return e.textContent})).join("\\n"):e)),t};var Mt=/^(?:focusinfocus|focusoutblur)$/,Dt=function(e){e.stopPropagation()};S.extend(S.event,{trigger:function(e,t,n,i){var o,a,s,u,c,l,h,f,p=[n||x],g=d.call(e,"type")?e.type:e,m=d.call(e,"namespace")?e.namespace.split("."):[];if(a=f=s=n=n||x,3!==n.nodeType&&8!==n.nodeType&&!Mt.test(g+S.event.triggered)&&(g.indexOf(".")>-1&&(m=g.split("."),g=m.shift(),m.sort()),c=g.indexOf(":")<0&&"on"+g,(e=e[S.expando]?e:new S.Event(g,"object"==typeof e&&e)).isTrigger=i?2:3,e.namespace=m.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\\\.)"+m.join("\\\\.(?:.*\\\\.|)")+"(\\\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=null==t?[e]:S.makeArray(t,[e]),h=S.event.special[g]||{},i||!h.trigger||!1!==h.trigger.apply(n,t))){if(!i&&!h.noBubble&&!y(n)){for(u=h.delegateType||g,Mt.test(u+g)||(a=a.parentNode);a;a=a.parentNode)p.push(a),s=a;s===(n.ownerDocument||x)&&p.push(s.defaultView||s.parentWindow||r)}for(o=0;(a=p[o++])&&!e.isPropagationStopped();)f=a,e.type=o>1?u:h.bindType||g,(l=(se.get(a,"events")||Object.create(null))[e.type]&&se.get(a,"handle"))&&l.apply(a,t),(l=c&&a[c])&&l.apply&&oe(a)&&(e.result=l.apply(a,t),!1===e.result&&e.preventDefault());return e.type=g,i||e.isDefaultPrevented()||h._default&&!1!==h._default.apply(p.pop(),t)||!oe(n)||c&&v(n[g])&&!y(n)&&((s=n[c])&&(n[c]=null),S.event.triggered=g,e.isPropagationStopped()&&f.addEventListener(g,Dt),n[g](),e.isPropagationStopped()&&f.removeEventListener(g,Dt),S.event.triggered=void 0,s&&(n[c]=s)),e.result}},simulate:function(e,t,n){var r=S.extend(new S.Event,n,{type:e,isSimulated:!0});S.event.trigger(r,null,t)}}),S.fn.extend({trigger:function(e,t){return this.each((function(){S.event.trigger(e,t,this)}))},triggerHandler:function(e,t){var n=this[0];if(n)return S.event.trigger(e,t,n,!0)}});var Lt=/\\[\\]$/,Ot=/\\r?\\n/g,It=/^(?:submit|button|image|reset|file)$/i,Bt=/^(?:input|select|textarea|keygen)/i;function Vt(e,t,n,r){var i;if(Array.isArray(t))S.each(t,(function(t,i){n||Lt.test(e)?r(e,i):Vt(e+"["+("object"==typeof i&&null!=i?t:"")+"]",i,n,r)}));else if(n||"object"!==_(t))r(e,t);else for(i in t)Vt(e+"["+i+"]",t[i],n,r)}S.param=function(e,t){var n,r=[],i=function(e,t){var n=v(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!S.isPlainObject(e))S.each(e,(function(){i(this.name,this.value)}));else for(n in e)Vt(n,e[n],t,i);return r.join("&")},S.fn.extend({serialize:function(){return S.param(this.serializeArray())},serializeArray:function(){return this.map((function(){var e=S.prop(this,"elements");return e?S.makeArray(e):this})).filter((function(){var e=this.type;return this.name&&!S(this).is(":disabled")&&Bt.test(this.nodeName)&&!It.test(e)&&(this.checked||!Se.test(e))})).map((function(e,t){var n=S(this).val();return null==n?null:Array.isArray(n)?S.map(n,(function(e){return{name:t.name,value:e.replace(Ot,"\\r\\n")}})):{name:t.name,value:n.replace(Ot,"\\r\\n")}})).get()}});var jt=/%20/g,zt=/#.*$/,Ht=/([?&])_=[^&]*/,Ft=/^(.*?):[ \\t]*([^\\r\\n]*)$/gm,qt=/^(?:GET|HEAD)$/,Gt=/^\\/\\//,Ut={},$t={},Wt="*/".concat("*"),Zt=x.createElement("a");function Xt(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(W)||[];if(v(n))for(;r=o[i++];)"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function Yt(e,t,n,r){var i={},o=e===$t;function a(s){var u;return i[s]=!0,S.each(e[s]||[],(function(e,s){var c=s(t,n,r);return"string"!=typeof c||o||i[c]?o?!(u=c):void 0:(t.dataTypes.unshift(c),a(c),!1)})),u}return a(t.dataTypes[0])||!i["*"]&&a("*")}function Kt(e,t){var n,r,i=S.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&S.extend(!0,e,r),e}Zt.href=Rt.href,S.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Rt.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Rt.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Wt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\\bxml\\b/,html:/\\bhtml/,json:/\\bjson\\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":S.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Kt(Kt(e,S.ajaxSettings),t):Kt(S.ajaxSettings,e)},ajaxPrefilter:Xt(Ut),ajaxTransport:Xt($t),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var n,i,o,a,s,u,c,l,h,f,d=S.ajaxSetup({},t),p=d.context||d,g=d.context&&(p.nodeType||p.jquery)?S(p):S.event,m=S.Deferred(),v=S.Callbacks("once memory"),y=d.statusCode||{},b={},w={},_="canceled",k={readyState:0,getResponseHeader:function(e){var t;if(c){if(!a)for(a={};t=Ft.exec(o);)a[t[1].toLowerCase()+" "]=(a[t[1].toLowerCase()+" "]||[]).concat(t[2]);t=a[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return c?o:null},setRequestHeader:function(e,t){return null==c&&(e=w[e.toLowerCase()]=w[e.toLowerCase()]||e,b[e]=t),this},overrideMimeType:function(e){return null==c&&(d.mimeType=e),this},statusCode:function(e){var t;if(e)if(c)k.always(e[k.status]);else for(t in e)y[t]=[y[t],e[t]];return this},abort:function(e){var t=e||_;return n&&n.abort(t),C(0,t),this}};if(m.promise(k),d.url=((e||d.url||Rt.href)+"").replace(Gt,Rt.protocol+"//"),d.type=t.method||t.type||d.method||d.type,d.dataTypes=(d.dataType||"*").toLowerCase().match(W)||[""],null==d.crossDomain){u=x.createElement("a");try{u.href=d.url,u.href=u.href,d.crossDomain=Zt.protocol+"//"+Zt.host!=u.protocol+"//"+u.host}catch(e){d.crossDomain=!0}}if(d.data&&d.processData&&"string"!=typeof d.data&&(d.data=S.param(d.data,d.traditional)),Yt(Ut,d,t,k),c)return k;for(h in(l=S.event&&d.global)&&0==S.active++&&S.event.trigger("ajaxStart"),d.type=d.type.toUpperCase(),d.hasContent=!qt.test(d.type),i=d.url.replace(zt,""),d.hasContent?d.data&&d.processData&&0===(d.contentType||"").indexOf("application/x-www-form-urlencoded")&&(d.data=d.data.replace(jt,"+")):(f=d.url.slice(i.length),d.data&&(d.processData||"string"==typeof d.data)&&(i+=(Pt.test(i)?"&":"?")+d.data,delete d.data),!1===d.cache&&(i=i.replace(Ht,"$1"),f=(Pt.test(i)?"&":"?")+"_="+Nt.guid+++f),d.url=i+f),d.ifModified&&(S.lastModified[i]&&k.setRequestHeader("If-Modified-Since",S.lastModified[i]),S.etag[i]&&k.setRequestHeader("If-None-Match",S.etag[i])),(d.data&&d.hasContent&&!1!==d.contentType||t.contentType)&&k.setRequestHeader("Content-Type",d.contentType),k.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+("*"!==d.dataTypes[0]?", "+Wt+"; q=0.01":""):d.accepts["*"]),d.headers)k.setRequestHeader(h,d.headers[h]);if(d.beforeSend&&(!1===d.beforeSend.call(p,k,d)||c))return k.abort();if(_="abort",v.add(d.complete),k.done(d.success),k.fail(d.error),n=Yt($t,d,t,k)){if(k.readyState=1,l&&g.trigger("ajaxSend",[k,d]),c)return k;d.async&&d.timeout>0&&(s=r.setTimeout((function(){k.abort("timeout")}),d.timeout));try{c=!1,n.send(b,C)}catch(e){if(c)throw e;C(-1,e)}}else C(-1,"No Transport");function C(e,t,a,u){var h,f,x,b,w,_=t;c||(c=!0,s&&r.clearTimeout(s),n=void 0,o=u||"",k.readyState=e>0?4:0,h=e>=200&&e<300||304===e,a&&(b=function(e,t,n){for(var r,i,o,a,s=e.contents,u=e.dataTypes;"*"===u[0];)u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}(d,k,a)),!h&&S.inArray("script",d.dataTypes)>-1&&S.inArray("json",d.dataTypes)<0&&(d.converters["text script"]=function(){}),b=function(e,t,n,r){var i,o,a,s,u,c={},l=e.dataTypes.slice();if(l[1])for(a in e.converters)c[a.toLowerCase()]=e.converters[a];for(o=l.shift();o;)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=l.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=c[u+" "+o]||c["* "+o]))for(i in c)if((s=i.split(" "))[1]===o&&(a=c[u+" "+s[0]]||c["* "+s[0]])){!0===a?a=c[i]:!0!==c[i]&&(o=s[0],l.unshift(s[1]));break}if(!0!==a)if(a&&e.throws)t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}(d,b,k,h),h?(d.ifModified&&((w=k.getResponseHeader("Last-Modified"))&&(S.lastModified[i]=w),(w=k.getResponseHeader("etag"))&&(S.etag[i]=w)),204===e||"HEAD"===d.type?_="nocontent":304===e?_="notmodified":(_=b.state,f=b.data,h=!(x=b.error))):(x=_,!e&&_||(_="error",e<0&&(e=0))),k.status=e,k.statusText=(t||_)+"",h?m.resolveWith(p,[f,_,k]):m.rejectWith(p,[k,_,x]),k.statusCode(y),y=void 0,l&&g.trigger(h?"ajaxSuccess":"ajaxError",[k,d,h?f:x]),v.fireWith(p,[k,_]),l&&(g.trigger("ajaxComplete",[k,d]),--S.active||S.event.trigger("ajaxStop")))}return k},getJSON:function(e,t,n){return S.get(e,t,n,"json")},getScript:function(e,t){return S.get(e,void 0,t,"script")}}),S.each(["get","post"],(function(e,t){S[t]=function(e,n,r,i){return v(n)&&(i=i||r,r=n,n=void 0),S.ajax(S.extend({url:e,type:t,dataType:i,data:n,success:r},S.isPlainObject(e)&&e))}})),S.ajaxPrefilter((function(e){var t;for(t in e.headers)"content-type"===t.toLowerCase()&&(e.contentType=e.headers[t]||"")})),S._evalUrl=function(e,t,n){return S.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){S.globalEval(e,t,n)}})},S.fn.extend({wrapAll:function(e){var t;return this[0]&&(v(e)&&(e=e.call(this[0])),t=S(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map((function(){for(var e=this;e.firstElementChild;)e=e.firstElementChild;return e})).append(this)),this},wrapInner:function(e){return v(e)?this.each((function(t){S(this).wrapInner(e.call(this,t))})):this.each((function(){var t=S(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)}))},wrap:function(e){var t=v(e);return this.each((function(n){S(this).wrapAll(t?e.call(this,n):e)}))},unwrap:function(e){return this.parent(e).not("body").each((function(){S(this).replaceWith(this.childNodes)})),this}}),S.expr.pseudos.hidden=function(e){return!S.expr.pseudos.visible(e)},S.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},S.ajaxSettings.xhr=function(){try{return new r.XMLHttpRequest}catch(e){}};var Jt={0:200,1223:204},Qt=S.ajaxSettings.xhr();m.cors=!!Qt&&"withCredentials"in Qt,m.ajax=Qt=!!Qt,S.ajaxTransport((function(e){var t,n;if(m.cors||Qt&&!e.crossDomain)return{send:function(i,o){var a,s=e.xhr();if(s.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(a in e.xhrFields)s[a]=e.xhrFields[a];for(a in e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),e.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest"),i)s.setRequestHeader(a,i[a]);t=function(e){return function(){t&&(t=n=s.onload=s.onerror=s.onabort=s.ontimeout=s.onreadystatechange=null,"abort"===e?s.abort():"error"===e?"number"!=typeof s.status?o(0,"error"):o(s.status,s.statusText):o(Jt[s.status]||s.status,s.statusText,"text"!==(s.responseType||"text")||"string"!=typeof s.responseText?{binary:s.response}:{text:s.responseText},s.getAllResponseHeaders()))}},s.onload=t(),n=s.onerror=s.ontimeout=t("error"),void 0!==s.onabort?s.onabort=n:s.onreadystatechange=function(){4===s.readyState&&r.setTimeout((function(){t&&n()}))},t=t("abort");try{s.send(e.hasContent&&e.data||null)}catch(e){if(t)throw e}},abort:function(){t&&t()}}})),S.ajaxPrefilter((function(e){e.crossDomain&&(e.contents.script=!1)})),S.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\\b(?:java|ecma)script\\b/},converters:{"text script":function(e){return S.globalEval(e),e}}}),S.ajaxPrefilter("script",(function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")})),S.ajaxTransport("script",(function(e){var t,n;if(e.crossDomain||e.scriptAttrs)return{send:function(r,i){t=S("<script>").attr(e.scriptAttrs||{}).prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&i("error"===e.type?404:200,e.type)}),x.head.appendChild(t[0])},abort:function(){n&&n()}}}));var en,tn=[],nn=/(=)\\?(?=&|$)|\\?\\?/;S.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=tn.pop()||S.expando+"_"+Nt.guid++;return this[e]=!0,e}}),S.ajaxPrefilter("json jsonp",(function(e,t,n){var i,o,a,s=!1!==e.jsonp&&(nn.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&nn.test(e.data)&&"data");if(s||"jsonp"===e.dataTypes[0])return i=e.jsonpCallback=v(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,s?e[s]=e[s].replace(nn,"$1"+i):!1!==e.jsonp&&(e.url+=(Pt.test(e.url)?"&":"?")+e.jsonp+"="+i),e.converters["script json"]=function(){return a||S.error(i+" was not called"),a[0]},e.dataTypes[0]="json",o=r[i],r[i]=function(){a=arguments},n.always((function(){void 0===o?S(r).removeProp(i):r[i]=o,e[i]&&(e.jsonpCallback=t.jsonpCallback,tn.push(i)),a&&v(o)&&o(a[0]),a=o=void 0})),"script"})),m.createHTMLDocument=((en=x.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===en.childNodes.length),S.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(m.createHTMLDocument?((r=(t=x.implementation.createHTMLDocument("")).createElement("base")).href=x.location.href,t.head.appendChild(r)):t=x),o=!n&&[],(i=z.exec(e))?[t.createElement(i[1])]:(i=Me([e],t,o),o&&o.length&&S(o).remove(),S.merge([],i.childNodes)));var r,i,o},S.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return s>-1&&(r=St(e.slice(s)),e=e.slice(0,s)),v(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),a.length>0&&S.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done((function(e){o=arguments,a.html(r?S("<div>").append(S.parseHTML(e)).find(r):e)})).always(n&&function(e,t){a.each((function(){n.apply(this,o||[e.responseText,t,e])}))}),this},S.expr.pseudos.animated=function(e){return S.grep(S.timers,(function(t){return e===t.elem})).length},S.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,c=S.css(e,"position"),l=S(e),h={};"static"===c&&(e.style.position="relative"),s=l.offset(),o=S.css(e,"top"),u=S.css(e,"left"),("absolute"===c||"fixed"===c)&&(o+u).indexOf("auto")>-1?(a=(r=l.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),v(t)&&(t=t.call(e,n,S.extend({},s))),null!=t.top&&(h.top=t.top-s.top+a),null!=t.left&&(h.left=t.left-s.left+i),"using"in t?t.using.call(e,h):l.css(h)}},S.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each((function(t){S.offset.setOffset(this,e,t)}));var t,n,r=this[0];return r?r.getClientRects().length?(t=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===S.css(r,"position"))t=r.getBoundingClientRect();else{for(t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;e&&(e===n.body||e===n.documentElement)&&"static"===S.css(e,"position");)e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=S(e).offset()).top+=S.css(e,"borderTopWidth",!0),i.left+=S.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-S.css(r,"marginTop",!0),left:t.left-i.left-S.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map((function(){for(var e=this.offsetParent;e&&"static"===S.css(e,"position");)e=e.offsetParent;return e||ge}))}}),S.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},(function(e,t){var n="pageYOffset"===t;S.fn[e]=function(r){return ee(this,(function(e,r,i){var o;if(y(e)?o=e:9===e.nodeType&&(o=e.defaultView),void 0===i)return o?o[t]:e[r];o?o.scrollTo(n?o.pageXOffset:i,n?i:o.pageYOffset):e[r]=i}),e,r,arguments.length)}})),S.each(["top","left"],(function(e,t){S.cssHooks[t]=et(m.pixelPosition,(function(e,n){if(n)return n=Qe(e,t),Ze.test(n)?S(e).position()[t]+"px":n}))})),S.each({Height:"height",Width:"width"},(function(e,t){S.each({padding:"inner"+e,content:t,"":"outer"+e},(function(n,r){S.fn[r]=function(i,o){var a=arguments.length&&(n||"boolean"!=typeof i),s=n||(!0===i||!0===o?"margin":"border");return ee(this,(function(t,n,i){var o;return y(t)?0===r.indexOf("outer")?t["inner"+e]:t.document.documentElement["client"+e]:9===t.nodeType?(o=t.documentElement,Math.max(t.body["scroll"+e],o["scroll"+e],t.body["offset"+e],o["offset"+e],o["client"+e])):void 0===i?S.css(t,n,s):S.style(t,n,i,s)}),t,a?i:void 0,a)}}))})),S.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],(function(e,t){S.fn[t]=function(e){return this.on(t,e)}})),S.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.on("mouseenter",e).on("mouseleave",t||e)}}),S.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),(function(e,t){S.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}));var rn=/^[\\s\\uFEFF\\xA0]+|([^\\s\\uFEFF\\xA0])[\\s\\uFEFF\\xA0]+$/g;S.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),v(e))return r=s.call(arguments,2),i=function(){return e.apply(t||this,r.concat(s.call(arguments)))},i.guid=e.guid=e.guid||S.guid++,i},S.holdReady=function(e){e?S.readyWait++:S.ready(!0)},S.isArray=Array.isArray,S.parseJSON=JSON.parse,S.nodeName=A,S.isFunction=v,S.isWindow=y,S.camelCase=ie,S.type=_,S.now=Date.now,S.isNumeric=function(e){var t=S.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},S.trim=function(e){return null==e?"":(e+"").replace(rn,"$1")},void 0===(n=function(){return S}.apply(t,[]))||(e.exports=n);var on=r.jQuery,an=r.$;return S.noConflict=function(e){return r.$===S&&(r.$=an),e&&r.jQuery===S&&(r.jQuery=on),S},void 0===i&&(r.jQuery=r.$=S),S}))},8844:()=>{(function(){var _p={r:function(e){if(_p[e].inited)return _p[e].value;if("function"!=typeof _p[e].value)return _p[e].inited=!0,_p[e].value;var t={exports:{}},n=_p[e].value(null,t.exports,t);if(_p[e].inited=!0,_p[e].value=n,void 0!==n)return n;for(var r in t.exports)if(t.exports.hasOwnProperty(r))return _p[e].inited=!0,_p[e].value=t.exports,t.exports}};_p[0]={value:function(e){function t(e){var t=parseFloat(e,10);return/ms/.test(e)?t:/s/.test(e)?1e3*t:/min/.test(e)?60*t*1e3:t}var n=_p.r(8),r=_p.r(1),i=_p.r(11).createClass("Animator",{constructor:function(e,t,n){if(1==arguments.length){var r=arguments[0];this.beginValue=r.beginValue,this.finishValue=r.finishValue,this.setter=r.setter}else this.beginValue=e,this.finishValue=t,this.setter=n},start:function(e,n,r,i,o){2===arguments.length&&"object"==typeof n&&(r=n.easing,i=n.delay,o=n.callback,n=n.duration),4===arguments.length&&"function"==typeof i&&(o=i,i=0);var a=this.create(e,n,r,o);return(i=t(i))>0?setTimeout((function(){a.play()}),i):a.play(),a},create:function(e,o,a,s){var u;return o=o&&t(o)||i.DEFAULT_DURATION,"string"==typeof(a=a||i.DEFAULT_EASING)&&(a=r[a]),u=new n(this,e,o,a),"function"==typeof s&&u.on("finish",s),u},reverse:function(){return new i(this.finishValue,this.beginValue,this.setter)}});i.DEFAULT_DURATION=300,i.DEFAULT_EASING="linear";var o=_p.r(61);return _p.r(11).extendClass(o,{animate:function(e,t,n,r,i){var o=this._KityAnimateQueue=this._KityAnimateQueue||[],a=e.create(this,t,n,i);return a.on("finish",(function(){o.shift(),o.length&&setTimeout(o[0].t.play.bind(o[0].t),o[0].d)})),o.push({t:a,d:r}),1==o.length&&setTimeout(a.play.bind(a),r),this},timeline:function(){return this._KityAnimateQueue[0].t},stop:function(){var e=this._KityAnimateQueue;if(e)for(;e.length;)e.shift().t.stop();return this}}),i}},_p[1]={value:function(e,t,n){var r={linear:function(e,t,n,r){return n*(e/r)+t},swing:function(e,t,n,i){return r.easeOutQuad(e,t,n,i)},ease:function(e,t,n,i){return r.easeInOutCubic(e,t,n,i)},easeInQuad:function(e,t,n,r){return n*(e/=r)*e+t},easeOutQuad:function(e,t,n,r){return-n*(e/=r)*(e-2)+t},easeInOutQuad:function(e,t,n,r){return(e/=r/2)<1?n/2*e*e+t:-n/2*(--e*(e-2)-1)+t},easeInCubic:function(e,t,n,r){return n*(e/=r)*e*e+t},easeOutCubic:function(e,t,n,r){return n*((e=e/r-1)*e*e+1)+t},easeInOutCubic:function(e,t,n,r){return(e/=r/2)<1?n/2*e*e*e+t:n/2*((e-=2)*e*e+2)+t},easeInQuart:function(e,t,n,r){return n*(e/=r)*e*e*e+t},easeOutQuart:function(e,t,n,r){return-n*((e=e/r-1)*e*e*e-1)+t},easeInOutQuart:function(e,t,n,r){return(e/=r/2)<1?n/2*e*e*e*e+t:-n/2*((e-=2)*e*e*e-2)+t},easeInQuint:function(e,t,n,r){return n*(e/=r)*e*e*e*e+t},easeOutQuint:function(e,t,n,r){return n*((e=e/r-1)*e*e*e*e+1)+t},easeInOutQuint:function(e,t,n,r){return(e/=r/2)<1?n/2*e*e*e*e*e+t:n/2*((e-=2)*e*e*e*e+2)+t},easeInSine:function(e,t,n,r){return-n*Math.cos(e/r*(Math.PI/2))+n+t},easeOutSine:function(e,t,n,r){return n*Math.sin(e/r*(Math.PI/2))+t},easeInOutSine:function(e,t,n,r){return-n/2*(Math.cos(Math.PI*e/r)-1)+t},easeInExpo:function(e,t,n,r){return 0===e?t:n*Math.pow(2,10*(e/r-1))+t},easeOutExpo:function(e,t,n,r){return e==r?t+n:n*(1-Math.pow(2,-10*e/r))+t},easeInOutExpo:function(e,t,n,r){return 0===e?t:e==r?t+n:(e/=r/2)<1?n/2*Math.pow(2,10*(e-1))+t:n/2*(2-Math.pow(2,-10*--e))+t},easeInCirc:function(e,t,n,r){return-n*(Math.sqrt(1-(e/=r)*e)-1)+t},easeOutCirc:function(e,t,n,r){return n*Math.sqrt(1-(e=e/r-1)*e)+t},easeInOutCirc:function(e,t,n,r){return(e/=r/2)<1?-n/2*(Math.sqrt(1-e*e)-1)+t:n/2*(Math.sqrt(1-(e-=2)*e)+1)+t},easeInElastic:function(e,t,n,r){var i=1.70158,o=0,a=n;return 0===e?t:1==(e/=r)?t+n:(o||(o=.3*r),a<Math.abs(n)?(a=n,i=o/4):i=o/(2*Math.PI)*Math.asin(n/a),-a*Math.pow(2,10*(e-=1))*Math.sin((e*r-i)*(2*Math.PI)/o)+t)},easeOutElastic:function(e,t,n,r){var i=1.70158,o=0,a=n;return 0===e?t:1==(e/=r)?t+n:(o||(o=.3*r),a<Math.abs(n)?(a=n,i=o/4):i=o/(2*Math.PI)*Math.asin(n/a),a*Math.pow(2,-10*e)*Math.sin((e*r-i)*(2*Math.PI)/o)+n+t)},easeInOutElastic:function(e,t,n,r){var i=1.70158,o=0,a=n;if(0===e)return t;if(2==(e/=r/2))return t+n;if(o||(o=r*(.3*1.5)),a<Math.abs(n)){a=n;i=o/4}else i=o/(2*Math.PI)*Math.asin(n/a);return e<1?a*Math.pow(2,10*(e-=1))*Math.sin((e*r-i)*(2*Math.PI)/o)*-.5+t:a*Math.pow(2,-10*(e-=1))*Math.sin((e*r-i)*(2*Math.PI)/o)*.5+n+t},easeInBack:function(e,t,n,r,i){return null==i&&(i=1.70158),n*(e/=r)*e*((i+1)*e-i)+t},easeOutBack:function(e,t,n,r,i){return null==i&&(i=1.70158),n*((e=e/r-1)*e*((i+1)*e+i)+1)+t},easeInOutBack:function(e,t,n,r,i){return null==i&&(i=1.70158),(e/=r/2)<1?n/2*(e*e*((1+(i*=1.525))*e-i))+t:n/2*((e-=2)*e*((1+(i*=1.525))*e+i)+2)+t},easeInBounce:function(e,t,n,i){return n-r.easeOutBounce(i-e,0,n,i)+t},easeOutBounce:function(e,t,n,r){return(e/=r)<1/2.75?n*(7.5625*e*e)+t:e<2/2.75?n*(7.5625*(e-=1.5/2.75)*e+.75)+t:e<2.5/2.75?n*(7.5625*(e-=2.25/2.75)*e+.9375)+t:n*(7.5625*(e-=2.625/2.75)*e+.984375)+t},easeInOutBounce:function(e,t,n,i){return e<i/2?.5*r.easeInBounce(2*e,0,n,i)+t:.5*r.easeOutBounce(2*e-i,0,n,i)+.5*n+t}};return r}},_p[2]={value:function(e,t){var n,r=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||function(e){return setTimeout(e,1e3/60)},i=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.msCancelAnimationFrame||window.clearTimeout,o=[];function a(e){1===o.push(e)&&(n=r(s))}function s(){var e=o;for(o=[];e.length;)u(e.pop());n=0}function u(e){var t=+new Date,n=t-e.time;n>200&&(n=1e3/60),e.dur=n,e.elapsed+=n,e.time=t,e.action.call(null,e),e.index++}t.requestFrame=function(e){var t=function(e){var t={index:0,time:+new Date,elapsed:0,action:e,next:function(){a(t)}};return t}(e);return a(t),t},t.releaseFrame=function(e){var t=o.indexOf(e);~t&&o.splice(t,1),0===o.length&&i(n)}}},_p[3]={value:function(e){var t=_p.r(0),n=_p.r(35),r=_p.r(47),i=_p.r(61),o=_p.r(11).createClass("MotionAnimator",{base:t,constructor:function(e,t){var i=this;this.callBase({beginValue:0,finishValue:1,setter:function(e,t){var o=i.motionPath instanceof r?i.motionPath.getPathData():i.motionPath,a=n.pointAtPath(o,t);e.setTranslate(a.x,a.y),this.doRotate&&e.setRotate(a.tan.getAngle())}}),this.doRotate=t,this.motionPath=e}});return _p.r(11).extendClass(i,{motion:function(e,t,n,r,i){return this.animate(new o(e),t,n,r,i)}}),o}},_p[4]={value:function(e){var t=_p.r(0),n=_p.r(11).createClass("OpacityAnimator",{base:t,constructor:function(e){this.callBase({beginValue:function(e){return e.getOpacity()},finishValue:e,setter:function(e,t){e.setOpacity(t)}})}}),r=_p.r(61);return _p.r(11).extendClass(r,{fxOpacity:function(e,t,r,i,o){return this.animate(new n(e),t,r,i,o)},fadeTo:function(){return this.fxOpacity.apply(this,arguments)},fadeIn:function(){return this.fxOpacity.apply(this,[1].concat([].slice.call(arguments)))},fadeOut:function(){return this.fxOpacity.apply(this,[0].concat([].slice.call(arguments)))}}),n}},_p[5]={value:function(e){var t=_p.r(0),n=_p.r(35),r=_p.r(11).createClass("OpacityAnimator",{base:t,constructor:function(e){this.callBase({beginValue:function(e){return this.beginPath=e.getPathData(),0},finishValue:1,setter:function(t,r){t.setPathData(n.pathTween(this.beginPath,e,r))}})}}),i=_p.r(47);return _p.r(11).extendClass(i,{fxPath:function(e,t,n,i,o){return this.animate(new r(e),t,n,i,o)}}),r}},_p[6]={value:function(e){var t=_p.r(0),n=_p.r(11).createClass("RotateAnimator",{base:t,constructor:function(e){this.callBase({beginValue:0,finishValue:e,setter:function(e,t,n){var r=n.getDelta();e.rotate(r)}})}}),r=_p.r(61);return _p.r(11).extendClass(r,{fxRotate:function(e,t,r,i,o){return this.animate(new n(e),t,r,i,o)}}),n}},_p[7]={value:function(e){var t=_p.r(0),n=_p.r(11).createClass("ScaleAnimator",{base:t,constructor:function(e,t){this.callBase({beginValue:0,finishValue:1,setter:function(n,r,i){var o=i.getDelta(),a=Math.pow(e,o),s=Math.pow(t,o);n.scale(s,a)}})}}),r=_p.r(61);return _p.r(11).extendClass(r,{fxScale:function(e,t,r,i,o,a){return this.animate(new n(e,t),r,i,o,a)}}),n}},_p[8]={value:function(e){var t=_p.r(34),n=_p.r(12),r=_p.r(2);function i(e,t,n){for(var r in this.timeline=e,this.target=e.target,this.type=t,n)n.hasOwnProperty(r)&&(this[r]=n[r])}var o=_p.r(11).createClass("Timeline",{mixins:[t],constructor:function(e,t,n,r){this.callMixin(),this.target=t,this.time=0,this.duration=n,this.easing=r,this.animator=e,this.beginValue=e.beginValue,this.finishValue=e.finishValue,this.setter=e.setter,this.status="ready"},nextFrame:function(e){"playing"==this.status&&(this.time+=e.dur,this.setValue(this.getValue()),this.time>=this.duration&&this.timeUp(),e.next())},getPlayTime:function(){return this.rollbacking?this.duration-this.time:this.time},getTimeProportion:function(){return this.getPlayTime()/this.duration},getValueProportion:function(){return this.easing(this.getPlayTime(),0,1,this.duration)},getValue:function(){return function(e,t,r){return n.paralle(e,t,(function(e,t){return e+(t-e)*r}))}(this.beginValue,this.finishValue,this.getValueProportion())},setValue:function(e){this.lastValue=this.currentValue,this.currentValue=e,this.setter.call(this.target,this.target,e,this)},getDelta:function(){return this.lastValue=void 0===this.lastValue?this.beginValue:this.lastValue,e=this.lastValue,t=this.currentValue,n.paralle(e,t,(function(e,t){return t-e}));var e,t},play:function(){var e=this.status;switch(this.status="playing",e){case"ready":n.isFunction(this.beginValue)&&(this.beginValue=this.beginValue.call(this.target,this.target)),n.isFunction(this.finishValue)&&(this.finishValue=this.finishValue.call(this.target,this.target)),this.time=0,this.setValue(this.beginValue),this.frame=r.requestFrame(this.nextFrame.bind(this));break;case"finished":case"stoped":this.time=0,this.frame=r.requestFrame(this.nextFrame.bind(this));break;case"paused":this.frame.next()}return this.fire("play",new i(this,"play",{lastStatus:e})),this},pause:function(){return this.status="paused",this.fire("pause",new i(this,"pause")),r.releaseFrame(this.frame),this},stop:function(){return this.status="stoped",this.setValue(this.finishValue),this.rollbacking=!1,this.fire("stop",new i(this,"stop")),r.releaseFrame(this.frame),this},timeUp:function(){this.repeatOption?(this.time=0,this.rollback?this.rollbacking?(this.decreaseRepeat(),this.rollbacking=!1):(this.rollbacking=!0,this.fire("rollback",new i(this,"rollback"))):this.decreaseRepeat(),this.repeatOption?this.fire("repeat",new i(this,"repeat")):this.finish()):this.finish()},finish:function(){this.setValue(this.finishValue),this.status="finished",this.fire("finish",new i(this,"finish")),r.releaseFrame(this.frame)},decreaseRepeat:function(){!0!==this.repeatOption&&this.repeatOption--},repeat:function(e,t){return this.repeatOption=e,this.rollback=t,this}});return o.requestFrame=r.requestFrame,o.releaseFrame=r.releaseFrame,o}},_p[9]={value:function(e){var t=_p.r(0),n=_p.r(11).createClass("TranslateAnimator",{base:t,constructor:function(e,t){this.callBase({x:0,y:0},{x:e,y:t},(function(e,t,n){var r=n.getDelta();e.translate(r.x,r.y)}))}}),r=_p.r(61);return _p.r(11).extendClass(r,{fxTranslate:function(e,t,r,i,o,a){return this.animate(new n(e,t),r,i,o,a)}}),n}},_p[10]={value:function(){return function(){var e,t=navigator.userAgent.toLowerCase(),n=window.opera;e={platform:function(e){return{win32:"Win",macintel:"Mac"}[e.platform.toLowerCase()]||"Lux"}(navigator),lb:function(e){return!!~e.indexOf("lbbrowser")&&(~e.indexOf("msie")?"ie":"chrome")}(t),sg:/se[\\s\\S]+metasr/.test(t),bd:!!~t.indexOf("bidubrowser"),edge:!!~t.indexOf("edge"),chrome:!1,opera:!!n&&n.version,webkit:t.indexOf(" applewebkit/")>-1,mac:t.indexOf("macintosh")>-1},e.ie=!e.lb&&/(msie\\s|trident.*rv:)([\\w.]+)/.test(t),e.gecko="Gecko"==navigator.product&&!e.webkit&&!e.opera&&!e.ie;var r=0;if(e.ie&&(r=1*(t.match(/(msie\\s|trident.*rv:)([\\w.]+)/)[2]||0),e.ie11Compat=11==document.documentMode,e.ie9Compat=9==document.documentMode),e.gecko){var i=t.match(/rv:([\\d\\.]+)/);i&&(r=1e4*(i=i[1].split("."))[0]+100*(i[1]||0)+1*(i[2]||0))}return!/chrome\\/(\\d+\\.\\d)/i.test(t)||e.bd||e.opera||e.lb||e.sg||e.edge||(e.chrome=+RegExp.$1),/(\\d+\\.\\d)?(?:\\.\\d)?\\s+safari\\/?(\\d+\\.\\d+)?/i.test(t)&&!/chrome/i.test(t)&&(e.safari=+(RegExp.$1||RegExp.$2)),e.opera&&(r=parseFloat(n.version())),e.webkit&&(r=parseFloat(t.match(/ applewebkit\\/(\\d+)/)[1])),e.bd&&(r=parseFloat(t.match(/bidubrowser\\/(\\d+)/)[1])),e.opera&&(r=parseFloat(t.match(/opr\\/(\\d+)/)[1])),e.edge&&(r=parseFloat(t.match(/edge\\/(\\d+)/)[1])),e.version=r,e.isCompatible=!e.mobile&&(e.ie&&r>=6||e.gecko&&r>=10801||e.opera&&r>=9.5||e.air&&r>=1||e.webkit&&r>=522||!1),e}()}},_p[11]={value:function(require,exports){function Class(){}function checkBaseConstructorCall(e,t){var n=e.toString();if(!/this\\.callBase/.test(n))throw new Error(t+" : \u7C7B\u6784\u9020\u51FD\u6570\u6CA1\u6709\u8C03\u7528\u7236\u7C7B\u7684\u6784\u9020\u51FD\u6570\uFF01\u4E3A\u4E86\u5B89\u5168\uFF0C\u8BF7\u8C03\u7528\u7236\u7C7B\u7684\u6784\u9020\u51FD\u6570")}exports.Class=Class,Class.__KityClassName="Class",Class.prototype.base=function(e){return arguments.callee.caller.__KityMethodClass.__KityBaseClass.prototype[e].apply(this,Array.prototype.slice.call(arguments,1))},Class.prototype.callBase=function(){var e=arguments.callee.caller;return e.__KityMethodClass.__KityBaseClass.prototype[e.__KityMethodName].apply(this,arguments)},Class.prototype.mixin=function(e){var t=arguments.callee.caller.__KityMethodClass.__KityMixins;return t?t[e].apply(this,Array.prototype.slice.call(arguments,1)):this},Class.prototype.callMixin=function(){var e=arguments.callee.caller,t=e.__KityMethodName,n=e.__KityMethodClass.__KityMixins;if(!n)return this;var r=n[t];if("constructor"==t){for(var i=0,o=r.length;i<o;i++)r[i].call(this);return this}return r.apply(this,arguments)},Class.prototype.pipe=function(e){return"function"==typeof e&&e.call(this,this),this},Class.prototype.getType=function(){return this.__KityClassName},Class.prototype.getClass=function(){return this.constructor};var KITY_INHERIT_FLAG="__KITY_INHERIT_FLAG_"+ +new Date;function inherit(constructor,BaseClass,classname){var KityClass=eval("(function "+classname+"( __inherit__flag ) {if( __inherit__flag != KITY_INHERIT_FLAG ) {KityClass.__KityConstructor.apply(this, arguments);}this.__KityClassName = KityClass.__KityClassName;})");for(var methodName in KityClass.__KityConstructor=constructor,KityClass.prototype=new BaseClass(KITY_INHERIT_FLAG),BaseClass.prototype)BaseClass.prototype.hasOwnProperty(methodName)&&0!==methodName.indexOf("__Kity")&&(KityClass.prototype[methodName]=BaseClass.prototype[methodName]);return KityClass.prototype.constructor=KityClass,KityClass}function mixin(e,t){if(!1==t instanceof Array)return e;var n,r,i,o=t.length;for(e.__KityMixins={constructor:[]},n=0;n<o;n++)for(i in r=t[n].prototype)!1!==r.hasOwnProperty(i)&&0!==i.indexOf("__Kity")&&("constructor"===i?e.__KityMixins.constructor.push(r[i]):e.prototype[i]=e.__KityMixins[i]=r[i]);return e}function extend(e,t){for(var n in t.__KityClassName&&(t=t.prototype),t)if(t.hasOwnProperty(n)&&n.indexOf("__Kity")&&"constructor"!=n){var r=e.prototype[n]=t[n];r.__KityMethodClass=e,r.__KityMethodName=n}return e}exports.createClass=function(e,t){var n,r,i;return 1===arguments.length&&(t=arguments[0],e="AnonymousClass"),i=t.base||Class,t.hasOwnProperty("constructor")?(n=t.constructor,i!=Class&&checkBaseConstructorCall(n,e)):n=function(){this.callBase.apply(this,arguments),this.callMixin.apply(this,arguments)},(r=mixin(r=inherit(n,i,e),t.mixins)).__KityClassName=n.__KityClassName=e,r.__KityBaseClass=n.__KityBaseClass=i,r.__KityMethodName=n.__KityMethodName="constructor",r.__KityMethodClass=n.__KityMethodClass=r,delete t.mixins,delete t.constructor,delete t.base,r=extend(r,t)},exports.extendClass=extend}},_p[12]={value:function(){var e={each:function(e,t,n){if(null!==e)if(e.length===+e.length){for(var r=0,i=e.length;r<i;r++)if(!1===t.call(n,e[r],r,e))return!1}else for(var o in e)if(e.hasOwnProperty(o)&&!1===t.call(n,e[o],o,e))return!1},extend:function(e){for(var t=arguments,n=!!this.isBoolean(t[t.length-1])&&t[t.length-1],r=this.isBoolean(t[t.length-1])?t.length-1:t.length,i=1;i<r;i++){var o=t[i];for(var a in o)n&&e.hasOwnProperty(a)||(e[a]=o[a])}return e},deepExtend:function(e,t){for(var n=arguments,r=!!this.isBoolean(n[n.length-1])&&n[n.length-1],i=this.isBoolean(n[n.length-1])?n.length-1:n.length,o=1;o<i;o++){var a=n[o];for(var s in a)r&&e.hasOwnProperty(s)||(this.isObject(e[s])&&this.isObject(a[s])?this.deepExtend(e[s],a[s],r):e[s]=a[s])}return e},clone:function(e){var t={};for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},copy:function(e){return"object"!=typeof e?e:"function"==typeof e?null:JSON.parse(JSON.stringify(e))},queryPath:function(e,t){for(var n=e.split("."),r=0,i=t,o=n.length;r<o;){if(!(n[r]in i))return;if(i=i[n[r]],++r>=o||void 0===i)return i}},getValue:function(e,t){return void 0!==e?e:t},flatten:function(t){var n,r=[],i=t.length;for(n=0;n<i;n++)t[n]instanceof Array?r=r.concat(e.flatten(t[n])):r.push(t[n]);return r},paralle:function(t,n,r){var i,o,a,s;if(t instanceof Array){for(s=[],o=0;o<t.length;o++)s.push(e.paralle(t[o],n[o],r));return s}if(t instanceof Object){if((i=t.getClass&&t.getClass())&&i.parse)t=t.valueOf(),n=n.valueOf(),s=e.paralle(t,n,r),s=i.parse(s);else for(a in s={},t)t.hasOwnProperty(a)&&n.hasOwnProperty(a)&&(s[a]=e.paralle(t[a],n[a],r));return s}return!1===isNaN(parseFloat(t))?r(t,n):s},parallelize:function(t){return function(n,r){return e.paralle(n,r,t)}}};return e.each(["String","Function","Array","Number","RegExp","Object","Boolean"],(function(t){e["is"+t]=function(e){return Object.prototype.toString.apply(e)=="[object "+t+"]"}})),e}},_p[13]={value:function(e,t,n){n.exports=window.kity=_p.r(77)}},_p[14]={value:function(e,t,n){var r=_p.r(17),i=_p.r(12),o=_p.r(11).createClass("ColorMatrixEffect",{base:r,constructor:function(e,t){this.callBase(r.NAME_COLOR_MATRIX),this.set("type",i.getValue(e,o.TYPE_MATRIX)),this.set("in",i.getValue(t,r.INPUT_SOURCE_GRAPHIC))}});return i.extend(o,{TYPE_MATRIX:"matrix",TYPE_SATURATE:"saturate",TYPE_HUE_ROTATE:"hueRotate",TYPE_LUMINANCE_TO_ALPHA:"luminanceToAlpha",MATRIX_ORIGINAL:"10000010000010000010".split("").join(" "),MATRIX_EMPTY:"00000000000000000000".split("").join(" ")}),o}},_p[15]={value:function(e,t,n){var r=_p.r(17),i=_p.r(12),o=_p.r(11).createClass("CompositeEffect",{base:r,constructor:function(e,t,n){this.callBase(r.NAME_COMPOSITE),this.set("operator",i.getValue(e,o.OPERATOR_OVER)),t&&this.set("in",t),n&&this.set("in2",n)}});return i.extend(o,{OPERATOR_OVER:"over",OPERATOR_IN:"in",OPERATOR_OUT:"out",OPERATOR_ATOP:"atop",OPERATOR_XOR:"xor",OPERATOR_ARITHMETIC:"arithmetic"}),o}},_p[16]={value:function(e,t,n){var r=_p.r(17),i=_p.r(12),o=_p.r(11).createClass("ConvolveMatrixEffect",{base:r,constructor:function(e,t){this.callBase(r.NAME_CONVOLVE_MATRIX),this.set("edgeMode",i.getValue(e,o.MODE_DUPLICATE)),this.set("in",i.getValue(t,r.INPUT_SOURCE_GRAPHIC))}});return i.extend(o,{MODE_DUPLICATE:"duplicate",MODE_WRAP:"wrap",MODE_NONE:"none"}),o}},_p[17]={value:function(e,t,n){var r=_p.r(68),i=_p.r(11).createClass("Effect",{constructor:function(e){this.node=r.createNode(e)},getId:function(){return this.node.id},setId:function(e){return this.node.id=e,this},set:function(e,t){return this.node.setAttribute(e,t),this},get:function(e){return this.node.getAttribute(e)},getNode:function(){return this.node},toString:function(){return this.node.getAttribute("result")||""}});return _p.r(12).extend(i,{NAME_GAUSSIAN_BLUR:"feGaussianBlur",NAME_OFFSET:"feOffset",NAME_COMPOSITE:"feComposite",NAME_COLOR_MATRIX:"feColorMatrix",NAME_CONVOLVE_MATRIX:"feConvolveMatrix",INPUT_SOURCE_GRAPHIC:"SourceGraphic",INPUT_SOURCE_ALPHA:"SourceAlpha",INPUT_BACKGROUND_IMAGE:"BackgroundImage",INPUT_BACKGROUND_ALPHA:"BackgroundAlpha",INPUT_FILL_PAINT:"FillPaint",INPUT_STROKE_PAINT:"StrokePaint"}),i}},_p[18]={value:function(e,t,n){var r=_p.r(17),i=_p.r(12);return _p.r(11).createClass("GaussianblurEffect",{base:r,constructor:function(e,t){this.callBase(r.NAME_GAUSSIAN_BLUR),this.set("stdDeviation",i.getValue(e,1)),this.set("in",i.getValue(t,r.INPUT_SOURCE_GRAPHIC))}})}},_p[19]={value:function(e,t,n){var r=_p.r(17),i=_p.r(12);return _p.r(11).createClass("OffsetEffect",{base:r,constructor:function(e,t,n){this.callBase(r.NAME_OFFSET),this.set("dx",i.getValue(e,0)),this.set("dy",i.getValue(t,0)),this.set("in",i.getValue(n,r.INPUT_SOURCE_GRAPHIC))}})}},_p[20]={value:function(e){return _p.r(11).createClass("EffectContainer",{base:_p.r(30),addEffect:function(e,t){return this.addItem.apply(this,arguments)},prependEffect:function(){return this.prependItem.apply(this,arguments)},appendEffect:function(){return this.appendItem.apply(this,arguments)},removeEffect:function(e){return this.removeItem.apply(this,arguments)},addEffects:function(){return this.addItems.apply(this,arguments)},setEffects:function(){return this.setItems.apply(this,arguments)},getEffect:function(){return this.getItem.apply(this,arguments)},getEffects:function(){return this.getItems.apply(this,arguments)},getFirstEffect:function(){return this.getFirstItem.apply(this,arguments)},getLastEffect:function(){return this.getLastItem.apply(this,arguments)},handleAdd:function(e,t){var n=this.getEffects().length,r=this.getItem(t+1);n!==t+1?this.node.insertBefore(e.getNode(),r.getNode()):this.node.appendChild(e.getNode())}})}},_p[21]={value:function(e,t,n){var r=_p.r(68),i=_p.r(11),o=i.createClass("Filter",{mixins:[_p.r(20)],constructor:function(e,t,n,i){this.node=r.createNode("filter"),void 0!==e&&this.set("x",e),void 0!==t&&this.set("y",t),void 0!==n&&this.set("width",n),void 0!==i&&this.set("height",i)},getId:function(){return this.id},setId:function(e){return this.node.id=e,this},set:function(e,t){return this.node.setAttribute(e,t),this},get:function(e){return this.node.getAttribute(e)},getNode:function(){return this.node}}),a=_p.r(61);return i.extendClass(a,{applyFilter:function(e){var t=e.get("id");return t&&this.node.setAttribute("filter","url(#"+t+")"),this}}),o}},_p[22]={value:function(e,t,n){var r=_p.r(18);return _p.r(11).createClass("GaussianblurFilter",{base:_p.r(21),constructor:function(e){this.callBase(),this.addEffect(new r(e))}})}},_p[23]={value:function(e,t,n){var r=_p.r(18),i=_p.r(17),o=_p.r(14),a=_p.r(29),s=_p.r(12),u=_p.r(15),c=_p.r(19);return _p.r(11).createClass("ProjectionFilter",{base:_p.r(21),constructor:function(e,t,n){this.callBase(),this.gaussianblurEffect=new r(e,i.INPUT_SOURCE_ALPHA),this.gaussianblurEffect.set("result","gaussianblur"),this.addEffect(this.gaussianblurEffect),this.offsetEffect=new c(t,n,this.gaussianblurEffect),this.offsetEffect.set("result","offsetBlur"),this.addEffect(this.offsetEffect),this.colorMatrixEffect=new o(o.TYPE_MATRIX,this.offsetEffect),this.colorMatrixEffect.set("values",o.MATRIX_ORIGINAL),this.colorMatrixEffect.set("result","colorOffsetBlur"),this.addEffect(this.colorMatrixEffect),this.compositeEffect=new u(u.OPERATOR_OVER,i.INPUT_SOURCE_GRAPHIC,this.colorMatrixEffect),this.addEffect(this.compositeEffect)},setColor:function(e){var t=null,n=[];if(s.isString(e)&&(e=a.parse(e)),!e)return this;t=o.MATRIX_EMPTY.split(" "),n.push(e.get("r")),n.push(e.get("g")),n.push(e.get("b"));for(var r=0,i=n.length;r<i;r++)t[5*r+3]=n[r]/255;return t[18]=e.get("a"),this.colorMatrixEffect.set("values",t.join(" ")),this},setOpacity:function(e){var t=this.colorMatrixEffect.get("values").split(" ");return t[18]=e,this.colorMatrixEffect.set("values",t.join(" ")),this},setOffset:function(e,t){this.setOffsetX(e),this.setOffsetY(t)},setOffsetX:function(e){this.offsetEffect.set("dx",e)},setOffsetY:function(e){this.offsetEffect.set("dy",e)},setDeviation:function(e){this.gaussianblurEffect.set("stdDeviation",e)}})}},_p[24]={value:function(e,t,n){return _p.r(11).createClass("Bezier",{mixins:[_p.r(52)],base:_p.r(47),constructor:function(e){this.callBase(),e=e||[],this.changeable=!0,this.setBezierPoints(e)},getBezierPoints:function(){return this.getPoints()},setBezierPoints:function(e){return this.setPoints(e)},onContainerChanged:function(){this.changeable&&this.update()},update:function(){var e=null,t=this.getBezierPoints();if(!(t.length<2)){(e=this.getDrawer()).clear();var n=t[0].getVertex(),r=null,i=null;e.moveTo(n.x,n.y);for(var o=1,a=t.length;o<a;o++)n=t[o].getVertex(),i=t[o].getBackward(),r=t[o-1].getForward(),e.bezierTo(r.x,r.y,i.x,i.y,n.x,n.y);return this}}})}},_p[25]={value:function(e,t,n){var r=_p.r(64),i=_p.r(74),o=_p.r(11).createClass("BezierPoint",{constructor:function(e,t,n){this.vertex=new r(e,t),this.forward=new r(e,t),this.backward=new r(e,t),this.setSmooth(void 0===n||n),this.setSymReflaction(!0)},clone:function(){var e=new o,t=null;return t=this.getVertex(),e.setVertex(t.x,t.y),t=this.getForward(),e.setForward(t.x,t.y),t=this.getBackward(),e.setBackward(t.x,t.y),e.setSymReflaction(this.isSymReflaction),e.setSmooth(this.isSmooth()),e},setVertex:function(e,t){return this.vertex.setPoint(e,t),this.update(),this},moveTo:function(e,t){var n=this.forward.getPoint(),r=this.backward.getPoint(),i=this.vertex.getPoint(),o=e-i.x,a=t-i.y;this.forward.setPoint(n.x+o,n.y+a),this.backward.setPoint(r.x+o,r.y+a),this.vertex.setPoint(e,t),this.update()},setForward:function(e,t){return this.forward.setPoint(e,t),this.smooth&&this.updateAnother(this.forward,this.backward),this.update(),this.lastControlPointSet=this.forward,this},setBackward:function(e,t){return this.backward.setPoint(e,t),this.smooth&&this.updateAnother(this.backward,this.forward),this.update(),this.lastControlPointSet=this.backward,this},setSymReflaction:function(e){return this.symReflaction=e,this.smooth&&this.setSmooth(!0),this},isSymReflaction:function(){return this.symReflaction},updateAnother:function(e,t){var n=this.getVertex(),r=i.fromPoints(e.getPoint(),n),o=i.fromPoints(n,t.getPoint());return o=r.normalize(this.isSymReflaction()?r.length():o.length()),t.setPoint(n.x+o.x,n.y+o.y),this},setSmooth:function(e){var t;return this.smooth=!!e,this.smooth&&(t=this.lastControlPointSet)&&this.updateAnother(t,t==this.forward?this.backward:this.forward),this},isSmooth:function(){return this.smooth},getVertex:function(){return this.vertex.getPoint()},getForward:function(){return this.forward.getPoint()},getBackward:function(){return this.backward.getPoint()},update:function(){if(!this.container)return this;this.container.update&&this.container.update(this)}});return o}},_p[26]={value:function(e,t,n){var r=_p.r(11).createClass("Box",{constructor:function(e,t,n,r){var i=arguments[0];i&&"object"==typeof i&&(e=i.x,t=i.y,n=i.width,r=i.height),n<0&&(e-=n=-n),r<0&&(t-=r=-r),this.x=e||0,this.y=t||0,this.width=n||0,this.height=r||0,this.left=this.x,this.right=this.x+this.width,this.top=this.y,this.bottom=this.y+this.height,this.cx=this.x+this.width/2,this.cy=this.y+this.height/2},getRangeX:function(){return[this.left,this.right]},getRangeY:function(){return[this.top,this.bottom]},merge:function(e){if(this.isEmpty())return new r(e.x,e.y,e.width,e.height);var t=Math.min(this.left,e.left),n=Math.max(this.right,e.right),i=Math.min(this.top,e.top),o=Math.max(this.bottom,e.bottom);return new r(t,i,n-t,o-i)},intersect:function(e){!e instanceof r&&(e=new r(e));var t=Math.max(this.left,e.left),n=Math.min(this.right,e.right),i=Math.max(this.top,e.top),o=Math.min(this.bottom,e.bottom);return t>n||i>o?new r:new r(t,i,n-t,o-i)},expand:function(e,t,n,i){if(arguments.length<1)return new r(this);arguments.length<2&&(t=e),arguments.length<3&&(n=e),arguments.length<4&&(i=t);var o=this.left-i,a=this.top-e,s=this.width+t+i,u=this.height+e+n;return new r(o,a,s,u)},valueOf:function(){return[this.x,this.y,this.width,this.height]},toString:function(){return this.valueOf().join(" ")},isEmpty:function(){return!this.width||!this.height}});return r.parse=function(e){return"string"==typeof e?r.parse(e.split(/[\\s,]+/).map(parseFloat)):e instanceof Array?new r(e[0],e[1],e[2],e[3]):"x"in e?new r(e):null},r}},_p[27]={value:function(e,t,n){return _p.r(11).createClass("Circle",{base:_p.r(33),constructor:function(e,t,n){this.callBase(e,e,t,n)},getRadius:function(){return this.getRadiusX()},setRadius:function(e){return this.callBase(e,e)}})}},_p[28]={value:function(e,t,n){var r=_p.r(11),i=_p.r(61),o=r.createClass("Clip",{base:i,mixins:[_p.r(62)],constructor:function(e){this.callBase("clipPath",e)},clip:function(e){return e.getNode().setAttribute("clip-path",this),this}});return r.extendClass(i,{clipWith:function(e){return e instanceof i&&(e=new o(e.getPaper()).addShape(e)),e.clip(this),this}}),o}},_p[29]={value:function(e,t,n){var r=_p.r(12),i=_p.r(65),o={},a=_p.r(11).createClass("Color",{constructor:function(){var e=null;"string"==typeof arguments[0]?null===(e=o.parseToValue(arguments[0]))&&(e={r:0,g:0,b:0,h:0,s:0,l:0,a:1}):(e={r:0|arguments[0],g:0|arguments[1],b:0|arguments[2],a:void 0===arguments[3]?1:parseFloat(arguments[3])},e=o.overflowFormat(e),e=r.extend(e,o.rgbValueToHslValue(e))),this._color=e},set:function(e,t){if(!a._MAX_VALUE[e])throw new Error("Color set(): Illegal parameter");return"a"!==e&&(t=Math.floor(t)),"h"==e&&(t=(t+360)%360),this._color[e]=Math.max(a._MIN_VALUE[e],Math.min(a._MAX_VALUE[e],t)),-1!=="rgb".indexOf(e)?this._color=r.extend(this._color,o.rgbValueToHslValue(this._color)):-1!=="hsl".indexOf(e)&&(this._color=r.extend(this._color,o.hslValueToRGBValue(this._color))),this},inc:function(e,t){return t=this.get(e)+t,"h"==e?t=(t+360)%360:(t=Math.min(a._MAX_VALUE[e],t),t=Math.max(a._MIN_VALUE[e],t)),this.clone().set(e,t)},dec:function(e,t){return this.inc(e,-t)},clone:function(){return new a(this.toRGBA())},get:function(e){return a._MAX_VALUE[e]?this._color[e]:null},getValues:function(){return r.clone(this._color)},valueOf:function(){return this.getValues()},toRGB:function(){return o.toString(this._color,"rgb")},toRGBA:function(){return o.toString(this._color,"rgba")},toHEX:function(){return o.toString(this._color,"hex")},toHSL:function(){return o.toString(this._color,"hsl")},toHSLA:function(){return o.toString(this._color,"hsla")},toString:function(){return 1===this._color.a?this.toRGB():this.toRGBA()}});return r.extend(a,{_MAX_VALUE:{r:255,g:255,b:255,h:360,s:100,l:100,a:1},_MIN_VALUE:{r:0,g:0,b:0,h:0,s:0,l:0,a:0},R:"r",G:"g",B:"b",H:"h",S:"s",L:"l",A:"a",parse:function(e){var t;return r.isString(e)&&(t=o.parseToValue(e)),r.isObject(e)&&"r"in e&&(t=e),null===t?new a:new a(t.r,t.g,t.b,t.a)},createHSL:function(e,t,n){return a.createHSLA(e,t,n,1)},createHSLA:function(e,t,n,r){var i=null;return i=["hsla("+e,t+="%",n+="%",r+")"],a.parse(i.join(", "))},createRGB:function(e,t,n){return a.createRGBA(e,t,n,1)},createRGBA:function(e,t,n,r){return new a(e,t,n,r)}}),r.extend(o,{parseToValue:function(e){var t={};if(e=i.EXTEND_STANDARD[e]||i.COLOR_STANDARD[e]||e,/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e))t=o.hexToValue(e);else if(/^(rgba?)/i.test(e))t=o.rgbaToValue(e);else{if(!/^(hsla?)/i.test(e))return null;t=o.hslaToValue(e)}return o.overflowFormat(t)},hexToValue:function(e){var t={};return/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e)?(e=RegExp.$1.split(""),r.each(["r","g","b"],(function(n,r){3===e.length?t[n]=o.toNumber(e[r]+e[r]):t[n]=o.toNumber(e[2*r]+e[2*r+1])})),(t=r.extend(t,o.rgbValueToHslValue(t))).a=1,t):null},rgbaToValue:function(e){var t={},n=!1;return/^(rgba?)/i.test(e)?(n=4===RegExp.$1.length,e=e.replace(/^rgba?/i,"").replace(/\\s+/g,"").replace(/[^0-9,.]/g,"").split(","),r.each(["r","g","b"],(function(n,r){t[n]=0|e[r]})),(t=r.extend(t,o.rgbValueToHslValue(t))).a=n?parseFloat(e[3]):1,t):null},hslaToValue:function(e){var t={},n=!1;return/^(hsla?)/i.test(e)?(n=4===RegExp.$1.length,e=e.replace(/^hsla?/i,"").replace(/\\s+/g,"").replace(/[^0-9,.]/g,"").split(","),t.h=0|e[0],t.s=0|e[1],t.l=0|e[2],t=r.extend(t,o.hslValueToRGBValue(t)),(t=o.hslValueToRGBValue(t)).a=n?parseFloat(e[3]):1,t):null},hslValueToRGBValue:function(e){function t(e,t,n){return n<0?n+=1:n>1&&(n-=1),6*n<1?e+6*(t-e)*n:2*n<1?t:3*n<2?e+6*(2/3-n)*(t-e):e}var n=null,i=null,o={};return(e=r.extend({},e)).h=e.h/360,e.s=e.s/100,e.l=e.l/100,0===e.s?o.r=o.g=o.b=e.l:(n=e.l<.5?e.l*(1+e.s):e.l+e.s-e.l*e.s,i=2*e.l-n,o.r=t(i,n,e.h+1/3),o.g=t(i,n,e.h),o.b=t(i,n,e.h-1/3)),o.r=Math.min(Math.round(255*o.r),255),o.g=Math.min(Math.round(255*o.g),255),o.b=Math.min(Math.round(255*o.b),255),o},rgbValueToHslValue:function(e){var t,n,i={};return(e=r.extend({},e)).r=e.r/255,e.g=e.g/255,e.b=e.b/255,(t=Math.max(e.r,e.g,e.b))===(n=Math.min(e.r,e.g,e.b))?i.h=0:t===e.r?e.g>=e.b?i.h=60*(e.g-e.b)/(t-n):i.h=60*(e.g-e.b)/(t-n)+360:t===e.g?i.h=60*(e.b-e.r)/(t-n)+120:t===e.b&&(i.h=60*(e.r-e.g)/(t-n)+240),i.l=(t+n)/2,0===i.l||t===n?i.s=0:i.l>0&&i.l<=.5?i.s=(t-n)/(t+n):i.s=(t-n)/(2-t-n),i.h=Math.round(i.h),i.s=Math.round(100*i.s),i.l=Math.round(100*i.l),i},toString:function(e,t){var n=[];return e=r.extend({},e),-1!==t.indexOf("hsl")&&(e.s+="%",e.l+="%"),"hex"!==t?(r.each(t.split(""),(function(t){n.push(e[t])})),(t+"("+n.join(", ")+")").toLowerCase()):(n.push(o.toHexValue(+e.r)),n.push(o.toHexValue(+e.g)),n.push(o.toHexValue(+e.b)),("#"+n.join("")).toLowerCase())},toNumber:function(e){return 0|Number("0x"+e)},toHexValue:function(e){var t=e.toString(16);return 1===t.length?"0"+t:t},overflowFormat:function(e){var t=r.extend({},e);return r.each("rgba".split(""),(function(e){t.hasOwnProperty(e)&&(t[e]=Math.min(a._MAX_VALUE[e],t[e]),t[e]=Math.max(a._MIN_VALUE[e],t[e]))})),t}}),a}},_p[30]={value:function(e,t,n){function r(){return this.container.removeItem(this),this}return _p.r(11).createClass("Container",{getItems:function(){return this.items||(this.items=[])},getItem:function(e){return this.getItems()[e]},getFirstItem:function(){return this.getItem(0)},getLastItem:function(){return this.getItem(this.getItems().length-1)},indexOf:function(e){return this.getItems().indexOf(e)},eachItem:function(e){var t,n=this.getItems(),r=n.length;for(t=0;t<r;t++)e.call(this,t,n[t]);return this},addItem:function(e,t,n){var i=this.getItems(),o=i.length;return~i.indexOf(e)||(t>=0&&t<o||(t=o),i.splice(t,0,e),"object"==typeof e&&(e.container=this,e.remove=r),this.handleAdd(e,t),n||this.onContainerChanged("add",[e])),this},addItems:function(e){for(var t=0,n=e.length;t<n;t++)this.addItem(e[t],-1,!0);return this.onContainerChanged("add",e),this},setItems:function(e){return this.clear().addItems(e)},appendItem:function(e){return this.addItem(e)},prependItem:function(e){return this.addItem(e,0)},removeItem:function(e,t){if("number"!=typeof e)return this.removeItem(this.indexOf(e));var n=this.getItems(),r=(n.length,n[e]);return void 0===r||(n.splice(e,1),r.container&&delete r.container,r.remove&&delete r.remove,this.handleRemove(r,e),t||this.onContainerChanged("remove",[r])),this},clear:function(){for(var e,t=[];e=this.getFirstItem();)t.push(e),this.removeItem(0,!0);return this.onContainerChanged("remove",t),this},onContainerChanged:function(e,t){},handleAdd:function(e,t){},handleRemove:function(e,t){}})}},_p[31]={value:function(e,t,n){var r=_p.r(12),i={getCurvePanLines:function(e,t){var n=i.getCenterPoints(e),r=i.getPanLine(e.length,n);return i.getMovedPanLines(e,r,t)},getCenterPoints:function(e){for(var t={},n=0,r=0,i=e.length;n<i;n++)t[n+","+(r=n===i-1?0:n+1)]={x:(e[n].x+e[r].y)/2,y:(e[n].x+e[r].y)/2};return t},getPanLine:function(e,t){for(var n,r={},i=null,o=0;o<e;o++){var a,s;i=n=(o+1)%e,a=t[o+","+n],s=t[(o=n)+","+(n=(o+1)%e)],r[i]={points:[{x:a.x,y:a.y},{x:s.x,y:s.y}],center:{x:(a.x+s.x)/2,y:(a.y+s.y)/2}},o=(i+e-1)%e}return r},getMovedPanLines:function(e,t,n){var i={};return r.each(e,(function(e,o){var a=t[o],s=a.center,u=s.x-e.x,c=s.y-e.y,l=i[o]={points:[],center:{x:e.x,y:e.y}};r.each(a.points,(function(e,t){var r={x:e.x-u,y:e.y-c},i=l.center,o=r.x-i.x,a=r.y-i.y;r.x=i.x+n*o,r.y=i.y+n*a,l.points.push(r)}))})),i}};return _p.r(11).createClass("Curve",{base:_p.r(47),mixins:[_p.r(52)],constructor:function(e,t){this.callBase(),this.setPoints(e||[]),this.closeState=!!t,this.changeable=!0,this.smoothFactor=1,this.update()},onContainerChanged:function(){this.changeable&&this.update()},setSmoothFactor:function(e){return this.smoothFactor=e<0?0:e,this.update(),this},getSmoothFactor:function(){return this.smoothFactor},update:function(){var e,t=this.getPoints(),n=this.getDrawer(),r=null,o=null,a=null;if(n.clear(),0===t.length)return this;if(n.moveTo(t[0]),1===t.length)return this;if(2===t.length)return n.lineTo(t[1]),this;e=i.getCurvePanLines(t,this.getSmoothFactor());for(var s=1,u=t.length;s<u;s++)r=e[s].center,o=this.closeState||s!=u-1?e[s].points[0]:e[s].center,a=this.closeState||1!=s?e[s-1].points[1]:e[s-1].center,n.bezierTo(a.x,a.y,o.x,o.y,r.x,r.y);return this.closeState&&(r=e[0].center,o=e[0].points[0],a=e[t.length-1].points[1],n.bezierTo(a.x,a.y,o.x,o.y,r.x,r.y)),this},close:function(){return this.closeState=!0,this.update()},open:function(){return this.closeState=!1,this.update()},isClose:function(){return!!this.closeState}})}},_p[32]={value:function(e,t,n){return _p.r(11).createClass("Data",{constructor:function(){this._data={}},setData:function(e,t){return this._data[e]=t,this},getData:function(e){return this._data[e]},removeData:function(e){return delete this._data[e],this}})}},_p[33]={value:function(e,t,n){_p.r(12);var r=_p.r(51);return _p.r(11).createClass("Ellipse",{base:_p.r(47),constructor:function(e,t,n,r){this.callBase(),this.rx=e||0,this.ry=t||0,this.cx=n||0,this.cy=r||0,this.update()},update:function(){var e=this.rx,t=this.ry,n=this.cx+e,r=this.cx-e,i=this.cy,o=this.getDrawer();return o.clear(),o.moveTo(n,i),o.arcTo(e,t,0,1,1,r,i),o.arcTo(e,t,0,1,1,n,i),this},getRadius:function(){return{x:this.rx,y:this.ry}},getRadiusX:function(){return this.rx},getRadiusY:function(){return this.ry},getCenter:function(){return new r(this.cx,this.cy)},getCenterX:function(){return this.cx},getCenterY:function(){return this.cy},setRadius:function(e,t){return this.rx=e,this.ry=t,this.update()},setRadiusX:function(e){return this.rx=e,this.update()},setRadiusY:function(e){return this.ry=e,this.update()},setCenter:function(e,t){if(1==arguments.length){var n=r.parse(arguments[0]);e=n.x,t=n.y}return this.cx=e,this.cy=t,this.update()},setCenterX:function(e){return this.cx=e,this.update()},setCenterY:function(e){return this.cy=e,this.update()}})}},_p[34]={value:function(e,t,n){!function(){function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),n}e.prototype=window.Event.prototype,window.CustomEvent=e}();var r=_p.r(12),i=_p.r(63),o={},a={},s=0;function u(e,t,n){return n=!!n,r.isString(e)&&(e=e.match(/\\S+/g)),r.each(e,(function(e){l.call(this,this.node,e,t,n)}),this),this}function c(e,t){var n=null,i=this._EVNET_UID,s=void 0===t;return n=a[i][e],s||(s=!0,r.each(n,(function(e,r){e===t?delete n[r]:s=!1}))),s&&(!function(e,t,n){e.removeEventListener?e.removeEventListener(t,n,!1):e.detachEvent(t,n)}(this.node,e,o[i][e]),delete a[i][e],delete o[i][e]),this}function l(e,t,n,s){var u=this._EVNET_UID,c=this;o[u]||(o[u]={}),o[u][t]||(o[u][t]=function(e){e=new i(e||window.event),r.each(a[u][t],(function(n){var r;return n&&(r=n.call(c,e),s&&c.off(t,n)),r}),c)}),a[u]||(a[u]={}),a[u][t]?a[u][t].push(n):(a[u][t]=[n],e&&"on"+t in e&&function(e,t,n){e.addEventListener?e.addEventListener(t,n,!1):e.attachEvent("on"+t,n)}(e,t,o[u][t]))}return _p.r(11).createClass("EventHandler",{constructor:function(){this._EVNET_UID=++s},addEventListener:function(e,t){return u.call(this,e,t,!1)},addOnceEventListener:function(e,t){return u.call(this,e,t,!0)},removeEventListener:function(e,t){return c.call(this,e,t)},on:function(e,t){return this.addEventListener.apply(this,arguments)},once:function(e,t){return this.addOnceEventListener.apply(this,arguments)},off:function(){return this.removeEventListener.apply(this,arguments)},fire:function(e,t){return this.trigger.apply(this,arguments)},trigger:function(e,t){return function(e,t,n){var i,a=null,s=o[e._EVNET_UID];s&&(a=s[t])&&(i=r.extend({type:t,target:e},n||{}),a.call(e,i))}(this,e,t),this}})}},_p[35]={value:function(e){var t=_p.r(12),n=_p.r(51),r=_p.r(74),i=_p.r(44),o={},a=/([achlmrqstvz])[\\s,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\\s]*,?\\s*)+)/gi,s=/(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)\\s*,?\\s*/gi,u={a:7,c:6,h:1,l:2,m:2,q:4,s:4,t:2,v:1,z:0};function c(e){var t,n,r,i,o;for(t=[],n=0;n<e.length;n++)for(i=e[n],t.push(o=[]),r=0;r<i.length;r++)o.push(i[r]);return e.isUniform&&(t.isUniform=!0),e.isAbsolute&&(t.isAbsolute=!0),e.isCurve&&(t.isCurve=!0),t}function l(e,t,n){return function r(){var i=Array.prototype.slice.call(arguments,0),o=i.join("\u2400"),a=r.cache=r.cache||{},s=r.count=r.count||[];return a.hasOwnProperty(o)?(function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return e.push(e.splice(n,1)[0])}(s,o),n?n(a[o]):a[o]):(s.length>=1e3&&delete a[s.shift()],s.push(o),a[o]=e.apply(t,i),n?n(a[o]):a[o])}}function h(e,t,n,r,i,o,a,s,u,c){var l,f,d,p,g,m,v,y,x,b,w,_,k,C,S,T,A,E,R,N,P,M,D,L,O,I,B,V,j,z=Math,H=z.PI,F=Math.abs,q=120*H/180,G=H/180*(+i||0),U=[],$=function(e,t,n){return{x:e*z.cos(n)-t*z.sin(n),y:e*z.sin(n)+t*z.cos(n)}};if(c?(b=c[0],w=c[1],y=c[2],x=c[3]):(e=(l=$(e,t,-G)).x,t=l.y,s=(l=$(s,u,-G)).x,u=l.y,z.cos(H/180*i),z.sin(H/180*i),(f=(d=(e-s)/2)*d/(n*n)+(p=(t-u)/2)*p/(r*r))>1&&(n*=f=z.sqrt(f),r*=f),g=n*n,m=r*r,y=(v=(o==a?-1:1)*z.sqrt(F((g*m-g*p*p-m*d*d)/(g*p*p+m*d*d))))*n*p/r+(e+s)/2,x=v*-r*d/n+(t+u)/2,b=z.asin(((t-x)/r).toFixed(9)),w=z.asin(((u-x)/r).toFixed(9)),(b=e<y?H-b:b)<0&&(b=2*H+b),(w=s<y?H-w:w)<0&&(w=2*H+w),a&&b>w&&(b-=2*H),!a&&w>b&&(w-=2*H)),F(_=w-b)>q&&(k=w,C=s,S=u,w=b+q*(a&&w>b?1:-1),U=h(s=y+n*z.cos(w),u=x+r*z.sin(w),n,r,i,0,a,C,S,[w,k,y,x])),_=w-b,T=z.cos(b),A=z.sin(b),E=z.cos(w),R=z.sin(w),O=[s+(P=4/3*n*(N=z.tan(_/4)))*R,u-(M=4/3*r*N)*E],I=[s,u],(L=[e+P*A,t-M*T])[0]=2*(D=[e,t])[0]-L[0],L[1]=2*D[1]-L[1],c)return[L,O,I].concat(U);for(B=[],V=0,j=(U=[L,O,I].concat(U).join().split(",")).length;V<j;V++)B[V]=V%2?$(U[V-1],U[V],G).y:$(U[V],U[V+1],G).x;return B}function f(e,t,n,r,i,o){var a=1/3,s=2/3;return[a*e+s*n,a*t+s*r,a*i+s*n,a*o+s*r,i,o]}function d(e,t){var n=function(e){return function(t,n){return t+e*(n-t)}}(t||.5),r=e,i=r[0],o=r[1],a=r[2],s=r[3],u=r[4],c=r[5],l=r[6],h=r[7],f=n(i,a),d=n(o,s),p=n(a,u),g=n(s,c),m=n(u,l),v=n(c,h),y=n(f,p),x=n(d,g),b=n(p,m),w=n(g,v),_=n(y,b),k=n(x,w);return[[i,o,f,d,y,x,_,k],[_,k,b,w,m,v,l,h]]}o.pathToString=function(e){return"string"==typeof(e=e||this)?e:e instanceof Array?(e=t.flatten(e)).join(",").replace(/,?([achlmqrstvxz]),?/gi,"$1"):void 0},o.parsePathString=l((function(e){var t=[];return e.replace(a,(function(e,n,r){var i=[],o=n.toLowerCase();if(r.replace(s,(function(e,t){t&&i.push(+t)})),"m"==o&&i.length>2&&(t.push([n].concat(i.splice(0,2))),o="l",n="m"==n?"l":"L"),"r"==o)t.push([n].concat(i));else for(;i.length>=u[o]&&(t.push([n].concat(i.splice(0,u[o]))),u[o]););})),t.isUniform=!0,t.toString=o.pathToString,t})),o.pathToAbsolute=l((function(e){var t,n,r,i,a,s,u,c,l=e.isUniform?e:o.parsePathString(o.pathToString(e)),h=[],f=0,d=0,p=0,g=0,m=0;for("M"==l[0][0]&&(p=f=+l[0][1],g=d=+l[0][2],m++,h[0]=["M",f,d]),r=m,s=l.length;r<s;r++){if(h.push(t=[]),(n=l[r])[0]!=n[0].toUpperCase())switch(t[0]=n[0].toUpperCase(),t[0]){case"A":t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=+(n[6]+f),t[7]=+(n[7]+d);break;case"V":t[1]=+n[1]+d;break;case"H":t[1]=+n[1]+f;break;case"M":p=+n[1]+f,g=+n[2]+d;break;default:for(i=1,u=n.length;i<u;i++)t[i]=+n[i]+(i%2?f:d)}else for(a=0,c=n.length;a<c;a++)t[a]=n[a];switch(t[0]){case"Z":f=p,d=g;break;case"H":f=t[1];break;case"V":d=t[1];break;case"M":p=t[t.length-2],g=t[t.length-1];break;default:f=t[t.length-2],d=t[t.length-1]}}return h.isUniform=!0,h.isAbsolute=!0,h.toString=o.pathToString,h})),o.pathToCurve=l((function(e){var t,n,r,i,a,s,u,c,l,d,p,g,m=[];for(e.isAbsolute||(e=o.pathToAbsolute(e)),t=0;t<e.length;t++)if(r=e[t][0],i=e[t].slice(1),"M"!=r){switch("Z"==r&&(c=!0,r="L",i=a),u=i.slice(i.length-2),"H"==r&&(u=[i[0],s[1]],r="L"),"V"==r&&(u=[s[0],i[0]],r="L"),"S"!=r&&"T"!=r||(d=[s[0]+(s[0]-l[0]),s[1]+(s[1]-l[1])]),r){case"L":p=s,g=u;break;case"C":p=i.slice(0,2),g=i.slice(2,4);break;case"S":p=d.slice(),g=i.slice(0,2);break;case"Q":l=i.slice(0,2),p=(i=f.apply(null,s.concat(i))).slice(0,2),g=i.slice(2,4);break;case"T":p=(i=f.apply(null,s.concat(d).concat(i))).slice(0,2),g=i.slice(2,4);break;case"A":for(i=h.apply(null,s.concat(i)),n=0;n in i;)p=i.slice(n,n+2),g=i.slice(n+2,n+4),u=i.slice(n+4,n+6),m.push(["C"].concat(p).concat(g).concat(u)),n+=6}"A"!=r&&m.push(["C"].concat(p).concat(g).concat(u)),s=u,"Q"!=r&&(l=g),c&&(m.push(["Z"]),c=!1)}else a=l=s=i,m.push(e[t]);return m.isUniform=!0,m.isAbsolute=!0,m.isCurve=!0,m.toString=o.pathToString,m})),o.cutBezier=l(d),o.subBezier=function(e,t,n){var r=d(e,t)[0];return n?d(r,n/t)[1]:r},o.pointAtBezier=function(e,t){var i=d(e,t)[0],a=n.parse(i.slice(6)),s=n.parse(i.slice(4,2)),u=r.fromPoints(s,a);return a.tan=0===t?o.pointAtBezier(e,.01).tan:u.normalize(),a},o.bezierLength=l((function(e){function t(e){var t=u*Math.pow(e,4)+c*Math.pow(e,3)+l*Math.pow(e,2)+h*e+f;return t<0&&(t=0),Math.pow(t,.5)}var n,r,i,o,a,s,u,c,l,h,f,d=e;return n=-3*d[0]+9*d[2]-9*d[4]+3*d[6],r=6*d[0]-12*d[2]+6*d[4],i=-3*d[0]+3*d[2],o=-3*d[1]+9*d[3]-9*d[5]+3*d[7],a=6*d[1]-12*d[3]+6*d[5],s=-3*d[1]+3*d[3],u=Math.pow(n,2)+Math.pow(o,2),c=2*(n*r+o*a),l=2*(n*i+o*s)+Math.pow(r,2)+Math.pow(a,2),h=2*(r*i+a*s),f=Math.pow(i,2)+Math.pow(s,2),(t(0)+t(1)+4*(t(.125)+t(.375)+t(.625)+t(.875))+2*(t(.25)+t(.5)+t(.75)))/24}));var p=l((function(e){var t,n,r,i,a,s,u;for(s=[],u=0,t=0,n=e.length;t<n;t++)"M"!=(r=e[t])[0]?"Z"!=r[0]?(a=o.bezierLength(i.concat(r.slice(1))),s.push([u,u+a]),u+=a,i=r.slice(4)):s.push(null):(i=r.slice(1),s.push(null));return s.totalLength=u,s}));o.subPath=function(e,t,n){var r;if(r=t-(n=n||0),(t=(n-=0|n)+(r-=0|r))>1)return o.subPath(e,1,n).concat(o.subPath(e,t-1));e.isCurve||(e=o.pathToCurve(e));var i,a,s,u,c,l,h,f,d,g=p(e),m=g.totalLength,v=m*t,y=m*(n||0),x=[];for(i=0,a=e.length;i<a;i++)if("M"!=e[i][0]){if("Z"!=e[i][0])if(s=g[i][0],c=(u=g[i][1])-s,h=l.concat(e[i].slice(1)),y>u)l=h.slice(h.length-2);else{if(y>=s)d=!0,l=(f=o.subBezier(h,Math.min((v-s)/c,1),(y-s)/c)).slice(0,2),x.push(["M"].concat(f.slice(0,2))),x.push(["C"].concat(f.slice(2)));else if(v>=u)x.push(e[i].slice());else{if(!(v>=s))break;f=o.subBezier(h,(v-s)/c),x.push(["C"].concat(f.slice(2))),d=!1}l=h.slice(h.length-2)}}else l=e[i].slice(1),d&&x.push(e[i].slice());return x.isAbsolute=!0,x.isCurve=!0,x.isUniform=!0,x.toString=o.pathToString,x},o.pointAtPath=function(e,t){e.isCurve||(e=o.pathToCurve(e));var i=o.subPath(e,t),a="Z"==i[i.length-1][0]?i[i.length-2]:i[i.length-1];a=a.slice(1);var s=n.parse(a.slice(4)),u=n.parse(a.slice(2,4));return s.tan=r.fromPoints(u,s).normalize(),s},o.pathLength=l((function(e){return e.isCurve||(e=o.pathToCurve(e)),p(e).totalLength})),o.pathKeyPoints=l((function(e){var t,n,r;for(e.isCurve||(e=o.pathToCurve(e)),r=[],t=0,n=e.length;t<n;t++)"z"!=e[t][0]&&r.push(e[t].slice(e[t].length-2));return r}));var g=l((function(e,t){e.isCurve||(e=o.pathToCurve(e)),t.isCurve||(t=o.pathToCurve(t));var n=c(e),r=c(t);function i(e,t){return e[t||e.i]&&e[t||e.i][0]}function a(e,t){var n=function(e,t){return e[t||e.i]&&e[t||e.i].slice(1)}(e,t);return n&&n.slice(-2)}function s(e){return"Z"==i(e)&&(e.splice(e.i,1),!0)}function u(e){return"M"==i(e)&&(e.o.splice(e.o.i,0,["M"].concat(a(e.o,e.o.i-1))),e.i++,e.o.i++,!0)}function l(e){for(var t,n=1;!t;)t=a(e,e.length-n++);for(e.o.i=e.i;e.length<e.o.length;)s(e.o)||u(e.o)||(e.push(["C"].concat(t).concat(t).concat(t)),e.i++,e.o.i++)}for(n.i=0,r.i=0,n.o=r,r.o=n;n.i<n.length&&r.i<r.length;)s(n)||s(r)||i(n)!=i(r)&&(u(n)||u(r))||(n.i++,r.i++);return n.i==n.length&&l(n),r.i==r.length&&l(r),delete n.i,delete n.o,delete r.i,delete r.o,[n,r]}));return o.alignCurve=g,o.pathTween=function(e,t,n){if(0===n)return e;if(1===n)return t;var r,i,o,a=g(e,t),s=[];for(e=a[0],t=a[1],i=0;i<e.length;i++)for(s.push(r=[]),r.push(e[i][0]),o=1;o<e[i].length;o++)r.push(e[i][o]+n*(t[i][o]-e[i][o]));return s.isUniform=s.isCurve=s.isAbsolute=!0,s},o.transformPath=l((function(e,t){var r,i,a,s,u;for(e.isCurve||(e=o.pathToCurve(e)),s=[],r=0,i=e.length;r<i;r++)for(s.push([e[r][0]]),a=1;a<e[r].length;a+=2)u=e[r].slice(a,a+2),u=t.transformPoint(n.parse(u)),s.push(u);return s})),_p.r(11).extendClass(i,{transformPath:function(e){return o.transformPath(e,this)}}),o}},_p[36]={value:function(e,t,n){var r=_p.r(68),i=_p.r(59),o=_p.r(29);return _p.r(11).createClass("GradientBrush",{base:i,constructor:function(e,t){this.callBase(e,t),this.stops=[]},addStop:function(e,t,n){var i=r.createNode("stop");return t instanceof o||(t=o.parse(t)),void 0===n&&(n=t.get("a")),i.setAttribute("offset",e),i.setAttribute("stop-color",t.toRGB()),n<1&&i.setAttribute("stop-opacity",n),this.node.appendChild(i),this}})}},_p[37]={value:function(e,t,n){var r=_p.r(62);return _p.r(11).createClass("Group",{mixins:[r],base:_p.r(61),constructor:function(){this.callBase("g")}})}},_p[38]={value:function(e,t,n){var r=_p.r(62);return _p.r(11).createClass("HyperLink",{mixins:[r],base:_p.r(61),constructor:function(e){this.callBase("a"),this.setHref(e)},setHref:function(e){return this.node.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",e),this},getHref:function(){return this.node.getAttributeNS("xlink:href")},setTarget:function(e){return this.node.setAttribute("target",e),this},getTarget:function(){return this.node.getAttribute("target")}})}},_p[39]={value:function(e,t,n){return _p.r(11).createClass("Image",{base:_p.r(61),constructor:function(e,t,n,r,i){this.callBase("image"),this.url=e,this.width=t||0,this.height=n||0,this.x=r||0,this.y=i||0,this.update()},update:function(){return this.node.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",this.url),this.node.setAttribute("x",this.x),this.node.setAttribute("y",this.y),this.node.setAttribute("width",this.width),this.node.setAttribute("height",this.height),this},setUrl:function(e){return this.url=""===e?null:e,this.update()},getUrl:function(){return this.url},setWidth:function(e){return this.width=e,this.update()},getWidth:function(){return this.width},setHeight:function(e){return this.height=e,this.update()},getHeight:function(){return this.height},setX:function(e){return this.x=e,this.update()},getX:function(){return this.x},setY:function(e){return this.y=e,this.update()},getY:function(){return this.y}})}},_p[40]={value:function(e,t,n){return _p.r(11).createClass("Line",{base:_p.r(47),constructor:function(e,t,n,r){this.callBase(),this.point1={x:e||0,y:t||0},this.point2={x:n||0,y:r||0},this.update()},setPoint1:function(e,t){return this.point1.x=e,this.point1.y=t,this.update()},setPoint2:function(e,t){return this.point2.x=e,this.point2.y=t,this.update()},getPoint1:function(){return{x:this.point1.x,y:this.point1.y}},getPoint2:function(){return{x:this.point2.x,y:this.point2.y}},update:function(){var e=this.getDrawer();return e.clear(),e.moveTo(this.point1.x,this.point1.y),e.lineTo(this.point2.x,this.point2.y),this}})}},_p[41]={value:function(e,t,n){_p.r(68);var r=_p.r(36);return _p.r(11).createClass("LinearGradientBrush",{base:r,constructor:function(e){this.callBase("linearGradient",e),this.setStartPosition(0,0),this.setEndPosition(1,0)},setStartPosition:function(e,t){return this.node.setAttribute("x1",e),this.node.setAttribute("y1",t),this},setEndPosition:function(e,t){return this.node.setAttribute("x2",e),this.node.setAttribute("y2",t),this},getStartPosition:function(){return{x:+this.node.getAttribute("x1"),y:+this.node.getAttribute("y1")}},getEndPosition:function(){return{x:+this.node.getAttribute("x2"),y:+this.node.getAttribute("y2")}}})}},_p[42]={value:function(e,t,n){var r=_p.r(51),i=_p.r(11).createClass("Marker",{base:_p.r(59),mixins:[_p.r(62),_p.r(76)],constructor:function(){this.callBase("marker"),this.setOrient("auto")},setRef:function(e,t){return 1===arguments.length&&(t=e.y,e=e.x),this.node.setAttribute("refX",e),this.node.setAttribute("refY",t),this},getRef:function(){return new r(+this.node.getAttribute("refX"),+this.node.getAttribute("refY"))},setWidth:function(e){return this.node.setAttribute("markerWidth",this.width=e),this},setOrient:function(e){return this.node.setAttribute("orient",this.orient=e),this},getOrient:function(){return this.orient},getWidth:function(){return+this.width},setHeight:function(e){return this.node.setAttribute("markerHeight",this.height=e),this},getHeight:function(){return+this.height}}),o=_p.r(47);return _p.r(11).extendClass(o,{setMarker:function(e,t){return t=t||"end",e?this.node.setAttribute("marker-"+t,e.toString()):this.node.removeAttribute("marker-"+t),this}}),i}},_p[43]={value:function(e,t,n){var r=_p.r(11),i=_p.r(61),o=r.createClass("Mask",{base:i,mixins:[_p.r(62)],constructor:function(){this.callBase("mask")},mask:function(e){return e.getNode().setAttribute("mask","url(#"+this.getId()+")"),this}});return r.extendClass(i,{maskWith:function(e){return e.mask(this),this}}),o}},_p[44]={value:function(e,t,n){var r=_p.r(12),i=_p.r(26),o=/matrix\\s*\\((.+)\\)/i,a=_p.r(51);function s(e,t){return{a:t.a*e.a+t.c*e.b,b:t.b*e.a+t.d*e.b,c:t.a*e.c+t.c*e.d,d:t.b*e.c+t.d*e.d,e:t.a*e.e+t.c*e.f+t.e,f:t.b*e.e+t.d*e.f+t.f}}function u(e){return e*Math.PI/180}var c=_p.r(11).createClass("Matrix",{constructor:function(){arguments.length?this.setMatrix.apply(this,arguments):this.setMatrix(1,0,0,1,0,0)},translate:function(e,t){return this.m=s(this.m,{a:1,c:0,e,b:0,d:1,f:t}),this},rotate:function(e){var t=u(e),n=Math.sin(t),r=Math.cos(t);return this.m=s(this.m,{a:r,c:-n,e:0,b:n,d:r,f:0}),this},scale:function(e,t){return void 0===t&&(t=e),this.m=s(this.m,{a:e,c:0,e:0,b:0,d:t,f:0}),this},skew:function(e,t){void 0===t&&(t=e);var n=Math.tan(u(e)),r=Math.tan(u(t));return this.m=s(this.m,{a:1,c:n,e:0,b:r,d:1,f:0}),this},inverse:function(){var e,t=this.m,n=t.a,r=t.b,i=t.c,o=t.d,a=t.e,s=t.f;return new c(o/(e=n*o-r*i),-r/e,-i/e,n/e,(i*s-a*o)/e,(r*a-n*s)/e)},setMatrix:function(e,t,n,i,o,a){return this.m=1===arguments.length?r.clone(arguments[0]):{a:e,b:t,c:n,d:i,e:o,f:a},this},getMatrix:function(){return r.clone(this.m)},getTranslate:function(){var e=this.m;return{x:e.e/e.a,y:e.f/e.d}},mergeMatrix:function(e){return new c(s(this.m,e.m))},merge:function(e){return this.mergeMatrix(e)},toString:function(){return this.valueOf().join(" ")},valueOf:function(){var e=this.m;return[e.a,e.b,e.c,e.d,e.e,e.f]},equals:function(e){var t=this.m,n=e.m;return t.a==n.a&&t.b==n.b&&t.c==n.c&&t.d==n.d&&t.e==n.e&&t.f==n.f},transformPoint:function(){return c.transformPoint.apply(null,[].slice.call(arguments).concat([this.m]))},transformBox:function(e){return c.transformBox(e,this.m)},clone:function(){return new c(this.m)}});return c.parse=function(e){var t,n=parseFloat;if(e instanceof Array)return new c({a:e[0],b:e[1],c:e[2],d:e[3],e:e[4],f:e[5]});if(t=o.exec(e)){var r=t[1].split(",");return 6!=r.length&&(r=t[1].split(" ")),new c({a:n(r[0]),b:n(r[1]),c:n(r[2]),d:n(r[3]),e:n(r[4]),f:n(r[5])})}return new c},c.transformPoint=function(e,t,n){return 2===arguments.length&&(n=t,t=e.y,e=e.x),new a(n.a*e+n.c*t+n.e,n.b*e+n.d*t+n.f)},c.transformBox=function(e,t){for(var n,o,a=Number.MAX_VALUE,s=-Number.MAX_VALUE,u=Number.MAX_VALUE,l=-Number.MAX_VALUE,h=[[e.x,e.y],[e.x+e.width,e.y],[e.x,e.y+e.height],[e.x+e.width,e.y+e.height]],f=[];n=h.pop();)o=c.transformPoint(n[0],n[1],t),f.push(o),a=Math.min(a,o.x),s=Math.max(s,o.x),u=Math.min(u,o.y),l=Math.max(l,o.y);return e=new i({x:a,y:u,width:s-a,height:l-u}),r.extend(e,{closurePoints:f}),e},c.getCTM=function(e,t){var n={a:1,b:0,c:0,d:1,e:0,f:0},r=e.shapeNode||e.node;function i(e,t){var n;try{n=t.getScreenCTM().inverse()}catch(e){throw new Error("Can not inverse source element\' ctm.")}return n.multiply(e.getScreenCTM())}switch(t=t||"parent"){case"screen":n=r.getScreenCTM();break;case"doc":case"paper":n=r.getCTM();break;case"view":case"top":e.getPaper()&&(n=void 0!==r.getTransformToElement?r.getTransformToElement(e.getPaper().shapeNode):i(r,e.getPaper().shapeNode));break;case"parent":e.node.parentNode&&(n=void 0!==r.getTransformToElement?r.getTransformToElement(e.node.parentNode):i(r,e.node.parentNode));break;default:t.node&&(n=void 0!==r.getTransformToElement?r.getTransformToElement(t.shapeNode||t.node):i(r,t.shapeNode||t.node))}return n?new c(n.a,n.b,n.c,n.d,n.e,n.f):new c},c}},_p[45]={value:function(e,t,n){var r=_p.r(65),i=_p.r(29),o=_p.r(12),a=_p.r(11).createClass("Palette",{constructor:function(){this.color={}},get:function(e){var t=this.color[e]||r.EXTEND_STANDARD[e]||r.COLOR_STANDARD[e]||"";return t?new i(t):null},getColorValue:function(e){return this.color[e]||r.EXTEND_STANDARD[e]||r.COLOR_STANDARD[e]||""},add:function(e,t){return this.color[e]="string"==typeof t?new i(t).toRGBA():t.toRGBA(),t},remove:function(e){return!!this.color.hasOwnProperty(e)&&(delete this.color[e],!0)}});return o.extend(a,{getColor:function(e){var t=r.EXTEND_STANDARD[e]||r.COLOR_STANDARD[e];return t?new i(t):null},getColorValue:function(e){return r.EXTEND_STANDARD[e]||r.COLOR_STANDARD[e]||""},addColor:function(e,t){return r.EXTEND_STANDARD[e]="string"==typeof t?new i(t).toRGBA():t.toRGBA(),t},removeColor:function(e){return!!r.EXTEND_STANDARD.hasOwnProperty(e)&&(delete r.EXTEND_STANDARD[e],!0)}}),a}},_p[46]={value:function(e,t,n){var r=_p.r(11),i=_p.r(12),o=_p.r(68),a=_p.r(30),s=_p.r(62),u=_p.r(76),c=_p.r(34),l=_p.r(67),h=_p.r(44),f=r.createClass("Paper",{mixins:[s,c,l,u],constructor:function(e){this.callBase(),this.node=this.createSVGNode(),this.node.paper=this,this.node.appendChild(this.resourceNode=o.createNode("defs")),this.node.appendChild(this.shapeNode=o.createNode("g")),this.resources=new a,this.setWidth("100%").setHeight("100%"),e&&this.renderTo(e),this.callMixin()},renderTo:function(e){i.isString(e)&&(e=document.getElementById(e)),this.container=e,e.appendChild(this.node)},createSVGNode:function(){var e=o.createNode("svg");return e.setAttribute("xmlns","http://www.w3.org/2000/svg"),e.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink"),e.setAttribute("version","1.1"),e},getNode:function(){return this.node},getContainer:function(){return this.container},getWidth:function(){return this.node.clientWidth},setWidth:function(e){return this.node.setAttribute("width",e),this},getHeight:function(){return this.node.clientHeight},setHeight:function(e){return this.node.setAttribute("height",e),this},setViewPort:function(e,t,n){var r,i;1==arguments.length&&(e=(r=arguments[0]).center.x,t=r.center.y,n=r.zoom),n=n||1,i=this.getViewBox();var o=new h,a=i.x+i.width/2-e,s=i.y+i.height/2-t;return o.translate(-e,-t),o.scale(n),o.translate(e,t),o.translate(a,s),this.shapeNode.setAttribute("transform","matrix("+o+")"),this.viewport={center:{x:e,y:t},offset:{x:a,y:s},zoom:n},this},getViewPort:function(){if(!this.viewport){var e=this.getViewBox();return{zoom:1,center:{x:e.x+e.width/2,y:e.y+e.height/2},offset:{x:0,y:0}}}return this.viewport},getViewPortMatrix:function(){return h.parse(this.shapeNode.getAttribute("transform"))},getViewPortTransform:function(){var e=this.shapeNode.getCTM();return new h(e.a,e.b,e.c,e.d,e.e,e.f)},getTransform:function(){return this.getViewPortTransform().reverse()},addResource:function(e){return this.resources.appendItem(e),e.node&&this.resourceNode.appendChild(e.node),this},removeResource:function(e){return e.remove&&e.remove(),e.node&&this.resourceNode.removeChild(e.node),this},getPaper:function(){return this}}),d=_p.r(61);return r.extendClass(d,{getPaper:function(){for(var e=this.container;e&&e instanceof f==!1;)e=e.container;return e},isAttached:function(){return!!this.getPaper()},whenPaperReady:function(e){var t=this;function n(){var n=t.getPaper();return n&&e&&e.call(t,n),n}return n()||this.on("add treeadd",(function e(){n()&&(t.off("add",e),t.off("treeadd",e))})),this}}),f}},_p[47]={value:function(e,t,n){var r=_p.r(12),i=_p.r(11).createClass,o=_p.r(61),a=_p.r(68),s=_p.r(35),u=Array.prototype.slice,c=(r.flatten,i("PathDrawer",{constructor:function(e){this.segment=[],this.path=e,this.__clear=!1},getPath:function(){return this.path},redraw:function(){return this._transation=this._transation||[],this.clear()},done:function(){var e=this._transation;return this._transation=null,this.push(e),this},clear:function(){return this._transation?this._transation=[]:this.path.setPathData("M 0 0"),this._clear=!0,this},push:function(){var e,t=u.call(arguments);return this._transation?(this._transation.push(t),this):(this._clear?(e="",this._clear=!1):e=this.path.getPathData(),e=e||"",this.path.setPathData(e+s.pathToString(t)),this)},moveTo:function(e,t){return this.push("M",u.call(arguments))},moveBy:function(e,t){return this.push("m",u.call(arguments))},lineTo:function(e,t){return this.push("L",u.call(arguments))},lineBy:function(e,t){return this.push("l",u.call(arguments))},arcTo:function(e,t,n,r,i,o,a){return this.push("A",u.call(arguments))},arcBy:function(e,t,n,r,i,o,a){return this.push("a",arguments)},carcTo:function(e,t,n,r,i){return this.push("A",[e,e,0].concat(u.call(arguments,1)))},carcBy:function(e,t,n,r,i){return this.push("a",[e,e,0].concat(u.call(arguments,1)))},bezierTo:function(e,t,n,r,i,o){return this.push("C",u.call(arguments))},bezierBy:function(e,t,n,r,i,o){return this.push("c",u.call(arguments))},close:function(){return this.push("z")}}));return i("Path",{base:o,constructor:function(e){this.callBase("path"),e&&this.setPathData(e),this.node.setAttribute("fill",a.defaults.fill),this.node.setAttribute("stroke",a.defaults.stroke)},setPathData:function(e){return e=e||"M0,0",this.pathdata=s.pathToString(e),this.node.setAttribute("d",this.pathdata),this.trigger("shapeupdate",{type:"pathdata"}),this},getPathData:function(){return this.pathdata||""},getDrawer:function(){return new c(this)},isClosed:function(){var e=this.getPathData();return!!~e.indexOf("z")||!!~e.indexOf("Z")}})}},_p[48]={value:function(e,t,n){var r=_p.r(59),i=_p.r(62);_p.r(68);return _p.r(11).createClass("PatternBrush",{base:r,mixins:[i],constructor:function(e){this.callBase("pattern",e),this.node.setAttribute("patternUnits","userSpaceOnUse")},setX:function(e){return this.x=e,this.node.setAttribute("x",e),this},setY:function(e){return this.y=e,this.node.setAttribute("y",e),this},setWidth:function(e){return this.width=e,this.node.setAttribute("width",e),this},setHeight:function(e){return this.height=e,this.node.setAttribute("height",e),this},getWidth:function(){return this.width},getHeight:function(){return this.height}})}},_p[49]={value:function(e,t,n){var r=_p.r(29);return _p.r(11).createClass("Pen",{constructor:function(e,t){this.brush=e,this.width=t||1,this.linecap=null,this.linejoin=null,this.dashArray=null,this.opacity=1},getBrush:function(){return this.brush},setBrush:function(e){return this.brush=e,this},setColor:function(e){return this.setBrush(e)},getColor:function(){return this.brush instanceof r?this.brush:null},getWidth:function(){return this.width},setWidth:function(e){return this.width=e,this},getOpacity:function(){return this.opacity},setOpacity:function(e){this.opacity=e},getLineCap:function(){return this.linecap},setLineCap:function(e){return this.linecap=e,this},getLineJoin:function(){return this.linejoin},setLineJoin:function(e){return this.linejoin=e,this},getDashArray:function(){return this.dashArray},setDashArray:function(e){return this.dashArray=e,this},stroke:function(e){var t=e.node;t.setAttribute("stroke",this.brush.toString()),t.setAttribute("stroke-width",this.getWidth()),this.getOpacity()<1&&t.setAttribute("stroke-opacity",this.getOpacity()),this.getLineCap()&&t.setAttribute("stroke-linecap",this.getLineCap()),this.getLineJoin()&&t.setAttribute("stroke-linejoin",this.getLineJoin()),this.getDashArray()&&t.setAttribute("stroke-dasharray",this.getDashArray())}})}},_p[50]={value:function(e,t,n){return _p.r(11).createClass({base:_p.r(69),constructor:function(e,t,n){this.callBase([0,e],t,n)},getRadius:function(){return this.getSectionArray()[1]},setRadius:function(e){this.setSectionArray([0,e])}})}},_p[51]={value:function(e,t,n){var r=_p.r(11).createClass("Point",{constructor:function(e,t){this.x=e||0,this.y=t||0},offset:function(e,t){return 1==arguments.length&&(t=e.y,e=e.x),new r(this.x+e,this.y+t)},valueOf:function(){return[this.x,this.y]},toString:function(){return this.valueOf().join(" ")},spof:function(){return new r(.5+(0|this.x),.5+(0|this.y))},round:function(){return new r(0|this.x,0|this.y)},isOrigin:function(){return 0===this.x&&0===this.y}});return r.fromPolar=function(e,t,n){return"rad"!=n&&(t=t/180*Math.PI),new r(e*Math.cos(t),e*Math.sin(t))},r.parse=function(e){return e?e instanceof r?e:"string"==typeof e?r.parse(e.split(/\\s*[\\s,]\\s*/)):"0"in e&&"1"in e?new r(e[0],e[1]):void 0:new r},r}},_p[52]={value:function(e,t,n){return _p.r(11).createClass("PointContainer",{base:_p.r(30),constructor:function(){this.callBase()},addPoint:function(e,t){return this.addItem.apply(this,arguments)},prependPoint:function(){return this.prependItem.apply(this,arguments)},appendPoint:function(){return this.appendItem.apply(this,arguments)},removePoint:function(e){return this.removeItem.apply(this,arguments)},addPoints:function(){return this.addItems.apply(this,arguments)},setPoints:function(){return this.setItems.apply(this,arguments)},getPoint:function(){return this.getItem.apply(this,arguments)},getPoints:function(){return this.getItems.apply(this,arguments)},getFirstPoint:function(){return this.getFirstItem.apply(this,arguments)},getLastPoint:function(){return this.getLastItem.apply(this,arguments)}})}},_p[53]={value:function(e,t,n){_p.r(12);return _p.r(11).createClass("Poly",{base:_p.r(47),mixins:[_p.r(52)],constructor:function(e,t){this.callBase(),this.closeable=!!t,this.setPoints(e||[]),this.changeable=!0,this.update()},onContainerChanged:function(){this.changeable&&this.update()},update:function(){var e=this.getDrawer(),t=this.getPoints();if(e.clear(),!t.length)return this;e.moveTo(t[0]);for(var n,r=1,i=t.length;r<i;r++)n=t[r],e.lineTo(n);return this.closeable&&t.length>2&&e.close(),this}})}},_p[54]={value:function(e,t,n){return _p.r(11).createClass("Polygon",{base:_p.r(53),constructor:function(e){this.callBase(e,!0)}})}},_p[55]={value:function(e,t,n){return _p.r(11).createClass("Polyline",{base:_p.r(53),constructor:function(e){this.callBase(e)}})}},_p[56]={value:function(e,t,n){var r=_p.r(36);return _p.r(11).createClass("RadialGradientBrush",{base:r,constructor:function(e){this.callBase("radialGradient",e),this.setCenter(.5,.5),this.setFocal(.5,.5),this.setRadius(.5)},setCenter:function(e,t){return this.node.setAttribute("cx",e),this.node.setAttribute("cy",t),this},getCenter:function(){return{x:+this.node.getAttribute("cx"),y:+this.node.getAttribute("cy")}},setFocal:function(e,t){return this.node.setAttribute("fx",e),this.node.setAttribute("fy",t),this},getFocal:function(){return{x:+this.node.getAttribute("fx"),y:+this.node.getAttribute("fy")}},setRadius:function(e){return this.node.setAttribute("r",e),this},getRadius:function(){return+this.node.getAttribute("r")}})}},_p[57]={value:function(e,t,n){var r={},i=_p.r(12),o=_p.r(51),a=_p.r(26);i.extend(r,{formatRadius:function(e,t,n){var r=Math.floor(Math.min(e/2,t/2));return Math.min(r,n)}});var s=_p.r(11).createClass("Rect",{base:_p.r(47),constructor:function(e,t,n,i,o){this.callBase(),this.x=n||0,this.y=i||0,this.width=e||0,this.height=t||0,this.radius=r.formatRadius(this.width,this.height,o||0),this.update()},update:function(){var e=this.x,t=this.y,n=this.width,r=this.height,i=this.radius,o=this.getDrawer().redraw();return i?(n-=2*i,r-=2*i,o.push("M",e+i,t),o.push("h",n),o.push("a",i,i,0,0,1,i,i),o.push("v",r),o.push("a",i,i,0,0,1,-i,i),o.push("h",-n),o.push("a",i,i,0,0,1,-i,-i),o.push("v",-r),o.push("a",i,i,0,0,1,i,-i),o.push("z")):(o.push("M",e,t),o.push("h",n),o.push("v",r),o.push("h",-n),o.push("z")),o.done(),this},setWidth:function(e){return this.width=e,this.update()},setHeight:function(e){return this.height=e,this.update()},setSize:function(e,t){return this.width=e,this.height=t,this.update()},setBox:function(e){return this.x=e.x,this.y=e.y,this.width=e.width,this.height=e.height,this.update()},getBox:function(){return new a(this.x,this.y,this.width,this.height)},getRadius:function(){return this.radius},setRadius:function(e){return this.radius=r.formatRadius(this.width,this.height,e||0),this.update()},getPosition:function(){return new o(this.x,this.y)},setPosition:function(e,t){if(1==arguments.length){var n=o.parse(arguments[0]);t=n.y,e=n.x}return this.x=e,this.y=t,this.update()},getWidth:function(){return this.width},getHeight:function(){return this.height},getPositionX:function(){return this.x},getPositionY:function(){return this.y},setPositionX:function(e){return this.x=e,this.update()},setPositionY:function(e){return this.y=e,this.update()}});return s}},_p[58]={value:function(e,t,n){var r=_p.r(51);return _p.r(11).createClass("RegularPolygon",{base:_p.r(47),constructor:function(e,t,n,i){this.callBase(),this.radius=t||0,this.side=Math.max(e||3,3),arguments.length>2&&3==arguments.length&&(i=n.y,n=n.x),this.center=new r(n,i),this.draw()},getSide:function(){return this.side},setSide:function(e){return this.side=e,this.draw()},getRadius:function(){return this.radius},setRadius:function(e){return this.radius=e,this.draw()},draw:function(){var e,t=this.radius,n=this.side,i=2*Math.PI/n,o=this.getDrawer();for(o.clear(),o.moveTo(r.fromPolar(t,Math.PI/2,"rad").offset(this.center)),e=0;e<=n;e++)o.lineTo(r.fromPolar(t,i*e+Math.PI/2,"rad").offset(this.center));return o.close(),this}})}},_p[59]={value:function(e,t,n){var r=_p.r(68);return _p.r(11).createClass("Resource",{constructor:function(e,t){this.callBase(),this.node=r.createNode(e),t&&t.addResource(this)},toString:function(){return"url(#"+this.node.id+")"}})}},_p[60]={value:function(e,t,n){return _p.r(11).createClass({base:_p.r(69),constructor:function(e,t){this.callBase([e,t],360,0)},getInnerRadius:function(){return this.getSectionArray()[0]},getOuterRadius:function(){return this.getSectionArray()[1]},setInnerRadius:function(e){this.setSectionArray([e,this.getOuterRadius()])},setOuterRadius:function(e){this.setSectionArray([this.getInnerRadius(),e])}})}},_p[61]={value:function(e,t,n){var r=_p.r(68),i=_p.r(12),o=_p.r(34),a=_p.r(67),s=_p.r(32),u=_p.r(44),c=(_p.r(49),Array.prototype.slice),l=_p.r(26),h=_p.r(11).createClass("Shape",{mixins:[o,a,s],constructor:function(e){this.node=r.createNode(e),this.node.shape=this,this.transform={translate:null,rotate:null,scale:null,matrix:null},this.callMixin()},getId:function(){return this.node.id},setId:function(e){return this.node.id=e,this},getNode:function(){return this.node},getBoundaryBox:function(){var e;try{e=this.node.getBBox()}catch(t){e={x:this.node.clientLeft,y:this.node.clientTop,width:this.node.clientWidth,height:this.node.clientHeight}}return new l(e)},getRenderBox:function(e){var t=this.getBoundaryBox();return this.getTransform(e).transformBox(t)},getWidth:function(){return this.getRenderBox().width},getHeight:function(){return this.getRenderBox().height},getSize:function(){var e=this.getRenderBox();return delete e.x,delete e.y,e},setOpacity:function(e){return this.node.setAttribute("opacity",e),this},getOpacity:function(){var e=this.node.getAttribute("opacity");return e?+e:1},setVisible:function(e){return e?this.node.removeAttribute("display"):this.node.setAttribute("display","none"),this},getVisible:function(){this.node.getAttribute("display")},hasAncestor:function(e){for(var t=this.container;t;){if(t===e)return!0;t=t.container}return!1},getTransform:function(e){return u.getCTM(this,e)},clearTransform:function(){return this.node.removeAttribute("transform"),this.transform={translate:null,rotate:null,scale:null,matrix:null},this.trigger("shapeupdate",{type:"transform"}),this},_applyTransform:function(){var e=this.transform,t=[];return e.translate&&t.push(["translate(",e.translate,")"]),e.rotate&&t.push(["rotate(",e.rotate,")"]),e.scale&&t.push(["scale(",e.scale,")"]),e.matrix&&t.push(["matrix(",e.matrix,")"]),this.node.setAttribute("transform",i.flatten(t).join(" ")),this},setMatrix:function(e){return this.transform.matrix=e,this._applyTransform()},setTranslate:function(e){return this.transform.translate=null!==e&&c.call(arguments)||null,this._applyTransform()},setRotate:function(e){return this.transform.rotate=null!==e&&c.call(arguments)||null,this._applyTransform()},setScale:function(e){return this.transform.scale=null!==e&&c.call(arguments)||null,this._applyTransform()},translate:function(e,t){var n=this.transform.matrix||new u;return void 0===t&&(t=0),this.transform.matrix=n.translate(e,t),this._applyTransform()},rotate:function(e){var t=this.transform.matrix||new u;return this.transform.matrix=t.rotate(e),this._applyTransform()},scale:function(e,t){var n=this.transform.matrix||new u;return void 0===t&&(t=e),this.transform.matrix=n.scale(e,t),this._applyTransform()},skew:function(e,t){var n=this.transform.matrix||new u;return void 0===t&&(t=e),this.transform.matrix=n.skew(e,t),this._applyTransform()},stroke:function(e,t){return e&&e.stroke?e.stroke(this):e?(this.node.setAttribute("stroke",e.toString()),t&&this.node.setAttribute("stroke-width",t)):null===e&&this.node.removeAttribute("stroe"),this},fill:function(e){return e&&this.node.setAttribute("fill",e.toString()),null===e&&this.node.removeAttribute("fill"),this},setAttr:function(e,t){var n=this;return i.isObject(e)&&i.each(e,(function(e,t){n.setAttr(t,e)})),null==t||""===t?this.node.removeAttribute(e):this.node.setAttribute(e,t),this},getAttr:function(e){return this.node.getAttribute(e)}});return h}},_p[62]={value:function(e,t,n){var r=_p.r(30),i=_p.r(12),o=_p.r(11).createClass("ShapeContainer",{base:r,isShapeContainer:!0,handleAdd:function(e,t){var n=this.getShapeNode();n.insertBefore(e.node,n.childNodes[t]||null),e.trigger("add",{container:this}),e.notifyTreeModification&&e.notifyTreeModification("treeadd",this)},handleRemove:function(e,t){this.getShapeNode().removeChild(e.node),e.trigger("remove",{container:this}),e.notifyTreeModification&&e.notifyTreeModification("treeremove",this)},notifyTreeModification:function(e,t){this.eachItem((function(n,r){r.notifyTreeModification&&r.notifyTreeModification(e,t),r.trigger(e,{container:t})}))},getShape:function(e){return this.getItem(e)},addShape:function(e,t){return this.addItem(e,t)},put:function(e){return this.addShape(e),e},appendShape:function(e){return this.addShape(e)},prependShape:function(e){return this.addShape(e,0)},replaceShape:function(e,t){var n=this.indexOf(t);if(-1!==n)return this.removeShape(n),this.addShape(e,n),this},addShapeBefore:function(e,t){var n=this.indexOf(t);return this.addShape(e,n)},addShapeAfter:function(e,t){var n=this.indexOf(t);return this.addShape(e,-1===n?void 0:n+1)},addShapes:function(e){return this.addItems(e)},removeShape:function(e){return this.removeItem(e)},getShapes:function(){return this.getItems()},getShapesByType:function(e){var t=[];return function n(r){e.toLowerCase()==r.getType().toLowerCase()&&t.push(r),r.isShapeContainer&&i.each(r.getShapes(),(function(e){n(e)}))}(this),t},getShapeById:function(e){return this.getShapeNode().getElementById(e).shape},arrangeShape:function(e,t){return this.removeShape(e).addShape(e,t)},getShapeNode:function(){return this.shapeNode||this.node}}),a=_p.r(61);return _p.r(11).extendClass(a,{bringTo:function(e){return this.container.arrangeShape(this,e),this},bringFront:function(){return this.bringTo(this.container.indexOf(this)+1)},bringBack:function(){return this.bringTo(this.container.indexOf(this)-1)},bringTop:function(){return this.container.removeShape(this).addShape(this),this},bringRear:function(){return this.bringTo(0)},bringRefer:function(e,t){return e.container&&(this.remove&&this.remove(),e.container.addShape(this,e.container.indexOf(e)+(t||0))),this},bringAbove:function(e){return this.bringRefer(e)},bringBelow:function(e){return this.bringRefer(e,1)},replaceBy:function(e){return this.container&&(e.bringAbove(this),this.remove()),this}}),o}},_p[63]={value:function(e,t,n){var r=_p.r(44),i=_p.r(12),o=_p.r(51);return _p.r(11).createClass("ShapeEvent",{constructor:function(e){var t=null;i.isObject(e.target)?i.extend(this,e):(this.type=e.type,(t=e.target).correspondingUseElement&&(t=t.correspondingUseElement),this.originEvent=e,this.targetShape=t.shape||t.paper||e.currentTarget&&(e.currentTarget.shape||e.currentTarget.paper),e._kityParam&&i.extend(this,e._kityParam))},preventDefault:function(){var e=this.originEvent;return!e||(e.preventDefault?(e.preventDefault(),e.cancelable):(e.returnValue=!1,!0))},getPosition:function(e,t){if(!this.originEvent)return null;var n=this.originEvent.touches?this.originEvent.touches[t||0]:this.originEvent,i=this.targetShape,a=i.shapeNode||i.node,s=new o(n&&n.clientX||0,n&&n.clientY||0),u=r.transformPoint(s,a.getScreenCTM().inverse());return r.getCTM(i,e||"view").transformPoint(u)},stopPropagation:function(){var e=this.originEvent;if(!e)return!0;e.stopPropagation?e.stopPropagation():e.cancelBubble=!1}})}},_p[64]={value:function(e,t,n){return _p.r(11).createClass("ShapePoint",{base:_p.r(51),constructor:function(e,t){this.callBase(e,t)},setX:function(e){return this.setPoint(e,this.y)},setY:function(e){return this.setPoint(this.x,e)},setPoint:function(e,t){return this.x=e,this.y=t,this.update(),this},getPoint:function(){return this},update:function(){return this.container&&this.container.update&&this.container.update(),this}})}},_p[65]={value:{COLOR_STANDARD:{aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00"},EXTEND_STANDARD:{}}},_p[66]={value:function(e,t,n){var r={3:.2,5:.38196601125,6:.57735026919,8:.541196100146,10:.726542528005,12:.707106781187},i=_p.r(51);return _p.r(11).createClass("Star",{base:_p.r(47),constructor:function(e,t,n,r,o){this.callBase(),this.vertex=e||3,this.radius=t||0,this.shrink=n,this.offset=r||new i(0,0),this.angleOffset=o||0,this.draw()},getVertex:function(){return this.vertex},setVertex:function(e){return this.vertex=e,this.draw()},getRadius:function(){return this.radius},setRadius:function(e){return this.radius=e,this.draw()},getShrink:function(){return this.shrink},setShrink:function(e){return this.shrink=e,this.draw()},getOffset:function(){return this.offset},setOffset:function(e){return this.offset=e,this.draw()},getAngleOffset:function(){return this.angleOffset},setAngleOffset:function(e){return this.angleOffset=e,this.draw()},draw:function(){var e,t,n=this.radius,o=this.radius*(this.shrink||r[this.vertex]||.5),a=this.vertex,s=this.offset,u=180/a,c=this.angleOffset,l=this.getDrawer();for(l.clear(),l.moveTo(i.fromPolar(o,90)),e=1;e<=2*a;e++)t=90+u*e,e%2?l.lineTo(i.fromPolar(n,t+c).offset(s)):l.lineTo(i.fromPolar(o,t));l.close()}})}},_p[67]={value:function(e,t,n){var r=_p.r(11).createClass("ClassList",{constructor:function(e){this._node=e,this._list=e.className.toString().split(" ")},_update:function(){this._node.className=this._list.join(" ")},add:function(e){this._list.push(e),this._update()},remove:function(e){var t=this._list.indexOf(e);~t&&this._list.splice(t,1),this._update()},contains:function(e){return!!~this._list.indexOf(e)}});function i(e){return e.classList||(e.classList=new r(e)),e.classList}return _p.r(11).createClass("Styled",{addClass:function(e){return i(this.node).add(e),this},removeClass:function(e){return i(this.node).remove(e),this},hasClass:function(e){return i(this.node).contains(e)},setStyle:function(e){if(2==arguments.length)return this.node.style[arguments[0]]=arguments[1],this;for(var t in e)e.hasOwnProperty(t)&&(this.node.style[t]=e[t]);return this}})}},_p[68]={value:function(e,t,n){var r=document,i=0,o={createNode:function(e){var t=r.createElementNS(o.ns,e);return t.id="kity_"+e+"_"+i++,t},defaults:{stroke:"none",fill:"none"},xlink:"http://www.w3.org/1999/xlink",ns:"http://www.w3.org/2000/svg"};return o}},_p[69]={value:function(e,t,n){var r=_p.r(51);return _p.r(11).createClass("Sweep",{base:_p.r(47),constructor:function(e,t,n){this.callBase(),this.sectionArray=e||[],this.angle=t||0,this.angleOffset=n||0,this.draw()},getSectionArray:function(){return this.sectionArray},setSectionArray:function(e){return this.sectionArray=e,this.draw()},getAngle:function(){return this.angle},setAngle:function(e){return this.angle=e,this.draw()},getAngleOffset:function(){return this.angleOffset},setAngleOffset:function(e){return this.angleOffset=e,this.draw()},draw:function(){var e,t=this.sectionArray;for(e=0;e<t.length;e+=2)this.drawSection(t[e],t[e+1]);return this},drawSection:function(e,t){var n=this.angle&&(this.angle%360?this.angle%360:360),i=this.angleOffset,o=i+n/2,a=i+n,s=n<0?0:1,u=this.getDrawer();u.redraw(),0!==n?(u.moveTo(r.fromPolar(e,i)),u.lineTo(r.fromPolar(t,i)),t&&(u.carcTo(t,0,s,r.fromPolar(t,o)),u.carcTo(t,0,s,r.fromPolar(t,a))),u.lineTo(r.fromPolar(e,a)),e&&(u.carcTo(e,0,s,r.fromPolar(e,o)),u.carcTo(e,0,s,r.fromPolar(e,i))),u.close(),u.done()):u.done()}})}},_p[70]={value:function(e,t,n){var r=_p.r(71),i=_p.r(62),o=_p.r(68),a=_p.r(12),s={};function u(e){var t=e._cachedFontHash;if(s[t])return s[t];var n=e.getContent();e.setContent("\u767E\u5EA6Fex");var r=e.getBoundaryBox(),i=e.getY();if(!r.height)return{top:0,bottom:0,middle:0};var o=i-r.y+ +e.node.getAttribute("dy"),a=o-r.height;return e.setContent(n),s[t]={top:o,bottom:a,middle:(o+a)/2}}return _p.r(11).createClass("Text",{base:r,mixins:[i],constructor:function(e){this.callBase("text"),void 0!==e&&this.setContent(e),this._buildFontHash()},fixPosition:function(){this.__fixedPosition||this.setVerticalAlign(this.getVerticalAlign())},_buildFontHash:function(){var e=window.getComputedStyle(this.node);this._cachedFontHash=[e.fontFamily,e.fontSize,e.fontStretch,e.fontStyle,e.fontVariant,e.fontWeight].join("-")},_fontChanged:function(e){var t=this._lastFont,n=a.extend({},t,e);if(!t)return this._lastFont=e,!0;var r=t.family!=n.family||t.size!=n.size||t.style!=n.style||t.weight!=n.weight;return this._lastFont=n,r},setX:function(e){return this.node.setAttribute("x",e),this},setPosition:function(e,t){return this.setX(e).setY(t)},setY:function(e){return this.node.setAttribute("y",e),this},getX:function(){return+this.node.getAttribute("x")||0},getY:function(){return+this.node.getAttribute("y")||0},setFont:function(e){return this.callBase(e),this._fontChanged(e)&&(this._buildFontHash(),this.setVerticalAlign(this.getVerticalAlign())),this},setTextAnchor:function(e){return this.node.setAttribute("text-anchor",e),this},getTextAnchor:function(){return this.node.getAttribute("text-anchor")||"start"},setVerticalAlign:function(e){return this.whenPaperReady((function(){var t;switch(e){case"top":t=u(this).top;break;case"bottom":t=u(this).bottom;break;case"middle":t=u(this).middle;break;default:t=0}t&&(this.__fixedPosition=!0),this.node.setAttribute("dy",t)})),this.verticalAlign=e,this},getVerticalAlign:function(){return this.verticalAlign||"baseline"},setStartOffset:function(e){this.shapeNode!=this.node&&this.shapeNode.setAttribute("startOffset",100*e+"%")},addSpan:function(e){return this.addShape(e),this},setPath:function(e){var t=this.shapeNode;if(this.shapeNode==this.node){for(t=this.shapeNode=o.createNode("textPath");this.node.firstChild;)this.shapeNode.appendChild(this.node.firstChild);this.node.appendChild(t)}return t.setAttributeNS(o.xlink,"xlink:href","#"+e.node.id),this.setTextAnchor(this.getTextAnchor()),this}})}},_p[71]={value:function(e,t,n){var r=_p.r(61);return _p.r(11).createClass("TextContent",{base:r,constructor:function(e){this.callBase(e),this.shapeNode=this.shapeNode||this.node,this.shapeNode.setAttribute("text-rendering","geometricPrecision")},clearContent:function(){for(;this.shapeNode.firstChild;)this.shapeNode.removeChild(this.shapeNode.firstChild);return this},setContent:function(e){return this.shapeNode.textContent=e,this},getContent:function(){return this.shapeNode.textContent},appendContent:function(e){return this.shapeNode.textContent+=e,this},setSize:function(e){return this.setFontSize(e)},setFontSize:function(e){return this.setFont({size:e})},setFontFamily:function(e){return this.setFont({family:e})},setFontBold:function(e){return this.setFont({weight:e?"bold":"normal"})},setFontItalic:function(e){return this.setFont({style:e?"italic":"normal"})},setFont:function(e){var t=this.node;return["family","size","weight","style"].forEach((function(n){null===e[n]?t.removeAttribute("font-"+n):e[n]&&t.setAttribute("font-"+n,e[n])})),this},getExtentOfChar:function(e){return this.node.getExtentOfChar(e)},getRotationOfChar:function(e){return this.node.getRotationOfChar(e)},getCharNumAtPosition:function(e,t){return this.node.getCharNumAtPosition(this.node.viewportElement.createSVGPoint(e,t))}})}},_p[72]={value:function(e,t,n){var r=_p.r(71),i=_p.r(67);return _p.r(11).createClass("TextSpan",{base:r,mixins:[i],constructor:function(e){this.callBase("tspan"),this.setContent(e)}})}},_p[73]={value:function(e,t,n){var r=_p.r(68),i=_p.r(11),o=i.createClass("Use",{base:_p.r(61),constructor:function(e){this.callBase("use"),this.ref(e)},ref:function(e){if(!e)return this.node.removeAttributeNS(r.xlink,"xlink:href"),this;var t=e.getId();return t&&this.node.setAttributeNS(r.xlink,"xlink:href","#"+t),"none"===e.node.getAttribute("fill")&&e.node.removeAttribute("fill"),"none"===e.node.getAttribute("stroke")&&e.node.removeAttribute("stroke"),this}}),a=_p.r(61);return i.extendClass(a,{use:function(){return new o(this)}}),o}},_p[74]={value:function(e,t,n){var r=_p.r(51),i=_p.r(44),o=_p.r(11).createClass("Vector",{base:r,constructor:function(e,t){this.callBase(e,t)},square:function(){return this.x*this.x+this.y*this.y},length:function(){return Math.sqrt(this.square())},add:function(e){return new o(this.x+e.x,this.y+e.y)},minus:function(e){return new o(this.x-e.x,this.y-e.y)},dot:function(e){return this.x*e.x+this.y*e.y},project:function(e){return e.multipy(this.dot(e)/e.square())},normalize:function(e){return void 0===e&&(e=1),this.multipy(e/this.length())},multipy:function(e){return new o(this.x*e,this.y*e)},rotate:function(e,t){"rad"==t&&(e=e/Math.PI*180);var n=(new i).rotate(e).transformPoint(this);return new o(n.x,n.y)},vertical:function(){return new o(this.y,-this.x)},reverse:function(){return this.multipy(-1)},getAngle:function(){var e=this.length();if(0===e)return 0;var t=Math.acos(this.x/e);return 180*(this.y>0?1:-1)*t/Math.PI}});return o.fromPoints=function(e,t){return new o(t.x-e.x,t.y-e.y)},o.fromPolar=function(){var e=r.fromPolar.apply(r,arguments);return new o(e.x,e.y)},_p.r(11).extendClass(r,{asVector:function(){return new o(this.x,this.y)}}),o}},_p[75]={value:function(e,t,n){var r=_p.r(62),i=_p.r(76);return _p.r(11).createClass("View",{mixins:[r,i],base:_p.r(75),constructor:function(){this.callBase("view")}})}},_p[76]={value:function(e,t,n){return _p.r(11).createClass("ViewBox",{getViewBox:function(){var e=this.node.getAttribute("viewBox");return null===e?{x:0,y:0,width:this.node.clientWidth||this.node.parentNode.clientWidth,height:this.node.clientHeight||this.node.parentNode.clientHeight}:{x:+(e=e.split(" "))[0],y:+e[1],width:+e[2],height:+e[3]}},setViewBox:function(e,t,n,r){return this.node.setAttribute("viewBox",[e,t,n,r].join(" ")),this}})}},_p[77]={value:function(e,t,n){var r={},i=_p.r(12);r.version="2.0.0",i.extend(r,{createClass:_p.r(11).createClass,extendClass:_p.r(11).extendClass,Utils:i,Browser:_p.r(10),Box:_p.r(26),Bezier:_p.r(24),BezierPoint:_p.r(25),Circle:_p.r(27),Clip:_p.r(28),Color:_p.r(29),Container:_p.r(30),Curve:_p.r(31),Ellipse:_p.r(33),Group:_p.r(37),Gradient:_p.r(36),HyperLink:_p.r(38),Image:_p.r(39),Line:_p.r(40),LinearGradient:_p.r(41),Mask:_p.r(43),Matrix:_p.r(44),Marker:_p.r(42),Palette:_p.r(45),Paper:_p.r(46),Path:_p.r(47),Pattern:_p.r(48),Pen:_p.r(49),Point:_p.r(51),PointContainer:_p.r(52),Polygon:_p.r(54),Polyline:_p.r(55),Pie:_p.r(50),RadialGradient:_p.r(56),Resource:_p.r(59),Rect:_p.r(57),RegularPolygon:_p.r(58),Ring:_p.r(60),Shape:_p.r(61),ShapePoint:_p.r(64),ShapeContainer:_p.r(62),Sweep:_p.r(69),Star:_p.r(66),Text:_p.r(70),TextSpan:_p.r(72),Use:_p.r(73),Vector:_p.r(74),g:_p.r(35),Animator:_p.r(0),Easing:_p.r(1),OpacityAnimator:_p.r(4),RotateAnimator:_p.r(6),ScaleAnimator:_p.r(7),Timeline:_p.r(8),TranslateAnimator:_p.r(9),PathAnimator:_p.r(5),MotionAnimator:_p.r(3),requestFrame:_p.r(2).requestFrame,releaseFrame:_p.r(2).releaseFrame,Filter:_p.r(21),GaussianblurFilter:_p.r(22),ProjectionFilter:_p.r(23),ColorMatrixEffect:_p.r(14),CompositeEffect:_p.r(15),ConvolveMatrixEffect:_p.r(16),Effect:_p.r(17),GaussianblurEffect:_p.r(18),OffsetEffect:_p.r(19)}),n.exports=r}};var moduleMapping={"expose-kity":13};function use(e){_p.r([moduleMapping[e]])}use("expose-kity")})()},7461:()=>{!function(){var e={r:function(t){if(e[t].inited)return e[t].value;if("function"!=typeof e[t].value)return e[t].inited=!0,e[t].value;var n={exports:{}},r=e[t].value(null,n.exports,n);if(e[t].inited=!0,e[t].value=r,void 0!==r)return r;for(var i in n.exports)if(n.exports.hasOwnProperty(i))return e[t].inited=!0,e[t].value=n.exports,n.exports}};e[0]={value:function(t,n,r){var i=e.r(17),o=e.r(11),a=(new i.Marker).pipe((function(){var e=new i.Circle(6);this.addShape(e),this.setRef(6,0).setViewBox(-7,-7,14,14).setWidth(7).setHeight(7),this.dot=e,this.node.setAttribute("markerUnits","userSpaceOnUse")}));o.register("arc",(function(e,t,n,r,o){var s,u,c,l=e.getLayoutBox(),h=t.getLayoutBox(),f=Math.abs,d=[],p=l.x>h.x?"right":"left";e.getMinder().getPaper().addResource(a),s=new i.Point(h.cx,h.cy),u="left"==p?new i.Point(l.right+2,l.cy):new i.Point(l.left-2,l.cy),c=i.Vector.fromPoints(s,u),d.push("M",s),d.push("A",f(c.x),f(c.y),0,0,c.x*c.y>0?0:1,u),n.setMarker(a),a.dot.fill(o),n.setPathData(d)}))}},e[1]={value:function(t,n,r){var i=e.r(17),o=e.r(11),a=(new i.Marker).pipe((function(){var e=new i.Circle(6);this.addShape(e),this.setRef(6,0).setViewBox(-7,-7,14,14).setWidth(7).setHeight(7),this.dot=e,this.node.setAttribute("markerUnits","userSpaceOnUse")}));o.register("arc_tp",(function(e,t,n,r,o){var s,u,c=e.getLayoutBox(),l=t.getLayoutBox(),h=e.getIndex(),f=t.getChildren()[h+1];e.getIndex()>0&&(l=t.getChildren()[h-1].getLayoutBox());Math.abs;var d=[];c.x,l.x;e.getMinder().getPaper().addResource(a),s=new i.Point(l.cx,l.cy),u=new i.Point(c.cx,c.cy);var p=Math.sqrt(Math.pow(s.x-u.x,2)+Math.pow(s.y-u.y,2));if(p=0==e.getIndex()?.4*p:p,i.Vector.fromPoints(s,u),d.push("M",s),d.push("A",p,p,0,0,1,u),n.setMarker(a),a.dot.fill(o),n.setPathData(d),f&&f.getConnection()){var g=f.getConnection(),m=f.getLayoutBox(),v=new i.Point(m.cx,m.cy),y=Math.sqrt(Math.pow(u.x-v.x,2)+Math.pow(u.y-v.y,2));(d=[]).push("M",u),d.push("A",y,y,0,0,1,v),g.setMarker(a),a.dot.fill(o),g.setPathData(d)}}))}},e[2]={value:function(t,n,r){e.r(17);e.r(11).register("bezier",(function(e,t,n){var r=t.getLayoutVertexOut(),i=e.getLayoutVertexIn(),o=t.getLayoutVectorOut().normalize(),a=Math.round,s=Math.abs,u=[];if(u.push("M",a(r.x),a(r.y)),s(o.x)>s(o.y)){var c=(i.x+r.x)/2;u.push("C",c,r.y,c,i.y,i.x,i.y)}else{var l=(i.y+r.y)/2;u.push("C",r.x,l,i.x,l,i.x,i.y)}n.setMarker(null),n.setPathData(u)}))}},e[3]={value:function(t,n,r){e.r(17);e.r(11).register("fish-bone-master",(function(e,t,n){var r=t.getLayoutVertexOut(),i=e.getLayoutVertexIn(),o=Math.abs,a=o(r.y-i.y),s=o(r.x-i.x),u=[];u.push("M",r.x,r.y),u.push("h",s-a),u.push("L",i.x,i.y),n.setMarker(null),n.setPathData(u)}))}},e[4]={value:function(t,n,r){e.r(17);e.r(11).register("l",(function(e,t,n){var r=t.getLayoutVertexOut(),i=e.getLayoutVertexIn(),o=t.getLayoutVectorOut(),a=[],s=Math.round,u=Math.abs;a.push("M",r.round()),u(o.x)>u(o.y)?a.push("H",s(i.x)):a.push("V",i.y),a.push("L",i),n.setPathData(a)}))}},e[5]={value:function(t,n,r){e.r(17);e.r(11).register("poly",(function(e,t,n,r){var i=t.getLayoutVertexOut(),o=e.getLayoutVertexIn(),a=t.getLayoutVectorOut().normalize(),s=Math.round,u=Math.abs,c=[];switch(c.push("M",s(i.x),s(i.y)),!0){case u(a.x)>u(a.y)&&a.x<0:c.push("h",-t.getStyle("margin-left")),c.push("v",o.y-i.y),c.push("H",o.x);break;case u(a.x)>u(a.y)&&a.x>=0:c.push("h",t.getStyle("margin-right")),c.push("v",o.y-i.y),c.push("H",o.x);break;case u(a.x)<=u(a.y)&&a.y<0:c.push("v",-t.getStyle("margin-top")),c.push("h",o.x-i.x),c.push("V",o.y);break;case u(a.x)<=u(a.y)&&a.y>=0:c.push("v",t.getStyle("margin-bottom")),c.push("h",o.x-i.x),c.push("V",o.y)}n.setMarker(null),n.setPathData(c)}))}},e[6]={value:function(t,n,r){var i=e.r(17);e.r(11).register("under",(function(e,t,n,r,o){var a,s,u,c,l=e.getLayoutBox(),h=t.getLayoutBox(),f=(Math.abs,[]),d=l.x>h.x?"right":"left",p=(e.getStyle("connect-radius"),l.bottom+3),g="sub"==t.getType()?h.bottom+3:h.cy;"right"==d?(a=new i.Point(h.right,g),s=new i.Point(l.left-10,p),u=new i.Point(l.right,p)):(a=new i.Point(h.left,g),s=new i.Point(l.right+10,p),u=new i.Point(l.left,p)),c=(a.x+s.x)/2,f.push("M",a),f.push("C",c,a.y,c,s.y,s),f.push("L",u),n.setMarker(null),n.setPathData(f)}))}},e[7]={value:function(t,n,r){var i,o=e.r(17),a=e.r(19);-1!=location.href.indexOf("boxv")&&(Object.defineProperty(o.Box.prototype,"visualization",{get:function(){return i?i.setBox(this):null}}),a.registerInitHook((function(){this.on("paperrender",(function(){(i=new o.Rect).fill("rgba(200, 200, 200, .5)"),i.stroke("orange"),this.getRenderContainer().addShape(i)}))})))}},e[8]={value:function(t,n,r){var i=e.r(19),o={enableAnimation:!0,layoutAnimationDuration:300,viewAnimationDuration:100,zoomAnimationDuration:300},a={};i.registerInitHook((function(){this.setDefaultOptions(o),this.getOption("enableAnimation")||this.disableAnimation()})),i.prototype.enableAnimation=function(){for(var e in o)o.hasOwnProperty(e)&&this.setOption(a[e])},i.prototype.disableAnimation=function(){for(var e in o)o.hasOwnProperty(e)&&(a[e]=this.getOption(e),this.setOption(e,0))}}},e[9]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19)),a=(e.r(21),e.r(13)),s=i.createClass("Command",{constructor:function(){this._isContentChange=!0,this._isSelectionChange=!1},execute:function(e,t){throw new Error("Not Implement: Command.execute()")},setContentChanged:function(e){this._isContentChange=!!e},isContentChanged:function(){return this._isContentChange},setSelectionChanged:function(e){this._isSelectionChange=!!e},isSelectionChanged:function(){return this._isContentChange},queryState:function(e){return 0},queryValue:function(e){return 0},isNeedUndo:function(){return!0}});s.STATE_NORMAL=0,s.STATE_ACTIVE=1,s.STATE_DISABLED=-1,i.extendClass(o,{_getCommand:function(e){return this._commands[e.toLowerCase()]},_queryCommand:function(e,t,n){var r=this._getCommand(e);if(r){var i=r["query"+t];if(i)return i.apply(r,[this].concat(n))}return 0},queryCommandState:function(e){return this._queryCommand(e,"State",[].slice.call(arguments,1))},queryCommandValue:function(e){return this._queryCommand(e,"Value",[].slice.call(arguments,1))},execCommand:function(e){if(!e)return null;e=e.toLowerCase();var t,n,r,i=[].slice.call(arguments,1),o=this;return r={command:t=this._getCommand(e),commandName:e.toLowerCase(),commandArgs:i},!(!t||!~this.queryCommandState(e))&&(this._hasEnterExecCommand?(n=t.execute.apply(t,[o].concat(i)),this._hasEnterExecCommand||this._interactChange()):(this._hasEnterExecCommand=!0,this._fire(new a("beforeExecCommand",r,!0))||(this._fire(new a("preExecCommand",r,!1)),n=t.execute.apply(t,[o].concat(i)),this._fire(new a("execCommand",r,!1)),t.isContentChanged()&&this._firePharse(new a("contentchange")),this._interactChange()),this._hasEnterExecCommand=!1),void 0===n?null:n)}}),r.exports=s}},e[10]={value:function(t,n,r){e.r(33);function i(e,t){t(e),e.children&&e.children.forEach((function(e){i(e,t)}))}return function(e){switch(e.version||(e.root?"1.4.0":"1.1.3")){case"1.1.3":!function(e){var t=e.data.currentstyle;delete e.data.currentstyle,"bottom"==t?(e.template="structure",e.theme="snow"):"default"==t&&(e.template="default",e.theme="classic");i(e,(function(e){var t=e.data;"PriorityIcon"in t&&(t.priority=t.PriorityIcon,delete t.PriorityIcon),"ProgressIcon"in t&&(t.progress=1+(t.ProgressIcon-1<<1),delete t.ProgressIcon),delete t.point,delete t.layout}))}(e);case"1.2.0":case"1.2.1":!function(e){i(e,(function(e){var t=e.data;delete t.layout_bottom_offset,delete t.layout_default_offset,delete t.layout_filetree_offset}))}(e);case"1.3.0":case"1.3.1":case"1.3.2":case"1.3.3":case"1.3.4":case"1.3.5":!function(e){e.root={data:e.data,children:e.children},delete e.data,delete e.children}(e)}return e}}},e[11]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(20),s=e.r(19),u=e.r(21),c={};function l(e,t){c[e]=t}l("default",(function(e,t,n){n.setPathData(["M",t.getLayoutVertexOut(),"L",e.getLayoutVertexIn()])})),i.extendClass(u,{getConnect:function(){return this.data.connect||"default"},getConnectProvider:function(){return c[this.getConnect()]||c.default},getConnection:function(){return this._connection||null}}),i.extendClass(s,{getConnectContainer:function(){return this._connectContainer},createConnect:function(e){if(!e.isRoot()){var t=new i.Path;e._connection=t,this._connectContainer.addShape(t),this.updateConnect(e)}},removeConnect:function(e){var t=this;e.traverse((function(e){t._connectContainer.removeShape(e._connection),e._connection=null}))},updateConnect:function(e){var t=e._connection,n=e.parent;if(n&&t)if(n.isCollapsed())t.setVisible(!1);else{t.setVisible(!0);var r=e.getConnectProvider(),i=e.getStyle("connect-color")||"white",o=e.getStyle("connect-width")||2;t.stroke(i,o),r(e,n,t,o,i),o%2==0?t.setTranslate(.5,.5):t.setTranslate(0,0)}}}),a.register("Connect",{init:function(){this._connectContainer=(new i.Group).setId(o.uuid("minder_connect_group")),this.getRenderContainer().prependShape(this._connectContainer)},events:{nodeattach:function(e){this.createConnect(e.node)},nodedetach:function(e){this.removeConnect(e.node)},"layoutapply layoutfinish noderender":function(e){this.updateConnect(e.node)}}}),n.register=l}},e[12]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19)),a=(e.r(21),e.r(13)),s=e.r(10),u=e.r(25),c={};n.registerProtocol=function(e,t){for(var n in c[e]=t,c)c.hasOwnProperty(n)&&(c[n]=c[n],c[n].name=n)},n.getRegisterProtocol=function(e){return void 0===e?c:c[e]||null},i.extendClass(o,{setup:function(e){if("string"==typeof e&&(e=document.querySelector(e)),e){var t=e.getAttribute("minder-data-type");if(t in c){var n=e.textContent;e.textContent=null,this.renderTo(e),this.importData(t,n)}return this}},exportJson:function(){var e={root:function e(t){var n={};n.data=t.getData();var r=t.getChildren();n.children=[];for(var i=0;i<r.length;i++)n.children.push(e(r[i]));return n}(this.getRoot())};return e.template=this.getTemplate(),e.theme=this.getTheme(),e.version=o.version,JSON.parse(JSON.stringify(e))},Text2Children:function(e,t){if(e instanceof kityminder.Node){for(var n,r=[],i={},o=0,a=/^(\\t|\\x20{4})/,s=t.split(/\\r|\\n|\\r\\n/),u="",c=0,l=this;void 0!==(u=s[c++]);)if(!h(u=u.replace(/&nbsp;/g,"")))if(o=d(u),n=f(u),0===o)i={},r.push(n),i[0]=r[r.length-1];else{if(!i[o-1])throw new Error("Invalid local format");p(i[o-1],n),i[o]=n}!function e(t,n){for(var r=0,i=n.length;r<i;r++){var o=l.createNode(null,t);o.setData("text",n[r].data.text||""),e(o,n[r].children)}}(e,r),l.refresh()}function h(e){return""===e&&!/\\S/.test(e)}function f(e){return{data:{text:e.replace(/^(\\t|\\x20{4})+/,"").replace(/(\\t|\\x20{4})+$/,"")},children:[]}}function d(e){for(var t=0;a.test(e);)e=e.replace(a,""),t++;return t}function p(e,t){e.children.push(t)}},exportNode:function(e){var t={};t.data=e.getData();var n=e.getChildren();t.children=[];for(var r=0;r<n.length;r++)t.children.push(this.exportNode(n[r]));return t},importNode:function(e,t){var n=t.data;for(var r in e.data={},n)e.setData(r,n[r]);for(var i=t.children||[],o=0;o<i.length;o++){var a=this.createNode(null,e);this.importNode(a,i[o])}return e},importJson:function(e){if(e){for(this._fire(new a("preimport",null,!1));this._root.getChildren().length;)this.removeNode(this._root.getChildren()[0]);return e=s(e),this.importNode(this._root,e.root),this.setTemplate(e.template||"default"),this.setTheme(e.theme||null),this.refresh(),this.fire("import"),this._firePharse({type:"contentchange"}),this._interactChange(),this}},exportData:function(e,t){var n,r;return n=this.exportJson(),!e||(r=c[e])&&r.encode?(this._fire(new a("beforeexport",{json:n,protocolName:e,protocol:r})),u.resolve(r.encode(n,this,t))):u.reject(new Error("Not supported protocol:"+e))},importData:function(e,t,n){var r,i=this;if(e&&(!(r=c[e])||!r.decode))return u.reject(new Error("Not supported protocol:"+e));var o={local:t,protocolName:e,protocol:r};return this._fire(new a("beforeimport",o)),u.resolve(r.decode(t,this,n)).then((function(e){return i.importJson(e),e}))},decodeData:function(e,t,n){var r;if(e&&(!(r=c[e])||!r.decode))return u.reject(new Error("Not supported protocol:"+e));var i={local:t,protocolName:e,protocol:r};return this._fire(new a("beforeimport",i)),u.resolve(r.decode(t,this,n))}})}},e[13]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19)),a=i.createClass("MindEvent",{constructor:function(e,t,n){(t=t||{}).getType&&"ShapeEvent"==t.getType()?(this.kityEvent=t,this.originEvent=t.originEvent):t.target&&t.preventDefault?this.originEvent=t:i.Utils.extend(this,t),this.type=e,this._canstop=n||!1},getPosition:function(e){if(this.kityEvent)return e&&"minder"!=e?this.kityEvent.getPosition.call(this.kityEvent,e):this.kityEvent.getPosition(this.minder.getRenderContainer())},getTargetNode:function(){var e=this.kityEvent&&this.kityEvent.targetShape;if(!e)return null;for(;!e.minderNode&&e.container;)e=e.container;var t=e.minderNode;return t&&e.getOpacity()<1?null:t||null},stopPropagation:function(){this._stoped=!0},stopPropagationImmediately:function(){this._immediatelyStoped=!0,this._stoped=!0},shouldStopPropagation:function(){return this._canstop&&this._stoped},shouldStopPropagationImmediately:function(){return this._canstop&&this._immediatelyStoped},preventDefault:function(){this.originEvent.preventDefault()},isRightMB:function(){var e=!1;return!!this.originEvent&&("which"in this.originEvent?e=3==this.originEvent.which:"button"in this.originEvent&&(e=2==this.originEvent.button),e)},getKeyCode:function(){var e=this.originEvent;return e.keyCode||e.which}});o.registerInitHook((function(e){this._initEvents()})),i.extendClass(o,{_initEvents:function(){this._eventCallbacks={}},_resetEvents:function(){this._initEvents(),this._bindEvents()},_bindEvents:function(){this._paper.on("click dblclick mousedown contextmenu mouseup mousemove mouseover mousewheel DOMMouseScroll touchstart touchmove touchend dragenter dragleave drop",this._firePharse.bind(this)),window&&window.addEventListener("resize",this._firePharse.bind(this))},dispatchKeyEvent:function(e){this._firePharse(e)},_firePharse:function(e){var t,n,r;"DOMMouseScroll"==e.type&&(e.type="mousewheel",e.wheelDelta=e.originEvent.wheelDelta=-10*e.originEvent.detail,e.wheelDeltaX=e.originEvent.mozMovementX,e.wheelDeltaY=e.originEvent.mozMovementY),t=new a("before"+e.type,e,!0),this._fire(t)||(n=new a("pre"+e.type,e,!0),r=new a(e.type,e,!0),(this._fire(n)||this._fire(r))&&this._fire(new a("after"+e.type,e,!1)))},_interactChange:function(e){var t=this;t._interactScheduled||(setTimeout((function(){t._fire(new a("interactchange")),t._interactScheduled=!1}),100),t._interactScheduled=!0)},_listen:function(e,t){(this._eventCallbacks[e]||(this._eventCallbacks[e]=[])).push(t)},_fire:function(e){e.minder=this;var t=this.getStatus(),n=this._eventCallbacks[e.type.toLowerCase()]||[];if(t&&(n=n.concat(this._eventCallbacks[t+"."+e.type.toLowerCase()]||[])),0!==n.length){this.getStatus();for(var r=0;r<n.length&&(n[r].call(this,e),!e.shouldStopPropagationImmediately());r++);return e.shouldStopPropagation()}},on:function(e,t){var n=this;return e.split(/\\s+/).forEach((function(e){n._listen(e.toLowerCase(),t)})),this},off:function(e,t){var n,r,i,o,a=e.split(/\\s+/);for(n=0;n<a.length;n++)if(i=this._eventCallbacks[a[n].toLowerCase()]){for(o=null,r=0;r<i.length;r++)i[r]==t&&(o=r);null!==o&&i.splice(o,1)}},fire:function(e,t){var n=new a(e,t);return this._fire(n),this}}),r.exports=a}},e[14]={value:function(t,n,r){var i=e.r(17),o=e.r(19);o.registerInitHook((function(){this.on("beforemousedown",(function(e){this.focus(),e.preventDefault()})),this.on("paperrender",(function(){this.focus()}))})),i.extendClass(o,{focus:function(){this.isFocused()||(this._renderTarget.classList.add("focus"),this.renderNodeBatch(this.getSelectedNodes()));return this.fire("focus"),this},blur:function(){this.isFocused()&&(this._renderTarget.classList.remove("focus"),this.renderNodeBatch(this.getSelectedNodes()));return this.fire("blur"),this},isFocused:function(){var e=this._renderTarget;return e&&e.classList.contains("focus")}})}},e[15]={value:function(e,t,n){var r={Backspace:8,Tab:9,Enter:13,Shift:16,Control:17,Alt:18,CapsLock:20,Esc:27,Spacebar:32,PageUp:33,PageDown:34,End:35,Home:36,Insert:45,Left:37,Up:38,Right:39,Down:40,direction:{37:1,38:1,39:1,40:1},Del:46,NumLock:144,Cmd:91,CmdFF:224,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,"`":192,"=":187,"-":189,"/":191,".":190,controlKeys:{16:1,17:1,18:1,20:1,91:1,224:1},notContentChange:{13:1,9:1,33:1,34:1,35:1,36:1,16:1,17:1,18:1,20:1,91:1,37:1,38:1,39:1,40:1,113:1,114:1,115:1,144:1,27:1},isSelectedNodeKey:{37:1,38:1,39:1,40:1,13:1,9:1}};for(var i in r)r.hasOwnProperty(i)&&(r[i.toLowerCase()]=r[i]);var o="a".charCodeAt(0);"abcdefghijklmnopqrstuvwxyz".split("").forEach((function(e){r[e]=e.charCodeAt(0)-o+65}));var a=9;do{r[a.toString()]=a+48}while(--a);n.exports=r}},e[16]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19));o.registerInitHook((function(e){this.setDefaultOptions({enableKeyReceiver:!0}),this.getOption("enableKeyReceiver")&&this.on("paperrender",(function(){this._initKeyReceiver()}))})),i.extendClass(o,{_initKeyReceiver:function(){if(!this._keyReceiver){var e=this._keyReceiver=document.createElement("input");e.classList.add("km-receiver"),this._renderTarget.appendChild(e);var t,n,r=this;t=e,n=function(t){switch(t.type){case"blur":r.blur();break;case"focus":r.focus();break;case"input":e.value=null}r._firePharse(t),t.preventDefault()},"keydown keyup keypress copy paste blur focus input".split(" ").forEach((function(e){t.addEventListener(e,n,!1)})),this.on("focus",(function(){e.select(),e.focus()})),this.on("blur",(function(){e.blur()})),this.isFocused()&&(e.select(),e.focus())}}})}},e[17]={value:function(e,t,n){n.exports=window.kity}},e[18]={value:function(t,n,r){var i,o=e.r(17),a=e.r(33),s=e.r(19),u=e.r(21),c=(e.r(13),e.r(9),{});var l=o.createClass("Layout",{doLayout:function(e,t){throw new Error("Not Implement: Layout.doLayout()")},align:function(e,t,n){var r=this;n=n||0,e.forEach((function(e){var i=r.getTreeBox([e]),o=e.getLayoutTransform();switch(t){case"left":return o.translate(n-i.left,0);case"right":return o.translate(n-i.right,0);case"top":return o.translate(0,n-i.top);case"bottom":return o.translate(0,n-i.bottom)}}))},stack:function(e,t,n){var r=this,i=0;return n=n||function(e,t,n){return e.getStyle({x:"margin-right",y:"margin-bottom"}[n])+t.getStyle({x:"margin-left",y:"margin-top"}[n])},e.forEach((function(e,o,a){var s=r.getTreeBox([e]),u={x:s.width,y:s.height}[t],c={x:s.left,y:s.top}[t],l=e.getLayoutTransform();"x"==t?l.translate(i-c,0):l.translate(0,i-c),i+=u,a[o+1]&&(i+=n(e,a[o+1],t))})),i},move:function(e,t,n){e.forEach((function(e){e.getLayoutTransform().translate(t,n)}))},getBranchBox:function(e){var t,n,r,i,a=new o.Box;for(t=0;t<e.length;t++)r=(n=e[t]).getLayoutTransform(),i=n.getContentBox(),a=a.merge(r.transformBox(i));return a},getTreeBox:function(e){var t,n,r,i,a=new o.Box;for(e instanceof Array||(e=[e]),t=0;t<e.length;t++)r=(n=e[t]).getLayoutTransform(),i=n.getContentBox(),n.isExpanded()&&n.children.length&&(i=i.merge(this.getTreeBox(n.children))),a=a.merge(r.transformBox(i));return a},getOrderHint:function(e){return[]}});l.register=function(e,t){c[e]=t,i=i||e},s.registerInitHook((function(e){this.refresh()})),a.extend(s,{getLayoutList:function(){return c},getLayoutInstance:function(e){var t=c[e];if(!t)throw new Error("Missing Layout: "+e);return new t}}),o.extendClass(u,{getLayout:function(){var e=this.getData("layout");return e=e||(this.isRoot()?i:this.parent.getLayout())},setLayout:function(e){return e&&("inherit"==e?this.setData("layout"):this.setData("layout",e)),this},layout:function(e){return this.setLayout(e).getMinder().layout(),this},getLayoutInstance:function(){return s.getLayoutInstance(this.getLayout())},getOrderHint:function(e){return this.parent.getLayoutInstance().getOrderHint(this)},getLayoutTransform:function(){return this._layoutTransform||new o.Matrix},getGlobalLayoutTransformPreview:function(){var e=this.parent?this.parent.getLayoutTransform():new o.Matrix,t=this.getLayoutTransform(),n=this.getLayoutOffset();return n&&(t=t.clone().translate(n.x,n.y)),e.merge(t)},getLayoutPointPreview:function(){return this.getGlobalLayoutTransformPreview().transformPoint(new o.Point)},getGlobalLayoutTransform:function(){return this._globalLayoutTransform?this._globalLayoutTransform:this.parent?this.parent.getGlobalLayoutTransform():new o.Matrix},setLayoutTransform:function(e){return this._layoutTransform=e,this},setGlobalLayoutTransform:function(e){return this.getRenderContainer().setMatrix(this._globalLayoutTransform=e),this},setVertexIn:function(e){this._vertexIn=e},setVertexOut:function(e){this._vertexOut=e},getVertexIn:function(){return this._vertexIn||new o.Point},getVertexOut:function(){return this._vertexOut||new o.Point},getLayoutVertexIn:function(){return this.getGlobalLayoutTransform().transformPoint(this.getVertexIn())},getLayoutVertexOut:function(){return this.getGlobalLayoutTransform().transformPoint(this.getVertexOut())},setLayoutVectorIn:function(e){return this._layoutVectorIn=e,this},setLayoutVectorOut:function(e){return this._layoutVectorOut=e,this},getLayoutVectorIn:function(){return this._layoutVectorIn||new o.Vector},getLayoutVectorOut:function(){return this._layoutVectorOut||new o.Vector},getLayoutBox:function(){return this.getGlobalLayoutTransform().transformBox(this.getContentBox())},getLayoutPoint:function(){return this.getGlobalLayoutTransform().transformPoint(new o.Point)},getLayoutOffset:function(){if(!this.parent)return new o.Point;var e=this.getData("layout_"+this.parent.getLayout()+"_offset");return e?new o.Point(e.x,e.y):new o.Point},setLayoutOffset:function(e){return this.parent?(this.setData("layout_"+this.parent.getLayout()+"_offset",e?{x:e.x,y:e.y}:void 0),this):this},hasLayoutOffset:function(){return!!this.getData("layout_"+this.parent.getLayout()+"_offset")},resetLayoutOffset:function(){return this.setLayoutOffset(null)},getLayoutRoot:function(){return this.isLayoutRoot()?this:this.parent.getLayoutRoot()},isLayoutRoot:function(){return this.getData("layout")||this.isRoot()}}),o.extendClass(s,{layout:function(){var e=this.getOption("layoutAnimationDuration");function t(e,n){e.isExpanded(),e.children.forEach((function(e){t(e,n)})),e.getLayoutInstance().doLayout(e,e.getChildren(),n)}this.getRoot().traverse((function(e){e.setLayoutTransform(null)})),t(this.getRoot(),1),t(this.getRoot(),2);var n=this;return this.applyLayoutResult(this.getRoot(),e,(function(){setTimeout((function(){n.fire("layoutallfinish")}),0)})),this.fire("layout")},refresh:function(){return this.getRoot().renderTree(),this.layout().fire("contentchange")._interactChange(),this},applyLayoutResult:function(e,t,n){e=e||this.getRoot();var r=this,i=e.getComplex();function a(){--i||n&&n()}function s(e,t){e.setGlobalLayoutTransform(t),r.fire("layoutapply",{node:e,matrix:t})}return i>200&&(t=0),function e(n,i){var u=n.getLayoutTransform().merge(i.clone()),c=n.getGlobalLayoutTransform()||new o.Matrix,l=n.getLayoutOffset();u.translate(l.x,l.y),u.m.e=Math.round(u.m.e),u.m.f=Math.round(u.m.f),n._layoutTimeline&&(n._layoutTimeline.stop(),n._layoutTimeline=null),t?n._layoutTimeline=new o.Animator(c,u,s).start(n,t,"ease").on("finish",(function(){setTimeout((function(){s(n,u),r.fire("layoutfinish",{node:n,matrix:u}),a()}),150)})):(s(n,u),r.fire("layoutfinish",{node:n,matrix:u}),a());for(var h=0;h<n.children.length;h++)e(n.children[h],u)}(e,e.parent?e.parent.getGlobalLayoutTransform():new o.Matrix),this}}),r.exports=l}},e[19]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=[],s=i.createClass("Minder",{constructor:function(e){this._options=o.extend({},e);for(var t,n=a.slice();n.length;)"function"==typeof(t=n.shift())&&t.call(this,this._options);this.fire("finishInitHook")}});s.version="1.4.43",s.registerInitHook=function(e){a.push(e)},r.exports=s}},e[20]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(19),s={};n.register=function(e,t){s[e]=t},a.registerInitHook((function(){this._initModules()})),i.extendClass(a,{_initModules:function(){var e,t,n,r,i,a,u,c=s,l=this._options.modules||o.keys(c);this._commands={},this._query={},this._modules={},this._rendererClasses={};var h=this;for(e=0;e<l.length;e++)if(c[t=l[e]]&&(r="function"==typeof c[t]?c[t].call(h):c[t],this._modules[t]=r,r)){for(t in r.defaultOptions&&h.setDefaultOptions(r.defaultOptions),r.init&&r.init.call(h,this._options),i=r.commands)this._commands[t.toLowerCase()]=new i[t];if(a=r.events)for(n in a)h.on(n,a[n]);if(u=r.renderers)for(n in u)this._rendererClasses[n]=this._rendererClasses[n]||[],o.isArray(u[n])?this._rendererClasses[n]=this._rendererClasses[n].concat(u[n]):this._rendererClasses[n].push(u[n]);r.commandShortcutKeys&&this.addCommandShortcutKeys(r.commandShortcutKeys)}},_garbage:function(){for(this.clearSelect();this._root.getChildren().length;)this._root.removeChild(0)},destroy:function(){var e=this._modules;for(var t in this._resetEvents(),this._garbage(),e)e[t].destroy&&e[t].destroy.call(this)},reset:function(){var e=this._modules;for(var t in this._garbage(),e)e[t].reset&&e[t].reset.call(this)}})}},e[21]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(19),s=i.createClass("MinderNode",{constructor:function(e){this.parent=null,this.root=this,this.children=[],this.data={id:o.guid(),created:+new Date},this.initContainers(),o.isString(e)?this.setText(e):o.isObject(e)&&o.extend(this.data,e)},initContainers:function(){this.rc=(new i.Group).setId(o.uuid("minder_node")),this.rc.minderNode=this},isRoot:function(){return this.root===this},isLeaf:function(){return 0===this.children.length},getRoot:function(){return this.root||this},getParent:function(){return this.parent},getSiblings:function(){var e=this.parent.children,t=[],n=this;return e.forEach((function(e){e!=n&&t.push(e)})),t},getLevel:function(){for(var e=0,t=this.parent;t;)e++,t=t.parent;return e},getComplex:function(){var e=0;return this.traverse((function(){e++})),e},getType:function(e){return this.type=["root","main","sub"][Math.min(this.getLevel(),2)],this.type},isAncestorOf:function(e){for(var t=e.parent;t;){if(t==this)return!0;t=t.parent}return!1},getData:function(e){return e?this.data[e]:this.data},setData:function(e,t){if("object"==typeof e){var n=e;for(e in n)n.hasOwnProperty(e)&&(this.data[e]=n[e])}else this.data[e]=t;return this},setText:function(e){return this.data.text=e},getText:function(){return this.data.text||null},preTraverse:function(e,t){var n=this.getChildren();t||e(this);for(var r=0;r<n.length;r++)n[r].preTraverse(e)},postTraverse:function(e,t){for(var n=this.getChildren(),r=0;r<n.length;r++)n[r].postTraverse(e);t||e(this)},traverse:function(e,t){return this.postTraverse(e,t)},getChildren:function(){return this.children},getIndex:function(){return this.parent?this.parent.children.indexOf(this):-1},insertChild:function(e,t){void 0===t&&(t=this.children.length),e.parent&&e.parent.removeChild(e),e.parent=this,e.root=this.root,this.children.splice(t,0,e)},appendChild:function(e){return this.insertChild(e)},prependChild:function(e){return this.insertChild(e,0)},removeChild:function(e){var t,n=e;e instanceof s&&(n=this.children.indexOf(e)),n>=0&&((t=this.children.splice(n,1)[0]).parent=null,t.root=t)},clearChildren:function(){this.children=[]},getChild:function(e){return this.children[e]},getRenderContainer:function(){return this.rc},getCommonAncestor:function(e){return s.getCommonAncestor(this,e)},contains:function(e){return this==e||this.isAncestorOf(e)},clone:function(){var e=new s;return e.data=o.clone(this.data),this.children.forEach((function(t){e.appendChild(t.clone())})),e},compareTo:function(e){if(!o.comparePlainObject(this.data,e.data))return!1;if(!o.comparePlainObject(this.temp,e.temp))return!1;if(this.children.length!=e.children.length)return!1;for(var t=0;this.children[t];){if(!this.children[t].compareTo(e.children[t]))return!1;t++}return!0},getMinder:function(){return this.getRoot().minder}});s.getCommonAncestor=function(e,t){if(e instanceof Array)return s.getCommonAncestor.apply(this,e);switch(arguments.length){case 1:return e.parent||e;case 2:if(e.isAncestorOf(t))return e;if(t.isAncestorOf(e))return t;for(var n=e.parent;n&&!n.isAncestorOf(t);)n=n.parent;return n;default:return Array.prototype.reduce.call(arguments,(function(e,t){return s.getCommonAncestor(e,t)}),e)}},i.extendClass(a,{getRoot:function(){return this._root},setRoot:function(e){this._root=e,e.minder=this},getAllNode:function(){var e=[];return this.getRoot().traverse((function(t){e.push(t)})),e},getNodeById:function(e){return this.getNodesById([e])[0]},getNodesById:function(e){var t=this.getAllNode(),n=[];return t.forEach((function(t){-1!=e.indexOf(t.getData("id"))&&n.push(t)})),n},createNode:function(e,t,n){var r=new s(e);return this.fire("nodecreate",{node:r,parent:t,index:n}),this.appendNode(r,t,n),r},appendNode:function(e,t,n){return t&&t.insertChild(e,n),this.attachNode(e),this},removeNode:function(e){e.parent&&(e.parent.removeChild(e),this.detachNode(e),this.fire("noderemove",{node:e}))},attachNode:function(e){var t=this.getRenderContainer();e.traverse((function(e){e.attached=!0,t.addShape(e.getRenderContainer())})),t.addShape(e.getRenderContainer()),this.fire("nodeattach",{node:e})},detachNode:function(e){var t=this.getRenderContainer();e.traverse((function(e){e.attached=!1,t.removeShape(e.getRenderContainer())})),this.fire("nodedetach",{node:e})},getMinderTitle:function(){return this.getRoot().getText()}}),r.exports=s}},e[22]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(19);a.registerInitHook((function(e){this._defaultOptions={}})),i.extendClass(a,{setDefaultOptions:function(e){return o.extend(this._defaultOptions,e),this},getOption:function(e){return e?e in this._options?this._options[e]:this._defaultOptions[e]:o.extend({},this._defaultOptions,this._options)},setOption:function(e,t){this._options[e]=t}})}},e[23]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(19);a.registerInitHook((function(){this._initPaper()})),i.extendClass(a,{_initPaper:function(){this._paper=new i.Paper,this._paper._minder=this,this._paper.getNode().ondragstart=function(e){e.preventDefault()},this._paper.shapeNode.setAttribute("transform","translate(0.5, 0.5)"),this._addRenderContainer(),this.setRoot(this.createNode()),this._options.renderTo&&this.renderTo(this._options.renderTo)},_addRenderContainer:function(){this._rc=(new i.Group).setId(o.uuid("minder")),this._paper.addShape(this._rc)},renderTo:function(e){if("string"==typeof e&&(e=document.querySelector(e)),e){if("script"==e.tagName.toLowerCase()){var t=document.createElement("div");t.id=e.id,t.class=e.class,e.parentNode.insertBefore(t,e),e.parentNode.removeChild(e),e=t}e.classList.add("km-view"),this._paper.renderTo(this._renderTarget=e),this._bindEvents(),this.fire("paperrender")}return this},getRenderContainer:function(){return this._rc},getPaper:function(){return this._paper},getRenderTarget:function(){return this._renderTarget}})}},e[24]={value:function(t,n,r){var i=e.r(17),o=e.r(19);function a(e,t,n,r){return n=e.createNode(t.data,n,r),t.children.forEach((function(t,r){a(e,t,n,r)})),n}function s(e,t){var n=t.path.split("/");n.shift();var r,i=n.shift();if("root"==i){var o,s,u=n.indexOf("data");if(u>-1){i="data";var c=n.splice(u+1);t.dataPath=c}else i="node";for(r=e.getRoot();o=n.shift();)"children"!=o&&(void 0!==s&&(r=r.getChild(s)),s=+o);t.index=s,t.node=r}switch(t.express=[i,t.op].join(".")){case"theme.replace":e.useTheme(t.value);break;case"template.replace":e.useTemplate(t.value);break;case"node.add":a(e,t.value,t.node,t.index).renderTree(),e.layout();break;case"node.remove":e.removeNode(t.node.getChild(t.index)),e.layout();break;case"data.add":case"data.replace":case"data.remove":var l,h=t.node.data;for(n=t.dataPath.slice();h&&n.length>1;)(l=n.shift())in h?h=h[l]:"remove"!=t.op&&(h=h[l]={});h&&(h[l=n.shift()]=t.value),"expandState"==l?r.renderTree():r.render(),e.layout()}e.fire("patch",{patch:t})}i.extendClass(o,{applyPatches:function(e){for(var t=0;t<e.length;t++)s(this,e[t]);return this.fire("contentchange"),this}})}},e[25]={value:function(e,t,n){var r=function(e){if(!(this instanceof r))return new r(e);this.id="Thenable/1.0.7",this.state=0,this.fulfillValue=void 0,this.rejectReason=void 0,this.onFulfilled=[],this.onRejected=[],"function"==typeof e&&e.call(this,this.fulfill.bind(this),this.reject.bind(this))};r.prototype={fulfill:function(e){return i(this,1,"fulfillValue",e)},reject:function(e){return i(this,2,"rejectReason",e)},then:function(e,t){var n=this,i=new r;return n.onFulfilled.push(s(e,i,"fulfill")),n.onRejected.push(s(t,i,"reject")),o(n),i}},r.all=function(e){return new r((function(t,n){var r=e.length,i=0,o=0,a=[];for(0===r&&t(a);i<r;)e[i].then((function(e){a.push(e),++o===r&&t(a)}),(function(e){n(e)})),i++}))};var i=function(e,t,n,r){return 0===e.state&&(e.state=t,e[n]=r,o(e)),e},o=function(e){1===e.state?a(e,"onFulfilled",e.fulfillValue):2===e.state&&a(e,"onRejected",e.rejectReason)},a=function(e,t,n){if(0!==e[t].length){var r=e[t];e[t]=[];var i=function(){for(var e=0;e<r.length;e++)r[e](n)};"object"==typeof process&&"function"==typeof process.nextTick?process.nextTick(i):"function"==typeof setImmediate?setImmediate(i):setTimeout(i,0)}},s=function(e,t,n){return function(i){if("function"!=typeof e)t[n].call(t,i);else{var o;try{o=i instanceof r?i.then(e):e(i)}catch(e){return void t.reject(e)}u(t,o)}}},u=function(e,t){if(e!==t){var n;if("object"==typeof t&&null!==t||"function"==typeof t)try{n=t.then}catch(t){return void e.reject(t)}if("function"!=typeof n)e.fulfill(t);else{var r=!1;try{n.call(t,(function(n){r||(r=!0,n===t?e.reject(new TypeError("circular thenable chain")):u(e,n))}),(function(t){r||(r=!0,e.reject(t))}))}catch(t){r||e.reject(t)}}}else e.reject(new TypeError("cannot resolve promise with itself"))};r.resolve=function(e){return new r((function(t){t(e)}))},r.reject=function(e){return new r((function(t,n){n(e)}))},n.exports=r}},e[26]={value:function(t,n,r){var i=e.r(17),o=e.r(19);e.r(13);o.registerInitHook((function(e){e.readOnly&&this.setDisabled()})),i.extendClass(o,{disable:function(){var e=this;e.bkqueryCommandState=e.queryCommandState,e.bkqueryCommandValue=e.queryCommandValue,e.queryCommandState=function(t){var n=this._getCommand(t);return n&&n.enableReadOnly?e.bkqueryCommandState.apply(e,arguments):-1},e.queryCommandValue=function(t){var n=this._getCommand(t);return n&&n.enableReadOnly?e.bkqueryCommandValue.apply(e,arguments):null},this.setStatus("readonly"),e._interactChange()},enable:function(){var e=this;e.bkqueryCommandState&&(e.queryCommandState=e.bkqueryCommandState,delete e.bkqueryCommandState),e.bkqueryCommandValue&&(e.queryCommandValue=e.bkqueryCommandValue,delete e.bkqueryCommandValue),this.setStatus("normal"),e._interactChange()}})}},e[27]={value:function(t,n,r){var i=e.r(17),o=e.r(19),a=e.r(21),s=i.createClass("Renderer",{constructor:function(e){this.node=e},create:function(e){throw new Error("Not implement: Renderer.create()")},shouldRender:function(e){return!0},watchChange:function(e){void 0===this.watchingData||this.watchingData,this.watchingData=e},shouldDraw:function(e){return!0},update:function(e,t,n){return this.shouldDraw()&&this.draw(e,t),this.place(e,t,n)},draw:function(e,t){throw new Error("Not implement: Renderer.draw()")},place:function(e,t,n){throw new Error("Not implement: Renderer.place()")},getRenderShape:function(){return this._renderShape||null},setRenderShape:function(e){this._renderShape=e}});i.extendClass(o,function(){function e(e,t){var n=[];["center","left","right","top","bottom","outline","outside"].forEach((function(e){var r="before"+e,i="after"+e;t[r]&&(n=n.concat(t[r])),t[e]&&(n=n.concat(t[e])),t[i]&&(n=n.concat(t[i]))})),e._renderers=n.map((function(t){return new t(e)}))}return{renderNodeBatch:function(t){var n,r,o,a,s,u=this._rendererClasses,c=[];if(t.length){for(o=0;o<t.length;o++)(s=t[o])._renderers||e(s,u),s._contentBox=new i.Box,this.fire("beforerender",{node:s});for(n=t[0]._renderers.length,r=0;r<n;r++){for(o=0;o<t.length;o++)"function"==typeof c[o]&&(c[o]=c[o]()),c[o]instanceof i.Box||(c[o]=new i.Box(c[o]));for(o=0;o<t.length;o++)a=(s=t[o])._renderers[r],c[o]&&(s._contentBox=s._contentBox.merge(c[o]),a.contentBox=c[o]),a.shouldRender(s)?(a.getRenderShape()||(a.setRenderShape(a.create(s)),a.bringToBack?s.getRenderContainer().prependShape(a.getRenderShape()):s.getRenderContainer().appendShape(a.getRenderShape())),a.getRenderShape().setVisible(!0),c[o]=a.update(a.getRenderShape(),s,s._contentBox)):a.getRenderShape()&&(a.getRenderShape().setVisible(!1),c[o]=null)}for(o=0;o<t.length;o++)this.fire("noderender",{node:t[o]})}},renderNode:function(t){var n,r=this._rendererClasses;t._renderers||e(t,r),this.fire("beforerender",{node:t}),t._contentBox=new i.Box,t._renderers.forEach((function(e){e.shouldRender(t)?(e.getRenderShape()||(e.setRenderShape(e.create(t)),e.bringToBack?t.getRenderContainer().prependShape(e.getRenderShape()):t.getRenderContainer().appendShape(e.getRenderShape())),e.getRenderShape().setVisible(!0),"function"==typeof(n=e.update(e.getRenderShape(),t,t._contentBox))&&(n=n()),n&&(t._contentBox=t._contentBox.merge(n),e.contentBox=n)):e.getRenderShape()&&e.getRenderShape().setVisible(!1)})),this.fire("noderender",{node:t})}}}()),i.extendClass(a,{render:function(){if(this.attached)return this.getMinder().renderNode(this),this},renderTree:function(){if(this.attached){var e=[];return this.traverse((function(t){e.push(t)})),this.getMinder().renderNodeBatch(e),this}},getRenderer:function(e){var t=this._renderers;if(!t)return null;for(var n=0;n<t.length;n++)if(t[n].getType()==e)return t[n];return null},getContentBox:function(){return this.parent&&this.parent.isCollapsed()?new i.Box:this._contentBox||new i.Box},getRenderBox:function(e,t){var n=e&&this.getRenderer(e),r=n?n.contentBox:this.getContentBox();return i.Matrix.getCTM(this.getRenderContainer(),t||"paper").transformBox(r)}}),r.exports=s}},e[28]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(19),s=e.r(21);a.registerInitHook((function(){this._initSelection()})),i.extendClass(a,{_initSelection:function(){this._selectedNodes=[]},renderChangedSelection:function(e){var t=this.getSelectedNodes(),n=[];for(t.forEach((function(t){-1==e.indexOf(t)&&n.push(t)})),e.forEach((function(e){-1==t.indexOf(e)&&n.push(e)})),n.length&&(this._interactChange(),this.fire("selectionchange"));n.length;)n.shift().render()},getSelectedNodes:function(){return this._selectedNodes},getSelectedNode:function(){return this.getSelectedNodes()[0]||null},removeAllSelectedNodes:function(){var e=this._selectedNodes.splice(0);return this._selectedNodes=[],this.renderChangedSelection(e),this.fire("selectionclear")},removeSelectedNodes:function(e){var t=this,n=this._selectedNodes.slice(0);return(e=o.isArray(e)?e:[e]).forEach((function(e){var n;-1!==(n=t._selectedNodes.indexOf(e))&&t._selectedNodes.splice(n,1)})),this.renderChangedSelection(n),this},select:function(e,t){var n=this.getSelectedNodes().slice(0);t&&(this._selectedNodes=[]);var r=this;return(e=o.isArray(e)?e:[e]).forEach((function(e){-1===r._selectedNodes.indexOf(e)&&r._selectedNodes.unshift(e)})),this.renderChangedSelection(n),this},selectById:function(e,t){e=o.isArray(e)?e:[e];var n=this.getNodesById(e);return this.select(n,t)},toggleSelect:function(e){return o.isArray(e)?e.forEach(this.toggleSelect.bind(this)):e.isSelected()?this.removeSelectedNodes(e):this.select(e),this},isSingleSelect:function(){return 1==this._selectedNodes.length},getSelectedAncestors:function(e){var t,n=this.getSelectedNodes().slice(0),r=[],i=n.indexOf(this.getRoot());function o(e,t){for(var n=e.length-1;n>=0;--n)if(e[n].isAncestorOf(t))return!0;return!1}for(~i&&!e&&n.splice(i,1),n.sort((function(e,t){return e.getLevel()-t.getLevel()}));t=n.pop();)o(n,t)||r.push(t);return r}}),i.extendClass(s,{isSelected:function(){var e=this.getMinder();return e&&-1!=e.getSelectedNodes().indexOf(this)}})}},e[29]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(15),s=e.r(19),u=e.r(13);function c(e){var t=0;return"string"==typeof e?e.toLowerCase().split(/\\+\\s*/).forEach((function(e){switch(e){case"ctrl":case"cmd":t|=4096;break;case"alt":t|=8192;break;case"shift":t|=16384;break;default:t|=a[e]}})):((e.ctrlKey||e.metaKey)&&(t|=4096),e.altKey&&(t|=8192),e.shiftKey&&(t|=16384),t|=e.keyCode),t}i.extendClass(u,{isShortcutKey:function(e){var t=this.originEvent;return!!t&&c(e)==c(t)}}),s.registerInitHook((function(){this._initShortcutKey()})),i.extendClass(s,{_initShortcutKey:function(){this._bindShortcutKeys()},_bindShortcutKeys:function(){var e=this._shortcutKeys={};this.on("keydown",(function(t){for(var n in e)if(e.hasOwnProperty(n)&&t.isShortcutKey(n)){var r=e[n];if(r.__statusCondition&&r.__statusCondition!=this.getStatus())return;r(),t.preventDefault()}}))},addShortcut:function(e,t){var n=this._shortcutKeys;e.split(/\\|\\s*/).forEach((function(e){var r,i=e.split("::");i.length>1&&(e=i[1],r=i[0],t.__statusCondition=r),n[e]=t}))},addCommandShortcutKeys:function(e,t){var n=this._commandShortcutKeys||(this._commandShortcutKeys={}),r={};t?r[e]=t:r=e;var i=this;o.each(r,(function(e,t){n[t]=e,i.addShortcut(e,(function(){-1!==i.queryCommandState(t)&&i.execCommand(t)}))}))},getCommandShortcutKey:function(e){var t=this._commandShortcutKeys;return t&&t[e]||null},supportClipboardEvent:function(e){return!!e.ClipboardEvent}(window)})}},e[30]={value:function(t,n,r){var i=e.r(17),o=e.r(19),a=~window.location.href.indexOf("status"),s=~window.location.href.indexOf("trace");o.registerInitHook((function(){this._initStatus()})),i.extendClass(o,{_initStatus:function(){this._status="normal",this._rollbackStatus="normal"},setStatus:function(e,t){return"readonly"!=this._status||t?(e!=this._status&&(this._rollbackStatus=this._status,this._status=e,this.fire("statuschange",{lastStatus:this._rollbackStatus,currentStatus:this._status}),a&&(console.log(window.event.type,this._rollbackStatus,"->",this._status),s&&console.trace())),this):this},rollbackStatus:function(){this.setStatus(this._rollbackStatus)},getRollbackStatus:function(){return this._rollbackStatus},getStatus:function(){return this._status}})}},e[31]={value:function(t,n,r){var i,o,a,s=e.r(17),u=e.r(33),c=e.r(19),l=e.r(9),h=e.r(21),f=e.r(20),d={};n.register=function(e,t){d[e]=t},u.extend(c,{getTemplateList:function(){return d}}),s.extendClass(c,(i=c.prototype.getTheme,{useTemplate:function(e,t){this.setTemplate(e),this.refresh(t||800)},getTemplate:function(){return this._template||"default"},setTemplate:function(e){this._template=e||null},getTemplateSupport:function(e){var t=d[this.getTemplate()];return t&&t[e]},getTheme:function(e){return(this.getTemplateSupport("getTheme")||i).call(this,e)}})),s.extendClass(h,(o=h.prototype.getLayout,a=h.prototype.getConnect,{getLayout:function(){return(this.getMinder().getTemplateSupport("getLayout")||o).call(this,this)},getConnect:function(){return(this.getMinder().getTemplateSupport("getConnect")||a).call(this,this)}})),f.register("TemplateModule",{commands:{template:s.createClass("TemplateCommand",{base:l,execute:function(e,t){e.useTemplate(t),e.execCommand("camera")},queryValue:function(e){return e.getTemplate()||"default"}})}})}},e[32]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(19),s=e.r(21),u=e.r(20),c=e.r(9),l={left:function(e){return 3 in e&&e[3]||1 in e&&e[1]||e[0]},right:function(e){return 1 in e&&e[1]||e[0]},top:function(e){return e[0]},bottom:function(e){return 2 in e&&e[2]||e[0]}},h={};n.register=function(e,t){h[e]=t},o.extend(a,{getThemeList:function(){return h}}),i.extendClass(a,{useTheme:function(e){return this.setTheme(e),this.refresh(800),!0},setTheme:function(e){if(e&&!h[e])throw new Error("Theme "+e+" not exists!");var t=this._theme;this._theme=e||null;var n=this.getRenderTarget();return n&&(n.classList.remove("km-theme-"+t),e&&n.classList.add("km-theme-"+e),n.style.background=this.getStyle("background")),this.fire("themechange",{theme:e}),this},getTheme:function(e){return this._theme||this.getOption("defaultTheme")||"fresh-blue"},getThemeItems:function(e){this.getTheme(e);return h[this.getTheme(e)]},getStyle:function(e,t){var n,r,i,a,s=this.getThemeItems(t);if(e in s)return s[e];if((n=e.split("-")).length<2)return null;if(r=n.pop(),(e=n.join("-"))in s){if(i=s[e],o.isArray(i)&&(a=l[r]))return a(i);if(!isNaN(i))return i}return null},getNodeStyle:function(e,t){var n=this.getStyle(e.getType()+"-"+t,e);return null!==n?n:this.getStyle(t,e)}}),i.extendClass(s,{getStyle:function(e){return this.getMinder().getNodeStyle(this,e)}}),u.register("Theme",{defaultOptions:{defaultTheme:"fresh-blue"},commands:{theme:i.createClass("ThemeCommand",{base:c,execute:function(e,t){return e.useTheme(t)},queryValue:function(e){return e.getTheme()||"default"}})}}),a.registerInitHook((function(){this.setTheme()}))}},e[33]={value:function(t,n){var r=e.r(17),i={};n.extend=r.Utils.extend.bind(r.Utils),n.each=r.Utils.each.bind(r.Utils),n.uuid=function(e){return i[e]=i[e]?i[e]+1:1,e+i[e]},n.guid=function(){return(1e6*+new Date+Math.floor(1e6*Math.random())).toString(36)},n.trim=function(e){return e.replace(/(^[ \\t\\n\\r]+)|([ \\t\\n\\r]+$)/g,"")},n.keys=function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t},n.clone=function(e){return JSON.parse(JSON.stringify(e))},n.comparePlainObject=function(e,t){return JSON.stringify(e)==JSON.stringify(t)},n.encodeHtml=function(e,t){return e?e.replace(t||/[&<">\'](?:(amp|lt|quot|gt|#39|nbsp);)?/g,(function(e,t){return t?e:{"<":"&lt;","&":"&amp;",\'"\':"&quot;",">":"&gt;","\'":"&#39;"}[e]})):""},n.clearWhiteSpace=function(e){return e.replace(/[\\u200b\\t\\r\\n]/g,"")},n.each(["String","Function","Array","Number","RegExp","Object"],(function(e){var t=Object.prototype.toString;n["is"+e]=function(n){return t.apply(n)=="[object "+e+"]"}}))}},e[34]={value:function(t,n,r){r.exports=window.kityminder=e.r(35)}},e[35]={value:function(t,n,r){var i={version:e.r(19).version};e.r(33),i.Minder=e.r(19),i.Command=e.r(9),i.Node=e.r(21),e.r(22),e.r(8),i.Event=e.r(13),i.data=e.r(12),e.r(10),i.KeyMap=e.r(15),e.r(29),e.r(30),e.r(23),e.r(28),e.r(14),e.r(16),i.Module=e.r(20),e.r(26),i.Render=e.r(27),i.Connect=e.r(11),i.Layout=e.r(18),i.Theme=e.r(32),i.Template=e.r(31),i.Promise=e.r(25),e.r(7),e.r(24),e.r(42),e.r(43),e.r(44),e.r(45),e.r(46),e.r(47),e.r(48),e.r(50),e.r(49),e.r(51),e.r(52),e.r(53),e.r(54),e.r(55),e.r(56),e.r(57),e.r(58),e.r(59),e.r(60),e.r(61),e.r(62),e.r(63),e.r(64),e.r(68),e.r(65),e.r(67),e.r(66),e.r(40),e.r(36),e.r(37),e.r(38),e.r(39),e.r(41),e.r(75),e.r(78),e.r(77),e.r(76),e.r(78),e.r(80),e.r(79),e.r(0),e.r(1),e.r(2),e.r(3),e.r(4),e.r(5),e.r(6),e.r(69),e.r(73),e.r(70),e.r(72),e.r(71),e.r(74),r.exports=i}},e[36]={value:function(t,n,r){var i=e.r(17),o=e.r(18);["left","right","top","bottom"].forEach((function(e){var t="left"==e||"right"==e?"x":"y",n="left"==e||"top"==e?-1:1,r={left:"right",right:"left",top:"bottom",bottom:"top",x:"y",y:"x"};o.register(e,i.createClass({base:o,doLayout:function(o,a){var s=o.getContentBox();if("x"==t?(o.setVertexOut(new i.Point(s[e],s.cy)),o.setLayoutVectorOut(new i.Vector(n,0))):(o.setVertexOut(new i.Point(s.cx,s[e])),o.setLayoutVectorOut(new i.Vector(0,n))),!a.length)return!1;a.forEach((function(o){var a=o.getContentBox();o.setLayoutTransform(new i.Matrix),"x"==t?(o.setVertexIn(new i.Point(a[r[e]],a.cy)),o.setLayoutVectorIn(new i.Vector(n,0))):(o.setVertexIn(new i.Point(a.cx,a[r[e]])),o.setLayoutVectorIn(new i.Vector(0,n)))})),this.align(a,r[e]),this.stack(a,r[t]);var u=this.getBranchBox(a),c=0,l=0;"x"==t?(c=s[e],c+=n*o.getStyle("margin-"+e),c+=n*a[0].getStyle("margin-"+r[e]),l=s.bottom,l-=s.height/2,l-=u.height/2,l-=u.y):(c=s.right,c-=s.width/2,c-=u.width/2,c-=u.x,l=s[e],l+=n*o.getStyle("margin-"+e),l+=n*a[0].getStyle("margin-"+r[e])),this.move(a,c,l)},getOrderHint:function(e){var n=[],r=e.getLayoutBox();return"x"==t?(n.push({type:"up",node:e,area:new i.Box({x:r.x,y:r.top-e.getStyle("margin-top")-5,width:r.width,height:e.getStyle("margin-top")}),path:["M",r.x,r.top-5,"L",r.right,r.top-5]}),n.push({type:"down",node:e,area:new i.Box({x:r.x,y:r.bottom+5,width:r.width,height:e.getStyle("margin-bottom")}),path:["M",r.x,r.bottom+5,"L",r.right,r.bottom+5]})):(n.push({type:"up",node:e,area:new i.Box({x:r.left-e.getStyle("margin-left")-5,y:r.top,width:e.getStyle("margin-left"),height:r.height}),path:["M",r.left-5,r.top,"L",r.left-5,r.bottom]}),n.push({type:"down",node:e,area:new i.Box({x:r.right+5,y:r.top,width:e.getStyle("margin-right"),height:r.height}),path:["M",r.right+5,r.top,"L",r.right+5,r.bottom]})),n}}))}))}},e[37]={value:function(t,n,r){var i=e.r(17),o=e.r(18);[-1,1].forEach((function(e){var t="filetree-"+(e>0?"down":"up");o.register(t,i.createClass({base:o,doLayout:function(t,n,r){var o=t.getContentBox();if(t.setVertexOut(new i.Point(o.left+20,e>0?o.bottom:o.top)),t.setLayoutVectorOut(new i.Vector(0,e)),n.length){n.forEach((function(e){var t=e.getContentBox();e.setLayoutTransform(new i.Matrix),e.setVertexIn(new i.Point(t.left,t.cy)),e.setLayoutVectorIn(new i.Vector(1,0))})),this.align(n,"left"),this.stack(n,"y");var a=0;a+=o.left,a+=20,a+=n[0].getStyle("margin-left");var s=0;e>0?(s+=o.bottom,s+=t.getStyle("margin-bottom"),s+=n[0].getStyle("margin-top")):(s-=this.getTreeBox(n).bottom,s+=o.top,s-=t.getStyle("margin-top"),s-=n[0].getStyle("margin-bottom")),this.move(n,a,s)}},getOrderHint:function(e){var t=[],n=e.getLayoutBox(),r=e.getLevel()>1?3:5;return t.push({type:"up",node:e,area:new i.Box({x:n.x,y:n.top-e.getStyle("margin-top")-r,width:n.width,height:e.getStyle("margin-top")}),path:["M",n.x,n.top-r,"L",n.right,n.top-r]}),t.push({type:"down",node:e,area:new i.Box({x:n.x,y:n.bottom+r,width:n.width,height:e.getStyle("margin-bottom")}),path:["M",n.x,n.bottom+r,"L",n.right,n.bottom+r]}),t}}))}))}},e[38]={value:function(t,n,r){var i=e.r(17),o=e.r(18);o.register("fish-bone-master",i.createClass("FishBoneMasterLayout",{base:o,doLayout:function(e,t,n){var r=[],o=[],a=t[0],s=e.getContentBox();if(e.setVertexOut(new i.Point(s.right,s.cy)),e.setLayoutVectorOut(new i.Vector(1,0)),a){a.getContentBox();var u=e.getStyle("margin-right"),c=a.getStyle("margin-left"),l=a.getStyle("margin-top"),h=a.getStyle("margin-bottom");t.forEach((function(e,t){e.setLayoutTransform(new i.Matrix);var n=e.getContentBox();t%2?(o.push(e),e.setVertexIn(new i.Point(n.left,n.top)),e.setLayoutVectorIn(new i.Vector(1,1))):(r.push(e),e.setVertexIn(new i.Point(n.left,n.bottom)),e.setLayoutVectorIn(new i.Vector(1,-1)))})),this.stack(r,"x"),this.stack(o,"x"),this.align(r,"bottom"),this.align(o,"top");var f=s.right+u+c,d=s.cy-h-e.getStyle("margin-top"),p=s.cy+l+e.getStyle("margin-bottom");this.move(r,f,d),this.move(o,f+c,p)}}}))}},e[39]={value:function(t,n,r){var i=e.r(17),o=e.r(18);o.register("fish-bone-slave",i.createClass("FishBoneSlaveLayout",{base:o,doLayout:function(e,t,n){var r=this,o=Math.abs,a=e.getContentBox(),s=e.getLayoutVectorIn();e.setLayoutVectorOut(s);var u=a.left+.382*a.width,c=new i.Point(u,s.y>0?a.bottom:a.top);e.setVertexOut(c);var l=t[0];if(l){var h=l.getContentBox();t.forEach((function(e,t){e.setLayoutTransform(new i.Matrix),e.setLayoutVectorIn(new i.Vector(1,0)),e.setVertexIn(new i.Point(h.left,h.cy))})),this.stack(t,"y"),this.align(t,"left");var f=0,d=0;f+=c.x,e.getLayoutVectorOut().y<0?(d-=this.getTreeBox(t).bottom,d+=e.getContentBox().top,d-=e.getStyle("margin-top"),d-=l.getStyle("margin-bottom")):(d+=e.getContentBox().bottom,d+=e.getStyle("margin-bottom"),d+=l.getStyle("margin-top")),this.move(t,f,d),2==n&&t.forEach((function(e){var t=e.getLayoutTransform(),n=e.getContentBox(),a=t.transformPoint(new i.Point(n.left,0));r.move([e],o(a.y-c.y),0)}))}}}))}},e[40]={value:function(t,n,r){var i=e.r(17),o=e.r(18),a=e.r(19);o.register("mind",i.createClass({base:o,doLayout:function(e,t){var n=Math.ceil(e.children.length/2),r=[],o=[];t.forEach((function(e){e.getIndex()<n?r.push(e):o.push(e)}));var s=a.getLayoutInstance("left"),u=a.getLayoutInstance("right");s.doLayout(e,o),u.doLayout(e,r);var c=e.getContentBox();e.setVertexOut(new i.Point(c.cx,c.cy)),e.setLayoutVectorOut(new i.Vector(0,0))},getOrderHint:function(e){var t=[],n=e.getLayoutBox();return t.push({type:"up",node:e,area:new i.Box({x:n.x,y:n.top-e.getStyle("margin-top")-5,width:n.width,height:e.getStyle("margin-top")}),path:["M",n.x,n.top-5,"L",n.right,n.top-5]}),t.push({type:"down",node:e,area:new i.Box({x:n.x,y:n.bottom+5,width:n.width,height:e.getStyle("margin-bottom")}),path:["M",n.x,n.bottom+5,"L",n.right,n.bottom+5]}),t}}))}},e[41]={value:function(t,n,r){var i=e.r(17),o=e.r(18);e.r(19);o.register("tianpan",i.createClass({base:o,doLayout:function(e,t){if(0!=t.length){var n,r,o,a=this,s=e.getContentBox(),u=5,c=Math.max(s.width,50);t.forEach((function(e,t){e.setLayoutTransform(new i.Matrix),o=a.getTreeBox(e),c=Math.max(Math.max(o.width,o.height),c)})),c=c/1.5/Math.PI,t.forEach((function(e,t){n=c*(Math.cos(u)+Math.sin(u)*u),r=c*(Math.sin(u)-Math.cos(u)*u),u+=.9-.02*t,e.setLayoutVectorIn(new i.Vector(1,0)),e.setVertexIn(new i.Point(s.cx,s.cy)),e.setLayoutTransform(new i.Matrix),a.move([e],n,r)}))}},getOrderHint:function(e){var t=[],n=e.getLayoutBox();return t.push({type:"up",node:e,area:{x:n.x,y:n.top-e.getStyle("margin-top")-5,width:n.width,height:e.getStyle("margin-top")},path:["M",n.x,n.top-5,"L",n.right,n.top-5]}),t.push({type:"down",node:e,area:{x:n.x,y:n.bottom+5,width:n.width,height:e.getStyle("margin-bottom")},path:["M",n.x,n.bottom+5,"L",n.right,n.bottom+5]}),t}}))}},e[42]={value:function(t,n,r){var i=e.r(17),o=e.r(21),a=e.r(9),s=e.r(20);function u(e,t){return e.getIndex()-t.getIndex()}function c(e,t){return-u(e,t)}i.extendClass(o,{arrange:function(e){var t=this.parent;if(t){var n=t.children;if(!(e<0||e>=n.length))return n.splice(this.getIndex(),1),n.splice(e,0,this),this}}});var l=i.createClass("ArrangeUpCommand",{base:a,execute:function(e){var t=e.getSelectedNodes();t.sort(u);var n=t.map((function(e){return e.getIndex()}));t.forEach((function(e,t){e.arrange(n[t]-1)})),e.layout(300)},queryState:function(e){return e.getSelectedNode()?0:-1}}),h=i.createClass("ArrangeUpCommand",{base:a,execute:function(e){var t=e.getSelectedNodes();t.sort(c);var n=t.map((function(e){return e.getIndex()}));t.forEach((function(e,t){e.arrange(n[t]+1)})),e.layout(300)},queryState:function(e){return e.getSelectedNode()?0:-1}}),f=i.createClass("ArrangeCommand",{base:a,execute:function(e,t){var n=e.getSelectedNodes().slice();if(n.length&&o.getCommonAncestor(n)==n[0].parent){var r=n.map((function(e){return{index:e.getIndex(),node:e}})),i=Math.min.apply(Math,r.map((function(e){return e.index})))>=t;r.sort((function(e,t){return i?t.index-e.index:e.index-t.index})),r.forEach((function(e){e.node.arrange(t)})),e.layout(300)}},queryState:function(e){return e.getSelectedNode()?0:-1}});s.register("ArrangeModule",{commands:{arrangeup:l,arrangedown:h,arrange:f},contextmenu:[{command:"arrangeup"},{command:"arrangedown"},{divider:!0}],commandShortcutKeys:{arrangeup:"normal::alt+Up",arrangedown:"normal::alt+Down"}})}},e[43]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20),s=e.r(61);a.register("basestylemodule",(function(){var e=this;function t(e,t){return e.getData(t)||e.getStyle(t)}return s.registerStyleHook((function(e,n){var r=t(e,"font-weight"),i=t(e,"font-style");[r,i].join("/");n.eachItem((function(e,t){t.setFont({weight:r,style:i})}))})),{commands:{bold:i.createClass("boldCommand",{base:o,execute:function(e){var t=e.getSelectedNodes();1==this.queryState("bold")?t.forEach((function(e){e.setData("font-weight").render()})):t.forEach((function(e){e.setData("font-weight","bold").render()})),e.layout()},queryState:function(){var t=e.getSelectedNodes(),n=0;return 0===t.length?-1:(t.forEach((function(e){if(e&&e.getData("font-weight"))return n=1,!1})),n)}}),italic:i.createClass("italicCommand",{base:o,execute:function(e){var t=e.getSelectedNodes();1==this.queryState("italic")?t.forEach((function(e){e.setData("font-style").render()})):t.forEach((function(e){e.setData("font-style","italic").render()})),e.layout()},queryState:function(){var t=e.getSelectedNodes(),n=0;return 0===t.length?-1:(t.forEach((function(e){if(e&&e.getData("font-style"))return n=1,!1})),n)}})},commandShortcutKeys:{bold:"ctrl+b",italic:"ctrl+i"}}}))}},e[44]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(21)),a=e.r(9);e.r(20).register("ClipboardModule",(function(){var e=this,t=[],n=[];function r(t,i){n.push(i),e.appendNode(i,t),i.render(),i.setLayoutOffset(null);var o=i.children.map((function(e){return e.clone()}));i.clearChildren();for(var a,s=0;a=o[s];s++)r(i,a)}function s(e){e.length&&(e.sort((function(e,t){return e.getIndex()-t.getIndex()})),t=e.map((function(e){return e.clone()})))}var u=i.createClass("CopyCommand",{base:a,execute:function(e){s(e.getSelectedAncestors(!0)),this.setContentChanged(!1)}}),c=i.createClass("CutCommand",{base:a,execute:function(e){var t=e.getSelectedAncestors();0!==t.length&&(s(t),e.select(o.getCommonAncestor(t),!0),t.slice().forEach((function(t){e.removeNode(t)})),e.layout(300))}}),l=i.createClass("PasteCommand",{base:a,execute:function(e){if(t.length){var i=e.getSelectedNodes();if(!i.length)return;for(var o,a=0;o=t[a];a++)for(var s,u=0;s=i[u];u++)r(s,o.clone());e.select(n,!0),n=[],e.layout(300)}},queryState:function(e){return e.getSelectedNode()?0:-1}});if(e.supportClipboardEvent&&!i.Browser.gecko){return{commands:{copy:u,cut:c,paste:l},clipBoardEvents:{copy:function(e){this.fire("beforeCopy",e)}.bind(e),cut:function(e){this.fire("beforeCut",e)}.bind(e),paste:function(e){this.fire("beforePaste",e)}.bind(e)},sendToClipboard:s}}return{commands:{copy:u,cut:c,paste:l},commandShortcutKeys:{copy:"normal::ctrl+c|",cut:"normal::ctrl+x",paste:"normal::ctrl+v"},sendToClipboard:s}}))}},e[45]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(21)),a=e.r(9),s=e.r(20),u=i.createClass("MoveToParentCommand",{base:a,execute:function(e,t,n){for(var r,i=0;i<t.length;i++)(r=t[i]).parent&&(r.parent.removeChild(r),n.appendChild(r),r.render());n.expand(),e.select(t,!0)}}),c=i.createClass("DropHinter",{base:i.Group,constructor:function(){this.callBase(),this.rect=new i.Rect,this.addShape(this.rect)},render:function(e){this.setVisible(!!e),e&&(this.rect.setBox(e.getLayoutBox()).setRadius(e.getStyle("radius")||0).stroke(e.getStyle("drop-hint-color")||"yellow",e.getStyle("drop-hint-width")||2),this.bringTop())}}),l=i.createClass("OrderHinter",{base:i.Group,constructor:function(){this.callBase(),this.area=new i.Rect,this.path=new i.Path,this.addShapes([this.area,this.path])},render:function(e){this.setVisible(!!e),e&&(this.area.setBox(e.area),this.area.fill(e.node.getStyle("order-hint-area-color")||"rgba(0, 255, 0, .5)"),this.path.setPathData(e.path),this.path.stroke(e.node.getStyle("order-hint-path-color")||"#0f0",e.node.getStyle("order-hint-path-width")||1))}}),h=i.createClass("TreeDragger",{constructor:function(e){this._minder=e,this._dropHinter=new c,this._orderHinter=new l,e.getRenderContainer().addShapes([this._dropHinter,this._orderHinter])},dragStart:function(e){this._startPosition=e},dragMove:function(e){if(this._startPosition){var t=i.Vector.fromPoints(this._dragPosition||this._startPosition,e),n=this._minder;if(this._dragPosition=e,!this._dragMode){if(i.Vector.fromPoints(this._dragPosition,this._startPosition).length()<10)return;if(!this._enterDragMode())return}for(var r=0;r<this._dragSources.length;r++)this._dragSources[r].setLayoutOffset(this._dragSources[r].getLayoutOffset().offset(t)),n.applyLayoutResult(this._dragSources[r]);this._dropTest()?this._renderOrderHint(this._orderSucceedHint=null):this._orderTest()}},dragEnd:function(){if(this._startPosition=null,this._dragPosition=null,this._dragMode){if(this._fadeDragSources(1),this._dropSucceedTarget)this._dragSources.forEach((function(e){e.setLayoutOffset(null)})),this._minder.layout(-1),this._minder.execCommand("movetoparent",this._dragSources,this._dropSucceedTarget);else if(this._orderSucceedHint){var e=this._orderSucceedHint,t=e.node.getIndex(),n=this._dragSources.map((function(e){return e.setLayoutOffset(null),e.getIndex()})),r=Math.max.apply(Math,n);t<Math.min.apply(Math,n)&&"down"==e.type&&t++,t>r&&"up"==e.type&&t--,e.node.setLayoutOffset(null),this._minder.execCommand("arrange",t),this._renderOrderHint(null)}else this._minder.fire("savescene");this._minder.layout(300),this._leaveDragMode(),this._minder.fire("contentchange")}},_enterDragMode:function(){return this._calcDragSources(),this._dragSources.length?(this._fadeDragSources(.5),this._calcDropTargets(),this._calcOrderHints(),this._dragMode=!0,this._minder.setStatus("dragtree"),!0):(this._startPosition=null,!1)},_calcDragSources:function(){this._dragSources=this._minder.getSelectedAncestors()},_fadeDragSources:function(e){var t=this._minder;this._dragSources.forEach((function(n){n.getRenderContainer().setOpacity(e,200),n.traverse((function(n){e<1?t.detachNode(n):t.attachNode(n)}),!0)}))},_calcDropTargets:function(){this._dropTargets=function e(t,n){var r,i=[];return i.push(n),n.getChildren().forEach((function(n){for(r=0;r<t.length;r++)if(t[r]==n)return;i=i.concat(e(t,n))})),i}(this._dragSources,this._minder.getRoot()),this._dropTargetBoxes=this._dropTargets.map((function(e){return e.getLayoutBox()}))},_calcOrderHints:function(){var e=this._dragSources,t=o.getCommonAncestor(e);if(t==e[0]&&(t=e[0].parent),0!==e.length&&t==e[0].parent){var n=t.children;this._orderHints=n.reduce((function(t,n){return-1==e.indexOf(n)&&(t=t.concat(n.getOrderHint())),t}),[])}else this._orderHints=[]},_leaveDragMode:function(){this._dragMode=!1,this._dropSucceedTarget=null,this._orderSucceedHint=null,this._renderDropHint(null),this._renderOrderHint(null),this._minder.rollbackStatus()},_drawForDragMode:function(){this._text.setContent(this._dragSources.length+" items"),this._text.setPosition(this._startPosition.x,this._startPosition.y+5),this._minder.getRenderContainer().addShape(this)},_boxTest:function(e,t,n){var r,i,o,a,s,u=this._dragSources.map((function(e){return e.getLayoutBox()}));for(n=n||function(e,t,n){return e&&!e.isEmpty()},r=0;r<e.length;r++)for(o=e[r],s=t.call(this,o,r),i=0;i<u.length;i++){if(n((a=u[i]).intersect(s),a,s))return o}return null},_dropTest:function(){return this._dropSucceedTarget=this._boxTest(this._dropTargets,(function(e,t){return this._dropTargetBoxes[t]}),(function(e,t,n){function r(e){return e.width*e.height}return!!e&&(!!r(e)&&(r(e)>.5*Math.min(r(t),r(n))||(e.width+1>=Math.min(t.width,n.width)||e.height+1>=Math.min(t.height,n.height))))})),this._renderDropHint(this._dropSucceedTarget),!!this._dropSucceedTarget},_orderTest:function(){return this._orderSucceedHint=this._boxTest(this._orderHints,(function(e){return e.area})),this._renderOrderHint(this._orderSucceedHint),!!this._orderSucceedHint},_renderDropHint:function(e){this._dropHinter.render(e)},_renderOrderHint:function(e){this._orderHinter.render(e)},preventDragMove:function(){this._startPosition=null}});s.register("DragTree",(function(){var e;return{init:function(){e=new h(this),window.addEventListener("mouseup",(function(){e.dragEnd()}))},events:{"normal.mousedown inputready.mousedown":function(t){t.originEvent.button||t.getTargetNode()&&t.getTargetNode()!=this.getRoot()&&e.dragStart(t.getPosition())},"normal.mousemove dragtree.mousemove":function(t){e.dragMove(t.getPosition())},"normal.mouseup dragtree.beforemouseup":function(t){e.dragEnd(),t.preventDefault()},statuschange:function(t){"textedit"==t.lastStatus&&"normal"==t.currentStatus&&e.preventDragMove()}},commands:{movetoparent:u}}}))}},e[46]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=e.r(15),s=e.r(21),u=e.r(9),c=e.r(20),l=e.r(27);c.register("Expand",(function(){var e=this,t="expandState",n="collapse";i.extendClass(s,{expand:function(){return this.setData(t,"expand"),this},collapse:function(){return this.setData(t,n),this},isExpanded:function(){return this.getData(t)!==n&&(this.isRoot()||this.parent.isExpanded())},isCollapsed:function(){return!this.isExpanded()}});var r=i.createClass("ExpandCommand",{base:u,execute:function(e,t){var n=e.getSelectedNode();if(n){for(t&&(n=n.parent);n.parent;)n.expand(),n=n.parent;n.renderTree(),e.layout(100)}},queryState:function(e){var t=e.getSelectedNode();return!t||t.isRoot()||t.isExpanded()?-1:0}}),c=i.createClass("ExpandToLevelCommand",{base:u,execute:function(e,t){e.getRoot().traverse((function(e){e.getLevel()<t&&e.expand(),e.getLevel()!=t||e.isLeaf()||e.collapse()})),e.refresh(100)},enableReadOnly:!0}),h=i.createClass("CollapseCommand",{base:u,execute:function(e){var t=e.getSelectedNode();t&&(t.collapse(),t.renderTree(),e.layout())},queryState:function(e){var t=e.getSelectedNode();return t&&!t.isRoot()&&t.isExpanded()?0:-1}}),f=i.createClass("Expander",{base:i.Group,constructor:function(e){this.callBase(),this.radius=6,this.outline=new i.Circle(this.radius).stroke("gray").fill("white"),this.sign=(new i.Path).stroke("gray"),this.addShapes([this.outline,this.sign]),this.initEvent(e),this.setId(o.uuid("node_expander")),this.setStyle("cursor","pointer")},initEvent:function(t){this.on("mousedown",(function(n){e.select([t],!0),t.isExpanded()?t.collapse():t.expand(),t.renderTree().getMinder().layout(100),t.getMinder().fire("contentchange"),n.stopPropagation(),n.preventDefault()})),this.on("dblclick click mouseup",(function(e){e.stopPropagation(),e.preventDefault()}))},setState:function(e){if("hide"!=e){this.setVisible(!0);var t=["M",1.5-this.radius,0,"L",this.radius-1.5,0];e==n&&t.push(["M",0,1.5-this.radius,"L",0,this.radius-1.5]),this.sign.setPathData(t)}else this.setVisible(!1)}});return{commands:{expand:r,expandtolevel:c,collapse:h},events:{layoutapply:function(e){var t=e.node.getRenderer("ExpanderRenderer");t.getRenderShape()&&t.update(t.getRenderShape(),e.node)},beforerender:function(e){var t=e.node,n=!t.parent||t.parent.isExpanded();t.getRenderContainer().setVisible(n),n||e.stopPropagation()},"normal.keydown":function(e){if("textedit"!=this.getStatus()){if(e.originEvent.keyCode==a["/"]){var t=this.getSelectedNode();if(!t||t==this.getRoot())return;var n=t.isExpanded();this.getSelectedNodes().forEach((function(e){n?e.collapse():e.expand(),e.renderTree()})),this.layout(100),this.fire("contentchange"),e.preventDefault(),e.stopPropagationImmediately()}e.isShortcutKey("Alt+`")&&this.execCommand("expandtolevel",9999);for(var r=1;r<6;r++)e.isShortcutKey("Alt+"+r)&&this.execCommand("expandtolevel",r)}}},renderers:{outside:i.createClass("ExpanderRenderer",{base:l,create:function(e){if(!e.isRoot())return this.expander=new f(e),e.getRenderContainer().prependShape(this.expander),e.expanderRenderer=this,this.node=e,this.expander},shouldRender:function(e){return!e.isRoot()},update:function(e,n,r){if(n.parent){var i=n.parent.isExpanded();e.setState(i&&n.children.length?n.getData(t):"hide");var o=n.getLayoutVectorIn().normalize(e.radius+n.getStyle("stroke-width")),a=n.getVertexIn().offset(o.reverse());this.expander.setTranslate(a)}}})},contextmenu:[{command:"expandtoleaf",query:function(){return!e.getSelectedNode()},fn:function(e){e.execCommand("expandtolevel",9999)}},{command:"expandtolevel1",query:function(){return!e.getSelectedNode()},fn:function(e){e.execCommand("expandtolevel",1)}},{command:"expandtolevel2",query:function(){return!e.getSelectedNode()},fn:function(e){e.execCommand("expandtolevel",2)}},{command:"expandtolevel3",query:function(){return!e.getSelectedNode()},fn:function(e){e.execCommand("expandtolevel",3)}},{divider:!0}]}}))}},e[47]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20);function s(e,t){return e.getData(t)||e.getStyle(t)}e.r(61).registerStyleHook((function(e,t){var n=e.getData("color"),r=e.getStyle("selected-color"),i=e.getStyle("color"),o=n||(e.isSelected()&&r?r:i),a=s(e,"font-family"),u=s(e,"font-size");t.fill(o),t.eachItem((function(e,t){t.setFont({family:a,size:u})}))})),a.register("fontmodule",{commands:{forecolor:i.createClass("fontcolorCommand",{base:o,execute:function(e,t){e.getSelectedNodes().forEach((function(e){e.setData("color",t),e.render()}))},queryState:function(e){return 0===e.getSelectedNodes().length?-1:0},queryValue:function(e){return 1==e.getSelectedNodes().length?e.getSelectedNodes()[0].getData("color"):"mixed"}}),background:i.createClass("backgroudCommand",{base:o,execute:function(e,t){e.getSelectedNodes().forEach((function(e){e.setData("background",t),e.render()}))},queryState:function(e){return 0===e.getSelectedNodes().length?-1:0},queryValue:function(e){return 1==e.getSelectedNodes().length?e.getSelectedNodes()[0].getData("background"):"mixed"}}),fontfamily:i.createClass("fontfamilyCommand",{base:o,execute:function(e,t){e.getSelectedNodes().forEach((function(n){n.setData("font-family",t),n.render(),e.layout()}))},queryState:function(e){return 0===e.getSelectedNodes().length?-1:0},queryValue:function(e){var t=e.getSelectedNode();return t?t.getData("font-family"):null}}),fontsize:i.createClass("fontsizeCommand",{base:o,execute:function(e,t){e.getSelectedNodes().forEach((function(n){n.setData("font-size",t),n.render(),e.layout(300)}))},queryState:function(e){return 0===e.getSelectedNodes().length?-1:0},queryValue:function(e){var t=e.getSelectedNode();return t?t.getData("font-size"):null}})}})}},e[48]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20),s=e.r(27);a.register("hyperlink",{commands:{hyperlink:i.createClass("hyperlink",{base:o,execute:function(e,t,n){e.getSelectedNodes().forEach((function(e){e.setData("hyperlink",t),e.setData("hyperlinkTitle",t&&n),e.render()})),e.layout()},queryState:function(e){var t=e.getSelectedNodes(),n=0;return 0===t.length?-1:(t.forEach((function(e){if(e&&e.getData("hyperlink"))return n=0,!1})),n)},queryValue:function(e){var t=e.getSelectedNode();return{url:t.getData("hyperlink"),title:t.getData("hyperlinkTitle")}}})},renderers:{right:i.createClass("hyperlinkrender",{base:s,create:function(){var e=new i.HyperLink,t=new i.Path,n=new i.Rect(24,22,-2,-6,4).fill("rgba(255, 255, 255, 0)");return t.setPathData("M16.614,10.224h-1.278c-1.668,0-3.07-1.07-3.599-2.556h4.877c0.707,0,1.278-0.571,1.278-1.278V3.834 c0-0.707-0.571-1.278-1.278-1.278h-4.877C12.266,1.071,13.668,0,15.336,0h1.278c2.116,0,3.834,1.716,3.834,3.834V6.39 C20.448,8.508,18.73,10.224,16.614,10.224z M5.112,5.112c0-0.707,0.573-1.278,1.278-1.278h7.668c0.707,0,1.278,0.571,1.278,1.278 S14.765,6.39,14.058,6.39H6.39C5.685,6.39,5.112,5.819,5.112,5.112z M2.556,3.834V6.39c0,0.707,0.573,1.278,1.278,1.278h4.877 c-0.528,1.486-1.932,2.556-3.599,2.556H3.834C1.716,10.224,0,8.508,0,6.39V3.834C0,1.716,1.716,0,3.834,0h1.278 c1.667,0,3.071,1.071,3.599,2.556H3.834C3.129,2.556,2.556,3.127,2.556,3.834z").fill("#666"),e.addShape(n),e.addShape(t),e.setTarget("_blank"),e.setStyle("cursor","pointer"),e.on("mouseover",(function(){n.fill("rgba(255, 255, 200, .8)")})).on("mouseout",(function(){n.fill("rgba(255, 255, 255, 0)")})),e},shouldRender:function(e){return e.getData("hyperlink")},update:function(e,t,n){var r=t.getData("hyperlink");e.setHref("#");for(var o=["^http:","^https:","^ftp:","^mailto:"],a=0;a<o.length;a++){if(new RegExp(o[a]).test(r)){e.setHref(r);break}}var s=t.getData("hyperlinkTitle");s=s?[s,"(",r,")"].join(""):r,e.node.setAttributeNS("http://www.w3.org/1999/xlink","title",s);var u=t.getStyle("space-right");return e.setTranslate(n.right+u+2,-5),new i.Box({x:n.right+u,y:-11,width:24,height:22})}})}})}},e[49]={value:function(t,n,r){var i=e.r(17),o=e.r(15),a=e.r(20);e.r(9);a.register("ImageViewer",(function(){function e(e,t,r){var i=document.createElement(e);return n(i,t),r&&r.length&&r.forEach((function(e){i.appendChild(e)})),i}function t(e,t,n){e.addEventListener(t,n)}function n(e,t){t&&t.split(" ").forEach((function(t){e.classList.add(t)}))}var r=i.createClass("ImageViewer",{constructor:function(){var n=e("button","km-image-viewer-btn km-image-viewer-close"),r=e("button","km-image-viewer-btn km-image-viewer-source"),i=this.image=e("img"),o=this.toolbar=e("div","km-image-viewer-toolbar",[r,n]),a=e("div","km-image-viewer-container",[i]),s=this.viewer=e("div","km-image-viewer",[o,a]);this.hotkeyHandler=this.hotkeyHandler.bind(this),t(n,"click",this.close.bind(this)),t(r,"click",this.viewSource.bind(this)),t(i,"click",this.zoomImage.bind(this)),t(s,"contextmenu",this.toggleToolbar.bind(this)),t(document,"keydown",this.hotkeyHandler)},dispose:function(){this.close(),document.removeEventListener("remove",this.hotkeyHandler)},hotkeyHandler:function(e){this.actived&&e.keyCode===o.esc&&this.close()},toggleToolbar:function(e){e&&e.preventDefault(),this.toolbar.classList.toggle("hidden")},zoomImage:function(e){var t=this.image;"boolean"==typeof e?e&&n(t,"limited"):t.classList.toggle("limited")},viewSource:function(e){window.open(this.image.src)},open:function(e){var t=document.querySelector("input");t&&(t.focus(),t.blur()),this.image.src=e,this.zoomImage(!0),document.body.appendChild(this.viewer),this.actived=!0},close:function(){this.image.src="",document.body.removeChild(this.viewer),this.actived=!1}});return{init:function(){this.viewer=new r},events:{"normal.dblclick":function(e){var t=e.kityEvent.targetShape;"Image"===t.__KityClassName&&t.url&&this.viewer.open(t.url)}}}}))}},e[50]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20),s=e.r(27);a.register("image",(function(){return{defaultOptions:{maxImageWidth:200,maxImageHeight:200},commands:{image:i.createClass("ImageCommand",{base:o,execute:function(e,t,n){var r=e.getSelectedNodes();!function(e,t){var n=document.createElement("img");n.onload=function(){t(n.width,n.height)},n.onerror=function(){t(null)},n.src=e}(t,(function(i,o){r.forEach((function(r){var a=function(e,t,n,r){var i=e/t;return e>n&&i>n/r?t=(e=n)/i:t>r&&(e=(t=r)*i),{width:0|e,height:0|t}}(i,o,e.getOption("maxImageWidth"),e.getOption("maxImageHeight"));r.setData("image",t),r.setData("imageTitle",t&&n),r.setData("imageSize",t&&a),r.render()})),e.fire("saveScene"),e.layout(300)}))},queryState:function(e){var t=e.getSelectedNodes(),n=0;return 0===t.length?-1:(t.forEach((function(e){if(e&&e.getData("image"))return n=0,!1})),n)},queryValue:function(e){var t=e.getSelectedNode();return{url:t.getData("image"),title:t.getData("imageTitle")}}})},renderers:{top:i.createClass("ImageRenderer",{base:s,create:function(e){return new i.Image(e.getData("image"))},shouldRender:function(e){return e.getData("image")},update:function(e,t,n){var r=t.getData("image"),o=t.getData("imageTitle"),a=t.getData("imageSize"),s=t.getStyle("space-top");if(a){o&&e.node.setAttributeNS("http://www.w3.org/1999/xlink","title",o);var u=n.cx-a.width/2,c=n.y-a.height-s;return e.setUrl(r).setX(0|u).setY(0|c).setWidth(0|a.width).setHeight(0|a.height),new i.Box(0|u,0|c,0|a.width,0|a.height)}}})}}}))}},e[51]={value:function(t,n,r){e.r(17),e.r(33),e.r(15),e.r(19),e.r(21),e.r(9);var i=e.r(20);e.r(27);i.register("KeyboardModule",(function(){var e=Math.min,t=Math.max,n=(Math.abs,Math.sqrt);Math.exp;function r(e){var t,n=[];e.traverse((function(e){(t=e.getLayoutBox()).width&&t.height&&n.push({left:t.x,top:t.y,right:t.x+t.width,bottom:t.y+t.height,width:t.width,height:t.height,node:e})}));for(var r=0;r<n.length;r++)o(n,r)}function i(r,i){var o,a,s,u,c,l,h;o=e(r.left,i.left),a=t(r.right,i.right),s=e(r.top,i.top),u=t(r.bottom,i.bottom),c=a-o-r.width-i.width,l=u-s-r.height-i.height,h=c<0?l:l<0?c:n(c*c+l*l);var f=r.node,d=i.node;return f.parent==d.parent&&(h/=10),d.parent==f&&(h/=5),h}function o(e,t){for(var n,r,o=e[t],a={},s=0;s<e.length;s++)s!=t&&(r=i(n=e[s],o),n.right<o.left&&(!a.left||r<a.left.dist)&&(a.left={dist:r,node:n.node}),n.left>o.right&&(!a.right||r<a.right.dist)&&(a.right={dist:r,node:n.node}),n.bottom<o.top&&(!a.top||r<a.top.dist)&&(a.top={dist:r,node:n.node}),n.top>o.bottom&&(!a.down||r<a.down.dist)&&(a.down={dist:r,node:n.node}));o.node._nearestNodes={right:a.right&&a.right.node||null,top:a.top&&a.top.node||null,left:a.left&&a.left.node||null,down:a.down&&a.down.node||null}}return{events:{layoutallfinish:function(){r(this.getRoot())},"normal.keydown readonly.keydown":function(e){var t=this;["left","right","up","down"].forEach((function(n){e.isShortcutKey(n)&&(!function(e,t){var n=e.getSelectedNode();if(!n)return e.select(e.getRoot()),void r(e.getRoot());n._nearestNodes||r(e.getRoot());var i=n._nearestNodes[t];i&&e.select(i,!0)}(t,"up"==n?"top":n),e.preventDefault())}))}}}}))}},e[52]={value:function(t,n,r){var i=e.r(17),o=e.r(9),a=e.r(20),s=i.createClass("LayoutCommand",{base:o,execute:function(e,t){e.getSelectedNodes().forEach((function(e){e.layout(t)}))},queryValue:function(e){var t=e.getSelectedNode();if(t)return t.getData("layout")},queryState:function(e){return e.getSelectedNode()?0:-1}}),u=i.createClass("ResetLayoutCommand",{base:o,execute:function(e){var t=e.getSelectedNodes();t.length||(t=[e.getRoot()]),t.forEach((function(e){e.traverse((function(e){e.resetLayoutOffset(),e.isRoot()||e.setData("layout",null)}))})),e.layout(300)},enableReadOnly:!0});a.register("LayoutModule",{commands:{layout:s,resetlayout:u},contextmenu:[{command:"resetlayout"},{divider:!0}],commandShortcutKeys:{resetlayout:"Ctrl+Shift+L"}})}},e[53]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21)),a=e.r(9),s=e.r(20),u=(e.r(27),i.createClass("AppendChildCommand",{base:a,execute:function(e,t){var n=e.getSelectedNode();if(!n)return null;var r=e.createNode(t,n);e.select(r,!0),n.isExpanded()?r.render():(n.expand(),n.renderTree()),e.layout(600)},queryState:function(e){return e.getSelectedNode()?0:-1}})),c=i.createClass("AppendSiblingCommand",{base:a,execute:function(e,t){var n=e.getSelectedNode(),r=n.parent;if(!r)return e.execCommand("AppendChildNode",t);var i=e.createNode(t,r,n.getIndex()+1);i.setGlobalLayoutTransform(n.getGlobalLayoutTransform()),e.select(i,!0),i.render(),e.layout(600)},queryState:function(e){return e.getSelectedNode()?0:-1}}),l=i.createClass("RemoverNodeCommand",{base:a,execute:function(e){var t=e.getSelectedNodes(),n=o.getCommonAncestor.apply(null,t),r=t[0].getIndex();if(t.forEach((function(t){t.isRoot()||e.removeNode(t)})),1==t.length){var i=n.children[r-1]||n.children[r];e.select(i||n||e.getRoot(),!0)}else e.select(n||e.getRoot(),!0);e.layout(600)},queryState:function(e){var t=e.getSelectedNode();return t&&!t.isRoot()?0:-1}}),h=i.createClass("AppendParentCommand",{base:a,execute:function(e,t){var n=e.getSelectedNodes();n.sort((function(e,t){return e.getIndex()-t.getIndex()}));var r=n[0].parent,i=e.createNode(t,r,n[0].getIndex());n.forEach((function(e){i.appendChild(e)})),i.setGlobalLayoutTransform(n[n.length>>1].getGlobalLayoutTransform()),e.select(i,!0),e.layout(600)},queryState:function(e){var t=e.getSelectedNodes();if(!t.length)return-1;var n=t[0].parent;if(!n)return-1;for(var r=1;r<t.length;r++)if(t[r].parent!=n)return-1;return 0}});s.register("NodeModule",(function(){return{commands:{AppendChildNode:u,AppendSiblingNode:c,RemoveNode:l,AppendParentNode:h},commandShortcutKeys:{appendsiblingnode:"normal::Enter",appendchildnode:"normal::Insert|Tab",appendparentnode:"normal::Shift+Tab|normal::Shift+Insert",removenode:"normal::Del|Backspace"}}}))}},e[54]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20),s=e.r(27);a.register("NoteModule",(function(){var e=i.createClass("NoteCommand",{base:o,execute:function(e,t){var n=e.getSelectedNode();n.setData("note",t),n.render(),n.getMinder().layout(300)},queryState:function(e){return 1===e.getSelectedNodes().length?0:-1},queryValue:function(e){var t=e.getSelectedNode();return t&&t.getData("note")}}),t=i.createClass("NoteIcon",{base:i.Group,constructor:function(){this.callBase(),this.width=16,this.height=17,this.rect=new i.Rect(16,17,.5,-8.5,2).fill("transparent"),this.path=(new i.Path).setPathData("M9,9H3V8h6L9,9L9,9z M9,7H3V6h6V7z M9,5H3V4h6V5z M8.5,11H2V2h8v7.5 M9,12l2-2V1H1v11").setTranslate(2.5,-6.5),this.addShapes([this.rect,this.path]),this.on("mouseover",(function(){this.rect.fill("rgba(255, 255, 200, .8)")})).on("mouseout",(function(){this.rect.fill("transparent")})),this.setStyle("cursor","pointer")}});return{renderers:{right:i.createClass("NoteIconRenderer",{base:s,create:function(e){var n=new t;return n.on("mousedown",(function(t){t.preventDefault(),e.getMinder().fire("editnoterequest")})),n.on("mouseover",(function(){e.getMinder().fire("shownoterequest",{node:e,icon:n})})),n.on("mouseout",(function(){e.getMinder().fire("hidenoterequest",{node:e,icon:n})})),n},shouldRender:function(e){return e.getData("note")},update:function(e,t,n){var r=n.right+t.getStyle("space-left"),o=n.cy;return e.path.fill(t.getStyle("color")),e.setTranslate(r,o),new i.Box(r,Math.round(o-e.height/2),e.width,e.height)}})},commands:{note:e}}}))}},e[55]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=(e.r(19),e.r(21),e.r(9),e.r(20)),s=e.r(27),u=i.createClass("OutlineRenderer",{base:s,create:function(e){var t=(new i.Rect).setId(o.uuid("node_outline"));return this.bringToBack=!0,t},update:function(e,t,n){var r=t.getStyle("shape"),o=t.getStyle("padding-left"),a=t.getStyle("padding-right"),s=t.getStyle("padding-top"),u=t.getStyle("padding-bottom"),c={x:n.x-o,y:n.y-s,width:n.width+o+a,height:n.height+s+u},l=t.getStyle("radius");if(r&&"circle"==r){var h=Math.pow;l=(0,Math.round)(Math.sqrt(h(c.width,2)+h(c.height,2))/2),c.x=n.cx-l,c.y=n.cy-l,c.width=2*l,c.height=2*l}var f=t.isSelected()?t.getMinder().isFocused()?"selected-":"blur-selected-":"";return e.setPosition(c.x,c.y).setSize(c.width,c.height).setRadius(l).fill(t.getData("background")||t.getStyle(f+"background")||t.getStyle("background")).stroke(t.getStyle(f+"stroke"||0),t.getStyle(f+"stroke-width")),new i.Box(c)}}),c=i.createClass("ShadowRenderer",{base:s,create:function(e){return this.bringToBack=!0,new i.Rect},shouldRender:function(e){return e.getStyle("shadow")},update:function(e,t,n){e.setPosition(n.x+4,n.y+5).fill(t.getStyle("shadow"));var r=t.getStyle("shape");if(r){if("circle"==r){var i=Math.max(n.width,n.height);e.setSize(i,i),e.setRadius(i/2)}}else e.setSize(n.width,n.height),e.setRadius(t.getStyle("radius"))}}),l=new i.Marker;l.setWidth(10),l.setHeight(12),l.setRef(0,0),l.setViewBox(-6,-4,8,10),l.addShape((new i.Path).setPathData("M-5-3l5,3,-5,3").stroke("#33ffff"));var h=/wire/.test(window.location.href),f=i.createClass("WireframeRenderer",{base:s,create:function(){var e=new i.Group,t=this.oxy=(new i.Path).stroke("#f6f").setPathData("M0,-50L0,50M-50,0L50,0"),n=this.wireframe=(new i.Rect).stroke("lightgreen"),r=this.vectorIn=(new i.Path).stroke("#66ffff"),o=this.vectorOut=(new i.Path).stroke("#66ffff");return r.setMarker(l,"end"),o.setMarker(l,"end"),e.addShapes([t,n,r,o])},shouldRender:function(){return h},update:function(e,t,n){this.wireframe.setPosition(n.x,n.y).setSize(n.width,n.height);var r=t.getVertexIn(),i=t.getVertexOut(),o=t.getLayoutVectorIn().normalize(30),a=t.getLayoutVectorOut().normalize(30);this.vectorIn.setPathData(["M",r.offset(o.reverse()),"L",r]),this.vectorOut.setPathData(["M",i,"l",a])}});a.register("OutlineModule",(function(){return{events:h?{ready:function(){this.getPaper().addResource(l)},layoutallfinish:function(){this.getRoot().traverse((function(e){e.getRenderer("WireframeRenderer").update(null,e,e.getContentBox())}))}}:null,renderers:{outline:u,outside:[c,f]}}}))}},e[56]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=(e.r(19),e.r(21),e.r(9)),s=e.r(20),u=e.r(27);s.register("PriorityModule",(function(){var e=[null,["#FF1200","#840023"],["#0074FF","#01467F"],["#00AF00","#006300"],["#FF962E","#B25000"],["#A464FF","#4720C4"],["#A3A3A3","#515151"],["#A3A3A3","#515151"],["#A3A3A3","#515151"],["#A3A3A3","#515151"]],t="M20,10c0,3.866-3.134,7-7,7H7c-3.866,0-7-3.134-7-7V7c0-3.866,3.134-7,7-7h6c3.866,0,7,3.134,7,7V10z",n="priority",r=i.createClass("PriorityIcon",{base:i.Group,constructor:function(){this.callBase(),this.setSize(20),this.create(),this.setId(o.uuid("node_priority"))},setSize:function(e){this.width=this.height=e},create:function(){var e,n,r;(new i.Path).setPathData(t).fill("white"),e=(new i.Path).setPathData("M0,13c0,3.866,3.134,7,7,7h6c3.866,0,7-3.134,7-7V7H0V13z").setTranslate(.5,.5),n=(new i.Path).setPathData(t).setOpacity(.8).setTranslate(.5,.5),r=(new i.Text).setX(this.width/2-.5).setY(this.height/2).setTextAnchor("middle").setVerticalAlign("middle").setFontItalic(!0).setFontSize(12).fill("white"),this.addShapes([e,n,r]),this.mask=n,this.back=e,this.number=r},setValue:function(t){var n=this.back,r=this.mask,i=this.number,o=e[t];o&&(n.fill(o[1]),r.fill(o[0])),i.setContent(t)}});return{commands:{priority:i.createClass("SetPriorityCommand",{base:a,execute:function(e,t){for(var r=e.getSelectedNodes(),i=0;i<r.length;i++)r[i].setData(n,t||null).render();e.layout()},queryValue:function(e){for(var t,r=e.getSelectedNodes(),i=0;i<r.length&&!(t=r[i].getData(n));i++);return t||null},queryState:function(e){return e.getSelectedNodes().length?0:-1}})},renderers:{left:i.createClass("PriorityRenderer",{base:u,create:function(e){return new r},shouldRender:function(e){return e.getData(n)},update:function(e,t,r){var o,a,s=t.getData(n),u=t.getStyle("space-left");return e.setValue(s),o=r.left-e.width-u,a=-e.height/2,e.setTranslate(o,a),new i.Box({x:o,y:a,width:e.width,height:e.height})}})}}}))}},e[57]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=(e.r(19),e.r(21),e.r(9)),s=e.r(20),u=e.r(27);s.register("ProgressModule",(function(){var e="progress",t=(new i.LinearGradient).pipe((function(e){e.setStartPosition(0,0),e.setEndPosition(0,1),e.addStop(0,"#fff"),e.addStop(1,"#ccc")}));this.getPaper().addResource(t);var n=i.createClass("ProgressIcon",{base:i.Group,constructor:function(e){this.callBase(),this.setSize(20),this.create(),this.setValue(e),this.setId(o.uuid("node_progress")),this.translate(.5,.5)},setSize:function(e){this.width=this.height=e},create:function(){var e,n,r,o,a;e=new i.Circle(9).fill("#FFED83"),n=new i.Pie(9,0).fill("#43BC00"),r=(new i.Path).setPathData("M10,3c4.418,0,8,3.582,8,8h1c0-5.523-3.477-10-9-10S1,5.477,1,11h1C2,6.582,5.582,3,10,3z").setTranslate(-10,-10).fill("#8E8E8E"),o=(new i.Path).setTranslate(-10,-10).setPathData("M10,0C4.477,0,0,4.477,0,10c0,5.523,4.477,10,10,10s10-4.477,10-10C20,4.477,15.523,0,10,0zM10,18c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S14.418,18,10,18z").fill(t),a=(new i.Path).setTranslate(-10,-10).setPathData("M15.812,7.896l-6.75,6.75l-4.5-4.5L6.25,8.459l2.812,2.803l5.062-5.053L15.812,7.896z").fill("#EEE"),this.addShapes([e,n,r,a,o]),this.pie=n,this.check=a},setValue:function(e){this.pie.setAngle(-360*(e-1)/8),this.check.setVisible(9==e)}});return{commands:{progress:i.createClass("ProgressCommand",{base:a,execute:function(t,n){for(var r=t.getSelectedNodes(),i=0;i<r.length;i++)r[i].setData(e,n||null).render();t.layout()},queryValue:function(t){for(var n,r=t.getSelectedNodes(),i=0;i<r.length&&!(n=r[i].getData(e));i++);return n||null},queryState:function(e){return e.getSelectedNodes().length?0:-1}})},renderers:{left:i.createClass("ProgressRenderer",{base:u,create:function(e){return new n},shouldRender:function(t){return t.getData(e)},update:function(t,n,r){var o,a,s=n.getData(e),u=n.getStyle("space-left");return t.setValue(s),o=r.left-t.width-u,a=-t.height/2,t.setTranslate(o+t.width/2,a+t.height/2),new i.Box(o,a,t.width,t.height)}})}}}))}},e[58]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19)),a=(e.r(21),e.r(9)),s=e.r(20),u=e.r(27);s.register("Resource",(function(){var e,t,n,r,s,c,l,h,f,d,p=(e=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],s=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479],d=function(e){return e<0&&(e+=4294967296),("00000000"+e.toString(16)).slice(-8)},c=[[16,50,84,118,152,186,220,254],[174,132,249,109,193,32,123,53],[139,12,37,223,234,99,23,73],[151,19,205,235,98,165,4,143],[9,117,66,250,30,203,134,211],[194,166,176,56,212,87,239,145],[92,241,222,164,112,54,41,184],[189,231,28,147,5,79,104,162],[246,158,59,128,44,125,65,90],[42,72,103,81,191,233,195,13]],l=function(e,t,n){var r=h[e]^h[t];h[e]=r>>>n|r<<32-n},t=function(e,t,i,o,a){var u=r+c[n][e]%16,d=r+(c[n][e]>>4);i=4+i%4,o=8+o%4,a=12+a%4,h[t%=4]+=h[i]+(f[u]^s[d%16]),l(a,t,16),h[o]+=h[a],l(i,o,12),h[t]+=h[i]+(f[d]^s[u%16]),l(a,t,8),h[o]+=h[a],l(i,o,7)},function(i,o){var a,u,c,l,p,g,m,v;for(o instanceof Array&&4===o.length||(o=[0,0,0,0]),u=e.slice(0),a=s.slice(0,8),n=0;n<4;n+=1)a[n]^=o[n];if(p=(c=16*i.length)%512>446||c%512==0?0:c,c%512==432)i+="\u8001";else{for(i+="\u8000";i.length%32!=27;)i+="\\0";i+=""}for(f=[],v=0;v<i.length;v+=2)f.push(65536*i.charCodeAt(v)+i.charCodeAt(v+1));for(f.push(0),f.push(c),g=f.length-16,m=0,r=0;r<f.length;r+=16){for(m+=512,l=r===g?p:Math.min(c,m),(h=u.concat(a))[12]^=l,h[13]^=l,n=0;n<10;n+=1)for(v=0;v<8;v+=1)v<4?t(v,v,v,v,v):t(v,v,v+1,v+2,v+3);for(v=0;v<8;v+=1)u[v]^=o[v%4]^h[v]^h[v+8]}return u.map(d).join("")}),g=[51,303,75,200,157,0,26,254].map((function(e){return i.Color.createHSL(e,100,85)}));i.extendClass(o,{getHashCode:function(e){var t,n=1315423911;for(t=(e=p(e)).length-1;t>=0;t--)n^=(n<<5)+e.charCodeAt(t)+(n>>2);return 2147483647&n},getResourceColor:function(e){var t,n=this._getResourceColorIndexMapping();return Object.prototype.hasOwnProperty.call(n,e)||(t=this._getNextResourceColorIndex(),n[e]=t),g[n[e]]||i.Color.createHSL(Math.floor(this.getHashCode(e)/2147483647*359),100,85)},getUsedResource:function(){var e,t=this._getResourceColorIndexMapping(),n=[];for(e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.push(e);return n},_getNextResourceColorIndex:function(){var e,t,n,r=this._getResourceColorIndexMapping();for(e in t=[],r)Object.prototype.hasOwnProperty.call(r,e)&&t.push(r[e]);for(n=0;n<g.length;n++)if(!~t.indexOf(n))return n;return-1},_getResourceColorIndexMapping:function(){return this._resourceColorMapping||(this._resourceColorMapping={})}});var m=i.createClass("ResourceCommand",{base:a,execute:function(e,t){var n=e.getSelectedNodes();"string"==typeof t&&(t=[t]),n.forEach((function(e){e.setData("resource",t).render()})),e.layout(200)},queryValue:function(e){var t=e.getSelectedNodes(),n=[];return t.forEach((function(e){var t=e.getData("resource");t&&t.forEach((function(e){~n.indexOf(e)||n.push(e)}))})),n},queryState:function(e){return e.getSelectedNode()?0:-1}}),v=i.createClass("ResourceOverlay",{base:i.Group,constructor:function(){var e,t;this.callBase(),t=this.rect=(new i.Rect).setRadius(4),e=this.text=(new i.Text).setFontSize(12).setVerticalAlign("middle"),this.addShapes([t,e])},setValue:function(e,t){var n,r,i;n=this.text,e==this.lastResourceName?r=this.lastBox:(n.setContent(e),r=n.getBoundaryBox(),this.lastResourceName=e,this.lastBox=r),n.setX(8).fill(t.dec("l",70)),(i=this.rect).setPosition(0,r.y-4),this.width=Math.round(r.width+16),this.height=Math.round(r.height+8),i.setSize(this.width,this.height),i.fill(t)}});return{commands:{resource:m},renderers:{right:i.createClass("ResourceRenderer",{base:u,create:function(e){return this.overlays=[],new i.Group},shouldRender:function(e){return e.getData("resource")&&e.getData("resource").length},update:function(e,t,n){var r=t.getStyle("space-right"),o=this.overlays,a=t.getData("resource").filter((function(e){return null!==e}));if(0!==a.length){var s,u,c,l=t.getMinder();for(c=0,s=0;s<a.length;s++)c+=r,(u=o[s])||(u=new v,o.push(u),e.addShape(u)),u.setVisible(!0),u.setValue(a[s],l.getResourceColor(a[s])),u.setTranslate(c,-1),c+=u.width;for(;u=o[s++];)u.setVisible(!1);return e.setTranslate(n.right,0),new i.Box({x:n.right,y:Math.round(-o[0].height/2),width:c,height:o[0].height})}}})}}}))}},e[59]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9),e.r(20));e.r(27);o.register("Select",(function(){var e,t,n,r=this,o=r.getRenderContainer(),a=(e=null,t=new i.Path,n=!1,{selectStart:function(t){if(!t.originEvent.button&&!t.originEvent.altKey)return e?this.selectEnd():void(e=t.getPosition(o).round())},selectMove:function(a){if("textedit"!=r.getStatus()&&e){var s=e,u=a.getPosition(o);if(!n){if(i.Vector.fromPoints(s,u).length()<10)return;n=!0,o.addShape(t),t.fill(r.getStyle("marquee-background")).stroke(r.getStyle("marquee-stroke")).setOpacity(.8).getDrawer().clear()}var c=new i.Box(s.x,s.y,u.x-s.x,u.y-s.y),l=[];c.left=Math.round(c.left),c.top=Math.round(c.top),c.right=Math.round(c.right),c.bottom=Math.round(c.bottom),t.getDrawer().pipe((function(){this.clear(),this.moveTo(c.left,c.top),this.lineTo(c.right,c.top),this.lineTo(c.right,c.bottom),this.lineTo(c.left,c.bottom),this.close()})),r.getRoot().traverse((function(e){e.getLayoutBox().intersect(c).isEmpty()||l.push(e)})),r.select(l,!0),window.getSelection().removeAllRanges()}},selectEnd:function(r){e&&(e=null),n&&(t.fadeOut(200,"ease",0,(function(){t.remove&&t.remove()})),n=!1)}}),s=null,u=null;return{init:function(){window.addEventListener("mouseup",(function(){a.selectEnd()}))},events:{mousedown:function(e){var t=e.getTargetNode();t?e.isShortcutKey("Ctrl")?this.toggleSelect(t):t.isSelected()?this.isSingleSelect()||(s=t,u=e.getPosition()):this.select(t,!0):(this.removeAllSelectedNodes(),a.selectStart(e),this.setStatus("normal"))},mousemove:a.selectMove,mouseup:function(e){var t=e.getTargetNode();if(t&&t==s){var n=e.getPosition();i.Vector.fromPoints(u,n).length()<1&&this.select(s,!0),s=null}a.selectEnd(e)},"normal.keydown":function(e){if(e.isShortcutKey("ctrl+a")){var t=[];this.getRoot().traverse((function(e){t.push(e)})),this.select(t,!0),e.preventDefault()}}}}}))}},e[60]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20);e.r(27);a.register("StyleModule",(function(){var e=["font-size","font-family","font-weight","font-style","background","color"],t=null;function n(t){for(var n=t.getData(),r=0;r<e.length;r++)if(e[r]in n)return!0}return{commands:{copystyle:i.createClass("CopyStyleCommand",{base:o,execute:function(n){var r=n.getSelectedNode().getData();return t={},e.forEach((function(e){e in r?t[e]=r[e]:(t[e]=null,delete t[e])})),t},queryState:function(e){var t=e.getSelectedNodes();return 1!==t.length?-1:n(t[0])?0:-1}}),pastestyle:i.createClass("PastStyleCommand",{base:o,execute:function(e){return e.getSelectedNodes().forEach((function(e){for(var n in t)t.hasOwnProperty(n)&&e.setData(n,t[n])})),e.renderNodeBatch(e.getSelectedNodes()),e.layout(300),t},queryState:function(e){return t&&e.getSelectedNodes().length?0:-1}}),clearstyle:i.createClass("ClearStyleCommand",{base:o,execute:function(n){return n.getSelectedNodes().forEach((function(t){e.forEach((function(e){t.setData(e)}))})),n.renderNodeBatch(n.getSelectedNodes()),n.layout(300),t},queryState:function(e){var t=e.getSelectedNodes();if(!t.length)return-1;for(var r=0;r<t.length;r++)if(n(t[r]))return 0;return-1}})}}}))}},e[61]={value:function(t,n,r){var i=e.r(17),o=e.r(33),a=(e.r(19),e.r(21)),s=e.r(9),u=e.r(20),c=e.r(27),l={safari:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.17,"\u6977\u4F53,\u6977\u4F53_GB2312,SimKai":-.1,"\u96B6\u4E66, SimLi":-.1,"comic sans ms":-.23,"impact,chicago":-.15,"times new roman":-.1,"arial black,avant garde":-.17,default:0},ie:{10:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.17,"comic sans ms":-.17,"impact,chicago":-.08,"times new roman":.04,"arial black,avant garde":-.17,default:-.15},11:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.17,"arial,helvetica,sans-serif":-.17,"comic sans ms":-.17,"impact,chicago":-.08,"times new roman":.04,"sans-serif":-.16,"arial black,avant garde":-.17,default:-.15}},edge:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.15,"arial,helvetica,sans-serif":-.17,"comic sans ms":-.17,"impact,chicago":-.08,"sans-serif":-.16,"arial black,avant garde":-.17,default:-.15},sg:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.15,"arial,helvetica,sans-serif":-.05,"comic sans ms":-.22,"impact,chicago":-.16,"times new roman":-.03,"arial black,avant garde":-.22,default:-.15},chrome:{Mac:{"andale mono":-.05,"comic sans ms":-.3,"impact,chicago":-.13,"times new roman":-.1,"arial black,avant garde":-.17,default:0},Win:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.15,"arial,helvetica,sans-serif":-.02,"arial black,avant garde":-.2,"comic sans ms":-.2,"impact,chicago":-.12,"times new roman":-.02,default:-.15},Lux:{"andale mono":-.05,"comic sans ms":-.3,"impact,chicago":-.13,"times new roman":-.1,"arial black,avant garde":-.17,default:0}},firefox:{Mac:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.2,"\u5B8B\u4F53,SimSun":.05,"comic sans ms":-.2,"impact,chicago":-.15,"arial black,avant garde":-.17,"times new roman":-.1,default:.05},Win:{"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.16,"andale mono":-.17,"arial,helvetica,sans-serif":-.17,"comic sans ms":-.22,"impact,chicago":-.23,"times new roman":-.22,"sans-serif":-.22,"arial black,avant garde":-.17,default:-.16},Lux:{"\u5B8B\u4F53,SimSun":-.2,"\u5FAE\u8F6F\u96C5\u9ED1,Microsoft YaHei":-.2,"\u9ED1\u4F53, SimHei":-.2,"\u96B6\u4E66, SimLi":-.2,"\u6977\u4F53,\u6977\u4F53_GB2312,SimKai":-.2,"andale mono":-.2,"arial,helvetica,sans-serif":-.2,"comic sans ms":-.2,"impact,chicago":-.2,"times new roman":-.2,"sans-serif":-.2,"arial black,avant garde":-.2,default:-.16}}},h=i.createClass("TextRenderer",{base:c,create:function(){return(new i.Group).setId(o.uuid("node_text"))},update:function(e,t){function n(e){return t.getData(e)||t.getStyle(e)}var r,o=t.getText(),a=o?o.split("\\n"):[" "],s=t.getStyle("line-height"),u=n("font-size"),c=n("font-family")||"default",h=-(s*u*a.length-(s-1)*u)/2,f=i.Browser;f.chrome||f.opera||f.bd||"chrome"===f.lb?r=l.chrome[f.platform][c]:f.gecko?r=l.firefox[f.platform][c]:f.sg?r=l.sg[c]:f.safari?r=l.safari[c]:f.ie?r=l.ie[f.version][c]:f.edge?r=l.edge[c]:f.lb&&(r=.9),e.setTranslate(0,(r||0)*u);var d=new i.Box,p=Math.round;this.setTextStyle(t,e);var g,m,v,y=a.length,x=e.getItems().length;if(y<x)for(g=y;e.getItem(g);)e.removeItem(g);else if(y>x)for(var b=y-x;b--;)m=(new i.Text).setAttr("text-rendering","inherit"),i.Browser.ie||i.Browser.edge?m.setVerticalAlign("top"):m.setAttr("dominant-baseline","text-before-edge"),e.addItem(m);for(g=0;v=a[g],m=e.getItem(g);g++)m.setContent(v),(i.Browser.ie||i.Browser.edge)&&m.fixPosition();this.setTextStyle(t,e);var w=t.getText()+["font-size","font-name","font-weight","font-style"].map(n).join("/");return t._currentTextHash==w&&t._currentTextGroupBox?t._currentTextGroupBox:(t._currentTextHash=w,function(){e.eachItem((function(e,t){var n=h+e*u*s;t.setY(n);var r=t.getBoundaryBox();d=d.merge(new i.Box(0,n,r.height&&r.width||1,u))}));var n=new i.Box(p(d.x),p(d.y),p(d.width),p(d.height));return t._currentTextGroupBox=n,n})},setTextStyle:function(e,t){h._styleHooks.forEach((function(n){n(e,t)}))}}),f=i.createClass({base:s,execute:function(e,t){var n=e.getSelectedNode();n&&(n.setText(t),n.render(),e.layout())},queryState:function(e){return 1==e.getSelectedNodes().length?0:-1},queryValue:function(e){var t=e.getSelectedNode();return t?t.getText():null}});o.extend(h,{_styleHooks:[],registerStyleHook:function(e){h._styleHooks.push(e)}}),i.extendClass(a,{getTextGroup:function(){return this.getRenderer("TextRenderer").getRenderShape()}}),u.register("text",{commands:{text:f},renderers:{center:h}}),r.exports=h}},e[62]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19),e.r(21),e.r(9)),a=e.r(20),s=(e.r(27),i.createClass("ViewDragger",{constructor:function(e){this._minder=e,this._enabled=!1,this._bind();var t=this;this._minder.getViewDragger=function(){return t},this.setEnabled(!1)},isEnabled:function(){return this._enabled},setEnabled:function(e){var t=this._minder.getPaper();t.setStyle("cursor",e?"pointer":"default"),t.setStyle("cursor",e?"-webkit-grab":"default"),this._enabled=e},timeline:function(){return this._moveTimeline},move:function(e,t){this._minder;var n=this.getMovement().offset(e);this.moveTo(n,t)},moveTo:function(e,t){if(t){var n=this;return this._moveTimeline&&this._moveTimeline.stop(),this._moveTimeline=this._minder.getRenderContainer().animate(new i.Animator(this.getMovement(),e,(function(e,t){n.moveTo(t)})),t,"easeOutCubic").timeline(),this._moveTimeline.on("finish",(function(){n._moveTimeline=null})),this}this._minder.getRenderContainer().setTranslate(e.round()),this._minder.fire("viewchange")},getMovement:function(){var e=this._minder.getRenderContainer().transform.translate;return e?e[0]:new i.Point},getView:function(){var e=this._minder,t=e._lastClientSize||{width:e.getRenderTarget().clientWidth,height:e.getRenderTarget().clientHeight},n=this.getMovement(),r=new i.Box(0,0,t.width,t.height);return e.getPaper().getViewPortMatrix().inverse().translate(-n.x,-n.y).transformBox(r)},_bind:function(){var e=this,t=!1,n=null,r=null;function o(r){n&&(n=null,r.stopPropagation(),t&&(e.setEnabled(!1),t=!1,"hand"==e._minder.getStatus()&&e._minder.rollbackStatus()),e._minder.getPaper().setStyle("cursor","hand"==e._minder.getStatus()?"-webkit-grab":"default"),e._minder.fire("viewchanged"))}this._minder.on("normal.mousedown normal.touchstart inputready.mousedown inputready.touchstart readonly.mousedown readonly.touchstart",(function(e){2==e.originEvent.button&&e.originEvent.preventDefault(),(e.getTargetNode()==this.getRoot()||2==e.originEvent.button||e.originEvent.altKey)&&(n=e.getPosition("view"),t=!0)})).on("normal.mousemove normal.touchmove readonly.mousemove readonly.touchmove inputready.mousemove inputready.touchmove",(function(r){("touchmove"==r.type&&r.preventDefault(),t)&&(i.Vector.fromPoints(n,r.getPosition("view")).length()>10&&(this.setStatus("hand",!0),e._minder.getPaper().setStyle("cursor","-webkit-grabbing")))})).on("hand.beforemousedown hand.beforetouchstart",(function(t){e.isEnabled()&&(n=t.getPosition("view"),t.stopPropagation(),e._minder.getPaper().setStyle("cursor","-webkit-grabbing"))})).on("hand.beforemousemove hand.beforetouchmove",(function(t){if(n){r=t.getPosition("view");var o=i.Vector.fromPoints(n,r);e.move(o),t.stopPropagation(),t.preventDefault(),t.originEvent.preventDefault(),n=r}})).on("mouseup touchend",o),window.addEventListener("mouseup",o),this._minder.on("contextmenu",(function(e){e.preventDefault()}))}}));a.register("View",(function(){var e=i.createClass("ToggleHandCommand",{base:o,execute:function(e){"hand"!=e.getStatus()?e.setStatus("hand",!0):e.rollbackStatus(),this.setContentChanged(!1)},queryState:function(e){return"hand"==e.getStatus()?1:0},enableReadOnly:!0}),t=i.createClass("CameraCommand",{base:o,execute:function(e,t){t=t||e.getRoot();var n=e.getPaper().getViewPort(),r=t.getRenderContainer().getRenderBox("view"),o=n.center.x-r.x-r.width/2,a=n.center.y-r.y,s=e._viewDragger,u=e.getOption("viewAnimationDuration");s.move(new i.Point(o,a),u),this.setContentChanged(!1)},enableReadOnly:!0}),n=i.createClass("MoveCommand",{base:o,execute:function(e,t){var n=e._viewDragger,r=e._lastClientSize,o=e.getOption("viewAnimationDuration");switch(t){case"up":n.move(new i.Point(0,r.height/2),o);break;case"down":n.move(new i.Point(0,-r.height/2),o);break;case"left":n.move(new i.Point(r.width/2,0),o);break;case"right":n.move(new i.Point(-r.width/2,0),o)}},enableReadOnly:!0});return{init:function(){this._viewDragger=new s(this)},commands:{hand:e,camera:t,move:n},events:{statuschange:function(e){this._viewDragger.setEnabled("hand"==e.currentStatus)},mousewheel:function(e){var t,n;if(!(e=e.originEvent).ctrlKey&&!e.shiftKey){"wheelDeltaX"in e?(t=e.wheelDeltaX||0,n=e.wheelDeltaY||0):(t=0,n=e.wheelDelta),this._viewDragger.move({x:t/2.5,y:n/2.5});var r=this;clearTimeout(this._mousewheeltimer),this._mousewheeltimer=setTimeout((function(){r.fire("viewchanged")}),100),e.preventDefault()}},"normal.dblclick readonly.dblclick":function(e){e.kityEvent.targetShape instanceof i.Paper&&this.execCommand("camera",this.getRoot(),800)},"paperrender finishInitHook":function(){this.getRenderTarget()&&(this.execCommand("camera",null,0),this._lastClientSize={width:this.getRenderTarget().clientWidth,height:this.getRenderTarget().clientHeight})},resize:function(e){var t={width:this.getRenderTarget().clientWidth,height:this.getRenderTarget().clientHeight},n=this._lastClientSize;this._viewDragger.move(new i.Point((t.width-n.width)/2|0,(t.height-n.height)/2|0)),this._lastClientSize=t},"selectionchange layoutallfinish":function(e){var t=this.getSelectedNode(),n=this;if(i.Browser.edge&&this.fire("paperrender"),t){var r=this._viewDragger,o=r.timeline();if(o)o.on("finish",(function(){n.fire("selectionchange")}));else{var a=r.getView(),s=t.getLayoutBox(),u=0,c=0;s.right>a.right?u+=a.right-s.right-50:s.left<a.left&&(u+=a.left-s.left+50),s.bottom>a.bottom&&(c+=a.bottom-s.bottom-50),s.top<a.top&&(c+=a.top-s.top+50),(u||c)&&r.move(new i.Point(u,c),100)}}}}}}))}},e[63]={value:function(t,n,r){var i=e.r(17),o=(e.r(33),e.r(19)),a=(e.r(21),e.r(9)),s=e.r(20);e.r(27);s.register("Zoom",(function(){var e,t=this;function n(){var e=t._zoomValue>=100?"optimize-speed":"geometricPrecision";t.getRenderContainer().setAttr("text-rendering",e)}function r(t,r){t.getPaper().getViewPort();if(r){n();var o=t.getOption("zoomAnimationDuration");if(t.getRoot().getComplex()>200||!o)t._zoomValue=r,t.zoom(r),t.fire("viewchange");else{var a=new i.Animator({beginValue:t._zoomValue,finishValue:r,setter:function(e,t){e.zoom(t)}});t._zoomValue=r,e&&e.pause(),(e=a.start(t,o,"easeInOutSine")).on("finish",(function(){t.fire("viewchange")}))}t.fire("zoom",{zoom:r})}}i.extendClass(o,{zoom:function(e){var t=this.getPaper(),n=t.getViewPort();n.zoom=e/100,n.center={x:n.center.x,y:n.center.y},t.setViewPort(n),100==e&&function(e){var t=e.shapeNode,n=t.getCTM(),r=new i.Matrix(n.a,n.b,n.c,n.d,.5+(0|n.e),.5+(0|n.f));t.setAttribute("transform","matrix("+r.toString()+")")}(t)},getZoomValue:function(){return this._zoomValue}});var s=i.createClass("Zoom",{base:a,execute:r,queryValue:function(e){return e._zoomValue}});return{init:function(){this._zoomValue=100,this.setDefaultOptions({zoom:[10,20,50,100,200]}),n()},commands:{zoomin:i.createClass("ZoomInCommand",{base:a,execute:function(e){r(e,this.nextValue(e))},queryState:function(e){return+!this.nextValue(e)},nextValue:function(e){var t,n=e.getOption("zoom");for(t=0;t<n.length;t++)if(n[t]>e._zoomValue)return n[t];return 0},enableReadOnly:!0}),zoomout:i.createClass("ZoomOutCommand",{base:a,execute:function(e){r(e,this.nextValue(e))},queryState:function(e){return+!this.nextValue(e)},nextValue:function(e){var t,n=e.getOption("zoom");for(t=n.length-1;t>=0;t--)if(n[t]<e._zoomValue)return n[t];return 0},enableReadOnly:!0}),zoom:s},events:{"normal.mousewheel readonly.mousewheel":function(e){if(e.originEvent.ctrlKey||e.originEvent.metaKey){var t=e.originEvent.wheelDelta,n=this;Math.abs(t)>100&&(clearTimeout(this._wheelZoomTimeout),this._wheelZoomTimeout=setTimeout((function(){n.getPaper()._zoom;t>0?n.execCommand("zoomin"):t<0&&n.execCommand("zoomout")}),100),e.originEvent.preventDefault())}}},commandShortcutKeys:{zoomin:"ctrl+=",zoomout:"ctrl+-"}}}))}},e[64]={value:function(t,n,r){e.r(12).registerProtocol("json",r.exports={fileDescription:"KityMinder \u683C\u5F0F",fileExtension:".km",dataType:"text",mineType:"application/json",encode:function(e){return JSON.stringify(e)},decode:function(e){return JSON.parse(e)}})}},e[65]={value:function(t,n,r){var i=e.r(12),o=/\\r\\n|\\r|\\n/,a="\\x3c!--Note--\\x3e",s="\\x3c!--/Note--\\x3e";function u(e){return c(e,1).join("\\n")}function c(e,t){var n=[],r=function(e){var t="";for(;e--;)t+="#";return t}(t=t||1);n.push(r+" "+e.data.text),n.push("");var i=e.data.note;if(i){var o=/^#/.test(i);o&&(n.push(a),i=i.replace(/^#+/gm,(function(e){return r+e}))),n.push(i),o&&n.push(s),n.push("")}return e.children&&e.children.forEach((function(e){n=n.concat(c(e,t+1))})),n}function l(e,t){var n={data:{text:e,note:""}};return t&&(t.children?t.children.push(n):t.children=[n]),n}function h(e,t){e.data.note+=t+"\\n"}function f(e){var t=/^(#+)?\\s*(.*)$/.exec(e);return{level:t[1]&&t[1].length||null,content:t[2],noteStart:e==a,noteClose:e==s,codeBlock:/^\\s*```/.test(e)}}function d(e){if(/\\S/.test(e.data.note)){for(var t=e.data.note.split("\\n");t.length&&!/\\S/.test(t[0]);)t.shift();for(;t.length&&!/\\S/.test(t[t.length-1]);)t.pop();e.data.note=t.join("\\n")}else e.data.note=null,delete e.data.note;e.children&&e.children.forEach(d)}i.registerProtocol("markdown",r.exports={fileDescription:"Markdown/GFM \u683C\u5F0F",fileExtension:".md",mineType:"text/markdown",dataType:"text",encode:function(e){return u(e.root)},decode:function(e){return function(e){var t,n,r,i,a,s,u,c={};t=(e=e.replace(/^(.+)\\n={3,}/,(function(e,t){return"# "+t}))).split(o);for(var p=0;p<t.length;p++)(r=f(n=t[p])).noteClose?s=!1:r.noteStart?s=!0:(u=r.codeBlock?!u:u,s||u||!r.level||r.level>i+1?a&&h(a,n):(i=r.level,a=l(r.content,c[i-1]),c[i]=a));return d(c[1]),c[1]}(e)}})}},e[66]={value:function(t,n,r){var i=e.r(17),o=e.r(12),a=e.r(25),s=window.URL||window.webkitURL||window;function u(e,t){return new a((function(t,n){var r=document.createElement("img");r.onload=function(){t({element:this,x:e.x,y:e.y,width:e.width,height:e.height})},r.onerror=function(e){n(e)},r.crossOrigin="anonymous",r.src=e.url}))}o.registerProtocol("png",r.exports={fileDescription:"PNG \u56FE\u7247",fileExtension:".png",mineType:"image/png",dataType:"base64",encode:function(e,t,n){var r=document.createElement("canvas"),o=r.getContext("2d"),c=t.getStyle("background").toString(),l=/url\\(\\"(.+)\\"\\)/.exec(c),h=i.Color.parse(c),f=function(e){var t,n,r,i,o,a,u=e.getPaper(),c=(u.container,e.getRenderContainer()),l=c.getRenderBox(),h=l.width+1,f=l.height+1;t=u.shapeNode.getAttribute("transform"),u.shapeNode.setAttribute("transform","translate(0.5, 0.5)"),c.translate(-l.x,-l.y),n=u.container.innerHTML,c.translate(l.x,l.y),u.shapeNode.setAttribute("transform",t),(r=document.createElement("div")).innerHTML=n,(i=r.querySelector("svg")).setAttribute("width",l.width+1),i.setAttribute("height",l.height+1),i.setAttribute("style",\'font-family: Arial, "Microsoft Yahei","Heiti SC";\'),(r=document.createElement("div")).appendChild(i),n=(n=(n=(n=r.innerHTML).replace(\' xmlns="http://www.w3.org/2000/svg" xmlns:NS1="" NS1:ns1:xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:NS2="" NS2:xmlns:ns1=""\',"")).replace(/&nbsp;|[\\x00-\\x1F\\x7F-\\x9F]/g,"")).replace(/NS\\d+:title/gi,"xlink:title"),o=new Blob([n],{type:"image/svg+xml"}),a=s.createObjectURL(o);var d=[];return function t(n){if((r=n.data).image){e.renderNode(n);var r,i=(r=n.data).image,o=r.imageSize,a=n.getRenderBox("ImageRenderer",e.getRenderContainer()),s={url:i,width:o.width,height:o.height,x:-c.getBoundaryBox().x+a.x,y:-c.getBoundaryBox().y+a.y};d.push(s)}if("collapse"!==r.expandState)for(var u=n.getChildren(),l=0;l<u.length;l++)t(u[l])}(e.getRoot()),{width:h,height:f,dataUrl:a,xml:n,imagesInfo:d}}(t),d=n&&n.width&&n.width>f.width?n.width:f.width,p=n&&n.height&&n.height>f.height?n.height:f.height,g=n&&n.width&&n.width>f.width?(n.width-f.width)/2:0,m=n&&n.height&&n.height>f.height?(n.height-f.height)/2:0,v=f.dataUrl,y=f.imagesInfo,x=20;function b(e,t){e.save(),e.fillStyle=t,e.fillRect(0,0,r.width,r.height),e.restore()}function w(e,t,n,r,i,o){i&&o?e.drawImage(t,n+x,r+x,i,o):e.drawImage(t,n+x,r+x)}function _(e){return e.toDataURL("image/png")}function k(e){var t=e.map((function(e){return t=e,a((function(e,n){var r=new XMLHttpRequest;r.open("GET",t.url+"?_="+Date.now(),!0),r.responseType="blob",r.onreadystatechange=function(){if(4===r.readyState&&200===r.status){var n=r.response,i=document.createElement("img");i.src=s.createObjectURL(n),i.onload=function(){s.revokeObjectURL(i.src),e({element:i,x:t.x,y:t.y,width:t.width,height:t.height})}}},r.send()}));var t}));return a.all(t)}function C(){return u({url:v}).then((function(e){return w(o,e.element,g,m,e.width,e.height),k(y)})).then((function(e){for(var t=0;t<e.length;t++)w(o,e[t].element,e[t].x+g,e[t].y+m,e[t].width,e[t].height);s.revokeObjectURL(v),document.body.appendChild(r);var n=_(r);return document.body.removeChild(r),n}),(function(e){alert("\u8111\u56FE\u7684\u8282\u70B9\u4E2D\u5305\u542B\u8DE8\u57DF\u56FE\u7247\uFF0C\u5BFC\u51FA\u7684 png \u4E2D\u8282\u70B9\u56FE\u7247\u4E0D\u663E\u793A\uFF0C\u4F60\u53EF\u4EE5\u66FF\u6362\u6389\u8FD9\u4E9B\u8DE8\u57DF\u7684\u56FE\u7247\u5E76\u91CD\u8BD5\u3002"),s.revokeObjectURL(v),document.body.appendChild(r);var t=_(r);return document.body.removeChild(r),t}))}return r.width=d+40,r.height=p+40,l?u({url:l[1]}).then((function(e){return b(o,o.createPattern(e.element,"repeat")),C()})):(b(o,h.toString()),C())}})}},e[67]={value:function(t,n,r){function i(e,t,n){e.style.visibility="hidden",function e(t,n,r){if(t&&"defs"!==t.tagName){if("transparent"===t.getAttribute("fill")&&t.setAttribute("fill","none"),t.getAttribute("marker-end")&&t.removeAttribute("marker-end"),n=n||0,r=r||0,t.getAttribute("transform")){var i=function(e,t){var n;try{n=t.getScreenCTM().inverse()}catch(e){throw new Error("Can not inverse source element\' ctm.")}return n.multiply(e.getScreenCTM())}(t,t.parentElement);n-=i.e,r-=i.f,t.removeAttribute("transform")}switch(t.tagName.toLowerCase()){case"g":break;case"path":var o=t.getAttribute("d");return void(o&&(o=function(e,t){t instanceof Function||(t=function(){});for(var n=[],r=[],i=[],o=0,a=e.length;o<a;o++)switch(e[o]){case"M":case"L":case"T":case"S":case"A":case"C":case"H":case"V":case"Q":i.length&&(r.push(i.join("")),i=[]),","===r[r.length-1]&&r.pop(),r.length&&(t(r),n.push(r.join("")),r=[]),r.push(e[o]);break;case"Z":case"z":r.push(i.join(""),e[o]),t(r),n.push(r.join("")),i=[],r=[];break;case".":case"e":i.push(e[o]);break;case"-":"e"!==e[o-1]&&(i.length&&r.push(i.join(""),","),i=[]),i.push("-");break;case" ":case",":i.length&&(r.push(i.join(""),","),i=[]);break;default:/\\d/.test(e[o])?i.push(e[o]):i.length?(r.push(i.join(""),e[o]),i=[]):(","===r[r.length-1]&&r.pop(),r.push(e[o])),o+1===a&&(i.length&&r.push(i.join("")),t(r),n.push(r.join("")),i=null,r=null)}return n.join("")}(o,(function(e){switch(e[0]){case"V":e[1]=+e[1]-r;break;case"H":e[1]=+e[1]-n;break;case"M":case"L":case"T":e[1]=+e[1]-n,e[3]=+e[3]-r;break;case"Q":case"S":e[1]=+e[1]-n,e[3]=+e[3]-r,e[5]=+e[5]-n,e[7]=+e[7]-r;break;case"A":e[11]=+e[11]-n,e[13]=+e[13]-r;break;case"C":e[1]=+e[1]-n,e[3]=+e[3]-r,e[5]=+e[5]-n,e[7]=+e[7]-r,e[9]=+e[9]-n,e[11]=+e[11]-r}})),t.setAttribute("d",o),t.removeAttribute("transform")));case"image":case"text":if(n&&r){var a=+t.getAttribute("x")||0,s=+t.getAttribute("y")||0;t.setAttribute("x",a-n),t.setAttribute("y",s-r)}return t.getAttribute("dominant-baseline")&&(t.removeAttribute("dominant-baseline"),t.setAttribute("dy",".8em")),void t.removeAttribute("transform")}if(t.children)for(var u=0,c=t.children.length;u<c;u++)e(t.children[u],n,r)}}(e,t||0,n||0),e.style.visibility="visible"}e.r(12).registerProtocol("svg",r.exports={fileDescription:"SVG \u77E2\u91CF\u56FE",fileExtension:".svg",mineType:"image/svg+xml",dataType:"text",encode:function(e,t){var n,r,o,a=t.getPaper(),s=a.shapeNode.getAttribute("transform"),u=t.getRenderContainer(),c=u.getRenderBox(),l=(u.getTransform(),c.width),h=c.height,f=20;return a.shapeNode.setAttribute("transform","translate(0.5, 0.5)"),n=a.container.innerHTML,a.shapeNode.setAttribute("transform",s),r=document.createElement("div"),document.body.appendChild(r),r.innerHTML=n,(o=r.querySelector("svg")).setAttribute("width",l+40|0),o.setAttribute("height",h+40|0),o.setAttribute("style","background: "+t.getStyle("background")),o.setAttribute("viewBox",[0,0,l+40|0,h+40|0].join(" ")),tempSvgContainer=document.createElement("div"),i(o,c.x-f|0,c.y-f|0),document.body.removeChild(r),tempSvgContainer.appendChild(o),n=(n=tempSvgContainer.innerHTML).replace(/&nbsp;/g,"&#xa0;")}})}},e[68]={value:function(t,n,r){var i=e.r(12),o=e.r(17).Browser,a=/\\r\\n|\\r|\\n/,s=function(e){return e.gecko?{REGEXP:new RegExp("^(\\t|"+String.fromCharCode(160,160,32,160)+")"),DELETE:new RegExp("^(\\t|"+String.fromCharCode(160,160,32,160)+")+")}:e.ie||e.edge?{REGEXP:new RegExp("^("+String.fromCharCode(32)+"|"+String.fromCharCode(160)+")"),DELETE:new RegExp("^("+String.fromCharCode(32)+"|"+String.fromCharCode(160)+")+")}:{REGEXP:/^(\\t|\\x20{4})/,DELETE:/^(\\t|\\x20{4})+/}}(o);function u(e){if(!e)return"";for(var t=[],n=["\\\\","\\\\","n"],r=0,i=0,o=e.length;r<o;r++)if(e[r]!==n[i])switch(i){case 0:t.push(e[r]),i=0;break;case 1:"n"===e[r]?t.push("\\n"):t.push(e[r-1],e[r]),i=0;break;case 2:t.push(e[r-2]),"\\\\"!==e[r]&&(i=0,t.push(e[r-1],e[r]))}else 3===++i&&(i=0,t.push("\\\\n"));return t.join("")}function c(e,t){var n="";return n+=function(e,t){for(var n="";t--;)n+=e;return n}("\\t",t=t||0),n+=function(e){if(!e)return"";for(var t=[],n=["\\\\","n"],r=0,i=0,o=e.length;r<o;r++)if("\\n"!==e[r]&&"\\r"!==e[r])if(e[r]!==n[i]){switch(i){case 0:t.push(e[r]);break;case 1:t.push(e[r-1],e[r])}i=0}else 2==++i&&(i=0,t.push("\\\\\\\\n"));else t.push("\\\\n"),i=0;return t.join("")}(e.data.text)+"\\r",e.children&&e.children.forEach((function(e){n+=c(e,t+1)})),n}function l(e){return!/\\S/.test(e)}function h(e){for(var t=0;s.REGEXP.test(e);)e=e.replace(s.REGEXP,""),t++;return t}function f(e){return{data:{text:u(e.replace(s.DELETE,""))}}}i.registerProtocol("text",r.exports={fileDescription:"\u5927\u7EB2\u6587\u672C",fileExtension:".txt",dataType:"text",mineType:"text/plain",encode:function(e){return c(e.root,0)},decode:function(e){return function(e){for(var t,n,r,i,o,s,u={},c=e.split(a),d=0;d<c.length;d++)if(!l(n=c[d])){if(r=h(n),i=f(n),0===r){if(t)throw new Error("Invalid local format");t=i}else{if(!u[r-1])throw new Error("Invalid local format");s=i,((o=u[r-1]).children||(o.children=[])).push(s)}u[r]=i}return t}(e)},Node2Text:function(e){return function(e){if(e)return/^\\s*$/.test(e.data.text)&&(e.data.text="\u5206\u652F\u4E3B\u9898"),c(function e(t){var n={};n.data=t.getData();var r=t.getChildren();n.children=[];for(var i=0;i<r.length;i++)n.children.push(e(r[i]));return n}(e))}(e)}})}},e[69]={value:function(t,n,r){e.r(31).register("default",{getLayout:function(e){if(e.getData("layout"))return e.getData("layout");var t=e.getLevel();return 0===t?"mind":1===t?e.getLayoutPointPreview().x>0?"right":"left":e.parent.getLayout()},getConnect:function(e){return 1==e.getLevel()?"arc":"under"}})}},e[70]={value:function(t,n,r){e.r(31).register("filetree",{getLayout:function(e){return e.getData("layout")?e.getData("layout"):e.isRoot()?"bottom":"filetree-down"},getConnect:function(e){return 1==e.getLevel()?"poly":"l"}})}},e[71]={value:function(t,n,r){e.r(31).register("fish-bone",{getLayout:function(e){if(e.getData("layout"))return e.getData("layout");var t=e.getLevel();return 0===t?"fish-bone-master":1===t?"fish-bone-slave":e.getLayoutPointPreview().y>0?"filetree-up":"filetree-down"},getConnect:function(e){switch(e.getLevel()){case 1:return"fish-bone-master";case 2:return"line";default:return"l"}}})}},e[72]={value:function(t,n,r){e.r(31).register("right",{getLayout:function(e){return e.getData("layout")||"right"},getConnect:function(e){return 1==e.getLevel()?"arc":"bezier"}})}},e[73]={value:function(t,n,r){e.r(31).register("structure",{getLayout:function(e){return e.getData("layout")||"bottom"},getConnect:function(e){return"poly"}})}},e[74]={value:function(t,n,r){e.r(31).register("tianpan",{getLayout:function(e){return e.getData("layout")?e.getData("layout"):0===e.getLevel()?"tianpan":e.parent.getLayout()},getConnect:function(e){return"arc_tp"}})}},e[75]={value:function(t,n,r){var i=e.r(32);["classic","classic-compact"].forEach((function(e){var t="classic-compact"==e;i.register(e,{background:\'#3A4144 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQzg5QTQ0NDhENzgxMUUzOENGREE4QTg0RDgzRTZDNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQzg5QTQ0NThENzgxMUUzOENGREE4QTg0RDgzRTZDNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMwOEQ1NDRGOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMwOEQ1NDUwOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+e9P33AAAACVJREFUeNpisXJ0YUACTAyoAMr/+eM7EGGRZ4FQ7BycEAZAgAEAHbEGtkoQm/wAAAAASUVORK5CYII=") repeat\',"root-color":"#430","root-background":"#e9df98","root-stroke":"#e9df98","root-font-size":24,"root-padding":t?[10,25]:[15,25],"root-margin":t?[15,25]:[30,100],"root-radius":30,"root-space":10,"root-shadow":"rgba(0, 0, 0, .25)","main-color":"#333","main-background":"#a4c5c0","main-stroke":"#a4c5c0","main-font-size":16,"main-padding":t?[5,15]:[6,20],"main-margin":t?[5,10]:20,"main-radius":10,"main-space":5,"main-shadow":"rgba(0, 0, 0, .25)","sub-color":"white","sub-background":"transparent","sub-stroke":"none","sub-font-size":12,"sub-padding":[5,10],"sub-margin":t?[5,10]:[15,20],"sub-tree-margin":30,"sub-radius":5,"sub-space":5,"connect-color":"white","connect-width":2,"main-connect-width":3,"connect-radius":5,"selected-background":"rgb(254, 219, 0)","selected-stroke":"rgb(254, 219, 0)","selected-color":"black","marquee-background":"rgba(255,255,255,.3)","marquee-stroke":"white","drop-hint-color":"yellow","sub-drop-hint-width":2,"main-drop-hint-width":4,"root-drop-hint-width":4,"order-hint-area-color":"rgba(0, 255, 0, .5)","order-hint-path-color":"#0f0","order-hint-path-width":1,"text-selection-color":"rgb(27,171,255)","line-height":1.5})}))}},e[76]={value:function(t,n,r){e.r(32).register("fish",{background:\'#3A4144 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQzg5QTQ0NDhENzgxMUUzOENGREE4QTg0RDgzRTZDNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQzg5QTQ0NThENzgxMUUzOENGREE4QTg0RDgzRTZDNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMwOEQ1NDRGOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMwOEQ1NDUwOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+e9P33AAAACVJREFUeNpisXJ0YUACTAyoAMr/+eM7EGGRZ4FQ7BycEAZAgAEAHbEGtkoQm/wAAAAASUVORK5CYII=") repeat\',"root-color":"#430","root-background":"#e9df98","root-stroke":"#e9df98","root-font-size":24,"root-padding":[35,35],"root-margin":30,"root-radius":100,"root-space":10,"root-shadow":"rgba(0, 0, 0, .25)","main-color":"#333","main-background":"#a4c5c0","main-stroke":"#a4c5c0","main-font-size":16,"main-padding":[6,20],"main-margin":[20,20],"main-radius":5,"main-space":5,"main-shadow":"rgba(0, 0, 0, .25)","sub-color":"black","sub-background":"white","sub-stroke":"white","sub-font-size":12,"sub-padding":[5,10],"sub-margin":[10],"sub-radius":5,"sub-space":5,"connect-color":"white","connect-width":3,"main-connect-width":3,"connect-radius":5,"selected-background":"rgb(254, 219, 0)","selected-stroke":"rgb(254, 219, 0)","marquee-background":"rgba(255,255,255,.3)","marquee-stroke":"white","drop-hint-color":"yellow","drop-hint-width":4,"order-hint-area-color":"rgba(0, 255, 0, .5)","order-hint-path-color":"#0f0","order-hint-path-width":1,"text-selection-color":"rgb(27,171,255)","line-height":1.5})}},e[77]={value:function(t,n,r){var i=e.r(17),o=e.r(32);function a(e,t,n){return i.Color.createHSL(e,t,n)}function s(e,t){return{background:"#fbfbfb","root-color":"white","root-background":a(e,37,60),"root-stroke":a(e,37,60),"root-font-size":16,"root-padding":t?[6,12]:[12,24],"root-margin":t?10:[30,100],"root-radius":5,"root-space":10,"main-color":"black","main-background":a(e,33,95),"main-stroke":a(e,37,60),"main-stroke-width":1,"main-font-size":14,"main-padding":[6,20],"main-margin":t?8:20,"main-radius":3,"main-space":5,"sub-color":"black","sub-background":"transparent","sub-stroke":"none","sub-font-size":12,"sub-padding":t?[3,5]:[5,10],"sub-margin":t?[4,8]:[15,20],"sub-radius":5,"sub-space":5,"connect-color":a(e,37,60),"connect-width":1,"connect-radius":5,"selected-stroke":a(e,26,30),"selected-stroke-width":"3","blur-selected-stroke":a(e,10,60),"marquee-background":a(e,100,80).set("a",.1),"marquee-stroke":a(e,37,60),"drop-hint-color":a(e,26,35),"drop-hint-width":5,"order-hint-area-color":a(e,100,30).set("a",.5),"order-hint-path-color":a(e,100,25),"order-hint-path-width":1,"text-selection-color":a(e,100,20),"line-height":1.5}}var u,c={red:0,soil:25,green:122,blue:204,purple:246,pink:334};for(u in c)o.register("fresh-"+u,s(c[u])),o.register("fresh-"+u+"-compat",s(c[u],!0))}},e[78]={value:function(t,n,r){var i=e.r(32);["snow","snow-compact"].forEach((function(e){var t="snow-compact"==e;i.register(e,{background:\'#3A4144 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQzg5QTQ0NDhENzgxMUUzOENGREE4QTg0RDgzRTZDNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQzg5QTQ0NThENzgxMUUzOENGREE4QTg0RDgzRTZDNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMwOEQ1NDRGOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMwOEQ1NDUwOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+e9P33AAAACVJREFUeNpisXJ0YUACTAyoAMr/+eM7EGGRZ4FQ7BycEAZAgAEAHbEGtkoQm/wAAAAASUVORK5CYII=") repeat\',"root-color":"#430","root-background":"#e9df98","root-stroke":"#e9df98","root-font-size":24,"root-padding":t?[5,10]:[15,25],"root-margin":t?15:30,"root-radius":5,"root-space":10,"root-shadow":"rgba(0, 0, 0, .25)","main-color":"#333","main-background":"#a4c5c0","main-stroke":"#a4c5c0","main-font-size":16,"main-padding":t?[4,10]:[6,20],"main-margin":t?[5,10]:[20,40],"main-radius":5,"main-space":5,"main-shadow":"rgba(0, 0, 0, .25)","sub-color":"black","sub-background":"white","sub-stroke":"white","sub-font-size":12,"sub-padding":[5,10],"sub-margin":t?[5,10]:[10,20],"sub-radius":5,"sub-space":5,"connect-color":"white","connect-width":2,"main-connect-width":3,"connect-radius":5,"selected-background":"rgb(254, 219, 0)","selected-stroke":"rgb(254, 219, 0)","marquee-background":"rgba(255,255,255,.3)","marquee-stroke":"white","drop-hint-color":"yellow","drop-hint-width":4,"order-hint-area-color":"rgba(0, 255, 0, .5)","order-hint-path-color":"#0f0","order-hint-path-width":1,"text-selection-color":"rgb(27,171,255)","line-height":1.5})}))}},e[79]={value:function(t,n,r){var i=e.r(32);["tianpan","tianpan-compact"].forEach((function(e){var t="tianpan-compact"==e;i.register(e,{background:\'#3A4144 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQzg5QTQ0NDhENzgxMUUzOENGREE4QTg0RDgzRTZDNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQzg5QTQ0NThENzgxMUUzOENGREE4QTg0RDgzRTZDNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMwOEQ1NDRGOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMwOEQ1NDUwOEQ3NzExRTM4Q0ZEQThBODREODNFNkM3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+e9P33AAAACVJREFUeNpisXJ0YUACTAyoAMr/+eM7EGGRZ4FQ7BycEAZAgAEAHbEGtkoQm/wAAAAASUVORK5CYII=") repeat\',"root-color":"#430","root-background":"#e9df98","root-stroke":"#e9df98","root-font-size":25,"root-padding":t?15:20,"root-margin":t?[15,25]:100,"root-radius":30,"root-space":10,"root-shadow":"rgba(0, 0, 0, .25)","root-shape":"circle","main-color":"#333","main-background":"#a4c5c0","main-stroke":"#a4c5c0","main-font-size":15,"main-padding":t?10:12,"main-margin":t?10:12,"main-radius":10,"main-space":5,"main-shadow":"rgba(0, 0, 0, .25)","main-shape":"circle","sub-color":"#333","sub-background":"#99ca6a","sub-stroke":"#a4c5c0","sub-font-size":13,"sub-padding":5,"sub-margin":t?6:10,"sub-tree-margin":30,"sub-radius":5,"sub-space":5,"sub-shadow":"rgba(0, 0, 0, .25)","sub-shape":"circle","connect-color":"white","connect-width":2,"main-connect-width":3,"connect-radius":5,"selected-background":"rgb(254, 219, 0)","selected-stroke":"rgb(254, 219, 0)","selected-color":"black","marquee-background":"rgba(255,255,255,.3)","marquee-stroke":"white","drop-hint-color":"yellow","sub-drop-hint-width":2,"main-drop-hint-width":4,"root-drop-hint-width":4,"order-hint-area-color":"rgba(0, 255, 0, .5)","order-hint-path-color":"#0f0","order-hint-path-width":1,"text-selection-color":"rgb(27,171,255)","line-height":1.4})}))}},e[80]={value:function(t,n,r){e.r(32).register("wire",{background:"black",color:"#999",stroke:"none",padding:10,margin:20,"font-size":14,"connect-color":"#999","connect-width":1,"selected-background":"#999","selected-color":"black","marquee-background":"rgba(255,255,255,.3)","marquee-stroke":"white","drop-hint-color":"yellow","sub-drop-hint-width":2,"main-drop-hint-width":4,"root-drop-hint-width":4,"order-hint-area-color":"rgba(0, 255, 0, .5)","order-hint-path-color":"#0f0","order-hint-path-width":1,"text-selection-color":"rgb(27,171,255)","line-height":1.5})}};var t,n={"expose-kityminder":34};t="expose-kityminder",e.r([n[t]])}()},6361:(e,t,n)=>{var r;r=function(e,t,n){n.exports=window.kity}.call(t,n,t,e),void 0===r||(e.exports=r)},5905:(e,t,n)=>{var r;r=function(e,t,r){var i=n(6361),o=n(9077),a=[],s=i.createClass("Minder",{constructor:function(e){this._options=o.extend({},e);for(var t,n=a.slice();n.length;)"function"==typeof(t=n.shift())&&t.call(this,this._options);this.fire("finishInitHook")}});s.version="1.4.43",s.registerInitHook=function(e){a.push(e)},r.exports=s}.call(t,n,t,e),void 0===r||(e.exports=r)},7130:(e,t,n)=>{var r;r=function(e,t,r){var i=n(6361),o=n(9077),a=n(5905),s=i.createClass("MinderNode",{constructor:function(e){this.parent=null,this.root=this,this.children=[],this.data={id:o.guid(),created:+new Date},this.initContainers(),o.isString(e)?this.setText(e):o.isObject(e)&&o.extend(this.data,e)},initContainers:function(){this.rc=(new i.Group).setId(o.uuid("minder_node")),this.rc.minderNode=this},isRoot:function(){return this.root===this},isLeaf:function(){return 0===this.children.length},getRoot:function(){return this.root||this},getParent:function(){return this.parent},getSiblings:function(){var e=this.parent.children,t=[],n=this;return e.forEach((function(e){e!=n&&t.push(e)})),t},getLevel:function(){for(var e=0,t=this.parent;t;)e++,t=t.parent;return e},getComplex:function(){var e=0;return this.traverse((function(){e++})),e},getType:function(e){return this.type=["root","main","sub"][Math.min(this.getLevel(),2)],this.type},isAncestorOf:function(e){for(var t=e.parent;t;){if(t==this)return!0;t=t.parent}return!1},getData:function(e){return e?this.data[e]:this.data},setData:function(e,t){if("object"==typeof e){var n=e;for(e in n)n.hasOwnProperty(e)&&(this.data[e]=n[e])}else this.data[e]=t;return this},setText:function(e){return this.data.text=e},getText:function(){return this.data.text||null},preTraverse:function(e,t){var n=this.getChildren();t||e(this);for(var r=0;r<n.length;r++)n[r].preTraverse(e)},postTraverse:function(e,t){for(var n=this.getChildren(),r=0;r<n.length;r++)n[r].postTraverse(e);t||e(this)},traverse:function(e,t){return this.postTraverse(e,t)},getChildren:function(){return this.children},getIndex:function(){return this.parent?this.parent.children.indexOf(this):-1},insertChild:function(e,t){void 0===t&&(t=this.children.length),e.parent&&e.parent.removeChild(e),e.parent=this,e.root=this.root,this.children.splice(t,0,e)},appendChild:function(e){return this.insertChild(e)},prependChild:function(e){return this.insertChild(e,0)},removeChild:function(e){var t,n=e;e instanceof s&&(n=this.children.indexOf(e)),n>=0&&((t=this.children.splice(n,1)[0]).parent=null,t.root=t)},clearChildren:function(){this.children=[]},getChild:function(e){return this.children[e]},getRenderContainer:function(){return this.rc},getCommonAncestor:function(e){return s.getCommonAncestor(this,e)},contains:function(e){return this==e||this.isAncestorOf(e)},clone:function(){var e=new s;return e.data=o.clone(this.data),this.children.forEach((function(t){e.appendChild(t.clone())})),e},compareTo:function(e){if(!o.comparePlainObject(this.data,e.data))return!1;if(!o.comparePlainObject(this.temp,e.temp))return!1;if(this.children.length!=e.children.length)return!1;for(var t=0;this.children[t];){if(!this.children[t].compareTo(e.children[t]))return!1;t++}return!0},getMinder:function(){return this.getRoot().minder}});s.getCommonAncestor=function(e,t){if(e instanceof Array)return s.getCommonAncestor.apply(this,e);switch(arguments.length){case 1:return e.parent||e;case 2:if(e.isAncestorOf(t))return e;if(t.isAncestorOf(e))return t;for(var n=e.parent;n&&!n.isAncestorOf(t);)n=n.parent;return n;default:return Array.prototype.reduce.call(arguments,(function(e,t){return s.getCommonAncestor(e,t)}),e)}},i.extendClass(a,{getRoot:function(){return this._root},setRoot:function(e){this._root=e,e.minder=this},getAllNode:function(){var e=[];return this.getRoot().traverse((function(t){e.push(t)})),e},getNodeById:function(e){return this.getNodesById([e])[0]},getNodesById:function(e){var t=this.getAllNode(),n=[];return t.forEach((function(t){-1!=e.indexOf(t.getData("id"))&&n.push(t)})),n},createNode:function(e,t,n){var r=new s(e);return this.fire("nodecreate",{node:r,parent:t,index:n}),this.appendNode(r,t,n),r},appendNode:function(e,t,n){return t&&t.insertChild(e,n),this.attachNode(e),this},removeNode:function(e){e.parent&&(e.parent.removeChild(e),this.detachNode(e),this.fire("noderemove",{node:e}))},attachNode:function(e){var t=this.getRenderContainer();e.traverse((function(e){e.attached=!0,t.addShape(e.getRenderContainer())})),t.addShape(e.getRenderContainer()),this.fire("nodeattach",{node:e})},detachNode:function(e){var t=this.getRenderContainer();e.traverse((function(e){e.attached=!1,t.removeShape(e.getRenderContainer())})),this.fire("nodedetach",{node:e})},getMinderTitle:function(){return this.getRoot().getText()}}),r.exports=s}.call(t,n,t,e),void 0===r||(e.exports=r)},1898:(e,t,n)=>{var r;r=function(e,t,r){var i=n(6361),o=n(5905),a=n(7130),s=i.createClass("Renderer",{constructor:function(e){this.node=e},create:function(e){throw new Error("Not implement: Renderer.create()")},shouldRender:function(e){return!0},watchChange:function(e){void 0===this.watchingData||this.watchingData,this.watchingData=e},shouldDraw:function(e){return!0},update:function(e,t,n){return this.shouldDraw()&&this.draw(e,t),this.place(e,t,n)},draw:function(e,t){throw new Error("Not implement: Renderer.draw()")},place:function(e,t,n){throw new Error("Not implement: Renderer.place()")},getRenderShape:function(){return this._renderShape||null},setRenderShape:function(e){this._renderShape=e}});i.extendClass(o,function(){function e(e,t){var n=[];["center","left","right","top","bottom","outline","outside"].forEach((function(e){var r="before"+e,i="after"+e;t[r]&&(n=n.concat(t[r])),t[e]&&(n=n.concat(t[e])),t[i]&&(n=n.concat(t[i]))})),e._renderers=n.map((function(t){return new t(e)}))}return{renderNodeBatch:function(t){var n,r,o,a,s,u=this._rendererClasses,c=[];if(t.length){for(o=0;o<t.length;o++)(s=t[o])._renderers||e(s,u),s._contentBox=new i.Box,this.fire("beforerender",{node:s});for(n=t[0]._renderers.length,r=0;r<n;r++){for(o=0;o<t.length;o++)"function"==typeof c[o]&&(c[o]=c[o]()),c[o]instanceof i.Box||(c[o]=new i.Box(c[o]));for(o=0;o<t.length;o++)a=(s=t[o])._renderers[r],c[o]&&(s._contentBox=s._contentBox.merge(c[o]),a.contentBox=c[o]),a.shouldRender(s)?(a.getRenderShape()||(a.setRenderShape(a.create(s)),a.bringToBack?s.getRenderContainer().prependShape(a.getRenderShape()):s.getRenderContainer().appendShape(a.getRenderShape())),a.getRenderShape().setVisible(!0),c[o]=a.update(a.getRenderShape(),s,s._contentBox)):a.getRenderShape()&&(a.getRenderShape().setVisible(!1),c[o]=null)}for(o=0;o<t.length;o++)this.fire("noderender",{node:t[o]})}},renderNode:function(t){var n,r=this._rendererClasses;t._renderers||e(t,r),this.fire("beforerender",{node:t}),t._contentBox=new i.Box,t._renderers.forEach((function(e){e.shouldRender(t)?(e.getRenderShape()||(e.setRenderShape(e.create(t)),e.bringToBack?t.getRenderContainer().prependShape(e.getRenderShape()):t.getRenderContainer().appendShape(e.getRenderShape())),e.getRenderShape().setVisible(!0),"function"==typeof(n=e.update(e.getRenderShape(),t,t._contentBox))&&(n=n()),n&&(t._contentBox=t._contentBox.merge(n),e.contentBox=n)):e.getRenderShape()&&e.getRenderShape().setVisible(!1)})),this.fire("noderender",{node:t})}}}()),i.extendClass(a,{render:function(){if(this.attached)return this.getMinder().renderNode(this),this},renderTree:function(){if(this.attached){var e=[];return this.traverse((function(t){e.push(t)})),this.getMinder().renderNodeBatch(e),this}},getRenderer:function(e){var t=this._renderers;if(!t)return null;for(var n=0;n<t.length;n++)if(t[n].getType()==e)return t[n];return null},getContentBox:function(){return this.parent&&this.parent.isCollapsed()?new i.Box:this._contentBox||new i.Box},getRenderBox:function(e,t){var n=e&&this.getRenderer(e),r=n?n.contentBox:this.getContentBox();return i.Matrix.getCTM(this.getRenderContainer(),t||"paper").transformBox(r)}}),r.exports=s}.call(t,n,t,e),void 0===r||(e.exports=r)},9077:(e,t,n)=>{var r;r=function(e,t){var r=n(6361),i={};t.extend=r.Utils.extend.bind(r.Utils),t.each=r.Utils.each.bind(r.Utils),t.uuid=function(e){return i[e]=i[e]?i[e]+1:1,e+i[e]},t.guid=function(){return(1e6*+new Date+Math.floor(1e6*Math.random())).toString(36)},t.trim=function(e){return e.replace(/(^[ \\t\\n\\r]+)|([ \\t\\n\\r]+$)/g,"")},t.keys=function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t},t.clone=function(e){return JSON.parse(JSON.stringify(e))},t.comparePlainObject=function(e,t){return JSON.stringify(e)==JSON.stringify(t)},t.encodeHtml=function(e,t){return e?e.replace(t||/[&<">\'](?:(amp|lt|quot|gt|#39|nbsp);)?/g,(function(e,t){return t?e:{"<":"&lt;","&":"&amp;",\'"\':"&quot;",">":"&gt;","\'":"&#39;"}[e]})):""},t.clearWhiteSpace=function(e){return e.replace(/[\\u200b\\t\\r\\n]/g,"")},t.each(["String","Function","Array","Number","RegExp","Object"],(function(e){var n=Object.prototype.toString;t["is"+e]=function(t){return n.apply(t)=="[object "+e+"]"}}))}.call(t,n,t,e),void 0===r||(e.exports=r)},5717:(e,t,n)=>{n(4692),window.marked=n(6709),n(2116);const{kity:r,kityminder:i}=n(6763);i.Editor=n(4611),e.exports={kity:r,kityminder:i}},4611:(e,t,n)=>{var r;r=function(e,t,r){var i=[];function o(e){i.push(e)}function a(e){this.selector=e;for(var t=0;t<i.length;t++)"function"==typeof i[t]&&i[t].call(this,this)}return a.assemble=o,o(n(2356)),o(n(4949)),o(n(1644)),o(n(8270)),o(n(6736)),o(n(907)),o(n(1554)),o(n(4953)),o(n(1029)),o(n(451)),o(n(8655)),o(n(2795)),o(n(5191)),o(n(6e3)),r.exports=a}.call(t,n,t,e),void 0===r||(e.exports=r)},5578:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=window.HotBox}.call(t,n,t,e),void 0===r||(e.exports=r)},3233:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=window.kityminder.Minder}.call(t,n,t,e),void 0===r||(e.exports=r)},1554:(e,t,n)=>{var r;r=function(e,t,n){function r(){var e={"application/km":"\uFFFF"},t={"\\ufeff":"SPLITOR","\uFFFF":"application/km"};function n(e,t){if(!this.isPureText(t)){if(!this.whichMimeType(t))throw new Error("unknow mimetype!");t=this.getPureText(t)}return!1===e?t:e+"\\ufeff"+t}this.registMimeTypeProtocol=function(n,r){if(r&&t[r])throw new Error("sing has registed!");if(n&&e[n])throw new Error("mimetype has registed!");t[r]=n,e[n]=r},this.getMimeTypeProtocol=function(t,r){var i=e[t]||!1;return void 0===r?n.bind(this,i):n(i,r)},this.getSpitor=function(){return"\\ufeff"},this.getMimeType=function(n){return void 0!==n?t[n]||null:e}}return r.prototype.isPureText=function(e){return!~e.indexOf(this.getSpitor())},r.prototype.getPureText=function(e){return this.isPureText(e)?e:e.split(this.getSpitor())[1]},r.prototype.whichMimeType=function(e){return this.isPureText(e)?null:this.getMimeType(e.split(this.getSpitor())[0])},n.exports=function(){this.minder.supportClipboardEvent&&!kity.Browser.gecko&&(this.MimeType=new r)}}.call(t,n,t,e),void 0===r||(e.exports=r)},4953:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=function(){var e=this.minder,t=window.kityminder.data;if(e.supportClipboardEvent&&!kity.Browser.gecko){var n=this.fsm,r=this.receiver,i=this.MimeType,o=i.getMimeTypeProtocol("application/km"),a=t.getRegisterProtocol("json").decode,s=[];document.addEventListener("copy",(function(t){if(document.activeElement==r.element){var i=t;switch(n.state()){case"input":break;case"normal":var o=[].concat(e.getSelectedNodes());if(o.length){var a;if(o.length>1)if(o.sort((function(e,t){return e.getLevel()-t.getLevel()})),(a=o[0].getLevel())!==o[o.length-1].getLevel()){var s,c=0,l=o.length,h=l-1;for(s=o[h];s.getLevel()!==a;){for(c=0;c<l&&o[c].getLevel()===a;){if(o[c].isAncestorOf(s)){o.splice(h,1);break}c++}s=o[--h]}}var f=u(o);i.clipboardData.setData("text/plain",f)}t.preventDefault()}}})),document.addEventListener("cut",(function(t){if(document.activeElement==r.element){if("normal"!==e.getStatus())return void t.preventDefault();var i=t;switch(n.state()){case"input":break;case"normal":var o=e.getSelectedNodes();o.length&&(i.clipboardData.setData("text/plain",u(o)),e.execCommand("removenode")),t.preventDefault()}}})),document.addEventListener("paste",(function(t){if(document.activeElement==r.element){if("normal"!==e.getStatus())return void t.preventDefault();var o=t,u=n.state(),c=o.clipboardData.getData("text/plain");switch(u){case"input":if(!i.isPureText(c))return void t.preventDefault();break;case"normal":var l=e.getSelectedNodes();if("application/km"===i.whichMimeType(c)){var h,f=a(i.getPureText(c));l.forEach((function(t){for(var n=f.length-1;n>=0;n--)h=e.createNode(null,t),e.importNode(h,f[n]),s.push(h),t.appendChild(h)})),e.select(s,!0),s=[],e.refresh()}else{if(o.clipboardData&&o.clipboardData.items[0].type.indexOf("image")>-1){var d=o.clipboardData.items[0].getAsFile();return angular.element(document.body).injector().get("server").uploadImage(d).then((function(t){var n=t.data;0===n.errno&&e.execCommand("image",n.data.url)}))}l.forEach((function(t){e.Text2Children(t,c)}))}t.preventDefault()}}}))}function u(n){for(var r=[],i=0,a=n.length;i<a;i++)r.push(e.exportNode(n[i]));return o(t.getRegisterProtocol("json").encode(r))}}}.call(t,n,t,e),void 0===r||(e.exports=r)},2356:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=function(){var e;if(!(e="string"==typeof this.selector?document.querySelector(this.selector):this.selector))throw new Error("Invalid selector: "+this.selector);e.classList.add("km-editor"),this.container=e}}.call(t,n,t,e),void 0===r||(e.exports=r)},1029:(e,t,n)=>{var r;r=function(e,t,r){var i=n(5578);new(n(4264))("drag");return r.exports=function(){var e,t,n=this.fsm,r=this.minder,o=this.hotbox;this.receiver.element,n.when("* -> drag",(function(){})),n.when("drag -> *",(function(e,t,n){}));var a,s,u,c,l,h,f=20,d=1,p=!1,g=!1;function m(e,t){if(!e)return p=g=!1,h&&kity.releaseFrame(h),void(h=null);h||(h=kity.requestFrame(function(e,t,n){return function(r){switch(e){case"left":n._viewDragger.move({x:-t,y:0},0);break;case"top":n._viewDragger.move({x:0,y:-t},0);break;case"right":n._viewDragger.move({x:t,y:0},0);break;case"bottom":n._viewDragger.move({x:0,y:t},0);break;default:return}r.next()}}(e,t,r)))}r.on("mousedown",(function(n){d=0;var i=r.getPaper().container.getBoundingClientRect();e=n.originEvent.clientX,t=n.originEvent.clientY,l=i.top,a=i.width,s=i.height})),r.on("mousemove",(function(h){if("drag"===n.state()&&0==d&&r.getSelectedNode()&&(Math.abs(e-h.originEvent.clientX)>f||Math.abs(t-h.originEvent.clientY)>f)&&(u=h.originEvent.clientX,c=h.originEvent.clientY-l,u<f?m("right",f-u):u>a-f?m("left",f+u-a):p=!0,c<f?m("bottom",c):c>s-f?m("top",f+c-s):g=!0,p&&g&&m(!1)),"drag"!==n.state()&&0===d&&r.getSelectedNode()&&(Math.abs(e-h.originEvent.clientX)>f||Math.abs(t-h.originEvent.clientY)>f))return"hotbox"===n.state()&&o.active(i.STATE_IDLE),n.jump("drag","user-drag")})),window.addEventListener("mouseup",(function(){if(d=1,"drag"===n.state())return m(!1),n.jump("normal","drag-finish")}),!1)}}.call(t,n,t,e),void 0===r||(e.exports=r)},4949:(e,t,n)=>{var r;r=function(e,t,r){var i=new(n(4264))("fsm");function o(e,t,n,r){return e.when==t&&(("*"==e.enter||e.enter==r)&&("*"==e.exit||e.exit==n||void 0))}function a(e){var t=e,n=[];this.jump=function(e,r){if(!r)throw new Error("Please tell fsm the reason to jump");var a,s,u=t,c=[u,e].concat([].slice.call(arguments,1));for(a=0;a<n.length;a++)if(o((s=n[a]).condition,"before",u,e)&&s.apply(null,c))return;for(t=e,i.log("[{0}] {1} -> {2}",r,u,e),a=0;a<n.length;a++)o((s=n[a]).condition,"after",u,e)&&s.apply(null,c);return t},this.state=function(){return t},this.when=function(e,t){var r,i,o,a;if(1==arguments.length&&(t=e,e="* -> *"),2==(i=e.split(" - ")).length?r="before":2==(i=e.split(" -> ")).length&&(r="after"),!r)throw new Error("Illegal fsm condition: "+e);o=i[0],a=i[1],t.condition={when:r,exit:o,enter:a},n.push(t)}}return r.exports=function(){this.fsm=new a("normal")}}.call(t,n,t,e),void 0===r||(e.exports=r)},8655:(e,t,n)=>{var r;r=function(e,t,r){var i=n(2822);return window.diff=i,r.exports=function(){var e,t,n,r,o=this.minder,a=this.hotbox;function s(){n=[],r=[],e=o.exportJson()}function u(){var t=o.exportJson(),r=i(t,e);if(r.length){for(n.push(r);n.length>100;)n.shift();return e=t,!0}}function c(){t=!0;var a,s=n.pop();s&&(o.applyPatches(s),a=o.exportJson(),r.push(i(a,e)),e=a),t=!1}function l(){t=!0;var e=r.pop();e&&(o.applyPatches(e),u()),t=!1}function h(){return!!n.length}function f(){return!!r.length}this.history={reset:s,undo:c,redo:l,hasUndo:h,hasRedo:f},s(),o.on("contentchange",(function(){t||u()&&(r=[])})),o.on("import",s),o.on("patch",(function(e){if(t){var n=e.patch;switch(n.express){case"node.add":o.select(n.node.getChild(n.index),!0);break;case"node.remove":case"data.replace":case"data.remove":case"data.add":o.select(n.node,!0)}}}));var d=a.state("main");d.button({position:"top",label:"\u64A4\u9500",key:"Ctrl + Z",enable:h,action:c,next:"idle"}),d.button({position:"top",label:"\u91CD\u505A",key:"Ctrl + Y",enable:f,action:l,next:"idle"})}}.call(t,n,t,e),void 0===r||(e.exports=r)},6736:(e,t,n)=>{var r;r=function(e,t,r){var i=n(5578);return r.exports=function(){var e=this.fsm,t=this.minder,n=this.receiver,r=this.container,o=new i(r);o.setParentFSM(e),e.when("normal -> hotbox",(function(e,n,r){var i,a=t.getSelectedNode();if(a){var s=a.getRenderBox();i={x:s.cx,y:s.cy}}o.active("main",i)})),e.when("normal -> normal",(function(e,n,r,i){"shortcut-handle"==r&&(o.dispatch(i)?i.preventDefault():t.dispatchKeyEvent(i))})),e.when("modal -> normal",(function(e,t,r,i){"import-text-finish"==r&&n.element.focus()})),this.hotbox=o}}.call(t,n,t,e),void 0===r||(e.exports=r)},907:(e,t,n)=>{var r;r=function(e,t,r){n(4232);var i=new(n(4264))("input");return r.exports=function(){var e=this.fsm,t=this.minder,n=this.hotbox,r=this.receiver,o=r.element,a=window.kity.Browser.gecko;function s(){var n=t.getSelectedNode();if(n){var i=o;if(o.innerText="","bold"===n.getData("font-weight")){var s=document.createElement("b");i.appendChild(s),i=s}if("italic"===n.getData("font-style")){var u=document.createElement("i");i.appendChild(u),i=u}i.innerText=t.queryCommandValue("text"),a&&r.fixFFCaretDisappeared(),e.jump("input","input-request"),r.selectAll()}}function u(){var e=t.getSelectedNode();if(e){var n=e.getData("font-size")||e.getStyle("font-size");o.style.fontSize=n+"px",o.style.minWidth=0,o.style.minWidth=o.clientWidth+"px",o.style.fontWeight=e.getData("font-weight")||"",o.style.fontStyle=e.getData("font-style")||"",o.classList.add("input"),o.focus()}}function c(){o.classList.remove("input"),r.selectAll()}function l(){var e=l,n=t.getSelectedNode();n&&(e.timer||(e.timer=setTimeout((function(){var t=n.getRenderBox("TextRenderer");o.style.left=Math.round(t.x)+"px",o.style.top=(i.flaged?Math.round(t.bottom+30):Math.round(t.y))+"px",e.timer=0}))))}!function(){i.flaged&&o.classList.add("debug");o.onmousedown=function(e){e.stopPropagation()},t.on("layoutallfinish viewchange viewchanged selectionchange",(function(t){"viewchange"==t.type&&"input"!=e.state()||l()})),l()}(),e.when("* -> input",u),e.when("input -> *",(function(e,n,r){return"input-cancel"===r?c():function(){var e=[].slice.call(o.childNodes);setTimeout((function(){o.innerHTML=""}),0);var n=t.getSelectedNode();if(e=function(e){for(var n,r,i,o="",a="\\t",s="\\n",u=/\\S/,l=" ",h=new RegExp("( |"+String.fromCharCode(160)+")"),f=document.createElement("br"),d=!1,p=!1,g=0,m=e.length;g<m;g++)switch(n=e[g],Object.prototype.toString.call(n)){case"[object HTMLBRElement]":o+=s;break;case"[object Text]":if(n=n.textContent.replace("&nbsp;"," "),u.test(n))o+=n;else for(i=n.length;i--;)h.test(n[i])?o+=l:n[i]===a&&(o+=a);break;case"[object HTMLElement]":switch(n.nodeName){case"B":d=!0;break;case"I":p=!0}[].splice.apply(e,[g,1].concat([].slice.call(n.childNodes))),m=e.length,g--;break;case"[object HTMLSpanElement]":[].splice.apply(e,[g,1].concat([].slice.call(n.childNodes))),m=e.length,g--;break;case"[object HTMLImageElement]":n.src&&/http(|s):\\/\\//.test(n.src)&&t.execCommand("Image",n.src,n.alt);break;case"[object HTMLDivElement]":r=[];var v=0;for(m=n.childNodes.length;v<m;v++)r.push(n.childNodes[v]);r.push(f),[].splice.apply(e,[g,1].concat(r)),m=e.length,g--;break;default:if(n&&n.childNodes.length){for(r=[],v=0,m=n.childNodes.length;v<m;v++)r.push(n.childNodes[v]);r.push(f),[].splice.apply(e,[g,1].concat(r)),m=e.length,g--}else n&&void 0!==n.textContent?o+=n.textContent:o+=""}return o=(o=o.replace(/^\\n*|\\n*$/g,"")).replace(new RegExp("(\\n|\\r|\\n\\r)( |"+String.fromCharCode(160)+"){4}","g"),"$1\\t"),t.getSelectedNode().setText(o),d?t.queryCommandState("bold")||t.execCommand("bold"):t.queryCommandState("bold")&&t.execCommand("bold"),p?t.queryCommandState("italic")||t.execCommand("italic"):t.queryCommandState("italic")&&t.execCommand("italic"),c(),o}(e),function(e,n){try{t.decodeData("text",n).then((function(n){function r(e,t,n){var i=t.data;e.setText(i.text||"");for(var o=t.children||[],a=0;a<o.length;a++)r(n.createNode(null,e),o[a],n);return e}r(e,n,t),t.fire("contentchange"),t.getRoot().renderTree(),t.layout(300)}))}catch(e){if(t.fire("contentchange"),t.getRoot().renderTree(),"Error: Invalid local format"!==e.toString())throw e}}(n,e),"root"==n.type){var r=t.getRoot().getText();t.fire("initChangeRoot",{text:r})}}()})),r.onblur((function(t){"input"==e.state()&&e.jump("normal","input-commit")})),t.on("beforemousedown",(function(){"input"==e.state()&&e.jump("normal","input-commit")})),t.on("dblclick",(function(){t.getSelectedNode()&&"readonly"!==t._status&&s()})),n.state("main").button({position:"center",label:"\u7F16\u8F91",key:"F2",enable:function(){return-1!=t.queryCommandState("text")},action:s}),this.editText=s}}.call(t,n,t,e),void 0===r||(e.exports=r)},2795:(e,t,n)=>{var r;r=function(e,t,r){var i=n(5578);return r.exports=function(){var e,t,n=this.fsm,r=this.minder,o=this.receiver,a=this.container,s=o.element,u=this.hotbox,c=!1;o.listen("normal",(function(e){if(o.enable(),e.is("Space"))return e.preventDefault(),kity.Browser.safari&&(s.innerHTML=""),n.jump("hotbox","space-trigger");if("keydown"===e.type){if(r.getSelectedNode()){if(function(e){return!(e.ctrlKey||e.metaKey||e.altKey)&&(e.keyCode>=65&&e.keyCode<=90||e.keyCode>=48&&e.keyCode<=57||108!=e.keyCode&&e.keyCode>=96&&e.keyCode<=111||108!=e.keyCode&&e.keyCode>=96&&e.keyCode<=111||229==e.keyCode||0===e.keyCode)}(e))return n.jump("input","user-input")}else s.innerHTML="";n.jump("normal","shortcut-handle",e)}})),o.listen("hotbox",(function(e){o.disable(),e.preventDefault();u.dispatch(e);if(u.state()==i.STATE_IDLE&&"hotbox"==n.state())return n.jump("normal","hotbox-idle")})),o.listen("input",(function(e){if(o.enable(),"keydown"==e.type){if(e.is("Enter"))return e.preventDefault(),n.jump("normal","input-commit");if(e.is("Esc"))return e.preventDefault(),n.jump("normal","input-cancel");(e.is("Tab")||e.is("Shift + Tab"))&&e.preventDefault()}else if("keyup"==e.type&&e.is("Esc")){if(e.preventDefault(),!c)return n.jump("normal","input-cancel")}else"compositionstart"==e.type?c=!0:"compositionend"==e.type&&setTimeout((function(){c=!1}))})),a.addEventListener("mousedown",(function(r){2==r.button&&r.preventDefault(),"hotbox"==n.state()?(u.active(i.STATE_IDLE),n.jump("normal","blur")):"normal"==n.state()&&2==r.button&&(e=r.clientX,t=r.clientY)}),!1),a.addEventListener("mousewheel",(function(e){"hotbox"==n.state()&&(u.active(i.STATE_IDLE),n.jump("normal","mousemove-blur"))}),!1),a.addEventListener("contextmenu",(function(e){e.preventDefault()})),a.addEventListener("mouseup",(function(i){"normal"==n.state()&&2==i.button&&i.clientX==e&&i.clientY==t&&r.getSelectedNode()&&n.jump("hotbox","content-menu")}),!1),u.$element.addEventListener("mousedown",(function(e){e.stopPropagation()}))}}.call(t,n,t,e),void 0===r||(e.exports=r)},1644:(e,t,n)=>{var r;r=function(e,t,r){var i=n(3233),o=n(3013).ResourceCountRenderer;function a(e){e&&e.traverse&&e.traverse((function(e){!function(e){if(e._renderers){for(var t=0;t<e._renderers.length;t++)if(e._renderers[t]instanceof o)return;e._renderers.push(new o(e))}}(e)}))}return r.exports=function(){var e=new i({enableKeyReceiver:!1,enableAnimation:!0});e._rendererClasses=e._rendererClasses||{},e._rendererClasses.left=e._rendererClasses.left||[],e._rendererClasses.left.unshift(o),a(e.getRoot()),e.on("contentchange",(function(){a(e.getRoot())})),e.renderTo(this.selector),e.setTheme(null),e.select(e.getRoot(),!0),e.execCommand("text","\u4E2D\u5FC3\u4E3B\u9898"),this.minder=e}}.call(t,n,t,e),void 0===r||(e.exports=r)},451:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=function(){var e=this,t=this.minder,n=this.hotbox,r=this.fsm,i=n.state("main"),o=0;["\u524D\u79FB:Alt+Up:ArrangeUp","\u4E0B\u7EA7:Tab|Insert:AppendChildNode","\u540C\u7EA7:Enter:AppendSiblingNode","\u540E\u79FB:Alt+Down:ArrangeDown","\u5220\u9664:Delete|Backspace:RemoveNode","\u4E0A\u7EA7:Shift+Tab|Shift+Insert:AppendParentNode"].forEach((function(n){var a=n.split(":"),s=a.shift(),u=a.shift(),c=a.shift();i.button({position:"ring",label:s,key:u,action:function(){if(0===c.indexOf("Append")){o++,t.execCommand(c,"\u5206\u652F\u4E3B\u9898"),t.on("layoutallfinish",(function n(){--o||e.editText(),t.off("layoutallfinish",n)}))}else t.execCommand(c),r.jump("normal","command-executed")},enable:function(){return-1!=t.queryCommandState(c)}})})),i.button({position:"bottom",label:"\u5BFC\u5165\u8282\u70B9",key:"Alt + V",enable:function(){return 1==t.getSelectedNodes().length},action:function(){t.fire("importNodeData")},next:"idle"}),i.button({position:"bottom",label:"\u5BFC\u51FA\u8282\u70B9",key:"Alt + C",enable:function(){return 1==t.getSelectedNodes().length},action:function(){t.fire("exportNodeData")},next:"idle"})}}.call(t,n,t,e),void 0===r||(e.exports=r)},3013:(e,t,n)=>{var r;r=function(e,t,r){var i=n(6361),o=n(1898);function a(e){var t=e.getData("resources");if(!t)return[];if(t instanceof Array)return t;if("string"==typeof t)try{t=JSON.parse(t)}catch(e){return[]}return t instanceof Array?t:[]}var s=i.createClass("ObsidianResourceCountBadge",{base:i.Group,constructor:function(){this.callBase(),this.width=20,this.height=16,this.rect=new i.Rect(20,16,0,0,8).fill("#7c6cff").stroke("#7c6cff",1),this.glow=new i.Rect(18,12,1,2,6).fill("rgba(255, 255, 255, .38)"),this.text=(new i.Text).setFontSize(10).setTextAnchor("middle").setVerticalAlign("middle"),this.text.setY(this.height/2),this.addShapes([this.rect,this.glow,this.text]),this.setStyle("cursor","pointer")},setValue:function(e,t){var n,r,i=e>99?"99+":String(e);this.text.setContent(i),this.text.fill("#7a5200"),this.rect.fill("#7c6cff"),this.rect.stroke("#7c6cff",1),n=this.text.getBoundaryBox(),r=Math.round(n.width+12),this.width=Math.max(20,r),this.rect.setWidth(this.width),this.glow.setWidth(Math.max(12,this.width-2)),this.text.setX(this.width/2)}}),u=i.createClass("ObsidianResourceCountRenderer",{base:o,create:function(e){var t=new s;return t.on("mousedown",(function(t){t.preventDefault(),e.getMinder().fire("editnoterequest")})),t},shouldRender:function(e){return a(e).length>0},update:function(e,t,n){var r,o=a(t).length,s=-e.height/2,u=t.getStyle("space-left"),c=t.getStyle("color");return e.setValue(o,c),r=n.left-e.width-u,e.setTranslate(r,s),new i.Box(r,s,e.width,e.height)}});r.exports={ResourceCountRenderer:u}}.call(t,n,t,e),void 0===r||(e.exports=r)},5191:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=function(){var e=this.minder,t=this.hotbox;t.state("main").button({position:"top",label:"\u4F18\u5148\u7EA7",key:"P",next:"priority",enable:function(){return-1!=e.queryCommandState("priority")}});var n=t.state("priority");"123456789".replace(/./g,(function(t){n.button({position:"ring",label:"P"+t,key:t,action:function(){e.execCommand("Priority",t)}})})),n.button({position:"center",label:"\u79FB\u9664",key:"Del",action:function(){e.execCommand("Priority",0)}}),n.button({position:"top",label:"\u8FD4\u56DE",key:"esc",next:"back"})}}.call(t,n,t,e),void 0===r||(e.exports=r)},6e3:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=function(){var e=this.minder,t=this.hotbox;t.state("main").button({position:"top",label:"\u8FDB\u5EA6",key:"G",next:"progress",enable:function(){return-1!=e.queryCommandState("progress")}});var n=t.state("progress");"012345678".replace(/./g,(function(t){n.button({position:"ring",label:"G"+t,key:t,action:function(){e.execCommand("Progress",parseInt(t)+1)}})})),n.button({position:"center",label:"\u79FB\u9664",key:"Del",action:function(){e.execCommand("Progress",0)}}),n.button({position:"top",label:"\u8FD4\u56DE",key:"esc",next:"back"})}}.call(t,n,t,e),void 0===r||(e.exports=r)},8270:(e,t,n)=>{var r;r=function(e,t,r){var i=n(8464);n(2116);return r.exports=function(){var e=this.fsm,t=this.minder,n=document.createElement("div");n.contentEditable=!0,n.setAttribute("tabindex",-1),n.classList.add("receiver"),n.onkeydown=n.onkeypress=n.onkeyup=a,n.addEventListener("compositionstart",a),this.container.appendChild(n);var r={element:n,selectAll:function(){n.innerHTML||(n.innerHTML="&nbsp;");var e=document.createRange(),t=window.getSelection();e.selectNodeContents(n),t.removeAllRanges(),t.addRange(e),n.focus()},enable:function(){n.setAttribute("contenteditable",!0)},disable:function(){n.setAttribute("contenteditable",!1)},fixFFCaretDisappeared:function(){n.removeAttribute("contenteditable"),n.setAttribute("contenteditable","true"),n.blur(),n.focus()},onblur:function(e){n.onblur=e}};r.selectAll(),t.on("beforemousedown",r.selectAll),t.on("receiverfocus",r.selectAll),t.on("readonly",(function(){t.disable(),editor.receiver.element.parentElement.removeChild(editor.receiver.element),editor.hotbox.$container.removeChild(editor.hotbox.$element)}));var o=[];function a(t){var n;t.is=function(e){for(var t=e.split("|"),n=0;n<t.length;n++)if(i.is(this,t[n]))return!0;return!1};for(var r=0;r<o.length;r++)if(("*"==(n=o[r]).notifyState||n.notifyState==e.state())&&n.call(null,t))return}r.listen=function(e,t){1==arguments.length&&(t=e,e="*"),t.notifyState=e,o.push(t)},this.receiver=r}}.call(t,n,t,e),void 0===r||(e.exports=r)},4264:(e,t,n)=>{var r;r=function(e,t,r){var i=n(3308);function o(){}return r.exports=function(e){if(this.flaged=-1!=window.location.search.indexOf(e)){var t=function(e){for(var t=0,n=0;n<e.length;n++)t+=e.charCodeAt(n);return t}(e)%360,n=i("background: hsl({0}, 50%, 80%); color: hsl({0}, 100%, 30%); padding: 2px 3px; margin: 1px 3px 0 0;border-radius: 2px;",t);this.log=function(){var t=i.apply(null,arguments);console.log(i("%c{0}%c{1}",e,t),n,"background: none; color: black;")}}else this.log=o}}.call(t,n,t,e),void 0===r||(e.exports=r)},3308:(e,t,n)=>{var r;r=function(e,t,n){return n.exports=function(e,t){return"object"!=typeof t&&(t=[].slice.call(arguments,1)),String(e).replace(/\\{(\\w+)\\}/gi,(function(e,n){return t[n]||n}))}}.call(t,n,t,e),void 0===r||(e.exports=r)},4232:(e,t,n)=>{var r;void 0===(r=function(e,t,n){!("innerText"in document.createElement("a"))&&"getSelection"in window&&(HTMLElement.prototype.__defineGetter__("innerText",(function(){var e,t,n=window.getSelection(),r=[];for(t=0;t<n.rangeCount;t++)r[t]=n.getRangeAt(t);for(n.removeAllRanges(),n.selectAllChildren(this),e=n.toString(),n.removeAllRanges(),t=0;t<r.length;t++)n.addRange(r[t]);return e})),HTMLElement.prototype.__defineSetter__("innerText",(function(e){this.innerHTML=(e||"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\\n/g,"<br>")})))}.call(t,n,t,e))||(e.exports=r)},2822:(e,t,n)=>{var r;r=function(e,t,n){var r=Object.keys?Object.keys:function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t};function i(e){return-1===e.indexOf("/")&&-1===e.indexOf("~")?e:e.replace(/~/g,"~0").replace(/\\//g,"~1")}function o(e){return"object"==typeof e?JSON.parse(JSON.stringify(e)):e}function a(e,t,n,s){for(var u=r(t),c=r(e),l=!1,h=c.length-1;h>=0;h--){var f=e[p=c[h]];if(t.hasOwnProperty(p)){var d=t[p];"object"==typeof f&&null!=f&&"object"==typeof d&&null!=d?a(f,d,n,s+"/"+i(p)):f!=d&&n.push({op:"replace",path:s+"/"+i(p),value:o(d)})}else n.push({op:"remove",path:s+"/"+i(p)}),l=!0}if(l||u.length!=c.length)for(h=0;h<u.length;h++){var p=u[h];e.hasOwnProperty(p)||n.push({op:"add",path:s+"/"+i(p),value:o(t[p])})}}return n.exports=function(e,t){var n=[];return a(e,t,n,""),n}}.call(t,n,t,e),void 0===r||(e.exports=r)},8464:(e,t,n)=>{var r;r=function(e,t,r){var i=n(1776),o=4096,a=8192,s=16384;function u(e){return"string"==typeof e?(t=0,e.toLowerCase().split(/\\s*\\+\\s*/).forEach((function(e){switch(e){case"ctrl":case"cmd":t|=o;break;case"alt":t|=a;break;case"shift":t|=s;break;default:t|=i[e]}})),t):function(e){var t=0;(e.ctrlKey||e.metaKey)&&(t|=o);e.altKey&&(t|=a);e.shiftKey&&(t|=s);if(-1===[16,17,18,91].indexOf(e.keyCode)){if(229===e.keyCode&&e.keyIdentifier)return t|parseInt(e.keyIdentifier.substr(2),16);t|=e.keyCode}return t}(e);var t}t.hash=u,t.is=function(e,t){return e&&t&&u(e)==u(t)}}.call(t,n,t,e),void 0===r||(e.exports=r)},1776:(e,t,n)=>{var r;r=function(e,t,n){var r={Shift:16,Control:17,Alt:18,CapsLock:20,BackSpace:8,Tab:9,Enter:13,Esc:27,Space:32,PageUp:33,PageDown:34,End:35,Home:36,Insert:45,Left:37,Up:38,Right:39,Down:40,Direction:{37:1,38:1,39:1,40:1},Del:46,NumLock:144,Cmd:91,CmdFF:224,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,"`":192,"=":187,"-":189,"/":191,".":190};for(var i in r)r.hasOwnProperty(i)&&(r[i.toLowerCase()]=r[i]);var o="a".charCodeAt(0);"abcdefghijklmnopqrstuvwxyz".split("").forEach((function(e){r[e]=e.charCodeAt(0)-o+65}));var a=9;do{r[a.toString()]=a+48}while(--a);n.exports=r}.call(t,n,t,e),void 0===r||(e.exports=r)},6763:(e,t,n)=>{n(8844);const{kity:r}=window;n(7461);const{kityminder:i}=window;e.exports={kity:r,kityminder:i}},6709:e=>{"use strict";var t,n=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,o=Object.prototype.hasOwnProperty,a=(e,t,n)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,n)},s=(e,t,n)=>(((e,t,n)=>{if(!t.has(e))throw TypeError("Cannot "+n)})(e,t,"access private method"),n),u={};function c(){return{async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,hooks:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1}}((e,t)=>{for(var r in t)n(e,r,{get:t[r],enumerable:!0})})(u,{Hooks:()=>Z,Lexer:()=>q,Marked:()=>X,Parser:()=>W,Renderer:()=>G,Slugger:()=>$,TextRenderer:()=>U,Tokenizer:()=>L,defaults:()=>l,getDefaults:()=>c,lexer:()=>oe,marked:()=>K,options:()=>J,parse:()=>re,parseInline:()=>ne,parser:()=>ie,setOptions:()=>Q,use:()=>ee,walkTokens:()=>te}),e.exports=(t=u,((e,t,a,s)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let u of i(t))o.call(e,u)||u===a||n(e,u,{get:()=>t[u],enumerable:!(s=r(t,u))||s.enumerable});return e})(n({},"__esModule",{value:!0}),t));var l={async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,hooks:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1};function h(e){l=e}var f=/[&<>"\']/,d=new RegExp(f.source,"g"),p=/[<>"\']|&(?!(#\\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\\w+);)/,g=new RegExp(p.source,"g"),m={"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;","\'":"&#39;"},v=e=>m[e];function y(e,t){if(t){if(f.test(e))return e.replace(d,v)}else if(p.test(e))return e.replace(g,v);return e}var x=/&(#(?:\\d+)|(?:#x[0-9A-Fa-f]+)|(?:\\w+));?/gi;function b(e){return e.replace(x,((e,t)=>"colon"===(t=t.toLowerCase())?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}var w=/(^|[^\\[])\\^/g;function _(e,t){e="string"==typeof e?e:e.source,t=t||"";const n={replace:(t,r)=>(r=(r="object"==typeof r&&"source"in r?r.source:r).replace(w,"$1"),e=e.replace(t,r),n),getRegex:()=>new RegExp(e,t)};return n}var k=/[^\\w:]/g,C=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function S(e,t,n){if(e){let e;try{e=decodeURIComponent(b(n)).replace(k,"").toLowerCase()}catch(e){return null}if(0===e.indexOf("javascript:")||0===e.indexOf("vbscript:")||0===e.indexOf("data:"))return null}t&&!C.test(n)&&(n=function(e,t){T[" "+e]||(A.test(e)?T[" "+e]=e+"/":T[" "+e]=M(e,"/",!0));e=T[" "+e];const n=-1===e.indexOf(":");return"//"===t.substring(0,2)?n?t:e.replace(E,"$1")+t:"/"===t.charAt(0)?n?t:e.replace(R,"$1")+t:e+t}(t,n));try{n=encodeURI(n).replace(/%25/g,"%")}catch(e){return null}return n}var T={},A=/^[^:]+:\\/*[^/]*$/,E=/^([^:]+:)[\\s\\S]*$/,R=/^([^:]+:\\/*[^/]*)[\\s\\S]*$/;var N={exec:()=>null};function P(e,t){const n=e.replace(/\\|/g,((e,t,n)=>{let r=!1,i=t;for(;--i>=0&&"\\\\"===n[i];)r=!r;return r?"|":" |"})).split(/ \\|/);let r=0;if(n[0].trim()||n.shift(),n.length>0&&!n[n.length-1].trim()&&n.pop(),n.length>t)n.splice(t);else for(;n.length<t;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(/\\\\\\|/g,"|");return n}function M(e,t,n){const r=e.length;if(0===r)return"";let i=0;for(;i<r;){const o=e.charAt(r-i-1);if(o!==t||n){if(o===t||!n)break;i++}else i++}return e.slice(0,r-i)}function D(e,t,n,r){const i=t.href,o=t.title?y(t.title):null,a=e[1].replace(/\\\\([\\[\\]])/g,"$1");if("!"!==e[0].charAt(0)){r.state.inLink=!0;const e={type:"link",raw:n,href:i,title:o,text:a,tokens:r.inlineTokens(a)};return r.state.inLink=!1,e}return{type:"image",raw:n,href:i,title:o,text:y(a)}}var L=class{constructor(e){this.options=e||l}space(e){const t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){const t=this.rules.block.code.exec(e);if(t){const e=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?e:M(e,"\\n")}}}fences(e){const t=this.rules.block.fences.exec(e);if(t){const e=t[0],n=function(e,t){const n=e.match(/^(\\s+)(?:```)/);if(null===n)return t;const r=n[1];return t.split("\\n").map((e=>{const t=e.match(/^\\s+/);if(null===t)return e;const[n]=t;return n.length>=r.length?e.slice(r.length):e})).join("\\n")}(e,t[3]||"");return{type:"code",raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline._escapes,"$1"):t[2],text:n}}}heading(e){const t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(/#$/.test(e)){const t=M(e,"#");this.options.pedantic?e=t.trim():t&&!/ $/.test(t)||(e=t.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){const t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:t[0]}}blockquote(e){const t=this.rules.block.blockquote.exec(e);if(t){const e=t[0].replace(/^ *>[ \\t]?/gm,""),n=this.lexer.state.top;this.lexer.state.top=!0;const r=this.lexer.blockTokens(e);return this.lexer.state.top=n,{type:"blockquote",raw:t[0],tokens:r,text:e}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n,r,i,o,a,s,u,c,l,h,f,d,p=t[1].trim();const g=p.length>1,m={type:"list",raw:"",ordered:g,start:g?+p.slice(0,-1):"",loose:!1,items:[]};p=g?`\\\\d{1,9}\\\\${p.slice(-1)}`:`\\\\${p}`,this.options.pedantic&&(p=g?p:"[*+-]");const v=new RegExp(`^( {0,3}${p})((?:[\\t ][^\\\\n]*)?(?:\\\\n|$))`);for(;e&&(d=!1,t=v.exec(e))&&!this.rules.block.hr.test(e);){if(n=t[0],e=e.substring(n.length),c=t[2].split("\\n",1)[0].replace(/^\\t+/,(e=>" ".repeat(3*e.length))),l=e.split("\\n",1)[0],this.options.pedantic?(o=2,f=c.trimLeft()):(o=t[2].search(/[^ ]/),o=o>4?1:o,f=c.slice(o),o+=t[1].length),s=!1,!c&&/^ *$/.test(l)&&(n+=l+"\\n",e=e.substring(l.length+1),d=!0),!d){const t=new RegExp(`^ {0,${Math.min(3,o-1)}}(?:[*+-]|\\\\d{1,9}[.)])((?:[ \\t][^\\\\n]*)?(?:\\\\n|$))`),r=new RegExp(`^ {0,${Math.min(3,o-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\\\* *){3,})(?:\\\\n+|$)`),i=new RegExp(`^ {0,${Math.min(3,o-1)}}(?:\\`\\`\\`|~~~)`),a=new RegExp(`^ {0,${Math.min(3,o-1)}}#`);for(;e&&(h=e.split("\\n",1)[0],l=h,this.options.pedantic&&(l=l.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),!i.test(l))&&!a.test(l)&&!t.test(l)&&!r.test(e);){if(l.search(/[^ ]/)>=o||!l.trim())f+="\\n"+l.slice(o);else{if(s)break;if(c.search(/[^ ]/)>=4)break;if(i.test(c))break;if(a.test(c))break;if(r.test(c))break;f+="\\n"+l}s||l.trim()||(s=!0),n+=h+"\\n",e=e.substring(h.length+1),c=l.slice(o)}}m.loose||(u?m.loose=!0:/\\n *\\n *$/.test(n)&&(u=!0)),this.options.gfm&&(r=/^\\[[ xX]\\] /.exec(f),r&&(i="[ ] "!==r[0],f=f.replace(/^\\[[ xX]\\] +/,""))),m.items.push({type:"list_item",raw:n,task:!!r,checked:i,loose:!1,text:f}),m.raw+=n}m.items[m.items.length-1].raw=n.trimRight(),m.items[m.items.length-1].text=f.trimRight(),m.raw=m.raw.trimRight();const y=m.items.length;for(a=0;a<y;a++)if(this.lexer.state.top=!1,m.items[a].tokens=this.lexer.blockTokens(m.items[a].text,[]),!m.loose){const e=m.items[a].tokens.filter((e=>"space"===e.type)),t=e.length>0&&e.some((e=>/\\n.*\\n/.test(e.raw)));m.loose=t}if(m.loose)for(a=0;a<y;a++)m.items[a].loose=!0;return m}}html(e){const t=this.rules.block.html.exec(e);if(t){const e={type:"html",block:!0,raw:t[0],pre:!this.options.sanitizer&&("pre"===t[1]||"script"===t[1]||"style"===t[1]),text:t[0]};if(this.options.sanitize){const n=this.options.sanitizer?this.options.sanitizer(t[0]):y(t[0]),r=e;r.type="paragraph",r.text=n,r.tokens=this.lexer.inline(n)}return e}}def(e){const t=this.rules.block.def.exec(e);if(t){const e=t[1].toLowerCase().replace(/\\s+/g," "),n=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline._escapes,"$1"):"",r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline._escapes,"$1"):t[3];return{type:"def",tag:e,raw:t[0],href:n,title:r}}}table(e){const t=this.rules.block.table.exec(e);if(t){const e={type:"table",header:P(t[1]).map((e=>({text:e}))),align:t[2].replace(/^ *|\\| *$/g,"").split(/ *\\| */),rows:t[3]&&t[3].trim()?t[3].replace(/\\n[ \\t]*$/,"").split("\\n"):[]};if(e.header.length===e.align.length){e.raw=t[0];let n,r,i,o,a=e.align.length;for(n=0;n<a;n++)/^ *-+: *$/.test(e.align[n])?e.align[n]="right":/^ *:-+: *$/.test(e.align[n])?e.align[n]="center":/^ *:-+ *$/.test(e.align[n])?e.align[n]="left":e.align[n]=null;for(a=e.rows.length,n=0;n<a;n++)e.rows[n]=P(e.rows[n],e.header.length).map((e=>({text:e})));for(a=e.header.length,r=0;r<a;r++)e.header[r].tokens=this.lexer.inline(e.header[r].text);for(a=e.rows.length,r=0;r<a;r++)for(o=e.rows[r],i=0;i<o.length;i++)o[i].tokens=this.lexer.inline(o[i].text);return e}}}lheading(e){const t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:"="===t[2].charAt(0)?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){const t=this.rules.block.paragraph.exec(e);if(t){const e="\\n"===t[1].charAt(t[1].length-1)?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){const t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){const t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:y(t[1])}}tag(e){const t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\\/(pre|code|kbd|script)(\\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:this.options.sanitize?"text":"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(t[0]):y(t[0]):t[0]}}link(e){const t=this.rules.inline.link.exec(e);if(t){const e=t[2].trim();if(!this.options.pedantic&&/^</.test(e)){if(!/>$/.test(e))return;const t=M(e.slice(0,-1),"\\\\");if((e.length-t.length)%2==0)return}else{const e=function(e,t){if(-1===e.indexOf(t[1]))return-1;const n=e.length;let r=0,i=0;for(;i<n;i++)if("\\\\"===e[i])i++;else if(e[i]===t[0])r++;else if(e[i]===t[1]&&(r--,r<0))return i;return-1}(t[2],"()");if(e>-1){const n=(0===t[0].indexOf("!")?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=""}}let n=t[2],r="";if(this.options.pedantic){const e=/^([^\'"]*[^\\s])\\s+([\'"])(.*)\\2/.exec(n);e&&(n=e[1],r=e[3])}else r=t[3]?t[3].slice(1,-1):"";return n=n.trim(),/^</.test(n)&&(n=this.options.pedantic&&!/>$/.test(e)?n.slice(1):n.slice(1,-1)),D(t,{href:n?n.replace(this.rules.inline._escapes,"$1"):n,title:r?r.replace(this.rules.inline._escapes,"$1"):r},t[0],this.lexer)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let e=(n[2]||n[1]).replace(/\\s+/g," ");if(e=t[e.toLowerCase()],!e){const e=n[0].charAt(0);return{type:"text",raw:e,text:e}}return D(n,e,n[0],this.lexer)}}emStrong(e,t,n=""){let r=this.rules.inline.emStrong.lDelim.exec(e);if(!r)return;if(r[3]&&n.match(/[\\p{L}\\p{N}]/u))return;if(!(r[1]||r[2]||"")||!n||this.rules.inline.punctuation.exec(n)){const n=r[0].length-1;let i,o,a=n,s=0;const u="*"===r[0][0]?this.rules.inline.emStrong.rDelimAst:this.rules.inline.emStrong.rDelimUnd;for(u.lastIndex=0,t=t.slice(-1*e.length+n);null!=(r=u.exec(t));){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i)continue;if(o=i.length,r[3]||r[4]){a+=o;continue}if((r[5]||r[6])&&n%3&&!((n+o)%3)){s+=o;continue}if(a-=o,a>0)continue;o=Math.min(o,o+a+s);const t=e.slice(0,n+r.index+o+1);if(Math.min(n,o)%2){const e=t.slice(1,-1);return{type:"em",raw:t,text:e,tokens:this.lexer.inlineTokens(e)}}const u=t.slice(2,-2);return{type:"strong",raw:t,text:u,tokens:this.lexer.inlineTokens(u)}}}}codespan(e){const t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(/\\n/g," ");const n=/[^ ]/.test(e),r=/^ /.test(e)&&/ $/.test(e);return n&&r&&(e=e.substring(1,e.length-1)),e=y(e,!0),{type:"codespan",raw:t[0],text:e}}}br(e){const t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){const t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e,t){const n=this.rules.inline.autolink.exec(e);if(n){let e,r;return"@"===n[2]?(e=y(this.options.mangle?t(n[1]):n[1]),r="mailto:"+e):(e=y(n[1]),r=e),{type:"link",raw:n[0],text:e,href:r,tokens:[{type:"text",raw:e,text:e}]}}}url(e,t){let n;if(n=this.rules.inline.url.exec(e)){let e,r;if("@"===n[2])e=y(this.options.mangle?t(n[0]):n[0]),r="mailto:"+e;else{let t;do{t=n[0],n[0]=this.rules.inline._backpedal.exec(n[0])[0]}while(t!==n[0]);e=y(n[0]),r="www."===n[1]?"http://"+n[0]:n[0]}return{type:"link",raw:n[0],text:e,href:r,tokens:[{type:"text",raw:e,text:e}]}}}inlineText(e,t){const n=this.rules.inline.text.exec(e);if(n){let e;return e=this.lexer.state.inRawBlock?this.options.sanitize?this.options.sanitizer?this.options.sanitizer(n[0]):y(n[0]):n[0]:y(this.options.smartypants?t(n[0]):n[0]),{type:"text",raw:n[0],text:e}}}},O={newline:/^(?: *(?:\\n|$))+/,code:/^( {4}[^\\n]+(?:\\n(?: *(?:\\n|$))*)?)+/,fences:/^ {0,3}(`{3,}(?=[^`\\n]*(?:\\n|$))|~{3,})([^\\n]*)(?:\\n|$)(?:|([\\s\\S]*?)(?:\\n|$))(?: {0,3}\\1[~`]* *(?=\\n|$)|$)/,hr:/^ {0,3}((?:-[\\t ]*){3,}|(?:_[ \\t]*){3,}|(?:\\*[ \\t]*){3,})(?:\\n+|$)/,heading:/^ {0,3}(#{1,6})(?=\\s|$)(.*)(?:\\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\\n]*)(?:\\n|$))+/,list:/^( {0,3}bull)([ \\t][^\\n]+?)?(?:\\n|$)/,html:"^ {0,3}(?:<(script|pre|style|textarea)[\\\\s>][\\\\s\\\\S]*?(?:</\\\\1>[^\\\\n]*\\\\n+|$)|comment[^\\\\n]*(\\\\n+|$)|<\\\\?[\\\\s\\\\S]*?(?:\\\\?>\\\\n*|$)|<![A-Z][\\\\s\\\\S]*?(?:>\\\\n*|$)|<!\\\\[CDATA\\\\[[\\\\s\\\\S]*?(?:\\\\]\\\\]>\\\\n*|$)|</?(tag)(?: +|\\\\n|/?>)[\\\\s\\\\S]*?(?:(?:\\\\n *)+\\\\n|$)|<(?!script|pre|style|textarea)([a-z][\\\\w-]*)(?:attribute)*? */?>(?=[ \\\\t]*(?:\\\\n|$))[\\\\s\\\\S]*?(?:(?:\\\\n *)+\\\\n|$)|</(?!script|pre|style|textarea)[a-z][\\\\w-]*\\\\s*>(?=[ \\\\t]*(?:\\\\n|$))[\\\\s\\\\S]*?(?:(?:\\\\n *)+\\\\n|$))",def:/^ {0,3}\\[(label)\\]: *(?:\\n *)?([^<\\s][^\\s]*|<.*?>)(?:(?: +(?:\\n *)?| *\\n *)(title))? *(?:\\n+|$)/,table:N,lheading:/^((?:(?!^bull ).|\\n(?!\\n|bull ))+?)\\n {0,3}(=+|-+) *(?:\\n+|$)/,_paragraph:/^([^\\n]+(?:\\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\\n)[^\\n]+)*)/,text:/^[^\\n]+/,_label:/(?!\\s*\\])(?:\\\\.|[^\\[\\]\\\\])+/,_title:/(?:"(?:\\\\"?|[^"\\\\])*"|\'[^\'\\n]*(?:\\n[^\'\\n]+)*\\n?\'|\\([^()]*\\))/};O.def=_(O.def).replace("label",O._label).replace("title",O._title).getRegex(),O.bullet=/(?:[*+-]|\\d{1,9}[.)])/,O.listItemStart=_(/^( *)(bull) */).replace("bull",O.bullet).getRegex(),O.list=_(O.list).replace(/bull/g,O.bullet).replace("hr","\\\\n+(?=\\\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\\\* *){3,})(?:\\\\n+|$))").replace("def","\\\\n+(?="+O.def.source+")").getRegex(),O._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",O._comment=/<!--(?!-?>)[\\s\\S]*?(?:-->|$)/,O.html=_(O.html,"i").replace("comment",O._comment).replace("tag",O._tag).replace("attribute",/ +[a-zA-Z:_][\\w.:-]*(?: *= *"[^"\\n]*"| *= *\'[^\'\\n]*\'| *= *[^\\s"\'=<>`]+)?/).getRegex(),O.lheading=_(O.lheading).replace(/bull/g,O.bullet).getRegex(),O.paragraph=_(O._paragraph).replace("hr",O.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\\\n]*\\\\n)|~{3,})[^\\\\n]*\\\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",O._tag).getRegex(),O.blockquote=_(O.blockquote).replace("paragraph",O.paragraph).getRegex(),O.normal={...O},O.gfm={...O.normal,table:"^ *([^\\\\n ].*\\\\|.*)\\\\n {0,3}(?:\\\\| *)?(:?-+:? *(?:\\\\| *:?-+:? *)*)(?:\\\\| *)?(?:\\\\n((?:(?! *\\\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\\\n|$))*)\\\\n*|$)"},O.gfm.table=_(O.gfm.table).replace("hr",O.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\\\n]*\\\\n)|~{3,})[^\\\\n]*\\\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",O._tag).getRegex(),O.gfm.paragraph=_(O._paragraph).replace("hr",O.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("table",O.gfm.table).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\\\n]*\\\\n)|~{3,})[^\\\\n]*\\\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",O._tag).getRegex(),O.pedantic={...O.normal,html:_("^ *(?:comment *(?:\\\\n|\\\\s*$)|<(tag)[\\\\s\\\\S]+?</\\\\1> *(?:\\\\n{2,}|\\\\s*$)|<tag(?:\\"[^\\"]*\\"|\'[^\']*\'|\\\\s[^\'\\"/>\\\\s]*)*?/?> *(?:\\\\n{2,}|\\\\s*$))").replace("comment",O._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\\\b)\\\\w+(?!:|[^\\\\w\\\\s@]*@)\\\\b").getRegex(),def:/^ *\\[([^\\]]+)\\]: *<?([^\\s>]+)>?(?: +(["(][^\\n]+[")]))? *(?:\\n+|$)/,heading:/^(#{1,6})(.*)(?:\\n+|$)/,fences:N,lheading:/^(.+?)\\n {0,3}(=+|-+) *(?:\\n+|$)/,paragraph:_(O.normal._paragraph).replace("hr",O.hr).replace("heading"," *#{1,6} *[^\\n]").replace("lheading",O.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()};var I={escape:/^\\\\([!"#$%&\'()*+,\\-./:;<=>?@\\[\\]\\\\^_`{|}~])/,autolink:/^<(scheme:[^\\s\\x00-\\x1f<>]*|email)>/,url:N,tag:"^comment|^</[a-zA-Z][\\\\w:-]*\\\\s*>|^<[a-zA-Z][\\\\w-]*(?:attribute)*?\\\\s*/?>|^<\\\\?[\\\\s\\\\S]*?\\\\?>|^<![a-zA-Z]+\\\\s[\\\\s\\\\S]*?>|^<!\\\\[CDATA\\\\[[\\\\s\\\\S]*?\\\\]\\\\]>",link:/^!?\\[(label)\\]\\(\\s*(href)(?:\\s+(title))?\\s*\\)/,reflink:/^!?\\[(label)\\]\\[(ref)\\]/,nolink:/^!?\\[(ref)\\](?:\\[\\])?/,reflinkSearch:"reflink|nolink(?!\\\\()",emStrong:{lDelim:/^(?:\\*+(?:((?!\\*)[punct])|[^\\s*]))|^_+(?:((?!_)[punct])|([^\\s_]))/,rDelimAst:/^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)[punct](\\*+)(?=[\\s]|$)|[^punct\\s](\\*+)(?!\\*)(?=[punct\\s]|$)|(?!\\*)[punct\\s](\\*+)(?=[^punct\\s])|[\\s](\\*+)(?!\\*)(?=[punct])|(?!\\*)[punct](\\*+)(?!\\*)(?=[punct])|[^punct\\s](\\*+)(?=[^punct\\s])/,rDelimUnd:/^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\\s]|$)|[^punct\\s](_+)(?!_)(?=[punct\\s]|$)|(?!_)[punct\\s](_+)(?=[^punct\\s])|[\\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])/},code:/^(`+)([^`]|[^`][\\s\\S]*?[^`])\\1(?!`)/,br:/^( {2,}|\\\\)\\n(?!\\s*$)/,del:N,text:/^(`+|[^`])(?:(?= {2,}\\n)|[\\s\\S]*?(?:(?=[\\\\<!\\[`*_]|\\b_|$)|[^ ](?= {2,}\\n)))/,punctuation:/^((?![*_])[\\spunctuation])/};function B(e){return e.replace(/---/g,"\u2014").replace(/--/g,"\u2013").replace(/(^|[-\\u2014/(\\[{"\\s])\'/g,"$1\u2018").replace(/\'/g,"\u2019").replace(/(^|[-\\u2014/(\\[{\\u2018\\s])"/g,"$1\u201C").replace(/"/g,"\u201D").replace(/\\.{3}/g,"\u2026")}function V(e){let t,n,r="";const i=e.length;for(t=0;t<i;t++)n=e.charCodeAt(t),Math.random()>.5&&(n="x"+n.toString(16)),r+="&#"+n+";";return r}I._punctuation="\\\\p{P}$+<=>`^|~",I.punctuation=_(I.punctuation,"u").replace(/punctuation/g,I._punctuation).getRegex(),I.blockSkip=/\\[[^[\\]]*?\\]\\([^\\(\\)]*?\\)|`[^`]*?`|<[^<>]*?>/g,I.anyPunctuation=/\\\\[punct]/g,I._escapes=/\\\\([punct])/g,I._comment=_(O._comment).replace("(?:--\\x3e|$)","--\\x3e").getRegex(),I.emStrong.lDelim=_(I.emStrong.lDelim,"u").replace(/punct/g,I._punctuation).getRegex(),I.emStrong.rDelimAst=_(I.emStrong.rDelimAst,"gu").replace(/punct/g,I._punctuation).getRegex(),I.emStrong.rDelimUnd=_(I.emStrong.rDelimUnd,"gu").replace(/punct/g,I._punctuation).getRegex(),I.anyPunctuation=_(I.anyPunctuation,"gu").replace(/punct/g,I._punctuation).getRegex(),I._escapes=_(I._escapes,"gu").replace(/punct/g,I._punctuation).getRegex(),I._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/,I._email=/[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,I.autolink=_(I.autolink).replace("scheme",I._scheme).replace("email",I._email).getRegex(),I._attribute=/\\s+[a-zA-Z:_][\\w.:-]*(?:\\s*=\\s*"[^"]*"|\\s*=\\s*\'[^\']*\'|\\s*=\\s*[^\\s"\'=<>`]+)?/,I.tag=_(I.tag).replace("comment",I._comment).replace("attribute",I._attribute).getRegex(),I._label=/(?:\\[(?:\\\\.|[^\\[\\]\\\\])*\\]|\\\\.|`[^`]*`|[^\\[\\]\\\\`])*?/,I._href=/<(?:\\\\.|[^\\n<>\\\\])+>|[^\\s\\x00-\\x1f]*/,I._title=/"(?:\\\\"?|[^"\\\\])*"|\'(?:\\\\\'?|[^\'\\\\])*\'|\\((?:\\\\\\)?|[^)\\\\])*\\)/,I.link=_(I.link).replace("label",I._label).replace("href",I._href).replace("title",I._title).getRegex(),I.reflink=_(I.reflink).replace("label",I._label).replace("ref",O._label).getRegex(),I.nolink=_(I.nolink).replace("ref",O._label).getRegex(),I.reflinkSearch=_(I.reflinkSearch,"g").replace("reflink",I.reflink).replace("nolink",I.nolink).getRegex(),I.normal={...I},I.pedantic={...I.normal,strong:{start:/^__|\\*\\*/,middle:/^__(?=\\S)([\\s\\S]*?\\S)__(?!_)|^\\*\\*(?=\\S)([\\s\\S]*?\\S)\\*\\*(?!\\*)/,endAst:/\\*\\*(?!\\*)/g,endUnd:/__(?!_)/g},em:{start:/^_|\\*/,middle:/^()\\*(?=\\S)([\\s\\S]*?\\S)\\*(?!\\*)|^_(?=\\S)([\\s\\S]*?\\S)_(?!_)/,endAst:/\\*(?!\\*)/g,endUnd:/_(?!_)/g},link:_(/^!?\\[(label)\\]\\((.*?)\\)/).replace("label",I._label).getRegex(),reflink:_(/^!?\\[(label)\\]\\s*\\[([^\\]]*)\\]/).replace("label",I._label).getRegex()},I.gfm={...I.normal,escape:_(I.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\\/\\/|www\\.)(?:[a-zA-Z0-9\\-]+\\.?)+[^\\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_\'"~()&]+|\\([^)]*\\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_\'"~)]+(?!$))+/,del:/^(~~?)(?=[^\\s~])([\\s\\S]*?[^\\s~])\\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\\n)|(?=[a-zA-Z0-9.!#$%&\'*+\\/=?_`{\\|}~-]+@)|[\\s\\S]*?(?:(?=[\\\\<!\\[`*~_]|\\b_|https?:\\/\\/|ftp:\\/\\/|www\\.|$)|[^ ](?= {2,}\\n)|[^a-zA-Z0-9.!#$%&\'*+\\/=?_`{\\|}~-](?=[a-zA-Z0-9.!#$%&\'*+\\/=?_`{\\|}~-]+@)))/},I.gfm.url=_(I.gfm.url,"i").replace("email",I.gfm._extended_email).getRegex(),I.breaks={...I.gfm,br:_(I.br).replace("{2,}","*").getRegex(),text:_(I.gfm.text).replace("\\\\b_","\\\\b_| {2,}\\\\n").replace(/\\{2,\\}/g,"*").getRegex()};var j,z,H,F,q=class{constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||l,this.options.tokenizer=this.options.tokenizer||new L,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:O.normal,inline:I.normal};this.options.pedantic?(t.block=O.pedantic,t.inline=I.pedantic):this.options.gfm&&(t.block=O.gfm,this.options.breaks?t.inline=I.breaks:t.inline=I.gfm),this.tokenizer.rules=t}static get rules(){return{block:O,inline:I}}static lex(e,t){return new q(t).lex(e)}static lexInline(e,t){return new q(t).inlineTokens(e)}lex(e){let t;for(e=e.replace(/\\r\\n|\\r/g,"\\n"),this.blockTokens(e,this.tokens);t=this.inlineQueue.shift();)this.inlineTokens(t.src,t.tokens);return this.tokens}blockTokens(e,t=[]){let n,r,i,o;for(e=this.options.pedantic?e.replace(/\\t/g,"    ").replace(/^ +$/gm,""):e.replace(/^( *)(\\t+)/gm,((e,t,n)=>t+"    ".repeat(n.length)));e;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some((r=>!!(n=r.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0)))))if(n=this.tokenizer.space(e))e=e.substring(n.raw.length),1===n.raw.length&&t.length>0?t[t.length-1].raw+="\\n":t.push(n);else if(n=this.tokenizer.code(e))e=e.substring(n.raw.length),r=t[t.length-1],!r||"paragraph"!==r.type&&"text"!==r.type?t.push(n):(r.raw+="\\n"+n.raw,r.text+="\\n"+n.text,this.inlineQueue[this.inlineQueue.length-1].src=r.text);else if(n=this.tokenizer.fences(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.heading(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.hr(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.blockquote(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.list(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.html(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.def(e))e=e.substring(n.raw.length),r=t[t.length-1],!r||"paragraph"!==r.type&&"text"!==r.type?this.tokens.links[n.tag]||(this.tokens.links[n.tag]={href:n.href,title:n.title}):(r.raw+="\\n"+n.raw,r.text+="\\n"+n.raw,this.inlineQueue[this.inlineQueue.length-1].src=r.text);else if(n=this.tokenizer.table(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.lheading(e))e=e.substring(n.raw.length),t.push(n);else{if(i=e,this.options.extensions&&this.options.extensions.startBlock){let t=1/0;const n=e.slice(1);let r;this.options.extensions.startBlock.forEach((e=>{r=e.call({lexer:this},n),"number"==typeof r&&r>=0&&(t=Math.min(t,r))})),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(this.state.top&&(n=this.tokenizer.paragraph(i)))r=t[t.length-1],o&&"paragraph"===r.type?(r.raw+="\\n"+n.raw,r.text+="\\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=r.text):t.push(n),o=i.length!==e.length,e=e.substring(n.raw.length);else if(n=this.tokenizer.text(e))e=e.substring(n.raw.length),r=t[t.length-1],r&&"text"===r.type?(r.raw+="\\n"+n.raw,r.text+="\\n"+n.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=r.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,r,i,o,a,s,u=e;if(this.tokens.links){const e=Object.keys(this.tokens.links);if(e.length>0)for(;null!=(o=this.tokenizer.rules.inline.reflinkSearch.exec(u));)e.includes(o[0].slice(o[0].lastIndexOf("[")+1,-1))&&(u=u.slice(0,o.index)+"["+"a".repeat(o[0].length-2)+"]"+u.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;null!=(o=this.tokenizer.rules.inline.blockSkip.exec(u));)u=u.slice(0,o.index)+"["+"a".repeat(o[0].length-2)+"]"+u.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;null!=(o=this.tokenizer.rules.inline.anyPunctuation.exec(u));)u=u.slice(0,o.index)+"++"+u.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;e;)if(a||(s=""),a=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some((r=>!!(n=r.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0)))))if(n=this.tokenizer.escape(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.tag(e))e=e.substring(n.raw.length),r=t[t.length-1],r&&"text"===n.type&&"text"===r.type?(r.raw+=n.raw,r.text+=n.text):t.push(n);else if(n=this.tokenizer.link(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.reflink(e,this.tokens.links))e=e.substring(n.raw.length),r=t[t.length-1],r&&"text"===n.type&&"text"===r.type?(r.raw+=n.raw,r.text+=n.text):t.push(n);else if(n=this.tokenizer.emStrong(e,u,s))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.codespan(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.br(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.del(e))e=e.substring(n.raw.length),t.push(n);else if(n=this.tokenizer.autolink(e,V))e=e.substring(n.raw.length),t.push(n);else if(this.state.inLink||!(n=this.tokenizer.url(e,V))){if(i=e,this.options.extensions&&this.options.extensions.startInline){let t=1/0;const n=e.slice(1);let r;this.options.extensions.startInline.forEach((e=>{r=e.call({lexer:this},n),"number"==typeof r&&r>=0&&(t=Math.min(t,r))})),t<1/0&&t>=0&&(i=e.substring(0,t+1))}if(n=this.tokenizer.inlineText(i,B))e=e.substring(n.raw.length),"_"!==n.raw.slice(-1)&&(s=n.raw.slice(-1)),a=!0,r=t[t.length-1],r&&"text"===r.type?(r.raw+=n.raw,r.text+=n.text):t.push(n);else if(e){const t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}else e=e.substring(n.raw.length),t.push(n);return t}},G=class{constructor(e){this.options=e||l}code(e,t,n){const r=(t||"").match(/\\S*/)[0];if(this.options.highlight){const t=this.options.highlight(e,r);null!=t&&t!==e&&(n=!0,e=t)}return e=e.replace(/\\n$/,"")+"\\n",r?\'<pre><code class="\'+this.options.langPrefix+y(r)+\'">\'+(n?e:y(e,!0))+"</code></pre>\\n":"<pre><code>"+(n?e:y(e,!0))+"</code></pre>\\n"}blockquote(e){return`<blockquote>\\n${e}</blockquote>\\n`}html(e,t){return e}heading(e,t,n,r){if(this.options.headerIds){return`<h${t} id="${this.options.headerPrefix+r.slug(n)}">${e}</h${t}>\\n`}return`<h${t}>${e}</h${t}>\\n`}hr(){return this.options.xhtml?"<hr/>\\n":"<hr>\\n"}list(e,t,n){const r=t?"ol":"ul";return"<"+r+(t&&1!==n?\' start="\'+n+\'"\':"")+">\\n"+e+"</"+r+">\\n"}listitem(e,t,n){return`<li>${e}</li>\\n`}checkbox(e){return"<input "+(e?\'checked="" \':"")+\'disabled="" type="checkbox"\'+(this.options.xhtml?" /":"")+"> "}paragraph(e){return`<p>${e}</p>\\n`}table(e,t){return t&&(t=`<tbody>${t}</tbody>`),"<table>\\n<thead>\\n"+e+"</thead>\\n"+t+"</table>\\n"}tablerow(e){return`<tr>\\n${e}</tr>\\n`}tablecell(e,t){const n=t.header?"th":"td";return(t.align?`<${n} align="${t.align}">`:`<${n}>`)+e+`</${n}>\\n`}strong(e){return`<strong>${e}</strong>`}em(e){return`<em>${e}</em>`}codespan(e){return`<code>${e}</code>`}br(){return this.options.xhtml?"<br/>":"<br>"}del(e){return`<del>${e}</del>`}link(e,t,n){if(null===(e=S(this.options.sanitize,this.options.baseUrl,e)))return n;let r=\'<a href="\'+e+\'"\';return t&&(r+=\' title="\'+t+\'"\'),r+=">"+n+"</a>",r}image(e,t,n){if(null===(e=S(this.options.sanitize,this.options.baseUrl,e)))return n;let r=`<img src="${e}" alt="${n}"`;return t&&(r+=` title="${t}"`),r+=this.options.xhtml?"/>":">",r}text(e){return e}},U=class{strong(e){return e}em(e){return e}codespan(e){return e}del(e){return e}html(e){return e}text(e){return e}link(e,t,n){return""+n}image(e,t,n){return""+n}br(){return""}},$=class{constructor(){this.seen={}}serialize(e){return e.toLowerCase().trim().replace(/<[!\\/a-z].*?>/gi,"").replace(/[\\u2000-\\u206F\\u2E00-\\u2E7F\\\\\'!"#$%&()*+,./:;<=>?@[\\]^`{|}~]/g,"").replace(/\\s/g,"-")}getNextSafeSlug(e,t){let n=e,r=0;if(this.seen.hasOwnProperty(n)){r=this.seen[e];do{r++,n=e+"-"+r}while(this.seen.hasOwnProperty(n))}return t||(this.seen[e]=r,this.seen[n]=0),n}slug(e,t={}){const n=this.serialize(e);return this.getNextSafeSlug(n,t.dryrun)}},W=class{constructor(e){this.options=e||l,this.options.renderer=this.options.renderer||new G,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new U,this.slugger=new $}static parse(e,t){return new W(t).parse(e)}static parseInline(e,t){return new W(t).parseInline(e)}parse(e,t=!0){let n,r,i,o,a,s,u,c,l,h,f,d,p,g,m,v,y,x,w,_="";const k=e.length;for(n=0;n<k;n++)if(h=e[n],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[h.type]&&(w=this.options.extensions.renderers[h.type].call({parser:this},h),!1!==w||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(h.type)))_+=w||"";else switch(h.type){case"space":continue;case"hr":_+=this.renderer.hr();continue;case"heading":_+=this.renderer.heading(this.parseInline(h.tokens),h.depth,b(this.parseInline(h.tokens,this.textRenderer)),this.slugger);continue;case"code":_+=this.renderer.code(h.text,h.lang,!!h.escaped);continue;case"table":for(c="",u="",o=h.header.length,r=0;r<o;r++)u+=this.renderer.tablecell(this.parseInline(h.header[r].tokens),{header:!0,align:h.align[r]});for(c+=this.renderer.tablerow(u),l="",o=h.rows.length,r=0;r<o;r++){for(s=h.rows[r],u="",a=s.length,i=0;i<a;i++)u+=this.renderer.tablecell(this.parseInline(s[i].tokens),{header:!1,align:h.align[i]});l+=this.renderer.tablerow(u)}_+=this.renderer.table(c,l);continue;case"blockquote":l=this.parse(h.tokens),_+=this.renderer.blockquote(l);continue;case"list":for(f=h.ordered,d=h.start,p=h.loose,o=h.items.length,l="",r=0;r<o;r++)m=h.items[r],v=m.checked,y=m.task,g="",m.task&&(x=this.renderer.checkbox(!!v),p?m.tokens.length>0&&"paragraph"===m.tokens[0].type?(m.tokens[0].text=x+" "+m.tokens[0].text,m.tokens[0].tokens&&m.tokens[0].tokens.length>0&&"text"===m.tokens[0].tokens[0].type&&(m.tokens[0].tokens[0].text=x+" "+m.tokens[0].tokens[0].text)):m.tokens.unshift({type:"text",text:x}):g+=x),g+=this.parse(m.tokens,p),l+=this.renderer.listitem(g,y,!!v);_+=this.renderer.list(l,f,d);continue;case"html":_+=this.renderer.html(h.text,h.block);continue;case"paragraph":_+=this.renderer.paragraph(this.parseInline(h.tokens));continue;case"text":for(l=h.tokens?this.parseInline(h.tokens):h.text;n+1<k&&"text"===e[n+1].type;)h=e[++n],l+="\\n"+(h.tokens?this.parseInline(h.tokens):h.text);_+=t?this.renderer.paragraph(l):l;continue;default:{const e=\'Token with "\'+h.type+\'" type was not found.\';if(this.options.silent)return console.error(e),"";throw new Error(e)}}return _}parseInline(e,t){t=t||this.renderer;let n,r,i,o="";const a=e.length;for(n=0;n<a;n++)if(r=e[n],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[r.type]&&(i=this.options.extensions.renderers[r.type].call({parser:this},r),!1!==i||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(r.type)))o+=i||"";else switch(r.type){case"escape":case"text":o+=t.text(r.text);break;case"html":o+=t.html(r.text);break;case"link":o+=t.link(r.href,r.title,this.parseInline(r.tokens,t));break;case"image":o+=t.image(r.href,r.title,r.text);break;case"strong":o+=t.strong(this.parseInline(r.tokens,t));break;case"em":o+=t.em(this.parseInline(r.tokens,t));break;case"codespan":o+=t.codespan(r.text);break;case"br":o+=t.br();break;case"del":o+=t.del(this.parseInline(r.tokens,t));break;default:{const e=\'Token with "\'+r.type+\'" type was not found.\';if(this.options.silent)return console.error(e),"";throw new Error(e)}}return o}},Z=class{constructor(e){this.options=e||l}preprocess(e){return e}postprocess(e){return e}};Z.passThroughHooks=new Set(["preprocess","postprocess"]);var X=class{constructor(...e){a(this,j),a(this,H),this.defaults={async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,hooks:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1},this.options=this.setOptions,this.parse=s(this,j,z).call(this,q.lex,W.parse),this.parseInline=s(this,j,z).call(this,q.lexInline,W.parseInline),this.Parser=W,this.parser=W.parse,this.Renderer=G,this.TextRenderer=U,this.Lexer=q,this.lexer=q.lex,this.Tokenizer=L,this.Slugger=$,this.Hooks=Z,this.use(...e)}walkTokens(e,t){let n=[];for(const r of e)switch(n=n.concat(t.call(this,r)),r.type){case"table":for(const e of r.header)n=n.concat(this.walkTokens(e.tokens,t));for(const e of r.rows)for(const r of e)n=n.concat(this.walkTokens(r.tokens,t));break;case"list":n=n.concat(this.walkTokens(r.items,t));break;default:this.defaults.extensions&&this.defaults.extensions.childTokens&&this.defaults.extensions.childTokens[r.type]?this.defaults.extensions.childTokens[r.type].forEach((e=>{n=n.concat(this.walkTokens(r[e],t))})):r.tokens&&(n=n.concat(this.walkTokens(r.tokens,t)))}return n}use(...e){const t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach((e=>{const n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach((e=>{if(!e.name)throw new Error("extension name required");if("renderer"in e){const n=t.renderers[e.name];t.renderers[e.name]=n?function(...t){let r=e.renderer.apply(this,t);return!1===r&&(r=n.apply(this,t)),r}:e.renderer}if("tokenizer"in e){if(!e.level||"block"!==e.level&&"inline"!==e.level)throw new Error("extension level must be \'block\' or \'inline\'");t[e.level]?t[e.level].unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&("block"===e.level?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:"inline"===e.level&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}"childTokens"in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)})),n.extensions=t),e.renderer){const t=this.defaults.renderer||new G(this.defaults);for(const n in e.renderer){const r=t[n];t[n]=(...i)=>{let o=e.renderer[n].apply(t,i);return!1===o&&(o=r.apply(t,i)),o}}n.renderer=t}if(e.tokenizer){const t=this.defaults.tokenizer||new L(this.defaults);for(const n in e.tokenizer){const r=t[n];t[n]=(...i)=>{let o=e.tokenizer[n].apply(t,i);return!1===o&&(o=r.apply(t,i)),o}}n.tokenizer=t}if(e.hooks){const t=this.defaults.hooks||new Z;for(const n in e.hooks){const r=t[n];Z.passThroughHooks.has(n)?t[n]=i=>{if(this.defaults.async)return Promise.resolve(e.hooks[n].call(t,i)).then((e=>r.call(t,e)));const o=e.hooks[n].call(t,i);return r.call(t,o)}:t[n]=(...i)=>{let o=e.hooks[n].apply(t,i);return!1===o&&(o=r.apply(t,i)),o}}n.hooks=t}if(e.walkTokens){const t=this.defaults.walkTokens;n.walkTokens=function(n){let r=[];return r.push(e.walkTokens.call(this,n)),t&&(r=r.concat(t.call(this,n))),r}}this.defaults={...this.defaults,...n}})),this}setOptions(e){return this.defaults={...this.defaults,...e},this}};j=new WeakSet,z=function(e,t){return(n,r,i)=>{"function"==typeof r&&(i=r,r=null);const o={...r},a={...this.defaults,...o},u=s(this,H,F).call(this,!!a.silent,!!a.async,i);if(null==n)return u(new Error("marked(): input parameter is undefined or null"));if("string"!=typeof n)return u(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));if(function(e,t){e&&!e.silent&&(t&&console.warn("marked(): callback is deprecated since version 5.0.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/using_pro#async"),(e.sanitize||e.sanitizer)&&console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options"),(e.highlight||"language-"!==e.langPrefix)&&console.warn("marked(): highlight and langPrefix parameters are deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-highlight."),e.mangle&&console.warn("marked(): mangle parameter is enabled by default, but is deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install https://www.npmjs.com/package/marked-mangle, or disable by setting `{mangle: false}`."),e.baseUrl&&console.warn("marked(): baseUrl parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-base-url."),e.smartypants&&console.warn("marked(): smartypants parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-smartypants."),e.xhtml&&console.warn("marked(): xhtml parameter is deprecated since version 5.0.0, should not be used and will be removed in the future. Instead use https://www.npmjs.com/package/marked-xhtml."),(e.headerIds||e.headerPrefix)&&console.warn("marked(): headerIds and headerPrefix parameters enabled by default, but are deprecated since version 5.0.0, and will be removed in the future. To clear this warning, install  https://www.npmjs.com/package/marked-gfm-heading-id, or disable by setting `{headerIds: false}`."))}(a,i),a.hooks&&(a.hooks.options=a),i){const r=a.highlight;let o;try{a.hooks&&(n=a.hooks.preprocess(n)),o=e(n,a)}catch(e){return u(e)}const s=e=>{let n;if(!e)try{a.walkTokens&&this.walkTokens(o,a.walkTokens),n=t(o,a),a.hooks&&(n=a.hooks.postprocess(n))}catch(t){e=t}return a.highlight=r,e?u(e):i(null,n)};if(!r||r.length<3)return s();if(delete a.highlight,!o.length)return s();let c=0;return this.walkTokens(o,(e=>{"code"===e.type&&(c++,setTimeout((()=>{r(e.text,e.lang,((t,n)=>{if(t)return s(t);null!=n&&n!==e.text&&(e.text=n,e.escaped=!0),c--,0===c&&s()}))}),0))})),void(0===c&&s())}if(a.async)return Promise.resolve(a.hooks?a.hooks.preprocess(n):n).then((t=>e(t,a))).then((e=>a.walkTokens?Promise.all(this.walkTokens(e,a.walkTokens)).then((()=>e)):e)).then((e=>t(e,a))).then((e=>a.hooks?a.hooks.postprocess(e):e)).catch(u);try{a.hooks&&(n=a.hooks.preprocess(n));const r=e(n,a);a.walkTokens&&this.walkTokens(r,a.walkTokens);let i=t(r,a);return a.hooks&&(i=a.hooks.postprocess(i)),i}catch(e){return u(e)}}},H=new WeakSet,F=function(e,t,n){return r=>{if(r.message+="\\nPlease report this to https://github.com/markedjs/marked.",e){const e="<p>An error occurred:</p><pre>"+y(r.message+"",!0)+"</pre>";return t?Promise.resolve(e):n?void n(null,e):e}if(t)return Promise.reject(r);if(!n)throw r;n(r)}};var Y=new X;function K(e,t,n){return Y.parse(e,t,n)}K.options=K.setOptions=function(e){return Y.setOptions(e),K.defaults=Y.defaults,h(K.defaults),K},K.getDefaults=c,K.defaults=l,K.use=function(...e){return Y.use(...e),K.defaults=Y.defaults,h(K.defaults),K},K.walkTokens=function(e,t){return Y.walkTokens(e,t)},K.parseInline=Y.parseInline,K.Parser=W,K.parser=W.parse,K.Renderer=G,K.TextRenderer=U,K.Lexer=q,K.lexer=q.lex,K.Tokenizer=L,K.Slugger=$,K.Hooks=Z,K.parse=K;var J=K.options,Q=K.setOptions,ee=K.use,te=K.walkTokens,ne=K.parseInline,re=K,ie=W.parse,oe=q.lex}},__webpack_module_cache__={};function __webpack_require__(e){var t=__webpack_module_cache__[e];if(void 0!==t)return t.exports;var n=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e].call(n.exports,n,n.exports,__webpack_require__),n.exports}var __webpack_exports__=__webpack_require__(5717)})();\n//# sourceMappingURL=obsidian-editor.js.map';
var KITYMINDER_CORE_CSS = `.kityminder-container .km-view {
    font-family: "STHeitiSC-Light", "STHeiti", "Hei", "Heiti SC", "Microsoft Yahei", Arial, sans-serif;
    -webkit-user-select: none;
    user-select: none;
    position:  relative;
}

.kityminder-container .km-view .km-receiver {
    position: absolute;
    left: -99999px;
    top: -99999px;
    width: 20px;
    height: 20px;
    outline: none;
    margin: 0;
}

.kityminder-container .km-view image {
    cursor: zoom-in;
}

.kityminder-container .km-image-viewer {
    position: fixed;
    z-index: 99999;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .75);
}

.kityminder-container .km-image-viewer .km-image-viewer-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    white-space: nowrap;
    overflow: auto;
}

.kityminder-container .km-image-viewer .km-image-viewer-container::before {
    content: '';
    display: inline-block;
    height: 100%;
    width: 0;
    font-size: 0;
    vertical-align: middle;
}

.kityminder-container .km-image-viewer .km-image-viewer-container img {
    cursor: zoom-out;
    vertical-align: middle;
}

.kityminder-container .km-image-viewer .km-image-viewer-container img.limited {
    cursor: zoom-in;
    max-width: 100%;
    max-height: 100%;
}

.kityminder-container .km-image-viewer .km-image-viewer-toolbar {
    z-index: 1;
    background: rgba(0, 0, 0, .75);
    text-align: right;
    transition: all .25s;
}

.kityminder-container .km-image-viewer .km-image-viewer-toolbar.hidden {
    transform: translate(0, -100%);
    opacity: 0;
}

.kityminder-container .km-image-viewer .km-image-viewer-btn {
    cursor: pointer;
    outline: 0;
    border: 0;
    width: 44px;
    height: 44px;
    background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjY0IiBoZWlnaHQ9Ijg4IiB2aWV3Qm94PSIwIDAgMjY0IDg4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5kZWZhdWx0LXNraW4gMjwvdGl0bGU+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Zz48cGF0aCBkPSJNNjcuMDAyIDU5LjV2My43NjhjLTYuMzA3Ljg0LTkuMTg0IDUuNzUtMTAuMDAyIDkuNzMyIDIuMjItMi44MyA1LjU2NC01LjA5OCAxMC4wMDItNS4wOThWNzEuNUw3MyA2NS41ODUgNjcuMDAyIDU5LjV6IiBpZD0iU2hhcGUiIGZpbGw9IiNmZmYiLz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJNMTMgMjl2LTVoMnYzaDN2MmgtNXpNMTMgMTVoNXYyaC0zdjNoLTJ2LTV6TTMxIDE1djVoLTJ2LTNoLTN2LTJoNXpNMzEgMjloLTV2LTJoM3YtM2gydjV6IiBpZD0iU2hhcGUiLz48L2c+PGcgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTYyIDI0djVoLTJ2LTNoLTN2LTJoNXpNNjIgMjBoLTV2LTJoM3YtM2gydjV6TTcwIDIwdi01aDJ2M2gzdjJoLTV6TTcwIDI0aDV2MmgtM3YzaC0ydi01eiIvPjwvZz48cGF0aCBkPSJNMjAuNTg2IDY2bC01LjY1Ni01LjY1NiAxLjQxNC0xLjQxNEwyMiA2NC41ODZsNS42NTYtNS42NTYgMS40MTQgMS40MTRMMjMuNDE0IDY2bDUuNjU2IDUuNjU2LTEuNDE0IDEuNDE0TDIyIDY3LjQxNGwtNS42NTYgNS42NTYtMS40MTQtMS40MTRMMjAuNTg2IDY2eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMTEuNzg1IDY1LjAzTDExMCA2My41bDMtMy41aC0xMHYtMmgxMGwtMy0zLjUgMS43ODUtMS40NjhMMTE3IDU5bC01LjIxNSA2LjAzeiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNTIuMjE1IDY1LjAzTDE1NCA2My41bC0zLTMuNWgxMHYtMmgtMTBsMy0zLjUtMS43ODUtMS40NjhMMTQ3IDU5bDUuMjE1IDYuMDN6IiBmaWxsPSIjZmZmIi8+PGc+PHBhdGggaWQ9IlJlY3RhbmdsZS0xMSIgZmlsbD0iI2ZmZiIgZD0iTTE2MC45NTcgMjguNTQzbC0zLjI1LTMuMjUtMS40MTMgMS40MTQgMy4yNSAzLjI1eiIvPjxwYXRoIGQ9Ik0xNTIuNSAyN2MzLjAzOCAwIDUuNS0yLjQ2MiA1LjUtNS41cy0yLjQ2Mi01LjUtNS41LTUuNS01LjUgMi40NjItNS41IDUuNSAyLjQ2MiA1LjUgNS41IDUuNXoiIGlkPSJPdmFsLTEiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTUwIDIxaDV2MWgtNXoiLz48L2c+PGc+PHBhdGggZD0iTTExNi45NTcgMjguNTQzbC0xLjQxNCAxLjQxNC0zLjI1LTMuMjUgMS40MTQtMS40MTQgMy4yNSAzLjI1eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMDguNSAyN2MzLjAzOCAwIDUuNS0yLjQ2MiA1LjUtNS41cy0yLjQ2Mi01LjUtNS41LTUuNS01LjUgMi40NjItNS41IDUuNSAyLjQ2MiA1LjUgNS41IDUuNXoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTA2IDIxaDV2MWgtNXoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTA5LjA0MyAxOS4wMDhsLS4wODUgNS0xLS4wMTcuMDg1LTV6Ii8+PC9nPjwvZz48L2c+PC9zdmc+);
}

.kityminder-container .km-image-viewer .km-image-viewer-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

.kityminder-container .km-image-viewer .km-image-viewer-close {
    background-position: 0 -44px;
}
/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */
.kityminder-container {
  font-family: sans-serif;
  -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
}
.kityminder-container {
  margin: 0;
}
.kityminder-container article,
.kityminder-container aside,
.kityminder-container details,
.kityminder-container figcaption,
.kityminder-container figure,
.kityminder-container footer,
.kityminder-container header,
.kityminder-container hgroup,
.kityminder-container main,
.kityminder-container menu,
.kityminder-container nav,
.kityminder-container section,
.kityminder-container summary {
  display: block;
}
.kityminder-container audio,
.kityminder-container canvas,
.kityminder-container progress,
.kityminder-container video {
  display: inline-block;
  vertical-align: baseline;
}
.kityminder-container audio:not([controls]) {
  display: none;
  height: 0;
}
.kityminder-container [hidden],
.kityminder-container template {
  display: none;
}
.kityminder-container a {
  background-color: transparent;
}
.kityminder-container a:active,
.kityminder-container a:hover {
  outline: 0;
}
.kityminder-container abbr[title] {
  border-bottom: 1px dotted;
}
.kityminder-container b,
.kityminder-container strong {
  font-weight: bold;
}
.kityminder-container dfn {
  font-style: italic;
}
.kityminder-container h1 {
  margin: .67em 0;
  font-size: 2em;
}
.kityminder-container mark {
  color: #000;
  background: #ff0;
}
.kityminder-container small {
  font-size: 80%;
}
.kityminder-container sub,
.kityminder-container sup {
  position: relative;
  font-size: 75%;
  line-height: 0;
  vertical-align: baseline;
}
.kityminder-container sup {
  top: -.5em;
}
.kityminder-container sub {
  bottom: -.25em;
}
.kityminder-container img {
  border: 0;
}
.kityminder-container svg:not(:root) {
  overflow: hidden;
}
.kityminder-container figure {
  margin: 1em 40px;
}
.kityminder-container hr {
  height: 0;
  -webkit-box-sizing: content-box;
     -moz-box-sizing: content-box;
          box-sizing: content-box;
}
.kityminder-container pre {
  overflow: auto;
}
.kityminder-container code,
.kityminder-container kbd,
.kityminder-container pre,
.kityminder-container samp {
  font-family: monospace, monospace;
  font-size: 1em;
}
.kityminder-container button,
.kityminder-container input,
.kityminder-container optgroup,
.kityminder-container select,
.kityminder-container textarea {
  margin: 0;
  font: inherit;
  color: inherit;
}
.kityminder-container button {
  overflow: visible;
}
.kityminder-container button,
.kityminder-container select {
  text-transform: none;
}
.kityminder-container button,
.kityminder-container input[type="button"],
.kityminder-container input[type="reset"],
.kityminder-container input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
}
.kityminder-container button[disabled],
.kityminder-container input[disabled] {
  cursor: default;
}
.kityminder-container button::-moz-focus-inner,
.kityminder-container input::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.kityminder-container input {
  line-height: normal;
}
.kityminder-container input[type="checkbox"],
.kityminder-container input[type="radio"] {
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
  padding: 0;
}
.kityminder-container input[type="number"]::-webkit-inner-spin-button,
.kityminder-container input[type="number"]::-webkit-outer-spin-button {
  height: auto;
}
.kityminder-container input[type="search"] {
  -webkit-box-sizing: content-box;
     -moz-box-sizing: content-box;
          box-sizing: content-box;
  -webkit-appearance: textfield;
}
.kityminder-container input[type="search"]::-webkit-search-cancel-button,
.kityminder-container input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}
.kityminder-container fieldset {
  padding: .35em .625em .75em;
  margin: 0 2px;
  border: 1px solid #c0c0c0;
}
.kityminder-container legend {
  padding: 0;
  border: 0;
}
.kityminder-container textarea {
  overflow: auto;
}
.kityminder-container optgroup {
  font-weight: bold;
}
.kityminder-container table {
  border-spacing: 0;
  border-collapse: collapse;
}
.kityminder-container td,
.kityminder-container th {
  padding: 0;
}
/*! Source: https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css */
@media print {
  .kityminder-container *,
  .kityminder-container *:before,
  .kityminder-container *:after {
    color: #000 !important;
    text-shadow: none !important;
    background: transparent !important;
    -webkit-box-shadow: none !important;
            box-shadow: none !important;
  }
  .kityminder-container a,
  .kityminder-container a:visited {
    text-decoration: underline;
  }
  .kityminder-container a[href]:after {
    content: " (" attr(href) ")";
  }
  .kityminder-container abbr[title]:after {
    content: " (" attr(title) ")";
  }
  .kityminder-container a[href^="#"]:after,
  .kityminder-container a[href^="javascript:"]:after {
    content: "";
  }
  .kityminder-container pre,
  .kityminder-container blockquote {
    border: 1px solid #999;

    page-break-inside: avoid;
  }
  .kityminder-container thead {
    display: table-header-group;
  }
  .kityminder-container tr,
  .kityminder-container img {
    page-break-inside: avoid;
  }
  .kityminder-container img {
    max-width: 100% !important;
  }
  .kityminder-container p,
  .kityminder-container h2,
  .kityminder-container h3 {
    orphans: 3;
    widows: 3;
  }
  .kityminder-container h2,
  .kityminder-container h3 {
    page-break-after: avoid;
  }
  .kityminder-container .navbar {
    display: none;
  }
  .kityminder-container .btn > .caret,
  .kityminder-container .dropup > .btn > .caret {
    border-top-color: #000 !important;
  }
  .kityminder-container .label {
    border: 1px solid #000;
  }
  .kityminder-container .table {
    border-collapse: collapse !important;
  }
  .kityminder-container .table td,
  .kityminder-container .table th {
    background-color: #fff !important;
  }
  .kityminder-container .table-bordered th,
  .kityminder-container .table-bordered td {
    border: 1px solid #ddd !important;
  }
}
@font-face {
  font-family: 'Glyphicons Halflings';

  src: url(/fonts/glyphicons-halflings-regular..eot);
  src: url(/fonts/glyphicons-halflings-regular..eot?#iefix) format('embedded-opentype'), url(/fonts/glyphicons-halflings-regular..woff2) format('woff2'), url(/fonts/glyphicons-halflings-regular..woff) format('woff'), url(/fonts/glyphicons-halflings-regular..ttf) format('truetype'), url(/fonts/glyphicons-halflings-regular..svg#glyphicons_halflingsregular) format('svg');
}
.kityminder-container .glyphicon {
  position: relative;
  top: 1px;
  display: inline-block;
  font-family: 'Glyphicons Halflings';
  font-style: normal;
  font-weight: normal;
  line-height: 1;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.kityminder-container .glyphicon-asterisk:before {
  content: "\\002a";
}
.kityminder-container .glyphicon-plus:before {
  content: "\\002b";
}
.kityminder-container .glyphicon-euro:before,
.kityminder-container .glyphicon-eur:before {
  content: "\\20ac";
}
.kityminder-container .glyphicon-minus:before {
  content: "\\2212";
}
.kityminder-container .glyphicon-cloud:before {
  content: "\\2601";
}
.kityminder-container .glyphicon-envelope:before {
  content: "\\2709";
}
.kityminder-container .glyphicon-pencil:before {
  content: "\\270f";
}
.kityminder-container .glyphicon-glass:before {
  content: "\\e001";
}
.kityminder-container .glyphicon-music:before {
  content: "\\e002";
}
.kityminder-container .glyphicon-search:before {
  content: "\\e003";
}
.kityminder-container .glyphicon-heart:before {
  content: "\\e005";
}
.kityminder-container .glyphicon-star:before {
  content: "\\e006";
}
.kityminder-container .glyphicon-star-empty:before {
  content: "\\e007";
}
.kityminder-container .glyphicon-user:before {
  content: "\\e008";
}
.kityminder-container .glyphicon-film:before {
  content: "\\e009";
}
.kityminder-container .glyphicon-th-large:before {
  content: "\\e010";
}
.kityminder-container .glyphicon-th:before {
  content: "\\e011";
}
.kityminder-container .glyphicon-th-list:before {
  content: "\\e012";
}
.kityminder-container .glyphicon-ok:before {
  content: "\\e013";
}
.kityminder-container .glyphicon-remove:before {
  content: "\\e014";
}
.kityminder-container .glyphicon-zoom-in:before {
  content: "\\e015";
}
.kityminder-container .glyphicon-zoom-out:before {
  content: "\\e016";
}
.kityminder-container .glyphicon-off:before {
  content: "\\e017";
}
.kityminder-container .glyphicon-signal:before {
  content: "\\e018";
}
.kityminder-container .glyphicon-cog:before {
  content: "\\e019";
}
.kityminder-container .glyphicon-trash:before {
  content: "\\e020";
}
.kityminder-container .glyphicon-home:before {
  content: "\\e021";
}
.kityminder-container .glyphicon-file:before {
  content: "\\e022";
}
.kityminder-container .glyphicon-time:before {
  content: "\\e023";
}
.kityminder-container .glyphicon-road:before {
  content: "\\e024";
}
.kityminder-container .glyphicon-download-alt:before {
  content: "\\e025";
}
.kityminder-container .glyphicon-download:before {
  content: "\\e026";
}
.kityminder-container .glyphicon-upload:before {
  content: "\\e027";
}
.kityminder-container .glyphicon-inbox:before {
  content: "\\e028";
}
.kityminder-container .glyphicon-play-circle:before {
  content: "\\e029";
}
.kityminder-container .glyphicon-repeat:before {
  content: "\\e030";
}
.kityminder-container .glyphicon-refresh:before {
  content: "\\e031";
}
.kityminder-container .glyphicon-list-alt:before {
  content: "\\e032";
}
.kityminder-container .glyphicon-lock:before {
  content: "\\e033";
}
.kityminder-container .glyphicon-flag:before {
  content: "\\e034";
}
.kityminder-container .glyphicon-headphones:before {
  content: "\\e035";
}
.kityminder-container .glyphicon-volume-off:before {
  content: "\\e036";
}
.kityminder-container .glyphicon-volume-down:before {
  content: "\\e037";
}
.kityminder-container .glyphicon-volume-up:before {
  content: "\\e038";
}
.kityminder-container .glyphicon-qrcode:before {
  content: "\\e039";
}
.kityminder-container .glyphicon-barcode:before {
  content: "\\e040";
}
.kityminder-container .glyphicon-tag:before {
  content: "\\e041";
}
.kityminder-container .glyphicon-tags:before {
  content: "\\e042";
}
.kityminder-container .glyphicon-book:before {
  content: "\\e043";
}
.kityminder-container .glyphicon-bookmark:before {
  content: "\\e044";
}
.kityminder-container .glyphicon-print:before {
  content: "\\e045";
}
.kityminder-container .glyphicon-camera:before {
  content: "\\e046";
}
.kityminder-container .glyphicon-font:before {
  content: "\\e047";
}
.kityminder-container .glyphicon-bold:before {
  content: "\\e048";
}
.kityminder-container .glyphicon-italic:before {
  content: "\\e049";
}
.kityminder-container .glyphicon-text-height:before {
  content: "\\e050";
}
.kityminder-container .glyphicon-text-width:before {
  content: "\\e051";
}
.kityminder-container .glyphicon-align-left:before {
  content: "\\e052";
}
.kityminder-container .glyphicon-align-center:before {
  content: "\\e053";
}
.kityminder-container .glyphicon-align-right:before {
  content: "\\e054";
}
.kityminder-container .glyphicon-align-justify:before {
  content: "\\e055";
}
.kityminder-container .glyphicon-list:before {
  content: "\\e056";
}
.kityminder-container .glyphicon-indent-left:before {
  content: "\\e057";
}
.kityminder-container .glyphicon-indent-right:before {
  content: "\\e058";
}
.kityminder-container .glyphicon-facetime-video:before {
  content: "\\e059";
}
.kityminder-container .glyphicon-picture:before {
  content: "\\e060";
}
.kityminder-container .glyphicon-map-marker:before {
  content: "\\e062";
}
.kityminder-container .glyphicon-adjust:before {
  content: "\\e063";
}
.kityminder-container .glyphicon-tint:before {
  content: "\\e064";
}
.kityminder-container .glyphicon-edit:before {
  content: "\\e065";
}
.kityminder-container .glyphicon-share:before {
  content: "\\e066";
}
.kityminder-container .glyphicon-check:before {
  content: "\\e067";
}
.kityminder-container .glyphicon-move:before {
  content: "\\e068";
}
.kityminder-container .glyphicon-step-backward:before {
  content: "\\e069";
}
.kityminder-container .glyphicon-fast-backward:before {
  content: "\\e070";
}
.kityminder-container .glyphicon-backward:before {
  content: "\\e071";
}
.kityminder-container .glyphicon-play:before {
  content: "\\e072";
}
.kityminder-container .glyphicon-pause:before {
  content: "\\e073";
}
.kityminder-container .glyphicon-stop:before {
  content: "\\e074";
}
.kityminder-container .glyphicon-forward:before {
  content: "\\e075";
}
.kityminder-container .glyphicon-fast-forward:before {
  content: "\\e076";
}
.kityminder-container .glyphicon-step-forward:before {
  content: "\\e077";
}
.kityminder-container .glyphicon-eject:before {
  content: "\\e078";
}
.kityminder-container .glyphicon-chevron-left:before {
  content: "\\e079";
}
.kityminder-container .glyphicon-chevron-right:before {
  content: "\\e080";
}
.kityminder-container .glyphicon-plus-sign:before {
  content: "\\e081";
}
.kityminder-container .glyphicon-minus-sign:before {
  content: "\\e082";
}
.kityminder-container .glyphicon-remove-sign:before {
  content: "\\e083";
}
.kityminder-container .glyphicon-ok-sign:before {
  content: "\\e084";
}
.kityminder-container .glyphicon-question-sign:before {
  content: "\\e085";
}
.kityminder-container .glyphicon-info-sign:before {
  content: "\\e086";
}
.kityminder-container .glyphicon-screenshot:before {
  content: "\\e087";
}
.kityminder-container .glyphicon-remove-circle:before {
  content: "\\e088";
}
.kityminder-container .glyphicon-ok-circle:before {
  content: "\\e089";
}
.kityminder-container .glyphicon-ban-circle:before {
  content: "\\e090";
}
.kityminder-container .glyphicon-arrow-left:before {
  content: "\\e091";
}
.kityminder-container .glyphicon-arrow-right:before {
  content: "\\e092";
}
.kityminder-container .glyphicon-arrow-up:before {
  content: "\\e093";
}
.kityminder-container .glyphicon-arrow-down:before {
  content: "\\e094";
}
.kityminder-container .glyphicon-share-alt:before {
  content: "\\e095";
}
.kityminder-container .glyphicon-resize-full:before {
  content: "\\e096";
}
.kityminder-container .glyphicon-resize-small:before {
  content: "\\e097";
}
.kityminder-container .glyphicon-exclamation-sign:before {
  content: "\\e101";
}
.kityminder-container .glyphicon-gift:before {
  content: "\\e102";
}
.kityminder-container .glyphicon-leaf:before {
  content: "\\e103";
}
.kityminder-container .glyphicon-fire:before {
  content: "\\e104";
}
.kityminder-container .glyphicon-eye-open:before {
  content: "\\e105";
}
.kityminder-container .glyphicon-eye-close:before {
  content: "\\e106";
}
.kityminder-container .glyphicon-warning-sign:before {
  content: "\\e107";
}
.kityminder-container .glyphicon-plane:before {
  content: "\\e108";
}
.kityminder-container .glyphicon-calendar:before {
  content: "\\e109";
}
.kityminder-container .glyphicon-random:before {
  content: "\\e110";
}
.kityminder-container .glyphicon-comment:before {
  content: "\\e111";
}
.kityminder-container .glyphicon-magnet:before {
  content: "\\e112";
}
.kityminder-container .glyphicon-chevron-up:before {
  content: "\\e113";
}
.kityminder-container .glyphicon-chevron-down:before {
  content: "\\e114";
}
.kityminder-container .glyphicon-retweet:before {
  content: "\\e115";
}
.kityminder-container .glyphicon-shopping-cart:before {
  content: "\\e116";
}
.kityminder-container .glyphicon-folder-close:before {
  content: "\\e117";
}
.kityminder-container .glyphicon-folder-open:before {
  content: "\\e118";
}
.kityminder-container .glyphicon-resize-vertical:before {
  content: "\\e119";
}
.kityminder-container .glyphicon-resize-horizontal:before {
  content: "\\e120";
}
.kityminder-container .glyphicon-hdd:before {
  content: "\\e121";
}
.kityminder-container .glyphicon-bullhorn:before {
  content: "\\e122";
}
.kityminder-container .glyphicon-bell:before {
  content: "\\e123";
}
.kityminder-container .glyphicon-certificate:before {
  content: "\\e124";
}
.kityminder-container .glyphicon-thumbs-up:before {
  content: "\\e125";
}
.kityminder-container .glyphicon-thumbs-down:before {
  content: "\\e126";
}
.kityminder-container .glyphicon-hand-right:before {
  content: "\\e127";
}
.kityminder-container .glyphicon-hand-left:before {
  content: "\\e128";
}
.kityminder-container .glyphicon-hand-up:before {
  content: "\\e129";
}
.kityminder-container .glyphicon-hand-down:before {
  content: "\\e130";
}
.kityminder-container .glyphicon-circle-arrow-right:before {
  content: "\\e131";
}
.kityminder-container .glyphicon-circle-arrow-left:before {
  content: "\\e132";
}
.kityminder-container .glyphicon-circle-arrow-up:before {
  content: "\\e133";
}
.kityminder-container .glyphicon-circle-arrow-down:before {
  content: "\\e134";
}
.kityminder-container .glyphicon-globe:before {
  content: "\\e135";
}
.kityminder-container .glyphicon-wrench:before {
  content: "\\e136";
}
.kityminder-container .glyphicon-tasks:before {
  content: "\\e137";
}
.kityminder-container .glyphicon-filter:before {
  content: "\\e138";
}
.kityminder-container .glyphicon-briefcase:before {
  content: "\\e139";
}
.kityminder-container .glyphicon-fullscreen:before {
  content: "\\e140";
}
.kityminder-container .glyphicon-dashboard:before {
  content: "\\e141";
}
.kityminder-container .glyphicon-paperclip:before {
  content: "\\e142";
}
.kityminder-container .glyphicon-heart-empty:before {
  content: "\\e143";
}
.kityminder-container .glyphicon-link:before {
  content: "\\e144";
}
.kityminder-container .glyphicon-phone:before {
  content: "\\e145";
}
.kityminder-container .glyphicon-pushpin:before {
  content: "\\e146";
}
.kityminder-container .glyphicon-usd:before {
  content: "\\e148";
}
.kityminder-container .glyphicon-gbp:before {
  content: "\\e149";
}
.kityminder-container .glyphicon-sort:before {
  content: "\\e150";
}
.kityminder-container .glyphicon-sort-by-alphabet:before {
  content: "\\e151";
}
.kityminder-container .glyphicon-sort-by-alphabet-alt:before {
  content: "\\e152";
}
.kityminder-container .glyphicon-sort-by-order:before {
  content: "\\e153";
}
.kityminder-container .glyphicon-sort-by-order-alt:before {
  content: "\\e154";
}
.kityminder-container .glyphicon-sort-by-attributes:before {
  content: "\\e155";
}
.kityminder-container .glyphicon-sort-by-attributes-alt:before {
  content: "\\e156";
}
.kityminder-container .glyphicon-unchecked:before {
  content: "\\e157";
}
.kityminder-container .glyphicon-expand:before {
  content: "\\e158";
}
.kityminder-container .glyphicon-collapse-down:before {
  content: "\\e159";
}
.kityminder-container .glyphicon-collapse-up:before {
  content: "\\e160";
}
.kityminder-container .glyphicon-log-in:before {
  content: "\\e161";
}
.kityminder-container .glyphicon-flash:before {
  content: "\\e162";
}
.kityminder-container .glyphicon-log-out:before {
  content: "\\e163";
}
.kityminder-container .glyphicon-new-window:before {
  content: "\\e164";
}
.kityminder-container .glyphicon-record:before {
  content: "\\e165";
}
.kityminder-container .glyphicon-save:before {
  content: "\\e166";
}
.kityminder-container .glyphicon-open:before {
  content: "\\e167";
}
.kityminder-container .glyphicon-saved:before {
  content: "\\e168";
}
.kityminder-container .glyphicon-import:before {
  content: "\\e169";
}
.kityminder-container .glyphicon-export:before {
  content: "\\e170";
}
.kityminder-container .glyphicon-send:before {
  content: "\\e171";
}
.kityminder-container .glyphicon-floppy-disk:before {
  content: "\\e172";
}
.kityminder-container .glyphicon-floppy-saved:before {
  content: "\\e173";
}
.kityminder-container .glyphicon-floppy-remove:before {
  content: "\\e174";
}
.kityminder-container .glyphicon-floppy-save:before {
  content: "\\e175";
}
.kityminder-container .glyphicon-floppy-open:before {
  content: "\\e176";
}
.kityminder-container .glyphicon-credit-card:before {
  content: "\\e177";
}
.kityminder-container .glyphicon-transfer:before {
  content: "\\e178";
}
.kityminder-container .glyphicon-cutlery:before {
  content: "\\e179";
}
.kityminder-container .glyphicon-header:before {
  content: "\\e180";
}
.kityminder-container .glyphicon-compressed:before {
  content: "\\e181";
}
.kityminder-container .glyphicon-earphone:before {
  content: "\\e182";
}
.kityminder-container .glyphicon-phone-alt:before {
  content: "\\e183";
}
.kityminder-container .glyphicon-tower:before {
  content: "\\e184";
}
.kityminder-container .glyphicon-stats:before {
  content: "\\e185";
}
.kityminder-container .glyphicon-sd-video:before {
  content: "\\e186";
}
.kityminder-container .glyphicon-hd-video:before {
  content: "\\e187";
}
.kityminder-container .glyphicon-subtitles:before {
  content: "\\e188";
}
.kityminder-container .glyphicon-sound-stereo:before {
  content: "\\e189";
}
.kityminder-container .glyphicon-sound-dolby:before {
  content: "\\e190";
}
.kityminder-container .glyphicon-sound-5-1:before {
  content: "\\e191";
}
.kityminder-container .glyphicon-sound-6-1:before {
  content: "\\e192";
}
.kityminder-container .glyphicon-sound-7-1:before {
  content: "\\e193";
}
.kityminder-container .glyphicon-copyright-mark:before {
  content: "\\e194";
}
.kityminder-container .glyphicon-registration-mark:before {
  content: "\\e195";
}
.kityminder-container .glyphicon-cloud-download:before {
  content: "\\e197";
}
.kityminder-container .glyphicon-cloud-upload:before {
  content: "\\e198";
}
.kityminder-container .glyphicon-tree-conifer:before {
  content: "\\e199";
}
.kityminder-container .glyphicon-tree-deciduous:before {
  content: "\\e200";
}
.kityminder-container .glyphicon-cd:before {
  content: "\\e201";
}
.kityminder-container .glyphicon-save-file:before {
  content: "\\e202";
}
.kityminder-container .glyphicon-open-file:before {
  content: "\\e203";
}
.kityminder-container .glyphicon-level-up:before {
  content: "\\e204";
}
.kityminder-container .glyphicon-copy:before {
  content: "\\e205";
}
.kityminder-container .glyphicon-paste:before {
  content: "\\e206";
}
.kityminder-container .glyphicon-alert:before {
  content: "\\e209";
}
.kityminder-container .glyphicon-equalizer:before {
  content: "\\e210";
}
.kityminder-container .glyphicon-king:before {
  content: "\\e211";
}
.kityminder-container .glyphicon-queen:before {
  content: "\\e212";
}
.kityminder-container .glyphicon-pawn:before {
  content: "\\e213";
}
.kityminder-container .glyphicon-bishop:before {
  content: "\\e214";
}
.kityminder-container .glyphicon-knight:before {
  content: "\\e215";
}
.kityminder-container .glyphicon-baby-formula:before {
  content: "\\e216";
}
.kityminder-container .glyphicon-tent:before {
  content: "\\26fa";
}
.kityminder-container .glyphicon-blackboard:before {
  content: "\\e218";
}
.kityminder-container .glyphicon-bed:before {
  content: "\\e219";
}
.kityminder-container .glyphicon-apple:before {
  content: "\\f8ff";
}
.kityminder-container .glyphicon-erase:before {
  content: "\\e221";
}
.kityminder-container .glyphicon-hourglass:before {
  content: "\\231b";
}
.kityminder-container .glyphicon-lamp:before {
  content: "\\e223";
}
.kityminder-container .glyphicon-duplicate:before {
  content: "\\e224";
}
.kityminder-container .glyphicon-piggy-bank:before {
  content: "\\e225";
}
.kityminder-container .glyphicon-scissors:before {
  content: "\\e226";
}
.kityminder-container .glyphicon-bitcoin:before {
  content: "\\e227";
}
.kityminder-container .glyphicon-btc:before {
  content: "\\e227";
}
.kityminder-container .glyphicon-xbt:before {
  content: "\\e227";
}
.kityminder-container .glyphicon-yen:before {
  content: "\\00a5";
}
.kityminder-container .glyphicon-jpy:before {
  content: "\\00a5";
}
.kityminder-container .glyphicon-ruble:before {
  content: "\\20bd";
}
.kityminder-container .glyphicon-rub:before {
  content: "\\20bd";
}
.kityminder-container .glyphicon-scale:before {
  content: "\\e230";
}
.kityminder-container .glyphicon-ice-lolly:before {
  content: "\\e231";
}
.kityminder-container .glyphicon-ice-lolly-tasted:before {
  content: "\\e232";
}
.kityminder-container .glyphicon-education:before {
  content: "\\e233";
}
.kityminder-container .glyphicon-option-horizontal:before {
  content: "\\e234";
}
.kityminder-container .glyphicon-option-vertical:before {
  content: "\\e235";
}
.kityminder-container .glyphicon-menu-hamburger:before {
  content: "\\e236";
}
.kityminder-container .glyphicon-modal-window:before {
  content: "\\e237";
}
.kityminder-container .glyphicon-oil:before {
  content: "\\e238";
}
.kityminder-container .glyphicon-grain:before {
  content: "\\e239";
}
.kityminder-container .glyphicon-sunglasses:before {
  content: "\\e240";
}
.kityminder-container .glyphicon-text-size:before {
  content: "\\e241";
}
.kityminder-container .glyphicon-text-color:before {
  content: "\\e242";
}
.kityminder-container .glyphicon-text-background:before {
  content: "\\e243";
}
.kityminder-container .glyphicon-object-align-top:before {
  content: "\\e244";
}
.kityminder-container .glyphicon-object-align-bottom:before {
  content: "\\e245";
}
.kityminder-container .glyphicon-object-align-horizontal:before {
  content: "\\e246";
}
.kityminder-container .glyphicon-object-align-left:before {
  content: "\\e247";
}
.kityminder-container .glyphicon-object-align-vertical:before {
  content: "\\e248";
}
.kityminder-container .glyphicon-object-align-right:before {
  content: "\\e249";
}
.kityminder-container .glyphicon-triangle-right:before {
  content: "\\e250";
}
.kityminder-container .glyphicon-triangle-left:before {
  content: "\\e251";
}
.kityminder-container .glyphicon-triangle-bottom:before {
  content: "\\e252";
}
.kityminder-container .glyphicon-triangle-top:before {
  content: "\\e253";
}
.kityminder-container .glyphicon-console:before {
  content: "\\e254";
}
.kityminder-container .glyphicon-superscript:before {
  content: "\\e255";
}
.kityminder-container .glyphicon-subscript:before {
  content: "\\e256";
}
.kityminder-container .glyphicon-menu-left:before {
  content: "\\e257";
}
.kityminder-container .glyphicon-menu-right:before {
  content: "\\e258";
}
.kityminder-container .glyphicon-menu-down:before {
  content: "\\e259";
}
.kityminder-container .glyphicon-menu-up:before {
  content: "\\e260";
}
.kityminder-container * {
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
}
.kityminder-container *:before,
.kityminder-container *:after {
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
}
.kityminder-container {
  font-size: 10px;

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.kityminder-container {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.42857143;
  color: #333;
  background-color: #fff;
}
.kityminder-container input,
.kityminder-container button,
.kityminder-container select,
.kityminder-container textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}
.kityminder-container a {
  color: #337ab7;
  text-decoration: none;
}
.kityminder-container a:hover,
.kityminder-container a:focus {
  color: #23527c;
  text-decoration: underline;
}
.kityminder-container a:focus {
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
.kityminder-container figure {
  margin: 0;
}
.kityminder-container img {
  vertical-align: middle;
}
.kityminder-container .img-responsive,
.kityminder-container .thumbnail > img,
.kityminder-container .thumbnail a > img,
.kityminder-container .carousel-inner > .item > img,
.kityminder-container .carousel-inner > .item > a > img {
  display: block;
  max-width: 100%;
  height: auto;
}
.kityminder-container .img-rounded {
  border-radius: 6px;
}
.kityminder-container .img-thumbnail {
  display: inline-block;
  max-width: 100%;
  height: auto;
  padding: 4px;
  line-height: 1.42857143;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  -webkit-transition: all .2s ease-in-out;
       -o-transition: all .2s ease-in-out;
          transition: all .2s ease-in-out;
}
.kityminder-container .img-circle {
  border-radius: 50%;
}
.kityminder-container hr {
  margin-top: 20px;
  margin-bottom: 20px;
  border: 0;
  border-top: 1px solid #eee;
}
.kityminder-container .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.kityminder-container .sr-only-focusable:active,
.kityminder-container .sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
}
.kityminder-container [role="button"] {
  cursor: pointer;
}
.kityminder-container h1,
.kityminder-container h2,
.kityminder-container h3,
.kityminder-container h4,
.kityminder-container h5,
.kityminder-container h6,
.kityminder-container .h1,
.kityminder-container .h2,
.kityminder-container .h3,
.kityminder-container .h4,
.kityminder-container .h5,
.kityminder-container .h6 {
  font-family: inherit;
  font-weight: 500;
  line-height: 1.1;
  color: inherit;
}
.kityminder-container h1 small,
.kityminder-container h2 small,
.kityminder-container h3 small,
.kityminder-container h4 small,
.kityminder-container h5 small,
.kityminder-container h6 small,
.kityminder-container .h1 small,
.kityminder-container .h2 small,
.kityminder-container .h3 small,
.kityminder-container .h4 small,
.kityminder-container .h5 small,
.kityminder-container .h6 small,
.kityminder-container h1 .small,
.kityminder-container h2 .small,
.kityminder-container h3 .small,
.kityminder-container h4 .small,
.kityminder-container h5 .small,
.kityminder-container h6 .small,
.kityminder-container .h1 .small,
.kityminder-container .h2 .small,
.kityminder-container .h3 .small,
.kityminder-container .h4 .small,
.kityminder-container .h5 .small,
.kityminder-container .h6 .small {
  font-weight: normal;
  line-height: 1;
  color: #777;
}
.kityminder-container h1,
.kityminder-container .h1,
.kityminder-container h2,
.kityminder-container .h2,
.kityminder-container h3,
.kityminder-container .h3 {
  margin-top: 20px;
  margin-bottom: 10px;
}
.kityminder-container h1 small,
.kityminder-container .h1 small,
.kityminder-container h2 small,
.kityminder-container .h2 small,
.kityminder-container h3 small,
.kityminder-container .h3 small,
.kityminder-container h1 .small,
.kityminder-container .h1 .small,
.kityminder-container h2 .small,
.kityminder-container .h2 .small,
.kityminder-container h3 .small,
.kityminder-container .h3 .small {
  font-size: 65%;
}
.kityminder-container h4,
.kityminder-container .h4,
.kityminder-container h5,
.kityminder-container .h5,
.kityminder-container h6,
.kityminder-container .h6 {
  margin-top: 10px;
  margin-bottom: 10px;
}
.kityminder-container h4 small,
.kityminder-container .h4 small,
.kityminder-container h5 small,
.kityminder-container .h5 small,
.kityminder-container h6 small,
.kityminder-container .h6 small,
.kityminder-container h4 .small,
.kityminder-container .h4 .small,
.kityminder-container h5 .small,
.kityminder-container .h5 .small,
.kityminder-container h6 .small,
.kityminder-container .h6 .small {
  font-size: 75%;
}
.kityminder-container h1,
.kityminder-container .h1 {
  font-size: 36px;
}
.kityminder-container h2,
.kityminder-container .h2 {
  font-size: 30px;
}
.kityminder-container h3,
.kityminder-container .h3 {
  font-size: 24px;
}
.kityminder-container h4,
.kityminder-container .h4 {
  font-size: 18px;
}
.kityminder-container h5,
.kityminder-container .h5 {
  font-size: 14px;
}
.kityminder-container h6,
.kityminder-container .h6 {
  font-size: 12px;
}
.kityminder-container p {
  margin: 0 0 10px;
}
.kityminder-container .lead {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.4;
}
@media (min-width: 768px) {
  .kityminder-container .lead {
    font-size: 21px;
  }
}
.kityminder-container small,
.kityminder-container .small {
  font-size: 85%;
}
.kityminder-container mark,
.kityminder-container .mark {
  padding: .2em;
  background-color: #fcf8e3;
}
.kityminder-container .text-left {
  text-align: left;
}
.kityminder-container .text-right {
  text-align: right;
}
.kityminder-container .text-center {
  text-align: center;
}
.kityminder-container .text-justify {
  text-align: justify;
}
.kityminder-container .text-nowrap {
  white-space: nowrap;
}
.kityminder-container .text-lowercase {
  text-transform: lowercase;
}
.kityminder-container .text-uppercase {
  text-transform: uppercase;
}
.kityminder-container .text-capitalize {
  text-transform: capitalize;
}
.kityminder-container .text-muted {
  color: #777;
}
.kityminder-container .text-primary {
  color: #337ab7;
}
.kityminder-container a.text-primary:hover,
.kityminder-container a.text-primary:focus {
  color: #286090;
}
.kityminder-container .text-success {
  color: #3c763d;
}
.kityminder-container a.text-success:hover,
.kityminder-container a.text-success:focus {
  color: #2b542c;
}
.kityminder-container .text-info {
  color: #31708f;
}
.kityminder-container a.text-info:hover,
.kityminder-container a.text-info:focus {
  color: #245269;
}
.kityminder-container .text-warning {
  color: #8a6d3b;
}
.kityminder-container a.text-warning:hover,
.kityminder-container a.text-warning:focus {
  color: #66512c;
}
.kityminder-container .text-danger {
  color: #a94442;
}
.kityminder-container a.text-danger:hover,
.kityminder-container a.text-danger:focus {
  color: #843534;
}
.kityminder-container .bg-primary {
  color: #fff;
  background-color: #337ab7;
}
.kityminder-container a.bg-primary:hover,
.kityminder-container a.bg-primary:focus {
  background-color: #286090;
}
.kityminder-container .bg-success {
  background-color: #dff0d8;
}
.kityminder-container a.bg-success:hover,
.kityminder-container a.bg-success:focus {
  background-color: #c1e2b3;
}
.kityminder-container .bg-info {
  background-color: #d9edf7;
}
.kityminder-container a.bg-info:hover,
.kityminder-container a.bg-info:focus {
  background-color: #afd9ee;
}
.kityminder-container .bg-warning {
  background-color: #fcf8e3;
}
.kityminder-container a.bg-warning:hover,
.kityminder-container a.bg-warning:focus {
  background-color: #f7ecb5;
}
.kityminder-container .bg-danger {
  background-color: #f2dede;
}
.kityminder-container a.bg-danger:hover,
.kityminder-container a.bg-danger:focus {
  background-color: #e4b9b9;
}
.kityminder-container .page-header {
  padding-bottom: 9px;
  margin: 40px 0 20px;
  border-bottom: 1px solid #eee;
}
.kityminder-container ul,
.kityminder-container ol {
  margin-top: 0;
  margin-bottom: 10px;
}
.kityminder-container ul ul,
.kityminder-container ol ul,
.kityminder-container ul ol,
.kityminder-container ol ol {
  margin-bottom: 0;
}
.kityminder-container .list-unstyled {
  padding-left: 0;
  list-style: none;
}
.kityminder-container .list-inline {
  padding-left: 0;
  margin-left: -5px;
  list-style: none;
}
.kityminder-container .list-inline > li {
  display: inline-block;
  padding-right: 5px;
  padding-left: 5px;
}
.kityminder-container dl {
  margin-top: 0;
  margin-bottom: 20px;
}
.kityminder-container dt,
.kityminder-container dd {
  line-height: 1.42857143;
}
.kityminder-container dt {
  font-weight: bold;
}
.kityminder-container dd {
  margin-left: 0;
}
@media (min-width: 768px) {
  .kityminder-container .dl-horizontal dt {
    float: left;
    width: 160px;
    overflow: hidden;
    clear: left;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .kityminder-container .dl-horizontal dd {
    margin-left: 180px;
  }
}
.kityminder-container abbr[title],
.kityminder-container abbr[data-original-title] {
  cursor: help;
  border-bottom: 1px dotted #777;
}
.kityminder-container .initialism {
  font-size: 90%;
  text-transform: uppercase;
}
.kityminder-container blockquote {
  padding: 10px 20px;
  margin: 0 0 20px;
  font-size: 17.5px;
  border-left: 5px solid #eee;
}
.kityminder-container blockquote p:last-child,
.kityminder-container blockquote ul:last-child,
.kityminder-container blockquote ol:last-child {
  margin-bottom: 0;
}
.kityminder-container blockquote footer,
.kityminder-container blockquote small,
.kityminder-container blockquote .small {
  display: block;
  font-size: 80%;
  line-height: 1.42857143;
  color: #777;
}
.kityminder-container blockquote footer:before,
.kityminder-container blockquote small:before,
.kityminder-container blockquote .small:before {
  content: '\\2014 \\00A0';
}
.kityminder-container .blockquote-reverse,
.kityminder-container blockquote.pull-right {
  padding-right: 15px;
  padding-left: 0;
  text-align: right;
  border-right: 5px solid #eee;
  border-left: 0;
}
.kityminder-container .blockquote-reverse footer:before,
.kityminder-container blockquote.pull-right footer:before,
.kityminder-container .blockquote-reverse small:before,
.kityminder-container blockquote.pull-right small:before,
.kityminder-container .blockquote-reverse .small:before,
.kityminder-container blockquote.pull-right .small:before {
  content: '';
}
.kityminder-container .blockquote-reverse footer:after,
.kityminder-container blockquote.pull-right footer:after,
.kityminder-container .blockquote-reverse small:after,
.kityminder-container blockquote.pull-right small:after,
.kityminder-container .blockquote-reverse .small:after,
.kityminder-container blockquote.pull-right .small:after {
  content: '\\00A0 \\2014';
}
.kityminder-container address {
  margin-bottom: 20px;
  font-style: normal;
  line-height: 1.42857143;
}
.kityminder-container code,
.kityminder-container kbd,
.kityminder-container pre,
.kityminder-container samp {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}
.kityminder-container code {
  padding: 2px 4px;
  font-size: 90%;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
}
.kityminder-container kbd {
  padding: 2px 4px;
  font-size: 90%;
  color: #fff;
  background-color: #333;
  border-radius: 3px;
  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .25);
          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .25);
}
.kityminder-container kbd kbd {
  padding: 0;
  font-size: 100%;
  font-weight: bold;
  -webkit-box-shadow: none;
          box-shadow: none;
}
.kityminder-container pre {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.kityminder-container pre code {
  padding: 0;
  font-size: inherit;
  color: inherit;
  white-space: pre-wrap;
  background-color: transparent;
  border-radius: 0;
}
.kityminder-container .pre-scrollable {
  max-height: 340px;
  overflow-y: scroll;
}
.kityminder-container .container {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}
@media (min-width: 768px) {
  .kityminder-container .container {
    width: 750px;
  }
}
@media (min-width: 992px) {
  .kityminder-container .container {
    width: 970px;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .container {
    width: 1170px;
  }
}
.kityminder-container .container-fluid {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}
.kityminder-container .row {
  margin-right: -15px;
  margin-left: -15px;
}
.kityminder-container .col-xs-1, .kityminder-container .col-sm-1, .kityminder-container .col-md-1, .kityminder-container .col-lg-1, .kityminder-container .col-xs-2, .kityminder-container .col-sm-2, .kityminder-container .col-md-2, .kityminder-container .col-lg-2, .kityminder-container .col-xs-3, .kityminder-container .col-sm-3, .kityminder-container .col-md-3, .kityminder-container .col-lg-3, .kityminder-container .col-xs-4, .kityminder-container .col-sm-4, .kityminder-container .col-md-4, .kityminder-container .col-lg-4, .kityminder-container .col-xs-5, .kityminder-container .col-sm-5, .kityminder-container .col-md-5, .kityminder-container .col-lg-5, .kityminder-container .col-xs-6, .kityminder-container .col-sm-6, .kityminder-container .col-md-6, .kityminder-container .col-lg-6, .kityminder-container .col-xs-7, .kityminder-container .col-sm-7, .kityminder-container .col-md-7, .kityminder-container .col-lg-7, .kityminder-container .col-xs-8, .kityminder-container .col-sm-8, .kityminder-container .col-md-8, .kityminder-container .col-lg-8, .kityminder-container .col-xs-9, .kityminder-container .col-sm-9, .kityminder-container .col-md-9, .kityminder-container .col-lg-9, .kityminder-container .col-xs-10, .kityminder-container .col-sm-10, .kityminder-container .col-md-10, .kityminder-container .col-lg-10, .kityminder-container .col-xs-11, .kityminder-container .col-sm-11, .kityminder-container .col-md-11, .kityminder-container .col-lg-11, .kityminder-container .col-xs-12, .kityminder-container .col-sm-12, .kityminder-container .col-md-12, .kityminder-container .col-lg-12 {
  position: relative;
  min-height: 1px;
  padding-right: 15px;
  padding-left: 15px;
}
.kityminder-container .col-xs-1, .kityminder-container .col-xs-2, .kityminder-container .col-xs-3, .kityminder-container .col-xs-4, .kityminder-container .col-xs-5, .kityminder-container .col-xs-6, .kityminder-container .col-xs-7, .kityminder-container .col-xs-8, .kityminder-container .col-xs-9, .kityminder-container .col-xs-10, .kityminder-container .col-xs-11, .kityminder-container .col-xs-12 {
  float: left;
}
.kityminder-container .col-xs-12 {
  width: 100%;
}
.kityminder-container .col-xs-11 {
  width: 91.66666667%;
}
.kityminder-container .col-xs-10 {
  width: 83.33333333%;
}
.kityminder-container .col-xs-9 {
  width: 75%;
}
.kityminder-container .col-xs-8 {
  width: 66.66666667%;
}
.kityminder-container .col-xs-7 {
  width: 58.33333333%;
}
.kityminder-container .col-xs-6 {
  width: 50%;
}
.kityminder-container .col-xs-5 {
  width: 41.66666667%;
}
.kityminder-container .col-xs-4 {
  width: 33.33333333%;
}
.kityminder-container .col-xs-3 {
  width: 25%;
}
.kityminder-container .col-xs-2 {
  width: 16.66666667%;
}
.kityminder-container .col-xs-1 {
  width: 8.33333333%;
}
.kityminder-container .col-xs-pull-12 {
  right: 100%;
}
.kityminder-container .col-xs-pull-11 {
  right: 91.66666667%;
}
.kityminder-container .col-xs-pull-10 {
  right: 83.33333333%;
}
.kityminder-container .col-xs-pull-9 {
  right: 75%;
}
.kityminder-container .col-xs-pull-8 {
  right: 66.66666667%;
}
.kityminder-container .col-xs-pull-7 {
  right: 58.33333333%;
}
.kityminder-container .col-xs-pull-6 {
  right: 50%;
}
.kityminder-container .col-xs-pull-5 {
  right: 41.66666667%;
}
.kityminder-container .col-xs-pull-4 {
  right: 33.33333333%;
}
.kityminder-container .col-xs-pull-3 {
  right: 25%;
}
.kityminder-container .col-xs-pull-2 {
  right: 16.66666667%;
}
.kityminder-container .col-xs-pull-1 {
  right: 8.33333333%;
}
.kityminder-container .col-xs-pull-0 {
  right: auto;
}
.kityminder-container .col-xs-push-12 {
  left: 100%;
}
.kityminder-container .col-xs-push-11 {
  left: 91.66666667%;
}
.kityminder-container .col-xs-push-10 {
  left: 83.33333333%;
}
.kityminder-container .col-xs-push-9 {
  left: 75%;
}
.kityminder-container .col-xs-push-8 {
  left: 66.66666667%;
}
.kityminder-container .col-xs-push-7 {
  left: 58.33333333%;
}
.kityminder-container .col-xs-push-6 {
  left: 50%;
}
.kityminder-container .col-xs-push-5 {
  left: 41.66666667%;
}
.kityminder-container .col-xs-push-4 {
  left: 33.33333333%;
}
.kityminder-container .col-xs-push-3 {
  left: 25%;
}
.kityminder-container .col-xs-push-2 {
  left: 16.66666667%;
}
.kityminder-container .col-xs-push-1 {
  left: 8.33333333%;
}
.kityminder-container .col-xs-push-0 {
  left: auto;
}
.kityminder-container .col-xs-offset-12 {
  margin-left: 100%;
}
.kityminder-container .col-xs-offset-11 {
  margin-left: 91.66666667%;
}
.kityminder-container .col-xs-offset-10 {
  margin-left: 83.33333333%;
}
.kityminder-container .col-xs-offset-9 {
  margin-left: 75%;
}
.kityminder-container .col-xs-offset-8 {
  margin-left: 66.66666667%;
}
.kityminder-container .col-xs-offset-7 {
  margin-left: 58.33333333%;
}
.kityminder-container .col-xs-offset-6 {
  margin-left: 50%;
}
.kityminder-container .col-xs-offset-5 {
  margin-left: 41.66666667%;
}
.kityminder-container .col-xs-offset-4 {
  margin-left: 33.33333333%;
}
.kityminder-container .col-xs-offset-3 {
  margin-left: 25%;
}
.kityminder-container .col-xs-offset-2 {
  margin-left: 16.66666667%;
}
.kityminder-container .col-xs-offset-1 {
  margin-left: 8.33333333%;
}
.kityminder-container .col-xs-offset-0 {
  margin-left: 0;
}
@media (min-width: 768px) {
  .kityminder-container .col-sm-1, .kityminder-container .col-sm-2, .kityminder-container .col-sm-3, .kityminder-container .col-sm-4, .kityminder-container .col-sm-5, .kityminder-container .col-sm-6, .kityminder-container .col-sm-7, .kityminder-container .col-sm-8, .kityminder-container .col-sm-9, .kityminder-container .col-sm-10, .kityminder-container .col-sm-11, .kityminder-container .col-sm-12 {
    float: left;
  }
  .kityminder-container .col-sm-12 {
    width: 100%;
  }
  .kityminder-container .col-sm-11 {
    width: 91.66666667%;
  }
  .kityminder-container .col-sm-10 {
    width: 83.33333333%;
  }
  .kityminder-container .col-sm-9 {
    width: 75%;
  }
  .kityminder-container .col-sm-8 {
    width: 66.66666667%;
  }
  .kityminder-container .col-sm-7 {
    width: 58.33333333%;
  }
  .kityminder-container .col-sm-6 {
    width: 50%;
  }
  .kityminder-container .col-sm-5 {
    width: 41.66666667%;
  }
  .kityminder-container .col-sm-4 {
    width: 33.33333333%;
  }
  .kityminder-container .col-sm-3 {
    width: 25%;
  }
  .kityminder-container .col-sm-2 {
    width: 16.66666667%;
  }
  .kityminder-container .col-sm-1 {
    width: 8.33333333%;
  }
  .kityminder-container .col-sm-pull-12 {
    right: 100%;
  }
  .kityminder-container .col-sm-pull-11 {
    right: 91.66666667%;
  }
  .kityminder-container .col-sm-pull-10 {
    right: 83.33333333%;
  }
  .kityminder-container .col-sm-pull-9 {
    right: 75%;
  }
  .kityminder-container .col-sm-pull-8 {
    right: 66.66666667%;
  }
  .kityminder-container .col-sm-pull-7 {
    right: 58.33333333%;
  }
  .kityminder-container .col-sm-pull-6 {
    right: 50%;
  }
  .kityminder-container .col-sm-pull-5 {
    right: 41.66666667%;
  }
  .kityminder-container .col-sm-pull-4 {
    right: 33.33333333%;
  }
  .kityminder-container .col-sm-pull-3 {
    right: 25%;
  }
  .kityminder-container .col-sm-pull-2 {
    right: 16.66666667%;
  }
  .kityminder-container .col-sm-pull-1 {
    right: 8.33333333%;
  }
  .kityminder-container .col-sm-pull-0 {
    right: auto;
  }
  .kityminder-container .col-sm-push-12 {
    left: 100%;
  }
  .kityminder-container .col-sm-push-11 {
    left: 91.66666667%;
  }
  .kityminder-container .col-sm-push-10 {
    left: 83.33333333%;
  }
  .kityminder-container .col-sm-push-9 {
    left: 75%;
  }
  .kityminder-container .col-sm-push-8 {
    left: 66.66666667%;
  }
  .kityminder-container .col-sm-push-7 {
    left: 58.33333333%;
  }
  .kityminder-container .col-sm-push-6 {
    left: 50%;
  }
  .kityminder-container .col-sm-push-5 {
    left: 41.66666667%;
  }
  .kityminder-container .col-sm-push-4 {
    left: 33.33333333%;
  }
  .kityminder-container .col-sm-push-3 {
    left: 25%;
  }
  .kityminder-container .col-sm-push-2 {
    left: 16.66666667%;
  }
  .kityminder-container .col-sm-push-1 {
    left: 8.33333333%;
  }
  .kityminder-container .col-sm-push-0 {
    left: auto;
  }
  .kityminder-container .col-sm-offset-12 {
    margin-left: 100%;
  }
  .kityminder-container .col-sm-offset-11 {
    margin-left: 91.66666667%;
  }
  .kityminder-container .col-sm-offset-10 {
    margin-left: 83.33333333%;
  }
  .kityminder-container .col-sm-offset-9 {
    margin-left: 75%;
  }
  .kityminder-container .col-sm-offset-8 {
    margin-left: 66.66666667%;
  }
  .kityminder-container .col-sm-offset-7 {
    margin-left: 58.33333333%;
  }
  .kityminder-container .col-sm-offset-6 {
    margin-left: 50%;
  }
  .kityminder-container .col-sm-offset-5 {
    margin-left: 41.66666667%;
  }
  .kityminder-container .col-sm-offset-4 {
    margin-left: 33.33333333%;
  }
  .kityminder-container .col-sm-offset-3 {
    margin-left: 25%;
  }
  .kityminder-container .col-sm-offset-2 {
    margin-left: 16.66666667%;
  }
  .kityminder-container .col-sm-offset-1 {
    margin-left: 8.33333333%;
  }
  .kityminder-container .col-sm-offset-0 {
    margin-left: 0;
  }
}
@media (min-width: 992px) {
  .kityminder-container .col-md-1, .kityminder-container .col-md-2, .kityminder-container .col-md-3, .kityminder-container .col-md-4, .kityminder-container .col-md-5, .kityminder-container .col-md-6, .kityminder-container .col-md-7, .kityminder-container .col-md-8, .kityminder-container .col-md-9, .kityminder-container .col-md-10, .kityminder-container .col-md-11, .kityminder-container .col-md-12 {
    float: left;
  }
  .kityminder-container .col-md-12 {
    width: 100%;
  }
  .kityminder-container .col-md-11 {
    width: 91.66666667%;
  }
  .kityminder-container .col-md-10 {
    width: 83.33333333%;
  }
  .kityminder-container .col-md-9 {
    width: 75%;
  }
  .kityminder-container .col-md-8 {
    width: 66.66666667%;
  }
  .kityminder-container .col-md-7 {
    width: 58.33333333%;
  }
  .kityminder-container .col-md-6 {
    width: 50%;
  }
  .kityminder-container .col-md-5 {
    width: 41.66666667%;
  }
  .kityminder-container .col-md-4 {
    width: 33.33333333%;
  }
  .kityminder-container .col-md-3 {
    width: 25%;
  }
  .kityminder-container .col-md-2 {
    width: 16.66666667%;
  }
  .kityminder-container .col-md-1 {
    width: 8.33333333%;
  }
  .kityminder-container .col-md-pull-12 {
    right: 100%;
  }
  .kityminder-container .col-md-pull-11 {
    right: 91.66666667%;
  }
  .kityminder-container .col-md-pull-10 {
    right: 83.33333333%;
  }
  .kityminder-container .col-md-pull-9 {
    right: 75%;
  }
  .kityminder-container .col-md-pull-8 {
    right: 66.66666667%;
  }
  .kityminder-container .col-md-pull-7 {
    right: 58.33333333%;
  }
  .kityminder-container .col-md-pull-6 {
    right: 50%;
  }
  .kityminder-container .col-md-pull-5 {
    right: 41.66666667%;
  }
  .kityminder-container .col-md-pull-4 {
    right: 33.33333333%;
  }
  .kityminder-container .col-md-pull-3 {
    right: 25%;
  }
  .kityminder-container .col-md-pull-2 {
    right: 16.66666667%;
  }
  .kityminder-container .col-md-pull-1 {
    right: 8.33333333%;
  }
  .kityminder-container .col-md-pull-0 {
    right: auto;
  }
  .kityminder-container .col-md-push-12 {
    left: 100%;
  }
  .kityminder-container .col-md-push-11 {
    left: 91.66666667%;
  }
  .kityminder-container .col-md-push-10 {
    left: 83.33333333%;
  }
  .kityminder-container .col-md-push-9 {
    left: 75%;
  }
  .kityminder-container .col-md-push-8 {
    left: 66.66666667%;
  }
  .kityminder-container .col-md-push-7 {
    left: 58.33333333%;
  }
  .kityminder-container .col-md-push-6 {
    left: 50%;
  }
  .kityminder-container .col-md-push-5 {
    left: 41.66666667%;
  }
  .kityminder-container .col-md-push-4 {
    left: 33.33333333%;
  }
  .kityminder-container .col-md-push-3 {
    left: 25%;
  }
  .kityminder-container .col-md-push-2 {
    left: 16.66666667%;
  }
  .kityminder-container .col-md-push-1 {
    left: 8.33333333%;
  }
  .kityminder-container .col-md-push-0 {
    left: auto;
  }
  .kityminder-container .col-md-offset-12 {
    margin-left: 100%;
  }
  .kityminder-container .col-md-offset-11 {
    margin-left: 91.66666667%;
  }
  .kityminder-container .col-md-offset-10 {
    margin-left: 83.33333333%;
  }
  .kityminder-container .col-md-offset-9 {
    margin-left: 75%;
  }
  .kityminder-container .col-md-offset-8 {
    margin-left: 66.66666667%;
  }
  .kityminder-container .col-md-offset-7 {
    margin-left: 58.33333333%;
  }
  .kityminder-container .col-md-offset-6 {
    margin-left: 50%;
  }
  .kityminder-container .col-md-offset-5 {
    margin-left: 41.66666667%;
  }
  .kityminder-container .col-md-offset-4 {
    margin-left: 33.33333333%;
  }
  .kityminder-container .col-md-offset-3 {
    margin-left: 25%;
  }
  .kityminder-container .col-md-offset-2 {
    margin-left: 16.66666667%;
  }
  .kityminder-container .col-md-offset-1 {
    margin-left: 8.33333333%;
  }
  .kityminder-container .col-md-offset-0 {
    margin-left: 0;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .col-lg-1, .kityminder-container .col-lg-2, .kityminder-container .col-lg-3, .kityminder-container .col-lg-4, .kityminder-container .col-lg-5, .kityminder-container .col-lg-6, .kityminder-container .col-lg-7, .kityminder-container .col-lg-8, .kityminder-container .col-lg-9, .kityminder-container .col-lg-10, .kityminder-container .col-lg-11, .kityminder-container .col-lg-12 {
    float: left;
  }
  .kityminder-container .col-lg-12 {
    width: 100%;
  }
  .kityminder-container .col-lg-11 {
    width: 91.66666667%;
  }
  .kityminder-container .col-lg-10 {
    width: 83.33333333%;
  }
  .kityminder-container .col-lg-9 {
    width: 75%;
  }
  .kityminder-container .col-lg-8 {
    width: 66.66666667%;
  }
  .kityminder-container .col-lg-7 {
    width: 58.33333333%;
  }
  .kityminder-container .col-lg-6 {
    width: 50%;
  }
  .kityminder-container .col-lg-5 {
    width: 41.66666667%;
  }
  .kityminder-container .col-lg-4 {
    width: 33.33333333%;
  }
  .kityminder-container .col-lg-3 {
    width: 25%;
  }
  .kityminder-container .col-lg-2 {
    width: 16.66666667%;
  }
  .kityminder-container .col-lg-1 {
    width: 8.33333333%;
  }
  .kityminder-container .col-lg-pull-12 {
    right: 100%;
  }
  .kityminder-container .col-lg-pull-11 {
    right: 91.66666667%;
  }
  .kityminder-container .col-lg-pull-10 {
    right: 83.33333333%;
  }
  .kityminder-container .col-lg-pull-9 {
    right: 75%;
  }
  .kityminder-container .col-lg-pull-8 {
    right: 66.66666667%;
  }
  .kityminder-container .col-lg-pull-7 {
    right: 58.33333333%;
  }
  .kityminder-container .col-lg-pull-6 {
    right: 50%;
  }
  .kityminder-container .col-lg-pull-5 {
    right: 41.66666667%;
  }
  .kityminder-container .col-lg-pull-4 {
    right: 33.33333333%;
  }
  .kityminder-container .col-lg-pull-3 {
    right: 25%;
  }
  .kityminder-container .col-lg-pull-2 {
    right: 16.66666667%;
  }
  .kityminder-container .col-lg-pull-1 {
    right: 8.33333333%;
  }
  .kityminder-container .col-lg-pull-0 {
    right: auto;
  }
  .kityminder-container .col-lg-push-12 {
    left: 100%;
  }
  .kityminder-container .col-lg-push-11 {
    left: 91.66666667%;
  }
  .kityminder-container .col-lg-push-10 {
    left: 83.33333333%;
  }
  .kityminder-container .col-lg-push-9 {
    left: 75%;
  }
  .kityminder-container .col-lg-push-8 {
    left: 66.66666667%;
  }
  .kityminder-container .col-lg-push-7 {
    left: 58.33333333%;
  }
  .kityminder-container .col-lg-push-6 {
    left: 50%;
  }
  .kityminder-container .col-lg-push-5 {
    left: 41.66666667%;
  }
  .kityminder-container .col-lg-push-4 {
    left: 33.33333333%;
  }
  .kityminder-container .col-lg-push-3 {
    left: 25%;
  }
  .kityminder-container .col-lg-push-2 {
    left: 16.66666667%;
  }
  .kityminder-container .col-lg-push-1 {
    left: 8.33333333%;
  }
  .kityminder-container .col-lg-push-0 {
    left: auto;
  }
  .kityminder-container .col-lg-offset-12 {
    margin-left: 100%;
  }
  .kityminder-container .col-lg-offset-11 {
    margin-left: 91.66666667%;
  }
  .kityminder-container .col-lg-offset-10 {
    margin-left: 83.33333333%;
  }
  .kityminder-container .col-lg-offset-9 {
    margin-left: 75%;
  }
  .kityminder-container .col-lg-offset-8 {
    margin-left: 66.66666667%;
  }
  .kityminder-container .col-lg-offset-7 {
    margin-left: 58.33333333%;
  }
  .kityminder-container .col-lg-offset-6 {
    margin-left: 50%;
  }
  .kityminder-container .col-lg-offset-5 {
    margin-left: 41.66666667%;
  }
  .kityminder-container .col-lg-offset-4 {
    margin-left: 33.33333333%;
  }
  .kityminder-container .col-lg-offset-3 {
    margin-left: 25%;
  }
  .kityminder-container .col-lg-offset-2 {
    margin-left: 16.66666667%;
  }
  .kityminder-container .col-lg-offset-1 {
    margin-left: 8.33333333%;
  }
  .kityminder-container .col-lg-offset-0 {
    margin-left: 0;
  }
}
.kityminder-container table {
  background-color: transparent;
}
.kityminder-container caption {
  padding-top: 8px;
  padding-bottom: 8px;
  color: #777;
  text-align: left;
}
.kityminder-container th {
  text-align: left;
}
.kityminder-container .table {
  width: 100%;
  max-width: 100%;
  margin-bottom: 20px;
}
.kityminder-container .table > thead > tr > th,
.kityminder-container .table > tbody > tr > th,
.kityminder-container .table > tfoot > tr > th,
.kityminder-container .table > thead > tr > td,
.kityminder-container .table > tbody > tr > td,
.kityminder-container .table > tfoot > tr > td {
  padding: 8px;
  line-height: 1.42857143;
  vertical-align: top;
  border-top: 1px solid #ddd;
}
.kityminder-container .table > thead > tr > th {
  vertical-align: bottom;
  border-bottom: 2px solid #ddd;
}
.kityminder-container .table > caption + thead > tr:first-child > th,
.kityminder-container .table > colgroup + thead > tr:first-child > th,
.kityminder-container .table > thead:first-child > tr:first-child > th,
.kityminder-container .table > caption + thead > tr:first-child > td,
.kityminder-container .table > colgroup + thead > tr:first-child > td,
.kityminder-container .table > thead:first-child > tr:first-child > td {
  border-top: 0;
}
.kityminder-container .table > tbody + tbody {
  border-top: 2px solid #ddd;
}
.kityminder-container .table .table {
  background-color: #fff;
}
.kityminder-container .table-condensed > thead > tr > th,
.kityminder-container .table-condensed > tbody > tr > th,
.kityminder-container .table-condensed > tfoot > tr > th,
.kityminder-container .table-condensed > thead > tr > td,
.kityminder-container .table-condensed > tbody > tr > td,
.kityminder-container .table-condensed > tfoot > tr > td {
  padding: 5px;
}
.kityminder-container .table-bordered {
  border: 1px solid #ddd;
}
.kityminder-container .table-bordered > thead > tr > th,
.kityminder-container .table-bordered > tbody > tr > th,
.kityminder-container .table-bordered > tfoot > tr > th,
.kityminder-container .table-bordered > thead > tr > td,
.kityminder-container .table-bordered > tbody > tr > td,
.kityminder-container .table-bordered > tfoot > tr > td {
  border: 1px solid #ddd;
}
.kityminder-container .table-bordered > thead > tr > th,
.kityminder-container .table-bordered > thead > tr > td {
  border-bottom-width: 2px;
}
.kityminder-container .table-striped > tbody > tr:nth-of-type(odd) {
  background-color: #f9f9f9;
}
.kityminder-container .table-hover > tbody > tr:hover {
  background-color: #f5f5f5;
}
.kityminder-container table col[class*="col-"] {
  position: static;
  display: table-column;
  float: none;
}
.kityminder-container table td[class*="col-"],
.kityminder-container table th[class*="col-"] {
  position: static;
  display: table-cell;
  float: none;
}
.kityminder-container .table > thead > tr > td.active,
.kityminder-container .table > tbody > tr > td.active,
.kityminder-container .table > tfoot > tr > td.active,
.kityminder-container .table > thead > tr > th.active,
.kityminder-container .table > tbody > tr > th.active,
.kityminder-container .table > tfoot > tr > th.active,
.kityminder-container .table > thead > tr.active > td,
.kityminder-container .table > tbody > tr.active > td,
.kityminder-container .table > tfoot > tr.active > td,
.kityminder-container .table > thead > tr.active > th,
.kityminder-container .table > tbody > tr.active > th,
.kityminder-container .table > tfoot > tr.active > th {
  background-color: #f5f5f5;
}
.kityminder-container .table-hover > tbody > tr > td.active:hover,
.kityminder-container .table-hover > tbody > tr > th.active:hover,
.kityminder-container .table-hover > tbody > tr.active:hover > td,
.kityminder-container .table-hover > tbody > tr:hover > .active,
.kityminder-container .table-hover > tbody > tr.active:hover > th {
  background-color: #e8e8e8;
}
.kityminder-container .table > thead > tr > td.success,
.kityminder-container .table > tbody > tr > td.success,
.kityminder-container .table > tfoot > tr > td.success,
.kityminder-container .table > thead > tr > th.success,
.kityminder-container .table > tbody > tr > th.success,
.kityminder-container .table > tfoot > tr > th.success,
.kityminder-container .table > thead > tr.success > td,
.kityminder-container .table > tbody > tr.success > td,
.kityminder-container .table > tfoot > tr.success > td,
.kityminder-container .table > thead > tr.success > th,
.kityminder-container .table > tbody > tr.success > th,
.kityminder-container .table > tfoot > tr.success > th {
  background-color: #dff0d8;
}
.kityminder-container .table-hover > tbody > tr > td.success:hover,
.kityminder-container .table-hover > tbody > tr > th.success:hover,
.kityminder-container .table-hover > tbody > tr.success:hover > td,
.kityminder-container .table-hover > tbody > tr:hover > .success,
.kityminder-container .table-hover > tbody > tr.success:hover > th {
  background-color: #d0e9c6;
}
.kityminder-container .table > thead > tr > td.info,
.kityminder-container .table > tbody > tr > td.info,
.kityminder-container .table > tfoot > tr > td.info,
.kityminder-container .table > thead > tr > th.info,
.kityminder-container .table > tbody > tr > th.info,
.kityminder-container .table > tfoot > tr > th.info,
.kityminder-container .table > thead > tr.info > td,
.kityminder-container .table > tbody > tr.info > td,
.kityminder-container .table > tfoot > tr.info > td,
.kityminder-container .table > thead > tr.info > th,
.kityminder-container .table > tbody > tr.info > th,
.kityminder-container .table > tfoot > tr.info > th {
  background-color: #d9edf7;
}
.kityminder-container .table-hover > tbody > tr > td.info:hover,
.kityminder-container .table-hover > tbody > tr > th.info:hover,
.kityminder-container .table-hover > tbody > tr.info:hover > td,
.kityminder-container .table-hover > tbody > tr:hover > .info,
.kityminder-container .table-hover > tbody > tr.info:hover > th {
  background-color: #c4e3f3;
}
.kityminder-container .table > thead > tr > td.warning,
.kityminder-container .table > tbody > tr > td.warning,
.kityminder-container .table > tfoot > tr > td.warning,
.kityminder-container .table > thead > tr > th.warning,
.kityminder-container .table > tbody > tr > th.warning,
.kityminder-container .table > tfoot > tr > th.warning,
.kityminder-container .table > thead > tr.warning > td,
.kityminder-container .table > tbody > tr.warning > td,
.kityminder-container .table > tfoot > tr.warning > td,
.kityminder-container .table > thead > tr.warning > th,
.kityminder-container .table > tbody > tr.warning > th,
.kityminder-container .table > tfoot > tr.warning > th {
  background-color: #fcf8e3;
}
.kityminder-container .table-hover > tbody > tr > td.warning:hover,
.kityminder-container .table-hover > tbody > tr > th.warning:hover,
.kityminder-container .table-hover > tbody > tr.warning:hover > td,
.kityminder-container .table-hover > tbody > tr:hover > .warning,
.kityminder-container .table-hover > tbody > tr.warning:hover > th {
  background-color: #faf2cc;
}
.kityminder-container .table > thead > tr > td.danger,
.kityminder-container .table > tbody > tr > td.danger,
.kityminder-container .table > tfoot > tr > td.danger,
.kityminder-container .table > thead > tr > th.danger,
.kityminder-container .table > tbody > tr > th.danger,
.kityminder-container .table > tfoot > tr > th.danger,
.kityminder-container .table > thead > tr.danger > td,
.kityminder-container .table > tbody > tr.danger > td,
.kityminder-container .table > tfoot > tr.danger > td,
.kityminder-container .table > thead > tr.danger > th,
.kityminder-container .table > tbody > tr.danger > th,
.kityminder-container .table > tfoot > tr.danger > th {
  background-color: #f2dede;
}
.kityminder-container .table-hover > tbody > tr > td.danger:hover,
.kityminder-container .table-hover > tbody > tr > th.danger:hover,
.kityminder-container .table-hover > tbody > tr.danger:hover > td,
.kityminder-container .table-hover > tbody > tr:hover > .danger,
.kityminder-container .table-hover > tbody > tr.danger:hover > th {
  background-color: #ebcccc;
}
.kityminder-container .table-responsive {
  min-height: .01%;
  overflow-x: auto;
}
@media screen and (max-width: 767px) {
  .kityminder-container .table-responsive {
    width: 100%;
    margin-bottom: 15px;
    overflow-y: hidden;
    -ms-overflow-style: -ms-autohiding-scrollbar;
    border: 1px solid #ddd;
  }
  .kityminder-container .table-responsive > .table {
    margin-bottom: 0;
  }
  .kityminder-container .table-responsive > .table > thead > tr > th,
  .kityminder-container .table-responsive > .table > tbody > tr > th,
  .kityminder-container .table-responsive > .table > tfoot > tr > th,
  .kityminder-container .table-responsive > .table > thead > tr > td,
  .kityminder-container .table-responsive > .table > tbody > tr > td,
  .kityminder-container .table-responsive > .table > tfoot > tr > td {
    white-space: nowrap;
  }
  .kityminder-container .table-responsive > .table-bordered {
    border: 0;
  }
  .kityminder-container .table-responsive > .table-bordered > thead > tr > th:first-child,
  .kityminder-container .table-responsive > .table-bordered > tbody > tr > th:first-child,
  .kityminder-container .table-responsive > .table-bordered > tfoot > tr > th:first-child,
  .kityminder-container .table-responsive > .table-bordered > thead > tr > td:first-child,
  .kityminder-container .table-responsive > .table-bordered > tbody > tr > td:first-child,
  .kityminder-container .table-responsive > .table-bordered > tfoot > tr > td:first-child {
    border-left: 0;
  }
  .kityminder-container .table-responsive > .table-bordered > thead > tr > th:last-child,
  .kityminder-container .table-responsive > .table-bordered > tbody > tr > th:last-child,
  .kityminder-container .table-responsive > .table-bordered > tfoot > tr > th:last-child,
  .kityminder-container .table-responsive > .table-bordered > thead > tr > td:last-child,
  .kityminder-container .table-responsive > .table-bordered > tbody > tr > td:last-child,
  .kityminder-container .table-responsive > .table-bordered > tfoot > tr > td:last-child {
    border-right: 0;
  }
  .kityminder-container .table-responsive > .table-bordered > tbody > tr:last-child > th,
  .kityminder-container .table-responsive > .table-bordered > tfoot > tr:last-child > th,
  .kityminder-container .table-responsive > .table-bordered > tbody > tr:last-child > td,
  .kityminder-container .table-responsive > .table-bordered > tfoot > tr:last-child > td {
    border-bottom: 0;
  }
}
.kityminder-container fieldset {
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
}
.kityminder-container legend {
  display: block;
  width: 100%;
  padding: 0;
  margin-bottom: 20px;
  font-size: 21px;
  line-height: inherit;
  color: #333;
  border: 0;
  border-bottom: 1px solid #e5e5e5;
}
.kityminder-container label {
  display: inline-block;
  max-width: 100%;
  margin-bottom: 5px;
  font-weight: bold;
}
.kityminder-container input[type="search"] {
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
}
.kityminder-container input[type="radio"],
.kityminder-container input[type="checkbox"] {
  margin: 4px 0 0;
  margin-top: 1px \\9;
  line-height: normal;
}
.kityminder-container input[type="file"] {
  display: block;
}
.kityminder-container input[type="range"] {
  display: block;
  width: 100%;
}
.kityminder-container select[multiple],
.kityminder-container select[size] {
  height: auto;
}
.kityminder-container input[type="file"]:focus,
.kityminder-container input[type="radio"]:focus,
.kityminder-container input[type="checkbox"]:focus {
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
.kityminder-container output {
  display: block;
  padding-top: 7px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
}
.kityminder-container .form-control {
  display: block;
  width: 100%;
  height: 34px;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
  -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
       -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
          transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
}
.kityminder-container .form-control:focus {
  border-color: #66afe9;
  outline: 0;
  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);
          box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);
}
.kityminder-container .form-control::-moz-placeholder {
  color: #999;
  opacity: 1;
}
.kityminder-container .form-control:-ms-input-placeholder {
  color: #999;
}
.kityminder-container .form-control::-webkit-input-placeholder {
  color: #999;
}
.kityminder-container .form-control::-ms-expand {
  background-color: transparent;
  border: 0;
}
.kityminder-container .form-control[disabled],
.kityminder-container .form-control[readonly],
.kityminder-container fieldset[disabled] .form-control {
  background-color: #eee;
  opacity: 1;
}
.kityminder-container .form-control[disabled],
.kityminder-container fieldset[disabled] .form-control {
  cursor: not-allowed;
}
.kityminder-container textarea.form-control {
  height: auto;
}
.kityminder-container input[type="search"] {
  -webkit-appearance: none;
}
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .kityminder-container input[type="date"].form-control,
  .kityminder-container input[type="time"].form-control,
  .kityminder-container input[type="datetime-local"].form-control,
  .kityminder-container input[type="month"].form-control {
    line-height: 34px;
  }
  .kityminder-container input[type="date"].input-sm,
  .kityminder-container input[type="time"].input-sm,
  .kityminder-container input[type="datetime-local"].input-sm,
  .kityminder-container input[type="month"].input-sm,
  .kityminder-container .input-group-sm input[type="date"],
  .kityminder-container .input-group-sm input[type="time"],
  .kityminder-container .input-group-sm input[type="datetime-local"],
  .kityminder-container .input-group-sm input[type="month"] {
    line-height: 30px;
  }
  .kityminder-container input[type="date"].input-lg,
  .kityminder-container input[type="time"].input-lg,
  .kityminder-container input[type="datetime-local"].input-lg,
  .kityminder-container input[type="month"].input-lg,
  .kityminder-container .input-group-lg input[type="date"],
  .kityminder-container .input-group-lg input[type="time"],
  .kityminder-container .input-group-lg input[type="datetime-local"],
  .kityminder-container .input-group-lg input[type="month"] {
    line-height: 46px;
  }
}
.kityminder-container .form-group {
  margin-bottom: 15px;
}
.kityminder-container .radio,
.kityminder-container .checkbox {
  position: relative;
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}
.kityminder-container .radio label,
.kityminder-container .checkbox label {
  min-height: 20px;
  padding-left: 20px;
  margin-bottom: 0;
  font-weight: normal;
  cursor: pointer;
}
.kityminder-container .radio input[type="radio"],
.kityminder-container .radio-inline input[type="radio"],
.kityminder-container .checkbox input[type="checkbox"],
.kityminder-container .checkbox-inline input[type="checkbox"] {
  position: absolute;
  margin-top: 4px \\9;
  margin-left: -20px;
}
.kityminder-container .radio + .radio,
.kityminder-container .checkbox + .checkbox {
  margin-top: -5px;
}
.kityminder-container .radio-inline,
.kityminder-container .checkbox-inline {
  position: relative;
  display: inline-block;
  padding-left: 20px;
  margin-bottom: 0;
  font-weight: normal;
  vertical-align: middle;
  cursor: pointer;
}
.kityminder-container .radio-inline + .radio-inline,
.kityminder-container .checkbox-inline + .checkbox-inline {
  margin-top: 0;
  margin-left: 10px;
}
.kityminder-container input[type="radio"][disabled],
.kityminder-container input[type="checkbox"][disabled],
.kityminder-container input[type="radio"].disabled,
.kityminder-container input[type="checkbox"].disabled,
.kityminder-container fieldset[disabled] input[type="radio"],
.kityminder-container fieldset[disabled] input[type="checkbox"] {
  cursor: not-allowed;
}
.kityminder-container .radio-inline.disabled,
.kityminder-container .checkbox-inline.disabled,
.kityminder-container fieldset[disabled] .radio-inline,
.kityminder-container fieldset[disabled] .checkbox-inline {
  cursor: not-allowed;
}
.kityminder-container .radio.disabled label,
.kityminder-container .checkbox.disabled label,
.kityminder-container fieldset[disabled] .radio label,
.kityminder-container fieldset[disabled] .checkbox label {
  cursor: not-allowed;
}
.kityminder-container .form-control-static {
  min-height: 34px;
  padding-top: 7px;
  padding-bottom: 7px;
  margin-bottom: 0;
}
.kityminder-container .form-control-static.input-lg,
.kityminder-container .form-control-static.input-sm {
  padding-right: 0;
  padding-left: 0;
}
.kityminder-container .input-sm {
  height: 30px;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.kityminder-container select.input-sm {
  height: 30px;
  line-height: 30px;
}
.kityminder-container textarea.input-sm,
.kityminder-container select[multiple].input-sm {
  height: auto;
}
.kityminder-container .form-group-sm .form-control {
  height: 30px;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.kityminder-container .form-group-sm select.form-control {
  height: 30px;
  line-height: 30px;
}
.kityminder-container .form-group-sm textarea.form-control,
.kityminder-container .form-group-sm select[multiple].form-control {
  height: auto;
}
.kityminder-container .form-group-sm .form-control-static {
  height: 30px;
  min-height: 32px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1.5;
}
.kityminder-container .input-lg {
  height: 46px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
  border-radius: 6px;
}
.kityminder-container select.input-lg {
  height: 46px;
  line-height: 46px;
}
.kityminder-container textarea.input-lg,
.kityminder-container select[multiple].input-lg {
  height: auto;
}
.kityminder-container .form-group-lg .form-control {
  height: 46px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
  border-radius: 6px;
}
.kityminder-container .form-group-lg select.form-control {
  height: 46px;
  line-height: 46px;
}
.kityminder-container .form-group-lg textarea.form-control,
.kityminder-container .form-group-lg select[multiple].form-control {
  height: auto;
}
.kityminder-container .form-group-lg .form-control-static {
  height: 46px;
  min-height: 38px;
  padding: 11px 16px;
  font-size: 18px;
  line-height: 1.3333333;
}
.kityminder-container .has-feedback {
  position: relative;
}
.kityminder-container .has-feedback .form-control {
  padding-right: 42.5px;
}
.kityminder-container .form-control-feedback {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: block;
  width: 34px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  pointer-events: none;
}
.kityminder-container .input-lg + .form-control-feedback,
.kityminder-container .input-group-lg + .form-control-feedback,
.kityminder-container .form-group-lg .form-control + .form-control-feedback {
  width: 46px;
  height: 46px;
  line-height: 46px;
}
.kityminder-container .input-sm + .form-control-feedback,
.kityminder-container .input-group-sm + .form-control-feedback,
.kityminder-container .form-group-sm .form-control + .form-control-feedback {
  width: 30px;
  height: 30px;
  line-height: 30px;
}
.kityminder-container .has-success .help-block,
.kityminder-container .has-success .control-label,
.kityminder-container .has-success .radio,
.kityminder-container .has-success .checkbox,
.kityminder-container .has-success .radio-inline,
.kityminder-container .has-success .checkbox-inline,
.kityminder-container .has-success.radio label,
.kityminder-container .has-success.checkbox label,
.kityminder-container .has-success.radio-inline label,
.kityminder-container .has-success.checkbox-inline label {
  color: #3c763d;
}
.kityminder-container .has-success .form-control {
  border-color: #3c763d;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
}
.kityminder-container .has-success .form-control:focus {
  border-color: #2b542c;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #67b168;
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #67b168;
}
.kityminder-container .has-success .input-group-addon {
  color: #3c763d;
  background-color: #dff0d8;
  border-color: #3c763d;
}
.kityminder-container .has-success .form-control-feedback {
  color: #3c763d;
}
.kityminder-container .has-warning .help-block,
.kityminder-container .has-warning .control-label,
.kityminder-container .has-warning .radio,
.kityminder-container .has-warning .checkbox,
.kityminder-container .has-warning .radio-inline,
.kityminder-container .has-warning .checkbox-inline,
.kityminder-container .has-warning.radio label,
.kityminder-container .has-warning.checkbox label,
.kityminder-container .has-warning.radio-inline label,
.kityminder-container .has-warning.checkbox-inline label {
  color: #8a6d3b;
}
.kityminder-container .has-warning .form-control {
  border-color: #8a6d3b;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
}
.kityminder-container .has-warning .form-control:focus {
  border-color: #66512c;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #c0a16b;
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #c0a16b;
}
.kityminder-container .has-warning .input-group-addon {
  color: #8a6d3b;
  background-color: #fcf8e3;
  border-color: #8a6d3b;
}
.kityminder-container .has-warning .form-control-feedback {
  color: #8a6d3b;
}
.kityminder-container .has-error .help-block,
.kityminder-container .has-error .control-label,
.kityminder-container .has-error .radio,
.kityminder-container .has-error .checkbox,
.kityminder-container .has-error .radio-inline,
.kityminder-container .has-error .checkbox-inline,
.kityminder-container .has-error.radio label,
.kityminder-container .has-error.checkbox label,
.kityminder-container .has-error.radio-inline label,
.kityminder-container .has-error.checkbox-inline label {
  color: #a94442;
}
.kityminder-container .has-error .form-control {
  border-color: #a94442;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
}
.kityminder-container .has-error .form-control:focus {
  border-color: #843534;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #ce8483;
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #ce8483;
}
.kityminder-container .has-error .input-group-addon {
  color: #a94442;
  background-color: #f2dede;
  border-color: #a94442;
}
.kityminder-container .has-error .form-control-feedback {
  color: #a94442;
}
.kityminder-container .has-feedback label ~ .form-control-feedback {
  top: 25px;
}
.kityminder-container .has-feedback label.sr-only ~ .form-control-feedback {
  top: 0;
}
.kityminder-container .help-block {
  display: block;
  margin-top: 5px;
  margin-bottom: 10px;
  color: #737373;
}
@media (min-width: 768px) {
  .kityminder-container .form-inline .form-group {
    display: inline-block;
    margin-bottom: 0;
    vertical-align: middle;
  }
  .kityminder-container .form-inline .form-control {
    display: inline-block;
    width: auto;
    vertical-align: middle;
  }
  .kityminder-container .form-inline .form-control-static {
    display: inline-block;
  }
  .kityminder-container .form-inline .input-group {
    display: inline-table;
    vertical-align: middle;
  }
  .kityminder-container .form-inline .input-group .input-group-addon,
  .kityminder-container .form-inline .input-group .input-group-btn,
  .kityminder-container .form-inline .input-group .form-control {
    width: auto;
  }
  .kityminder-container .form-inline .input-group > .form-control {
    width: 100%;
  }
  .kityminder-container .form-inline .control-label {
    margin-bottom: 0;
    vertical-align: middle;
  }
  .kityminder-container .form-inline .radio,
  .kityminder-container .form-inline .checkbox {
    display: inline-block;
    margin-top: 0;
    margin-bottom: 0;
    vertical-align: middle;
  }
  .kityminder-container .form-inline .radio label,
  .kityminder-container .form-inline .checkbox label {
    padding-left: 0;
  }
  .kityminder-container .form-inline .radio input[type="radio"],
  .kityminder-container .form-inline .checkbox input[type="checkbox"] {
    position: relative;
    margin-left: 0;
  }
  .kityminder-container .form-inline .has-feedback .form-control-feedback {
    top: 0;
  }
}
.kityminder-container .form-horizontal .radio,
.kityminder-container .form-horizontal .checkbox,
.kityminder-container .form-horizontal .radio-inline,
.kityminder-container .form-horizontal .checkbox-inline {
  padding-top: 7px;
  margin-top: 0;
  margin-bottom: 0;
}
.kityminder-container .form-horizontal .radio,
.kityminder-container .form-horizontal .checkbox {
  min-height: 27px;
}
.kityminder-container .form-horizontal .form-group {
  margin-right: -15px;
  margin-left: -15px;
}
@media (min-width: 768px) {
  .kityminder-container .form-horizontal .control-label {
    padding-top: 7px;
    margin-bottom: 0;
    text-align: right;
  }
}
.kityminder-container .form-horizontal .has-feedback .form-control-feedback {
  right: 15px;
}
@media (min-width: 768px) {
  .kityminder-container .form-horizontal .form-group-lg .control-label {
    padding-top: 11px;
    font-size: 18px;
  }
}
@media (min-width: 768px) {
  .kityminder-container .form-horizontal .form-group-sm .control-label {
    padding-top: 6px;
    font-size: 12px;
  }
}
.kityminder-container .btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
      touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
}
.kityminder-container .btn:focus,
.kityminder-container .btn:active:focus,
.kityminder-container .btn.active:focus,
.kityminder-container .btn.focus,
.kityminder-container .btn:active.focus,
.kityminder-container .btn.active.focus {
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
.kityminder-container .btn:hover,
.kityminder-container .btn:focus,
.kityminder-container .btn.focus {
  color: #333;
  text-decoration: none;
}
.kityminder-container .btn:active,
.kityminder-container .btn.active {
  background-image: none;
  outline: 0;
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
}
.kityminder-container .btn.disabled,
.kityminder-container .btn[disabled],
.kityminder-container fieldset[disabled] .btn {
  cursor: not-allowed;
  filter: alpha(opacity=65);
  -webkit-box-shadow: none;
          box-shadow: none;
  opacity: .65;
}
.kityminder-container a.btn.disabled,
.kityminder-container fieldset[disabled] a.btn {
  pointer-events: none;
}
.kityminder-container .btn-default {
  color: #333;
  background-color: #fff;
  border-color: #ccc;
}
.kityminder-container .btn-default:focus,
.kityminder-container .btn-default.focus {
  color: #333;
  background-color: #e6e6e6;
  border-color: #8c8c8c;
}
.kityminder-container .btn-default:hover {
  color: #333;
  background-color: #e6e6e6;
  border-color: #adadad;
}
.kityminder-container .btn-default:active,
.kityminder-container .btn-default.active,
.kityminder-container .open > .dropdown-toggle.btn-default {
  color: #333;
  background-color: #e6e6e6;
  border-color: #adadad;
}
.kityminder-container .btn-default:active:hover,
.kityminder-container .btn-default.active:hover,
.kityminder-container .open > .dropdown-toggle.btn-default:hover,
.kityminder-container .btn-default:active:focus,
.kityminder-container .btn-default.active:focus,
.kityminder-container .open > .dropdown-toggle.btn-default:focus,
.kityminder-container .btn-default:active.focus,
.kityminder-container .btn-default.active.focus,
.kityminder-container .open > .dropdown-toggle.btn-default.focus {
  color: #333;
  background-color: #d4d4d4;
  border-color: #8c8c8c;
}
.kityminder-container .btn-default:active,
.kityminder-container .btn-default.active,
.kityminder-container .open > .dropdown-toggle.btn-default {
  background-image: none;
}
.kityminder-container .btn-default.disabled:hover,
.kityminder-container .btn-default[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-default:hover,
.kityminder-container .btn-default.disabled:focus,
.kityminder-container .btn-default[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-default:focus,
.kityminder-container .btn-default.disabled.focus,
.kityminder-container .btn-default[disabled].focus,
.kityminder-container fieldset[disabled] .btn-default.focus {
  background-color: #fff;
  border-color: #ccc;
}
.kityminder-container .btn-default .badge {
  color: #fff;
  background-color: #333;
}
.kityminder-container .btn-primary {
  color: #fff;
  background-color: #337ab7;
  border-color: #2e6da4;
}
.kityminder-container .btn-primary:focus,
.kityminder-container .btn-primary.focus {
  color: #fff;
  background-color: #286090;
  border-color: #122b40;
}
.kityminder-container .btn-primary:hover {
  color: #fff;
  background-color: #286090;
  border-color: #204d74;
}
.kityminder-container .btn-primary:active,
.kityminder-container .btn-primary.active,
.kityminder-container .open > .dropdown-toggle.btn-primary {
  color: #fff;
  background-color: #286090;
  border-color: #204d74;
}
.kityminder-container .btn-primary:active:hover,
.kityminder-container .btn-primary.active:hover,
.kityminder-container .open > .dropdown-toggle.btn-primary:hover,
.kityminder-container .btn-primary:active:focus,
.kityminder-container .btn-primary.active:focus,
.kityminder-container .open > .dropdown-toggle.btn-primary:focus,
.kityminder-container .btn-primary:active.focus,
.kityminder-container .btn-primary.active.focus,
.kityminder-container .open > .dropdown-toggle.btn-primary.focus {
  color: #fff;
  background-color: #204d74;
  border-color: #122b40;
}
.kityminder-container .btn-primary:active,
.kityminder-container .btn-primary.active,
.kityminder-container .open > .dropdown-toggle.btn-primary {
  background-image: none;
}
.kityminder-container .btn-primary.disabled:hover,
.kityminder-container .btn-primary[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-primary:hover,
.kityminder-container .btn-primary.disabled:focus,
.kityminder-container .btn-primary[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-primary:focus,
.kityminder-container .btn-primary.disabled.focus,
.kityminder-container .btn-primary[disabled].focus,
.kityminder-container fieldset[disabled] .btn-primary.focus {
  background-color: #337ab7;
  border-color: #2e6da4;
}
.kityminder-container .btn-primary .badge {
  color: #337ab7;
  background-color: #fff;
}
.kityminder-container .btn-success {
  color: #fff;
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.kityminder-container .btn-success:focus,
.kityminder-container .btn-success.focus {
  color: #fff;
  background-color: #449d44;
  border-color: #255625;
}
.kityminder-container .btn-success:hover {
  color: #fff;
  background-color: #449d44;
  border-color: #398439;
}
.kityminder-container .btn-success:active,
.kityminder-container .btn-success.active,
.kityminder-container .open > .dropdown-toggle.btn-success {
  color: #fff;
  background-color: #449d44;
  border-color: #398439;
}
.kityminder-container .btn-success:active:hover,
.kityminder-container .btn-success.active:hover,
.kityminder-container .open > .dropdown-toggle.btn-success:hover,
.kityminder-container .btn-success:active:focus,
.kityminder-container .btn-success.active:focus,
.kityminder-container .open > .dropdown-toggle.btn-success:focus,
.kityminder-container .btn-success:active.focus,
.kityminder-container .btn-success.active.focus,
.kityminder-container .open > .dropdown-toggle.btn-success.focus {
  color: #fff;
  background-color: #398439;
  border-color: #255625;
}
.kityminder-container .btn-success:active,
.kityminder-container .btn-success.active,
.kityminder-container .open > .dropdown-toggle.btn-success {
  background-image: none;
}
.kityminder-container .btn-success.disabled:hover,
.kityminder-container .btn-success[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-success:hover,
.kityminder-container .btn-success.disabled:focus,
.kityminder-container .btn-success[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-success:focus,
.kityminder-container .btn-success.disabled.focus,
.kityminder-container .btn-success[disabled].focus,
.kityminder-container fieldset[disabled] .btn-success.focus {
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.kityminder-container .btn-success .badge {
  color: #5cb85c;
  background-color: #fff;
}
.kityminder-container .btn-info {
  color: #fff;
  background-color: #5bc0de;
  border-color: #46b8da;
}
.kityminder-container .btn-info:focus,
.kityminder-container .btn-info.focus {
  color: #fff;
  background-color: #31b0d5;
  border-color: #1b6d85;
}
.kityminder-container .btn-info:hover {
  color: #fff;
  background-color: #31b0d5;
  border-color: #269abc;
}
.kityminder-container .btn-info:active,
.kityminder-container .btn-info.active,
.kityminder-container .open > .dropdown-toggle.btn-info {
  color: #fff;
  background-color: #31b0d5;
  border-color: #269abc;
}
.kityminder-container .btn-info:active:hover,
.kityminder-container .btn-info.active:hover,
.kityminder-container .open > .dropdown-toggle.btn-info:hover,
.kityminder-container .btn-info:active:focus,
.kityminder-container .btn-info.active:focus,
.kityminder-container .open > .dropdown-toggle.btn-info:focus,
.kityminder-container .btn-info:active.focus,
.kityminder-container .btn-info.active.focus,
.kityminder-container .open > .dropdown-toggle.btn-info.focus {
  color: #fff;
  background-color: #269abc;
  border-color: #1b6d85;
}
.kityminder-container .btn-info:active,
.kityminder-container .btn-info.active,
.kityminder-container .open > .dropdown-toggle.btn-info {
  background-image: none;
}
.kityminder-container .btn-info.disabled:hover,
.kityminder-container .btn-info[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-info:hover,
.kityminder-container .btn-info.disabled:focus,
.kityminder-container .btn-info[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-info:focus,
.kityminder-container .btn-info.disabled.focus,
.kityminder-container .btn-info[disabled].focus,
.kityminder-container fieldset[disabled] .btn-info.focus {
  background-color: #5bc0de;
  border-color: #46b8da;
}
.kityminder-container .btn-info .badge {
  color: #5bc0de;
  background-color: #fff;
}
.kityminder-container .btn-warning {
  color: #fff;
  background-color: #f0ad4e;
  border-color: #eea236;
}
.kityminder-container .btn-warning:focus,
.kityminder-container .btn-warning.focus {
  color: #fff;
  background-color: #ec971f;
  border-color: #985f0d;
}
.kityminder-container .btn-warning:hover {
  color: #fff;
  background-color: #ec971f;
  border-color: #d58512;
}
.kityminder-container .btn-warning:active,
.kityminder-container .btn-warning.active,
.kityminder-container .open > .dropdown-toggle.btn-warning {
  color: #fff;
  background-color: #ec971f;
  border-color: #d58512;
}
.kityminder-container .btn-warning:active:hover,
.kityminder-container .btn-warning.active:hover,
.kityminder-container .open > .dropdown-toggle.btn-warning:hover,
.kityminder-container .btn-warning:active:focus,
.kityminder-container .btn-warning.active:focus,
.kityminder-container .open > .dropdown-toggle.btn-warning:focus,
.kityminder-container .btn-warning:active.focus,
.kityminder-container .btn-warning.active.focus,
.kityminder-container .open > .dropdown-toggle.btn-warning.focus {
  color: #fff;
  background-color: #d58512;
  border-color: #985f0d;
}
.kityminder-container .btn-warning:active,
.kityminder-container .btn-warning.active,
.kityminder-container .open > .dropdown-toggle.btn-warning {
  background-image: none;
}
.kityminder-container .btn-warning.disabled:hover,
.kityminder-container .btn-warning[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-warning:hover,
.kityminder-container .btn-warning.disabled:focus,
.kityminder-container .btn-warning[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-warning:focus,
.kityminder-container .btn-warning.disabled.focus,
.kityminder-container .btn-warning[disabled].focus,
.kityminder-container fieldset[disabled] .btn-warning.focus {
  background-color: #f0ad4e;
  border-color: #eea236;
}
.kityminder-container .btn-warning .badge {
  color: #f0ad4e;
  background-color: #fff;
}
.kityminder-container .btn-danger {
  color: #fff;
  background-color: #d9534f;
  border-color: #d43f3a;
}
.kityminder-container .btn-danger:focus,
.kityminder-container .btn-danger.focus {
  color: #fff;
  background-color: #c9302c;
  border-color: #761c19;
}
.kityminder-container .btn-danger:hover {
  color: #fff;
  background-color: #c9302c;
  border-color: #ac2925;
}
.kityminder-container .btn-danger:active,
.kityminder-container .btn-danger.active,
.kityminder-container .open > .dropdown-toggle.btn-danger {
  color: #fff;
  background-color: #c9302c;
  border-color: #ac2925;
}
.kityminder-container .btn-danger:active:hover,
.kityminder-container .btn-danger.active:hover,
.kityminder-container .open > .dropdown-toggle.btn-danger:hover,
.kityminder-container .btn-danger:active:focus,
.kityminder-container .btn-danger.active:focus,
.kityminder-container .open > .dropdown-toggle.btn-danger:focus,
.kityminder-container .btn-danger:active.focus,
.kityminder-container .btn-danger.active.focus,
.kityminder-container .open > .dropdown-toggle.btn-danger.focus {
  color: #fff;
  background-color: #ac2925;
  border-color: #761c19;
}
.kityminder-container .btn-danger:active,
.kityminder-container .btn-danger.active,
.kityminder-container .open > .dropdown-toggle.btn-danger {
  background-image: none;
}
.kityminder-container .btn-danger.disabled:hover,
.kityminder-container .btn-danger[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-danger:hover,
.kityminder-container .btn-danger.disabled:focus,
.kityminder-container .btn-danger[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-danger:focus,
.kityminder-container .btn-danger.disabled.focus,
.kityminder-container .btn-danger[disabled].focus,
.kityminder-container fieldset[disabled] .btn-danger.focus {
  background-color: #d9534f;
  border-color: #d43f3a;
}
.kityminder-container .btn-danger .badge {
  color: #d9534f;
  background-color: #fff;
}
.kityminder-container .btn-link {
  font-weight: normal;
  color: #337ab7;
  border-radius: 0;
}
.kityminder-container .btn-link,
.kityminder-container .btn-link:active,
.kityminder-container .btn-link.active,
.kityminder-container .btn-link[disabled],
.kityminder-container fieldset[disabled] .btn-link {
  background-color: transparent;
  -webkit-box-shadow: none;
          box-shadow: none;
}
.kityminder-container .btn-link,
.kityminder-container .btn-link:hover,
.kityminder-container .btn-link:focus,
.kityminder-container .btn-link:active {
  border-color: transparent;
}
.kityminder-container .btn-link:hover,
.kityminder-container .btn-link:focus {
  color: #23527c;
  text-decoration: underline;
  background-color: transparent;
}
.kityminder-container .btn-link[disabled]:hover,
.kityminder-container fieldset[disabled] .btn-link:hover,
.kityminder-container .btn-link[disabled]:focus,
.kityminder-container fieldset[disabled] .btn-link:focus {
  color: #777;
  text-decoration: none;
}
.kityminder-container .btn-lg,
.kityminder-container .btn-group-lg > .btn {
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
  border-radius: 6px;
}
.kityminder-container .btn-sm,
.kityminder-container .btn-group-sm > .btn {
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.kityminder-container .btn-xs,
.kityminder-container .btn-group-xs > .btn {
  padding: 1px 5px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.kityminder-container .btn-block {
  display: block;
  width: 100%;
}
.kityminder-container .btn-block + .btn-block {
  margin-top: 5px;
}
.kityminder-container input[type="submit"].btn-block,
.kityminder-container input[type="reset"].btn-block,
.kityminder-container input[type="button"].btn-block {
  width: 100%;
}
.kityminder-container .fade {
  opacity: 0;
  -webkit-transition: opacity .15s linear;
       -o-transition: opacity .15s linear;
          transition: opacity .15s linear;
}
.kityminder-container .fade.in {
  opacity: 1;
}
.kityminder-container .collapse {
  display: none;
}
.kityminder-container .collapse.in {
  display: block;
}
.kityminder-container tr.collapse.in {
  display: table-row;
}
.kityminder-container tbody.collapse.in {
  display: table-row-group;
}
.kityminder-container .collapsing {
  position: relative;
  height: 0;
  overflow: hidden;
  -webkit-transition-timing-function: ease;
       -o-transition-timing-function: ease;
          transition-timing-function: ease;
  -webkit-transition-duration: .35s;
       -o-transition-duration: .35s;
          transition-duration: .35s;
  -webkit-transition-property: height, visibility;
       -o-transition-property: height, visibility;
          transition-property: height, visibility;
}
.kityminder-container .caret {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 2px;
  vertical-align: middle;
  border-top: 4px dashed;
  border-top: 4px solid \\9;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
}
.kityminder-container .dropup,
.kityminder-container .dropdown {
  position: relative;
}
.kityminder-container .dropdown-toggle:focus {
  outline: 0;
}
.kityminder-container .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  float: left;
  min-width: 160px;
  padding: 5px 0;
  margin: 2px 0 0;
  font-size: 14px;
  text-align: left;
  list-style: none;
  background-color: #fff;
  -webkit-background-clip: padding-box;
          background-clip: padding-box;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, .15);
  border-radius: 4px;
  -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
          box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
}
.kityminder-container .dropdown-menu.pull-right {
  right: 0;
  left: auto;
}
.kityminder-container .dropdown-menu .divider {
  height: 1px;
  margin: 9px 0;
  overflow: hidden;
  background-color: #e5e5e5;
}
.kityminder-container .dropdown-menu > li > a {
  display: block;
  padding: 3px 20px;
  clear: both;
  font-weight: normal;
  line-height: 1.42857143;
  color: #333;
  white-space: nowrap;
}
.kityminder-container .dropdown-menu > li > a:hover,
.kityminder-container .dropdown-menu > li > a:focus {
  color: #262626;
  text-decoration: none;
  background-color: #f5f5f5;
}
.kityminder-container .dropdown-menu > .active > a,
.kityminder-container .dropdown-menu > .active > a:hover,
.kityminder-container .dropdown-menu > .active > a:focus {
  color: #fff;
  text-decoration: none;
  background-color: #337ab7;
  outline: 0;
}
.kityminder-container .dropdown-menu > .disabled > a,
.kityminder-container .dropdown-menu > .disabled > a:hover,
.kityminder-container .dropdown-menu > .disabled > a:focus {
  color: #777;
}
.kityminder-container .dropdown-menu > .disabled > a:hover,
.kityminder-container .dropdown-menu > .disabled > a:focus {
  text-decoration: none;
  cursor: not-allowed;
  background-color: transparent;
  background-image: none;
  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
}
.kityminder-container .open > .dropdown-menu {
  display: block;
}
.kityminder-container .open > a {
  outline: 0;
}
.kityminder-container .dropdown-menu-right {
  right: 0;
  left: auto;
}
.kityminder-container .dropdown-menu-left {
  right: auto;
  left: 0;
}
.kityminder-container .dropdown-header {
  display: block;
  padding: 3px 20px;
  font-size: 12px;
  line-height: 1.42857143;
  color: #777;
  white-space: nowrap;
}
.kityminder-container .dropdown-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 990;
}
.kityminder-container .pull-right > .dropdown-menu {
  right: 0;
  left: auto;
}
.kityminder-container .dropup .caret,
.kityminder-container .navbar-fixed-bottom .dropdown .caret {
  content: "";
  border-top: 0;
  border-bottom: 4px dashed;
  border-bottom: 4px solid \\9;
}
.kityminder-container .dropup .dropdown-menu,
.kityminder-container .navbar-fixed-bottom .dropdown .dropdown-menu {
  top: auto;
  bottom: 100%;
  margin-bottom: 2px;
}
@media (min-width: 768px) {
  .kityminder-container .navbar-right .dropdown-menu {
    right: 0;
    left: auto;
  }
  .kityminder-container .navbar-right .dropdown-menu-left {
    right: auto;
    left: 0;
  }
}
.kityminder-container .btn-group,
.kityminder-container .btn-group-vertical {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}
.kityminder-container .btn-group > .btn,
.kityminder-container .btn-group-vertical > .btn {
  position: relative;
  float: left;
}
.kityminder-container .btn-group > .btn:hover,
.kityminder-container .btn-group-vertical > .btn:hover,
.kityminder-container .btn-group > .btn:focus,
.kityminder-container .btn-group-vertical > .btn:focus,
.kityminder-container .btn-group > .btn:active,
.kityminder-container .btn-group-vertical > .btn:active,
.kityminder-container .btn-group > .btn.active,
.kityminder-container .btn-group-vertical > .btn.active {
  z-index: 2;
}
.kityminder-container .btn-group .btn + .btn,
.kityminder-container .btn-group .btn + .btn-group,
.kityminder-container .btn-group .btn-group + .btn,
.kityminder-container .btn-group .btn-group + .btn-group {
  margin-left: -1px;
}
.kityminder-container .btn-toolbar {
  margin-left: -5px;
}
.kityminder-container .btn-toolbar .btn,
.kityminder-container .btn-toolbar .btn-group,
.kityminder-container .btn-toolbar .input-group {
  float: left;
}
.kityminder-container .btn-toolbar > .btn,
.kityminder-container .btn-toolbar > .btn-group,
.kityminder-container .btn-toolbar > .input-group {
  margin-left: 5px;
}
.kityminder-container .btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {
  border-radius: 0;
}
.kityminder-container .btn-group > .btn:first-child {
  margin-left: 0;
}
.kityminder-container .btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.kityminder-container .btn-group > .btn:last-child:not(:first-child),
.kityminder-container .btn-group > .dropdown-toggle:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.kityminder-container .btn-group > .btn-group {
  float: left;
}
.kityminder-container .btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {
  border-radius: 0;
}
.kityminder-container .btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,
.kityminder-container .btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.kityminder-container .btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.kityminder-container .btn-group .dropdown-toggle:active,
.kityminder-container .btn-group.open .dropdown-toggle {
  outline: 0;
}
.kityminder-container .btn-group > .btn + .dropdown-toggle {
  padding-right: 8px;
  padding-left: 8px;
}
.kityminder-container .btn-group > .btn-lg + .dropdown-toggle {
  padding-right: 12px;
  padding-left: 12px;
}
.kityminder-container .btn-group.open .dropdown-toggle {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
}
.kityminder-container .btn-group.open .dropdown-toggle.btn-link {
  -webkit-box-shadow: none;
          box-shadow: none;
}
.kityminder-container .btn .caret {
  margin-left: 0;
}
.kityminder-container .btn-lg .caret {
  border-width: 5px 5px 0;
  border-bottom-width: 0;
}
.kityminder-container .dropup .btn-lg .caret {
  border-width: 0 5px 5px;
}
.kityminder-container .btn-group-vertical > .btn,
.kityminder-container .btn-group-vertical > .btn-group,
.kityminder-container .btn-group-vertical > .btn-group > .btn {
  display: block;
  float: none;
  width: 100%;
  max-width: 100%;
}
.kityminder-container .btn-group-vertical > .btn-group > .btn {
  float: none;
}
.kityminder-container .btn-group-vertical > .btn + .btn,
.kityminder-container .btn-group-vertical > .btn + .btn-group,
.kityminder-container .btn-group-vertical > .btn-group + .btn,
.kityminder-container .btn-group-vertical > .btn-group + .btn-group {
  margin-top: -1px;
  margin-left: 0;
}
.kityminder-container .btn-group-vertical > .btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}
.kityminder-container .btn-group-vertical > .btn:first-child:not(:last-child) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.kityminder-container .btn-group-vertical > .btn:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
.kityminder-container .btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {
  border-radius: 0;
}
.kityminder-container .btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,
.kityminder-container .btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.kityminder-container .btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.kityminder-container .btn-group-justified {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
}
.kityminder-container .btn-group-justified > .btn,
.kityminder-container .btn-group-justified > .btn-group {
  display: table-cell;
  float: none;
  width: 1%;
}
.kityminder-container .btn-group-justified > .btn-group .btn {
  width: 100%;
}
.kityminder-container .btn-group-justified > .btn-group .dropdown-menu {
  left: auto;
}
.kityminder-container [data-toggle="buttons"] > .btn input[type="radio"],
.kityminder-container [data-toggle="buttons"] > .btn-group > .btn input[type="radio"],
.kityminder-container [data-toggle="buttons"] > .btn input[type="checkbox"],
.kityminder-container [data-toggle="buttons"] > .btn-group > .btn input[type="checkbox"] {
  position: absolute;
  clip: rect(0, 0, 0, 0);
  pointer-events: none;
}
.kityminder-container .input-group {
  position: relative;
  display: table;
  border-collapse: separate;
}
.kityminder-container .input-group[class*="col-"] {
  float: none;
  padding-right: 0;
  padding-left: 0;
}
.kityminder-container .input-group .form-control {
  position: relative;
  z-index: 2;
  float: left;
  width: 100%;
  margin-bottom: 0;
}
.kityminder-container .input-group .form-control:focus {
  z-index: 3;
}
.kityminder-container .input-group-lg > .form-control,
.kityminder-container .input-group-lg > .input-group-addon,
.kityminder-container .input-group-lg > .input-group-btn > .btn {
  height: 46px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
  border-radius: 6px;
}
.kityminder-container select.input-group-lg > .form-control,
.kityminder-container select.input-group-lg > .input-group-addon,
.kityminder-container select.input-group-lg > .input-group-btn > .btn {
  height: 46px;
  line-height: 46px;
}
.kityminder-container textarea.input-group-lg > .form-control,
.kityminder-container textarea.input-group-lg > .input-group-addon,
.kityminder-container textarea.input-group-lg > .input-group-btn > .btn,
.kityminder-container select[multiple].input-group-lg > .form-control,
.kityminder-container select[multiple].input-group-lg > .input-group-addon,
.kityminder-container select[multiple].input-group-lg > .input-group-btn > .btn {
  height: auto;
}
.kityminder-container .input-group-sm > .form-control,
.kityminder-container .input-group-sm > .input-group-addon,
.kityminder-container .input-group-sm > .input-group-btn > .btn {
  height: 30px;
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.kityminder-container select.input-group-sm > .form-control,
.kityminder-container select.input-group-sm > .input-group-addon,
.kityminder-container select.input-group-sm > .input-group-btn > .btn {
  height: 30px;
  line-height: 30px;
}
.kityminder-container textarea.input-group-sm > .form-control,
.kityminder-container textarea.input-group-sm > .input-group-addon,
.kityminder-container textarea.input-group-sm > .input-group-btn > .btn,
.kityminder-container select[multiple].input-group-sm > .form-control,
.kityminder-container select[multiple].input-group-sm > .input-group-addon,
.kityminder-container select[multiple].input-group-sm > .input-group-btn > .btn {
  height: auto;
}
.kityminder-container .input-group-addon,
.kityminder-container .input-group-btn,
.kityminder-container .input-group .form-control {
  display: table-cell;
}
.kityminder-container .input-group-addon:not(:first-child):not(:last-child),
.kityminder-container .input-group-btn:not(:first-child):not(:last-child),
.kityminder-container .input-group .form-control:not(:first-child):not(:last-child) {
  border-radius: 0;
}
.kityminder-container .input-group-addon,
.kityminder-container .input-group-btn {
  width: 1%;
  white-space: nowrap;
  vertical-align: middle;
}
.kityminder-container .input-group-addon {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: normal;
  line-height: 1;
  color: #555;
  text-align: center;
  background-color: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.kityminder-container .input-group-addon.input-sm {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 3px;
}
.kityminder-container .input-group-addon.input-lg {
  padding: 10px 16px;
  font-size: 18px;
  border-radius: 6px;
}
.kityminder-container .input-group-addon input[type="radio"],
.kityminder-container .input-group-addon input[type="checkbox"] {
  margin-top: 0;
}
.kityminder-container .input-group .form-control:first-child,
.kityminder-container .input-group-addon:first-child,
.kityminder-container .input-group-btn:first-child > .btn,
.kityminder-container .input-group-btn:first-child > .btn-group > .btn,
.kityminder-container .input-group-btn:first-child > .dropdown-toggle,
.kityminder-container .input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle),
.kityminder-container .input-group-btn:last-child > .btn-group:not(:last-child) > .btn {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.kityminder-container .input-group-addon:first-child {
  border-right: 0;
}
.kityminder-container .input-group .form-control:last-child,
.kityminder-container .input-group-addon:last-child,
.kityminder-container .input-group-btn:last-child > .btn,
.kityminder-container .input-group-btn:last-child > .btn-group > .btn,
.kityminder-container .input-group-btn:last-child > .dropdown-toggle,
.kityminder-container .input-group-btn:first-child > .btn:not(:first-child),
.kityminder-container .input-group-btn:first-child > .btn-group:not(:first-child) > .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.kityminder-container .input-group-addon:last-child {
  border-left: 0;
}
.kityminder-container .input-group-btn {
  position: relative;
  font-size: 0;
  white-space: nowrap;
}
.kityminder-container .input-group-btn > .btn {
  position: relative;
}
.kityminder-container .input-group-btn > .btn + .btn {
  margin-left: -1px;
}
.kityminder-container .input-group-btn > .btn:hover,
.kityminder-container .input-group-btn > .btn:focus,
.kityminder-container .input-group-btn > .btn:active {
  z-index: 2;
}
.kityminder-container .input-group-btn:first-child > .btn,
.kityminder-container .input-group-btn:first-child > .btn-group {
  margin-right: -1px;
}
.kityminder-container .input-group-btn:last-child > .btn,
.kityminder-container .input-group-btn:last-child > .btn-group {
  z-index: 2;
  margin-left: -1px;
}
.kityminder-container .nav {
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}
.kityminder-container .nav > li {
  position: relative;
  display: block;
}
.kityminder-container .nav > li > a {
  position: relative;
  display: block;
  padding: 10px 15px;
}
.kityminder-container .nav > li > a:hover,
.kityminder-container .nav > li > a:focus {
  text-decoration: none;
  background-color: #eee;
}
.kityminder-container .nav > li.disabled > a {
  color: #777;
}
.kityminder-container .nav > li.disabled > a:hover,
.kityminder-container .nav > li.disabled > a:focus {
  color: #777;
  text-decoration: none;
  cursor: not-allowed;
  background-color: transparent;
}
.kityminder-container .nav .open > a,
.kityminder-container .nav .open > a:hover,
.kityminder-container .nav .open > a:focus {
  background-color: #eee;
  border-color: #337ab7;
}
.kityminder-container .nav .nav-divider {
  height: 1px;
  margin: 9px 0;
  overflow: hidden;
  background-color: #e5e5e5;
}
.kityminder-container .nav > li > a > img {
  max-width: none;
}
.kityminder-container .nav-tabs {
  border-bottom: 1px solid #ddd;
}
.kityminder-container .nav-tabs > li {
  float: left;
  margin-bottom: -1px;
}
.kityminder-container .nav-tabs > li > a {
  margin-right: 2px;
  line-height: 1.42857143;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
}
.kityminder-container .nav-tabs > li > a:hover {
  border-color: #eee #eee #ddd;
}
.kityminder-container .nav-tabs > li.active > a,
.kityminder-container .nav-tabs > li.active > a:hover,
.kityminder-container .nav-tabs > li.active > a:focus {
  color: #555;
  cursor: default;
  background-color: #fff;
  border: 1px solid #ddd;
  border-bottom-color: transparent;
}
.kityminder-container .nav-tabs.nav-justified {
  width: 100%;
  border-bottom: 0;
}
.kityminder-container .nav-tabs.nav-justified > li {
  float: none;
}
.kityminder-container .nav-tabs.nav-justified > li > a {
  margin-bottom: 5px;
  text-align: center;
}
.kityminder-container .nav-tabs.nav-justified > .dropdown .dropdown-menu {
  top: auto;
  left: auto;
}
@media (min-width: 768px) {
  .kityminder-container .nav-tabs.nav-justified > li {
    display: table-cell;
    width: 1%;
  }
  .kityminder-container .nav-tabs.nav-justified > li > a {
    margin-bottom: 0;
  }
}
.kityminder-container .nav-tabs.nav-justified > li > a {
  margin-right: 0;
  border-radius: 4px;
}
.kityminder-container .nav-tabs.nav-justified > .active > a,
.kityminder-container .nav-tabs.nav-justified > .active > a:hover,
.kityminder-container .nav-tabs.nav-justified > .active > a:focus {
  border: 1px solid #ddd;
}
@media (min-width: 768px) {
  .kityminder-container .nav-tabs.nav-justified > li > a {
    border-bottom: 1px solid #ddd;
    border-radius: 4px 4px 0 0;
  }
  .kityminder-container .nav-tabs.nav-justified > .active > a,
  .kityminder-container .nav-tabs.nav-justified > .active > a:hover,
  .kityminder-container .nav-tabs.nav-justified > .active > a:focus {
    border-bottom-color: #fff;
  }
}
.kityminder-container .nav-pills > li {
  float: left;
}
.kityminder-container .nav-pills > li > a {
  border-radius: 4px;
}
.kityminder-container .nav-pills > li + li {
  margin-left: 2px;
}
.kityminder-container .nav-pills > li.active > a,
.kityminder-container .nav-pills > li.active > a:hover,
.kityminder-container .nav-pills > li.active > a:focus {
  color: #fff;
  background-color: #337ab7;
}
.kityminder-container .nav-stacked > li {
  float: none;
}
.kityminder-container .nav-stacked > li + li {
  margin-top: 2px;
  margin-left: 0;
}
.kityminder-container .nav-justified {
  width: 100%;
}
.kityminder-container .nav-justified > li {
  float: none;
}
.kityminder-container .nav-justified > li > a {
  margin-bottom: 5px;
  text-align: center;
}
.kityminder-container .nav-justified > .dropdown .dropdown-menu {
  top: auto;
  left: auto;
}
@media (min-width: 768px) {
  .kityminder-container .nav-justified > li {
    display: table-cell;
    width: 1%;
  }
  .kityminder-container .nav-justified > li > a {
    margin-bottom: 0;
  }
}
.kityminder-container .nav-tabs-justified {
  border-bottom: 0;
}
.kityminder-container .nav-tabs-justified > li > a {
  margin-right: 0;
  border-radius: 4px;
}
.kityminder-container .nav-tabs-justified > .active > a,
.kityminder-container .nav-tabs-justified > .active > a:hover,
.kityminder-container .nav-tabs-justified > .active > a:focus {
  border: 1px solid #ddd;
}
@media (min-width: 768px) {
  .kityminder-container .nav-tabs-justified > li > a {
    border-bottom: 1px solid #ddd;
    border-radius: 4px 4px 0 0;
  }
  .kityminder-container .nav-tabs-justified > .active > a,
  .kityminder-container .nav-tabs-justified > .active > a:hover,
  .kityminder-container .nav-tabs-justified > .active > a:focus {
    border-bottom-color: #fff;
  }
}
.kityminder-container .tab-content > .tab-pane {
  display: none;
}
.kityminder-container .tab-content > .active {
  display: block;
}
.kityminder-container .nav-tabs .dropdown-menu {
  margin-top: -1px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.kityminder-container .navbar {
  position: relative;
  min-height: 50px;
  margin-bottom: 20px;
  border: 1px solid transparent;
}
@media (min-width: 768px) {
  .kityminder-container .navbar {
    border-radius: 4px;
  }
}
@media (min-width: 768px) {
  .kityminder-container .navbar-header {
    float: left;
  }
}
.kityminder-container .navbar-collapse {
  padding-right: 15px;
  padding-left: 15px;
  overflow-x: visible;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid transparent;
  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1);
}
.kityminder-container .navbar-collapse.in {
  overflow-y: auto;
}
@media (min-width: 768px) {
  .kityminder-container .navbar-collapse {
    width: auto;
    border-top: 0;
    -webkit-box-shadow: none;
            box-shadow: none;
  }
  .kityminder-container .navbar-collapse.collapse {
    display: block !important;
    height: auto !important;
    padding-bottom: 0;
    overflow: visible !important;
  }
  .kityminder-container .navbar-collapse.in {
    overflow-y: visible;
  }
  .kityminder-container .navbar-fixed-top .navbar-collapse,
  .kityminder-container .navbar-static-top .navbar-collapse,
  .kityminder-container .navbar-fixed-bottom .navbar-collapse {
    padding-right: 0;
    padding-left: 0;
  }
}
.kityminder-container .navbar-fixed-top .navbar-collapse,
.kityminder-container .navbar-fixed-bottom .navbar-collapse {
  max-height: 340px;
}
@media (max-device-width: 480px) and (orientation: landscape) {
  .kityminder-container .navbar-fixed-top .navbar-collapse,
  .kityminder-container .navbar-fixed-bottom .navbar-collapse {
    max-height: 200px;
  }
}
.kityminder-container .container > .navbar-header,
.kityminder-container .container-fluid > .navbar-header,
.kityminder-container .container > .navbar-collapse,
.kityminder-container .container-fluid > .navbar-collapse {
  margin-right: -15px;
  margin-left: -15px;
}
@media (min-width: 768px) {
  .kityminder-container .container > .navbar-header,
  .kityminder-container .container-fluid > .navbar-header,
  .kityminder-container .container > .navbar-collapse,
  .kityminder-container .container-fluid > .navbar-collapse {
    margin-right: 0;
    margin-left: 0;
  }
}
.kityminder-container .navbar-static-top {
  z-index: 1000;
  border-width: 0 0 1px;
}
@media (min-width: 768px) {
  .kityminder-container .navbar-static-top {
    border-radius: 0;
  }
}
.kityminder-container .navbar-fixed-top,
.kityminder-container .navbar-fixed-bottom {
  position: fixed;
  right: 0;
  left: 0;
  z-index: 1030;
}
@media (min-width: 768px) {
  .kityminder-container .navbar-fixed-top,
  .kityminder-container .navbar-fixed-bottom {
    border-radius: 0;
  }
}
.kityminder-container .navbar-fixed-top {
  top: 0;
  border-width: 0 0 1px;
}
.kityminder-container .navbar-fixed-bottom {
  bottom: 0;
  margin-bottom: 0;
  border-width: 1px 0 0;
}
.kityminder-container .navbar-brand {
  float: left;
  height: 50px;
  padding: 15px 15px;
  font-size: 18px;
  line-height: 20px;
}
.kityminder-container .navbar-brand:hover,
.kityminder-container .navbar-brand:focus {
  text-decoration: none;
}
.kityminder-container .navbar-brand > img {
  display: block;
}
@media (min-width: 768px) {
  .kityminder-container .navbar > .container .navbar-brand,
  .kityminder-container .navbar > .container-fluid .navbar-brand {
    margin-left: -15px;
  }
}
.kityminder-container .navbar-toggle {
  position: relative;
  float: right;
  padding: 9px 10px;
  margin-top: 8px;
  margin-right: 15px;
  margin-bottom: 8px;
  background-color: transparent;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
}
.kityminder-container .navbar-toggle:focus {
  outline: 0;
}
.kityminder-container .navbar-toggle .icon-bar {
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 1px;
}
.kityminder-container .navbar-toggle .icon-bar + .icon-bar {
  margin-top: 4px;
}
@media (min-width: 768px) {
  .kityminder-container .navbar-toggle {
    display: none;
  }
}
.kityminder-container .navbar-nav {
  margin: 7.5px -15px;
}
.kityminder-container .navbar-nav > li > a {
  padding-top: 10px;
  padding-bottom: 10px;
  line-height: 20px;
}
@media (max-width: 767px) {
  .kityminder-container .navbar-nav .open .dropdown-menu {
    position: static;
    float: none;
    width: auto;
    margin-top: 0;
    background-color: transparent;
    border: 0;
    -webkit-box-shadow: none;
            box-shadow: none;
  }
  .kityminder-container .navbar-nav .open .dropdown-menu > li > a,
  .kityminder-container .navbar-nav .open .dropdown-menu .dropdown-header {
    padding: 5px 15px 5px 25px;
  }
  .kityminder-container .navbar-nav .open .dropdown-menu > li > a {
    line-height: 20px;
  }
  .kityminder-container .navbar-nav .open .dropdown-menu > li > a:hover,
  .kityminder-container .navbar-nav .open .dropdown-menu > li > a:focus {
    background-image: none;
  }
}
@media (min-width: 768px) {
  .kityminder-container .navbar-nav {
    float: left;
    margin: 0;
  }
  .kityminder-container .navbar-nav > li {
    float: left;
  }
  .kityminder-container .navbar-nav > li > a {
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
.kityminder-container .navbar-form {
  padding: 10px 15px;
  margin-top: 8px;
  margin-right: -15px;
  margin-bottom: 8px;
  margin-left: -15px;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 1px 0 rgba(255, 255, 255, .1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 1px 0 rgba(255, 255, 255, .1);
}
@media (min-width: 768px) {
  .kityminder-container .navbar-form .form-group {
    display: inline-block;
    margin-bottom: 0;
    vertical-align: middle;
  }
  .kityminder-container .navbar-form .form-control {
    display: inline-block;
    width: auto;
    vertical-align: middle;
  }
  .kityminder-container .navbar-form .form-control-static {
    display: inline-block;
  }
  .kityminder-container .navbar-form .input-group {
    display: inline-table;
    vertical-align: middle;
  }
  .kityminder-container .navbar-form .input-group .input-group-addon,
  .kityminder-container .navbar-form .input-group .input-group-btn,
  .kityminder-container .navbar-form .input-group .form-control {
    width: auto;
  }
  .kityminder-container .navbar-form .input-group > .form-control {
    width: 100%;
  }
  .kityminder-container .navbar-form .control-label {
    margin-bottom: 0;
    vertical-align: middle;
  }
  .kityminder-container .navbar-form .radio,
  .kityminder-container .navbar-form .checkbox {
    display: inline-block;
    margin-top: 0;
    margin-bottom: 0;
    vertical-align: middle;
  }
  .kityminder-container .navbar-form .radio label,
  .kityminder-container .navbar-form .checkbox label {
    padding-left: 0;
  }
  .kityminder-container .navbar-form .radio input[type="radio"],
  .kityminder-container .navbar-form .checkbox input[type="checkbox"] {
    position: relative;
    margin-left: 0;
  }
  .kityminder-container .navbar-form .has-feedback .form-control-feedback {
    top: 0;
  }
}
@media (max-width: 767px) {
  .kityminder-container .navbar-form .form-group {
    margin-bottom: 5px;
  }
  .kityminder-container .navbar-form .form-group:last-child {
    margin-bottom: 0;
  }
}
@media (min-width: 768px) {
  .kityminder-container .navbar-form {
    width: auto;
    padding-top: 0;
    padding-bottom: 0;
    margin-right: 0;
    margin-left: 0;
    border: 0;
    -webkit-box-shadow: none;
            box-shadow: none;
  }
}
.kityminder-container .navbar-nav > li > .dropdown-menu {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.kityminder-container .navbar-fixed-bottom .navbar-nav > li > .dropdown-menu {
  margin-bottom: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.kityminder-container .navbar-btn {
  margin-top: 8px;
  margin-bottom: 8px;
}
.kityminder-container .navbar-btn.btn-sm {
  margin-top: 10px;
  margin-bottom: 10px;
}
.kityminder-container .navbar-btn.btn-xs {
  margin-top: 14px;
  margin-bottom: 14px;
}
.kityminder-container .navbar-text {
  margin-top: 15px;
  margin-bottom: 15px;
}
@media (min-width: 768px) {
  .kityminder-container .navbar-text {
    float: left;
    margin-right: 15px;
    margin-left: 15px;
  }
}
@media (min-width: 768px) {
  .kityminder-container .navbar-left {
    float: left !important;
  }
  .kityminder-container .navbar-right {
    float: right !important;
    margin-right: -15px;
  }
  .kityminder-container .navbar-right ~ .navbar-right {
    margin-right: 0;
  }
}
.kityminder-container .navbar-default {
  background-color: #f8f8f8;
  border-color: #e7e7e7;
}
.kityminder-container .navbar-default .navbar-brand {
  color: #777;
}
.kityminder-container .navbar-default .navbar-brand:hover,
.kityminder-container .navbar-default .navbar-brand:focus {
  color: #5e5e5e;
  background-color: transparent;
}
.kityminder-container .navbar-default .navbar-text {
  color: #777;
}
.kityminder-container .navbar-default .navbar-nav > li > a {
  color: #777;
}
.kityminder-container .navbar-default .navbar-nav > li > a:hover,
.kityminder-container .navbar-default .navbar-nav > li > a:focus {
  color: #333;
  background-color: transparent;
}
.kityminder-container .navbar-default .navbar-nav > .active > a,
.kityminder-container .navbar-default .navbar-nav > .active > a:hover,
.kityminder-container .navbar-default .navbar-nav > .active > a:focus {
  color: #555;
  background-color: #e7e7e7;
}
.kityminder-container .navbar-default .navbar-nav > .disabled > a,
.kityminder-container .navbar-default .navbar-nav > .disabled > a:hover,
.kityminder-container .navbar-default .navbar-nav > .disabled > a:focus {
  color: #ccc;
  background-color: transparent;
}
.kityminder-container .navbar-default .navbar-toggle {
  border-color: #ddd;
}
.kityminder-container .navbar-default .navbar-toggle:hover,
.kityminder-container .navbar-default .navbar-toggle:focus {
  background-color: #ddd;
}
.kityminder-container .navbar-default .navbar-toggle .icon-bar {
  background-color: #888;
}
.kityminder-container .navbar-default .navbar-collapse,
.kityminder-container .navbar-default .navbar-form {
  border-color: #e7e7e7;
}
.kityminder-container .navbar-default .navbar-nav > .open > a,
.kityminder-container .navbar-default .navbar-nav > .open > a:hover,
.kityminder-container .navbar-default .navbar-nav > .open > a:focus {
  color: #555;
  background-color: #e7e7e7;
}
@media (max-width: 767px) {
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > li > a {
    color: #777;
  }
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {
    color: #333;
    background-color: transparent;
  }
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > .active > a,
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover,
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {
    color: #555;
    background-color: #e7e7e7;
  }
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a,
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover,
  .kityminder-container .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus {
    color: #ccc;
    background-color: transparent;
  }
}
.kityminder-container .navbar-default .navbar-link {
  color: #777;
}
.kityminder-container .navbar-default .navbar-link:hover {
  color: #333;
}
.kityminder-container .navbar-default .btn-link {
  color: #777;
}
.kityminder-container .navbar-default .btn-link:hover,
.kityminder-container .navbar-default .btn-link:focus {
  color: #333;
}
.kityminder-container .navbar-default .btn-link[disabled]:hover,
.kityminder-container fieldset[disabled] .navbar-default .btn-link:hover,
.kityminder-container .navbar-default .btn-link[disabled]:focus,
.kityminder-container fieldset[disabled] .navbar-default .btn-link:focus {
  color: #ccc;
}
.kityminder-container .navbar-inverse {
  background-color: #222;
  border-color: #080808;
}
.kityminder-container .navbar-inverse .navbar-brand {
  color: #9d9d9d;
}
.kityminder-container .navbar-inverse .navbar-brand:hover,
.kityminder-container .navbar-inverse .navbar-brand:focus {
  color: #fff;
  background-color: transparent;
}
.kityminder-container .navbar-inverse .navbar-text {
  color: #9d9d9d;
}
.kityminder-container .navbar-inverse .navbar-nav > li > a {
  color: #9d9d9d;
}
.kityminder-container .navbar-inverse .navbar-nav > li > a:hover,
.kityminder-container .navbar-inverse .navbar-nav > li > a:focus {
  color: #fff;
  background-color: transparent;
}
.kityminder-container .navbar-inverse .navbar-nav > .active > a,
.kityminder-container .navbar-inverse .navbar-nav > .active > a:hover,
.kityminder-container .navbar-inverse .navbar-nav > .active > a:focus {
  color: #fff;
  background-color: #080808;
}
.kityminder-container .navbar-inverse .navbar-nav > .disabled > a,
.kityminder-container .navbar-inverse .navbar-nav > .disabled > a:hover,
.kityminder-container .navbar-inverse .navbar-nav > .disabled > a:focus {
  color: #444;
  background-color: transparent;
}
.kityminder-container .navbar-inverse .navbar-toggle {
  border-color: #333;
}
.kityminder-container .navbar-inverse .navbar-toggle:hover,
.kityminder-container .navbar-inverse .navbar-toggle:focus {
  background-color: #333;
}
.kityminder-container .navbar-inverse .navbar-toggle .icon-bar {
  background-color: #fff;
}
.kityminder-container .navbar-inverse .navbar-collapse,
.kityminder-container .navbar-inverse .navbar-form {
  border-color: #101010;
}
.kityminder-container .navbar-inverse .navbar-nav > .open > a,
.kityminder-container .navbar-inverse .navbar-nav > .open > a:hover,
.kityminder-container .navbar-inverse .navbar-nav > .open > a:focus {
  color: #fff;
  background-color: #080808;
}
@media (max-width: 767px) {
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {
    border-color: #080808;
  }
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu .divider {
    background-color: #080808;
  }
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {
    color: #9d9d9d;
  }
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover,
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus {
    color: #fff;
    background-color: transparent;
  }
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a,
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover,
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus {
    color: #fff;
    background-color: #080808;
  }
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a,
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover,
  .kityminder-container .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus {
    color: #444;
    background-color: transparent;
  }
}
.kityminder-container .navbar-inverse .navbar-link {
  color: #9d9d9d;
}
.kityminder-container .navbar-inverse .navbar-link:hover {
  color: #fff;
}
.kityminder-container .navbar-inverse .btn-link {
  color: #9d9d9d;
}
.kityminder-container .navbar-inverse .btn-link:hover,
.kityminder-container .navbar-inverse .btn-link:focus {
  color: #fff;
}
.kityminder-container .navbar-inverse .btn-link[disabled]:hover,
.kityminder-container fieldset[disabled] .navbar-inverse .btn-link:hover,
.kityminder-container .navbar-inverse .btn-link[disabled]:focus,
.kityminder-container fieldset[disabled] .navbar-inverse .btn-link:focus {
  color: #444;
}
.kityminder-container .breadcrumb {
  padding: 8px 15px;
  margin-bottom: 20px;
  list-style: none;
  background-color: #f5f5f5;
  border-radius: 4px;
}
.kityminder-container .breadcrumb > li {
  display: inline-block;
}
.kityminder-container .breadcrumb > li + li:before {
  padding: 0 5px;
  color: #ccc;
  content: "/\\00a0";
}
.kityminder-container .breadcrumb > .active {
  color: #777;
}
.kityminder-container .pagination {
  display: inline-block;
  padding-left: 0;
  margin: 20px 0;
  border-radius: 4px;
}
.kityminder-container .pagination > li {
  display: inline;
}
.kityminder-container .pagination > li > a,
.kityminder-container .pagination > li > span {
  position: relative;
  float: left;
  padding: 6px 12px;
  margin-left: -1px;
  line-height: 1.42857143;
  color: #337ab7;
  text-decoration: none;
  background-color: #fff;
  border: 1px solid #ddd;
}
.kityminder-container .pagination > li:first-child > a,
.kityminder-container .pagination > li:first-child > span {
  margin-left: 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}
.kityminder-container .pagination > li:last-child > a,
.kityminder-container .pagination > li:last-child > span {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
.kityminder-container .pagination > li > a:hover,
.kityminder-container .pagination > li > span:hover,
.kityminder-container .pagination > li > a:focus,
.kityminder-container .pagination > li > span:focus {
  z-index: 2;
  color: #23527c;
  background-color: #eee;
  border-color: #ddd;
}
.kityminder-container .pagination > .active > a,
.kityminder-container .pagination > .active > span,
.kityminder-container .pagination > .active > a:hover,
.kityminder-container .pagination > .active > span:hover,
.kityminder-container .pagination > .active > a:focus,
.kityminder-container .pagination > .active > span:focus {
  z-index: 3;
  color: #fff;
  cursor: default;
  background-color: #337ab7;
  border-color: #337ab7;
}
.kityminder-container .pagination > .disabled > span,
.kityminder-container .pagination > .disabled > span:hover,
.kityminder-container .pagination > .disabled > span:focus,
.kityminder-container .pagination > .disabled > a,
.kityminder-container .pagination > .disabled > a:hover,
.kityminder-container .pagination > .disabled > a:focus {
  color: #777;
  cursor: not-allowed;
  background-color: #fff;
  border-color: #ddd;
}
.kityminder-container .pagination-lg > li > a,
.kityminder-container .pagination-lg > li > span {
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
}
.kityminder-container .pagination-lg > li:first-child > a,
.kityminder-container .pagination-lg > li:first-child > span {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.kityminder-container .pagination-lg > li:last-child > a,
.kityminder-container .pagination-lg > li:last-child > span {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}
.kityminder-container .pagination-sm > li > a,
.kityminder-container .pagination-sm > li > span {
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
}
.kityminder-container .pagination-sm > li:first-child > a,
.kityminder-container .pagination-sm > li:first-child > span {
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}
.kityminder-container .pagination-sm > li:last-child > a,
.kityminder-container .pagination-sm > li:last-child > span {
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}
.kityminder-container .pager {
  padding-left: 0;
  margin: 20px 0;
  text-align: center;
  list-style: none;
}
.kityminder-container .pager li {
  display: inline;
}
.kityminder-container .pager li > a,
.kityminder-container .pager li > span {
  display: inline-block;
  padding: 5px 14px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 15px;
}
.kityminder-container .pager li > a:hover,
.kityminder-container .pager li > a:focus {
  text-decoration: none;
  background-color: #eee;
}
.kityminder-container .pager .next > a,
.kityminder-container .pager .next > span {
  float: right;
}
.kityminder-container .pager .previous > a,
.kityminder-container .pager .previous > span {
  float: left;
}
.kityminder-container .pager .disabled > a,
.kityminder-container .pager .disabled > a:hover,
.kityminder-container .pager .disabled > a:focus,
.kityminder-container .pager .disabled > span {
  color: #777;
  cursor: not-allowed;
  background-color: #fff;
}
.kityminder-container .label {
  display: inline;
  padding: .2em .6em .3em;
  font-size: 75%;
  font-weight: bold;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: .25em;
}
.kityminder-container a.label:hover,
.kityminder-container a.label:focus {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}
.kityminder-container .label:empty {
  display: none;
}
.kityminder-container .btn .label {
  position: relative;
  top: -1px;
}
.kityminder-container .label-default {
  background-color: #777;
}
.kityminder-container .label-default[href]:hover,
.kityminder-container .label-default[href]:focus {
  background-color: #5e5e5e;
}
.kityminder-container .label-primary {
  background-color: #337ab7;
}
.kityminder-container .label-primary[href]:hover,
.kityminder-container .label-primary[href]:focus {
  background-color: #286090;
}
.kityminder-container .label-success {
  background-color: #5cb85c;
}
.kityminder-container .label-success[href]:hover,
.kityminder-container .label-success[href]:focus {
  background-color: #449d44;
}
.kityminder-container .label-info {
  background-color: #5bc0de;
}
.kityminder-container .label-info[href]:hover,
.kityminder-container .label-info[href]:focus {
  background-color: #31b0d5;
}
.kityminder-container .label-warning {
  background-color: #f0ad4e;
}
.kityminder-container .label-warning[href]:hover,
.kityminder-container .label-warning[href]:focus {
  background-color: #ec971f;
}
.kityminder-container .label-danger {
  background-color: #d9534f;
}
.kityminder-container .label-danger[href]:hover,
.kityminder-container .label-danger[href]:focus {
  background-color: #c9302c;
}
.kityminder-container .badge {
  display: inline-block;
  min-width: 10px;
  padding: 3px 7px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  background-color: #777;
  border-radius: 10px;
}
.kityminder-container .badge:empty {
  display: none;
}
.kityminder-container .btn .badge {
  position: relative;
  top: -1px;
}
.kityminder-container .btn-xs .badge,
.kityminder-container .btn-group-xs > .btn .badge {
  top: 0;
  padding: 1px 5px;
}
.kityminder-container a.badge:hover,
.kityminder-container a.badge:focus {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}
.kityminder-container .list-group-item.active > .badge,
.kityminder-container .nav-pills > .active > a > .badge {
  color: #337ab7;
  background-color: #fff;
}
.kityminder-container .list-group-item > .badge {
  float: right;
}
.kityminder-container .list-group-item > .badge + .badge {
  margin-right: 5px;
}
.kityminder-container .nav-pills > li > a > .badge {
  margin-left: 3px;
}
.kityminder-container .jumbotron {
  padding-top: 30px;
  padding-bottom: 30px;
  margin-bottom: 30px;
  color: inherit;
  background-color: #eee;
}
.kityminder-container .jumbotron h1,
.kityminder-container .jumbotron .h1 {
  color: inherit;
}
.kityminder-container .jumbotron p {
  margin-bottom: 15px;
  font-size: 21px;
  font-weight: 200;
}
.kityminder-container .jumbotron > hr {
  border-top-color: #d5d5d5;
}
.kityminder-container .container .jumbotron,
.kityminder-container .container-fluid .jumbotron {
  padding-right: 15px;
  padding-left: 15px;
  border-radius: 6px;
}
.kityminder-container .jumbotron .container {
  max-width: 100%;
}
@media screen and (min-width: 768px) {
  .kityminder-container .jumbotron {
    padding-top: 48px;
    padding-bottom: 48px;
  }
  .kityminder-container .container .jumbotron,
  .kityminder-container .container-fluid .jumbotron {
    padding-right: 60px;
    padding-left: 60px;
  }
  .kityminder-container .jumbotron h1,
  .kityminder-container .jumbotron .h1 {
    font-size: 63px;
  }
}
.kityminder-container .thumbnail {
  display: block;
  padding: 4px;
  margin-bottom: 20px;
  line-height: 1.42857143;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  -webkit-transition: border .2s ease-in-out;
       -o-transition: border .2s ease-in-out;
          transition: border .2s ease-in-out;
}
.kityminder-container .thumbnail > img,
.kityminder-container .thumbnail a > img {
  margin-right: auto;
  margin-left: auto;
}
.kityminder-container a.thumbnail:hover,
.kityminder-container a.thumbnail:focus,
.kityminder-container a.thumbnail.active {
  border-color: #337ab7;
}
.kityminder-container .thumbnail .caption {
  padding: 9px;
  color: #333;
}
.kityminder-container .alert {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
}
.kityminder-container .alert h4 {
  margin-top: 0;
  color: inherit;
}
.kityminder-container .alert .alert-link {
  font-weight: bold;
}
.kityminder-container .alert > p,
.kityminder-container .alert > ul {
  margin-bottom: 0;
}
.kityminder-container .alert > p + p {
  margin-top: 5px;
}
.kityminder-container .alert-dismissable,
.kityminder-container .alert-dismissible {
  padding-right: 35px;
}
.kityminder-container .alert-dismissable .close,
.kityminder-container .alert-dismissible .close {
  position: relative;
  top: -2px;
  right: -21px;
  color: inherit;
}
.kityminder-container .alert-success {
  color: #3c763d;
  background-color: #dff0d8;
  border-color: #d6e9c6;
}
.kityminder-container .alert-success hr {
  border-top-color: #c9e2b3;
}
.kityminder-container .alert-success .alert-link {
  color: #2b542c;
}
.kityminder-container .alert-info {
  color: #31708f;
  background-color: #d9edf7;
  border-color: #bce8f1;
}
.kityminder-container .alert-info hr {
  border-top-color: #a6e1ec;
}
.kityminder-container .alert-info .alert-link {
  color: #245269;
}
.kityminder-container .alert-warning {
  color: #8a6d3b;
  background-color: #fcf8e3;
  border-color: #faebcc;
}
.kityminder-container .alert-warning hr {
  border-top-color: #f7e1b5;
}
.kityminder-container .alert-warning .alert-link {
  color: #66512c;
}
.kityminder-container .alert-danger {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}
.kityminder-container .alert-danger hr {
  border-top-color: #e4b9c0;
}
.kityminder-container .alert-danger .alert-link {
  color: #843534;
}
@-webkit-keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
@-o-keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
@keyframes progress-bar-stripes {
  from {
    background-position: 40px 0;
  }
  to {
    background-position: 0 0;
  }
}
.kityminder-container .progress {
  height: 20px;
  margin-bottom: 20px;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);
}
.kityminder-container .progress-bar {
  float: left;
  width: 0;
  height: 100%;
  font-size: 12px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  background-color: #337ab7;
  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
  -webkit-transition: width .6s ease;
       -o-transition: width .6s ease;
          transition: width .6s ease;
}
.kityminder-container .progress-striped .progress-bar,
.kityminder-container .progress-bar-striped {
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  -webkit-background-size: 40px 40px;
          background-size: 40px 40px;
}
.kityminder-container .progress.active .progress-bar,
.kityminder-container .progress-bar.active {
  -webkit-animation: progress-bar-stripes 2s linear infinite;
       -o-animation: progress-bar-stripes 2s linear infinite;
          animation: progress-bar-stripes 2s linear infinite;
}
.kityminder-container .progress-bar-success {
  background-color: #5cb85c;
}
.kityminder-container .progress-striped .progress-bar-success {
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.kityminder-container .progress-bar-info {
  background-color: #5bc0de;
}
.kityminder-container .progress-striped .progress-bar-info {
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.kityminder-container .progress-bar-warning {
  background-color: #f0ad4e;
}
.kityminder-container .progress-striped .progress-bar-warning {
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.kityminder-container .progress-bar-danger {
  background-color: #d9534f;
}
.kityminder-container .progress-striped .progress-bar-danger {
  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);
}
.kityminder-container .media {
  margin-top: 15px;
}
.kityminder-container .media:first-child {
  margin-top: 0;
}
.kityminder-container .media,
.kityminder-container .media-body {
  overflow: hidden;
  zoom: 1;
}
.kityminder-container .media-body {
  width: 10000px;
}
.kityminder-container .media-object {
  display: block;
}
.kityminder-container .media-object.img-thumbnail {
  max-width: none;
}
.kityminder-container .media-right,
.kityminder-container .media > .pull-right {
  padding-left: 10px;
}
.kityminder-container .media-left,
.kityminder-container .media > .pull-left {
  padding-right: 10px;
}
.kityminder-container .media-left,
.kityminder-container .media-right,
.kityminder-container .media-body {
  display: table-cell;
  vertical-align: top;
}
.kityminder-container .media-middle {
  vertical-align: middle;
}
.kityminder-container .media-bottom {
  vertical-align: bottom;
}
.kityminder-container .media-heading {
  margin-top: 0;
  margin-bottom: 5px;
}
.kityminder-container .media-list {
  padding-left: 0;
  list-style: none;
}
.kityminder-container .list-group {
  padding-left: 0;
  margin-bottom: 20px;
}
.kityminder-container .list-group-item {
  position: relative;
  display: block;
  padding: 10px 15px;
  margin-bottom: -1px;
  background-color: #fff;
  border: 1px solid #ddd;
}
.kityminder-container .list-group-item:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.kityminder-container .list-group-item:last-child {
  margin-bottom: 0;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
.kityminder-container a.list-group-item,
.kityminder-container button.list-group-item {
  color: #555;
}
.kityminder-container a.list-group-item .list-group-item-heading,
.kityminder-container button.list-group-item .list-group-item-heading {
  color: #333;
}
.kityminder-container a.list-group-item:hover,
.kityminder-container button.list-group-item:hover,
.kityminder-container a.list-group-item:focus,
.kityminder-container button.list-group-item:focus {
  color: #555;
  text-decoration: none;
  background-color: #f5f5f5;
}
.kityminder-container button.list-group-item {
  width: 100%;
  text-align: left;
}
.kityminder-container .list-group-item.disabled,
.kityminder-container .list-group-item.disabled:hover,
.kityminder-container .list-group-item.disabled:focus {
  color: #777;
  cursor: not-allowed;
  background-color: #eee;
}
.kityminder-container .list-group-item.disabled .list-group-item-heading,
.kityminder-container .list-group-item.disabled:hover .list-group-item-heading,
.kityminder-container .list-group-item.disabled:focus .list-group-item-heading {
  color: inherit;
}
.kityminder-container .list-group-item.disabled .list-group-item-text,
.kityminder-container .list-group-item.disabled:hover .list-group-item-text,
.kityminder-container .list-group-item.disabled:focus .list-group-item-text {
  color: #777;
}
.kityminder-container .list-group-item.active,
.kityminder-container .list-group-item.active:hover,
.kityminder-container .list-group-item.active:focus {
  z-index: 2;
  color: #fff;
  background-color: #337ab7;
  border-color: #337ab7;
}
.kityminder-container .list-group-item.active .list-group-item-heading,
.kityminder-container .list-group-item.active:hover .list-group-item-heading,
.kityminder-container .list-group-item.active:focus .list-group-item-heading,
.kityminder-container .list-group-item.active .list-group-item-heading > small,
.kityminder-container .list-group-item.active:hover .list-group-item-heading > small,
.kityminder-container .list-group-item.active:focus .list-group-item-heading > small,
.kityminder-container .list-group-item.active .list-group-item-heading > .small,
.kityminder-container .list-group-item.active:hover .list-group-item-heading > .small,
.kityminder-container .list-group-item.active:focus .list-group-item-heading > .small {
  color: inherit;
}
.kityminder-container .list-group-item.active .list-group-item-text,
.kityminder-container .list-group-item.active:hover .list-group-item-text,
.kityminder-container .list-group-item.active:focus .list-group-item-text {
  color: #c7ddef;
}
.kityminder-container .list-group-item-success {
  color: #3c763d;
  background-color: #dff0d8;
}
.kityminder-container a.list-group-item-success,
.kityminder-container button.list-group-item-success {
  color: #3c763d;
}
.kityminder-container a.list-group-item-success .list-group-item-heading,
.kityminder-container button.list-group-item-success .list-group-item-heading {
  color: inherit;
}
.kityminder-container a.list-group-item-success:hover,
.kityminder-container button.list-group-item-success:hover,
.kityminder-container a.list-group-item-success:focus,
.kityminder-container button.list-group-item-success:focus {
  color: #3c763d;
  background-color: #d0e9c6;
}
.kityminder-container a.list-group-item-success.active,
.kityminder-container button.list-group-item-success.active,
.kityminder-container a.list-group-item-success.active:hover,
.kityminder-container button.list-group-item-success.active:hover,
.kityminder-container a.list-group-item-success.active:focus,
.kityminder-container button.list-group-item-success.active:focus {
  color: #fff;
  background-color: #3c763d;
  border-color: #3c763d;
}
.kityminder-container .list-group-item-info {
  color: #31708f;
  background-color: #d9edf7;
}
.kityminder-container a.list-group-item-info,
.kityminder-container button.list-group-item-info {
  color: #31708f;
}
.kityminder-container a.list-group-item-info .list-group-item-heading,
.kityminder-container button.list-group-item-info .list-group-item-heading {
  color: inherit;
}
.kityminder-container a.list-group-item-info:hover,
.kityminder-container button.list-group-item-info:hover,
.kityminder-container a.list-group-item-info:focus,
.kityminder-container button.list-group-item-info:focus {
  color: #31708f;
  background-color: #c4e3f3;
}
.kityminder-container a.list-group-item-info.active,
.kityminder-container button.list-group-item-info.active,
.kityminder-container a.list-group-item-info.active:hover,
.kityminder-container button.list-group-item-info.active:hover,
.kityminder-container a.list-group-item-info.active:focus,
.kityminder-container button.list-group-item-info.active:focus {
  color: #fff;
  background-color: #31708f;
  border-color: #31708f;
}
.kityminder-container .list-group-item-warning {
  color: #8a6d3b;
  background-color: #fcf8e3;
}
.kityminder-container a.list-group-item-warning,
.kityminder-container button.list-group-item-warning {
  color: #8a6d3b;
}
.kityminder-container a.list-group-item-warning .list-group-item-heading,
.kityminder-container button.list-group-item-warning .list-group-item-heading {
  color: inherit;
}
.kityminder-container a.list-group-item-warning:hover,
.kityminder-container button.list-group-item-warning:hover,
.kityminder-container a.list-group-item-warning:focus,
.kityminder-container button.list-group-item-warning:focus {
  color: #8a6d3b;
  background-color: #faf2cc;
}
.kityminder-container a.list-group-item-warning.active,
.kityminder-container button.list-group-item-warning.active,
.kityminder-container a.list-group-item-warning.active:hover,
.kityminder-container button.list-group-item-warning.active:hover,
.kityminder-container a.list-group-item-warning.active:focus,
.kityminder-container button.list-group-item-warning.active:focus {
  color: #fff;
  background-color: #8a6d3b;
  border-color: #8a6d3b;
}
.kityminder-container .list-group-item-danger {
  color: #a94442;
  background-color: #f2dede;
}
.kityminder-container a.list-group-item-danger,
.kityminder-container button.list-group-item-danger {
  color: #a94442;
}
.kityminder-container a.list-group-item-danger .list-group-item-heading,
.kityminder-container button.list-group-item-danger .list-group-item-heading {
  color: inherit;
}
.kityminder-container a.list-group-item-danger:hover,
.kityminder-container button.list-group-item-danger:hover,
.kityminder-container a.list-group-item-danger:focus,
.kityminder-container button.list-group-item-danger:focus {
  color: #a94442;
  background-color: #ebcccc;
}
.kityminder-container a.list-group-item-danger.active,
.kityminder-container button.list-group-item-danger.active,
.kityminder-container a.list-group-item-danger.active:hover,
.kityminder-container button.list-group-item-danger.active:hover,
.kityminder-container a.list-group-item-danger.active:focus,
.kityminder-container button.list-group-item-danger.active:focus {
  color: #fff;
  background-color: #a94442;
  border-color: #a94442;
}
.kityminder-container .list-group-item-heading {
  margin-top: 0;
  margin-bottom: 5px;
}
.kityminder-container .list-group-item-text {
  margin-bottom: 0;
  line-height: 1.3;
}
.kityminder-container .panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
          box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
}
.kityminder-container .panel-body {
  padding: 15px;
}
.kityminder-container .panel-heading {
  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.kityminder-container .panel-heading > .dropdown .dropdown-toggle {
  color: inherit;
}
.kityminder-container .panel-title {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 16px;
  color: inherit;
}
.kityminder-container .panel-title > a,
.kityminder-container .panel-title > small,
.kityminder-container .panel-title > .small,
.kityminder-container .panel-title > small > a,
.kityminder-container .panel-title > .small > a {
  color: inherit;
}
.kityminder-container .panel-footer {
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
}
.kityminder-container .panel > .list-group,
.kityminder-container .panel > .panel-collapse > .list-group {
  margin-bottom: 0;
}
.kityminder-container .panel > .list-group .list-group-item,
.kityminder-container .panel > .panel-collapse > .list-group .list-group-item {
  border-width: 1px 0;
  border-radius: 0;
}
.kityminder-container .panel > .list-group:first-child .list-group-item:first-child,
.kityminder-container .panel > .panel-collapse > .list-group:first-child .list-group-item:first-child {
  border-top: 0;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.kityminder-container .panel > .list-group:last-child .list-group-item:last-child,
.kityminder-container .panel > .panel-collapse > .list-group:last-child .list-group-item:last-child {
  border-bottom: 0;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
}
.kityminder-container .panel > .panel-heading + .panel-collapse > .list-group .list-group-item:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.kityminder-container .panel-heading + .list-group .list-group-item:first-child {
  border-top-width: 0;
}
.kityminder-container .list-group + .panel-footer {
  border-top-width: 0;
}
.kityminder-container .panel > .table,
.kityminder-container .panel > .table-responsive > .table,
.kityminder-container .panel > .panel-collapse > .table {
  margin-bottom: 0;
}
.kityminder-container .panel > .table caption,
.kityminder-container .panel > .table-responsive > .table caption,
.kityminder-container .panel > .panel-collapse > .table caption {
  padding-right: 15px;
  padding-left: 15px;
}
.kityminder-container .panel > .table:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.kityminder-container .panel > .table:first-child > thead:first-child > tr:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child,
.kityminder-container .panel > .table:first-child > tbody:first-child > tr:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.kityminder-container .panel > .table:first-child > thead:first-child > tr:first-child td:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:first-child,
.kityminder-container .panel > .table:first-child > tbody:first-child > tr:first-child td:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:first-child,
.kityminder-container .panel > .table:first-child > thead:first-child > tr:first-child th:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:first-child,
.kityminder-container .panel > .table:first-child > tbody:first-child > tr:first-child th:first-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:first-child {
  border-top-left-radius: 3px;
}
.kityminder-container .panel > .table:first-child > thead:first-child > tr:first-child td:last-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:last-child,
.kityminder-container .panel > .table:first-child > tbody:first-child > tr:first-child td:last-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:last-child,
.kityminder-container .panel > .table:first-child > thead:first-child > tr:first-child th:last-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:last-child,
.kityminder-container .panel > .table:first-child > tbody:first-child > tr:first-child th:last-child,
.kityminder-container .panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:last-child {
  border-top-right-radius: 3px;
}
.kityminder-container .panel > .table:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child {
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
}
.kityminder-container .panel > .table:last-child > tbody:last-child > tr:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child,
.kityminder-container .panel > .table:last-child > tfoot:last-child > tr:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child {
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
}
.kityminder-container .panel > .table:last-child > tbody:last-child > tr:last-child td:first-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:first-child,
.kityminder-container .panel > .table:last-child > tfoot:last-child > tr:last-child td:first-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:first-child,
.kityminder-container .panel > .table:last-child > tbody:last-child > tr:last-child th:first-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:first-child,
.kityminder-container .panel > .table:last-child > tfoot:last-child > tr:last-child th:first-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:first-child {
  border-bottom-left-radius: 3px;
}
.kityminder-container .panel > .table:last-child > tbody:last-child > tr:last-child td:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:last-child,
.kityminder-container .panel > .table:last-child > tfoot:last-child > tr:last-child td:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:last-child,
.kityminder-container .panel > .table:last-child > tbody:last-child > tr:last-child th:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:last-child,
.kityminder-container .panel > .table:last-child > tfoot:last-child > tr:last-child th:last-child,
.kityminder-container .panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:last-child {
  border-bottom-right-radius: 3px;
}
.kityminder-container .panel > .panel-body + .table,
.kityminder-container .panel > .panel-body + .table-responsive,
.kityminder-container .panel > .table + .panel-body,
.kityminder-container .panel > .table-responsive + .panel-body {
  border-top: 1px solid #ddd;
}
.kityminder-container .panel > .table > tbody:first-child > tr:first-child th,
.kityminder-container .panel > .table > tbody:first-child > tr:first-child td {
  border-top: 0;
}
.kityminder-container .panel > .table-bordered,
.kityminder-container .panel > .table-responsive > .table-bordered {
  border: 0;
}
.kityminder-container .panel > .table-bordered > thead > tr > th:first-child,
.kityminder-container .panel > .table-responsive > .table-bordered > thead > tr > th:first-child,
.kityminder-container .panel > .table-bordered > tbody > tr > th:first-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr > th:first-child,
.kityminder-container .panel > .table-bordered > tfoot > tr > th:first-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tfoot > tr > th:first-child,
.kityminder-container .panel > .table-bordered > thead > tr > td:first-child,
.kityminder-container .panel > .table-responsive > .table-bordered > thead > tr > td:first-child,
.kityminder-container .panel > .table-bordered > tbody > tr > td:first-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr > td:first-child,
.kityminder-container .panel > .table-bordered > tfoot > tr > td:first-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tfoot > tr > td:first-child {
  border-left: 0;
}
.kityminder-container .panel > .table-bordered > thead > tr > th:last-child,
.kityminder-container .panel > .table-responsive > .table-bordered > thead > tr > th:last-child,
.kityminder-container .panel > .table-bordered > tbody > tr > th:last-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr > th:last-child,
.kityminder-container .panel > .table-bordered > tfoot > tr > th:last-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tfoot > tr > th:last-child,
.kityminder-container .panel > .table-bordered > thead > tr > td:last-child,
.kityminder-container .panel > .table-responsive > .table-bordered > thead > tr > td:last-child,
.kityminder-container .panel > .table-bordered > tbody > tr > td:last-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr > td:last-child,
.kityminder-container .panel > .table-bordered > tfoot > tr > td:last-child,
.kityminder-container .panel > .table-responsive > .table-bordered > tfoot > tr > td:last-child {
  border-right: 0;
}
.kityminder-container .panel > .table-bordered > thead > tr:first-child > td,
.kityminder-container .panel > .table-responsive > .table-bordered > thead > tr:first-child > td,
.kityminder-container .panel > .table-bordered > tbody > tr:first-child > td,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr:first-child > td,
.kityminder-container .panel > .table-bordered > thead > tr:first-child > th,
.kityminder-container .panel > .table-responsive > .table-bordered > thead > tr:first-child > th,
.kityminder-container .panel > .table-bordered > tbody > tr:first-child > th,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr:first-child > th {
  border-bottom: 0;
}
.kityminder-container .panel > .table-bordered > tbody > tr:last-child > td,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr:last-child > td,
.kityminder-container .panel > .table-bordered > tfoot > tr:last-child > td,
.kityminder-container .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > td,
.kityminder-container .panel > .table-bordered > tbody > tr:last-child > th,
.kityminder-container .panel > .table-responsive > .table-bordered > tbody > tr:last-child > th,
.kityminder-container .panel > .table-bordered > tfoot > tr:last-child > th,
.kityminder-container .panel > .table-responsive > .table-bordered > tfoot > tr:last-child > th {
  border-bottom: 0;
}
.kityminder-container .panel > .table-responsive {
  margin-bottom: 0;
  border: 0;
}
.kityminder-container .panel-group {
  margin-bottom: 20px;
}
.kityminder-container .panel-group .panel {
  margin-bottom: 0;
  border-radius: 4px;
}
.kityminder-container .panel-group .panel + .panel {
  margin-top: 5px;
}
.kityminder-container .panel-group .panel-heading {
  border-bottom: 0;
}
.kityminder-container .panel-group .panel-heading + .panel-collapse > .panel-body,
.kityminder-container .panel-group .panel-heading + .panel-collapse > .list-group {
  border-top: 1px solid #ddd;
}
.kityminder-container .panel-group .panel-footer {
  border-top: 0;
}
.kityminder-container .panel-group .panel-footer + .panel-collapse .panel-body {
  border-bottom: 1px solid #ddd;
}
.kityminder-container .panel-default {
  border-color: #ddd;
}
.kityminder-container .panel-default > .panel-heading {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ddd;
}
.kityminder-container .panel-default > .panel-heading + .panel-collapse > .panel-body {
  border-top-color: #ddd;
}
.kityminder-container .panel-default > .panel-heading .badge {
  color: #f5f5f5;
  background-color: #333;
}
.kityminder-container .panel-default > .panel-footer + .panel-collapse > .panel-body {
  border-bottom-color: #ddd;
}
.kityminder-container .panel-primary {
  border-color: #337ab7;
}
.kityminder-container .panel-primary > .panel-heading {
  color: #fff;
  background-color: #337ab7;
  border-color: #337ab7;
}
.kityminder-container .panel-primary > .panel-heading + .panel-collapse > .panel-body {
  border-top-color: #337ab7;
}
.kityminder-container .panel-primary > .panel-heading .badge {
  color: #337ab7;
  background-color: #fff;
}
.kityminder-container .panel-primary > .panel-footer + .panel-collapse > .panel-body {
  border-bottom-color: #337ab7;
}
.kityminder-container .panel-success {
  border-color: #d6e9c6;
}
.kityminder-container .panel-success > .panel-heading {
  color: #3c763d;
  background-color: #dff0d8;
  border-color: #d6e9c6;
}
.kityminder-container .panel-success > .panel-heading + .panel-collapse > .panel-body {
  border-top-color: #d6e9c6;
}
.kityminder-container .panel-success > .panel-heading .badge {
  color: #dff0d8;
  background-color: #3c763d;
}
.kityminder-container .panel-success > .panel-footer + .panel-collapse > .panel-body {
  border-bottom-color: #d6e9c6;
}
.kityminder-container .panel-info {
  border-color: #bce8f1;
}
.kityminder-container .panel-info > .panel-heading {
  color: #31708f;
  background-color: #d9edf7;
  border-color: #bce8f1;
}
.kityminder-container .panel-info > .panel-heading + .panel-collapse > .panel-body {
  border-top-color: #bce8f1;
}
.kityminder-container .panel-info > .panel-heading .badge {
  color: #d9edf7;
  background-color: #31708f;
}
.kityminder-container .panel-info > .panel-footer + .panel-collapse > .panel-body {
  border-bottom-color: #bce8f1;
}
.kityminder-container .panel-warning {
  border-color: #faebcc;
}
.kityminder-container .panel-warning > .panel-heading {
  color: #8a6d3b;
  background-color: #fcf8e3;
  border-color: #faebcc;
}
.kityminder-container .panel-warning > .panel-heading + .panel-collapse > .panel-body {
  border-top-color: #faebcc;
}
.kityminder-container .panel-warning > .panel-heading .badge {
  color: #fcf8e3;
  background-color: #8a6d3b;
}
.kityminder-container .panel-warning > .panel-footer + .panel-collapse > .panel-body {
  border-bottom-color: #faebcc;
}
.kityminder-container .panel-danger {
  border-color: #ebccd1;
}
.kityminder-container .panel-danger > .panel-heading {
  color: #a94442;
  background-color: #f2dede;
  border-color: #ebccd1;
}
.kityminder-container .panel-danger > .panel-heading + .panel-collapse > .panel-body {
  border-top-color: #ebccd1;
}
.kityminder-container .panel-danger > .panel-heading .badge {
  color: #f2dede;
  background-color: #a94442;
}
.kityminder-container .panel-danger > .panel-footer + .panel-collapse > .panel-body {
  border-bottom-color: #ebccd1;
}
.kityminder-container .embed-responsive {
  position: relative;
  display: block;
  height: 0;
  padding: 0;
  overflow: hidden;
}
.kityminder-container .embed-responsive .embed-responsive-item,
.kityminder-container .embed-responsive iframe,
.kityminder-container .embed-responsive embed,
.kityminder-container .embed-responsive object,
.kityminder-container .embed-responsive video {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.kityminder-container .embed-responsive-16by9 {
  padding-bottom: 56.25%;
}
.kityminder-container .embed-responsive-4by3 {
  padding-bottom: 75%;
}
.kityminder-container .well {
  min-height: 20px;
  padding: 19px;
  margin-bottom: 20px;
  background-color: #f5f5f5;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .05);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .05);
}
.kityminder-container .well blockquote {
  border-color: #ddd;
  border-color: rgba(0, 0, 0, .15);
}
.kityminder-container .well-lg {
  padding: 24px;
  border-radius: 6px;
}
.kityminder-container .well-sm {
  padding: 9px;
  border-radius: 3px;
}
.kityminder-container .close {
  float: right;
  font-size: 21px;
  font-weight: bold;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  filter: alpha(opacity=20);
  opacity: .2;
}
.kityminder-container .close:hover,
.kityminder-container .close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
  filter: alpha(opacity=50);
  opacity: .5;
}
.kityminder-container button.close {
  -webkit-appearance: none;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}
.kityminder-container .modal-open {
  overflow: hidden;
}
.kityminder-container .modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1050;
  display: none;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  outline: 0;
}
.kityminder-container .modal.fade .modal-dialog {
  -webkit-transition: -webkit-transform .3s ease-out;
       -o-transition:      -o-transform .3s ease-out;
          transition:         transform .3s ease-out;
  -webkit-transform: translate(0, -25%);
      -ms-transform: translate(0, -25%);
       -o-transform: translate(0, -25%);
          transform: translate(0, -25%);
}
.kityminder-container .modal.in .modal-dialog {
  -webkit-transform: translate(0, 0);
      -ms-transform: translate(0, 0);
       -o-transform: translate(0, 0);
          transform: translate(0, 0);
}
.kityminder-container .modal-open .modal {
  overflow-x: hidden;
  overflow-y: auto;
}
.kityminder-container .modal-dialog {
  position: relative;
  width: auto;
  margin: 10px;
}
.kityminder-container .modal-content {
  position: relative;
  background-color: #fff;
  -webkit-background-clip: padding-box;
          background-clip: padding-box;
  border: 1px solid #999;
  border: 1px solid rgba(0, 0, 0, .2);
  border-radius: 6px;
  outline: 0;
  -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, .5);
          box-shadow: 0 3px 9px rgba(0, 0, 0, .5);
}
.kityminder-container .modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1040;
  background-color: #000;
}
.kityminder-container .modal-backdrop.fade {
  filter: alpha(opacity=0);
  opacity: 0;
}
.kityminder-container .modal-backdrop.in {
  filter: alpha(opacity=50);
  opacity: .5;
}
.kityminder-container .modal-header {
  padding: 15px;
  border-bottom: 1px solid #e5e5e5;
}
.kityminder-container .modal-header .close {
  margin-top: -2px;
}
.kityminder-container .modal-title {
  margin: 0;
  line-height: 1.42857143;
}
.kityminder-container .modal-body {
  position: relative;
  padding: 15px;
}
.kityminder-container .modal-footer {
  padding: 15px;
  text-align: right;
  border-top: 1px solid #e5e5e5;
}
.kityminder-container .modal-footer .btn + .btn {
  margin-bottom: 0;
  margin-left: 5px;
}
.kityminder-container .modal-footer .btn-group .btn + .btn {
  margin-left: -1px;
}
.kityminder-container .modal-footer .btn-block + .btn-block {
  margin-left: 0;
}
.kityminder-container .modal-scrollbar-measure {
  position: absolute;
  top: -9999px;
  width: 50px;
  height: 50px;
  overflow: scroll;
}
@media (min-width: 768px) {
  .kityminder-container .modal-dialog {
    width: 600px;
    margin: 30px auto;
  }
  .kityminder-container .modal-content {
    -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
            box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
  }
  .kityminder-container .modal-sm {
    width: 300px;
  }
}
@media (min-width: 992px) {
  .kityminder-container .modal-lg {
    width: 900px;
  }
}
.kityminder-container .tooltip {
  position: absolute;
  z-index: 1070;
  display: block;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: normal;
  line-height: 1.42857143;
  text-align: left;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  word-wrap: normal;
  white-space: normal;
  filter: alpha(opacity=0);
  opacity: 0;

  line-break: auto;
}
.kityminder-container .tooltip.in {
  filter: alpha(opacity=90);
  opacity: .9;
}
.kityminder-container .tooltip.top {
  padding: 5px 0;
  margin-top: -3px;
}
.kityminder-container .tooltip.right {
  padding: 0 5px;
  margin-left: 3px;
}
.kityminder-container .tooltip.bottom {
  padding: 5px 0;
  margin-top: 3px;
}
.kityminder-container .tooltip.left {
  padding: 0 5px;
  margin-left: -3px;
}
.kityminder-container .tooltip-inner {
  max-width: 200px;
  padding: 3px 8px;
  color: #fff;
  text-align: center;
  background-color: #000;
  border-radius: 4px;
}
.kityminder-container .tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.kityminder-container .tooltip.top .tooltip-arrow {
  bottom: 0;
  left: 50%;
  margin-left: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000;
}
.kityminder-container .tooltip.top-left .tooltip-arrow {
  right: 5px;
  bottom: 0;
  margin-bottom: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000;
}
.kityminder-container .tooltip.top-right .tooltip-arrow {
  bottom: 0;
  left: 5px;
  margin-bottom: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000;
}
.kityminder-container .tooltip.right .tooltip-arrow {
  top: 50%;
  left: 0;
  margin-top: -5px;
  border-width: 5px 5px 5px 0;
  border-right-color: #000;
}
.kityminder-container .tooltip.left .tooltip-arrow {
  top: 50%;
  right: 0;
  margin-top: -5px;
  border-width: 5px 0 5px 5px;
  border-left-color: #000;
}
.kityminder-container .tooltip.bottom .tooltip-arrow {
  top: 0;
  left: 50%;
  margin-left: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000;
}
.kityminder-container .tooltip.bottom-left .tooltip-arrow {
  top: 0;
  right: 5px;
  margin-top: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000;
}
.kityminder-container .tooltip.bottom-right .tooltip-arrow {
  top: 0;
  left: 5px;
  margin-top: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000;
}
.kityminder-container .popover {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1060;
  display: none;
  max-width: 276px;
  padding: 1px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: normal;
  line-height: 1.42857143;
  text-align: left;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  word-wrap: normal;
  white-space: normal;
  background-color: #fff;
  -webkit-background-clip: padding-box;
          background-clip: padding-box;
  border: 1px solid #ccc;
  border: 1px solid rgba(0, 0, 0, .2);
  border-radius: 6px;
  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, .2);
          box-shadow: 0 5px 10px rgba(0, 0, 0, .2);

  line-break: auto;
}
.kityminder-container .popover.top {
  margin-top: -10px;
}
.kityminder-container .popover.right {
  margin-left: 10px;
}
.kityminder-container .popover.bottom {
  margin-top: 10px;
}
.kityminder-container .popover.left {
  margin-left: -10px;
}
.kityminder-container .popover-title {
  padding: 8px 14px;
  margin: 0;
  font-size: 14px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #ebebeb;
  border-radius: 5px 5px 0 0;
}
.kityminder-container .popover-content {
  padding: 9px 14px;
}
.kityminder-container .popover > .arrow,
.kityminder-container .popover > .arrow:after {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.kityminder-container .popover > .arrow {
  border-width: 11px;
}
.kityminder-container .popover > .arrow:after {
  content: "";
  border-width: 10px;
}
.kityminder-container .popover.top > .arrow {
  bottom: -11px;
  left: 50%;
  margin-left: -11px;
  border-top-color: #999;
  border-top-color: rgba(0, 0, 0, .25);
  border-bottom-width: 0;
}
.kityminder-container .popover.top > .arrow:after {
  bottom: 1px;
  margin-left: -10px;
  content: " ";
  border-top-color: #fff;
  border-bottom-width: 0;
}
.kityminder-container .popover.right > .arrow {
  top: 50%;
  left: -11px;
  margin-top: -11px;
  border-right-color: #999;
  border-right-color: rgba(0, 0, 0, .25);
  border-left-width: 0;
}
.kityminder-container .popover.right > .arrow:after {
  bottom: -10px;
  left: 1px;
  content: " ";
  border-right-color: #fff;
  border-left-width: 0;
}
.kityminder-container .popover.bottom > .arrow {
  top: -11px;
  left: 50%;
  margin-left: -11px;
  border-top-width: 0;
  border-bottom-color: #999;
  border-bottom-color: rgba(0, 0, 0, .25);
}
.kityminder-container .popover.bottom > .arrow:after {
  top: 1px;
  margin-left: -10px;
  content: " ";
  border-top-width: 0;
  border-bottom-color: #fff;
}
.kityminder-container .popover.left > .arrow {
  top: 50%;
  right: -11px;
  margin-top: -11px;
  border-right-width: 0;
  border-left-color: #999;
  border-left-color: rgba(0, 0, 0, .25);
}
.kityminder-container .popover.left > .arrow:after {
  right: 1px;
  bottom: -10px;
  content: " ";
  border-right-width: 0;
  border-left-color: #fff;
}
.kityminder-container .carousel {
  position: relative;
}
.kityminder-container .carousel-inner {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.kityminder-container .carousel-inner > .item {
  position: relative;
  display: none;
  -webkit-transition: .6s ease-in-out left;
       -o-transition: .6s ease-in-out left;
          transition: .6s ease-in-out left;
}
.kityminder-container .carousel-inner > .item > img,
.kityminder-container .carousel-inner > .item > a > img {
  line-height: 1;
}
@media all and (transform-3d), (-webkit-transform-3d) {
  .kityminder-container .carousel-inner > .item {
    -webkit-transition: -webkit-transform .6s ease-in-out;
         -o-transition:      -o-transform .6s ease-in-out;
            transition:         transform .6s ease-in-out;

    -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
    -webkit-perspective: 1000px;
            perspective: 1000px;
  }
  .kityminder-container .carousel-inner > .item.next,
  .kityminder-container .carousel-inner > .item.active.right {
    left: 0;
    -webkit-transform: translate3d(100%, 0, 0);
            transform: translate3d(100%, 0, 0);
  }
  .kityminder-container .carousel-inner > .item.prev,
  .kityminder-container .carousel-inner > .item.active.left {
    left: 0;
    -webkit-transform: translate3d(-100%, 0, 0);
            transform: translate3d(-100%, 0, 0);
  }
  .kityminder-container .carousel-inner > .item.next.left,
  .kityminder-container .carousel-inner > .item.prev.right,
  .kityminder-container .carousel-inner > .item.active {
    left: 0;
    -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
  }
}
.kityminder-container .carousel-inner > .active,
.kityminder-container .carousel-inner > .next,
.kityminder-container .carousel-inner > .prev {
  display: block;
}
.kityminder-container .carousel-inner > .active {
  left: 0;
}
.kityminder-container .carousel-inner > .next,
.kityminder-container .carousel-inner > .prev {
  position: absolute;
  top: 0;
  width: 100%;
}
.kityminder-container .carousel-inner > .next {
  left: 100%;
}
.kityminder-container .carousel-inner > .prev {
  left: -100%;
}
.kityminder-container .carousel-inner > .next.left,
.kityminder-container .carousel-inner > .prev.right {
  left: 0;
}
.kityminder-container .carousel-inner > .active.left {
  left: -100%;
}
.kityminder-container .carousel-inner > .active.right {
  left: 100%;
}
.kityminder-container .carousel-control {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 15%;
  font-size: 20px;
  color: #fff;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .6);
  background-color: rgba(0, 0, 0, 0);
  filter: alpha(opacity=50);
  opacity: .5;
}
.kityminder-container .carousel-control.left {
  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, .0001) 100%);
  background-image:      -o-linear-gradient(left, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, .0001) 100%);
  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, .5)), to(rgba(0, 0, 0, .0001)));
  background-image:         linear-gradient(to right, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, .0001) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1);
  background-repeat: repeat-x;
}
.kityminder-container .carousel-control.right {
  right: 0;
  left: auto;
  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);
  background-image:      -o-linear-gradient(left, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);
  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, .0001)), to(rgba(0, 0, 0, .5)));
  background-image:         linear-gradient(to right, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1);
  background-repeat: repeat-x;
}
.kityminder-container .carousel-control:hover,
.kityminder-container .carousel-control:focus {
  color: #fff;
  text-decoration: none;
  filter: alpha(opacity=90);
  outline: 0;
  opacity: .9;
}
.kityminder-container .carousel-control .icon-prev,
.kityminder-container .carousel-control .icon-next,
.kityminder-container .carousel-control .glyphicon-chevron-left,
.kityminder-container .carousel-control .glyphicon-chevron-right {
  position: absolute;
  top: 50%;
  z-index: 5;
  display: inline-block;
  margin-top: -10px;
}
.kityminder-container .carousel-control .icon-prev,
.kityminder-container .carousel-control .glyphicon-chevron-left {
  left: 50%;
  margin-left: -10px;
}
.kityminder-container .carousel-control .icon-next,
.kityminder-container .carousel-control .glyphicon-chevron-right {
  right: 50%;
  margin-right: -10px;
}
.kityminder-container .carousel-control .icon-prev,
.kityminder-container .carousel-control .icon-next {
  width: 20px;
  height: 20px;
  font-family: serif;
  line-height: 1;
}
.kityminder-container .carousel-control .icon-prev:before {
  content: '\\2039';
}
.kityminder-container .carousel-control .icon-next:before {
  content: '\\203a';
}
.kityminder-container .carousel-indicators {
  position: absolute;
  bottom: 10px;
  left: 50%;
  z-index: 15;
  width: 60%;
  padding-left: 0;
  margin-left: -30%;
  text-align: center;
  list-style: none;
}
.kityminder-container .carousel-indicators li {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 1px;
  text-indent: -999px;
  cursor: pointer;
  background-color: #000 \\9;
  background-color: rgba(0, 0, 0, 0);
  border: 1px solid #fff;
  border-radius: 10px;
}
.kityminder-container .carousel-indicators .active {
  width: 12px;
  height: 12px;
  margin: 0;
  background-color: #fff;
}
.kityminder-container .carousel-caption {
  position: absolute;
  right: 15%;
  bottom: 20px;
  left: 15%;
  z-index: 10;
  padding-top: 20px;
  padding-bottom: 20px;
  color: #fff;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, .6);
}
.kityminder-container .carousel-caption .btn {
  text-shadow: none;
}
@media screen and (min-width: 768px) {
  .kityminder-container .carousel-control .glyphicon-chevron-left,
  .kityminder-container .carousel-control .glyphicon-chevron-right,
  .kityminder-container .carousel-control .icon-prev,
  .kityminder-container .carousel-control .icon-next {
    width: 30px;
    height: 30px;
    margin-top: -10px;
    font-size: 30px;
  }
  .kityminder-container .carousel-control .glyphicon-chevron-left,
  .kityminder-container .carousel-control .icon-prev {
    margin-left: -10px;
  }
  .kityminder-container .carousel-control .glyphicon-chevron-right,
  .kityminder-container .carousel-control .icon-next {
    margin-right: -10px;
  }
  .kityminder-container .carousel-caption {
    right: 20%;
    left: 20%;
    padding-bottom: 30px;
  }
  .kityminder-container .carousel-indicators {
    bottom: 20px;
  }
}
.kityminder-container .clearfix:before,
.kityminder-container .clearfix:after,
.kityminder-container .dl-horizontal dd:before,
.kityminder-container .dl-horizontal dd:after,
.kityminder-container .container:before,
.kityminder-container .container:after,
.kityminder-container .container-fluid:before,
.kityminder-container .container-fluid:after,
.kityminder-container .row:before,
.kityminder-container .row:after,
.kityminder-container .form-horizontal .form-group:before,
.kityminder-container .form-horizontal .form-group:after,
.kityminder-container .btn-toolbar:before,
.kityminder-container .btn-toolbar:after,
.kityminder-container .btn-group-vertical > .btn-group:before,
.kityminder-container .btn-group-vertical > .btn-group:after,
.kityminder-container .nav:before,
.kityminder-container .nav:after,
.kityminder-container .navbar:before,
.kityminder-container .navbar:after,
.kityminder-container .navbar-header:before,
.kityminder-container .navbar-header:after,
.kityminder-container .navbar-collapse:before,
.kityminder-container .navbar-collapse:after,
.kityminder-container .pager:before,
.kityminder-container .pager:after,
.kityminder-container .panel-body:before,
.kityminder-container .panel-body:after,
.kityminder-container .modal-header:before,
.kityminder-container .modal-header:after,
.kityminder-container .modal-footer:before,
.kityminder-container .modal-footer:after {
  display: table;
  content: " ";
}
.kityminder-container .clearfix:after,
.kityminder-container .dl-horizontal dd:after,
.kityminder-container .container:after,
.kityminder-container .container-fluid:after,
.kityminder-container .row:after,
.kityminder-container .form-horizontal .form-group:after,
.kityminder-container .btn-toolbar:after,
.kityminder-container .btn-group-vertical > .btn-group:after,
.kityminder-container .nav:after,
.kityminder-container .navbar:after,
.kityminder-container .navbar-header:after,
.kityminder-container .navbar-collapse:after,
.kityminder-container .pager:after,
.kityminder-container .panel-body:after,
.kityminder-container .modal-header:after,
.kityminder-container .modal-footer:after {
  clear: both;
}
.kityminder-container .center-block {
  display: block;
  margin-right: auto;
  margin-left: auto;
}
.kityminder-container .pull-right {
  float: right !important;
}
.kityminder-container .pull-left {
  float: left !important;
}
.kityminder-container .hide {
  display: none !important;
}
.kityminder-container .show {
  display: block !important;
}
.kityminder-container .invisible {
  visibility: hidden;
}
.kityminder-container .text-hide {
  font: 0/0 a;
  color: transparent;
  text-shadow: none;
  background-color: transparent;
  border: 0;
}
.kityminder-container .hidden {
  display: none !important;
}
.kityminder-container .affix {
  position: fixed;
}
@-ms-viewport {
  width: device-width;
}
.kityminder-container .visible-xs,
.kityminder-container .visible-sm,
.kityminder-container .visible-md,
.kityminder-container .visible-lg {
  display: none !important;
}
.kityminder-container .visible-xs-block,
.kityminder-container .visible-xs-inline,
.kityminder-container .visible-xs-inline-block,
.kityminder-container .visible-sm-block,
.kityminder-container .visible-sm-inline,
.kityminder-container .visible-sm-inline-block,
.kityminder-container .visible-md-block,
.kityminder-container .visible-md-inline,
.kityminder-container .visible-md-inline-block,
.kityminder-container .visible-lg-block,
.kityminder-container .visible-lg-inline,
.kityminder-container .visible-lg-inline-block {
  display: none !important;
}
@media (max-width: 767px) {
  .kityminder-container .visible-xs {
    display: block !important;
  }
  .kityminder-container table.visible-xs {
    display: table !important;
  }
  .kityminder-container tr.visible-xs {
    display: table-row !important;
  }
  .kityminder-container th.visible-xs,
  .kityminder-container td.visible-xs {
    display: table-cell !important;
  }
}
@media (max-width: 767px) {
  .kityminder-container .visible-xs-block {
    display: block !important;
  }
}
@media (max-width: 767px) {
  .kityminder-container .visible-xs-inline {
    display: inline !important;
  }
}
@media (max-width: 767px) {
  .kityminder-container .visible-xs-inline-block {
    display: inline-block !important;
  }
}
@media (min-width: 768px) and (max-width: 991px) {
  .kityminder-container .visible-sm {
    display: block !important;
  }
  .kityminder-container table.visible-sm {
    display: table !important;
  }
  .kityminder-container tr.visible-sm {
    display: table-row !important;
  }
  .kityminder-container th.visible-sm,
  .kityminder-container td.visible-sm {
    display: table-cell !important;
  }
}
@media (min-width: 768px) and (max-width: 991px) {
  .kityminder-container .visible-sm-block {
    display: block !important;
  }
}
@media (min-width: 768px) and (max-width: 991px) {
  .kityminder-container .visible-sm-inline {
    display: inline !important;
  }
}
@media (min-width: 768px) and (max-width: 991px) {
  .kityminder-container .visible-sm-inline-block {
    display: inline-block !important;
  }
}
@media (min-width: 992px) and (max-width: 1199px) {
  .kityminder-container .visible-md {
    display: block !important;
  }
  .kityminder-container table.visible-md {
    display: table !important;
  }
  .kityminder-container tr.visible-md {
    display: table-row !important;
  }
  .kityminder-container th.visible-md,
  .kityminder-container td.visible-md {
    display: table-cell !important;
  }
}
@media (min-width: 992px) and (max-width: 1199px) {
  .kityminder-container .visible-md-block {
    display: block !important;
  }
}
@media (min-width: 992px) and (max-width: 1199px) {
  .kityminder-container .visible-md-inline {
    display: inline !important;
  }
}
@media (min-width: 992px) and (max-width: 1199px) {
  .kityminder-container .visible-md-inline-block {
    display: inline-block !important;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .visible-lg {
    display: block !important;
  }
  .kityminder-container table.visible-lg {
    display: table !important;
  }
  .kityminder-container tr.visible-lg {
    display: table-row !important;
  }
  .kityminder-container th.visible-lg,
  .kityminder-container td.visible-lg {
    display: table-cell !important;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .visible-lg-block {
    display: block !important;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .visible-lg-inline {
    display: inline !important;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .visible-lg-inline-block {
    display: inline-block !important;
  }
}
@media (max-width: 767px) {
  .kityminder-container .hidden-xs {
    display: none !important;
  }
}
@media (min-width: 768px) and (max-width: 991px) {
  .kityminder-container .hidden-sm {
    display: none !important;
  }
}
@media (min-width: 992px) and (max-width: 1199px) {
  .kityminder-container .hidden-md {
    display: none !important;
  }
}
@media (min-width: 1200px) {
  .kityminder-container .hidden-lg {
    display: none !important;
  }
}
.kityminder-container .visible-print {
  display: none !important;
}
@media print {
  .kityminder-container .visible-print {
    display: block !important;
  }
  .kityminder-container table.visible-print {
    display: table !important;
  }
  .kityminder-container tr.visible-print {
    display: table-row !important;
  }
  .kityminder-container th.visible-print,
  .kityminder-container td.visible-print {
    display: table-cell !important;
  }
}
.kityminder-container .visible-print-block {
  display: none !important;
}
@media print {
  .kityminder-container .visible-print-block {
    display: block !important;
  }
}
.kityminder-container .visible-print-inline {
  display: none !important;
}
@media print {
  .kityminder-container .visible-print-inline {
    display: inline !important;
  }
}
.kityminder-container .visible-print-inline-block {
  display: none !important;
}
@media print {
  .kityminder-container .visible-print-inline-block {
    display: inline-block !important;
  }
}
@media print {
  .kityminder-container .hidden-print {
    display: none !important;
  }
}

/* BASICS */

.kityminder-container .CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: monospace;
  height: 300px;
}

/* PADDING */

.kityminder-container .CodeMirror-lines {
  padding: 4px 0; /* Vertical padding around content */
}
.kityminder-container .CodeMirror pre {
  padding: 0 4px; /* Horizontal padding of content */
}

.kityminder-container .CodeMirror-scrollbar-filler, .kityminder-container .CodeMirror-gutter-filler {
  background-color: white; /* The little square between H and V scrollbars */
}

/* GUTTER */

.kityminder-container .CodeMirror-gutters {
  border-right: 1px solid #ddd;
  background-color: #f7f7f7;
  white-space: nowrap;
}
.kityminder-container .CodeMirror-linenumbers {}
.kityminder-container .CodeMirror-linenumber {
  padding: 0 3px 0 5px;
  min-width: 20px;
  text-align: right;
  color: #999;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

.kityminder-container .CodeMirror-guttermarker { color: black; }
.kityminder-container .CodeMirror-guttermarker-subtle { color: #999; }

/* CURSOR */

.kityminder-container .CodeMirror div.CodeMirror-cursor {
  border-left: 1px solid black;
}
/* Shown when moving in bi-directional text */
.kityminder-container .CodeMirror div.CodeMirror-secondarycursor {
  border-left: 1px solid silver;
}
.kityminder-container .CodeMirror.cm-fat-cursor div.CodeMirror-cursor {
  width: auto;
  border: 0;
  background: #7e7;
}
.kityminder-container .CodeMirror.cm-fat-cursor div.CodeMirror-cursors {
  z-index: 1;
}

.kityminder-container .cm-animate-fat-cursor {
  width: auto;
  border: 0;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
}
@-moz-keyframes blink {
  0% { background: #7e7; }
  50% { background: none; }
  100% { background: #7e7; }
}
@-webkit-keyframes blink {
  0% { background: #7e7; }
  50% { background: none; }
  100% { background: #7e7; }
}
@keyframes blink {
  0% { background: #7e7; }
  50% { background: none; }
  100% { background: #7e7; }
}

/* Can style cursor different in overwrite (non-insert) mode */
.kityminder-container div.CodeMirror-overwrite div.CodeMirror-cursor {}

.kityminder-container .cm-tab { display: inline-block; text-decoration: inherit; }

.kityminder-container .CodeMirror-ruler {
  border-left: 1px solid #ccc;
  position: absolute;
}

/* DEFAULT THEME */

.kityminder-container .cm-s-default .cm-keyword {color: #708;}
.kityminder-container .cm-s-default .cm-atom {color: #219;}
.kityminder-container .cm-s-default .cm-number {color: #164;}
.kityminder-container .cm-s-default .cm-def {color: #00f;}
.kityminder-container .cm-s-default .cm-variable,
.kityminder-container .cm-s-default .cm-punctuation,
.kityminder-container .cm-s-default .cm-property,
.kityminder-container .cm-s-default .cm-operator {}
.kityminder-container .cm-s-default .cm-variable-2 {color: #05a;}
.kityminder-container .cm-s-default .cm-variable-3 {color: #085;}
.kityminder-container .cm-s-default .cm-comment {color: #a50;}
.kityminder-container .cm-s-default .cm-string {color: #a11;}
.kityminder-container .cm-s-default .cm-string-2 {color: #f50;}
.kityminder-container .cm-s-default .cm-meta {color: #555;}
.kityminder-container .cm-s-default .cm-qualifier {color: #555;}
.kityminder-container .cm-s-default .cm-builtin {color: #30a;}
.kityminder-container .cm-s-default .cm-bracket {color: #997;}
.kityminder-container .cm-s-default .cm-tag {color: #170;}
.kityminder-container .cm-s-default .cm-attribute {color: #00c;}
.kityminder-container .cm-s-default .cm-header {color: blue;}
.kityminder-container .cm-s-default .cm-quote {color: #090;}
.kityminder-container .cm-s-default .cm-hr {color: #999;}
.kityminder-container .cm-s-default .cm-link {color: #00c;}

.kityminder-container .cm-negative {color: #d44;}
.kityminder-container .cm-positive {color: #292;}
.kityminder-container .cm-header, .kityminder-container .cm-strong {font-weight: bold;}
.kityminder-container .cm-em {font-style: italic;}
.kityminder-container .cm-link {text-decoration: underline;}
.kityminder-container .cm-strikethrough {text-decoration: line-through;}

.kityminder-container .cm-s-default .cm-error {color: #f00;}
.kityminder-container .cm-invalidchar {color: #f00;}

/* Default styles for common addons */

.kityminder-container div.CodeMirror span.CodeMirror-matchingbracket {color: #0f0;}
.kityminder-container div.CodeMirror span.CodeMirror-nonmatchingbracket {color: #f22;}
.kityminder-container .CodeMirror-matchingtag { background: rgba(255, 150, 0, .3); }
.kityminder-container .CodeMirror-activeline-background {background: #e8f2ff;}

/* STOP */

/* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

.kityminder-container .CodeMirror {
  line-height: 1;
  position: relative;
  overflow: hidden;
  background: white;
  color: black;
}

.kityminder-container .CodeMirror-scroll {
  overflow: scroll !important; /* Things will break if this is overridden */
  /* 30px is the magic margin used to hide the element's real scrollbars */
  /* See overflow: hidden in .CodeMirror */
  margin-bottom: -30px; margin-right: -30px;
  padding-bottom: 30px;
  height: 100%;
  outline: none; /* Prevent dragging from highlighting the element */
  position: relative;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}
.kityminder-container .CodeMirror-sizer {
  position: relative;
  border-right: 30px solid transparent;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

/* The fake, visible scrollbars. Used to force redraw during scrolling
   before actuall scrolling happens, thus preventing shaking and
   flickering artifacts. */
.kityminder-container .CodeMirror-vscrollbar, .kityminder-container .CodeMirror-hscrollbar, .kityminder-container .CodeMirror-scrollbar-filler, .kityminder-container .CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
}
.kityminder-container .CodeMirror-vscrollbar {
  right: 0; top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
}
.kityminder-container .CodeMirror-hscrollbar {
  bottom: 0; left: 0;
  overflow-y: hidden;
  overflow-x: scroll;
}
.kityminder-container .CodeMirror-scrollbar-filler {
  right: 0; bottom: 0;
}
.kityminder-container .CodeMirror-gutter-filler {
  left: 0; bottom: 0;
}

.kityminder-container .CodeMirror-gutters {
  position: absolute; left: 0; top: 0;
  z-index: 3;
}
.kityminder-container .CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  display: inline-block;
  margin-bottom: -30px;
  /* Hack to make IE7 behave */
  *zoom:1;
  *display:inline;
}
.kityminder-container .CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  height: 100%;
}
.kityminder-container .CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4;
}

.kityminder-container .CodeMirror-lines {
  cursor: text;
  min-height: 1px; /* prevents collapsing before first draw */
}
.kityminder-container .CodeMirror pre {
  /* Reset some styles that the rest of the page might have set */
  -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
}
.kityminder-container .CodeMirror-wrap pre {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
}

.kityminder-container .CodeMirror-linebackground {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
}

.kityminder-container .CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  overflow: auto;
}

.kityminder-container .CodeMirror-widget {}

.kityminder-container .CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}
.kityminder-container .CodeMirror-measure pre { position: static; }

.kityminder-container .CodeMirror div.CodeMirror-cursor {
  position: absolute;
  border-right: none;
  width: 0;
}

.kityminder-container div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3;
}
.kityminder-container .CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible;
}

.kityminder-container .CodeMirror-selected { background: #d9d9d9; }
.kityminder-container .CodeMirror-focused .CodeMirror-selected { background: #d7d4f0; }
.kityminder-container .CodeMirror-crosshair { cursor: crosshair; }

.kityminder-container .cm-searching {
  background: #ffa;
  background: rgba(255, 255, 0, .4);
}

/* IE7 hack to prevent it from returning funny offsetTops on the spans */
.kityminder-container .CodeMirror span { *vertical-align: text-bottom; }

/* Used to force a border model for a node */
.kityminder-container .cm-force-border { padding-right: .1px; }

@media print {
  /* Hide the cursor when printing */
  .kityminder-container .CodeMirror div.CodeMirror-cursors {
    visibility: hidden;
  }
}

/* See issue #2901 */
.kityminder-container .cm-tab-wrap-hack:after { content: ''; }

/* Help users use markselection to safely style text background */
.kityminder-container span.CodeMirror-selectedtext { background: none; }

.kityminder-container .colorpicker-container {
  border: 1px solid #d3d3d3;
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  z-index: 9999;
  position: absolute;
  display: none;
  box-sizing: content-box;
}
.kityminder-container .colorpicker-container div,
.kityminder-container .colorpicker-container span {
  box-sizing: content-box;
}
.kityminder-container .colorpicker-container:focus,
.kityminder-container .colorpicker-container:active:focus {
  outline: none;
}
.kityminder-container .colorpicker-container .colorpicker-colors {
  margin: 0;
  padding: 0;
  font-size: 0;
  line-height: 0;
}
.kityminder-container .colorpicker-container .colorpicker-colors-line0 {
  margin-bottom: 3px;
}
.kityminder-container .colorpicker-container .colorpicker-colors-item {
  display: inline-block;
  margin: 0 2px;
  width: 13px;
  height: 13px;
  border-style: solid;
  border-width: 1px;
}
.kityminder-container .colorpicker-container .colorpicker-commoncolor,
.kityminder-container .colorpicker-container .colorpicker-standardcolor,
.kityminder-container .colorpicker-container .colorpicker-latestcolor {
  margin: 4px 3px;
  white-space: nowrap;
}
.kityminder-container .colorpicker-toolbar {
  margin: 8px 4px;
  height: 27px;
  position: relative;
}
.kityminder-container .colorpicker-toolbar .colorpicker-preview {
  display: inline-block;
  height: 25px;
  line-height: 25px;
  width: 115px;
  border: 1px solid #d3d3d3;
}
.kityminder-container .colorpicker-toolbar .colorpicker-clear {
  display: inline-block;
  height: 25px;
  line-height: 25px;
  width: 60px;
  border: 1px solid #d3d3d3;
  font-size: 12px;
  text-align: center;
  position: absolute;
  right: 5px;
  cursor: pointer;
}
.kityminder-container .colorpicker-title {
  padding: 2px 4px;
}
.kityminder-container .colorpicker-toolbar,
.kityminder-container .colorpicker-title {
  font-size: 12px;
  color: #000;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.kityminder-container .colorpicker-morecolor label {
  width: 100%;
  display: inline-block;
  height: 20px;
  line-height: 20px;
  margin: 0;
  font-weight: normal;
}
.kityminder-container .colorpicker-morecolor .native-color-picker {
  visibility: hidden;
  position: absolute;
  top: -9999px;
  right: -9999px;
}
.kityminder-container .colorpicker-morecolor:hover {
  background-color: #dedede;
}
.kityminder-container .colorpicker-morecolor:active {
  background-color: #999;
}
.kityminder-container .hotbox {
  font-family: Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
}
.kityminder-container .hotbox .state {
  position: absolute;
  overflow: visible;
  display: none;
}
.kityminder-container .hotbox .state .center .button,
.kityminder-container .hotbox .state .ring .button {
  position: absolute;
  width: 70px;
  height: 70px;
  margin-left: -35px;
  margin-top: -35px;
  border-radius: 100%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}
.kityminder-container .hotbox .state .center .label,
.kityminder-container .hotbox .state .ring .label,
.kityminder-container .hotbox .state .center .key,
.kityminder-container .hotbox .state .ring .key {
  display: block;
  text-align: center;
  line-height: 1.4em;
  vertical-align: middle;
}
.kityminder-container .hotbox .state .center .label,
.kityminder-container .hotbox .state .ring .label {
  font-size: 16px;
  margin-top: 17px;
  color: black;
  font-weight: normal;
  line-height: 1em;
}
.kityminder-container .hotbox .state .center .key,
.kityminder-container .hotbox .state .ring .key {
  font-size: 12px;
  color: #999;
}
.kityminder-container .hotbox .state .ring-shape {
  position: absolute;
  left: -25px;
  top: -25px;
  border: 25px solid rgba(0, 0, 0, 0.3);
  border-radius: 100%;
  box-sizing: content-box;
}
.kityminder-container .hotbox .state .top,
.kityminder-container .hotbox .state .bottom {
  position: absolute;
  white-space: nowrap;
}
.kityminder-container .hotbox .state .top .button,
.kityminder-container .hotbox .state .bottom .button {
  display: inline-block;
  padding: 8px 15px;
  margin: 0 10px;
  border-radius: 15px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  position: relative;
}
.kityminder-container .hotbox .state .top .button .label,
.kityminder-container .hotbox .state .bottom .button .label {
  font-size: 14px;
  line-height: 14px;
  vertical-align: middle;
  color: black;
  line-height: 1em;
}
.kityminder-container .hotbox .state .top .button .key,
.kityminder-container .hotbox .state .bottom .button .key {
  font-size: 12px;
  line-height: 12px;
  vertical-align: middle;
  color: #999;
  margin-left: 3px;
}
.kityminder-container .hotbox .state .top .button .key:before,
.kityminder-container .hotbox .state .bottom .button .key:before {
  content: '(';
}
.kityminder-container .hotbox .state .top .button .key:after,
.kityminder-container .hotbox .state .bottom .button .key:after {
  content: ')';
}
.kityminder-container .hotbox .state .button {
  background: #F9F9F9;
  overflow: hidden;
  cursor: default;
}
.kityminder-container .hotbox .state .button .key,
.kityminder-container .hotbox .state .button .label {
  opacity: 0.3;
}
.kityminder-container .hotbox .state .button.enabled {
  background: white;
}
.kityminder-container .hotbox .state .button.enabled .key,
.kityminder-container .hotbox .state .button.enabled .label {
  opacity: 1;
}
.kityminder-container .hotbox .state .button.enabled:hover {
  background: #e87372;
}
.kityminder-container .hotbox .state .button.enabled:hover .label {
  color: white;
}
.kityminder-container .hotbox .state .button.enabled:hover .key {
  color: #fadfdf;
}
.kityminder-container .hotbox .state .button.enabled.selected {
  -webkit-animation: selected 0.1s ease;
  background: #e45d5c;
}
.kityminder-container .hotbox .state .button.enabled.selected .label {
  color: white;
}
.kityminder-container .hotbox .state .button.enabled.selected .key {
  color: #fadfdf;
}
.kityminder-container .hotbox .state .button.enabled.pressed,
.kityminder-container .hotbox .state .button.enabled:active {
  background: #FF974D;
}
.kityminder-container .hotbox .state .button.enabled.pressed .label,
.kityminder-container .hotbox .state .button.enabled:active .label {
  color: white;
}
.kityminder-container .hotbox .state .button.enabled.pressed .key,
.kityminder-container .hotbox .state .button.enabled:active .key {
  color: #fff0e6;
}
.kityminder-container .hotbox .state.active {
  display: block;
}
@-webkit-keyframes selected {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
.kityminder-container .hotbox-key-receiver {
  position: absolute;
  left: -999999px;
  top: -999999px;
  width: 20px;
  height: 20px;
  outline: none;
  margin: 0;
}
.kityminder-container .km-editor {
  overflow: hidden;
  z-index: 2;
}
.kityminder-container .km-editor > .mask {
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: transparent;
}
.kityminder-container .km-editor > .receiver {
  position: absolute;
  background: white;
  outline: none;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  left: 0;
  top: 0;
  padding: 3px 5px;
  margin-left: -3px;
  margin-top: -5px;
  max-width: 300px;
  width: auto;
  font-size: 14px;
  line-height: 1.4em;
  min-height: 1.4em;
  box-sizing: border-box;
  overflow: hidden;
  word-break: break-all;
  word-wrap: break-word;
  border: none;
  -webkit-user-select: text;
  pointer-events: none;
  opacity: 0;
  z-index: -1000;
}
.kityminder-container .km-editor > .receiver.debug {
  opacity: 1;
  outline: 1px solid green;
  background: none;
  z-index: 0;
}
.kityminder-container .km-editor > .receiver.input {
  pointer-events: all;
  opacity: 1;
  z-index: 999;
  background: white;
  outline: none;
}
.kityminder-container div.minder-editor-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  font-family: Arial, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}
.kityminder-container .minder-editor {
  position: absolute;
  top: 92px;
  left: 0;
  right: 0;
  bottom: 0;
}
.kityminder-container .minder-viewer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.kityminder-container .control-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 250px;
  bottom: 0;
  border-left: 1px solid #CCC;
}
.kityminder-container .minder-divider {
  position: absolute;
  top: 0;
  right: 250px;
  bottom: 0;
  width: 2px;
  background-color: #fbfbfb;
  cursor: ew-resize;
}
.kityminder-container .panel-body {
  padding: 10px;
}
.kityminder-container .upload-image {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.kityminder-container .top-tab .nav-tabs {
  background-color: #e1e1e1;
  border: 0;
  height: 32px;
}
.kityminder-container .top-tab .nav-tabs li {
  margin: 0;
}
.kityminder-container .top-tab .nav-tabs li a {
  margin: 0;
  border: 0;
  padding: 6px 15px;
  border-radius: 0;
  vertical-align: middle;
}
.kityminder-container .top-tab .nav-tabs li a:hover,
.kityminder-container .top-tab .nav-tabs li a:focus {
  background: inherit;
  border: 0;
}
.kityminder-container .top-tab .nav-tabs li.active a {
  border: 0;
  background-color: #fff;
}
.kityminder-container .top-tab .nav-tabs li.active a:hover,
.kityminder-container .top-tab .nav-tabs li.active a:focus {
  border: 0;
}
.kityminder-container .top-tab .tab-content {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
}
.kityminder-container .top-tab .tab-pane {
  font-size: 0;
}
.kityminder-container .km-btn-group {
  display: inline-block;
  margin: 5px 0;
  padding: 0 5px;
  vertical-align: middle;
  border-right: 1px dashed #eee;
}
.kityminder-container .km-btn-item {
  display: inline-block;
  margin: 0 3px;
  font-size: 0;
  cursor: default;
}
.kityminder-container .km-btn-item[disabled] {
  opacity: 0.5;
}
.kityminder-container .km-btn-item[disabled]:hover,
.kityminder-container .km-btn-item[disabled]:active {
  background-color: #fff;
}
.kityminder-container .km-btn-item .km-btn-icon {
  display: inline-block;
  background: url(/images/icons..png) no-repeat;
  background-position: 0 20px;
  width: 20px;
  height: 20px;
  padding: 2px;
  margin: 1px;
  vertical-align: middle;
}
.kityminder-container .km-btn-item .km-btn-caption {
  display: inline-block;
  font-size: 12px;
  vertical-align: middle;
}
.kityminder-container .km-btn-item:hover {
  background-color: hsl(222, 55%, 96%);
}
.kityminder-container .km-btn-item:active {
  background-color: hsl(222, 55%, 85%);
}
.kityminder-container .do-group {
  width: 38px;
}
.kityminder-container .undo .km-btn-icon {
  background-position: 0 -1240px;
}
.kityminder-container .redo .km-btn-icon {
  background-position: 0 -1220px;
}
.kityminder-container .append-group {
  width: 212px;
}
.kityminder-container .append-child-node .km-btn-icon {
  background-position: 0 0;
}
.kityminder-container .append-sibling-node .km-btn-icon {
  background-position: 0 -20px;
}
.kityminder-container .append-parent-node .km-btn-icon {
  background-position: 0 -40px;
}
.kityminder-container .arrange-group {
  width: 64px;
}
.kityminder-container .arrange-up .km-btn-icon {
  background-position: 0 -280px;
}
.kityminder-container .arrange-down .km-btn-icon {
  background-position: 0 -300px;
}
.kityminder-container .operation-group {
  width: 64px;
}
.kityminder-container .edit-node .km-btn-icon {
  background-position: 0 -60px;
}
.kityminder-container .remove-node .km-btn-icon {
  background-position: 0 -80px;
}
.kityminder-container .btn-group-vertical {
  vertical-align: middle;
  margin: 5px;
}
.kityminder-container .btn-group-vertical .hyperlink,
.kityminder-container .btn-group-vertical .hyperlink-caption {
  width: 40px;
  margin: 0;
  padding: 0;
  border: none!important;
  border-radius: 0!important;
}
.kityminder-container .btn-group-vertical .hyperlink:hover,
.kityminder-container .btn-group-vertical .hyperlink-caption:hover {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .hyperlink:active,
.kityminder-container .btn-group-vertical .hyperlink-caption:active {
  background-color: #c4d0ee;
}
.kityminder-container .btn-group-vertical .hyperlink.active,
.kityminder-container .btn-group-vertical .hyperlink-caption.active {
  box-shadow: none;
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .hyperlink {
  height: 25px;
  background: url(/images/icons..png) no-repeat center -100px;
}
.kityminder-container .btn-group-vertical .hyperlink-caption {
  height: 20px;
}
.kityminder-container .btn-group-vertical .hyperlink-caption .caption {
  font-size: 12px;
}
.kityminder-container .open > .dropdown-toggle.btn-default {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .image-btn,
.kityminder-container .btn-group-vertical .image-btn-caption {
  width: 40px;
  margin: 0;
  padding: 0;
  border: none!important;
  border-radius: 0!important;
}
.kityminder-container .btn-group-vertical .image-btn:hover,
.kityminder-container .btn-group-vertical .image-btn-caption:hover {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .image-btn:active,
.kityminder-container .btn-group-vertical .image-btn-caption:active {
  background-color: #c4d0ee;
}
.kityminder-container .btn-group-vertical .image-btn.active,
.kityminder-container .btn-group-vertical .image-btn-caption.active {
  box-shadow: none;
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .image-btn {
  height: 25px;
  background: url(/images/icons..png) no-repeat center -125px;
}
.kityminder-container .btn-group-vertical .image-btn-caption {
  height: 20px;
}
.kityminder-container .btn-group-vertical .image-btn-caption .caption {
  font-size: 12px;
}
.kityminder-container .image-preview {
  display: block;
  max-width: 50%;
}
.kityminder-container .modal-body .tab-pane {
  font-size: inherit;
  padding-top: 15px;
}
.kityminder-container .search-result {
  margin-top: 15px;
  height: 370px;
  overflow: hidden;
}
.kityminder-container .search-result ul {
  margin: 0;
  padding: 0;
  list-style: none;
  clear: both;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.kityminder-container .search-result ul li {
  list-style: none;
  float: left;
  display: block;
  width: 130px;
  height: 130px;
  line-height: 130px;
  margin: 6px;
  padding: 0;
  font-size: 12px;
  position: relative;
  vertical-align: top;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #fcfcfc;
}
.kityminder-container .search-result ul li.selected {
  border: 2px solid #fc8383;
}
.kityminder-container .search-result ul li img {
  max-width: 126px;
  max-height: 130px;
  vertical-align: middle;
}
.kityminder-container .search-result ul li span {
  display: block;
  position: absolute;
  bottom: 0;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  left: 0;
  right: 0;
  color: white;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
  opacity: 0;
  -webkit-transform: translate(0, 20px);
  -ms-transform: translate(0, 20px);
  transform: translate(0, 20px);
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}
.kityminder-container .search-result ul li:hover span {
  opacity: 1;
  -webkit-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  transform: translate(0, 0);
}
@media (min-width: 768px) {
  .kityminder-container .form-inline .form-control {
    width: 422px;
  }
}
.kityminder-container .btn-group-vertical {
  vertical-align: top;
  margin: 5px;
}
.kityminder-container .btn-group-vertical.note-btn-group {
  border-right: 1px dashed #eee;
  padding-right: 5px;
}
.kityminder-container .btn-group-vertical .note-btn,
.kityminder-container .btn-group-vertical .note-btn-caption {
  width: 40px;
  margin: 0;
  padding: 0;
  border: none!important;
  border-radius: 0!important;
}
.kityminder-container .btn-group-vertical .note-btn:hover,
.kityminder-container .btn-group-vertical .note-btn-caption:hover {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .note-btn:active,
.kityminder-container .btn-group-vertical .note-btn-caption:active {
  background-color: #c4d0ee;
}
.kityminder-container .btn-group-vertical .note-btn.active,
.kityminder-container .btn-group-vertical .note-btn-caption.active {
  box-shadow: none;
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .note-btn {
  height: 25px;
  background: url(/images/icons..png) no-repeat center -1150px;
}
.kityminder-container .btn-group-vertical .note-btn-caption {
  height: 20px;
}
.kityminder-container .btn-group-vertical .note-btn-caption .caption {
  font-size: 12px;
}
.kityminder-container .open > .dropdown-toggle.btn-default {
  background-color: #eff3fa;
}
.kityminder-container .gfm-render {
  font-size: 12px;
  -webkit-user-select: text;
  color: #333;
  line-height: 1.8em;
}
.kityminder-container .gfm-render blockquote,
.kityminder-container .gfm-render ul,
.kityminder-container .gfm-render table,
.kityminder-container .gfm-render p,
.kityminder-container .gfm-render pre,
.kityminder-container .gfm-render hr {
  margin: 1em 0;
  cursor: text;
}
.kityminder-container .gfm-render blockquote:first-child:last-child,
.kityminder-container .gfm-render ul:first-child:last-child,
.kityminder-container .gfm-render table:first-child:last-child,
.kityminder-container .gfm-render p:first-child:last-child,
.kityminder-container .gfm-render pre:first-child:last-child,
.kityminder-container .gfm-render hr:first-child:last-child {
  margin: 0;
}
.kityminder-container .gfm-render img {
  max-width: 100%;
}
.kityminder-container .gfm-render a {
  color: blue;
}
.kityminder-container .gfm-render a:hover {
  color: red;
}
.kityminder-container .gfm-render blockquote {
  display: block;
  border-left: 4px solid #E4AD91;
  color: #da8e68;
  padding-left: 10px;
  font-style: italic;
  margin-left: 2em;
}
.kityminder-container .gfm-render ul,
.kityminder-container .gfm-render ol {
  padding-left: 3em;
}
.kityminder-container .gfm-render table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.kityminder-container .gfm-render table th,
.kityminder-container .gfm-render table td {
  border: 1px solid #666;
  padding: 2px 4px;
}
.kityminder-container .gfm-render table th {
  background: rgba(45, 141, 234, 0.2);
}
.kityminder-container .gfm-render table tr:nth-child(even) td {
  background: rgba(45, 141, 234, 0.03);
}
.kityminder-container .gfm-render em {
  color: red;
}
.kityminder-container .gfm-render del {
  color: #999;
}
.kityminder-container .gfm-render pre {
  background: rgba(45, 141, 234, 0.1);
  padding: 5px;
  border-radius: 5px;
  word-break: break-all;
  word-wrap: break-word;
}
.kityminder-container .gfm-render code {
  background: rgba(45, 141, 234, 0.1);
  /*         display: inline-block; */
  padding: 0 5px;
  border-radius: 3px;
}
.kityminder-container .gfm-render pre code {
  background: none;
}
.kityminder-container .gfm-render hr {
  border: none;
  border-top: 1px solid #CCC;
}
.kityminder-container .gfm-render .highlight {
  background: yellow;
  color: red;
}
.kityminder-container .km-note {
  width: 300px;
  border-left: 1px solid #babfcd;
  padding: 5px 10px;
  background: white;
  position: absolute;
  top: 92px;
  right: 0;
  bottom: 0;
  left: auto;
  z-index: 3;
}
.kityminder-container .km-note.panel {
  margin: 0;
  padding: 0;
}
.kityminder-container .km-note.panel .panel-heading h3 {
  display: inline-block;
}
.kityminder-container .km-note.panel .panel-heading .close-note-editor {
  width: 15px;
  height: 15px;
  display: inline-block;
  float: right;
}
.kityminder-container .km-note.panel .panel-heading .close-note-editor:hover {
  cursor: pointer;
}
.kityminder-container .km-note.panel .panel-body {
  padding: 0;
}
.kityminder-container .km-note .CodeMirror {
  position: absolute;
  top: 41px;
  bottom: 0;
  height: auto;
  cursor: text;
  font-size: 14px;
  line-height: 1.3em;
  font-family: consolas;
}
.kityminder-container .km-note-tips {
  color: #ccc;
  padding: 3px 8px;
}
.kityminder-container #previewer-content {
  position: absolute;
  background: #FFD;
  padding: 5px 15px;
  border-radius: 5px;
  max-width: 400px;
  max-height: 200px;
  overflow: auto;
  z-index: 10;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  word-break: break-all;
  font-size: 12px;
  -webkit-user-select: text;
  color: #333;
  line-height: 1.8em;
}
.kityminder-container #previewer-content blockquote,
.kityminder-container #previewer-content ul,
.kityminder-container #previewer-content table,
.kityminder-container #previewer-content p,
.kityminder-container #previewer-content pre,
.kityminder-container #previewer-content hr {
  margin: 1em 0;
  cursor: text;
}
.kityminder-container #previewer-content blockquote:first-child:last-child,
.kityminder-container #previewer-content ul:first-child:last-child,
.kityminder-container #previewer-content table:first-child:last-child,
.kityminder-container #previewer-content p:first-child:last-child,
.kityminder-container #previewer-content pre:first-child:last-child,
.kityminder-container #previewer-content hr:first-child:last-child {
  margin: 0;
}
.kityminder-container #previewer-content img {
  max-width: 100%;
}
.kityminder-container #previewer-content a {
  color: blue;
}
.kityminder-container #previewer-content a:hover {
  color: red;
}
.kityminder-container #previewer-content blockquote {
  display: block;
  border-left: 4px solid #E4AD91;
  color: #da8e68;
  padding-left: 10px;
  font-style: italic;
  margin-left: 2em;
}
.kityminder-container #previewer-content ul,
.kityminder-container #previewer-content ol {
  padding-left: 3em;
}
.kityminder-container #previewer-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
.kityminder-container #previewer-content table th,
.kityminder-container #previewer-content table td {
  border: 1px solid #666;
  padding: 2px 4px;
}
.kityminder-container #previewer-content table th {
  background: rgba(45, 141, 234, 0.2);
}
.kityminder-container #previewer-content table tr:nth-child(even) td {
  background: rgba(45, 141, 234, 0.03);
}
.kityminder-container #previewer-content em {
  color: red;
}
.kityminder-container #previewer-content del {
  color: #999;
}
.kityminder-container #previewer-content pre {
  background: rgba(45, 141, 234, 0.1);
  padding: 5px;
  border-radius: 5px;
  word-break: break-all;
  word-wrap: break-word;
}
.kityminder-container #previewer-content code {
  background: rgba(45, 141, 234, 0.1);
  /*         display: inline-block; */
  padding: 0 5px;
  border-radius: 3px;
}
.kityminder-container #previewer-content pre code {
  background: none;
}
.kityminder-container #previewer-content hr {
  border: none;
  border-top: 1px solid #CCC;
}
.kityminder-container #previewer-content .highlight {
  background: yellow;
  color: red;
}
.kityminder-container #previewer-content.ng-hide {
  display: block!important;
  left: -99999px !important;
  top: -99999px !important;
}
.kityminder-container .panel-body {
  padding: 10px;
}
.kityminder-container .tab-content .km-priority {
  vertical-align: middle;
  font-size: inherit;
  display: inline-block;
  width: 140px;
  margin: 5px;
  border-right: 1px dashed #eee;
}
.kityminder-container .tab-content .km-priority .km-priority-item {
  margin: 0 1px;
  padding: 1px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon {
  background: url(/images/iconpriority..png) repeat-y;
  background-color: transparent;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-0 {
  background-position: 0 20px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-1 {
  background-position: 0 0px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-2 {
  background-position: 0 -20px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-3 {
  background-position: 0 -40px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-4 {
  background-position: 0 -60px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-5 {
  background-position: 0 -80px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-6 {
  background-position: 0 -100px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-7 {
  background-position: 0 -120px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-8 {
  background-position: 0 -140px;
}
.kityminder-container .tab-content .km-priority .km-priority-item .km-priority-icon.priority-9 {
  background-position: 0 -160px;
}
.kityminder-container .tab-content .km-progress {
  vertical-align: middle;
  font-size: inherit;
  display: inline-block;
  width: 140px;
  margin: 5px;
  border-right: 1px dashed #eee;
}
.kityminder-container .tab-content .km-progress .km-progress-item {
  margin: 0 1px;
  padding: 1px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon {
  background: url(/images/iconprogress..png) repeat-y;
  background-color: transparent;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-0 {
  background-position: 0 20px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-1 {
  background-position: 0 0px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-2 {
  background-position: 0 -20px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-3 {
  background-position: 0 -40px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-4 {
  background-position: 0 -60px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-5 {
  background-position: 0 -80px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-6 {
  background-position: 0 -100px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-7 {
  background-position: 0 -120px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-8 {
  background-position: 0 -140px;
}
.kityminder-container .tab-content .km-progress .km-progress-item .km-progress-icon.progress-9 {
  background-position: 0 -160px;
}
.kityminder-container .resource-editor {
  vertical-align: middle;
  display: inline-block;
  margin: 5px;
}
.kityminder-container .resource-editor .input-group,
.kityminder-container .resource-editor .km-resource {
  font-size: 12px;
}
.kityminder-container .resource-editor .input-group {
  height: 20px;
  width: 168px;
}
.kityminder-container .resource-editor .resource-dropdown {
  position: relative;
  width: 168px;
  border: 1px solid #ccc;
  margin-top: -1px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
.kityminder-container .resource-editor .resource-dropdown .km-resource {
  position: absolute;
  width: 154px;
  margin-bottom: 3px;
  padding: 0;
  list-style-type: none;
  overflow: scroll;
  max-height: 500px;
}
.kityminder-container .resource-editor .resource-dropdown .km-resource.open {
  z-index: 3;
  background-color: #fff;
}
.kityminder-container .resource-editor .resource-dropdown .km-resource li {
  display: inline-block;
  padding: 1px 2px;
  border-radius: 4px;
  margin: 2px 3px;
}
.kityminder-container .resource-editor .resource-dropdown .km-resource li[disabled] {
  opacity: 0.5;
}
.kityminder-container .resource-editor .resource-dropdown .resource-caret {
  display: block;
  float: right;
  vertical-align: middle;
  width: 12px;
  height: 24px;
  padding: 8px 1px;
}
.kityminder-container .resource-editor .resource-dropdown .resource-caret:hover {
  background-color: hsl(222, 55%, 96%);
}
.kityminder-container .resource-editor .resource-dropdown .resource-caret:active {
  background-color: hsl(222, 55%, 85%);
}
.kityminder-container .resource-editor input.form-control,
.kityminder-container .resource-editor .btn {
  font-size: 12px;
}
.kityminder-container .resource-editor input.form-control {
  padding: 2px 4px;
  height: 24px;
  border-bottom-left-radius: 0;
}
.kityminder-container .resource-editor .input-group-btn {
  line-height: 24px;
}
.kityminder-container .resource-editor .input-group-btn .btn {
  padding: 2px 4px;
  height: 24px;
  border-bottom-right-radius: 0;
}
.kityminder-container .temp-panel {
  margin: 5px 5px 5px 10px;
  border-right: 1px dashed #eee;
  display: inline-block;
  vertical-align: middle;
}
.kityminder-container .temp-list {
  min-width: 124px;
}
.kityminder-container .temp-item-wrap {
  width: 50px;
  height: 40px;
  padding: 0 2px;
  margin: 5px;
  display: inline-block;
}
.kityminder-container .temp-item {
  display: inline-block;
  width: 50px;
  height: 40px;
  background-image: url(/images/template..png);
  background-repeat: no-repeat;
}
.kityminder-container .temp-item.default {
  background-position: 0 0;
}
.kityminder-container .temp-item.structure {
  background-position: -50px 0;
}
.kityminder-container .temp-item.filetree {
  background-position: -100px 0;
}
.kityminder-container .temp-item.right {
  background-position: -150px 0;
}
.kityminder-container .temp-item.fish-bone {
  background-position: -200px 0;
}
.kityminder-container .temp-item.tianpan {
  background-position: -250px 0;
}
.kityminder-container .current-temp-item {
  width: 74px;
  padding: 0 0 0 5px;
  border: 1px solid #fff;
}
.kityminder-container .current-temp-item:hover {
  background-color: #eff3fa;
}
.kityminder-container .current-temp-item[disabled] {
  opacity: 0.5;
}
.kityminder-container .current-temp-item .caret {
  margin-left: 5px;
}
.kityminder-container .temp-item-selected {
  background-color: #87a9da;
}
.kityminder-container .theme-panel {
  height: 42px;
  margin: 5px;
  padding: 0 5px 0 0;
  border-right: 1px dashed #eee;
  display: inline-block;
  vertical-align: middle;
}
.kityminder-container .theme-list {
  min-width: 162px;
}
.kityminder-container div a.theme-item {
  display: inline-block;
  width: 70px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  padding: 0 5px;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  color: #000;
}
.kityminder-container .theme-item-selected {
  width: 100px;
  padding: 6px 7px;
  border: 1px solid #fff;
}
.kityminder-container .theme-item-selected:hover {
  background-color: #eff3fa;
}
.kityminder-container .theme-item-selected .caret {
  margin-left: 5px;
}
.kityminder-container .theme-item-selected[disabled] {
  opacity: 0.5;
}
.kityminder-container .theme-item-wrap {
  display: inline-block;
  width: 80px;
  height: 40px;
  padding: 5px;
}
.kityminder-container .theme-item-wrap:hover {
  background-color: #eff3fa;
}
.kityminder-container .readjust-layout {
  display: inline-block;
  vertical-align: middle;
  padding: 0 10px 0 5px;
  border-right: 1px dashed #eee;
}
.kityminder-container .btn-icon {
  width: 25px;
  height: 25px;
  margin-left: 12px;
  display: block;
}
.kityminder-container .btn-label {
  font-size: 12px;
}
.kityminder-container .btn-wrap {
  width: 50px;
  height: 42px;
  cursor: pointer;
  display: inline-block;
  text-decoration: none;
}
.kityminder-container .btn-wrap[disabled] span {
  opacity: 0.5;
}
.kityminder-container .btn-wrap[disabled] {
  cursor: default;
}
.kityminder-container .btn-wrap[disabled]:hover {
  background-color: transparent;
}
.kityminder-container .btn-wrap[disabled]:active {
  background-color: transparent;
}
.kityminder-container .btn-wrap:link {
  text-decoration: none;
}
.kityminder-container .btn-wrap:visited {
  text-decoration: none;
}
.kityminder-container .btn-wrap:hover {
  background-color: #eff3fa;
  text-decoration: none;
}
.kityminder-container .btn-wrap:active {
  background-color: #c4d0ee;
}
.kityminder-container .reset-layout-icon {
  background: url(/images/icons..png) no-repeat;
  background-position: 0 -150px;
}
.kityminder-container .style-operator {
  display: inline-block;
  vertical-align: middle;
  padding: 0 5px;
  border-right: 1px dashed #eee;
}
.kityminder-container .style-operator .clear-style {
  vertical-align: middle;
}
.kityminder-container .clear-style-icon {
  background: url(/images/icons..png) no-repeat;
  background-position: 0 -175px;
}
.kityminder-container .s-btn-group-vertical {
  display: inline-block;
  vertical-align: middle;
}
.kityminder-container .s-btn-icon {
  width: 20px;
  height: 20px;
  margin-right: 3px;
  display: inline-block;
  vertical-align: middle;
}
.kityminder-container .s-btn-label {
  font-size: 12px;
  vertical-align: middle;
  display: inline-block;
}
.kityminder-container .s-btn-wrap {
  padding: 0 5px 0 3px;
  display: inline-block;
  text-decoration: none;
  font-size: 0;
}
.kityminder-container .s-btn-wrap[disabled] span {
  opacity: 0.5;
}
.kityminder-container .s-btn-wrap[disabled] {
  cursor: default;
}
.kityminder-container .s-btn-wrap[disabled]:hover {
  background-color: transparent;
}
.kityminder-container .s-btn-wrap[disabled]:active {
  background-color: transparent;
}
.kityminder-container .s-btn-wrap:hover {
  background-color: #eff3fa;
  text-decoration: none;
}
.kityminder-container .s-btn-wrap:active {
  background-color: #c4d0ee;
}
.kityminder-container .copy-style-icon {
  background: url(/images/icons..png) no-repeat;
  background-position: 0 -200px;
}
.kityminder-container .paste-style-wrap {
  display: block;
}
.kityminder-container .paste-style-icon {
  background: url(/images/icons..png) no-repeat;
  background-position: 0 -220px;
}
.kityminder-container .font-operator {
  width: 170px;
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  padding: 0 5px;
}
.kityminder-container .font-operator .font-size-list {
  display: inline-block;
  border: 1px solid #eee;
  padding: 2px 4px;
}
.kityminder-container .font-operator .font-family-list {
  display: inline-block;
  border: 1px solid #eee;
  padding: 2px 4px;
}
.kityminder-container .current-font-item a {
  text-decoration: none;
  display: inline-block;
}
.kityminder-container .current-font-family {
  width: 75px;
  height: 18px;
  overflow: hidden;
  vertical-align: bottom;
}
.kityminder-container .current-font-size {
  width: 32px;
  height: 18px;
  overflow: hidden;
  vertical-align: bottom;
}
.kityminder-container .current-font-item[disabled] {
  opacity: 0.5;
}
.kityminder-container .font-item {
  line-height: 1em;
  text-align: left;
}
.kityminder-container .font-item-selected {
  background-color: #87a9da;
}
.kityminder-container .font-bold,
.kityminder-container .font-italics {
  display: inline-block;
  background: url(/images/icons..png) no-repeat;
  cursor: pointer;
  margin: 0 3px;
}
.kityminder-container .font-bold:hover,
.kityminder-container .font-italics:hover {
  background-color: #eff3fa;
}
.kityminder-container .font-bold:active,
.kityminder-container .font-italics:active {
  background-color: #c4d0ee;
}
.kityminder-container .font-bold[disabled],
.kityminder-container .font-italics[disabled] {
  opacity: 0.5;
}
.kityminder-container .font-bold {
  background-position: 0 -240px;
}
.kityminder-container .font-italics {
  background-position: 0 -260px;
}
.kityminder-container .font-bold-selected,
.kityminder-container .font-italics-selected {
  background-color: #87a9da;
}
.kityminder-container .font-color-wrap {
  display: inline-block;
  width: 30px;
  height: 22px;
  margin: 3px 3px 0 0;
  border: 1px #efefef solid;
  vertical-align: middle;
  font-size: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.kityminder-container .font-color-wrap[disabled] {
  opacity: 0.5;
}
.kityminder-container .font-color-wrap .quick-font-color {
  display: inline-block;
  width: 20px;
  height: 16px;
  font-size: 14px;
  line-height: 16px;
  vertical-align: top;
  text-align: center;
  cursor: default;
  color: #000;
}
.kityminder-container .font-color-wrap .quick-font-color:hover {
  background-color: #eff3fa;
}
.kityminder-container .font-color-wrap .quick-font-color:active {
  background-color: #c4d0ee;
}
.kityminder-container .font-color-wrap .quick-font-color[disabled] {
  opacity: 0.5;
}
.kityminder-container .font-color-wrap .font-color-preview {
  display: inline-block;
  width: 12px;
  height: 2px;
  margin: 0 4px 0;
  background-color: #000;
}
.kityminder-container .font-color-wrap .font-color-preview[disabled] {
  opacity: 0.5;
}
.kityminder-container .font-color {
  display: inline-block;
  width: 8px;
  height: 16px;
}
.kityminder-container .font-color:hover {
  background-color: #eff3fa;
}
.kityminder-container .font-color:active {
  background-color: #c4d0ee;
}
.kityminder-container .font-color[disabled] {
  opacity: 0.5;
}
.kityminder-container .font-color .caret {
  margin-left: -2px;
  margin-top: 7px;
}
.kityminder-container .bg-color-wrap {
  display: inline-block;
  width: 30px;
  height: 22px;
  margin: 3px 3px 0 0;
  border: 1px #efefef solid;
  vertical-align: middle;
  font-size: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.kityminder-container .bg-color-wrap[disabled] {
  opacity: 0.5;
}
.kityminder-container .bg-color-wrap .quick-bg-color {
  display: inline-block;
  width: 20px;
  height: 16px;
  font-size: 14px;
  line-height: 16px;
  vertical-align: top;
  text-align: center;
  cursor: default;
  color: #000;
  background: url(/images/icons..png) no-repeat center -1260px;
}
.kityminder-container .bg-color-wrap .quick-bg-color:hover {
  background-color: #eff3fa;
}
.kityminder-container .bg-color-wrap .quick-bg-color:active {
  background-color: #c4d0ee;
}
.kityminder-container .bg-color-wrap .quick-bg-color[disabled] {
  opacity: 0.5;
}
.kityminder-container .bg-color-wrap .bg-color-preview {
  display: inline-block;
  width: 12px;
  height: 2px;
  margin: 0 4px 0;
  background-color: #fff;
}
.kityminder-container .bg-color-wrap .bg-color-preview[disabled] {
  opacity: 0.5;
}
.kityminder-container .bg-color {
  display: inline-block;
  width: 8px;
  height: 16px;
}
.kityminder-container .bg-color:hover {
  background-color: #eff3fa;
}
.kityminder-container .bg-color:active {
  background-color: #c4d0ee;
}
.kityminder-container .bg-color[disabled] {
  opacity: 0.5;
}
.kityminder-container .bg-color .caret {
  margin-left: -2px;
  margin-top: 7px;
}
.kityminder-container .btn-group-vertical {
  vertical-align: middle;
  margin: 5px;
}
.kityminder-container .btn-group-vertical .expand,
.kityminder-container .btn-group-vertical .expand-caption {
  width: 40px;
  margin: 0;
  padding: 0;
  border: none!important;
  border-radius: 0!important;
}
.kityminder-container .btn-group-vertical .expand:hover,
.kityminder-container .btn-group-vertical .expand-caption:hover {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .expand:active,
.kityminder-container .btn-group-vertical .expand-caption:active {
  background-color: #c4d0ee;
}
.kityminder-container .btn-group-vertical .expand.active,
.kityminder-container .btn-group-vertical .expand-caption.active {
  box-shadow: none;
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .expand {
  height: 25px;
  background: url(/images/icons..png) no-repeat 0 -995px;
  background-position-x: 50%;
}
.kityminder-container .btn-group-vertical .expand-caption {
  height: 20px;
}
.kityminder-container .btn-group-vertical .expand-caption .caption {
  font-size: 12px;
}
.kityminder-container .btn-group-vertical {
  vertical-align: middle;
  margin: 5px;
}
.kityminder-container .btn-group-vertical .select,
.kityminder-container .btn-group-vertical .select-caption {
  width: 40px;
  margin: 0;
  padding: 0;
  border: none!important;
  border-radius: 0!important;
}
.kityminder-container .btn-group-vertical .select:hover,
.kityminder-container .btn-group-vertical .select-caption:hover {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .select:active,
.kityminder-container .btn-group-vertical .select-caption:active {
  background-color: #c4d0ee;
}
.kityminder-container .btn-group-vertical .select.active,
.kityminder-container .btn-group-vertical .select-caption.active {
  box-shadow: none;
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .select {
  height: 25px;
  background: url(/images/icons..png) no-repeat 7px -1175px;
}
.kityminder-container .btn-group-vertical .select-caption {
  height: 20px;
}
.kityminder-container .btn-group-vertical .select-caption .caption {
  font-size: 12px;
}
.kityminder-container .btn-group-vertical {
  vertical-align: middle;
  margin: 5px;
}
.kityminder-container .btn-group-vertical .search,
.kityminder-container .btn-group-vertical .search-caption {
  width: 40px;
  margin: 0;
  padding: 0;
  border: none!important;
  border-radius: 0!important;
}
.kityminder-container .btn-group-vertical .search:hover,
.kityminder-container .btn-group-vertical .search-caption:hover {
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .search:active,
.kityminder-container .btn-group-vertical .search-caption:active {
  background-color: #c4d0ee;
}
.kityminder-container .btn-group-vertical .search.active,
.kityminder-container .btn-group-vertical .search-caption.active {
  box-shadow: none;
  background-color: #eff3fa;
}
.kityminder-container .btn-group-vertical .search {
  height: 25px;
  background: url(/images/icons..png) no-repeat 0 -345px;
  background-position-x: 50%;
}
.kityminder-container .btn-group-vertical .search-caption {
  height: 20px;
}
.kityminder-container .btn-group-vertical .search-caption .caption {
  font-size: 12px;
}
.kityminder-container .search-box {
  float: right;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  position: relative;
  top: 0;
  z-index: 3;
  width: 360px;
  height: 40px;
  padding: 3px 6px;
  opacity: 1;
}
.kityminder-container .search-box .search-input-wrap,
.kityminder-container .search-box .prev-and-next-btn {
  float: left;
}
.kityminder-container .search-box .close-search {
  float: right;
  height: 16px;
  width: 16px;
  padding: 1px;
  border-radius: 100%;
  margin-top: 6px;
  margin-right: 10px;
}
.kityminder-container .search-box .close-search .glyphicon {
  top: -1px;
}
.kityminder-container .search-box .close-search:hover {
  background-color: #efefef;
}
.kityminder-container .search-box .close-search:active {
  background-color: #999;
}
.kityminder-container .search-box .search-input-wrap {
  width: 240px;
}
.kityminder-container .search-box .prev-and-next-btn {
  margin-left: 5px;
}
.kityminder-container .search-box .prev-and-next-btn .btn:focus {
  outline: none;
}
.kityminder-container .search-box .search-addon {
  background-color: #fff;
}
.kityminder-container .tool-group {
  padding: 0;
}
.kityminder-container .tool-group[disabled] {
  opacity: 0.5;
}
.kityminder-container .tool-group .tool-group-item {
  display: inline-block;
  border-radius: 4px;
}
.kityminder-container .tool-group .tool-group-item .tool-group-icon {
  width: 20px;
  height: 20px;
  padding: 2px;
  margin: 1px;
}
.kityminder-container .tool-group .tool-group-item:hover {
  background-color: hsl(222, 55%, 96%);
}
.kityminder-container .tool-group .tool-group-item:active {
  background-color: hsl(222, 55%, 85%);
}
.kityminder-container .tool-group .tool-group-item.active {
  background-color: hsl(222, 55%, 85%);
}
.kityminder-container .nav-bar {
  position: absolute;
  width: 35px;
  height: 240px;
  padding: 5px 0;
  left: 10px;
  bottom: 10px;
  background: #fc8383;
  color: #fff;
  border-radius: 4px;
  z-index: 10;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  transition: -webkit-transform 0.7s 0.1s ease;
  transition: transform 0.7s 0.1s ease;
}
.kityminder-container .nav-bar .nav-btn {
  width: 35px;
  height: 24px;
  line-height: 24px;
  text-align: center;
}
.kityminder-container .nav-bar .nav-btn .icon {
  background: url(/images/icons..png);
  width: 20px;
  height: 20px;
  margin: 2px auto;
  display: block;
}
.kityminder-container .nav-bar .nav-btn.active {
  background-color: #5A6378;
}
.kityminder-container .nav-bar .zoom-in .icon {
  background-position: 0 -730px;
}
.kityminder-container .nav-bar .zoom-out .icon {
  background-position: 0 -750px;
}
.kityminder-container .nav-bar .hand .icon {
  background-position: 0 -770px;
  width: 25px;
  height: 25px;
  margin: 0 auto;
}
.kityminder-container .nav-bar .camera .icon {
  background-position: 0 -870px;
  width: 25px;
  height: 25px;
  margin: 0 auto;
}
.kityminder-container .nav-bar .nav-trigger .icon {
  background-position: 0 -845px;
  width: 25px;
  height: 25px;
  margin: 0 auto;
}
.kityminder-container .nav-bar .zoom-pan {
  width: 2px;
  height: 70px;
  box-shadow: 0 1px #E50000;
  position: relative;
  background: white;
  margin: 3px auto;
  overflow: visible;
}
.kityminder-container .nav-bar .zoom-pan .origin {
  position: absolute;
  width: 20px;
  height: 8px;
  left: -9px;
  margin-top: -4px;
  background: transparent;
}
.kityminder-container .nav-bar .zoom-pan .origin:after {
  content: ' ';
  display: block;
  width: 6px;
  height: 2px;
  background: white;
  left: 7px;
  top: 3px;
  position: absolute;
}
.kityminder-container .nav-bar .zoom-pan .indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  left: -3px;
  background: white;
  border-radius: 100%;
  margin-top: -4px;
}
.kityminder-container .nav-previewer {
  background: #fff;
  width: 140px;
  height: 120px;
  position: absolute;
  left: 45px;
  bottom: 30px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  border-radius: 0 2px 2px 0;
  padding: 1px;
  z-index: 9;
  cursor: crosshair;
  transition: -webkit-transform 0.7s 0.1s ease;
  transition: transform 0.7s 0.1s ease;
}
.kityminder-container .nav-previewer.grab {
  cursor: move;
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: grabbing;
}

`;

// obsidian/main.ts
var DEFAULT_SETTINGS = {
  defaultPath: ""
};
var KityMinderSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "KityMinder Editor K \u8BBE\u7F6E" });
    new import_obsidian3.Setting(containerEl).setName("\u9ED8\u8BA4\u8111\u56FE\u5B58\u653E\u8DEF\u5F84").setDesc("\u65B0\u5EFA\u8111\u56FE\u6587\u4EF6\u65F6\u9ED8\u8BA4\u5B58\u653E\u7684\u6587\u4EF6\u5939\u8DEF\u5F84\uFF08\u76F8\u5BF9\u4E8E Vault \u6839\u76EE\u5F55\uFF0C\u7559\u7A7A\u5219\u5B58\u653E\u5230\u6839\u76EE\u5F55\uFF09").addText(
      (text) => text.setPlaceholder("\u4F8B\u5982: MindMaps").setValue(this.plugin.settings.defaultPath).onChange(async (value) => {
        this.plugin.settings.defaultPath = value.trim();
        await this.plugin.saveSettings();
      })
    );
  }
};
var KityMinderPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    await this.loadSettings();
    await this.injectKityMinderCore();
    this.registerView(VIEW_TYPE_KITYMINDER, (leaf) => new KityMinderView(leaf));
    this.registerExtensions(["km"], VIEW_TYPE_KITYMINDER);
    this.addRibbonIcon("git-branch", "\u65B0\u5EFA KityMinder \u8111\u56FE", async () => {
      await this.createNewMindMap();
    });
    this.addSettingTab(new KityMinderSettingTab(this.app, this));
    this.addCommand({
      id: "create-kityminder",
      name: "Create new mind map",
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
    const folderPath = this.settings.defaultPath || "";
    if (folderPath) {
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        try {
          await this.app.vault.createFolder(folderPath);
        } catch (e) {
          console.error("[KityMinder] Failed to create folder", e);
        }
      }
    }
    const fileName = `MindMap-${Date.now()}.km`;
    const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
    const defaultData = JSON.stringify({ root: { data: { text: "\u4E2D\u5FC3\u4E3B\u9898" } } }, null, 2);
    const file = await this.app.vault.create(fullPath, defaultData);
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.openFile(file);
  }
  async injectKityMinderCore() {
    if (window.kityminder && window.kityminder.Editor) return;
    const styleId = "kityminder-core-css";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = KITYMINDER_CORE_CSS;
      document.head.appendChild(style);
    }
    const scriptId = "kityminder-core-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.textContent = KITYMINDER_CORE_JS;
      document.head.appendChild(script);
    }
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const timer = setInterval(() => {
        if (window.kityminder) {
          clearInterval(timer);
          resolve();
        }
        attempts++;
        if (attempts > 50) {
          clearInterval(timer);
          reject(new Error("kityminder-core failed to load"));
        }
      }, 50);
    });
  }
  onunload() {
  }
};
