# 发布操作手册

## 1. 适用范围

本手册适用于生产站点：

```text
站点：Fio Blog
地址：https://fio-x.github.io
本地目录：/Users/fio/code/myblog01/portfolio-blog
Git remote：https://github.com/Fio-X/fio-x.github.io.git
生产分支：main
托管：GitHub Pages
```

`portfolio-blog/` 是独立 Git 仓库。请在这个目录中运行命令；不要在父目录 `/Users/fio/code` 里执行项目的 Bun 命令。

发布模型是：

```text
编辑 Markdown/媒体
  → 本地预览与质量门
  → git add / commit / push main
  → GitHub Actions 构建
  → GitHub Pages 更新静态站点
```

CLI 不会自动执行 `git add`、`commit`、`push` 或 GitHub 操作。

## 2. 前置条件

- 已安装 Bun。
- 当前目录是 `portfolio-blog/`。
- 已安装依赖，或准备执行 `bun install`。
- 公开文字、图片和引用具有发布许可。
- GitHub Pages 的发布源使用 GitHub Actions。
- 变更前先确认工作区状态，避免把无关文件一起发布。

进入项目并查看状态：

```bash
cd /Users/fio/code/myblog01/portfolio-blog
git status --short
git branch --show-current
git remote -v
```

首次安装或 lockfile 发生变化时：

```bash
bun install --frozen-lockfile
```

## 3. 创建内容

### 创建新闻

```bash
bun run blog -- new article first-news \
  --title "第一篇文章" \
  --description "一句话摘要" \
  --category journal \
  --tags writing,notes
```

### 创建 Information 文章

```bash
bun run blog -- new article first-essay \
  --template essay \
  --title "第一篇文章" \
  --description "文章摘要" \
  --category essay \
  --tags writing,notes
```

### 创建作品

```bash
bun run blog -- new work first-work \
  --title "第一个作品" \
  --summary "作品的一句话说明" \
  --tags web
```

### 创建固定页面

```bash
bun run blog -- new page information
bun run blog -- new page biography
bun run blog -- new page contact
```

CLI 只创建模板，不替你完成公开内容。创建后需要编辑生成的 Markdown 文件，并确认 `draft` 值。

## 4. 编辑 Markdown

文章文件：

```text
content/articles/<slug>.md
```

基本格式：

```yaml
---
title: "第一篇文章"
date: "2026-07-29"
description: "文章摘要"
category: "essay"
template: "essay"
tags:
  - "notes"
  - "writing"
draft: false
---

正文从这里开始。

## 第一节

继续写内容。
```

常用字段：

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `date` | 必填，格式为 `YYYY-MM-DD` |
| `updated` | 修改日期，可选 |
| `description` | 目录摘要、页面描述和 RSS 摘要 |
| `category` | 文章分类 |
| `template` | `essay`、`image-notes` 或 `conversation`；文章统一归档于 Information |
| `tags` | 标签数组，不能重复 |
| `draft` | `true` 不进入公开页面；`false` 才发布 |
| `cover` | 已存在的本地图片，例如 `/media/cover.jpg` |
| `news` | 可选对象：`category`、`dateLabel`、`place`、`placeUrl`；用于 News 汇总展示 |

文件名必须是小写 kebab-case，例如 `learning-notes.md`。文件名会决定 URL slug，不要在公开后随意修改，否则旧链接会变化。

作品文件位于 `content/works/<slug>.md`，固定页面位于 `content/pages/<slug>.md`。完整字段约束以 [内容流水线图](../architecture/content-pipeline.md) 和 [根 README](../../README.md#内容约定) 为准。

## 5. 添加图片

先将图片放到仓库内部的临时目录，例如：

```text
inbox/forest-light.jpg
```

然后使用 CLI 复制到公开媒体目录：

```bash
bun run blog -- media add inbox/forest-light.jpg --name forest-light.jpg
```

结果：

```text
public/media/forest-light.jpg
```

在 frontmatter 中引用：

```yaml
cover: "/media/forest-light.jpg"
```

在 Markdown 正文中引用：

```markdown
![森林中的光](/media/forest-light.jpg)
```

作品图片使用 `media` 数组，并且每张非装饰图片必须有描述性 `alt`：

```yaml
media:
  - src: "/media/work-one.jpg"
    alt: "黄昏中的建筑外墙"
  - src: "/media/work-two.jpg"
    alt: "桌面上的手稿"
```

检查未使用媒体：

```bash
bun run blog -- media list --unused
```

不要把私密笔记、凭据或未获授权的第三方素材放进 `content/` 或 `public/media/`。

## 6. 本地预览

启动开发服务器：

```bash
bun run dev
```

访问：

```text
http://localhost:3000/
http://localhost:3000/news/
http://localhost:3000/information/
http://localhost:3000/information/<slug>/
http://localhost:3000/works
http://localhost:3000/works/<slug>
http://localhost:3000/categories/<category>
http://localhost:3000/tags/<tag>
```

检查重点：

- 首页入口是否正确。
- 文章标题、摘要、日期和正文是否正确。
- 作品媒体顺序、图片加载和 `alt` 是否正确。
- 分类、标签、RSS 和 Sitemap 是否出现新内容。
- 手机宽度下 Menu、链接和长标题是否溢出。
- 草稿是否不会出现在公开列表。

## 7. 发布前质量门

推荐直接运行完整本地预检：

```bash
bun run blog -- build
```

它依次执行：

```text
内容校验 → bun test → eslint → next build
```

也可以分步执行：

```bash
bun run blog -- validate
bun run test
bun run lint
bunx tsc -p tsconfig.json --noEmit
bun run build
```

构建成功后，`out/` 是临时静态产物。标准流程不需要把 `out/` 加入 Git。

发布前审阅变更：

```bash
git status --short
git diff -- content public app components lib scripts README.md docs
```

确认：

- 只包含预期内容和代码。
- 新文章的 `draft` 已明确设置。
- 图片已经被引用，且授权信息已核对。
- 没有凭据、私人笔记或无意加入的临时文件。

## 8. 正常发布

在质量门通过并完成人工审阅后：

```bash
git add content/ public/media/
git commit -m "Publish first essay"
git push origin main
```

如果这次同时修改了代码或文档，应按实际范围加入对应目录：

```bash
git add app/ components/ lib/ scripts/ docs/ README.md
```

不要执行：

```bash
git add out/
```

推送后，`.github/workflows/deploy.yml` 会触发：

```text
checkout
→ Setup Bun 1.3.13
→ configure Pages
→ bun install --frozen-lockfile
→ content validate
→ test
→ lint
→ next build
→ upload ./out
→ deploy GitHub Pages
```

## 9. 发布验证

在 GitHub 仓库的 Actions 页面确认：

- `build` job 成功。
- `deploy` job 等待 build 后成功。
- `github-pages` environment 显示部署 URL。

然后检查线上：

```text
https://fio-x.github.io/
https://fio-x.github.io/news/
https://fio-x.github.io/information/
https://fio-x.github.io/works
https://fio-x.github.io/rss.xml
https://fio-x.github.io/sitemap.xml
https://fio-x.github.io/robots.txt
```

至少验证：

- 新内容能从首页或栏目进入。
- 详情页标题、正文、日期、图片正确。
- 图片请求不是 404。
- RSS 包含新文章。
- Sitemap 只包含希望公开的 URL。
- `draft: true` 内容没有出现在页面、RSS 或 Sitemap。

## 10. 手动重跑与失败处理

### 手动触发当前 main

workflow 支持 `workflow_dispatch`。在 GitHub Actions 页面选择该 workflow，使用当前 `main` 手动运行。

### 内容校验失败

常见原因：

- slug 不是小写 kebab-case。
- 日期不是 `YYYY-MM-DD`。
- frontmatter 有未知字段。
- 标签重复或为空。
- 图片路径不在 `/media/` 下。
- 图片文件不存在。
- 非装饰媒体缺少 `alt`。

修复对应 Markdown 或媒体文件后，重新运行：

```bash
bun run blog -- validate
bun run blog -- build
```

### 测试、lint 或构建失败

查看 Actions 日志中第一个失败步骤。不要绕过质量门，也不要直接手工上传旧的 `out/`。修复源码后重新运行本地预检并推送新的提交。

### artifact 或 deploy 失败

先确认：

- Pages 设置仍使用 GitHub Actions。
- workflow 权限未被收紧：`pages: write`、`id-token: write`。
- `build` job 已成功并生成 `out/`。
- GitHub Pages environment 状态正常。

确认后可在 Actions 页面重新运行失败 job 或完整 workflow。

## 11. 回滚

错误发布通过 Git 回滚，不手工改线上文件：

```bash
git log --oneline -10
git revert <错误提交的 SHA>
git push origin main
```

新的 revert 提交会触发完整质量门和重新部署。回滚后再次检查首页、受影响详情页、RSS 和 Sitemap。

如果错误提交尚未推送，直接修正工作区并重新运行质量门即可。不要使用 `git reset --hard` 覆盖尚未确认的本地工作。

## 12. 何时更新架构文档

以下变化发生时，需要同步检查 [文档索引](../README.md)、架构图、ADR 和本手册：

- 内容源从 Markdown 改为 CMS 或数据库。
- CLI 命令或内容字段改变。
- `lib/content.ts` 的公开校验规则改变。
- Next.js 不再使用静态导出。
- `out/` 改为其他发布目录。
- GitHub Pages 改为其他托管平台。
- CI 质量门、Bun 版本或 deploy 权限改变。

相关文档：[构建与部署图](../architecture/build-deployment.md)、[内容流水线图](../architecture/content-pipeline.md)、[ADR-0001](../adr/0001-cli-first-file-content.md)、[ADR-0002](../adr/0002-static-export-github-pages.md)、[ADR-0003](../adr/0003-build-validation-gates.md)。
