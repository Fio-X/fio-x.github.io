# Fio Blog

这是一个 Bun 驱动的静态内容站。网站只展示内容；创建、校验、媒体管理和构建都从 CLI 完成。

## 常用命令

```bash
bun install
bun run blog -- new article first-news --title "第一则文章" --description "一句话摘要" --category journal --tags writing,notes
bun run blog -- new work first-work --title "第一个作品" --summary "一句话说明" --tags web
bun run blog -- new page information
bun run blog -- new page biography
bun run blog -- media add path/to/photo.jpg --name first-work-01.jpg
bun run blog -- validate
bun run blog -- media list --unused
bun run blog -- build
bun run dev
```

`blog build` 依次运行内容校验、测试、lint 和 Next.js 静态导出。它不执行 `git add`、`commit`、`push`，也不调用 GitHub。审阅完成后手动推送 `main`，现有 GitHub Actions 会把 `out/` 发布到 GitHub Pages。

## 文档

- [架构、ADR 与文档索引](docs/README.md)
- [发布操作手册：写作、预览、发布、验证与回滚](docs/runbooks/release.md)

项目是一个文件型内容源驱动的静态站点生成系统：CLI 和 Next.js 只在作者电脑或 CI 构建期运行，GitHub Pages 线上只托管 `out/` 静态产物。

## 内容约定

- 文章：`content/articles/<slug>.md`
- 作品：`content/works/<slug>.md`
- 信息页面：`content/pages/information.md`、`biography.md`、`contact.md`
- 模板：`content/templates/`
- 公开图片：`public/media/`

文件名只能使用小写 kebab-case。所有文章都归档于 Information，文章可声明 `template: essay`、`image-notes` 或 `conversation`；News 是由公开文章、作品、出版物和固定页面更新时间派生的汇总流。正式文章详情使用 `/information/<slug>/`，旧 `/articles/`、`/archive/`、`/about/` 只作为兼容入口。页面可在 frontmatter 的 `sections` 中声明真实二级导航锚点，且正文必须含对应的 `id`。所有公开图片必须位于 `public/media/`，在 frontmatter 与 Markdown 中以 `/media/...` 引用。作品详情使用 `media` 数组定义有序图片流，每张非装饰图都必须填写描述性的 `alt`。

只放入原创或已获得明确授权的文字、图片和其他素材。不要将私密笔记、凭据或未获得发布许可的第三方材料放入 `content/` 或 `public/media/`，因为它们会进入公开静态构建产物。
