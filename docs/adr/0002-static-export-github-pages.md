# ADR-0002：Next.js 静态导出与 GitHub Pages

- 状态：Accepted
- 日期：2026-07-29

## 背景

站点需要稳定、低成本地发布文章和作品，正式地址为 `https://fio-x.github.io`。GitHub Pages 适合托管静态文件，但不运行 Node.js 服务端。Next.js 必须在构建期把页面生成到可发布目录。

## 决策

使用 Next.js 静态导出：

```ts
// next.config.ts
output: "export"
```

每次构建生成 `out/`，由 GitHub Actions 上传为 Pages artifact，再由 GitHub Pages 托管。页面、动态路由参数、RSS、Sitemap 和 robots 文件都在构建期生成。

## 理由

- 与 GitHub Pages 的静态托管模型匹配。
- 不需要线上 Node.js 进程、数据库或运行时 API。
- 构建结果是可检查的 HTML、CSS、JavaScript、图片和 XML/TXT 文件。
- 通过 GitHub Actions 保持安装、校验、构建和部署步骤一致。

## 后果

### 正面

- 线上运行面小，维护成本和攻击面较低。
- 页面可以通过 CDN/静态托管直接响应。
- 文章变更可以通过提交历史和构建产物审阅。

### 约束

- 动态路由必须提供 `generateStaticParams()`。
- 依赖 Request、Cookies、Server Actions、ISR、Proxy 或默认图片优化器的能力不能作为线上运行时能力使用。
- 新内容不会即时出现，必须重新构建并发布。
- `out/` 是构建产物，不是内容源，不应手工提交或作为标准发布输入。

## 备选方案

- 使用 Next.js Node.js 服务端部署：能力更完整，但不再适配 GitHub Pages，并需要服务器或托管运行时。
- 使用纯静态生成器：可进一步减少运行时依赖，但会放弃当前 Next.js 组件和路由生态，迁移成本较高。
- 使用外部图片优化服务：可获得构建/交付优化，但增加第三方服务依赖；当前先使用 `public/media/` 直接托管。

## 相关文档

- [系统上下文图](../architecture/system-context.md)
- [构建与部署图](../architecture/build-deployment.md)
- [发布操作手册](../runbooks/release.md)
- [Next.js 静态导出配置](../../next.config.ts)
