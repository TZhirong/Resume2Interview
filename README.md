# 面题工坊 Resume2Interview

> 上传简历，一键生成贴合你经历的面试题 —— 纯前端、零后端、隐私安全的 AI 面试题生成工具。
>
> 🔗 在线体验：https://tzhirong.github.io/Resume2Interview/

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-42b883" alt="Vue 3.4" />
  <img src="https://img.shields.io/badge/Vite-5.2-646cff" alt="Vite 5" />
  <img src="https://img.shields.io/badge/纯前端-零后端-2563eb" alt="纯前端" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT" />
</p>

---

## 这是什么？

面试前最尴尬的两件事：**背了一堆通用八股，却答不出自己简历里的项目**；**被追问项目细节时才发现没准备好**。

面题工坊（Resume2Interview）是一个纯前端开源工具：你把简历（PDF / Word）拖进来，再填上目标岗位和难度，它就会调用 DeepSeek 大模型，**基于你的简历内容**生成一套结构化的面试题 —— 从基础概念、简历深挖、项目细节，到业务场景，甚至还有你可以反问面试官的题目。

每一道题都附带了**考察点**和**参考答案**，告诉你面试官在验证什么、该怎么答。

## 核心亮点

- 🔒 **隐私安全**：简历文件在浏览器本地解析，原始文件**不上传任何服务器**；解析时**自动脱敏**姓名、手机号、邮箱等敏感信息；API Key 保存在浏览器 localStorage，只直接发给 DeepSeek。
- 🎯 **反模板化**：题目**贴合简历**生成，简历深挖题、项目细节题全部来自你真实写过的经历，拒绝通用题库。
- 🧱 **结构化输出**：5 大类题目卡片，每题含「题目 / 考察点 / 来源溯源 / 参考答案」，可复制、可导出 Markdown。
- 🛟 **健壮降级**：JSON 解析失败时自动切换 Markdown 模式兜底，API 异常给出中文提示。
- 🚀 **零部署成本**：纯静态站点，本地、Bolt、Gitee Pages、Vercel 皆可一键部署。

## 适用场景

| 场景 | 说明 |
| --- | --- |
| 求职者备战面试 | 围绕自己简历做针对性模拟面试 |
| 面试官出题参考 | 快速基于候选人简历生成提问清单 |
| AI 产品作品集 | 展示「AI 应用产品设计 + Prompt 工程 + 前后端协作」能力 |

## 页面模块

单页应用，共 5 大模块：

1. **简历上传 & 解析区** —— 拖拽上传 PDF / docx，本地提取文本并自动脱敏，支持手动编辑，可选「AI 清洗简历」。
2. **面试参数配置表单** —— 目标岗位、工作年限、难度、题量，以及可折叠的模型参数（temperature 调参）。
3. **API Key 设置面板** —— 填写 DeepSeek Key 与接口地址，保存在本地。
4. **面试题结果展示区** —— 5 分类题目卡片（含来源溯源），复制 / 导出 / 保存历史。
5. **历史记录侧边面板** —— localStorage 保存，可查看、删除、清空。

## 技术栈

| 类别 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） | 响应式 UI |
| 构建 | Vite | 极速开发与打包 |
| 样式 | TailwindCSS + shadcn/ui 风格组件 | 产品工具风，蓝色主色 |
| PDF 解析 | pdfjs-dist | 前端本地提取文本 |
| Word 解析 | mammoth | 前端本地提取 docx 文本 |
| Markdown 渲染 | marked | 降级模式与导出预览 |
| 存储 | localStorage | API 配置 + 历史记录 |
| 大模型 | DeepSeek（OpenAI 兼容接口） | 由用户自带 API Key |

## 快速开始（本地运行）

### 环境要求

- Node.js ≥ 18
- 一个 [DeepSeek API Key](https://platform.deepseek.com/)（可选，运行时再填也行）

### 步骤

```bash
# 1. 克隆仓库
git clone https://github.com/TZhirong/Resume2Interview.git
cd Resume2Interview

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5173`），即可使用。

### 生产构建

```bash
npm run build     # 产物输出到 dist/
npm run preview   # 本地预览构建产物
```

## 使用指南

1. **上传简历**：拖入 PDF 或 `.docx`，等待本地解析出文本；解析不准可直接在文本框里手动修改。
2. **（可选）清洗简历**：点击「清洗简历文本」，AI 会去除页眉页脚、乱码与多余空行。
3. **配置参数**：填写目标岗位、年限、难度、题量；高级玩家可展开「模型参数设置」调整 temperature。
4. **填写 API Key**：展开「API Key 设置」，粘贴你的 DeepSeek Key 并保存。
5. **生成**：点击「✨ 生成面试题」，稍等片刻即可得到结构化题目。
6. **使用结果**：复制单题 / 复制全部 / 导出 Markdown / 保存到历史。

## Prompt 设计说明（产品视角）

本项目采用 **「JSON 优先、Markdown 降级」双模板策略**，这是整个产品可靠性设计的核心：

- **主 Prompt（JSON 模式）**：要求模型输出严格 JSON，并开启 DeepSeek 的 `response_format: json_object`，前端据此解析成结构化题目卡片，体验最好。
- **降级 Prompt（Markdown 模式）**：当模型输出格式异常、JSON 解析失败时，自动切换到 Markdown 模板重新请求，用 `marked` 渲染兜底，**保证功能永远可用**。

几个刻意设计的 Prompt 约束：

- **「禁止生成通用题库」** + **「严禁编造简历不存在的经历」**：把模型从「题库复读机」约束成「简历阅读器」。
- **「简历信息不足时备注」**：当简历内容单薄时，让模型显式标注「简历信息有限，本题为岗位通用题」，诚实且可控。
- **「来源溯源」字段**：每道题要求输出 `source`，标注它来自简历的哪个项目 / 哪段经历，让题目可回溯、可验证，也倒逼模型真正去读简历。
- **「参考答案精炼简短，适合口述」**：控制答案长度，避免大模型长篇大论，更贴近真实面试口语表达。

> 这套「主/降级双模板 + 输出约束 + 异常兜底」的思路，是 AI 应用工程化的典型范式，也是本项目想展示的核心产品能力。

## 隐私与安全

- ✅ 简历文件通过 `pdfjs-dist` / `mammoth` 在**浏览器本地**解析，原始文件**不离开你的设备**。
- ✅ 解析时会**自动脱敏**姓名、手机号、邮箱、身份证号、微信号等敏感信息（可在上传区关闭）。
- ✅ API Key 保存在浏览器 `localStorage`，请求**只直接发送到 DeepSeek 官方接口**，不经过任何中间服务器。
- ✅ 无后端、无数据库、无埋点，历史记录也只存在你的浏览器里。
- ⚠️ 请使用自己的 API Key，并妥善保管；清除浏览器数据会同时清除已保存的 Key 与历史记录。

## 项目结构

```
Resume2Interview/
├── index.html                    # 页面入口
├── vite.config.js                # Vite 配置（base: './' 适配子路径部署）
├── tailwind.config.js            # Tailwind 主题（蓝色主色）
├── postcss.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.js                   # 应用入口
    ├── App.vue                   # 主组件，编排 5 大模块
    ├── style.css                 # 全局样式 + Markdown 样式
    ├── constants/
    │   └── prompts.js            # 内置 Prompt 模板（JSON / Markdown / 清洗）
    ├── services/
    │   ├── deepseek.js           # DeepSeek API 请求封装
    │   ├── generator.js          # 生成编排 + JSON→Markdown 降级
    │   ├── fileParser.js         # PDF / docx 本地解析
    │   └── storage.js            # localStorage 封装
    ├── lib/
    │   └── utils.js              # 通用工具（复制/下载/token 估算等）
    └── components/
        ├── ui/                   # shadcn 风格基础组件
        │   ├── Button.vue / Card.vue / Input.vue / Textarea.vue
        │   ├── Select.vue / Label.vue / Collapsible.vue / Badge.vue
        ├── ResumeUploader.vue    # 模块一：简历上传解析
        ├── ConfigForm.vue        # 模块二：参数配置
        ├── ApiKeyPanel.vue       # 模块三：API Key 设置
        ├── QuestionResult.vue    # 模块四：结果展示
        ├── QuestionCard.vue      # 单题卡片
        └── HistoryPanel.vue      # 模块五：历史记录
```

## 部署教程

### 方式一：Bolt（推荐，最简单）

1. 打开 [bolt.new](https://bolt.new)，选择 **Import**（导入）。
2. 将本项目代码（或 GitHub 仓库地址）导入。
3. Bolt 会自动识别 `package.json` 并安装依赖、启动预览。
4. 确认无误后点击 **Deploy** 发布，即可获得一个在线地址。

> 本项目为纯前端静态站，Bolt 可直接构建部署，无需配置任何后端或环境变量。

### 方式二：Gitee Pages（国内访问快）

1. 将代码推送到 Gitee 仓库。
2. 本地或 CI 执行构建：

   ```bash
   npm install && npm run build
   ```

3. 在 Gitee 仓库页面进入 **服务 → Gitee Pages**。
4. 部署目录选择 `dist`，点击启动。
5. 部署完成后，通过 `https://你的用户名.gitee.io/仓库名/` 访问。

> 已配置 `base: './'` 相对路径，因此部署在 `gitee.io/仓库名/` 这类子路径下也能正常加载资源。

### 方式三：GitHub Pages

1. 推送代码到 GitHub。
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**（或手动部署 `dist` 目录）。
3. 使用如下 Workflow（新建 `.github/workflows/deploy.yml`）：

   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist
     deploy:
       needs: build
       permissions:
         pages: write
         id-token: write
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

### 方式四：Vercel / Netlify

- **Vercel**：导入仓库 → Framework 选 Vite → 构建命令 `npm run build`，输出目录 `dist` → Deploy。
- **Netlify**：构建命令 `npm run build`，发布目录 `dist`。

## 常见问题（FAQ）

**Q：为什么生成失败提示 401？**
A：API Key 无效或未授权，请检查是否复制完整、是否已充值/开通。

**Q：为什么提示 429？**
A：请求过于频繁或账户余额不足，稍后重试或前往 DeepSeek 充值。

**Q：简历解析出来是乱码怎么办？**
A：PDF 若是扫描件（图片型），文本无法提取，请直接手动粘贴简历文本；docx 解析偶有格式错乱，可在文本框内手动修正，或用「清洗简历」功能。

**Q：我的数据安全吗？**
A：安全。简历与密钥都只存在于你的浏览器，AI 请求直连 DeepSeek，本工具不设任何服务器。

## Roadmap

- [ ] 支持更多文件格式（txt、图片型 PDF OCR）
- [ ] 流式输出（SSE）提升生成体验
- [ ] 题目收藏与导出 PDF
- [ ] 多模型支持（可切换其它 OpenAI 兼容模型）
- [ ] 面试模拟对话模式

## License

[MIT](./LICENSE) © 面题工坊 Resume2Interview

> 本项目为 AI 产品经理作品集演示项目，仅供学习交流，非商用工具。
