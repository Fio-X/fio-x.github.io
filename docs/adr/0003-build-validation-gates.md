# ADR-0003：构建质量门

- 状态：Accepted
- 日期：2026-07-29

## 背景

静态站点的错误通常在构建时才会暴露：frontmatter 错误、缺失媒体、动态参数不完整、TypeScript 错误或 lint 问题都可能导致线上页面不完整。内容发布必须有一个可复制的本地预检，也必须由 CI 在 `main` 分支上再次执行。

## 决策

生产发布必须依次通过：

1. 内容校验：`bun run blog -- validate`
2. 测试：`bun run test`
3. lint：`bun run lint`
4. 静态构建：`bun run build`

本地 `bun run blog -- build` 以相同顺序执行这些质量门。`.github/workflows/deploy.yml` 是 CI 发布顺序的权威来源；任何质量门失败都阻止 Pages artifact 上传和 deploy job。

## 理由

- 内容错误尽早、以文件路径为单位反馈。
- 单元测试保护内容层规则。
- lint 和 TypeScript 检查代码一致性。
- 只有能生成完整 `out/` 的版本才进入线上发布。
- 本地和 CI 使用相同命令，减少“本地通过、CI 失败”的差异。

## 后果

### 正面

- `main` 分支具有生产发布语义。
- 构建失败不会替换 GitHub Pages 上的上一版站点。
- 发布前可以在本地完成大部分验证。

### 代价

- 内容发布需要等待完整构建。
- 任何故意引入的临时无效 fixture 都必须隔离在测试临时目录，不得放入公开内容目录。
- CI workflow、CLI 质量门或内容模型变更时，必须同步检查架构图、ADR 和发布手册。

## 备选方案

- 只在本地校验：无法保证所有提交都经过相同检查。
- 只在 CI 校验：反馈慢，作者本地无法快速修复。
- 允许构建失败仍部署：可能发布不完整或破损的静态产物，不接受。

## 相关文档

- [构建与部署图](../architecture/build-deployment.md)
- [内容流水线图](../architecture/content-pipeline.md)
- [发布操作手册](../runbooks/release.md)
- [CI workflow](../../.github/workflows/deploy.yml)
