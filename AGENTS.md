# KityMinder Editor K

> 本文档面向 AI Coding Agent，用于快速了解本项目的架构、构建方式与开发约定。

## 项目简介

KityMinder Editor K 是百度 FEX 团队开源的脑图编辑器 `kityminder-editor` 的一个维护分支（fork）。它是一个基于 Web 的思维导图（mind map）编辑器，底层依赖 `kity`（矢量图形库）和 `kityminder-core`（脑图核心），上层使用 AngularJS + Angular 18 混合架构搭建 UI。

项目主要语言为 **中文**（注释、文档、UI 文案均以中文为主）。

## 技术栈

- **核心语言**：JavaScript（ES5 风格为主），部分模块使用 TypeScript
- **前端框架**：
  - AngularJS 1.3.15（主要 UI 层）
  - Angular 18（通过 `@angular/upgrade` 以混合模式接入，用于编写新组件）
- **构建工具**：
  - **Webpack 5**（主构建，打包 JS / CSS / 资源）
  - **Grunt**（预处理 AngularJS 的 HTML 模板与 ng-annotate）
- **样式**：LESS、Bootstrap 3、CodeMirror
- **底层图形库**：`kity`、`kityminder-core`
- **其他重要依赖**：
  - `jquery`（全局通过 ProvidePlugin 注入 `$`、`jQuery`）
  - `marked`（Markdown 渲染）
  - `codemirror`（代码/备注编辑器）
  - `hotbox`（热盒/快捷操作盘）
  - `color-picker`（颜色选择器）
  - `@zip.js/zip.js`（ZIP 处理，用于导入 XMind 等格式）

## 项目结构

```
.
├── src/                    # 编辑器核心逻辑（Runtime 架构）
│   ├── editor.js           # KMEditor 主类，按顺序组装各 Runtime
│   ├── expose-editor.js    # 打包暴露入口，将 Editor 挂载到 kityminder.Editor
│   ├── minder.js           # 导出 window.kityminder.Minder
│   ├── runtime/            # 各运行时模块（容器、状态机、输入、剪贴板等）
│   ├── tool/               # 工具函数（debug、keymap、jsondiff 等）
│   └── protocol/           # 第三方格式导入导出（FreeMind、XMind、MindManager）
├── ui/                     # UI 层（AngularJS + Angular 18）
│   ├── kityminder.app.js   # AngularJS 主模块定义
│   ├── app.module.ts       # Angular 18 根模块（UpgradeModule）
│   ├── main.ts             # Angular 18 启动入口
│   ├── directive/          # AngularJS 指令（每个指令含 .js + .html）
│   ├── dialog/             # 弹窗组件（超链接、图片、导入导出节点等）
│   ├── service/            # AngularJS 服务（minder.service、config、lang 等）
│   └── filter/             # AngularJS 过滤器
├── less/                   # LESS 样式文件
│   ├── index.less          # 样式总入口（引入 bootstrap、codemirror、hotbox 等）
│   ├── editor.less         # 编辑器主样式
│   └── topTab/             # 顶部工具栏各面板样式
├── lib/                    # 本地静态库（hotbox、color-picker）
├── dist/                   # 构建产物（Webpack 输出）
├── public/                 # 开发环境页面（index.html）
├── editor.js               # Webpack 编辑器入口（完整功能）
├── viewer.js               # Webpack 仅查看入口（不含 UI 编辑层）
├── webpack.config.js       # Webpack 配置
├── Gruntfile.js            # Grunt 配置（处理 ng-templates、ng-annotate、concat）
└── tsconfig.json           # TypeScript 配置（target: es5, module: commonjs）
```

## 构建与运行

### 安装依赖

```bash
npm install
```

### 开发模式

启动 Webpack Dev Server（端口 9000，自动打开浏览器，热更新）：

```bash
npm run watch
```

> 注意：Webpack 在 `onBeforeSetupMiddleware` 和 `onBuildStart` 阶段会自动执行 `npx grunt build`，用于预处理 AngularJS 的模板和注解。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录：

- `kityminder-editor.js` / `kityminder-editor.min.js` — 完整编辑器
- `kityminder-viewer.js` — 仅查看器（不含编辑 UI）
- `kityminder.editor.min.css` — 打包后的样式
- `kityminder-core.css` — 从 `kityminder-core` 复制过来的样式
- `images/`、`fonts/` — 静态资源

### Grunt 子构建

```bash
npx grunt build
```

该任务执行以下步骤：
1. `ngtemplates`：将 `ui/directive/**/*.html` 和 `ui/dialog/**/*.html` 编译为 AngularJS 模板缓存（`ui/templates.js`）
2. `ngAnnotate`：对 `ui/` 下所有 `.js` 文件进行依赖注入安全处理
3. `concat`：将处理后的 AngularJS 文件合并为 `ui/bundle.js`
4. `clean`：清理临时文件 `.tmp/`、`ui/templates.js`

## 运行时（Runtime）架构

`src/editor.js` 是核心编辑器类 `KMEditor`，它采用**运行时组装**模式：

```javascript
KMEditor.assemble(require('./runtime/container'));   // 初始化容器
KMEditor.assemble(require('./runtime/fsm'));         // 状态机
KMEditor.assemble(require('./runtime/minder'));      // 脑图实例
KMEditor.assemble(require('./runtime/receiver'));    // 输入接收器
KMEditor.assemble(require('./runtime/hotbox'));      // 热盒
KMEditor.assemble(require('./runtime/input'));       // 文本输入
KMEditor.assemble(require('./runtime/clipboard'));   // 剪贴板
KMEditor.assemble(require('./runtime/history'));     // 撤销/重做
// ... 等
```

每个 Runtime 都是一个函数，在 `KMEditor` 实例化时按顺序执行，互相之间通过 `this`（即 editor 实例）共享状态，例如 `this.minder`、`this.fsm`、`this.hotbox`。

## UI 架构：AngularJS + Angular 18 混合模式

- **AngularJS**（`ui/kityminder.app.js`）定义了 `'kityminderEditor'` 模块，包含绝大多数指令、服务和弹窗。
- **Angular 18**（`ui/app.module.ts`）定义了 `AppModule`，通过 `UpgradeModule` 在 `ngDoBootstrap` 时手动引导 AngularJS 应用：
  ```typescript
  this.upgrade.bootstrap(document.body, ['kityminderEditor']);
  ```
- **入口** `ui/main.ts` 调用 `platformBrowserDynamic().bootstrapModule(AppModule)` 启动 Angular 18。
- 若要在项目中添加 Angular 18 新组件，需先写标准 Angular 组件，再通过 `downgradeComponent` 降级为 AngularJS 指令，并在 `app.module.ts` 和 `kityminder.app.js` 中注册对应模块依赖。README.md 中有详细示例。

## 模块规范

- 核心代码大量采用 **AMD 风格**的 `define` 包裹：
  ```javascript
  define(function(require, exports, module) {
      // ...
      return module.exports = ...;
  });
  ```
- Webpack 通过 `ts-loader` 处理 `.ts/.tsx`，通过 `less-loader` / `css-loader` / `MiniCssExtractPlugin` 处理样式。
- Webpack 通过 `ProvidePlugin` 全局注入 `$`、`jQuery`、`window.CodeMirror`。
- `splitChunks` 将 `kity` 和 `kityminder-core` 单独拆分为 `kityminder-core.js` chunk。

## 代码风格

项目保留了原百度 FEX 的 `.jscsrc` 和 `.jshintrc` 规范（文件本身较旧，但反映了原始风格）：

- **缩进**：4 个空格
- **引号**：单引号
- **行宽**：不超过 120 个字符
- **大括号**：块语句前必须有空格
- **二元运算符**（`+`、`-`、`=`、`==` 等）前后必须有空格
- **一元运算符**（`!`、`++` 等）与操作数之间不能有空格
- **函数定义**：参数列表的圆括号前不能有空格
- **括号内部**不能有空格
- **行尾**不能有空格

## 配置项

编辑器配置通过 AngularJS 的 `config` Provider 管理，位于 `ui/service/config.service.js`。主要可配置项：

| 键 | 说明 | 默认值 |
|---|---|---|
| `ctrlPanelMin` | 右侧面板最小宽度 | 250 |
| `ctrlPanelWidth` | 右侧面板宽度 | 250（优先读 localStorage） |
| `dividerWidth` | 分割线宽度 | 3 |
| `defaultLang` | 默认语言 | `zh-cn` |
| `zoom` | 缩放比例数组 | `[10, 20, 30, 50, 80, 100, 120, 150, 200]` |
| `imageUpload` | 图片上传接口地址 | `server/imageUpload.php` |

使用方式（在宿主 AngularJS 模块中）：

```javascript
angular.module('yourApp', ['kityminderEditor'])
    .config(function (configProvider) {
        configProvider.set('imageUpload', 'path/to/upload/handler');
    });
```

## 数据导入导出

基于 `kityminder-core` 提供的接口：

- `editor.minder.exportJson()` — 导出 JSON
- `editor.minder.importJson(json)` — 导入 JSON
- `editor.minder.exportData(protocol, option)` — 按协议导出（返回 Promise）
- `editor.minder.importData(protocol, data, option)` — 按协议导入（返回 Promise）

内置支持格式：`json`、`text`、`markdown`、`svg`（仅导出）、`png`（仅导出）。

此外，`src/protocol/` 下注册了第三方格式的导入支持：
- **FreeMind**（`.mm`）
- **XMind**（`.xmind`，依赖 `@zip.js/zip.js`）
- **MindManager**（`.mmap`，依赖 `@zip.js/zip.js`）

## 测试

**当前项目没有集成测试框架，也没有测试文件。** 若需要添加测试，建议根据现有技术栈选择兼容 AngularJS + Angular 的测试方案（如 Karma + Jasmine）。

## 安全与注意事项

- `ui/kityminder.app.js` 中的 `$sceDelegateProvider.resourceUrlWhitelist` 仍保留了原百度内部测试域名的白名单配置（`agroup.baidu.com`、`cq01-fe-rdtest01.vm.baidu.com` 等），若部署到外部环境请根据实际需求清理或修改。
- `package.json` 中 `kityminder-core` 依赖指向了一个 Git 仓库分支（`git+https://github.com/Sherman-Chen/kityminder-core-k.git#master`），构建时请确保网络可访问该仓库或已做好镜像/缓存。
- 项目使用 `os-browserify` 作为 Node `os` 模块的 browser fallback，某些深层依赖可能需要它。

## 常用文件速查

| 文件 | 作用 |
|---|---|
| `editor.js` | Webpack 编辑器入口，加载所有依赖并暴露 `angular`、`kity`、`kityminder` |
| `viewer.js` | Webpack 仅查看器入口，只加载 `kity` 和 `kityminder-core` |
| `src/editor.js` | `KMEditor` 类定义，组装各 Runtime |
| `src/expose-editor.js` | AMD 模块，将 `KMEditor` 挂载到 `kityminder.Editor` |
| `ui/kityminder.app.js` | AngularJS 主模块 `'kityminderEditor'` |
| `ui/app.module.ts` | Angular 18 根模块，负责 UpgradeModule 引导 |
| `ui/main.ts` | Angular 18 启动文件 |
| `webpack.config.js` | Webpack 主配置 |
| `Gruntfile.js` | Grunt 子构建配置 |
| `less/index.less` | 样式总入口 |
| `public/index.html` | 开发环境示例页面 |
