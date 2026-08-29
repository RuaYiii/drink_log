# Drink_log 🥃 // [SHAKER MODE]

[![Deploy Drink Log to GitHub Pages](https://github.com/RuaYiii/drink_log/actions/workflows/deploy.yml/badge.svg)](https://github.com/RuaYiii/drink_log/actions/workflows/deploy.yml)

🌐 **在线体验：[Drink Log](https://ruayiii.github.io/drink_log/)**


> 一场大醉后，通过 Vibe coding 捣鼓出的产物。感谢各位酒友，欢迎把玩。

**Drink_log** 是一个完全基于我个人审美构建的开源调酒配方引擎。

做这个项目的初衷很简单：有时候夜深了想喝点什么，但吧台上的材料有限，究竟能凑出哪些酒呢？这时候，你可能就需要这样一个玩意儿。

只要把手头现有的基酒和辅料扔进去，它就会自动帮你预测并筛选出所有能做出来的酒单。

---



## 🚀 架构与部署 (Architecture & Deployment)

本项目采用纯粹的 **CSR (Client-Side Rendering)** 架构，基于 React + Vite 构建，零后端依赖。通过 Zustand 进行状态管理，并在数据层引入了 **Runtime Fetching** 机制以实现深度解耦。

### 开发环境 (Local Development)
```bash
git clone https://github.com/RuaYiii/drink_log.git
cd drink_log
npm install
npm run dev
```

### 生产环境部署 (Production Build)
项目天然兼容所有静态托管服务（如 Vercel, Netlify, GitHub Pages, Nginx 等）：
```bash
npm run build
```
构建后的 `dist` 目录仅包含 HTML/CSS/JS 与静态 JSON 文件，直接挂载即可，无需运行时的 Node.js 环境。

### GitHub Pages

本项目已通过 GitHub Actions 自动部署至：

- [https://ruayiii.github.io/drink_log/](https://ruayiii.github.io/drink_log/)

每次向 `main` 分支推送提交时，GitHub Actions 会自动安装依赖、构建项目并发布最新版本。

---

## 🤝 贡献指南 (Contribution Guide)

Drink_log 的核心是一套严格的结构化数据。我们非常欢迎开源社区的调酒师和爱好者们提交 PR，丰富我们的酒谱库（Database）。

默认的数据源路径定义在 `public/config.json` 中，指向 `public/data/ingredients.json` 和 `cocktails.json`。
如果您想使用自己专属的酒单，**完全不需要修改源码或重新打包**。您只需：
1. 直接修改 `config.json` 中的路径，使其指向您自己的静态文件或远端跨域 API。
2. 刷新页面，引擎即会瞬间完成数据的无感热替换。
*(注：您也可以在页面上直接使用 IMPORT/EXPORT 功能临时导入自定义的 `.json` 库进行游玩预览。)*

### 1. 如何添加新的材料 (Ingredients)
在 `public/data/ingredients.json` 中，有 `bases` (基酒) 和 `modifiers` (辅料)。请保持颜色的鲜明度，因为这会直接影响底层 Shader 的液态混色。

```json
{ 
  "id": "mezcal",
  "name": "梅斯卡尔 (Mezcal)", 
  "type": "base", 
  "color": "#88cc00"
}
```
*(注：`id` 为全局唯一标识，`color` 必须为十六进制颜色码)*

### 2. 如何添加标准化酒谱 (Cocktails)
在 `public/data/cocktails.json` 数组中添加新的对象。请严格遵循以下纯 JSON 结构（不支持注释）：

```json
{
  "id": "margarita_mezcal", 
  "name": "梅斯卡尔玛格丽特 (Mezcal Margarita)",
  "requires": ["mezcal", "sour", "sweet"], 
  "specs": [
    { "text": "45ml 梅斯卡尔 (Mezcal)", "ratio": "2" },
    { "text": "22.5ml 君度橙酒 (Cointreau)", "ratio": "1" },
    { "text": "22.5ml 新鲜青柠汁 (Lime Juice)", "ratio": "1" },
    { "text": "[制法] 杯口抹海盐边。加冰摇匀后滤入。" }
  ],
  "desc": "玛格丽特的烟熏变体，具有更强烈的风土气息。",
  "tags": ["创新", "变体", "烟熏"]
}
```
*(注：`requires` 中的材料必须精确对应。只要 Shaker 中包含这里要求的所有材料，该酒单就会被引擎预测出来；`ratio` 属性会在 UI 中高亮渲染为收银条风格的标签。)*

### 3. 如何添加名瓶推荐 (Tasting Notes)
除了混合鸡尾酒，引擎还内置了 **单品纯饮 (Tasting Mode)** 模式。当用户在调酒台上只选择了一种基酒时，系统会展示该基酒的代表性名瓶。
如果您想向数据库推荐某款具体的威士忌、金酒或朗姆酒，只需在 `cocktails.json` 中添加一个 `requires` 数组长度仅为 1 的对象即可：

```json
{
  "id": "talisker_10",
  "name": "泰斯卡 10年 (Talisker 10)",
  "requires": ["whisky"],
  "specs": [
    { "text": "分类: 单一麦芽苏格兰威士忌 (Island Single Malt)" },
    { "text": "风味: 强烈的海盐、黑胡椒与篝火般的泥煤烟熏。" },
    { "text": "[建议] 纯饮，或搭配生蚝饮用。" }
  ],
  "desc": "来自斯凯岛的风暴，泥煤爱好者的进阶必修课。",
  "tags": ["泥煤", "海风", "纯饮"]
}
```
*(注：只要 `requires` 里只有 1 个基酒，引擎就会自动把它识别为单品推荐，在 Tasting Mode 下专属展现。)*

### 💡 关于经典 (Classics) 与创新版本 (Twists) 的处理方案
调酒界存在大量基于经典配方微调的“变种 (Twist)”。在 Drink_log 中，我们通过以下规则标准化管理它们：

1. **命名规范**：变种版本必须在名称中体现关联，或直接使用业界公认的变种名称（如 `德克萨斯冰茶 (Texas Tea)` 是 `长岛冰茶` 的变种）。
2. **标签区分 (Tags)**：经典配方必须带有 `'经典'` 标签；创新或变体必须带有 `'创新'`、`'变体'` 或 `'Twist'` 标签。
3. **引擎的智能呈现**：得益于我们严格的流体预测算法，当用户投入 `[龙舌兰]` + `[酸]` + `[甜]` 时，系统会自动将 **玛格丽特 (经典)** 和 **梅斯卡尔玛格丽特 (变体 - 如果放入了梅斯卡尔)** 等所有匹配的可能并列展示在下方，形成天然的“关联推荐”生态。

---

## 📄 License
MIT License
