# 项目文档

本目录记录 Fio Blog 的系统边界、架构决策和生产发布流程。项目是一个**文件型内容源驱动的静态站点生成系统**：作者在本地编辑 Markdown，构建期由 Next.js 生成静态文件，GitHub Pages 只托管生成结果。

## 从哪里开始

- 要理解系统边界： [系统上下文图](architecture/system-context.md)
- 要理解 CLI、内容层和 Web 展示层的区别： [容器图](architecture/containers.md)
- 要理解 CI 如何发布： [构建与部署图](architecture/build-deployment.md)
- 要理解一篇文章如何变成页面： [内容流水线图](architecture/content-pipeline.md)
- 要写作、预览、发布或回滚： [发布操作手册](runbooks/release.md)
- 要评审下一版视觉与内容模型： [站点设计原型 v1](prototypes/site-design-v1.html)

## 设计研究与原型

- [川内伦子网站：设计研究基线](design/rinko-kawauchi-reference.md)：记录内页栏目、档案模板、响应式与素材授权边界。
- [上田义彦网站：设计研究基线](design/yoshihiko-ueda-reference.md)：记录首页身份入口、窄阅读列与长信息页节奏。
- [站点设计原型 v1](prototypes/site-design-v1.html)：仅用于结构和交互评审，不是公开生产内容。

## 架构决策记录

- [ADR-0001：CLI-first 文件型内容源](adr/0001-cli-first-file-content.md)
- [ADR-0002：Next.js 静态导出与 GitHub Pages](adr/0002-static-export-github-pages.md)
- [ADR-0003：构建质量门](adr/0003-build-validation-gates.md)

## 关键边界

```text
作者端 / CI 构建时：CLI、Markdown、lib/content.ts、Next.js、测试
线上运行时：GitHub Pages 提供 out/ 中的 HTML、CSS、JavaScript、图片和 XML
读者端：浏览器通过 HTTPS 读取静态文件
```

GitHub Pages 不运行 Bun、Next.js 服务端、数据库或内容管理后台。完整命令和内容约定见根目录 [README.md](../README.md)。
