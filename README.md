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

## 网页写作入口

打开 `https://fio-x.github.io/admin/`（不在站点导航中），用 [Sveltia CMS](https://sveltiacms.app/) 在浏览器里写作。点「发布」会把 Markdown 提交到 `main`，由 GitHub Actions 校验、构建并部署，大约 1 分钟后上线。校验不通过时不会部署，线上保持旧版本；结果在仓库的 Actions 页面查看。

第一次使用：

1. 在 GitHub 打开 Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token。
2. Repository access 选 Only select repositories → `Fio-X/fio-x.github.io`；Permissions 里把 Contents 设为 Read and write（Metadata 只读会自动加上）；设置一个过期时间。
3. 在 `/admin/` 选「使用访问令牌登录」，粘贴令牌。「使用 GitHub 登录」需要额外部署授权服务，本站不用。

写作要点：

- 新建时填写的文件名（slug）就是网址 `/information/<slug>/`，只能用小写英文、数字和连字符，发布后不要再改。
- 新文章默认是草稿；取消「草稿」后才会在网站上显示。修改已发布的文章时填写「更新日期」。
- 图片上传到 `public/media/`，正文中以 `/media/...` 引用。

安全说明：

- 令牌保存在浏览器的 localStorage 中，只授权本仓库的 Contents 读写。不再使用的设备上要退出登录；令牌泄露时到 GitHub 撤销即可。
- CMS 脚本固定为一个版本并带完整性校验（`public/admin/index.html` 中的 `integrity`），文件内容一旦被改动，浏览器会拒绝运行。升级时修改版本号，并用 `curl -sL <脚本地址> | openssl dgst -sha384 -binary | openssl base64 -A` 重新生成哈希。
- 本地预览：`bun run dev` 后在 Chrome 打开 `http://localhost:3000/admin/`，选「使用本地仓库」直接编辑本地文件；这种方式不会推送，需要自己提交。

## 架构

项目是一个文件型内容源驱动的静态站点生成系统：CLI 和 Next.js 只在作者电脑或 CI 构建期运行，GitHub Pages 线上只托管 `out/` 静态产物。

## 内容约定

- 文章：`content/articles/<slug>.md`
- 作品：`content/works/<slug>.md`
- 信息页面：`content/pages/information.md`、`biography.md`、`contact.md`
- 模板：`content/templates/`
- 公开图片：`public/media/`

文件名只能使用小写 kebab-case。所有文章都归档于 Information，文章可声明 `template: essay`、`image-notes` 或 `conversation`；News 是由公开文章、作品、出版物和固定页面更新时间派生的汇总流。正式文章详情使用 `/information/<slug>/`，旧 `/articles/`、`/archive/`、`/about/` 只作为兼容入口。页面可在 frontmatter 的 `sections` 中以 `{id, label}` 声明二级导航锚点：`id` 为小写 kebab-case，正文必须有一个与 `label` 同名的 Markdown 二级标题（`## label`），渲染时该标题获得这个 `id`。所有公开图片必须位于 `public/media/`，在 frontmatter 与 Markdown 中以 `/media/...` 引用。作品详情使用 `media` 数组定义有序图片流，每张非装饰图都必须填写描述性的 `alt`。

只放入原创或已获得明确授权的文字、图片和其他素材。不要将私密笔记、凭据或未获得发布许可的第三方材料放入 `content/` 或 `public/media/`，因为它们会进入公开静态构建产物。
