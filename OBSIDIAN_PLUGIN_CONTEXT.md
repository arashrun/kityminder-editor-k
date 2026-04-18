# Obsidian Plugin Context

## Scope
- 只关注 Obsidian 插件相关实现。
- 优先查看这些文件：
  - `obsidian/main.ts`
  - `obsidian/view.ts`
  - `obsidian/note-modal.ts`
  - `obsidian/assets.ts`
  - `src/runtime/minder.js`
  - `src/runtime/obsidian-resource-hint.js`
  - `scripts/build-obsidian.js`
  - `esbuild.config.mjs`

## Build And Test
- 构建命令：`npm run obsidian:build`
- 产物文件：仓库根目录 `main.js`
- 测试方式：将根目录 `main.js` 复制到 Obsidian 插件目录后重载插件

## Current Customizations
- 节点支持左侧内嵌资源计数徽标。
- 资源计数徽标显示在节点内部、文本左侧。
- 资源计数徽标点击后复用 note modal。
- 徽标当前颜色：
  - background: `#7c6cff`
  - border: `#7c6cff`
- note modal 支持 `[[文件名#标题]]` 形式的资源添加。
- 输入中文 `【【` 时会自动归一化为 `[[`。
- 进入 `#` 标题补全后，继续输入会按标题内容过滤。
- “关联资源”和“简单备注”已经改成统一的小节标题样式。

## Implementation Notes
- 资源徽标不要再走 `Module.register`。
- 当前稳定方案是在 `src/runtime/minder.js` 里直接把 `ResourceCountRenderer` 注入 `minder._rendererClasses.left`。
- `src/runtime/obsidian-resource-hint.js` 目前导出的是 `ResourceCountRenderer`，不再作为独立 runtime 组装。
- `src/editor.js` 不再单独 `assemble('./runtime/obsidian-resource-hint')`。

## Known Pitfalls
- 如果资源徽标不显示，优先检查：
  - `src/runtime/minder.js`
  - `src/runtime/obsidian-resource-hint.js`
- 如果 Obsidian 中改了代码但没有生效，通常是因为还没有把最新根目录 `main.js` 复制到插件目录。
- `main.js` 体积较大是因为当前方案把编辑器 JS/CSS 内联进了插件产物。

## User Preferences
- 用户偏好中文沟通。
- 用户希望只处理 Obsidian 插件部分。
- 用户偏好简洁直接，通常希望直接改代码。
- 视觉上用户更喜欢显眼一些的配色，不喜欢过于弱化的状态标记。
- 资源徽标视觉语言希望接近之前右侧外挂版，但布局必须保留在节点内部左侧。
